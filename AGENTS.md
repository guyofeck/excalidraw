# Sandbox / Base44 setup notes

- Run the app with `docker compose -f docker-compose.base44.yml up -d`. It uses `node:22`,
  runs `yarn install --frozen-lockfile` from the repo root, then starts the Vite dev server
  from `excalidraw-app` on `0.0.0.0:3000` (host port 3000 is the preview entry point).
- Do NOT use the repo's own `docker-compose.yml` for development: it builds the production
  nginx image from `Dockerfile`, so source edits never show up.
- `excalidraw-app/vite.config.mts` hardcodes `server.open: true`. Containers have no browser
  (`xdg-open` is missing) and Vite crashes the whole process when it fails to open one, so the
  compose command puts a no-op `xdg-open` stub first on `PATH`.
- `.env.development` sets `VITE_APP_PORT=3001`; the compose command passes `--port 3000` explicitly.
- There is no backend in this repo. The app talks to the hosted dev backend
  (`json-dev.excalidraw.com`); collaboration (`localhost:3002`) and AI (`localhost:3016`)
  endpoints point at services that are not part of this sandbox, so those features don't work here.
- Dependencies are installed into the bind-mounted checkout (`node_modules` is gitignored),
  so a container restart re-runs `yarn install` (fast when already installed).

## Verify

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` returns 200, and the welcome
  screen (logo + heading + menu) renders with the toolbar visible.
- Type check inside the service: `docker compose -f docker-compose.base44.yml exec -T web yarn test:typecheck`.
- Formatting: `docker compose -f docker-compose.base44.yml exec -T web yarn test:other`.
