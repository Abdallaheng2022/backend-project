// In-memory user store. Data is lost when the server restarts.
import { trace } from "./trace.js";

const users = new Map();
let nextId = 1;

export function listUsers() {
  const list = [...users.values()];
  trace("users.js", `listUsers() → returning ${list.length} user(s)`);
  return list;
}

export function addUser({ name, email }) {
  const user = { id: nextId++, name: name.trim(), email: email.trim() };
  trace("users.js", `addUser() → created user with id ${user.id}`);
  users.set(user.id, user);
  trace("users.js", `users.set() → saved. Map now holds ${users.size} user(s)`);
  return user;
}

export function deleteUser(id) {
  const deleted = users.delete(id);
  trace("users.js", `deleteUser(${id}) → ${deleted ? "found and removed" : "no user with that id"}`);
  return deleted;
}

// Returns an error message, or null if the input is valid.
export function validateUser(body) {
  let error = null;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    error = "Body must be a JSON object";
  } else if (typeof body.name !== "string" || body.name.trim() === "") {
    error = "'name' is required";
  } else if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    error = "'email' must be a valid email address";
  }
  trace("users.js", `validateUser() → ${error ? `failed: ${error}` : "passed"}`);
  return error;
}
