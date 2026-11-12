# Project review summary: backend-project

Updated on 12 November 2026 and tested with Node v22.23.4.

The review had three stages: **Understand → Evaluate → Improve**. After it, the project was extended with a **user API** that can add, list and delete users.

---

## 1. Understand

### Project structure (current)

```text
backend-project/
├── app.js         entry point: HTTP server, routing, browser page
├── users.js       in-memory user store and validation
├── trace.js       prints each step of a request to the terminal
├── public/
│   └── index.html browser page to add, list and delete users
├── postman/
│   └── backend-project.postman_collection.json   9 requests, 20 tests
├── package.json   project config, Node version, scripts
├── .gitignore     files Git should skip
├── README.md      how to run it and the endpoint reference
└── summary.md     this review
```

There are no dependencies. Everything uses Node's built-in modules.

### Entry point: `app.js`

The `start` and `dev` scripts both run `app.js`. It now:

1. Imports `createServer` from `node:http` and the user functions from `./users.js`.
2. Reads the port from `PORT`, or uses 3000 if it isn't set.
3. Defines two helpers:
   - `sendJson(res, status, data)` writes a JSON response.
   - `readJsonBody(req)` collects the request body, parses it as JSON, and rejects bodies over 1 MB or invalid JSON.
4. Sends each request to a route based on its method and path:

| Method | Path | Handler | Success |
|---|---|---|---|
| GET | `/` | Serves `public/index.html` (the browser page) | 200 |
| GET | `/health` | `{ status, uptime }` | 200 |
| GET | `/users` | `listUsers()` | 200 |
| POST | `/users` | `validateUser()`, then `addUser()` | 201 + new user |
| DELETE | `/users/:id` | `deleteUser(id)` | 204, or 404 if the id doesn't exist |
| any other | — | `{ error: "Not found" }` | 404 |

5. Calls `trace()` at each step so the terminal shows which code ran (see section 4).
6. Starts listening and logs `Backend project is ready! Open http://localhost:<PORT> in your browser`.

### Module: `users.js`

| Export | Purpose |
|---|---|
| `listUsers()` | Returns every user as an array |
| `addUser({ name, email })` | Gives the user the next id, trims the fields, saves and returns the user |
| `deleteUser(id)` | Returns `true` if a user was removed, `false` otherwise |
| `validateUser(body)` | Returns an error message, or `null` if the body is valid |

Users are stored in a `Map`, so the data is lost when the server restarts. Ids start at 1 and go up by one. Ids aren't reused after a user is deleted.

Validation rules:
- The body must be a JSON object, not an array or null.
- `name` must be a string that isn't empty.
- `email` must look like `something@domain.tld`.

---

## 2. Evaluate

### package.json

| Field | Value | Assessment |
|---|---|---|
| `name` / `version` | `backend-project` / `1.0.0` | Fine |
| `private` | `true` | Good: it can't be published to npm by accident |
| `type` | `"module"` | ESM is now used for real (`import` / `export`) |
| `engines.node` | `>=18.11` | **Added.** Needed for `node --watch` |
| `scripts.start` | `node app.js` | Starts the server |
| `scripts.dev` | `node --watch app.js` | Restarts when files change, including `users.js` |
| `scripts.test:api` | `npx --yes newman run postman/...` | **Added.** Runs the Postman collection from the terminal |

### .gitignore

| Entry | Purpose |
|---|---|
| `node_modules/` | Installed dependencies |
| `.env` | Local settings such as `PORT` |
| `*.log` | Log files |

No changes were needed.

### Test results

The server was started with `PORT=3100 npm start` and tested with `curl`:

| # | Request | Response | Status |
|---|---|---|---|
| 1 | `GET /users` (empty) | `[]` | 200 ✅ |
| 2 | `POST /users` Ali | `{"id":1,"name":"Ali","email":"ali@example.com"}` | 201 ✅ |
| 3 | `POST /users` Sara | `{"id":2,...}` | 201 ✅ |
| 4 | `GET /users` | Both users | 200 ✅ |
| 5 | `DELETE /users/1` | (empty) | 204 ✅ |
| 6 | `DELETE /users/1` again | `{"error":"User not found"}` | 404 ✅ |
| 7 | `GET /users` | Sara only | 200 ✅ |
| 8 | `POST` without `name` | `{"error":"'name' is required"}` | 400 ✅ |
| 9 | `POST` with a bad email | `{"error":"'email' must be a valid email address"}` | 400 ✅ |
| 10 | `POST` with invalid JSON | `{"error":"Invalid JSON"}` | 400 ✅ |
| 11 | `POST` with an array body | `{"error":"Body must be a JSON object"}` | 400 ✅ |
| 12 | `GET /health` | `{"status":"ok","uptime":…}` | 200 ✅ |
| 13 | `GET /` | The HTML page (after the browser-page update) | 200 ✅ |
| 14 | `GET /nope` | `{"error":"Not found"}` | 404 ✅ |

All 14 checks passed.

---

## 3. Improve

### Done

| Change | Why |
|---|---|
| Added `engines: { node: ">=18.11" }` | Without it, `npm run dev` fails on older Node versions and nothing explains why |
| Turned `app.js` into an HTTP server with `/` and `/health` | The project is called a backend, so it should serve requests |
| Added user add, list and delete (`users.js` plus routes) | The new feature you asked for |
| Moved user logic into its own module | Keeps the entry point focused on routing and uses ESM imports |
| Rewrote `README.md` | Documents the endpoints, examples and files |

| Added a browser page (`public/index.html`) | You can add and delete users without `curl` |
| Added a step log (`trace.js`) | The terminal shows exactly which code ran for each request |
| Added a Postman collection and `npm run test:api` | Repeatable API tests you can run in Postman or the terminal |

### Possible next steps

1. **Save users to disk** (for example a `users.json` file) so they survive restarts.
2. **Add `GET /users/:id` and `PUT /users/:id`** to fetch and update a single user.
3. **Reject duplicate emails** with a 409 Conflict response.
4. **Add tests** with the built-in `node:test` module and a `"test": "node --test"` script.
5. **Shut down cleanly** on `SIGINT` and `SIGTERM`.

---

## 4. Seeing it work on your computer

```text
npm run dev
```

Open http://localhost:3000, then add or delete users. The page shows each request and response, and the terminal shows the code path. This is real output from adding a user, sending an empty name, and deleting the same user twice:

```text
→ POST /users
  1. [app.js] matched route POST /users
  2. [app.js] readJsonBody() → received {"name":"Ali","email":"ali@example.com"}
  3. [users.js] validateUser() → passed
  4. [users.js] addUser() → created user with id 1
  5. [users.js] users.set() → saved. Map now holds 1 user(s)
  6. [app.js] sendJson() → status 201, body {"id":1,"name":"Ali","email":"ali@example.com"}
← 201

→ POST /users
  1. [app.js] matched route POST /users
  2. [app.js] readJsonBody() → received {"name":"","email":"x@y.com"}
  3. [users.js] validateUser() → failed: 'name' is required
  4. [app.js] sendJson() → status 400, body {"error":"'name' is required"}
← 400

→ DELETE /users/1
  1. [app.js] matched route DELETE /users/:id with id 1
  2. [users.js] deleteUser(1) → found and removed
  3. [app.js] sending 204 No Content
← 204

→ DELETE /users/1
  1. [app.js] matched route DELETE /users/:id with id 1
  2. [users.js] deleteUser(1) → no user with that id
  3. [app.js] sendJson() → status 404, body {"error":"User not found"}
← 404
```

To turn the step log off, run `TRACE=0 npm start`.

---

## 5. Tracking with Postman

`postman/backend-project.postman_collection.json` is a second way to watch the server. Import it into Postman with **Import**, then send a request or click **Run** to run the whole collection.

How it works:
- `baseUrl` is set to `http://localhost:3000`.
- Request 2 (Add user) saves the new id into the `userId` variable with `pm.collectionVariables.set`. Requests 3 to 5 use it.
- Every request has `pm.test` checks for the status code and the response body.
- Each request's description says which functions in `app.js` and `users.js` it runs. Your terminal's step log shows the same path.

Results from running the collection with Newman against the server:

```text
→ 1. Health check                     GET    /health    200  ✓ ✓ ✓
→ 2. Add user                         POST   /users     201  ✓ ✓   (saved userId = 1)
→ 3. List users                       GET    /users     200  ✓ ✓ ✓
→ 4. Delete user                      DELETE /users/1   204  ✓ ✓
→ 5. Delete same user again (404)     DELETE /users/1   404  ✓ ✓
→ 6. Add user without name (400)      POST   /users     400  ✓ ✓
→ 7. Add user with bad email (400)    POST   /users     400  ✓ ✓
→ 8. Add user with invalid JSON (400) POST   /users     400  ✓ ✓
→ 9. Unknown route (404)              GET    /nope      404  ✓ ✓

requests 9 · failed 0 · assertions 20 · failed 0
```

The same run can happen from the terminal with `npm run test:api`.

---

## Status

| Check | Result |
|---|---|
| Uses ESM (`"type": "module"`) | ✅ (with real `import` / `export`) |
| Has `app.js` and `package.json` | ✅ |
| Has `start` and `dev` scripts | ✅ |
| Prints a message when run | ✅ |
| Has a `.gitignore` | ✅ |
| Node version declared | ✅ |
| Add and delete users | ✅ |
| Browser page and step log | ✅ |
| Postman collection (20 tests passing) | ✅ |
