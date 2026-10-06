# Base44 dev environment notes

- Run: `docker compose -f docker-compose.base44.yml up -d`. Single `web` service (node:22) runs the Vite dev server for `excalidraw-app` on port 3000 from the bind-mounted source.
- First boot runs `yarn install` (~80s) into the `node_modules` volume; `--ignore-scripts` skips the husky `prepare` hook (no git hooks needed in the container).
- Workspace packages (`packages/*`) are resolved from source via Vite aliases — no `build:packages` step is needed for the app.
- `.env.development` sets `VITE_APP_PORT=3001`; compose overrides it to 3000 and disables the ESLint checker (`VITE_APP_ENABLE_ESLINT=false`) to save CPU. TypeScript checker still runs.
- No secrets required: the app is client-only; collab/AI/backends point at public excalidraw endpoints (collab WS at localhost:3002 won't work here).
- Vite 5.0 has no host check, so no allowedHosts config is needed.
- Tests: `docker compose -f docker-compose.base44.yml exec web yarn test:app --watch=false`.
