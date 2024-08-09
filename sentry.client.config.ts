// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { ErrorEvent as SentryErrorEvent, EventHint } from "@sentry/nextjs";
import { IsCypress } from "./src/utils/SSRUtils";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

const isProduction = SENTRY_ENVIRONMENT === "production";

if (!IsCypress && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: isProduction ? 0.2 : 0.6,
    environment: SENTRY_ENVIRONMENT,
    beforeBreadcrumb(breadcrumb, hint) {
      // Inspired by: https://github.com/getsentry/sentry-javascript/issues/3015#issuecomment-718594200
      if (breadcrumb.category?.startsWith("ui") && hint) {
        const target = hint.event.target;
        const dataCy = target.dataset.cy;
        const cyMessage = `[data-cy="${dataCy}"]`;
        breadcrumb.message = dataCy ? cyMessage : breadcrumb.message;
      }
      return breadcrumb;
    },
    async beforeSend(event, hint) {
      let eventModified = event as SentryErrorEvent;

      for (const callback of beforeSendCallbacks) {
        eventModified = (await callback(eventModified, hint)) ?? eventModified;
      }

      return eventModified;
    },
    maxValueLength: 750, // ethers can have very long errors so we increase this limit.
    maxBreadcrumbs: 25, // The long list of breadcrumbs seem to be rarely useful so we decrease this.
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
} else {
  console.warn("Sentry not initialized on the client.");
}

/**
 * Necessary to enable logging Sentry errors to Segment.
 */
export type BeforeSendFunc = (
  event: SentryErrorEvent,
  hint: EventHint
) => PromiseLike<SentryErrorEvent | null> | SentryErrorEvent | null;

const beforeSendCallbacks: BeforeSendFunc[] = [];

export const addBeforeSend = (callback: BeforeSendFunc) => {
  beforeSendCallbacks.push(callback);
};

export const removeBeforeSend = (callback: BeforeSendFunc) => {
  beforeSendCallbacks.splice(beforeSendCallbacks.indexOf(callback), 1);
};