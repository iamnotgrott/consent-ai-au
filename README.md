# Consent OS — browser extension and local detections (demo)

This project includes a **Manifest V3** Chrome extension in [`extension/`](./extension/) and a tiny **Node server** on **127.0.0.1:3847** that saves detections to `data/detections.json` (see `.gitignore`). The Vite app polls that store and **merges** new rows into the **Dashboard** and **Agreements** tabs, alongside the built-in seed data.

You do **not** need to build the extension. Chrome loads the folder as “unpacked” source.

## Scripts

```bash
npm install
npm run dev         # Vite only (http://localhost:5173)
npm run dev:store   # local JSON store only (http://127.0.0.1:3847)
npm run dev:demo    # Vite + store (recommended for the extension)
npm run build
npm run preview
npm run lint
```

## What the extension does (MVP)

- **Cookie / consent UI:** a heuristic looks for large visible elements whose text looks like a cookie, privacy, or consent notice. It sends at most **one** capture per **origin** per **browser tab session** (session storage).
- **Clicks:** if you click a control whose visible text looks like “Accept”, “Allow all”, “I agree”, etc., it records a `consent_click` capture (debounced so repeated clicks are not all stored).

The extension does **not** provide legal analysis. It only captures short snippets to demonstrate the end-to-end flow with Consent OS.

## Prerequisites

- **Node.js** and **npm** installed
- **Google Chrome** (Chromium-based browsers that support MV3 and “Load unpacked” work too, with similar steps)

## 1. Install dependencies

From the project root (the folder that contains `package.json`):

```bash
cd /path/to/consent_ai
npm install
```

## 2. Start the app and the local store (one command)

```bash
npm run dev:demo
```

This runs **two** processes:

1. **Vite** — web UI, by default at `http://localhost:5173`
2. **Detections store** — logs: `[detections-server] http://127.0.0.1:3847`

Keep this terminal open. Press **Ctrl+C** to stop both.

**Optional (two terminals):** run `npm run dev` in one and `npm run dev:store` in the other. Same end result.

## 3. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Turn **Developer mode** **on** (top right)
3. Click **Load unpacked**
4. Select the project’s **`extension` folder** (the one that contains `manifest.json` — _not_ the whole monorepo root unless that is the only project)

You should see **Consent OS detector** in the list. If Chrome shows errors, open **Errors** and fix any path/permission issues (see Troubleshooting below).

**Pin the extension (optional but helpful):** click the jigsaw (puzzle) icon in the toolbar → find **Consent OS detector** → **Pin** so the popup is one click away.

## 4. Try the full loop

1. With `npm run dev:demo` running, open `http://localhost:5173` in Chrome.
2. In another tab, visit a site that shows a **cookie** or **consent** banner (many news and corporate sites do). If nothing appears, try clicking an obvious **Accept** or **Agree** button that matches the extension’s heuristics.
3. In **Consent OS** (local app), go to **Dashboard** or **Agreements**. After a few seconds, new **“extension”** rows (IDs starting with `ext-…`) may appear, merged on top of the seed data.
4. Open the **extension popup** (toolbar icon) — it fetches the same list from `http://127.0.0.1:3847/api/detections`.

## 5. Configuring the store URL (optional)

- **Web app:** copy [`.env.example`](./.env.example) to `.env` and set `VITE_LOCAL_STORE_URL` if you change the server host or port. Restart Vite.
- **Extension (advanced):** the background and popup default to `http://127.0.0.1:3847`. The background reads `storeUrl` from `chrome.storage.local` if you set it (not exposed in a UI in this MVP).

## “Reset demo” in the app

**Reset demo** restores **seed** services and events, then **re-merges** the current on-disk detections (from the file the server is writing) so you still see what the extension captured. It does **not** delete `data/detections.json` — to clear that, stop the server and remove the file manually (or delete its contents) if you need a clean slate.

## Troubleshooting

- **Amber “Local detections bridge offline” banner in the app**  
  - Ensure `npm run dev:store` (or `npm run dev:demo`) is running and the terminal shows the server listening on `127.0.0.1:3847`.  
  - In `.env`, `VITE_LOCAL_STORE_URL` must point at that same base URL.  
  - Try opening `http://127.0.0.1:3847/api/detections` in Chrome; you should see JSON like `{ "detections": [] }`.

- **Extension popup says the store failed**  
  - Same as above: the store process must be running.  
  - The extension’s `host_permissions` include `http://127.0.0.1/*` and `http://localhost/*` — the store uses **127.0.0.1:3847** by default. Do not change the port in one place without the others.

- **CORS / fetch errors in the *website* (not the extension)**  
  - The store allows origins `http://localhost:5173` and `http://127.0.0.1:5173` for the React app. If you use another Vite port, add that origin in [`server/detections-server.mjs`](./server/detections-server.mjs) under `ALLOWED_ORIGINS` and use the same in `.env`.

- **No new cards after browsing**  
  - Heuristics are conservative; not every page will match.  
  - Try a different site with a clear cookie bar or click a visible **Accept** on a small button.  
  - Check the **store** terminal for incoming `POST` activity (or inspect `data/detections.json` after a capture).

- **Re-loading the extension after edits**  
  - On `chrome://extensions`, click **Reload** on “Consent OS detector” after you change any file under `extension/`.

## Privacy note

The demo is meant for **local development**. Detections are written to a file under the repo and are **not** encrypted. Do not use this as-is for production or sensitive pages without a proper security and privacy review.

A shorter, checklist-style walkthrough: [docs/EXTENSION_DEMO.md](./docs/EXTENSION_DEMO.md).

## Pitch materials

- Slide copy: [pitch/deck.md](pitch/deck.md)
- Demo script: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
