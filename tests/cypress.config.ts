import { defineConfig } from "cypress";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import * as webpack from "@cypress/webpack-preprocessor";

async function setupNodeEvents(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
    await addCucumberPreprocessorPlugin(on, config);

    on(
        "file:preprocessor",
        webpack({
            webpackOptions: {
                resolve: {
                    extensions: [".ts", ".js"],
                },
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
    return config;
}

export default defineConfig({
    e2e: {
        specPattern: "**/*.feature",
        env: {
            "vesting": "",
            "TAGS": "not @ignore",
            "codeCoverage": {
                "url": "http://localhost:3000/__coverage__"
            }
        },
        projectId: "2aaadn",
        baseUrl: "http://localhost:3000",
        excludeSpecPattern: "*.js",
        viewportHeight: 720,
        viewportWidth: 1450,
        defaultCommandTimeout: 10000,
        slowTestThreshold: 30000,
        video: false,
        retries: {
            "runMode": 2,
            "openMode": 0
        },
        watchForFileChanges: false,
        setupNodeEvents
    }
});
