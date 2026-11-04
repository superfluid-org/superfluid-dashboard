/**
 * Parent-frame origins the Safe Apps SDK will trust.
 *
 * These are matched against `event.origin` of the parent frame and decide whose messages the
 * SDK accepts (`PostMessageCommunicator.isValidMessage`). Anchor and escape every pattern: an
 * unanchored `/app.safe.global$/` also admits `https://appXsafeYglobal`, and an unanchored
 * `/gnosis-safe.io$/` also admits `https://evilgnosis-safe.io` — both attacker-registrable.
 *
 * Shared rather than duplicated because two places construct a Safe Apps client: the wagmi
 * `safe` connector, and the Clear Macro relay's own SDK instance (the connector keeps its
 * instance private). They must never drift — the relay flow trusts `safe.getInfo()` to decide
 * which Safe it is authorizing, and that trust is only sound while this list is anchored.
 */
export const SAFE_APPS_ALLOWED_DOMAINS: RegExp[] = [
  /^https:\/\/(?:[^\/]+\.)?gnosis-safe\.io$/,
  /^https:\/\/(?:[^\/]+\.)?app\.safe\.global$/,
  /^https:\/\/(?:[^\/]+\.)?coinshift\.xyz$/,
  /^http:\/\/(localhost|127\.0\.0\.1):(\d+)$/,
];
