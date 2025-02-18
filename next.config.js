// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT || process.env.CONTEXT;

const netlifyContext = process.env.CONTEXT;
const isOnNetlify = !!netlifyContext;
const interfaceFeeAddress = process.env.INTERFACE_FEE_ADDRESS;
const shouldInstrumentCode = "INSTRUMENT_CODE" in process.env;
const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL;

function withSentryIfNecessary(nextConfig) {
  console.log({
    sentryEnvironment,
    netlifyContext,
    isOnNetlify,
    interfaceFeeAddress,
    shouldInstrumentCode,
    appUrl
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
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore
    env: sentryEnvironment,
    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
    hideSourceMaps: true, // If this not specified as `true` then Sentry will expose the production source maps. We've decided to expose the source maps though.
  });
}

/** @type {import('next').NextConfig} */
const moduleExports = {
  output: "export",
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
  async redirects() {
    return [
      {
        source: '/streams/:path*',
        destination: '/streams/[_v1Network]/[_tx]/[_log]/[[..._rest]].html',
        permanent: false,
      },
      {
        source: '/stream/:path*',
        destination: '/stream/[_network]/[_stream].html',
        permanent: false,
      },
      {
        source: '/token/:path*',
        destination: '/token/[_network]/[_token].html',
        permanent: false,
      },
      {
        source: '/vesting/:path*',
        destination: '/vesting/[_network]/[_id].html',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/currencies',
        destination: '/',
        permanent: true,
      },
      {
        source: '/transactions',
        destination: '/',
        permanent: true,
      },
      {
        source: '/distribution',
        destination: '/',
        permanent: true,
      },
      {
        source: '/activities',
        destination: '/',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/',
        permanent: true,
      },
      {
        source: '/GT-Walsheim-Pro-Medium.otf',
        destination: '/fonts/GT-Walsheim-Pro-Medium.otf',
        permanent: true,
      },
      {
        source: '/GT-Walsheim-Pro-Regular.otf',
        destination: '/fonts/GT-Walsheim-Pro-Regular.otf',
        permanent: true,
      },
      {
        source: '/static/:path*',
        destination: 'https://v1.superfluid.finance/static/:path*',
        permanent: true,
      },
      {
        source: '/runner',
        destination: '/superfluid-runner',
        permanent: true,
      },
      {
        source: '/ecosystem',
        destination: 'https://www.superfluid.finance/ecosystem',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
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
    cpus: isOnNetlify ? 6 : undefined // Fixes the issue of memory running out on Netlify (error 127)
  },
  eslint: {
    ignoreDuringBuilds: isOnNetlify,
  }
};

module.exports = withSentryIfNecessary(moduleExports);
