# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (from root)
pnpm install

# Development - start all packages in parallel
pnpm dev

# Production build - build all packages in parallel
pnpm build

# Build only the host (used in Docker)
pnpm --filter @ops-brain/host run build

# Build Tailwind CSS
pnpm tw:build

# Watch Tailwind CSS during development
pnpm tw:watch
```

There is no test runner configured. There are no lint scripts defined.

## Architecture

This is a **pnpm monorepo** using **Webpack Module Federation**. The package scope is `@ops-brain/*`.

### Packages

- `packages/host` — Shell app, port 3000. Owns routing, auth, and layout. Bundles and serves the remotes in production.
- `packages/shared` — Shared React components, types, assets, and global styles. Consumed by host and remotes via path alias `@ops-brain/shared`.
- `packages/mf-data-export` — Remote MFE. Exposes `./DataImportPage`, `./ImportLogsPage`, `./StrategyCard`.
- `packages/mf-couriers` — Remote MFE. Exposes `./CouriersPage`, `./CouriersProfile`.
- `packages/mf-analytics`, `packages/mf-home`, `packages/mf-settings` — Stub remotes (not yet integrated).

### Module Federation Build Strategy

The host's webpack config compiles **all three configs in one run** (host + mf-data-export + mf-couriers). Remotes output into `packages/host/dist/mf-*/`. The dev server at port 3000 serves everything:

- `/` → host app
- `/mf-data-export/` → data-export remote
- `/mf-couriers/` → couriers remote
- `/api/*` → proxied to backend (`164.92.186.40`)

Shared singleton dependencies (react, react-dom, react-router-dom, i18next, react-i18next) are declared in the host's MF config. The **pnpm hoisting** (`shamefully-hoist=true`) is required for this to work — React must resolve to a single copy.

### Host App Routing (`packages/host/src/App.tsx`)

Remote components are loaded lazily via dynamic `import()` and wrapped in `RemoteErrorBoundary` + `Suspense`. Auth is enforced by `ProtectedRoute` / `GuestRoute` guards. State is managed with **Zustand** (`useUserStore`).

### Environment Variables

`packages/host/.env` defines `BASEURL`. Webpack injects it at build time via `DefinePlugin`. The Docker build passes `BASEURL` as a build arg from GitHub secrets.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds a Docker image on push to `main`, pushes to GHCR, then SSH-deploys to the production server using `docker-compose.yml` + `docker-compose.prod.yml`. The nginx config handles SPA routing and reverse proxy.
