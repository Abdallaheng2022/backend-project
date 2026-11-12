import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { listUsers, addUser, deleteUser, validateUser } from "./users.js";
import { startTrace, trace, endTrace } from "./trace.js";

const PORT = process.env.PORT ?? 3000;
const MAX_BODY_BYTES = 1_000_000;
const PAGE_PATH = new URL("./public/index.html", import.meta.url);

function sendJson(res, status, data) {
  trace("app.js", `sendJson() → status ${status}, body ${JSON.stringify(data)}`);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
  endTrace(status);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      trace("app.js", `readJsonBody() → received ${body}`);
      try {
        resolve(JSON.parse(body));
      } catch {
        trace("app.js", "readJsonBody() → JSON.parse failed");
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && pathname === "/") {
    const page = await readFile(PAGE_PATH);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(page);
  }

  if (pathname === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  startTrace(req.method, pathname);

  if (req.method === "GET" && pathname === "/health") {
    trace("app.js", "matched route GET /health");
    return sendJson(res, 200, { status: "ok", uptime: process.uptime() });
  }

  if (req.method === "GET" && pathname === "/users") {
    trace("app.js", "matched route GET /users");
    return sendJson(res, 200, listUsers());
  }

  if (req.method === "POST" && pathname === "/users") {
    trace("app.js", "matched route POST /users");
    let body;
    try {
      body = await readJsonBody(req);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
    const error = validateUser(body);
    if (error) return sendJson(res, 400, { error });
    return sendJson(res, 201, addUser(body));
  }

  const match = pathname.match(/^\/users\/(\d+)$/);
  if (req.method === "DELETE" && match) {
    trace("app.js", `matched route DELETE /users/:id with id ${match[1]}`);
    const deleted = deleteUser(Number(match[1]));
    if (!deleted) return sendJson(res, 404, { error: "User not found" });
    trace("app.js", "sending 204 No Content");
    res.writeHead(204);
    res.end();
    return endTrace(204);
  }

  trace("app.js", "no route matched");
  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend project is ready! Open http://localhost:${PORT} in your browser`);
});
