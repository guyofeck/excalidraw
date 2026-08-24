# AGENTS.md

## Project Overview

Excalidraw — an open-source collaborative whiteboard tool built as a Vite + React monorepo using Yarn workspaces.

## Development Setup (Base44)

- **Runtime**: Node 22 in Docker, using `corepack` for Yarn 1.22
- **Dev server**: Vite in `excalidraw-app/` with hot reload, bound to `0.0.0.0:3000`
- **Env override**: `VITE_APP_DISABLE_OPEN=true` prevents the container from crashing when Vite tries to open a browser
- **ESLint disabled in dev**: `VITE_APP_ENABLE_ESLINT=false` for faster startup (enable for lint checks)

## Quirks

- The monorepo uses path aliases in `excalidraw-app/vite.config.mts` to resolve `@excalidraw/*` packages from source — no pre-build step needed for dev.
- Vite config's `open: true` crashes in headless containers (`xdg-open` not found). The env var `VITE_APP_DISABLE_OPEN` was added to control this.
- node_modules is in a named Docker volume to avoid slow bind-mount I/O and host platform conflicts.

## Verifying the App

```bash
docker compose -f docker-compose.base44.yml ps   # should show 1 container running
curl -sf http://localhost:3000/ | head -5          # should return HTML with Vite dev scripts
```

## External Services (optional, not required to boot)

- Firebase (auth/storage) — configured via `.env.development` with a public dev project
- Collaboration WebSocket — `VITE_APP_WS_SERVER_URL` (defaults to localhost:3002, not running here)
- AI backend — `VITE_APP_AI_BACKEND` (defaults to localhost:3016, not running here)

None of these are required for the core drawing experience to work.
