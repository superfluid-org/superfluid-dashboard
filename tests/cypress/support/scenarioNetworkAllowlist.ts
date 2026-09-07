import { networksByName, networksBySlug } from '../superData/networks';

/**
 * Per-scenario network allowlist.
 *
 * A handful of scenarios depend on on-chain state (funded wallets, contract
 * deployments) that only exists on some of the networks the CI matrix runs. The
 * allowlist is installed by a tag hook (see `step_definitions/Hooks.ts`), read by
 * the existing first-step skip predicate
 * (`SendPage.skipTestIfPlatformNotAvailableOnNetwork`) and cleared before every
 * scenario so it can never leak into the next one.
 *
 * The dangerous failure mode here is a gate that skips where it should run: an
 * allowlist matching nothing turns the scenario `Pending` on every network, which
 * is indistinguishable from the legitimately skipped jobs — it looks green. Both
 * ends are therefore resolved through `networksBySlug`, the same slug source the
 * matrix uses, and a slug that does not resolve throws instead of silently
 * excluding everything.
 */
const ENV_KEY = 'scenarioNetworkAllowlist';

const resolveSlug = (slug: string, context: string): string => {
  // `networksByName` is the same set keyed by lower-cased slug, so a casing
  // difference in `--env network=` does not read as a typo.
  const network =
    networksBySlug.get(slug) ??
    (typeof slug === 'string'
      ? networksByName.get(slug.toLowerCase())
      : undefined);
  if (!network) {
    throw new Error(
      `Unknown network slug "${slug}" ${context}. Use a slugName from cypress/superData/networks.ts.`
    );
  }
  return network.slugName;
};

export const setScenarioNetworkAllowlist = (slugs: string[]) => {
  Cypress.env(
    ENV_KEY,
    slugs.map((slug) => resolveSlug(slug, 'in a scenario network allowlist'))
  );
};

export const clearScenarioNetworkAllowlist = () => {
  Cypress.env(ENV_KEY, null);
};

/**
 * True only when a scenario installed an allowlist AND the network under test is
 * not on it. No allowlist means "run everywhere", so a removed tag makes the
 * scenario run and fail rather than silently skip.
 */
export const isNetworkExcludedByScenarioAllowlist = (): boolean => {
  const allowlist = Cypress.env(ENV_KEY);
  if (!Array.isArray(allowlist) || allowlist.length === 0) {
    return false;
  }
  // Throws on an unknown current network, so a slug mismatch on this side cannot
  // quietly skip the scenario either.
  const network = resolveSlug(
    Cypress.env('network'),
    'is under test while a scenario network allowlist is active'
  );
  return !allowlist.includes(network);
};
