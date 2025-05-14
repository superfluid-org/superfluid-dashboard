// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "./sentry";

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,
        tracesSampleRate: 0,
        debug: false,
        sendDefaultPii: false
    })
}
