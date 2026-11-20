# Sandbox notes

- Run the app with `docker compose -f docker-compose.base44.yml up -d --build` (single `web` service).
- The container uses the plain `node:24` image, which already bundles yarn 1.22.22 — do not `npm i -g yarn` (it fails with EEXIST). The compose command runs `yarn install --frozen-lockfile` at the workspace root, then starts Vite from `excalidraw-app` on port 3000 (host port 3000).
- First boot takes a few minutes for the workspace install; the Vite dev server serves the live source afterwards (HMR works through the bind mount).
- The empty-canvas main page heading is rendered by `excalidraw-app/components/AppWelcomeScreen.tsx` using the `welcomeScreen.app.center_heading*` strings in `packages/excalidraw/locales/en.json`.
- Verify a page loads with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`.
