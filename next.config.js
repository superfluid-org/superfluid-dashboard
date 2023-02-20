// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

// This is used to transpile lifi widget so we can add it dom dynamically.
const withTM = require("next-transpile-modules")(["@lifi/widget"]);

const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.CONTEXT; // https://docs.netlify.com/configure-builds/environment-variables/#build-metadata

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
  },
  swcMinify: false, // Recommended by next-transpile-modules... BUT Chart.js has problems with it so it needs to be turned off: https://github.com/chartjs/Chart.js/issues/10673
  productionBrowserSourceMaps: false, // Sentry will override this to `true`...
  sentry: {
    hideSourceMaps: true // If this not specified then Sentry will expose the production source maps. 
  },
  experimental: {
    esmExternals: "loose"
  }
};

module.exports = withTM(withSentryIfNecessary(moduleExports));
