// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";

const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT || process.env.CONTEXT;

const netlifyContext = process.env.CONTEXT;
const isOnNetlify = !!netlifyContext;
const interfaceFeeAddress = process.env.NEXT_PUBLIC_INTERFACE_FEE_ADDRESS;
const shouldInstrumentCode = "INSTRUMENT_CODE" in process.env;
const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL ?? "http://localhost:3000";
const enableReactCompiler = false;
  // process.env.NODE_ENV !== "development";
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

function withSentryIfNecessary(nextConfig: NextConfig) {
  console.log({
    sentryEnvironment,
    netlifyContext,
    isOnNetlify,
    interfaceFeeAddress,
    shouldInstrumentCode,
    appUrl,
    sentryOrg,
    sentryProject
  });

  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

  if (!SENTRY_AUTH_TOKEN) {
    console.warn(
      "Sentry release not created because SENTRY_AUTH_TOKEN is not set."
    );
    return nextConfig;
  }

  // Make sure adding Sentry options is the last code to run before exporting, to
  // ensure that your source maps include changes from all other Webpack plugins
  // NOTE from developer: withTM is also recommended to keep last.
  return withSentryConfig(nextConfig, {
    org: sentryOrg,
    project: sentryProject,

    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore
    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    sourcemaps: {
      // Don't serve sourcemaps to the users
      deleteSourcemapsAfterUpload: true,
    },

    // TODO: This was causing build issues on Vercel. Stuff like address dialog not selecting addresses.
    // // The thirdPartyErrorFilterIntegration allows you to filter out errors originating from third parties,
    // // such as browser extensions, code-injecting browsers, or widgets from third-party services that also use Sentry.
    // // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/filtering/#using-thirdpartyerrorfilterintegration
    unstable_sentryWebpackPluginOptions: {
      applicationKey: "superfluid-dashboard",
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/superfluid-finance/**/*",
      },
      {
        protocol: "https",
        hostname: "superfluid-finance.github.io",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
  rewrites: async () => [
    {
      source: "/monitoring",
      destination: "/api/monitoring",
    },
  ],
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: sentryEnvironment,
    NEXT_PUBLIC_NETLIFY_CONTEXT: process.env.CONTEXT, // https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
  },
  productionBrowserSourceMaps: false, // NOTE: If this is set to `false` then be careful -- Sentry might still override this to `true`...
  // Modularize imports to prevent compilation of unused modules.
  // More info here: https://nextjs.org/docs/advanced-features/compiler
  // modularizeImports: // It's enabled automatically for many packages in use: https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports
  experimental: {
    forceSwcTransforms: !shouldInstrumentCode, // .babelrc.js existence is because of code instrumentation.
    cpus: isOnNetlify ? 6 : undefined, // Fixes the issue of memory running out on Netlify (error 127)
    reactCompiler: enableReactCompiler
  },
  eslint: {
    ignoreDuringBuilds: isOnNetlify,
  }
};

export default withSentryIfNecessary(nextConfig);
