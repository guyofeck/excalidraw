# AGENTS.md

Notes for working on this repo in the Base44 sandbox. The root `CLAUDE.md` covers
project structure and the usual commands; this file only records what is specific
to running it here.

## Running the app

- `docker compose -f docker-compose.base44.yml up -d` — one `web` service
  (`node:22`, plain image) bind-mounts the repo at `/app` and runs the app's own
  Vite dev server from source, so edits hot-reload. The repo `Dockerfile` is NOT
  used: it bakes a production build into nginx and would freeze the code.
- The dev server listens on host port 3000. `.env.development` sets
  `VITE_APP_PORT=3001`, so compose overrides it with `VITE_APP_PORT=3000` (Vite's
  `loadEnv` lets real env vars win over the `.env` files) and starts Vite with
  `--host 0.0.0.0`.
- First boot runs `yarn install --frozen-lockfile` from the repo root (Yarn 1
  workspaces); it takes a couple of minutes, the healthcheck's `start_period` is
  sized for that. `vite-plugin-checker` runs ESLint + `tsc` in watch mode, so
  type/lint status shows up in `docker compose ... logs web`.
- No external services or secrets are needed to render the editor. Collaboration,
  the Excalidraw+ backend and the AI backend point at public dev endpoints in
  `.env.development` and are simply unavailable/offline here.

## Where things are

- App-level UI (welcome screen, main menu, sidebar) lives in `excalidraw-app/`.
  The main-page heading text is set in
  `excalidraw-app/components/AppWelcomeScreen.tsx`; the reusable shell is
  `packages/excalidraw/components/WelcomeScreen.tsx`.

## Checks

Run inside the container (the sandbox host has no Node):

```bash
docker compose -f docker-compose.base44.yml exec -T web yarn test:typecheck
docker compose -f docker-compose.base44.yml exec -T web yarn vitest run <file>
```
