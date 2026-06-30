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
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

function withSentry(nextConfig: NextConfig) {
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

  const hasAuthToken = !!process.env.SENTRY_AUTH_TOKEN;

  if (!hasAuthToken) {
    // We still wrap with withSentryConfig (rather than returning early) so that error
    // tunneling (tunnelRoute) is injected in every environment. Source maps are skipped
    // entirely when the auth token is absent (nothing to upload — see `sourcemaps` below).
    console.warn(
      "SENTRY_AUTH_TOKEN is not set — skipping source maps (error tunneling stays enabled)."
    );
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

    sourcemaps: hasAuthToken
      ? // Generate + upload source maps, then delete them so they're never served to users.
        { deleteSourcemapsAfterUpload: true }
      : // No token → nothing to upload, so skip source map generation entirely.
        { disable: true },

    // TODO: This was causing build issues on Vercel. Stuff like address dialog not selecting addresses.
    // // The thirdPartyErrorFilterIntegration allows you to filter out errors originating from third parties,
    // // such as browser extensions, code-injecting browsers, or widgets from third-party services that also use Sentry.
    // // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/filtering/#using-thirdpartyerrorfilterintegration
    unstable_sentryWebpackPluginOptions: {
      applicationKey: "superfluid-dashboard",
    },

    // Route browser requests to Sentry through a same-origin Next.js rewrite to circumvent ad-blockers.
    // Sentry wraps our rewrites() and forwards `/monitoring?o=<org>&p=<project>` straight to the
    // DSN's ingest endpoint at the edge (no serverless function). Always enabled — see the
    // withSentry() note above — so client errors aren't dropped in token-less builds.
    // Kept as a fixed path (not `true`/randomized) so reports from already-open tabs still resolve
    // after a redeploy. Note: `src/proxy.ts` (the geofence middleware) early-returns for `/monitoring`
    // so it never intercepts the tunnel — see Sentry's guidance on excluding the tunnel route.
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
      source: "/balance-api/:path*",
      destination: `${process.env.BALANCE_API_REWRITE_TARGET || "https://balances.superfluid.dev"}/:path*`,
    },
    {
      // The Clear Macro relay provider serves no CORS headers — proxy it same-origin.
      source: "/clearmacro-provider/:path*",
      destination: `${process.env.CLEARMACRO_PROVIDER_REWRITE_TARGET || "https://clearmacro-provider.superfluid.dev"}/:path*`,
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
  experimental: {
    forceSwcTransforms: !shouldInstrumentCode, // .babelrc.js existence is because of code instrumentation.
    cpus: isOnNetlify ? 6 : undefined, // Fixes the issue of memory running out on Netlify (error 127)
    optimizePackageImports: [
      '@mui/lab',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      'chart.js'
    ] // It's enabled automatically for many packages in use: https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports
  }
};

export default withSentry(nextConfig);
