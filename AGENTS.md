# Base44 dev environment notes

- The app is the Vite dev server from `excalidraw-app/` (`yarn --cwd excalidraw-app vite`), served on host port 3000 by `docker-compose.base44.yml`. It reads source through the `@excalidraw/*` path aliases, so no package build step is needed for edits.
- `yarn install --frozen-lockfile` runs at container start (root workspace install) into the `node_modules` named volume; the first boot takes a few minutes.
- `.env.development` sets `VITE_APP_PORT=3001`, so the compose command passes `--port 3000 --strictPort` explicitly.
- `excalidraw-app/vite.config.mts` sets `server.open: true`; the container has no browser, so compose sets `BROWSER=none` (vite then skips opening one instead of crashing on `xdg-open`).
- The main page welcome heading for guests comes from `excalidraw-app/components/AppWelcomeScreen.tsx` + `packages/excalidraw/locales/en.json` (`welcomeScreen.app.center_heading`), not the library default `welcomeScreen.defaults.center_heading`.
- Verify: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` returns 200 and the HTML includes `/@vite/client` (dev server, not a prebuilt bundle).
