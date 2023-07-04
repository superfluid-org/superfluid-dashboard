import { defineConfig } from "cypress";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import webpackPreprocessor from "@cypress/webpack-preprocessor";
import webpack from "webpack";
import { cloudPlugin } from "cypress-cloud/plugin";

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);
  if (config.env.coverage) {
    require("@cypress/code-coverage/task")(on, config);
  }

  const fs = require("fs");

  on("task", {
    downloads: (downloadspath) => {
      return fs.readdirSync(downloadspath);
    },
  });

  // Note: The "buffer" plugin and "crypto" / "stream" fallback are necessary because of "web3-provider-engine".
  on(
    "file:preprocessor",
    webpackPreprocessor({
      webpackOptions: {
        resolve: {
          extensions: [".ts", ".js"],
          fallback: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            os: require.resolve("os-browserify/browser"),
            path: require.resolve("path-browserify"),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
          }),
        ],
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: "ts-loader",
                },
              ],
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: "@badeball/cypress-cucumber-preprocessor/webpack",
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  );

  // Make sure to return the config object as it might have been modified by the plugin.
  return cloudPlugin(on, config);
}

export default defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    env: {
      vesting: "",
      TAGS: "not @ignore",
      codeCoverage: {
        url: "http://localhost:3000/__coverage__",
      },
    },
    projectId: "2aaadn",
    baseUrl: "http://localhost:3000",
    excludeSpecPattern: "*.js",
    viewportHeight: 720,
    viewportWidth: 1450,
    defaultCommandTimeout: 10000,
    slowTestThreshold: 30000,
    trashAssetsBeforeRuns: true,
    video: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    watchForFileChanges: false,
    setupNodeEvents,
  },
});
