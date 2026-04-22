# Consent OS — first-time extension + localhost demo (checklist)

Use this if you have **never** made or loaded a Chrome extension. No build step: Chrome reads the `extension` folder as plain files.

## What you will run

| Piece | What it is | URL / where |
|--------|------------|-------------|
| **Vite** | The Consent OS web app | `http://localhost:5173` (default) |
| **Store** | Small Node server that saves JSON for detections | `http://127.0.0.1:3847` (fixed in this demo) |
| **Extension** | Chrome “unpacked” extension in this repo’s `extension` folder | Toolbar icon and popup in Chrome |

## 1) Install and start both servers

In a terminal, from the project root (where `package.json` lives):

```bash
npm install
npm run dev:demo
```

You should see **two** processes (often labeled in the log as `app` and `store`). The store line looks like:

`[detections-server] http://127.0.0.1:3847 (data: …/data/detections.json)`

Leave this terminal open.

**Quick check:** in Chrome, open `http://127.0.0.1:3847/api/detections` — the response should be JSON with `{"detections":[]}` (or a list you already created).

**Two terminals instead:** in one, `npm run dev`; in the other, `npm run dev:store`.

## 2) Open the app

Go to `http://localhost:5173`. If you see a yellow bar saying the **local detections bridge is offline**, the store is not running or the URL in `.env` does not match the store (default base URL is in [`.env.example`](../.env.example)).

## 3) Load the extension (Developer mode, unpacked)

1. In Chrome, open `chrome://extensions`
2. Turn **Developer mode** **ON** (toggle at the top right)
3. Click **Load unpacked**
4. Choose the **`extension` folder** inside this project. That folder must contain `manifest.json` (do **not** pick the parent `consent_ai` folder unless the extension files are only there in your layout)

**Expected:** a new item named **Consent OS detector** (or the name from `extension/manifest.json`).

- If something fails, click **Details** and **Errors** on the card and read the message (common causes: wrong folder selected, or a typo in a filename).

**Pin it (recommended):** click the jigsaw (extensions) icon next to the address bar → find **Consent OS detector** → **Pin** so the popup is easy to open.

## 4) Exercise: generate a capture

1. Open a normal website that shows a **cookie** or **consent** bar (or use any page and click a small **Accept** / **Agree** that matches the extension’s heuristics).
2. Optional: open the **extension popup** (pinned icon) — you should see recent rows once the store has data. If you see a store error, the Node server is probably not running on port 3847.
3. Return to `http://localhost:5173` → **Dashboard** or **Agreements**. Within a few seconds, the app may show **new cards** (IDs like `ext-…`) merged with the **seed** demo. The app polls the store about every 2.5 seconds.

**Where the data is stored:** the server appends to `data/detections.json` (this path is in `.gitignore`).

## 5) “Reset demo” in the app

The **Reset demo** button reloads the **seed** state and then **re-applies** extension-backed rows from the current file. It does **not** delete `data/detections.json`. To wipe stored captures, stop the server and remove that file, or clear its `detections` array, then start again.

## 6) Optional: change the port or URL

- **Vite + env:** copy `.env.example` to `.env` and set `VITE_LOCAL_STORE_URL`. Restart Vite.  
- **Store server CORS:** if your Vite dev URL is not `localhost:5173` or `127.0.0.1:5173`, add the exact origin in `server/detections-server.mjs` (`ALLOWED_ORIGINS`) so the app’s `fetch` is allowed.  
- **Extension:** defaults to `http://127.0.0.1:3847`. The background and popup can read `storeUrl` from `chrome.storage.local` if you set it in code or via an extension “service worker” console experiment — for this demo, keep the same port in **server + env + extension**.

## 7) After you edit extension files

On `chrome://extensions`, use **Reload** on the **Consent OS detector** card so Chrome picks up changes to `manifest.json`, `content.js`, `background.js`, or `popup.js`.

## Privacy

This is a **local dev** path only. The JSON file and HTTP server are not hardened for the public internet. Do not use on sensitive data without a proper design review.
