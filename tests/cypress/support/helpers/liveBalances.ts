import { BigNumber, utils } from 'ethers';

import { networksBySlug } from '../../superData/networks';

/**
 * Live, on-chain balance reads for assertions that used to compare the UI
 * against a hard-coded fixture.
 *
 * Why this exists: `cypress/fixtures/nativeTokenBalances.json` pinned the
 * expected balances of the "staticBalanceAccount" wallet as string constants.
 * That wallet is not actually static -- it drifts with gas spend and has been
 * partially drained -- so the hourly suite failed for months on four networks
 * while the app was rendering the correct number. Reading the chain here turns
 * the assertion into "the UI shows what the chain says", which is what the
 * smoke test was always meant to check.
 */

/**
 * The feature files address networks by the slug the *app* uses. The copy of
 * the network table under `cypress/superData` is slightly behind the app's own
 * table, so a few slugs need aliasing.
 */
const NETWORK_SLUG_ALIASES: { [featureSlug: string]: string } = {
  degen: 'degenchain',
};

/**
 * Relative slack on top of the UI's own display precision.
 *
 * A *fixed absolute* tolerance (like the 0.05 used by
 * `WrapPage.validateUnderlyingBalanceAfterTx`) is wrong here: the balances this
 * covers span eight orders of magnitude (~4.7e-7 ETH on Arbitrum One vs ~1 POL
 * on Polygon), so any absolute value big enough to be safe on Polygon would
 * make the Arbitrum/Optimism assertions vacuous.
 *
 * 1e-4 is tight enough that every failure mode we care about is still caught
 * (the stale-fixture failures were 100%-scale: expected 0.9989, actual 0), and
 * loose enough to absorb the two sources of legitimate drift:
 *   - the app and the test may read different blocks,
 *   - a super token balance flows continuously, so it grows while Cypress
 *     retries. A test-sized stream (~0.5 tokens/month = ~1.9e-7 tokens/s) moves
 *     ~1.1e-5 tokens over a 60s retry window, which stays inside 1e-4 relative
 *     for any balance above ~0.12 tokens.
 */
const RELATIVE_FLOOR = 1e-4;

/**
 * Hard ceiling on the tolerance, as a fraction of the *chain* value.
 *
 * This is what stops the tolerance from being circular. The display-derived
 * term (half a unit in the last printed decimal place) is computed from what
 * the UI chose to print, so a UI that wrongly prints `0` prints zero decimals
 * and thereby hands itself a ±0.5 tolerance — the exact bug this helper is
 * supposed to catch. Capping the display-derived term against the chain value
 * means the UI can never widen its own tolerance beyond a fixed *relative*
 * error, no matter how few digits it prints.
 *
 * The number is bounded from both sides:
 *
 *  - From below by the app's own rounding. `getDecimalPlacesToRoundTo`
 *    (src/utils/DecimalUtils.ts) picks the decimal count from magnitude bands
 *    (>=1000 -> 0, >=100 -> 1, >=10 -> 2, >=0.099 -> 4, >=0.00099 -> 6,
 *    >=0.0000099 -> 8, ...). The worst-case relative error of that rounding is
 *    at the bottom edge of a band: 5e-5 / 0.099 = 5.05e-4. Anything below that
 *    would reject legitimately-rounded displays.
 *  - From above by the failures we must still catch. The tightest of those is
 *    a chain value of 0.9989 rendered as "1" (a real historical failure mode):
 *    an error of 1.1e-3 relative. So the ceiling must stay under ~1.1e-3.
 *
 * 7.5e-4 sits roughly in the middle on a log scale: ~1.5x headroom above the
 * worst legitimate display rounding, ~1.5x margin below the smallest error we
 * insist on catching.
 *
 * Note the cap only ever *binds* when the UI printed fewer decimals than its
 * own rounding table calls for at that magnitude. For a correctly-rendered
 * balance `halfUnitInLastPlace` is already the smaller of the two, so the
 * assertion behaves exactly as before.
 */
const MAX_RELATIVE = 7.5e-4;

const superTokenInterface = new utils.Interface([
  'function realtimeBalanceOfNow(address account) view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp)',
]);

export function getNetworkBySlug(networkSlug: string) {
  const slug = NETWORK_SLUG_ALIASES[networkSlug] || networkSlug;
  const network = networksBySlug.get(slug);
  if (!network) {
    throw new Error(
      `No network definition for slug "${networkSlug}". Add it to cypress/superData/networks.ts or to NETWORK_SLUG_ALIASES.`
    );
  }
  return network;
}

/**
 * One JSON-RPC call through `cy.request`, i.e. from the Cypress node process
 * rather than the browser, so it is not subject to the app's CORS or to the
 * page's own request queue. `cy.request` already retries network failures a
 * bounded number of times; we deliberately do not add a retry loop of our own,
 * so a broken RPC fails fast and loudly instead of storming the endpoint.
 */
function rpcCall(
  network: ReturnType<typeof getNetworkBySlug>,
  method: string,
  params: unknown[]
): Cypress.Chainable<string> {
  return cy
    .request({
      method: 'POST',
      url: network.superfluidRpcUrl,
      body: { jsonrpc: '2.0', id: 1, method: method, params: params },
      timeout: 30000,
    })
    .then((response) => {
      if (response.body && response.body.error) {
        throw new Error(
          `JSON-RPC "${method}" on ${network.slugName} failed: ${JSON.stringify(
            response.body.error
          )}`
        );
      }
      return response.body.result as string;
    });
}

/** Balance of the network's native asset (POL, ETH, XDAI, ...) in wei. */
export function getNativeAssetBalance(
  networkSlug: string,
  accountAddress: string
): Cypress.Chainable<BigNumber> {
  const network = getNetworkBySlug(networkSlug);
  return rpcCall(network, 'eth_getBalance', [accountAddress, 'latest']).then(
    (hexBalance) => BigNumber.from(hexBalance)
  );
}

/**
 * Balance of the native asset super token (POLx, ETHx, ...) in wei.
 *
 * The dashboard renders this from `realtimeBalanceOfNow`'s *available* balance
 * (see `src/features/redux/endpoints/balanceFetcher.ts`), which is the balance
 * net of the stream deposit -- not `balanceOf` -- so we read the same thing.
 */
export function getNativeAssetSuperTokenBalance(
  networkSlug: string,
  accountAddress: string
): Cypress.Chainable<BigNumber> {
  const network = getNetworkBySlug(networkSlug);
  const data = superTokenInterface.encodeFunctionData('realtimeBalanceOfNow', [
    accountAddress,
  ]);
  return rpcCall(network, 'eth_call', [
    { to: network.nativeCurrency.superToken.address, data: data },
    'latest',
  ]).then((result) =>
    BigNumber.from(
      superTokenInterface.decodeFunctionResult('realtimeBalanceOfNow', result)
        .availableBalance
    )
  );
}

/**
 * A balance of exactly zero makes the corresponding UI assertion true no matter
 * what the app does with a real balance, so shout about it in the run log
 * instead of letting the suite report a hollow pass. We warn rather than fail
 * because several of these networks have legitimately never been funded, and
 * failing on them would recreate the permanently-red hourly run this change is
 * meant to fix.
 */
export function warnIfAssertionIsVacuous(
  label: string,
  networkSlug: string,
  accountAddress: string,
  balanceWei: BigNumber
) {
  if (balanceWei.isZero()) {
    const message =
      `VACUOUS ASSERTION: the ${label} of ${accountAddress} on ${networkSlug} is 0 on-chain, ` +
      `so "the UI matches the chain" only proves the UI shows 0. Fund the wallet on ${networkSlug} ` +
      `to turn this back into a real check.`;
    cy.log(`⚠️ ${message}`);
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}

/**
 * Assert that a rendered balance matches an on-chain balance.
 *
 * The dashboard formats balances with `formatAmount`
 * (`src/features/token/Amount.tsx`), which rounds to a magnitude-dependent
 * number of decimal places (`getDecimalPlacesToRoundTo`) and may prefix a "~"
 * to signal that rounding happened. Re-implementing that rounding table in the
 * tests would just assert the test's own copy of the app's logic, so instead we
 * compare numerically and derive the tolerance from what the UI actually
 * printed -- but *bounded by the chain value*, so that the UI cannot widen its
 * own tolerance by printing fewer digits. See `balanceTolerance`.
 *
 * Uses `should(callback)`, so it retries while the balance query is still
 * loading and fails with the rendered text in the message if it never resolves.
 */
export function assertDisplayedBalanceMatchesChain(
  selector: string,
  label: string,
  balanceWei: BigNumber,
  decimals: number
) {
  const expected = parseFloat(utils.formatUnits(balanceWei, decimals));

  cy.get(selector, { timeout: 60000 })
    .filter(':visible', { timeout: 60000 })
    .should(($el) => {
      const text = $el.text();
      const match = text.match(/-?\d+(\.\d+)?/);
      expect(
        match,
        `${label} should render a number, but the element read "${text}"`
      ).to.not.be.null;

      const displayedText = (match as RegExpMatchArray)[0];
      const displayed = parseFloat(displayedText);
      const tolerance = balanceTolerance(expected, displayedText);

      expect(
        displayed,
        `${label}: UI rendered "${text}" but the chain says ${expected} (tolerance ${tolerance})`
      ).to.be.closeTo(expected, tolerance);
    });
}

/**
 * How far the rendered balance may sit from the on-chain balance.
 *
 *   halfUnit  = half a unit in the last decimal place the UI actually printed
 *   tolerance = max(|chain| * RELATIVE_FLOOR,
 *                   min(halfUnit, |chain| * MAX_RELATIVE))    when chain != 0
 *   tolerance = halfUnit                                      when chain == 0
 *
 * `halfUnit` is exactly the error the app's own rounding can introduce -- a
 * display of "0.4947" stands for anything in [0.49465, 0.49475) -- so for a
 * correctly-rendered balance the assertion is as tight as the UI's own
 * precision allows, at every magnitude.
 *
 * `halfUnit` on its own is circular, though: it is derived from what the UI
 * chose to print, so a UI that wrongly prints "0" prints zero decimals and
 * hands itself a +/-0.5 tolerance -- swallowing exactly the failure this helper
 * exists to catch (chain 0.4975, UI "0" used to pass). The `min` against
 * `|chain| * MAX_RELATIVE` caps that: the same case now gets a tolerance of
 * 3.7e-4 and fails. The cap only ever binds when the UI printed fewer decimals
 * than its own rounding table calls for at that magnitude, so correct displays
 * are unaffected.
 *
 * `toFixed` strips trailing zeroes, so a balance of exactly 5 renders as "5"
 * and `halfUnit` alone would be 0.5. The cap pulls that to 3.75e-3, which still
 * passes the genuine "5.0 rendered as 5" case and now also catches "5.0
 * rendered as 4".
 *
 * The `max` keeps the small relative floor, which absorbs the app and the test
 * reading different blocks and a super token balance flowing during retries.
 *
 * chain == 0 has no usable relative bound (every fraction of 0 is 0), so it
 * falls back to `halfUnit`: "0" passes, and any materially non-zero rendering
 * still fails. Such a network is separately flagged by
 * `warnIfAssertionIsVacuous`.
 */
export function balanceTolerance(
  chainValue: number,
  displayedText: string
): number {
  const displayedDecimalPlaces = (displayedText.split('.')[1] || '').length;
  const halfUnitInLastPlace = 0.5 * Math.pow(10, -displayedDecimalPlaces);
  const chainAbs = Math.abs(chainValue);

  if (chainAbs === 0) {
    return halfUnitInLastPlace;
  }

  return Math.max(
    chainAbs * RELATIVE_FLOOR,
    Math.min(halfUnitInLastPlace, chainAbs * MAX_RELATIVE)
  );
}
