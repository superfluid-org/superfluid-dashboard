import { defineConfig } from "cypress";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import browserify from "@badeball/cypress-cucumber-preprocessor/browserify";

async function setupNodeEvents(
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
    await addCucumberPreprocessorPlugin(on, config);

    on(
        "file:preprocessor",
        browserify(config, {
            typescript: require.resolve("typescript"),
        })
    );

    // Make sure to return the config object as it might have been modified by the plugin.
    return config;
}

export default defineConfig({
    e2e: {
        specPattern: "**/*.feature",
        env: {
            "TAGS": "not @ignore",
            "codeCoverage": {
                "url": "http://localhost:3000/__coverage__"
            }
        },
        projectId: "2aaadn",
        baseUrl: "http://localhost:3000",
        excludeSpecPattern: "*.js",
        viewportHeight: 1080,
        viewportWidth: 1920,
        defaultCommandTimeout: 10000,
        slowTestThreshold: 30000,
        video: true,
        retries: {
            "runMode": 1,
            "openMode": 0
        },
        watchForFileChanges: false,
        setupNodeEvents
    }
});
