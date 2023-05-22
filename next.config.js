// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

// This is used to transpile lifi widget so we can add it dom dynamically.
const withTM = require("next-transpile-modules")(["@lifi/widget"]);

const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.CONTEXT;

function withSentryIfNecessary(nextConfig) {
  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

  if (!SENTRY_AUTH_TOKEN) {
    console.warn(
      "Sentry release not created because SENTRY_AUTH_TOKEN is not set."
    );
    return nextConfig;
  }

  const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore
    env: SENTRY_ENVIRONMENT,
    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
  };

  // Make sure adding Sentry options is the last code to run before exporting, to
  // ensure that your source maps include changes from all other Webpack plugins
  // NOTE from developer: withTM is also recommended to keep last.
  return withSentryConfig(nextConfig, sentryWebpackPluginOptions);
}

/** @type {import('next').NextConfig} */
const moduleExports = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    domains: ["raw.githubusercontent.com"],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.URL,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_NETLIFY_CONTEXT: process.env.CONTEXT, // https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
  },
  swcMinify: false, // Recommended by next-transpile-modules... BUT Chart.js has problems with it so it needs to be turned off: https://github.com/chartjs/Chart.js/issues/10673
  productionBrowserSourceMaps: true, // NOTE: If this is set to `false` then be careful -- Sentry might still override this to `true`...
  sentry: {
    hideSourceMaps: false, // If this not specified as `true` then Sentry will expose the production source maps. We've decided to expose the source maps though.
  },
  // Modularize imports to prevent compilation of unused modules.
  // More info here: https://nextjs.org/docs/advanced-features/compiler
  experimental: {
    modularizeImports: {
      lodash: {
        transform: "lodash/{{member}}",
      },
      "date-fns": {
        transform: "date-fns/{{member}}",
      },
      "@mui/icons-material": {
        transform: "@mui/icons-material/{{member}}",
      },
    },
  },
};

module.exports = withTM(withSentryIfNecessary(moduleExports));
