import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import webpack from 'webpack';
import { cloudPlugin } from 'cypress-cloud/plugin';

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);
  if (config.env.coverage) {
    require('@cypress/code-coverage/task')(on, config);
  }

  const fs = require('fs');
  const path = require('path');

  // Written by cypress/support/telemetry.js when a test fails. One JSON file
  // per failed test attempt, uploaded as a CI artifact. Must never throw:
  // a broken telemetry write should not turn into an extra test failure.
  const TELEMETRY_DIR = path.join(__dirname, 'cypress', 'results', 'telemetry');
  let telemetryFileCounter = 0;

  const slugify = (value: string) =>
    String(value || 'unknown')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'unknown';

  on('task', {
    downloads: (downloadspath) => {
      return fs.readdirSync(downloadspath);
    },
    recordFailureTelemetry: (report: any) => {
      try {
        fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
        telemetryFileCounter += 1;
        const fileName = `${String(telemetryFileCounter).padStart(
          3,
          '0'
        )}-${slugify(report?.spec)}-${slugify(report?.test)}.json`;
        fs.writeFileSync(
          path.join(TELEMETRY_DIR, fileName),
          JSON.stringify(report, null, 2)
        );
      } catch (error) {
        console.warn('[telemetry] failed to write failure telemetry', error);
      }
      return null;
    },
  });

  // Note: The "buffer" plugin and "crypto" / "stream" fallback are necessary because of "web3-provider-engine".
  on(
    'file:preprocessor',
    webpackPreprocessor({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
          fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
          },
        },
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'ts-loader',
                },
              ],
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
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
    specPattern: '**/*.feature',
    env: {
      vesting: '',
      TAGS: 'not @ignore',
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__',
      },
    },
    projectId: '2aaadn',
    baseUrl: 'http://localhost:3000',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/results',
      html: false,
      overwrite: false,
    },
    excludeSpecPattern: '*.js',
    experimentalMemoryManagement: true, // Due to chromium sometimes crashing
    viewportHeight: 720,
    viewportWidth: 1450,
    defaultCommandTimeout: 15000,
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
