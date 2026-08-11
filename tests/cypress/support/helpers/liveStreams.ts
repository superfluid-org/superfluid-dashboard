import { BigNumber, utils } from 'ethers';

import {
  flowSchedulerContractAddresses,
  networksBySlug,
} from '../../superData/networks';

/**
 * Live, on-chain reads for the close-ended stream assertions.
 *
 * Why this exists: `streamData.json` used to pin `buffer`, `scheduledAmount` and
 * `projectedLiquidation` as string constants recorded once by hand. Those are
 * derived values -- the buffer is the protocol deposit, the scheduled amount is
 * `flowRate * (endDate - startDate)` -- so they go stale the moment the stream
 * behind them is re-created, which is exactly what happened: the original
 * fixture stream ran to completion on 2026-07-22 and the scenario had no way to
 * recover without someone recomputing the numbers by hand.
 *
 * Reading them from chain means the next person who has to re-create this
 * stream only has to update the identity fields (sender, receiver, txHash,
 * v2Link) and the assertions follow automatically.
 */

/** Canonical CFAv1Forwarder, deployed at the same address on every network. */
const CFA_V1_FORWARDER = '0xcfA132E353cB4E398080B9700609bb008eceB125';

const forwarderInterface = new utils.Interface([
  'function getFlowInfo(address token, address sender, address receiver) view returns (uint256 lastUpdated, int96 flowrate, uint256 deposit, uint256 owedDeposit)',
]);

const flowSchedulerInterface = new utils.Interface([
  'function getFlowSchedule(address superToken, address account, address receiver) view returns (tuple(uint32 startDate, uint32 startMaxDelay, uint32 endDate, int96 flowRate, uint256 startAmount, bytes32 userData))',
]);

function ethCall(
  networkSlug: string,
  to: string,
  data: string
): Cypress.Chainable<string> {
  const network = networksBySlug.get(networkSlug);
  if (!network) {
    throw new Error(`No network definition for slug "${networkSlug}".`);
  }
  return cy
    .request({
      method: 'POST',
      url: network.superfluidRpcUrl,
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: to, data: data }, 'latest'],
      },
      timeout: 30000,
    })
    .then((response) => {
      if (response.body && response.body.error) {
        throw new Error(
          `eth_call on ${networkSlug} failed: ${JSON.stringify(
            response.body.error
          )}`
        );
      }
      return response.body.result as string;
    });
}

/**
 * The protocol deposit locked by the stream -- what the UI labels "Buffer".
 */
export function getStreamBuffer(
  networkSlug: string,
  tokenAddress: string,
  sender: string,
  receiver: string
): Cypress.Chainable<BigNumber> {
  const data = forwarderInterface.encodeFunctionData('getFlowInfo', [
    tokenAddress,
    sender,
    receiver,
  ]);
  return ethCall(networkSlug, CFA_V1_FORWARDER, data).then((result) =>
    BigNumber.from(
      forwarderInterface.decodeFunctionResult('getFlowInfo', result).deposit
    )
  );
}

/** Current flow rate in wei per second, straight from the protocol. */
export function getStreamFlowRate(
  networkSlug: string,
  tokenAddress: string,
  sender: string,
  receiver: string
): Cypress.Chainable<BigNumber> {
  const data = forwarderInterface.encodeFunctionData('getFlowInfo', [
    tokenAddress,
    sender,
    receiver,
  ]);
  return ethCall(networkSlug, CFA_V1_FORWARDER, data).then((result) =>
    BigNumber.from(
      forwarderInterface.decodeFunctionResult('getFlowInfo', result).flowrate
    )
  );
}

/** Scheduled end date (unix seconds), or 0 when no schedule is registered. */
export function getScheduledEndDate(
  networkSlug: string,
  tokenAddress: string,
  sender: string,
  receiver: string
): Cypress.Chainable<number> {
  const schedulerAddress = (
    flowSchedulerContractAddresses as Record<string, string>
  )[networkSlug];
  if (!schedulerAddress) {
    throw new Error(
      `No flow scheduler contract known for "${networkSlug}". Add it to flowSchedulerContractAddresses in cypress/superData/networks.ts.`
    );
  }
  const data = flowSchedulerInterface.encodeFunctionData('getFlowSchedule', [
    tokenAddress,
    sender,
    receiver,
  ]);
  return ethCall(networkSlug, schedulerAddress, data).then((result) =>
    Number(
      flowSchedulerInterface.decodeFunctionResult('getFlowSchedule', result)[0]
        .endDate
    )
  );
}

/**
 * `flowRate * (endDate - startDate)`, matching how the stream details page
 * derives "Total scheduled amount" (see `totalToBeStreamedIfScheduled` in
 * `src/pages/stream/[_network]/[_stream].tsx`).
 */
export function getTotalScheduledAmount(
  flowRateWeiPerSecond: BigNumber,
  streamStartUnixSeconds: number,
  scheduledEndUnixSeconds: number
): BigNumber {
  return flowRateWeiPerSecond.mul(
    scheduledEndUnixSeconds - streamStartUnixSeconds
  );
}

/**
 * Assert a rendered `"<amount> <SYMBOL>"` value against a wei amount read from
 * chain.
 *
 * The UI rounds for display, so this compares numerically with a tolerance
 * derived from the printed precision rather than string-matching. The tolerance
 * is capped relative to the chain value for the same reason as in
 * `liveBalances.balanceTolerance`: a display-derived tolerance alone is
 * circular, because a UI that prints too few digits would widen its own
 * allowance and swallow the very error being checked for.
 */
export function assertDisplayedAmountMatchesChain(
  selector: string,
  expectedWei: BigNumber,
  tokenSymbol: string,
  label: string
) {
  const expected = Number(utils.formatEther(expectedWei));
  cy.get(selector, { timeout: 30000 })
    .filter(':visible', { timeout: 30000 })
    .should(($el) => {
      const text = $el.text().trim();
      expect(text, `${label} should name the token`).to.contain(tokenSymbol);
      const match = text.match(/-?[\d.]+/);
      expect(match, `${label} should render a number, got "${text}"`).to.not.be
        .null;
      const displayed = parseFloat((match as RegExpMatchArray)[0]);
      const decimals = ((match as RegExpMatchArray)[0].split('.')[1] || '')
        .length;
      const halfUnit = 0.5 * Math.pow(10, -decimals);
      const magnitude = Math.abs(expected);
      const tolerance =
        magnitude === 0
          ? halfUnit
          : Math.max(magnitude * 1e-4, Math.min(halfUnit, magnitude * 7.5e-4));
      expect(
        displayed,
        `${label}: UI shows ${displayed}, chain says ${expected}`
      ).to.be.closeTo(expected, tolerance);
    });
}
