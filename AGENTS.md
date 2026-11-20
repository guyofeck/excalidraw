# Base44 sandbox notes

Non-obvious facts about running this repo in the Base44 preview sandbox.

## Run

- `docker compose -f docker-compose.base44.yml up -d --build` starts the Vite dev
  server from the cloned source on host port 3000 (`app` service).
- The container runs `yarn install --frozen-lockfile` on every start, so the first
  boot after a fresh checkout takes a few minutes; `node_modules` lives in the bind
  mount (gitignored).
- Yarn 1.22.22 is pinned in `.base44/Dockerfile.dev` via corepack; do not use plain
  `npm install` (the node image already ships corepack yarn shims and npm -g yarn
  fails with EEXIST).
- Vite 5.0.12 is old enough that it has no `server.allowedHosts` check, so the
  sandbox host needs no allowlist entry. Only `server.open` is gated on
  `BASE44_PREVIEW_MODE === "1"` (a container has no browser to open).

## Verify

- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`.
- The served HTML must contain `@react-refresh` / `@vite-plugin-checker-runtime`
  (dev server), not hashed `assets/*.js` (prebuilt bundle).
- The dev server logs `[TypeScript] Found 0 errors. Watching for file changes.`
  when the in-app checker finishes; the page still serves while it runs.
- Collaboration (WebSocket on `:3002`) and the Excalidraw+ backends are not part of
  this sandbox; the app loads fine without them.

## Tests / checks

- `docker compose -f docker-compose.base44.yml exec -T app yarn test:typecheck`
- `docker compose -f docker-compose.base44.yml exec -T app yarn vitest <path> --watch=false`
- ESLint in the dev overlay is disabled with `VITE_APP_ENABLE_ESLINT=false`
  (compose env) because linting the whole monorepo on every boot is slow.
