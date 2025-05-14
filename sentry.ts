export const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

export const isProduction = SENTRY_ENVIRONMENT === "production";

export const isBrowser = typeof window !== "undefined";