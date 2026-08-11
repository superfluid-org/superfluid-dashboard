import { networksByChainId } from '../superData/networks';

/**
 * Suite-wide exclusion of Degen Chain.
 *
 * Degen Chain is dead and queued for removal from the Dashboard, and its public
 * RPC (`https://rpc.degen.tips`, viem's default transport for chain 666666666)
 * answers HTTP 429. The app fans reads across every network regardless of which
 * network a test selected, so Degen poisoned scenarios that have nothing to do
 * with it: activity history and dashboard balances hung because
 * `src/pages/history.tsx` and `TokenSnapshotTables.tsx` await one `Promise.all`
 * over every active network.
 *
 * We exclude it through the application's own user preference -- the
 * `networkPreferences.hidden` chain-ID list that the network selection dropdown
 * writes -- seeded into localStorage before redux-persist rehydrates. Nothing
 * here fakes chain data or stubs a response; the app simply starts up with Degen
 * switched off, exactly as if a user had toggled it.
 *
 * SCOPE, and why this file is not the whole story: `hidden` is only honoured by
 * `ActiveNetworksContext` consumers. The Approvals page
 * (`TokenAccessTables.tsx`) and the address-book contract check
 * (`addressBookRpcApi.slice.ts`) iterate `allNetworks` raw and cannot be reached
 * this way. Approvals is handled instead by scoping the skeleton wait to the
 * network under test (see `Common.waitForNetworkTableToLoad`). The address book
 * is a known application defect (an unguarded `Promise.all` with no per-network
 * error handling) and is deliberately NOT papered over here.
 *
 * Fail-loud, matching the properties `scenarioNetworkAllowlist.ts` established:
 *   - Degen missing from the vendored network table throws at support-file load,
 *     so every spec fails with a message naming what to do, rather than the seed
 *     quietly excluding nothing.
 *   - The seed is unconditional. There is no env flag and no opt-in, because an
 *     exclusion that defaults to off is the silent-skip hazard we are avoiding.
 *   - `Common.feature` carries a smoke scenario asserting Degen is toggled off in
 *     the UI. That is the only guard that can see app-side drift -- a renamed
 *     slug, a bumped persist version, a changed slice shape -- from the test
 *     process, all of which would otherwise disable this file silently.
 */

export const DEGEN_CHAIN_ID = 666666666;

/**
 * The app's slug is `degen` (src/features/network/networks.ts). The vendored copy
 * in `superData/networks.ts` says `degenchain`. Anything building a `data-cy`
 * selector must use this constant, never the vendored `slugName`.
 */
export const DEGEN_APP_SLUG = 'degen';

if (!networksByChainId.get(DEGEN_CHAIN_ID)) {
  throw new Error(
    `Degen Chain (${DEGEN_CHAIN_ID}) is no longer in cypress/superData/networks.ts. ` +
      'If Degen has been removed from the product, delete support/degenExclusion.ts, ' +
      'its import in support/e2e.js, and the "Degen Chain is excluded from the suite" ' +
      'scenario in integration/Common.feature.'
  );
}

/**
 * redux-persist stores each field JSON-stringified and merges over `initialState`
 * (autoMergeLevel1), so only the field under test needs to be present -- `id` is
 * supplied by the slice. Built with `JSON.stringify` rather than a hand-escaped
 * string literal so the escaping cannot rot unnoticed.
 *
 * Version 3 matches the `networkPreferences` persistReducer in
 * `src/features/redux/store.ts`.
 */
const PERSISTED_NETWORK_PREFERENCES = JSON.stringify({
  hidden: JSON.stringify([DEGEN_CHAIN_ID]),
  _persist: JSON.stringify({ version: 3, rehydrated: true }),
});

/**
 * Registered globally rather than inside `Common.openDashboardWithConnectedTxAccount`'s
 * `onBeforeLoad`, because three visit paths bypass that hook: the no-wallet visit,
 * `Common.openViewModePage` (which is what the mocked activity scenarios use), and
 * `GnosisSafe`. `window:before:load` runs for every application window before any
 * app code executes. `telemetry.js` uses the same registration point for the same
 * reason.
 *
 * Deliberately not wrapped in try/catch: telemetry swallows because it is passive,
 * this is load-bearing and must fail the test.
 */
Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem(
    'persist:networkPreferences',
    PERSISTED_NETWORK_PREFERENCES
  );
});
