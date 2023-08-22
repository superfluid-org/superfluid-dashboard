import { BasePage } from "../BasePage";
import { networksBySlug } from "../../superData/networks";
import { format } from "date-fns";
import {
  CONNECT_WALLET_BUTTON,
  CHANGE_NETWORK_BUTTON,
  TOKEN_ANIMATION,
  TOKEN_BALANCE,
  STOP_VIEWING_BUTTON,
} from "./Common";

const WRAP_TAB = "[data-cy=wrap-toggle]";
const UNWRAP_TAB = "[data-cy=unwrap-toggle]";
const WRAP_INPUT = "[data-cy=wrap-input]";
const UNWRAP_INPUT = "[data-cy=unwrap-input]";
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]";
const SELECTED_TOKEN = `${SELECT_TOKEN_BUTTON} span[translate=no]`;
const WRAP_PREVIEW = "[data-cy=wrapable-amount] input";
const UNWRAP_PREVIEW = "[data-cy=unwrap-amount-preview] input";
const TOKEN_PAIR = "[data-cy=token-pair]";
const UPGRADE_BUTTON = "[data-cy=upgrade-button]";
const DOWNGRADE_BUTTON = "[data-cy=downgrade-button]";
const UNDERLYING_BALANCE = "[data-cy=underlying-balance]";
const SUPER_TOKEN_BALANCE = "[data-cy=balance]";
const TOKEN_SELECT_NAME = "[data-cy=token-symbol-and-name] p";
const TOKEN_SELECT_SYMBOL = "[data-cy=token-symbol-and-name] h6";
const APPROVAL_MESSAGE = "[data-cy=approval-message]";
const TX_NETWORK = "[data-cy=tx-network]";
const WRAP_MESSAGE = "[data-cy=wrap-message]";
const LOADING_SPINNER = "[role=progressbar]";
const WRAP_MORE_TOKENS_BUTTON = "[data-cy=wrap-more-tokens-button]";
const GO_TO_TOKENS_PAGE_BUTTON = "[data-cy=go-to-tokens-page-button]";
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]";
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]";
const DRAWER_TX = "[data-cy=transaction]";
const TX_TYPE = `${DRAWER_TX} h6`;
const TX_DATE = `${DRAWER_TX} [data-cy=tx-date]`;
const TX_HASH = `${DRAWER_TX} [data-cy=tx-hash]`;
const TX_HASH_BUTTONS = `${DRAWER_TX} [data-cy=tx-hash-buttons] a`;
const RESTORE_BUTTONS = "[data-testid=ReplayIcon]";
const TX_NETWORK_BADGES = `${DRAWER_TX} [data-cy=network-badge-`;
const PROGRESS_LINE = "[data-cy=progress-line]";
const UNWRAP_MESSAGE = "[data-cy=unwrap-message]";
const OK_BUTTON = "[data-cy=ok-button]";
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]";
const APPROVE_ALLOWANCE_BUTTON = "[data-cy=approve-allowance-button]";
const APPROVE_ALLOWANCE_MESSAGE = "[data-cy=allowance-message]";
const WRAP_SCREEN = "[data-cy=wrap-screen]";
const MAIN_BUTTONS = `${WRAP_SCREEN} [data-cy*=e-button]`;
const MAX_BUTTON = "[data-cy=max-button]";
const TOKEN_SEARCH_NO_RESULTS = "[data-cy=token-search-no-results]";

export class WrapPage extends BasePage {
  static checkIfWrapContainerIsVisible() {
    this.isVisible(WRAP_TAB);
    this.isVisible(UNWRAP_TAB);
    this.isVisible(WRAP_INPUT);
    this.isVisible(SELECT_TOKEN_BUTTON);
    this.isVisible(WRAP_PREVIEW);
    this.isVisible(TOKEN_PAIR);
  }

  static checkIfUpgradeButtonIsVisible() {
    this.isVisible(UPGRADE_BUTTON);
  }

  static clearAndInputWrapAmount(amount: string) {
    this.clear(`${WRAP_INPUT} input`);
    this.type(WRAP_INPUT, amount);
    this.hasValue(WRAP_PREVIEW, amount);
  }

  static upgradeButtonIsDisabled() {
    this.hasText(UPGRADE_BUTTON, "Wrap");
    this.isDisabled(UPGRADE_BUTTON);
  }

  static upgradeButtonAsksForConnection() {
    this.hasText(UPGRADE_BUTTON, "Connect Wallet");
    this.isNotDisabled(UPGRADE_BUTTON);
  }

  static switchToUnwrapTab() {
    this.click(UNWRAP_TAB);
    this.isVisible(UNWRAP_INPUT);
  }

  static switchToWrapTab() {
    this.click(WRAP_TAB);
  }

  static downgradeButtonIsDisabled() {
    this.hasText(DOWNGRADE_BUTTON, "Unwrap");
    this.isDisabled(DOWNGRADE_BUTTON);
  }

  static clearAndInputUnwrapAmount(amount: string) {
    this.clear(UNWRAP_INPUT);
    this.type(UNWRAP_INPUT, amount);
    this.hasValue(UNWRAP_PREVIEW, amount);
  }

  static downgradeButtonAsksForConnection() {
    this.hasText(DOWNGRADE_BUTTON, "Connect Wallet");
    this.isNotDisabled(DOWNGRADE_BUTTON);
  }

  static changeNetworkButtonShowsCorrectNetwork(network: string) {
    this.hasText(
      CHANGE_NETWORK_BUTTON,
      `Change Network to ${networksBySlug.get(network)?.name}`
    );
  }

  static isStopViewingButtonVisible() {
    this.isVisible(STOP_VIEWING_BUTTON);
  }

  static clickStopViewingButton() {
    this.clickFirstVisible(STOP_VIEWING_BUTTON);
  }

  static connectWalletButtonIsVisible() {
    this.isVisible(CONNECT_WALLET_BUTTON);
  }

  static verifyWrapPageSelectedToken(token: string) {
    this.contains(SELECT_TOKEN_BUTTON, token.slice(0, -1));
  }

  static validateWrapPageTokenBalance(token: string, network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let filteredToken = networkSpecificData[
        network
      ].staticBalanceAccount.tokenValues.filter(
        (values: any) => values.underlyingTokenSymbol === token
      )[0];
      this.hasText(
        UNDERLYING_BALANCE,
        `Balance: ${parseFloat(filteredToken.underlyingBalance).toFixed(4)}`
      );
      this.hasText(SUPER_TOKEN_BALANCE, `${filteredToken.balance} `);
    });
  }

  static clickSelectTokenButton() {
    this.click(SELECT_TOKEN_BUTTON);
  }

  static validateWrapTokenSelectionBalances(network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      networkSpecificData[network].staticBalanceAccount.tokenValues.forEach(
        (values: any) => {
          let specificToken = `[data-cy=${values.underlyingTokenSymbol}-list-item] `;
          if (values.underlyingBalance) {
            this.scrollToAndHasText(
              specificToken + TOKEN_SELECT_SYMBOL,
              values.underlyingTokenSymbol
            );
            this.scrollToAndHasText(
              specificToken + TOKEN_SELECT_NAME,
              values.underlyingTokenName
            );
            if (values.balance === "0") {
              this.scrollToAndHasText(specificToken + TOKEN_BALANCE, "0");
            } else {
              cy.get(specificToken + TOKEN_BALANCE)
                .scrollIntoView()
                .invoke("text")
                .should((text) => {
                  expect(parseFloat(text.replace("~", ""))).to.be.closeTo(
                    Number(parseFloat(values.underlyingBalance).toFixed(8)),
                    0.0001
                  );
                });
            }
          }
        }
      );
    });
  }

  static validateNoAnimationsInUnderlyingTokenSelection() {
    cy.get("[data-cy*=list-item]").each((el) => {
      cy.wrap(el).find(TOKEN_ANIMATION).should("not.exist");
    });
  }

  static chooseTokenToWrap(token: string) {
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(`[data-cy="${selectedToken}-list-item"]`, undefined, {
        timeout: 60000,
      });
    });
  }

  static validateUnwrapTokenSelectionBalances(network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      networkSpecificData[network].staticBalanceAccount.tokenValues.forEach(
        (values: any) => {
          let specificToken = `[data-cy=${values.token}-list-item] `;
          this.scrollToAndHasText(
            specificToken + TOKEN_SELECT_SYMBOL,
            values.token
          );
          this.scrollToAndHasText(
            specificToken + TOKEN_SELECT_NAME,
            values.tokenName
          );
          if (values.balance === "0") {
            this.scrollToAndHasText(specificToken + TOKEN_BALANCE, "0");
          } else {
            cy.get(specificToken + TOKEN_BALANCE)
              .scrollIntoView()
              .invoke("text")
              .should((text) => {
                expect(parseFloat(text.replace("~", ""))).to.be.closeTo(
                  Number(parseFloat(values.balance).toFixed(8)),
                  0.000001
                );
              });
          }
        }
      );
    });
  }

  static rememberBalanceBeforeAndWrapToken() {
    this.isNotDisabled(UPGRADE_BUTTON, undefined, { timeout: 30000 });
    cy.get(SELECT_TOKEN_BUTTON).then((el) => {
      cy.wrap(el.text()).as("lastWrappedToken");
    });
    this.isVisible(MAX_BUTTON);
    cy.get(UNDERLYING_BALANCE)
      .invoke("text")
      .should("match", /Balance: \d+/);
    cy.get(UNDERLYING_BALANCE).then((el) => {
      cy.wrap(el.text().split("Balance: ")[1]).as(
        "underlyingBalanceBeforeWrap"
      );
    });
    cy.get(SUPER_TOKEN_BALANCE).then((el) => {
      cy.wrap(el.text()).as("superTokenBalanceBeforeWrap");
    });
    this.click(UPGRADE_BUTTON);
  }

  static rememberBalanceBeforeAndUnwrapToken() {
    this.isNotDisabled(DOWNGRADE_BUTTON);
    this.isVisible(MAX_BUTTON);
    cy.get(UNDERLYING_BALANCE)
      .invoke("text")
      .should("match", /Balance: \d+/);
    cy.get(UNDERLYING_BALANCE).then((el) => {
      cy.wrap(parseFloat(el.text().split("Balance: ")[1])).as(
        "underlyingBalanceBeforeUnwrap"
      );
    });
    cy.get(SUPER_TOKEN_BALANCE).then((el) => {
      cy.wrap(el.text()).as("superTokenBalanceBeforeUnwrap");
    });
    cy.get(SELECT_TOKEN_BUTTON).then((el) => {
      cy.wrap(el.text()).as("lastUnwrappedToken");
    });
    this.click(DOWNGRADE_BUTTON);
  }

  static validateWrapTxDialogMessage(
    network: string,
    amount: string,
    token: string
  ) {
    this.getSelectedToken(token).then((selectedToken) => {
      let selectedNetwork = this.getSelectedNetwork(network);
      this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
      this.hasText(
        TX_NETWORK,
        `(${networksBySlug.get(selectedNetwork)?.name})`
      );
      //Sometimes the wrap tx message doesn't have time to appear if the tx is ready too fast, ignoring this as its flaky
      //this.hasText(WRAP_MESSAGE, `You are wrapping ${amount} ${selectedToken} to the super token ${selectedToken}x.`)
      this.isDisabled(UPGRADE_BUTTON);
      this.isVisible(LOADING_SPINNER);
      this.exists(`${UPGRADE_BUTTON} ${LOADING_SPINNER}`);
    });
  }

  static validateWrapTxBroadcastedDialog() {
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.isVisible(WRAP_MORE_TOKENS_BUTTON);
    this.isVisible(GO_TO_TOKENS_PAGE_BUTTON);
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
  }

  static clickTxDialogGoToTokensPageButton() {
    this.click(GO_TO_TOKENS_PAGE_BUTTON);
  }

  static validatePendingTransaction(type: string, network: string) {
    this.containsText(TX_TYPE, type, 0);
    this.get(DRAWER_TX, 0)
      .find("[data-cy=Pending-tx-status]")
      .should("be.visible");
    cy.get(TX_HASH_BUTTONS)
      .first()
      .then((el) => {
        el.attr("href")?.substr(-66);
        this.isVisible(TX_HASH);
        this.hasText(
          TX_HASH,
          BasePage.shortenHex(el.attr("href")!.substr(-66)),
          0
        );
      });
    this.isVisible(PROGRESS_LINE);
    this.hasText(TX_DATE, `${format(Date.now(), "d MMM")} •`, 0);
    this.hasAttributeWithValue(
      `${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`,
      "aria-label",
      networksBySlug.get(network)!.name,
      0
    );
    this.isVisible(
      `${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`,
      0
    );
  }

  static validateSuccessfulTransaction(type: any, network: any) {
    this.hasText(TX_TYPE, type, 0);
    cy.get(DRAWER_TX)
      .first()
      .find("[data-cy=Succeeded-tx-status]", { timeout: 90000 })
      .should("be.visible");
    cy.get(TX_HASH_BUTTONS)
      .first()
      .then((el) => {
        el.attr("href")?.substr(-66);
        this.isVisible(TX_HASH);
        this.hasText(
          TX_HASH,
          BasePage.shortenHex(el.attr("href")!.substr(-66)),
          0
        );
      });
    this.doesNotExist(PROGRESS_LINE);
    this.hasText(TX_DATE, `${format(Date.now(), "d MMM")} •`, 0);
    this.hasAttributeWithValue(
      `${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`,
      "aria-label",
      networksBySlug.get(network)!.name,
      0
    );
    this.isVisible(
      `${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`,
      0
    );
  }

  static validateBalanceAfterWrapping(
    token: string,
    network: string,
    amount: string
  ) {
    cy.get("@superTokenBalanceBeforeWrap").then((balanceBefore: any) => {
      let expectedAmount = (parseFloat(balanceBefore) + parseFloat(amount))
        .toFixed(1)
        .toString();
      cy.wrap(expectedAmount).as("expectedSuperTokenBalance");
      this.hasText(
        `[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`,
        `${expectedAmount} `
      );
      cy.get(
        `[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`
      ).then((el) => {
        cy.wrap(parseFloat(el.text()).toFixed(1)).should(
          "equal",
          expectedAmount
        );
      });
    });
  }

  static validateBalanceAfterUnwrapping(
    token: string,
    network: string,
    amount: string
  ) {
    cy.get("@superTokenBalanceBeforeUnwrap").then((balanceBefore: any) => {
      let expectedAmount = (parseFloat(balanceBefore) - parseFloat(amount))
        .toFixed(1)
        .toString();
      cy.wrap(expectedAmount).as("expectedSuperTokenBalance");
      this.doesNotHaveText(
        `[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`,
        balanceBefore,
        undefined,
        { timeout: 30000 }
      );
      cy.get(
        `[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`
      ).then((el) => {
        cy.wrap(parseFloat(el.text()).toFixed(1)).should(
          "equal",
          expectedAmount
        );
      });
    });
  }

  static validateWrapFieldInputAmount(amount: string) {
    this.hasValue(`${WRAP_INPUT} input`, amount);
  }

  static validateTokenBalancesAfterWrap(amount: string) {
    cy.get("@expectedSuperTokenBalance").then((balance: any) => {
      this.hasText(SUPER_TOKEN_BALANCE, `${balance} `);
    });
    cy.get("@underlyingBalanceBeforeWrap").then((balanceBefore: any) => {
      let expectedAmount = (parseFloat(balanceBefore) - parseFloat(amount))
        .toFixed(4)
        .toString()
        .substr(0, 5);
      this.validateUnderlyingBalanceAfterTx(balanceBefore, expectedAmount);
    });
    cy.get("@lastWrappedToken").then((lastToken: any) => {
      this.hasText(SELECT_TOKEN_BUTTON, lastToken);
    });
  }

  static validateUnderlyingBalanceAfterTx(
    balanceBefore: any,
    expectedAmount: string
  ) {
    this.containsText(UNDERLYING_BALANCE, balanceBefore.toString().charAt(0));
    this.doesNotHaveText(UNDERLYING_BALANCE, `Balance: ${balanceBefore}`);
    cy.get(UNDERLYING_BALANCE).then((el) => {
      cy.wrap(parseFloat(el.text().split("Balance: ")[1])).should(
        "be.closeTo",
        parseFloat(expectedAmount),
        0.05
      );
    });
  }

  static validateUnwrapTxDialogMessage(
    network: string,
    amount: string,
    token: string
  ) {
    // Sometimes the tx gets broadcasted too fast and this check adds some flakiness so disabling it for now
    // this.hasText(UNWRAP_MESSAGE, `You are unwrapping  ${amount} ${token}x to the underlying token ${token}.`)
    let selectedNetwork = this.getSelectedNetwork(network);
    this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
    this.hasText(TX_NETWORK, `(${networksBySlug.get(selectedNetwork)?.name})`);
    this.isDisabled(DOWNGRADE_BUTTON);
    this.isVisible(LOADING_SPINNER);
    this.exists(`${DOWNGRADE_BUTTON} ${LOADING_SPINNER}`);
  }

  static validateUnwrapTxBroadcastedMessage() {
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.isVisible(OK_BUTTON);
  }

  static validateUnwrapInputFieldAmount(amount: string) {
    this.hasValue(`${UNWRAP_INPUT} input`, amount);
  }

  static validateTokenBalancesAfterUnwrap(amount: string) {
    cy.get("@expectedSuperTokenBalance").then((balance: any) => {
      cy.get(SUPER_TOKEN_BALANCE).then((el) => {
        cy.wrap(parseFloat(el.text()).toFixed(1)).should("be.equal", balance);
      });
    });

    cy.get("@underlyingBalanceBeforeUnwrap").then((balanceBefore: any) => {
      let expectedAmount = (parseFloat(balanceBefore) + parseFloat(amount))
        .toFixed(4)
        .toString()
        .substr(0, 5);
      this.validateUnderlyingBalanceAfterTx(balanceBefore, expectedAmount);
    });
    cy.get("@lastUnwrappedToken").then((lastToken: any) => {
      this.hasText(SELECT_TOKEN_BUTTON, lastToken);
    });
  }

  static openTxDrawer() {
    this.click(TX_DRAWER_BUTTON);
  }

  static clickOkButton() {
    this.click(OK_BUTTON);
  }

  static approveTokenSpending(token: string) {
    cy.fixture("rejectedCaseTokens").then((tokens) => {
      let selectedToken = token.startsWith("Token")
        ? tokens[Cypress.env("network")][token]
        : token;
      this.isVisible(APPROVE_ALLOWANCE_BUTTON, undefined, { timeout: 60000 });
      this.hasText(
        APPROVE_ALLOWANCE_BUTTON,
        `Allow Superfluid Protocol to wrap your ${selectedToken}`
      );
      this.click(APPROVE_ALLOWANCE_BUTTON);
    });
  }

  static validateApprovalDialog(
    network: string,
    amount: string,
    token: string
  ) {
    cy.fixture("rejectedCaseTokens").then((tokens) => {
      let selectedToken = token.startsWith("Token")
        ? tokens[Cypress.env("network")][token]
        : token;
      let selectedNetwork = this.getSelectedNetwork(network);
      this.hasText(
        APPROVE_ALLOWANCE_MESSAGE,
        `You are approving additional allowance of ${amount} ${selectedToken} for Superfluid Protocol to use.`
      );
      this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
      this.hasText(
        TX_NETWORK,
        `(${networksBySlug.get(selectedNetwork)?.name})`
      );
      this.isDisabled(UPGRADE_BUTTON);
      this.isVisible(LOADING_SPINNER);
      this.exists(`${APPROVE_ALLOWANCE_BUTTON} ${LOADING_SPINNER}`);
    });
  }

  static isRestoreButtonVisible() {
    this.get(DRAWER_TX, 0).find(RESTORE_BUTTONS).should("be.visible");
  }

  static doesRestoreButtonExist() {
    this.get(DRAWER_TX, 0).find(RESTORE_BUTTONS).should("not.exist");
  }

  static approveTokenIfNeeded(token: string, network: string, amount: string) {
    this.isVisible(MAX_BUTTON);
    this.isEnabled(MAIN_BUTTONS);
    cy.get(MAIN_BUTTONS)
      .first()
      .then((el) => {
        if (el.text() === `Allow Superfluid Protocol to wrap your ${token}`) {
          this.approveTokenSpending(token);
          this.validateApprovalDialog(network, amount, token);
          this.validateUnwrapTxBroadcastedMessage();
          this.clickOkButton();
          this.validatePendingTransaction("Approve Allowance", network);
          this.doesRestoreButtonExist();
          this.validateSuccessfulTransaction("Approve Allowance", network);
          this.doesRestoreButtonExist();
        }
      });
  }

  static validateWrapPageNativeTokenBalance(
    token: string,
    account: string,
    network: string
  ) {
    cy.fixture("nativeTokenBalances").then((fixture) => {
      this.hasText(
        UNDERLYING_BALANCE,
        `Balance: ${fixture[account][network][token].underlyingBalance}`,
        undefined,
        { timeout: 60000 }
      );
      this.hasText(
        SUPER_TOKEN_BALANCE,
        `${fixture[account][network][token].superTokenBalance} `,
        undefined,
        { timeout: 60000 }
      );
    });
  }

  static validateNoTokenMessageNotVisible() {
    this.doesNotExist(TOKEN_SEARCH_NO_RESULTS);
  }

  static validateNativeTokenBalanceInTokenList(
    token: string,
    account: string,
    network: string
  ) {
    cy.fixture("nativeTokenBalances").then((fixture) => {
      let expectedString =
        fixture[account][network][token].underlyingBalance === "0"
          ? fixture[account][network][token].underlyingBalance
          : `~${fixture[account][network][token].underlyingBalance}`;
      this.get(`[data-cy=${token}-list-item]`).scrollIntoView();
      this.hasText(
        `[data-cy=${token}-list-item] ${TOKEN_BALANCE}`,
        expectedString
      );
    });
  }

  static validateTokenSelectedForWrapping(token: string) {
    this.hasText(SELECTED_TOKEN, token);
    this.isVisible(WRAP_INPUT);
    this.doesNotExist(UNWRAP_INPUT);
  }

  static validateTokenSelectedForUnwrapping(token: string) {
    this.hasText(SELECTED_TOKEN, token);
    this.doesNotExist(WRAP_INPUT);
    this.isVisible(UNWRAP_INPUT);
  }

  static validateSelectedTokenAndBalanceForWrapping(
    token: string,
    balance: string
  ) {
    this.hasText(SELECT_TOKEN_BUTTON, token);
    this.hasText(UNDERLYING_BALANCE, `Balance: ${balance}`);
  }
}
