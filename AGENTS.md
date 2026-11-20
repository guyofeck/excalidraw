# Base44 sandbox notes

## Running locally (Base44 preview)

- `docker compose -f docker-compose.base44.yml up -d --build` starts a single `web` service:
  `node:22` with the repo bind-mounted at `/app`.
- Dependencies are installed on container startup from `yarn.lock`
  (`yarn install --frozen-lockfile`, Yarn 1 workspaces). The first boot takes a few
  minutes; `node_modules` lives in the bind mount, so later boots are fast.
- The dev server is Vite in `excalidraw-app` (`yarn --cwd excalidraw-app vite --host 0.0.0.0 --port 3000`).
  Edits hot-reload. `yarn start` alone would also run `yarn` and would not bind `0.0.0.0`.
- `packages/*` are resolved through Vite aliases to their `src`, so no package build step is needed.
- Env comes from the committed `.env.development`; no external secrets are required to boot.

## Things that surprise people

- The page's `<h1>` lives in `excalidraw-app/index.html` and is `visually-hidden`
  (screen-reader / SEO heading). The visible "EXCALIDRAW" wordmark on the canvas is
  part of `ExcalidrawLogo` (SVG), not a heading element, and the welcome-screen
  paragraph is an i18n string (`welcomeScreen.defaults.center_heading`).
- The app runs against remote collaboration/backend URLs from `.env.development`
  (`json-dev.excalidraw.com`); those features need network access and are not part
  of local boot.
