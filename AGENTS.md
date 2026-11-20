# Running this repo on Base44

Everything runs from the cloned source through `docker-compose.base44.yml` (one `node:24-bookworm`
service). The repo's own `Dockerfile` builds a production nginx image — do not use it for the preview,
edits would not be picked up.

## Setup quirks

- Yarn 1 workspaces: install once at the repo root (`yarn install --frozen-lockfile`); the compose
  service does this on start, so `node_modules` lives on the bind mount and survives restarts.
- `excalidraw-app/.env.development` sets `VITE_APP_PORT=3001`, but the preview must be on 3000, so
  the compose command passes `--port 3000 --strictPort` to `vite` explicitly.
- `vite.config.mts` has `server.open: true`; the compose service sets `BROWSER=none` so the dev
  server does not try to launch a browser.
- Vite here is 5.0.12, which has no host allowlist, so the preview proxy host needs no extra config.
- No environment secrets are required to boot; config comes from the committed `.env.development`.

## Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -s http://localhost:3000/ | grep '@vite/client'   # proves it is the dev server, not a build
```

Then open the home route: the welcome screen heading (`.welcome-screen-center__heading`) comes from
`excalidraw-app/components/AppWelcomeScreen.tsx`.

## Checks inside the container

```bash
docker compose -f docker-compose.base44.yml exec -T excalidraw-app ./node_modules/.bin/eslint <file>
docker compose -f docker-compose.base44.yml exec -T excalidraw-app ./node_modules/.bin/prettier --check <file>
docker compose -f docker-compose.base44.yml exec -T excalidraw-app yarn test:typecheck
```
