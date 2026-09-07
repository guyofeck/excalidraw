# Base44 dev environment

Run: `docker compose -f docker-compose.base44.yml up -d` (Vite dev server on host port 3000).

Notes:
- Yarn 1 workspaces monorepo (excalidraw-app + packages/*). `node_modules` lives in a named
  volume; workspace packages are symlinked there by `yarn install` at container start.
- The dev server MUST be started with cwd = `excalidraw-app` (`cd excalidraw-app && npx vite`).
  `yarn --cwd ./excalidraw-app exec vite` runs from the repo root, so `vite.config.mts` and its
  `@excalidraw/*` source aliases are not loaded and dep-scan fails on `@excalidraw/math`.
- No external credentials needed. Firebase/collab & Sentry env vars in `.env.development` are
  optional; the editor works fully without them.
- First boot takes a few minutes for `yarn install`.
