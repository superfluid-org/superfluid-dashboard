// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { IsCypress } from "./src/utils/SSRUtils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

if (!IsCypress && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.5,
    environment: SENTRY_ENVIRONMENT,
    beforeBreadcrumb(breadcrumb, hint) {
      // Inspired by: https://github.com/getsentry/sentry-javascript/issues/3015#issuecomment-718594200
      if (breadcrumb.category?.startsWith('ui') && hint) {
        const target = hint.event.target;
        const dataCy = target.dataset.cy;
        const cyMessage = `[data-cy="${dataCy}"]`;
        breadcrumb.message = dataCy ? cyMessage : breadcrumb.message;
      }
      return breadcrumb;
    },
    maxValueLength: 750, // ethers can have very long errors so we increase this limit.
    maxBreadcrumbs: 25 // The long list of breadcrumbs seem to be rarely useful so we decrease this.
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
} else {
  console.warn("Sentry not initialized on the client.");
}
