// Prints each step of a request to the terminal.
// Turn it off with TRACE=0, e.g. `TRACE=0 npm start`.

const enabled = process.env.TRACE !== "0";
const color = { app: "\x1b[36m", users: "\x1b[32m", ok: "\x1b[32m", err: "\x1b[31m", dim: "\x1b[2m", reset: "\x1b[0m" };
let step = 0;

export function startTrace(method, path) {
  if (!enabled) return;
  step = 0;
  console.log(`\n${color.dim}────────────────────────────────────────${color.reset}`);
  console.log(`→ ${method} ${path}`);
}

export function trace(file, message) {
  if (!enabled) return;
  step += 1;
  const c = file === "users.js" ? color.users : color.app;
  console.log(`  ${step}. ${c}[${file}]${color.reset} ${message}`);
}

export function endTrace(status) {
  if (!enabled) return;
  const c = status < 400 ? color.ok : color.err;
  console.log(`← ${c}${status}${color.reset}`);
}
