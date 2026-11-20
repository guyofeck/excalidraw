# Base44 sandbox notes

Setup for running this repo in the Base44 sandbox: `docker compose -f docker-compose.base44.yml up -d`
(web app on host port 3000, `excalidraw-app` dev server).

Non-obvious findings:

- Yarn 1 workspaces: install once from the repo root (`yarn install --frozen-lockfile`) before the
  Vite dev server starts; the compose command does this on container start, so the first boot takes
  several minutes and `node_modules` lives in the bind-mounted checkout.
- `excalidraw-app/vite.config.mts` sets `server.open: true`, which crashes the dev server in a
  headless container (`spawn xdg-open ENOENT`). It is disabled only when `BASE44_PREVIEW_MODE === "1"`;
  with the variable unset the original behaviour is preserved. Do not pass `--open=false` — Vite 5
  ignores it.
- The dev server is started with `--host 0.0.0.0 --port 3000` on the CLI because `.env.development`
  sets `VITE_APP_PORT=3001`.
- `VITE_APP_ENABLE_ESLINT=false` in compose keeps the eslint checker from slowing every reload;
  TypeScript checking by `vite-plugin-checker` stays on.
- The app's main page heading is rendered by `excalidraw-app/components/AppWelcomeScreen.tsx`.
- Tests/typecheck run inside the container, e.g.
  `docker compose -f docker-compose.base44.yml exec -T web yarn test:typecheck`.
