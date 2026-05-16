# Microfrontend Architecture — Ops Brain Dashboard

## Table of Contents

1. [Overview](#overview)
2. [Repository Layout](#repository-layout)
3. [How Module Federation Works](#how-module-federation-works)
4. [The Async Bootstrap Pattern](#the-async-bootstrap-pattern)
5. [Shared Dependencies (Singletons)](#shared-dependencies-singletons)
6. [The Shared Package](#the-shared-package)
7. [Exposing a Module (Remote side)](#exposing-a-module-remote-side)
8. [Consuming a Module (Host side)](#consuming-a-module-host-side)
9. [TypeScript Declarations for Remotes](#typescript-declarations-for-remotes)
10. [Translation Strategy](#translation-strategy)
11. [Navigation Between Modules](#navigation-between-modules)
12. [Auth State Across Modules](#auth-state-across-modules)
13. [RTL / LTR Direction Switching](#rtl--ltr-direction-switching)
14. [Sidebar Collapsed State Persistence](#sidebar-collapsed-state-persistence)
15. [Running the Project](#running-the-project)
16. [Adding a New Microfrontend](#adding-a-new-microfrontend)

---

## Overview

This project uses **Webpack Module Federation** to split the application into independently deployable pieces called **microfrontends (MFs)**. Each MF is a standalone React application that can run on its own port, but is also loaded at runtime by the host app.

```
┌──────────────────────────────────────────────────┐
│  Host  (port 3000)                               │
│  ┌────────────┐  ┌──────────────────────────┐   │
│  │  Sidebar   │  │  <Route /data-import>    │   │
│  │ (shared)   │  │  ┌──────────────────┐   │   │
│  └────────────┘  │  │  mf-data-export  │   │   │
│                  │  │  (port 3004)     │   │   │
│                  │  └──────────────────┘   │   │
│                  └──────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

Packages:

| Package | Port | Role |
|---|---|---|
| `@ops-brain/host` | 3000 | Shell — owns routing, auth, layout |
| `@ops-brain/mf-data-export` | 3004 | Remote — data import feature |
| `@ops-brain/shared` | — | Compile-time library (no server) |

---

## Repository Layout

```
altanfeez-aldaqiq-dashboard/
├── packages/
│   ├── host/                      # Shell application
│   │   ├── src/
│   │   │   ├── main.tsx           # Async entry (delegates to bootstrap)
│   │   │   ├── bootstrap.tsx      # Actual React entry point
│   │   │   ├── App.tsx            # Router + lazy remote imports
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── components/
│   │   │   │   └── RemoteErrorBoundary.tsx
│   │   │   ├── store/
│   │   │   │   └── useAuthStore.ts
│   │   │   ├── types/
│   │   │   │   └── remotes.d.ts   # TS type declarations for remote modules
│   │   │   └── lib/
│   │   │       ├── i18n.ts
│   │   │       └── locales/{ar,en}.json
│   │   └── webpack.config.js
│   │
│   ├── mf-data-export/            # Remote microfrontend
│   │   ├── src/
│   │   │   ├── main.tsx           # Async entry
│   │   │   ├── bootstrap.tsx      # Standalone React entry
│   │   │   ├── App.tsx            # Used only in standalone mode
│   │   │   ├── pages/
│   │   │   │   └── DataImportPage.tsx   # The exposed component
│   │   │   ├── components/
│   │   │   │   └── StrategyCard.tsx
│   │   │   └── lib/
│   │   │       ├── i18n.ts
│   │   │       ├── registerTranslations.ts
│   │   │       └── locales/{ar,en}.json
│   │   └── webpack.config.js
│   │
│   └── shared/                    # Compile-time shared library
│       ├── src/
│       │   ├── index.ts           # Public exports
│       │   └── components/
│       │       └── Sidebar.tsx
│       └── package.json
└── package.json                   # Root: pnpm workspaces
```

---

## How Module Federation Works

Module Federation is a Webpack 5 feature that lets one application load JavaScript modules from another application **at runtime** — not at build time.

### Remote declares what it exposes

`packages/mf-data-export/webpack.config.js`:
```js
new ModuleFederationPlugin({
  name: 'mfDataExport',          // Global variable name on window
  filename: 'remoteEntry.js',    // The manifest file the host fetches
  exposes: {
    './DataImportPage': './src/pages/DataImportPage',
  },
  shared: { react: { singleton: true }, ... },
})
```

When the remote dev server starts, it serves `http://localhost:3004/remoteEntry.js`. This file is a manifest that maps `'./DataImportPage'` to the actual compiled chunk.

### Host declares what it consumes

`packages/host/webpack.config.js`:
```js
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    mfDataExport: 'mfDataExport@http://localhost:3004/remoteEntry.js',
    //            ^^^^^^^^^^^^ matches the remote's `name`
  },
  shared: { react: { singleton: true }, ... },
})
```

The string `'mfDataExport@http://localhost:3004/remoteEntry.js'` tells webpack:
- Look for a global called `mfDataExport` (set by the remote's bundle)
- Load it from `http://localhost:3004/remoteEntry.js` if not already present

### What happens at runtime

```
Browser loads host (port 3000)
  │
  ├── host/main.js bootstraps the app
  │
  └── User navigates to /data-import
        │
        ├── React.lazy() triggers the import
        │
        ├── Webpack fetches http://localhost:3004/remoteEntry.js
        │
        ├── remoteEntry.js registers window.mfDataExport
        │
        └── webpack loads the DataImportPage chunk from port 3004
              and renders it inside the host's <Suspense>
```

---

## The Async Bootstrap Pattern

Both the host and every remote use a two-file entry pattern. This is **required** by Module Federation.

### Why it's needed

Without async bootstrap, webpack tries to evaluate all imports synchronously before shared modules have finished negotiating which version to use. This causes the app to crash with "Shared module is not available for eager consumption."

### How it works

**`packages/host/src/main.tsx`** — the real webpack entry:
```ts
// Just one line. Delegates everything to bootstrap asynchronously.
import('./bootstrap');
```

**`packages/host/src/bootstrap.tsx`** — the actual application:
```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";   // initialises i18next before any component renders
import App from "./App";

const root = document.getElementById("root");
createRoot(root).render(<App />);
```

The dynamic `import()` in `main.tsx` creates an async boundary. Webpack resolves all shared module versions across host and remotes before `bootstrap.tsx` executes.

The exact same pattern is in `packages/mf-data-export/src/main.tsx`:
```ts
import('./bootstrap');
```

---

## Shared Dependencies (Singletons)

React, ReactDOM, React Router, i18next, and react-i18next are all declared as **singletons** in both the host and every remote.

```js
// In BOTH webpack.config.js files
shared: {
  react:            { singleton: true, requiredVersion: deps.react },
  'react-dom':      { singleton: true, requiredVersion: deps['react-dom'] },
  'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
  i18next:          { singleton: true, requiredVersion: deps.i18next },
  'react-i18next':  { singleton: true, requiredVersion: deps['react-i18next'] },
},
```

`singleton: true` means only **one copy** of each library is loaded in the browser, regardless of how many MFs request it.

This is critical for:
- **React hooks** — two React instances would break all hooks
- **i18next** — one shared instance means the remote can add its translations and they immediately appear in the host's `useTranslation()`
- **React Router** — one `<BrowserRouter>` in the host controls all routing; remotes must NOT create their own Router

---

## The Shared Package

`@ops-brain/shared` is a **compile-time** package — it has no dev server and is not a Module Federation remote. It is resolved directly by webpack's `resolve.alias`.

### Resolution

Both `host/webpack.config.js` and `mf-data-export/webpack.config.js` have:
```js
resolve: {
  alias: {
    '@ops-brain/shared': path.resolve(__dirname, '../shared/src'),
  },
  modules: [
    path.resolve(__dirname, 'node_modules'),
    'node_modules',  // fallback so shared's imports resolve via host's node_modules
  ],
},
```

The `modules` array is why shared components can use `react-i18next` without it being in the shared package's own `node_modules`.

### What it exports

`packages/shared/src/index.ts`:
```ts
export { default as Sidebar } from './components/Sidebar';
export type { SidebarProps, NavItemId } from './components/Sidebar';
```

### Consuming it

```tsx
// packages/host/src/pages/Dashboard.tsx
import { Sidebar, NavItemId } from '@ops-brain/shared';
```

At build time, webpack replaces `'@ops-brain/shared'` with the actual path `../shared/src/index.ts`. No publishing, no build step needed.

### ts-loader configuration

Because `transpileOnly: true` is used, TypeScript type errors from shared are skipped during compilation. This avoids the `react/jsx-runtime` not found error that occurs when the host's ts-loader tries to type-check the shared package (which has its own tsconfig).

```js
// host/webpack.config.js
{
  loader: 'ts-loader',
  options: {
    transpileOnly: true,
    configFile: path.resolve(__dirname, 'tsconfig.json'),
  },
}
```

---

## Exposing a Module (Remote side)

To expose a component from a remote, it must:
1. Be listed in `exposes` in `webpack.config.js`
2. Import its translations at module level (not inside a hook)
3. Accept navigation callbacks as props (never create its own Router)

### Example: DataImportPage

`packages/mf-data-export/webpack.config.js`:
```js
exposes: {
  './DataImportPage': './src/pages/DataImportPage',
},
```

`packages/mf-data-export/src/pages/DataImportPage.tsx`:
```tsx
import '../lib/registerTranslations';  // ← module-level, runs before first render

export interface DataImportPageProps {
  onNavigate?: (id: NavItemId) => void;  // host controls routing
}

export default function DataImportPage({ onNavigate }: DataImportPageProps) {
  const { t } = useTranslation();  // works because i18next is a singleton
  // ...
}
```

---

## Consuming a Module (Host side)

The host uses `React.lazy` + `Suspense` to load remotes on demand.

`packages/host/src/App.tsx`:
```tsx
// Webpack sees 'mfDataExport/DataImportPage' and knows to fetch from port 3004
const RemoteDataImportPage = lazy(() => import('mfDataExport/DataImportPage'));

function DataImportRoute() {
  const navigate = useNavigate();

  // Host owns navigation — passes a callback down to the remote
  const handleNavigate = (id: NavItemId) => {
    switch (id) {
      case 'dashboard':   navigate('/dashboard'); break;
      case 'data-import': break;  // already here
    }
  };

  return (
    <RemoteErrorBoundary moduleName="mf-data-export (port 3004)">
      <Suspense fallback={<Spinner />}>
        <RemoteDataImportPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
```

### RemoteErrorBoundary

`packages/host/src/components/RemoteErrorBoundary.tsx` catches the case where `remoteEntry.js` cannot be fetched (e.g., the remote dev server isn't running) and renders a readable error instead of crashing the whole host app.

---

## TypeScript Declarations for Remotes

Webpack resolves `'mfDataExport/DataImportPage'` at runtime, but TypeScript doesn't know about it at compile time. A `declare module` block teaches the TypeScript compiler the shape of the remote.

`packages/host/src/types/remotes.d.ts`:
```ts
declare module 'mfDataExport/DataImportPage' {
  import { NavItemId } from '@ops-brain/shared';

  export interface DataImportPageProps {
    onNavigate?: (id: NavItemId) => void;
  }

  const DataImportPage: React.FC<DataImportPageProps>;
  export default DataImportPage;
}
```

One declaration block per exposed module, per remote.

---

## Translation Strategy

Both the host and each remote use the **same i18next singleton** (guaranteed by the `singleton: true` shared config). The host initialises i18next first; remotes register their own keys on top.

### Host initialises i18next

`packages/host/src/lib/i18n.ts` (imported in `bootstrap.tsx` before `<App>`):
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: 'ar',
  fallbackLng: 'en',
});
```

### Remote registers its own keys

`packages/mf-data-export/src/lib/registerTranslations.ts`:
```ts
import i18n from 'i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

// Guard: only register if the key doesn't already exist
if (!i18n.exists('dataImport.pageTitle')) {
  i18n.addResourceBundle('ar', 'translation', ar, true, false);
  i18n.addResourceBundle('en', 'translation', en, true, false);
}
```

This file is imported at the **top of DataImportPage.tsx** — not inside a React hook or `useEffect`. This means translations are registered synchronously when the module is first loaded, so the very first render has the correct strings.

```ts
// packages/mf-data-export/src/pages/DataImportPage.tsx
import '../lib/registerTranslations';  // ← top of file, before any component code
```

### Key namespacing

To avoid collision between host and remote keys, each remote owns a namespace prefix:

```
host keys:         dashboard.*, login.*, sidebar.*
mf-data-export:    dataImport.*
```

---

## Navigation Between Modules

Remotes must **never** control routing directly. They receive an `onNavigate` callback from the host and call it when the user clicks a sidebar item or navigates away.

### In the remote (DataImportPage)

```tsx
// packages/mf-data-export/src/pages/DataImportPage.tsx
export default function DataImportPage({ onNavigate }: DataImportPageProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem="data-import" onNavigate={onNavigate} />
      {/* page content */}
    </div>
  );
}
```

### In the host (App.tsx)

```tsx
const handleNavigate = (id: NavItemId) => {
  switch (id) {
    case 'dashboard':   navigate('/dashboard'); break;
    case 'data-import': break;
    default: break;
  }
};

<RemoteDataImportPage onNavigate={handleNavigate} />
```

The Sidebar in `@ops-brain/shared` fires `onNavigate?.(item.id)` when a nav item is clicked:
```tsx
// packages/shared/src/components/Sidebar.tsx
<button onClick={() => onNavigate?.(item.id)}>
```

This keeps the host as the single source of truth for the URL.

---

## Auth State Across Modules

Auth state lives in the host and is shared via the i18next singleton boundary — or more precisely, because `react-router-dom` is a singleton the host's `<BrowserRouter>` wraps everything and the host's `PrivateRoute` guards all protected routes before any remote code even loads.

`packages/host/src/App.tsx`:
```tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

<Route path="/data-import" element={
  <PrivateRoute>
    <DataImportRoute />  {/* remote is only rendered if authenticated */}
  </PrivateRoute>
} />
```

The remote itself has no knowledge of auth. If the user is not authenticated, they never reach the remote component.

`packages/host/src/store/useAuthStore.ts` — lightweight module-level state (no Zustand/Redux):
```ts
let state = { isAuthenticated: false, email: '' };
const listeners = new Set<() => void>();

export function login(email: string) {
  state = { isAuthenticated: true, email };
  listeners.forEach(fn => fn());
}

export function useAuthStore() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    listeners.add(forceUpdate);
    return () => { listeners.delete(forceUpdate); };
  }, []);
  return state;
}
```

---

## RTL / LTR Direction Switching

The language switcher in the Sidebar updates three things simultaneously:

```ts
// packages/shared/src/components/Sidebar.tsx
const switchLanguage = (lang: 'ar' | 'en') => {
  i18n.changeLanguage(lang);                               // 1. i18next locale
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; // 2. HTML dir
  document.documentElement.lang = lang;                    // 3. HTML lang
};
```

Each page's root `<div>` also sets `dir` dynamically so the flex layout flips the sidebar to the correct side:

```tsx
// packages/host/src/pages/Dashboard.tsx
const isRtl = i18n.language === 'ar';
<div className="flex min-h-screen bg-[#F0F2F5]" dir={isRtl ? 'rtl' : 'ltr'}>
  <Sidebar ... />   {/* In RTL flex, first child appears on the right */}
  <main>...</main>
</div>
```

The Sidebar's collapse arrow also flips using this logic:
```ts
// Rotate 180° when (RTL + expanded) OR (LTR + collapsed)
const arrowRotated = isRtl !== collapsed;
```

---

## Sidebar Collapsed State Persistence

The sidebar collapsed state is persisted to `localStorage` so it survives page navigation (which re-mounts the Sidebar component).

```ts
// packages/shared/src/components/Sidebar.tsx
const COLLAPSED_KEY = 'sidebar:collapsed';

const [collapsed, setCollapsed] = useState(
  () => localStorage.getItem(COLLAPSED_KEY) === 'true'  // lazy initialiser
);

const toggleCollapsed = () => {
  setCollapsed((prev) => {
    const next = !prev;
    localStorage.setItem(COLLAPSED_KEY, String(next));
    return next;
  });
};
```

The lazy `useState` initialiser runs once on mount and reads from storage, so the sidebar never flickers open then closed.

---

## Running the Project

Both servers must run simultaneously. The host fetches `remoteEntry.js` from the remote at runtime — if the remote is down, the host falls back to `<RemoteErrorBoundary>`.

```bash
# Terminal 1 — remote
cd packages/mf-data-export
npm run dev          # starts on port 3004

# Terminal 2 — host
cd packages/host
npm run dev          # starts on port 3000
```

Or from the root (requires pnpm workspaces):
```bash
pnpm dev             # runs all packages in parallel
```

Open `http://localhost:3000`. The remote at `http://localhost:3004` serves only its `remoteEntry.js` and chunks — you don't browse to port 3004 directly.

---

## Adding a New Microfrontend

Follow these steps to add, for example, `mf-reports` on port 3005.

### 1. Create the package

```
packages/mf-reports/
├── src/
│   ├── main.tsx                  # import('./bootstrap')
│   ├── bootstrap.tsx             # ReactDOM.createRoot(...)
│   ├── pages/
│   │   └── ReportsPage.tsx       # The exposed component
│   └── lib/
│       ├── registerTranslations.ts
│       └── locales/{ar,en}.json
├── webpack.config.js
└── package.json
```

### 2. Configure its webpack (remote side)

```js
// packages/mf-reports/webpack.config.js
new ModuleFederationPlugin({
  name: 'mfReports',
  filename: 'remoteEntry.js',
  exposes: {
    './ReportsPage': './src/pages/ReportsPage',
  },
  shared: {
    react:              { singleton: true, requiredVersion: deps.react },
    'react-dom':        { singleton: true, requiredVersion: deps['react-dom'] },
    'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
    i18next:            { singleton: true, requiredVersion: deps.i18next },
    'react-i18next':    { singleton: true, requiredVersion: deps['react-i18next'] },
  },
}),
// devServer: { port: 3005, headers: { 'Access-Control-Allow-Origin': '*' } }
```

### 3. Register it in the host

```js
// packages/host/webpack.config.js
remotes: {
  mfDataExport: 'mfDataExport@http://localhost:3004/remoteEntry.js',
  mfReports:    'mfReports@http://localhost:3005/remoteEntry.js',  // ← add
},
```

### 4. Add a type declaration

```ts
// packages/host/src/types/remotes.d.ts
declare module 'mfReports/ReportsPage' {
  export interface ReportsPageProps {
    onNavigate?: (id: NavItemId) => void;
  }
  const ReportsPage: React.FC<ReportsPageProps>;
  export default ReportsPage;
}
```

### 5. Add the route in the host

```tsx
// packages/host/src/App.tsx
const RemoteReportsPage = lazy(() => import('mfReports/ReportsPage'));

<Route path="/reports" element={
  <PrivateRoute>
    <RemoteErrorBoundary moduleName="mf-reports (port 3005)">
      <Suspense fallback={<Spinner />}>
        <RemoteReportsPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  </PrivateRoute>
} />
```

### 6. Wire up navigation in the Sidebar

`NavItemId` in `packages/shared/src/components/Sidebar.tsx` already includes `'reports'`. Add the case to each page's `handleNavigate`:

```ts
case 'reports': navigate('/reports'); break;
```

### 7. Register translations

`packages/mf-reports/src/lib/registerTranslations.ts`:
```ts
import i18n from 'i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

if (!i18n.exists('reports.pageTitle')) {
  i18n.addResourceBundle('ar', 'translation', ar, true, false);
  i18n.addResourceBundle('en', 'translation', en, true, false);
}
```

Import it at the top of `ReportsPage.tsx`:
```ts
import '../lib/registerTranslations';
```

Use the prefix `reports.*` for all translation keys to avoid conflicts with the host or other remotes.
