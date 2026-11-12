# Backend project

A minimal Node.js app using ES modules. No packages to install.

## Run

Start the app once:

```text
npm start
```

Expected output:

```text
Backend project is ready!
```

Restart the app when `app.js` changes:

```text
npm run dev
```

Stop that command with `Ctrl+C`.

## Files

- `app.js` prints one line. It is an ES module because `package.json` sets `"type": "module"`.
- `package.json` names the project, turns on ESM, and defines the `start` and `dev` scripts.
- `.gitignore` tells Git to skip `node_modules/`, `.env`, and log files.
- `README.md` is this page.
