# Backend project

A minimal Node.js HTTP server that uses ES modules. You can add, list and delete users from a page in your browser, and the terminal shows each step of the code that runs. There are no packages to install. It needs Node 18.11 or newer.

## Run

Start the server:

```text
npm start
```

Expected output:

```text
Backend project is ready! Open http://localhost:3000 in your browser
```

Restart the server automatically when a file changes:

```text
npm run dev
```

Stop either command with `Ctrl+C`. To use a different port, set `PORT`, for example `PORT=4000 npm start`.

## Use it in your browser

1. Run `npm run dev`.
2. Open http://localhost:3000.
3. Add a user, or delete one. The page shows the request and the response.
4. Look at your terminal. Each request prints the steps that ran:

```text
→ POST /users
  1. [app.js] matched route POST /users
  2. [app.js] readJsonBody() → received {"name":"Ali","email":"ali@example.com"}
  3. [users.js] validateUser() → passed
  4. [users.js] addUser() → created user with id 1
  5. [users.js] users.set() → saved. Map now holds 1 user(s)
  6. [app.js] sendJson() → status 201, body {"id":1,"name":"Ali","email":"ali@example.com"}
← 201
```

To turn the step log off, run `TRACE=0 npm start`.

## Test with Postman

The `postman/` folder has a collection with a request for every route. Each request has tests, and the descriptions say which code it runs.

1. Run `npm run dev`.
2. In Postman, click **Import** and choose `postman/backend-project.postman_collection.json`.
3. Open the **Backend project: users API** collection and send any request. The **Test Results** tab shows which checks passed. Your terminal shows which code ran.
4. To run everything in order, open the collection and click **Run**. Step 2 adds a user and saves its id in the `userId` variable. Steps 3 to 5 use that id to list the user, delete it, and then try to delete it again.

| # | Request | Expected |
|---|---|---|
| 1 | GET /health | 200 |
| 2 | POST /users (Ali) | 201, saves `userId` |
| 3 | GET /users | 200, includes Ali |
| 4 | DELETE /users/{{userId}} | 204 |
| 5 | DELETE /users/{{userId}} again | 404 |
| 6 | POST /users without a name | 400 |
| 7 | POST /users with a bad email | 400 |
| 8 | POST /users with invalid JSON | 400 |
| 9 | GET /nope | 404 |

The server runs on port 3000 by default. If you use a different port, change the collection's `baseUrl` variable.

You can also run the collection from the terminal, with the server already running in another terminal:

```text
npm run test:api
```

This uses Newman, Postman's command-line runner. npx downloads it the first time you run it.

## Endpoints

| Method | Path | What it does | Success |
|---|---|---|---|
| GET | `/` | Returns the browser page for managing users | 200 |
| GET | `/health` | Returns `{ "status": "ok", "uptime": … }` | 200 |
| GET | `/users` | Lists all users | 200 |
| POST | `/users` | Adds a user. Send a JSON body with `name` and `email` | 201 |
| DELETE | `/users/:id` | Deletes the user with that id | 204 |

Errors come back as JSON in the form `{ "error": "..." }`:
- **400:** invalid JSON, a missing `name`, or an invalid `email`.
- **404:** an unknown user id or an unknown path.

Users are kept in memory, so the list is empty again each time the server restarts.

## Examples

```text
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"name\":\"Ali\",\"email\":\"ali@example.com\"}"
curl http://localhost:3000/users
curl -X DELETE http://localhost:3000/users/1
```

## Files

- `app.js` is the entry point. It creates the HTTP server, serves the browser page, reads request bodies, sends each request to the right route and logs each step.
- `public/index.html` is the browser page. It adds, lists and deletes users by calling the API.
- `trace.js` prints each step of a request to the terminal. Set `TRACE=0` to turn it off.
- `users.js` is the user store. It exports `listUsers`, `addUser`, `deleteUser` and `validateUser`.
- `postman/backend-project.postman_collection.json` is the Postman collection, with tests for every route.
- `package.json` names the project, turns on ESM, sets the minimum Node version and defines the `start`, `dev` and `test:api` scripts.
- `.gitignore` tells Git to skip `node_modules/`, `.env` and log files.
- `summary.md` is the project review.
