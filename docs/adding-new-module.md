# Adding a New Module (Micro-Frontend)

This guide walks you through creating a new micro-frontend module from scratch and wiring it into the host app. We'll use `mf-reports` as a concrete example throughout.

---

## What is a module in this project?

Each module is a small React app that lives in `packages/mf-<name>/`. It has its own pages, components, and translations. At runtime, the host app loads the module's pages on demand — the user never notices they came from a separate package.

The host compiles every module in a single webpack build. They all get served from the same port (3000). Each module can also run **standalone** on its own port for isolated development.

---

## Step 1 — Create the folder structure

Create this folder layout inside `packages/`:

```
packages/mf-reports/
├── public/
│   └── index.html          ← HTML shell for standalone mode
├── src/
│   ├── main.tsx            ← Webpack entry point (one line)
│   ├── bootstrap.tsx       ← Actual app startup
│   ├── App.tsx             ← Root component for standalone mode
│   ├── index.css           ← Tailwind + global styles
│   └── pages/
│       └── ReportsPage.tsx ← The page you want to expose
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── webpack.config.js
```

---

## Step 2 — Create `package.json`

Replace `mf-reports` and `mfReports` with your module's name. The port in `dev` should be unique — check existing modules and pick the next available one.

```json
{
  "name": "@ops-brain/mf-reports",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "i18next": "^26.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^17.0.2",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^25.6.0",
    "css-loader": "^6.10.0",
    "html-webpack-plugin": "^5.6.0",
    "postcss": "^8.4.35",
    "postcss-loader": "^8.1.0",
    "style-loader": "^3.3.4",
    "tailwindcss": "^4.2.2",
    "ts-loader": "^9.5.1",
    "typescript": "5.9.3",
    "webpack": "^5.90.1",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.2"
  }
}
```

> **Why does it repeat react/i18next even though the host has them?**
> The standalone `webpack.config.js` (for running the module on its own port) needs them. When the host compiles the module, these are replaced by the host's singleton versions.

---

## Step 3 — Create `tsconfig.json`

Copy this exactly. Update the `typeRoots` path if you're at a different nesting depth (unlikely).

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "typeRoots": [
      "../../node_modules/@types",
      "../host/node_modules/@types",
      "node_modules/@types"
    ],
    "types": ["node"],
    "paths": {
      "@ops-brain/shared": ["../shared/src"],
      "@ops-brain/shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src", "../shared/src"]
}
```

---

## Step 4 — Set up Tailwind

### `tailwind.config.js`

The `content` array tells Tailwind which files to scan for class names. Include the shared package so its components get styles too.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E75B6",
      },
    },
  },
  plugins: [],
};
```

### `postcss.config.js`

This tells PostCSS to run Tailwind. The host's webpack reads this file automatically when it processes your module's CSS.

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## Step 5 — Create `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
@import "tailwindcss";

@source "./";

@theme {
  --color-primary: #C9A84C;
  --color-primary-hover: #B8952A;
  --color-dark: #1A2332;
  --color-dark-hover: #0f1923;
  --color-brand-blue: #1D3478;
  --color-brand-blue-hover: #152660;
  --color-stat-purple: #6812D9;
  --color-stat-green: #27AE60;
  --color-stat-red: #B83705;
  --color-stat-blue: #2E75B6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}

* {
  font-family: 'Cairo', sans-serif;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
```

---

## Step 6 — Create the entry files

### `src/main.tsx`

This is the real webpack entry point. It has exactly one line.

```tsx
// Module Federation requires an async boundary here.
// Without it, shared modules (React, i18next, etc.) can't negotiate
// which version to use before the app starts, causing a crash.
import("./bootstrap");
```

### `src/bootstrap.tsx`

This is where the app actually starts. The CSS import here runs when the module starts in **standalone mode** (its own port). When the host loads the module, this file doesn't run — that's why you also import CSS inside the exposed page (see Step 7).

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
```

### `src/App.tsx`

Used only in standalone mode. Just renders your page.

```tsx
import React from "react";
import ReportsPage from "./pages/ReportsPage";

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <ReportsPage />
  </div>
);

export default App;
```

### `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MF Reports</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---

## Step 7 — Create your page component

This is the component the host will load. A few rules:

- **Import `../index.css` at the top.** The host loads this file directly (skipping `bootstrap.tsx`), so it won't get CSS unless the page imports it.
- **Accept an `onNavigate` prop.** Never use `useNavigate()` directly — the host owns routing and passes you a callback.
- **Never create a `<BrowserRouter>` here.** The host's router already wraps everything.

```tsx
// src/pages/ReportsPage.tsx
import React from "react";
import "../index.css"; // ← required: host skips bootstrap.tsx

interface ReportsPageProps {
  onNavigate?: (id: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      {/* your page content */}
    </div>
  );
};

export default ReportsPage;
```

> **Why import CSS in both `bootstrap.tsx` and the page?**
>
> When running standalone, `bootstrap.tsx` runs and imports CSS. When the host loads the module via Module Federation, only the exposed page chunk is loaded — `bootstrap.tsx` never runs. So each exposed page must bring its own CSS import.

---

## Step 8 — Create the module's own `webpack.config.js`

This config is used when you run the module standalone (`pnpm dev` inside the package). The host has its own config that compiles this module as part of the main build.

Replace `mfReports` with your module name (camelCase), the port with your chosen port, and update `exposes`.

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const deps = require("./package.json").dependencies;

module.exports = {
  entry: "./src/main.tsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "http://localhost:3006/",  // ← use your module's port
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@ops-brain/shared": path.resolve(__dirname, "../shared/src"),
    },
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, "tsconfig.json"),
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|woff2?)$/,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "mfReports",           // ← camelCase, no dashes
      filename: "remoteEntry.js",
      exposes: {
        "./ReportsPage": "./src/pages/ReportsPage",  // ← add one entry per exposed page
      },
      shared: {
        react:              { singleton: true, requiredVersion: deps.react },
        "react-dom":        { singleton: true, requiredVersion: deps["react-dom"] },
        "react-router-dom": { singleton: true, requiredVersion: deps["react-router-dom"] },
        i18next:            { singleton: true, requiredVersion: deps.i18next },
        "react-i18next":    { singleton: true, requiredVersion: deps["react-i18next"] },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],

  devServer: {
    port: 3006,   // ← your port
    historyApiFallback: true,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
};
```

---

## Step 9 — Register the module in the host's webpack

Open `packages/host/webpack.config.js` and make four changes.

### a. Add the remote path at the top of the file

Add these two lines alongside the existing `remotePath` / `remoteDeps` declarations:

```js
const remotePath3 = path.resolve(__dirname, "../mf-reports");
const remoteDeps3 = require(path.join(remotePath3, "package.json")).dependencies;
```

### b. Add a new webpack config block

Copy an existing `remoteConfig` block (e.g. `remoteConfig2`) and paste it below. Update every occurrence of the module name:

```js
const remoteConfig3 = {
  name: "mfReports",
  context: remotePath3,
  entry: path.join(remotePath3, "src/main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist/mf-reports"),
    filename: "[name].js",
    publicPath: "/mf-reports/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@ops-brain/shared": path.resolve(__dirname, "../shared/src"),
    },
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath3, "node_modules"),
    ],
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath3, "node_modules"),
      "node_modules",
    ],
  },

  module: {
    rules: [
      makeTsRule(path.join(remotePath3, "tsconfig.json")),
      cssRule,
      assetRule,
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "mfReports",
      filename: "remoteEntry.js",
      exposes: {
        "./ReportsPage": path.join(remotePath3, "src/pages/ReportsPage"),
      },
      shared: {
        react:              { singleton: true, requiredVersion: remoteDeps3.react },
        "react-dom":        { singleton: true, requiredVersion: remoteDeps3["react-dom"] },
        "react-router-dom": { singleton: true, requiredVersion: remoteDeps3["react-router-dom"] },
        i18next:            { singleton: true, requiredVersion: remoteDeps3.i18next },
        "react-i18next":    { singleton: true, requiredVersion: remoteDeps3["react-i18next"] },
      },
    }),
  ],
};
```

### c. Register it as a remote in `hostConfig`

Find the `ModuleFederationPlugin` inside `hostConfig` and add your module to `remotes`:

```js
remotes: {
  mfDataExport: "mfDataExport@/mf-data-export/remoteEntry.js",
  mfCouriers:   "mfCouriers@/mf-couriers/remoteEntry.js",
  mfReports:    "mfReports@/mf-reports/remoteEntry.js",  // ← add this
},
```

### d. Add the output clean rule

Find `output.clean.keep` in `hostConfig` and add your module's folder:

```js
output: {
  clean: {
    keep: /^(mf-data-export|mf-couriers|mf-reports)\//,  // ← add mf-reports
  },
},
```

### e. Add the dev server rewrite

Find `devServer.historyApiFallback.rewrites` and add your path before the catch-all:

```js
rewrites: [
  { from: /^\/mf-data-export\//, to: (ctx) => ctx.parsedUrl.pathname },
  { from: /^\/mf-couriers\//,    to: (ctx) => ctx.parsedUrl.pathname },
  { from: /^\/mf-reports\//,     to: (ctx) => ctx.parsedUrl.pathname },  // ← add
  { from: /./, to: "/index.html" },
],
```

### f. Export the new config

At the bottom of the file, add your new config to the exported array:

```js
module.exports = [hostConfig, remoteConfig, remoteConfig2, remoteConfig3];
```

---

## Step 10 — Add the route in the host's `App.tsx`

Open `packages/host/src/App.tsx` and make three additions:

### a. Lazy import at the top

```tsx
const RemoteReportsPage = lazy(() => import("mfReports/ReportsPage"));
```

### b. Add the navigation case to `useMfNavigate`

```tsx
case "reports":
  navigate("/reports");
  break;
```

### c. Create a route component and add the route

```tsx
function ReportsRoute() {
  const handleNavigate = useMfNavigate();
  return (
    <RemoteErrorBoundary moduleName="mf-reports">
      <Suspense fallback={RemoteFallback}>
        <RemoteReportsPage onNavigate={handleNavigate} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
```

Then add the route inside `<Routes>`:

```tsx
<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Layout logoSrc={Logo} onLogout={onLogout}>
        <ReportsRoute />
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## Step 11 — Add TypeScript declarations

TypeScript doesn't know about Module Federation imports at compile time. You need to tell it the shape of each exposed component.

Open `packages/host/src/types/remotes.d.ts` and add:

```ts
declare module "mfReports/ReportsPage" {
  export interface ReportsPageProps {
    onNavigate?: (id: string) => void;
  }
  const ReportsPage: React.FC<ReportsPageProps>;
  export default ReportsPage;
}
```

Add one `declare module` block for every page you expose from the module.

---

## Step 12 — Add to the pnpm workspace

Open the root `package.json` and add your module to `workspaces`:

```json
"workspaces": [
  "packages/host",
  "packages/mf-couriers",
  "packages/mf-data-export",
  "packages/mf-reports",
  "packages/shared"
]
```

> `pnpm-workspace.yaml` already uses `packages/*` which picks up everything automatically, but the root `package.json` workspaces field needs to be in sync.

Then install from the repo root:

```bash
pnpm install
```

---

## Step 13 — Run and verify

```bash
# From repo root — compiles host + all remotes together
pnpm dev
```

Then open `http://localhost:3000`. Navigate to your new route (e.g. `/reports`). If the page loads, the integration worked.

**If you see a white page or error boundary**, check the browser console. Common causes:

| Error | Fix |
|---|---|
| `Shared module is not available for eager consumption` | You're missing the `main.tsx → bootstrap.tsx` async pattern |
| `Cannot read properties of undefined (reading 'mfReports')` | The remote config isn't added to the webpack export array |
| Tailwind classes not working | Check that `postcss.config.js` exists and `tailwind.config.js` has the right `content` paths |
| TypeScript error on `import("mfReports/ReportsPage")` | The `declare module` block is missing from `remotes.d.ts` |

---

## Checklist

Use this before calling it done:

- [ ] `packages/mf-<name>/` folder with all files from Step 1
- [ ] `package.json` with correct `name` field (`@ops-brain/mf-<name>`)
- [ ] `tsconfig.json` with correct `typeRoots`
- [ ] `tailwind.config.js` with `content` paths
- [ ] `postcss.config.js`
- [ ] `src/index.css` with Tailwind import
- [ ] `src/main.tsx` with single `import("./bootstrap")` line
- [ ] `src/bootstrap.tsx` imports `./index.css`
- [ ] Exposed page imports `../index.css`
- [ ] Exposed page accepts `onNavigate` prop, never creates its own Router
- [ ] Module's own `webpack.config.js` with unique port and correct `name`
- [ ] Host `webpack.config.js`: remote path/deps, new config block, remote registered, clean rule, dev server rewrite, exported array
- [ ] Host `App.tsx`: lazy import, navigation case, route component, `<Route>`
- [ ] Host `remotes.d.ts`: `declare module` block for each exposed page
- [ ] Root `package.json` workspaces updated
- [ ] `pnpm install` run from root
