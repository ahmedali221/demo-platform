const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../host/.env") });

const deps = require("./package.json").dependencies;

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: "./src/main.tsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "http://localhost:3006/",
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
      name: "mfReports",
      filename: "remoteEntry.js",
      exposes: {
        "./ReportsPage": "./src/pages/ReportsPage",
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
        "react-router-dom": {
          singleton: true,
          requiredVersion: deps["react-router-dom"],
        },
        i18next: { singleton: true, requiredVersion: deps.i18next },
        "react-i18next": {
          singleton: true,
          requiredVersion: deps["react-i18next"],
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env.BASEURL": JSON.stringify(
        process.env.BASEURL || "http://localhost:3000/api/v1",
      ),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],

  devServer: {
    port: 3006,
    historyApiFallback: true,
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
