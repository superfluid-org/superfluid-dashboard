import { BasePage } from "../BasePage";
import { format } from "date-fns";
import { networksBySlug } from "../../superData/networks";
import { Common, TOKEN_ANIMATION, TOKEN_BALANCE } from "./Common";
import { ethers } from "ethers";

const TOKEN_GRAPH = "[data-cy=token-graph]";
const LIQUIDATION_DATE = "[data-cy=liquidation-date]";
const STREAM_ROWS = "[data-cy=stream-row]";
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]";
const STREAM_FLOW_RATES = "[data-cy=flow-rate]";
const START_END_DATES = "[data-cy=start-end-date]";
const CANCEL_BUTTONS = "[data-cy=cancel-button]";
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]";
const TOOLTIPS = "[role=tooltip]";
const RECEIVING_ICON = "[data-testid=ArrowBackIcon]";
const SENDING_ICON = "[data-testid=ArrowForwardIcon]";
const INFINITY_ICON = "[data-testid=AllInclusiveIcon]";
const PENDING_MESSAGE = "[data-cy=pending-message]";
const DISTRIBUTIONS_TAB = "[data-cy=distribution-tab]";
const STREAMS_TAB = "[data-cy=streams-tab]";
const TRANSFERS_TAB = "[data-cy=transfers-tab]";
const APPROVE_SUBSCRIPTION_MESSAGE = "[data-cy=approve-index-message]";
const REVOKE_MESSAGE = "[data-cy=revoke-message]";
const PUBLISHERS = "[data-cy=publisher]";
const AMOUNT_RECEIVED = "[data-cy=amount-received]";
const STATUS = "[data-cy=status]";
const LAST_UPDATED_AT = "[data-cy=last-updated-at]";
const APPROVE_BUTTON = "[data-cy=approve-button]";
const REVOKE_BUTTON = "[data-cy=revoke-button]";
const DISTRIBUTION_ROWS = "[data-cy=distribution-row]";
const APPROVAL_MESSAGE = "[data-cy=approval-message]";
const TX_MESSAGE_NETWORK = "[data-cy=tx-network]";
const LOADING_SPINNER = "[role=progressbar]";
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]";
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]";
const OK_BUTTON = "[data-cy=ok-button]";
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]";
const DIST_TABLE_ALL_TAB = "[data-cy=all-tab]";
const DIST_TABLE_APPROVED_TAB = "[data-cy=approved-tab]";
const DIST_TABLE_UNAPPROVED_TAB = "[data-cy=unapproved-tab]";
const NO_DATA_ROW = "[data-cy=no-data-row]";
const NO_DATA_MESSAGE = "[data-cy=no-data-message]";
const HEADER_SYMBOL = "[data-cy=token-header] [data-cy=token-symbol]";
const HEADER_NAME = "[data-cy=token-header] [data-cy=token-name]";
const TOKEN_ICON = "[data-cy=token-icon] img";
const TOKEN_CONTAINER = "[data-cy=token-container-by-graph]";
const GRAPH_BALANCE_SYMBOL = `${TOKEN_CONTAINER} [data-cy=token-symbol]`;
const TRANSFER_ROWS = "[data-cy=transfer-row]";
const TRANSFER_AMOUNTS = "[data-cy=transfer-amount]";
const TRANSFER_DATE = "[data-cy=transfer-date]";
const INCOMING_ARROW = "[data-testid=ArrowBackIcon]";
const OUTGOING_ARROW = "[data-testid=ArrowForwardIcon]";
const WRAP_BUTTON = "[data-cy=wrap-button]";
const UNWRAP_BUTTON = "[data-cy=unwrap-button]";
const ADD_TO_WALLET_BUTTON = "[data-cy=add-to-wallet-button]";

interface Transfer {
  toFrom: string;
  amount: number;
  dateSent: string;
}

export class IndividualTokenPage extends BasePage {
  static tokenPageIsOpen() {
    this.isVisible(LIQUIDATION_DATE);
    this.isVisible(TOKEN_GRAPH);
    this.isVisible(STREAM_ROWS);
    this.isVisible(TOKEN_BALANCE);
  }

  static validateStreamTableFirstRowValues(
    address: string,
    sendOrReceive: string,
    ongoing: string,
    amount: string,
    fromTo: string
  ) {
    let assertableString = ethers.utils.isAddress(address)
      ? BasePage.shortenHex(address)
      : address;
    this.hasText(
      `${STREAM_ROWS} ${SENDER_RECEIVER_ADDRESSES}`,
      assertableString,
      0
    );
    let plusOrMinus;
    if (sendOrReceive === "receiving") {
      plusOrMinus = "-";
      this.get(STREAM_ROWS, 0).find(SENDING_ICON).should("be.visible");
    } else {
      plusOrMinus = "+";
      this.get(STREAM_ROWS, 0).find(RECEIVING_ICON).should("be.visible");
    }
    let flowRateString =
      parseInt(amount) > 0 ? `${plusOrMinus + amount}/mo` : "-";
    this.hasText(`${STREAM_ROWS} ${STREAM_FLOW_RATES}`, flowRateString, 0, {
      timeout: 60000,
    });
    let fromToDate =
      fromTo === "now"
        ? format(Date.now(), "d MMM. yyyy")
        : format(parseInt(fromTo) * 1000, "d MMM. yyyy");
    this.containsText(`${STREAM_ROWS} ${START_END_DATES}`, fromToDate, 0);
  }

  static validateFirstStreamRowPendingMessage(message: string) {
    let regex = new RegExp(`(${message.replaceAll(".", "")}|Syncing)\.{3}`);
    cy.get(STREAM_ROWS)
      .first({ timeout: 60000 })
      .find(PENDING_MESSAGE)
      .invoke("text")
      .should("match", regex);
  }

  static validateFirstDistributionRowPendingMessage(message: string) {
    cy.get(DISTRIBUTION_ROWS)
      .first({ timeout: 60000 })
      .find(PENDING_MESSAGE)
      .should("have.text", message);
  }

  static validateNoPendingStatusForFirstStreamRow() {
    cy.get(STREAM_ROWS)
      .first()
      .find(PENDING_MESSAGE, { timeout: 60000 })
      .should("not.exist");
  }

  static validateNoPendingStatusForFirstDistributionsRow() {
    cy.get(DISTRIBUTION_ROWS)
      .first()
      .find(PENDING_MESSAGE, { timeout: 60000 })
      .should("not.exist");
  }

  static openDistributionTab() {
    this.click(DISTRIBUTIONS_TAB, undefined, { timeout: 30000 });
  }

  static validateLastDistributionRow(
    address: string,
    amount: string,
    status: string,
    when: string
  ) {
    this.hasText(PUBLISHERS, BasePage.shortenHex(address), 0);
    this.hasText(AMOUNT_RECEIVED, amount, 0);
    this.hasText(STATUS, status, 0);
    let fromToDate = when === "now" ? format(Date.now(), "d MMM. yyyy") : when;
    this.hasText(LAST_UPDATED_AT, fromToDate, 0);
  }

  static approveLastIndex() {
    this.clickFirstVisible(APPROVE_BUTTON);
  }

  static validateLastDistRowHasRevokeButton() {
    cy.get(DISTRIBUTION_ROWS).first().find(REVOKE_BUTTON).should("be.visible");
  }

  static validateApprovalDialogAndCloseIt(network: string) {
    this.validateApprovalTransactionDialog(network);
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(OK_BUTTON);
    this.click(OK_BUTTON);
  }

  static validateApprovalTransactionDialog(network: string) {
    let selectedNetwork =
      network === "selected network" ? Cypress.env("network") : network;
    this.doesNotExist(APPROVE_BUTTON);
    this.isVisible(LOADING_SPINNER);
    this.exists(`${DISTRIBUTION_ROWS} ${LOADING_SPINNER}`);
    this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
    this.hasText(
      APPROVE_SUBSCRIPTION_MESSAGE,
      "You are approving an index subscription."
    );
    this.hasText(
      TX_MESSAGE_NETWORK,
      `(${networksBySlug.get(selectedNetwork)?.name})`
    );
  }

  static validateRevokeDialogAndCloseIt(network: string) {
    this.validateRevokeTransactionDialog(network);
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(OK_BUTTON);
    this.click(OK_BUTTON);
  }

  static validateRevokeTransactionDialog(network: string) {
    let selectedNetwork =
      network === "selected network" ? Cypress.env("network") : network;
    this.doesNotExist(REVOKE_BUTTON);
    this.isVisible(LOADING_SPINNER);
    this.exists(`${DISTRIBUTION_ROWS} ${LOADING_SPINNER}`);
    this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
    this.hasText(
      REVOKE_MESSAGE,
      "You are revoking approval of an index subscription."
    );
    this.hasText(
      TX_MESSAGE_NETWORK,
      `(${networksBySlug.get(selectedNetwork)?.name})`
    );
  }

  static revokeLastIndex() {
    this.click(REVOKE_BUTTON);
  }

  static validateLastDistRowHasApproveButton() {
    cy.get(DISTRIBUTION_ROWS).first().find(APPROVE_BUTTON).should("be.visible");
  }

  static revokeLastIndexIfNeeded() {
    this.isVisible(PUBLISHERS);
    cy.get("body").then((body) => {
      if (body.find(REVOKE_BUTTON).length > 0) {
        this.click(REVOKE_BUTTON);
        this.isVisible(OK_BUTTON, undefined, { timeout: 45000 }).click();
        this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
          timeout: 60000,
        });
        this.hasText(STATUS, "Awaiting Approval", undefined, {
          timeout: 60000,
        });
      }
    });
  }

  static approveLastIndexIfNeeded() {
    this.isVisible(PUBLISHERS);
    cy.get("body").then((body) => {
      if (body.find(APPROVE_BUTTON).length > 0) {
        this.click(APPROVE_BUTTON);
        this.isVisible(OK_BUTTON, undefined, { timeout: 45000 }).click();
        this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
          timeout: 60000,
        });
        this.hasText(STATUS, "Approved", undefined, { timeout: 60000 });
      }
    });
  }

  static validateDistributionTableTabAmounts(
    total: string,
    approved: string,
    unapproved: string
  ) {
    this.hasText(DIST_TABLE_ALL_TAB, `All  (${total})`);
    this.hasText(DIST_TABLE_APPROVED_TAB, `Approved  (${approved})`);
    this.hasText(DIST_TABLE_UNAPPROVED_TAB, `Unapproved  (${unapproved})`);
  }

  static openApprovedDistributionTab() {
    this.click(DIST_TABLE_APPROVED_TAB);
  }

  static openUnapprovedDistributionTab() {
    this.click(DIST_TABLE_UNAPPROVED_TAB);
  }

  static validateNoRowsShown() {
    this.isVisible(NO_DATA_ROW);
    this.hasText(NO_DATA_MESSAGE, "No data");
    this.doesNotExist(STREAM_ROWS);
    this.doesNotExist(DISTRIBUTION_ROWS);
    this.doesNotExist(TRANSFER_ROWS);
  }

  static validateTokenNameAndIconsPerNetwork(token: string, network: string) {
    cy.fixture("networkSpecificData").then((data) => {
      let chosenToken = data[network].ongoingStreamsAccount.tokenValues[1]
        ? data[network].ongoingStreamsAccount.tokenValues.filter(
            (values: any) => values.token === token
          )[0]
        : data[network].ongoingStreamsAccount.tokenValues;

      this.hasText(HEADER_SYMBOL, token);
      this.hasText(HEADER_NAME, chosenToken.tokenName);
      this.hasText(LIQUIDATION_DATE, chosenToken.liquidationDate);
      this.hasAttributeWithValue(TOKEN_ICON, "alt", `${token} token icon`);
      this.isVisible(TOKEN_ANIMATION);
      this.hasText(GRAPH_BALANCE_SYMBOL, token);
      this.isVisible(`[data-cy="${networksBySlug.get(network)?.id}-icon"]`);
    });
  }

  static validateNetFlowRatesForToken(
    token: string,
    account: string,
    network: string
  ) {
    cy.fixture("networkSpecificData").then((data) => {});
  }

  static validateTokenPageStreamsTable(network: string) {
    Common.validateStreamsTable(network, STREAM_ROWS);
  }

  static validateDisabledRevokeButtons() {
    this.isDisabled(REVOKE_BUTTON);
  }

  static openTransfersTab() {
    this.click(TRANSFERS_TAB);
  }

  static clickWrapButton() {
    this.click(WRAP_BUTTON);
  }

  static clickUnwrapButton() {
    this.click(UNWRAP_BUTTON);
  }

  static validateAllTokenTransfers(
    account: string,
    token: string,
    network: string
  ) {
    cy.fixture("networkSpecificData").then((fixture) => {
      let chosenTransfers = fixture[network][account].tokenValues.filter(
        (x: any) => (x.token = token)
      )[0].transfers;
      this.hasText("[data-cy=all-tab]", `All  (${chosenTransfers.length})`);
      this.validateTransferTable(chosenTransfers);
    });
  }

  static switchTableTab(tab: string) {
    this.click(`[data-cy=${tab}-tab]`);
  }

  static validateTransferTable(transfers: Transfer[]) {
    transfers.forEach((transfer: Transfer, index: number) => {
      let expectedArrowIcon =
        transfer.amount >= 0 ? INCOMING_ARROW : OUTGOING_ARROW;
      this.hasLength(TRANSFER_ROWS, transfers.length);
      cy.get(TRANSFER_ROWS)
        .eq(index)
        .find(expectedArrowIcon)
        .should("be.visible");
      cy.get(TRANSFER_ROWS)
        .eq(index)
        .find(SENDER_RECEIVER_ADDRESSES)
        .should("have.text", this.shortenHex(transfer.toFrom));
      cy.get(TRANSFER_ROWS)
        .eq(index)
        .find(TRANSFER_AMOUNTS)
        .should("have.text", Math.abs(transfer.amount));
      cy.get(TRANSFER_ROWS)
        .eq(index)
        .find(TRANSFER_DATE)
        .should("have.text", transfer.dateSent);
    });
  }

  static validateFilteredTokenTransfers(
    sentOrReceived: string,
    account: string,
    network: string,
    token: string
  ) {
    cy.fixture("networkSpecificData").then((fixture) => {
      let expectedToBeOverZero = sentOrReceived.toLowerCase() === "received";
      let chosenTokenTransfers = fixture[network][account].tokenValues.filter(
        (x: any) => (x.token = token)
      )[0].transfers;
      let filtrate = (el: Transfer) =>
        expectedToBeOverZero ? el.amount > 0 : el.amount < 0;
      let filteredTransfers = chosenTokenTransfers.filter(filtrate);
      this.hasText(
        `[data-cy=${sentOrReceived.toLowerCase()}-tab]`,
        `${sentOrReceived}  (${filteredTransfers.length})`
      );
      this.validateTransferTable(filteredTransfers);
    });
  }

  static addToWalletbuttonIsVisible() {
    this.isVisible(ADD_TO_WALLET_BUTTON);
  }
}
