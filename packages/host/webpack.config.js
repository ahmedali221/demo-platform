const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const https = require("https");

const hostDeps = require("./package.json").dependencies;
const remotePath = path.resolve(__dirname, "../mf-data-export");
const remoteDeps = require(path.join(remotePath, "package.json")).dependencies;
const remotePath2 = path.resolve(__dirname, "../mf-couriers");
const remoteDeps2 = require(
  path.join(remotePath2, "package.json"),
).dependencies;
const remotePath3 = path.resolve(__dirname, "../mf-reports");
const remoteDeps3 = require(
  path.join(remotePath3, "package.json"),
).dependencies;
const remotePath4 = path.resolve(__dirname, "../mf-settings");
const remoteDeps4 = require(
  path.join(remotePath4, "package.json"),
).dependencies;
const webpack = require("webpack");

const dotenv = require("dotenv");

dotenv.config();
// ── Shared rule factories ─────────────────────────────────────────────────

const makeTsRule = (configFile) => ({
  test: /\.tsx?$/,
  use: { loader: "ts-loader", options: { transpileOnly: true, configFile } },
  exclude: /node_modules/,
});

const cssRule = {
  test: /\.css$/i,
  use: ["style-loader", "css-loader", "postcss-loader"],
};
const assetRule = {
  test: /\.(png|jpg|gif|svg|woff2?)$/,
  type: "asset/resource",
};

// ── Remote: mf-data-export ────────────────────────────────────────────────
// Compiled by the same webpack process; assets served at /mf-data-export/
// on the host's dev server — no separate port needed.

const remoteConfig = {
  name: "mf-data-export",
  context: remotePath,
  entry: path.join(remotePath, "src/main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist/mf-data-export"),
    filename: "[name].[contenthash].js",
    publicPath: "/mf-data-export/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@ops-brain/shared": path.resolve(__dirname, "../shared/src"),
    },
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath, "node_modules"),
      path.resolve(__dirname, "../../node_modules"),
    ],
  },
  stats: {
    errorDetails: true,
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath, "node_modules"),
    ],
  },

  module: {
    rules: [
      makeTsRule(path.join(remotePath, "tsconfig.json")),
      cssRule,
      assetRule,
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),
    new ModuleFederationPlugin({
      name: "mfDataExport",
      filename: "remoteEntry.js",
      exposes: {
        "./DataImportPage": path.join(remotePath, "src/pages/DataImportPage"),
        "./ImportLogsPage": path.join(remotePath, "src/pages/ImportLogsPage"),
      },
      shared: {
        react: { singleton: true, requiredVersion: remoteDeps.react },
        "react-dom": {
          singleton: true,
          requiredVersion: remoteDeps["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: remoteDeps["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: remoteDeps.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: remoteDeps["react-i18next"],
        },
      },
    }),
  ],
};
const remoteConfig2 = {
  name: "mfCouriers",
  context: remotePath2,
  entry: path.join(remotePath2, "src/main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist/mf-couriers"),
    filename: "[name].[contenthash].js",
    publicPath: "/mf-couriers/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@ops-brain/shared": path.resolve(__dirname, "../shared/src"),
    },
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath2, "node_modules"),
    ],
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath2, "node_modules"),
      "node_modules",
    ],
  },

  module: {
    rules: [
      makeTsRule(path.join(remotePath2, "tsconfig.json")),
      cssRule,
      assetRule,
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),
    new ModuleFederationPlugin({
      name: "mfCouriers",
      filename: "remoteEntry.js",
      exposes: {
        "./CouriersPage": path.join(remotePath2, "src/pages/CouriersPage"),
        "./CouriersProfile": path.join(
          remotePath2,
          "src/pages/CouriersProfile",
        ),
        "./AddCourierPage": path.join(remotePath2, "src/pages/AddCourierPage"),
      },
      shared: {
        react: { singleton: true, requiredVersion: remoteDeps2.react },
        "react-dom": {
          singleton: true,
          requiredVersion: remoteDeps2["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: remoteDeps2["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: remoteDeps2.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: remoteDeps2["react-i18next"],
        },
      },
    }),
  ],
};
const remoteConfig3 = {
  name: "mfReports",
  context: remotePath3,
  entry: path.join(remotePath3, "src/main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist/mf-reports"),
    filename: "[name].[contenthash].js",
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
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),
    new ModuleFederationPlugin({
      name: "mfReports",
      filename: "remoteEntry.js",
      exposes: {
        "./ReportsPage": path.join(remotePath3, "src/pages/ReportsPage"),
        "./AddReportPage": path.join(remotePath3, "src/pages/AddReportPage"),
        "./CouriersReportPage": path.join(
          remotePath3,
          "src/pages/CouriersReportPage",
        ),
        "./CompaniesReportPage": path.join(
          remotePath3,
          "src/pages/CompaniesReportPage",
        ),
      },
      shared: {
        react: { singleton: true, requiredVersion: remoteDeps3.react },
        "react-dom": {
          singleton: true,
          requiredVersion: remoteDeps3["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: remoteDeps3["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: remoteDeps3.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: remoteDeps3["react-i18next"],
        },
      },
    }),
  ],
};
const remoteConfig4 = {
  name: "mfSettings",
  context: remotePath4,
  entry: path.join(remotePath4, "src/main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist/mf-settings"),
    filename: "[name].[contenthash].js",
    publicPath: "/mf-settings/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@ops-brain/shared": path.resolve(__dirname, "../shared/src"),
    },
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath4, "node_modules"),
    ],
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "node_modules"),
      path.join(remotePath4, "node_modules"),
      "node_modules",
    ],
  },

  module: {
    rules: [
      makeTsRule(path.join(remotePath4, "tsconfig.json")),
      cssRule,
      assetRule,
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),
    new ModuleFederationPlugin({
      name: "mfSettings",
      filename: "remoteEntry.js",
      exposes: {
        "./ProfilePage":       path.join(remotePath4, "src/pages/profile/ProfilePage"),
        "./SecurityPage":      path.join(remotePath4, "src/pages/security/SecurityPage"),
        "./NotificationsPage": path.join(remotePath4, "src/pages/notifications/NotificationsPage"),
        "./AppearancesPage":   path.join(remotePath4, "src/pages/appearances/AppearancesPage"),
        "./TeamPage":          path.join(remotePath4, "src/pages/team/TeamPage"),
        "./ActivityPage":      path.join(remotePath4, "src/pages/activity/ActivityPage"),
        "./DangerZonePage":    path.join(remotePath4, "src/pages/danger/DangerZonePage"),
        "./SLAPage":           path.join(remotePath4, "src/pages/sla/SLAPage"),
      },
      shared: {
        react: { singleton: true, requiredVersion: remoteDeps4.react },
        "react-dom": {
          singleton: true,
          requiredVersion: remoteDeps4["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: remoteDeps4["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: remoteDeps4.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: remoteDeps4["react-i18next"],
        },
      },
    }),
  ],
};

// ── Host ──────────────────────────────────────────────────────────────────

const hostConfig = {
  name: "host",
  entry: "./src/main.tsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: {
      keep: /^(mf-data-export|mf-couriers|mf-reports|mf-settings)\//,
    },
    publicPath: "/",
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
      makeTsRule(path.resolve(__dirname, "tsconfig.json")),
      cssRule,
      assetRule,
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),

    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        // Remote is served by the same dev server at /mf-data-export/
        mfDataExport: "mfDataExport@/mf-data-export/remoteEntry.js",
        mfCouriers: "mfCouriers@/mf-couriers/remoteEntry.js",
        mfReports: "mfReports@/mf-reports/remoteEntry.js",
        mfSettings: "mfSettings@/mf-settings/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: hostDeps.react },
        "react-dom": {
          singleton: true,
          requiredVersion: hostDeps["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: hostDeps["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: hostDeps.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: hostDeps["react-i18next"],
        },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],

  // devServer is only read from the first config in the array
  devServer: {
    port: 3000,
    historyApiFallback: {
      rewrites: [
        { from: /^\/mf-data-export\//, to: (ctx) => ctx.parsedUrl.pathname },
        { from: /^\/mf-couriers\//, to: (ctx) => ctx.parsedUrl.pathname },
        { from: /^\/mf-reports\//, to: (ctx) => ctx.parsedUrl.pathname },
        { from: /^\/mf-settings\//, to: (ctx) => ctx.parsedUrl.pathname },
        { from: /./, to: "/index.html" },
      ],
    },
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    devMiddleware: { writeToDisk: true },
    static: {
      directory: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    proxy: [
      {
        context: ["/api"],
        target: "https://localhost:5172",
        secure: false,
        changeOrigin: true,

        onProxyRes(proxyRes) {
          const cookies = proxyRes.headers["set-cookie"];
          if (cookies) {
            proxyRes.headers["set-cookie"] = cookies.map((c) =>
              c.replace(/;\s*secure/gi, "").replace(/;\s*samesite=none/gi, ""),
            );
          }
        },

        onError(err, req, res) {
          console.error("Proxy error:", err.code);
        },
      },
    ],
  },
};

// Export as array — webpack compiles both configs, webpack-dev-server serves
// all outputs on port 3000 using each config's publicPath.
module.exports = [hostConfig, remoteConfig, remoteConfig2, remoteConfig3, remoteConfig4];
