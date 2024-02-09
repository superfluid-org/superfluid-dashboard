import { BasePage, UnitOfTime } from "../BasePage";
import { WrapPage } from "./WrapPage";
import { networksBySlug } from "../../superData/networks";
import {
  Common,
  CONNECT_WALLET_BUTTON,
  TOKEN_ANIMATION,
  TOKEN_BALANCE,
} from "./Common";

const SEND_BUTTON = "[data-cy=send-transaction-button]";
const RECEIVER_BUTTON = "[data-cy=address-button]";
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]";
const FLOW_RATE_INPUT = "[data-cy=flow-rate-input]";
const TIME_UNIT_SELECTION_BUTTON = "[data-cy=time-unit-selection-button]";
const AMOUNT_PER_SECOND = "[data-cy=preview-per-second]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input]";
const CLOSE_DIALOG_BUTTON = "[data-testid=CloseRoundedIcon]";
const OTHER_CLOSE_DIALOG_BUTTON = "[data-testid=CloseIcon]";
const ENS_ENTRIES = "[data-cy=ens-entry]";
const ENS_ENTRY_NAMES = "[data-cy=ens-entry] h6";
const ENS_ENTRY_ADDRESS = "[data-cy=ens-entry] p";
const RECENT_ENTRIES = "[data-cy=recents-entry]";
const RECENT_ENTRIES_ADDRESS = "[data-cy=recents-entry] h6";
const RECEIVER_CLEAR_BUTTON = "[data-testid=CloseIcon]";
const TOKEN_SEARCH_INPUT = "[data-cy=token-search-input] input";
const TOKEN_SEARCH_RESULTS = "[data-cy$=list-item]";
const RESULTS_WRAP_BUTTONS = "[data-cy=wrap-button]";
const STREAM_ENDS_ON = "[data-cy=preview-ends-on]";
const PREVIEW_AMOUNT_PER_SECOND = "[data-cy=amount-per-second]";
const PREVIEW_FLOW_RATE = "[data-cy=preview-flow-rate]";
const PREVIEW_RECEIVER = "[data-cy=preview-receiver]";
const PREVIEW_ENDS_ON = "[data-cy=preview-ends-on]";
const PREVIEW_UPFRONT_BUFFER = "[data-cy=preview-upfront-buffer]";
const BUFFER_WARNING_AMOUNT =
  "[data-cy=buffer-warning] span [data-cy=token-amount]";
const PROTECT_YOUR_BUFFER_ERROR = "[data-cy=protect-your-buffer-error]";
const RISK_CHECKBOX = "[data-cy=risk-checkbox]";
const ADDRESS_BUTTON_TEXT = "[data-cy=address-button]";
const CHOSEN_ENS_ADDRESS = "[data-cy=address-button] span p";
const TOKEN_SELECT_NAME = "[data-cy=token-symbol-and-name] p";
const TOKEN_SELECT_SYMBOL = "[data-cy=token-symbol-and-name] h6";
const TOKEN_SELECT_BALANCE = `${TOKEN_BALANCE} span`;
const BALANCE_WRAP_BUTTON = "[data-cy=balance-wrap-button]";
const PREVIEW_BALANCE = "[data-cy=balance]";
const TOKEN_NO_SEARCH_RESULTS = "[data-cy=token-search-no-results]";
const DIALOG = "[role=dialog]";
const DIALOG_CONTENT = "[data-cy=dialog-content]";
const APPROVAL_MESSAGE = "[data-cy=approval-message]";
const TX_MESSAGE_NETWORK = "[data-cy=tx-network]";
const LOADING_SPINNER = "[role=progressbar]";
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]";
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]";
const SEND_MORE_STREAMS_BUTTON = "[data-cy=send-more-streams-button]";
const GO_TO_TOKENS_PAGE_BUTTON = "[data-cy=go-to-token-page-button]";
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]";
const MODIFY_STREAM_BUTTON = "[data-cy=modify-stream-button]";
const SEND_OR_MOD_STREAM = "[data-cy=send-or-modify-stream]";
const ALL_BUTTONS = "[data-cy=send-card] [data-cy*=button]";
const PREVIEW_BUFFER_LOSS = "[data-cy=preview-buffer-loss]";
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]";
const OK_BUTTON = "[data-cy=ok-button]";
const RECEIVER_DIALOG = "[data-cy=receiver-dialog]";
const START_DATE = "[data-cy=start-date]";
const START_DATE_BORDER = `${START_DATE} fieldset`;
const END_DATE = "[data-cy=end-date]";
const END_DATE_BORDER = `${END_DATE} fieldset`;
const SCHEDULING_TOGGLE = "[data-cy=scheduling-tooltip] [type=checkbox]";
const TOTAL_STREAM_INPUT = "[data-cy=total-stream] input";
const ALLOWLIST_MESSAGE = "[data-cy=allowlist-message]";
const ALLOWLIST_LINK = "[data-cy=allowlist-link]";

export class SendPage extends BasePage {
  static searchForTokenInTokenList(token: string) {
    this.type(TOKEN_SEARCH_INPUT, token);
  }

  static validateSendPagePreviewBalance() {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let selectedValues =
        networkSpecificData.polygon.staticBalanceAccount.tokenValues[0].balance;

      this.hasText(PREVIEW_BALANCE, `${selectedValues} `);
    });
  }

  static clickBalancePreviewWrapButton() {
    this.doesNotExist(TOKEN_SEARCH_INPUT);
    this.click(BALANCE_WRAP_BUTTON);
  }

  static recentReceiversAreShown(network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      networkSpecificData[network].staticBalanceAccount.recentReceivers.forEach(
        (receiver: any, index: number) => {
          this.hasText(RECENT_ENTRIES, receiver.address, index);
        }
      );
    });
  }

  static checkIfSendContainerIsVisible() {
    this.isVisible(RECEIVER_BUTTON);
    this.isVisible(SELECT_TOKEN_BUTTON);
    this.isVisible(FLOW_RATE_INPUT);
    this.isVisible(TIME_UNIT_SELECTION_BUTTON);
  }

  static inputStreamTestData(isConnected: string) {
    const connected = isConnected === "with";
    this.click(RECEIVER_BUTTON);
    cy.fixture("commonData").then((commonData) => {
      this.type(ADDRESS_DIALOG_INPUT, commonData.staticBalanceAccount);
      this.doesNotExist(ADDRESS_DIALOG_INPUT);
      this.hasText(ADDRESS_BUTTON_TEXT, commonData.staticBalanceAccount);
      this.click(SELECT_TOKEN_BUTTON);

      if (connected) {
        //Wait for all balances to load, then open and close the menu to sort them
        cy.get(TOKEN_SEARCH_RESULTS).then((el) => {
          this.hasLength(PREVIEW_BALANCE, el.length);
        });
        this.click(`${DIALOG} ${OTHER_CLOSE_DIALOG_BUTTON}`);
        this.click(SELECT_TOKEN_BUTTON);
      } else {
        //this.doesNotExist(PREVIEW_BALANCE)
      }
      cy.get(TOKEN_SEARCH_RESULTS)
        .eq(0)
        .find(TOKEN_SELECT_SYMBOL)
        .then(($tokenSearchResultName) => {
          cy.wrap($tokenSearchResultName.text()).as("lastChosenToken");
        });
      this.clickFirstVisible(TOKEN_SEARCH_RESULTS);
      this.type(FLOW_RATE_INPUT, "1");
    });
  }

  static validateStreamEndingAndAmountPerSecond() {
    this.containsText(STREAM_ENDS_ON, "Never");
    this.containsText(AMOUNT_PER_SECOND, "0.000000380517503805");
  }

  static checkIfStreamPreviewIsCorrectWhenUserNotConnected() {
    cy.fixture("commonData").then((commonData) => {
      this.hasText(PREVIEW_RECEIVER, commonData.staticBalanceAccount);
      cy.get("@lastChosenToken").then((lastChosenToken) => {
        this.hasText(PREVIEW_FLOW_RATE, `1 ${lastChosenToken}/month`);
      });
    });
    this.hasText(PREVIEW_ENDS_ON, "Never");
  }

  static acceptRiskWarning() {
    //I hate waits
    //Please someone fix the checkbox status messing up when clicked too fast
    cy.wait(3000);
    this.click(RISK_CHECKBOX);
  }

  static checkConnectWalletButton() {
    this.isVisible(CONNECT_WALLET_BUTTON);
    this.isNotDisabled(CONNECT_WALLET_BUTTON);
    this.hasText(`main ${CONNECT_WALLET_BUTTON}`, "Connect Wallet");
  }

  static searchForReceiver(ensNameOrAddress: string, index = 0) {
    this.click(RECEIVER_BUTTON, index);
    this.type(ADDRESS_DIALOG_INPUT, ensNameOrAddress);
    cy.wrap(ensNameOrAddress).as("ensNameOrAddress");
  }

  static recipientEnsResultsContain(result: string) {
    cy.get("@ensNameOrAddress").then((ensNameOrAddress) => {
      this.hasText(ENS_ENTRY_NAMES, ensNameOrAddress);
      this.hasText(ENS_ENTRY_ADDRESS, result);
    });
  }

  static validateEnsEntry(ensName: string) {
    this.hasText(ENS_ENTRY_NAMES, ensName);
    cy.fixture("commonData").then((data) => {
      this.hasText(ENS_ENTRY_ADDRESS, data[ensName]);
    });
  }

  static selectFirstENSResult() {
    this.clickFirstVisible(ENS_ENTRIES);
  }

  static chosenReceiverAddress(chosenAddress: string) {
    this.hasText(ADDRESS_BUTTON_TEXT, chosenAddress);
  }

  static clearReceiverField() {
    this.clickFirstVisible(RECEIVER_CLEAR_BUTTON);
    this.hasText(RECEIVER_BUTTON, "Public Address, ENS or Lens");
  }

  static receiverDialog() {
    this.click(RECEIVER_BUTTON);
  }

  static closeDialog() {
    this.clickFirstVisible(CLOSE_DIALOG_BUTTON);
  }

  static receiverDialogDoesNotExist() {
    this.doesNotExist(ADDRESS_DIALOG_INPUT);
    this.doesNotExist(RECENT_ENTRIES);
    this.doesNotExist(ENS_ENTRIES);
  }

  static selectFirstRecentReceiver() {
    cy.get(RECENT_ENTRIES_ADDRESS)
      .eq(0)
      .then((el) => {
        cy.wrap(el.text()).as("lastChosenReceiver");
      });
    this.clickFirstVisible(RECENT_ENTRIES);
  }

  static correctRecentReceiverIsChosen() {
    cy.get("@lastChosenReceiver").then((lastChosenReceiver) => {
      this.hasText(ADDRESS_BUTTON_TEXT, lastChosenReceiver);
    });
  }

  static openTokenSelection() {
    this.click(SELECT_TOKEN_BUTTON);
  }

  static validateTokenBalancesInSelectionScreen(
    account: string,
    network: string
  ) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      networkSpecificData[network][account].tokenValues.forEach(
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
          let assertableBalance = Number.isInteger(parseFloat(values.balance))
            ? values.balance
            : parseFloat(values.balance).toFixed(4);
          this.scrollToAndHasText(
            specificToken + TOKEN_SELECT_BALANCE,
            `${assertableBalance} `
          );
        }
      );
    });
  }

  static verifyAllSupertokenAnimations() {
    cy.get("[data-cy*=list-item]").each((el) => {
      cy.wrap(el).find(TOKEN_ANIMATION).should("exist");
    });
  }

  static tokenSelectionWrapToken(token: string) {
    let specificToken = `[data-cy=${token}-list-item] `;
    this.click(specificToken + RESULTS_WRAP_BUTTONS);
  }

  static selectTokenForStreaming(token: string) {
    this.click(SELECT_TOKEN_BUTTON);
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(`[data-cy="${selectedToken}-list-item"]`);
    });
  }

  static nativeTokenDoesNotHaveWrapButtons(token: string) {
    let specificToken = `[data-cy=${token}-list-item] `;
    this.doesNotExist(specificToken + RESULTS_WRAP_BUTTONS);
  }

  static validateBalanceAndNoWrapButtonForNativeToken() {
    this.hasText(PREVIEW_BALANCE, "0 ");
    this.doesNotExist(BALANCE_WRAP_BUTTON);
  }

  static selectTokenFromTokenList(token: string) {
    this.click(`[data-cy=${token}-list-item]`);
  }

  static tokenSearchResultsOnlyContain(token: string) {
    cy.get(`[data-cy*=-list-item] ${TOKEN_SELECT_SYMBOL}`).each((el) => {
      cy.wrap(el).should("contain", token);
    });
  }

  static tokenSearchNoResultsMessageIsShown() {
    this.isVisible(TOKEN_NO_SEARCH_RESULTS);
    this.hasText(TOKEN_NO_SEARCH_RESULTS, "Could not find any tokens. :(");
  }

  static clearTokenSearchField() {
    this.clear(TOKEN_SEARCH_INPUT);
  }

  static changeTimeUnit(unit: string) {
    this.click(TIME_UNIT_SELECTION_BUTTON);
    cy.contains(unit).click();
  }

  static validateSortedTokensByAmount() {
    let balances: any[] = [];
    cy.get(TOKEN_BALANCE).each((balance) => {
      balances.push(parseFloat(balance.text().replace("$", "")));
    });
    cy.wrap(balances).then((array) => {
      let expectedArray = [...array].sort(function (a, b) {
        return b - a;
      });
      expect(expectedArray).to.deep.eq(array);
    });
  }

  static waitForTokenBalancesToLoad() {
    this.exists(TOKEN_ANIMATION);
    this.hasText(TOKEN_BALANCE, "0 ", 0);
  }

  static clickAddressButton() {
    this.click(RECEIVER_BUTTON);
  }

  static inputStreamDetails(
    amount: string,
    token: string,
    timeUnit: any,
    address: string
  ) {
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(RECEIVER_BUTTON);
      this.isVisible(RECENT_ENTRIES, undefined, { timeout: 30000 });
      this.type(ADDRESS_DIALOG_INPUT, address);
      cy.wait(2000);
      cy.get("body").then((body) => {
        if (body.find("[role=presentation]").length > 0) {
          body.find("[role=presentation]").click();
        }
      });
      this.doesNotExist("[role=dialog]");
      this.clear(`${FLOW_RATE_INPUT} input`);
      this.type(FLOW_RATE_INPUT, amount);
      this.click(SELECT_TOKEN_BUTTON);
      this.click(`[data-cy="${selectedToken}-list-item"]`, undefined, {
        timeout: 60000,
      });
      this.click(TIME_UNIT_SELECTION_BUTTON);
      this.click(
        `[data-value=${UnitOfTime[
          timeUnit[0].toUpperCase() + timeUnit.substring(1)
        ]!}]`
      );
      this.hasText(SELECT_TOKEN_BUTTON, selectedToken, undefined, {
        timeout: 30000,
      });
      this.isVisible(PREVIEW_UPFRONT_BUFFER, undefined, { timeout: 30000 });
      this.click(RISK_CHECKBOX);
    });
  }

  static overrideNextGasPrice() {
    if (!Cypress.env("rejected")) {
      cy.window().then((win) => {
        // @ts-ignore
        win.mockSigner.getGasPrice().then((gas) => {
          // @ts-ignore
          win.superfluid_dashboard.advanced.nextGasOverrides.gasPrice = gas
            .mul(2)
            .toString();
          // @ts-ignore
          win.superfluid_dashboard.advanced.nextGasOverrides.gasLimit =
            "1000000";
        });
      });
    }
  }

  static checkNewStreamBrodcastedDialogs() {
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(GO_TO_TOKENS_PAGE_BUTTON);
    this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`);
  }

  static goToTokensPageAfterTx() {
    this.click(GO_TO_TOKENS_PAGE_BUTTON);
  }

  static validateRestoredTransaction(
    amount: string,
    token: string,
    timeUnit: string,
    address: string,
    network: string
  ) {
    this.hasText(ADDRESS_BUTTON_TEXT, address);
    this.hasText(SELECT_TOKEN_BUTTON, token);
    this.hasValue(
      `${FLOW_RATE_INPUT} input`,
      parseFloat(amount).toFixed(1).toString()
    );
    this.hasText(`${TIME_UNIT_SELECTION_BUTTON} div`, `/ ${timeUnit}`);
    this.isVisible(`[data-cy=network-badge-${networksBySlug.get(network)?.id}`);
  }

  static cancelStreamIfStillOngoing() {
    cy.fixture("commonData").then((data) => {
      this.isVisible(PREVIEW_BUFFER_LOSS);
      cy.wait(1000);
      cy.get("body").then((body) => {
        if (body.find(CANCEL_STREAM_BUTTON).length > 0) {
          this.overrideNextGasPrice();
          this.click(CANCEL_STREAM_BUTTON);
          WrapPage.clickOkButton();
          this.isVisible(`${TX_DRAWER_BUTTON} span`);
          this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
            timeout: 60000,
          });
          this.inputStreamDetails(
            "1",
            "fDAIx",
            "month",
            data.accountWithLotsOfData
          );
          this.hasText(SEND_OR_MOD_STREAM, "Send Stream", undefined, {
            timeout: 30000,
          });
          cy.wait(2000);
          cy.get("body").then((body) => {
            if (body.find("[role=presentation]").length > 0) {
              body.find("[role=presentation]").click();
            }
          });
          this.doesNotExist("[role=dialog]");
          this.clear(`${FLOW_RATE_INPUT} input`);
          this.type(FLOW_RATE_INPUT, "1");
          this.click(RISK_CHECKBOX);
        }
      });
    });
  }

  static startOrCancelStreamIfNecessary() {
    this.isVisible(PREVIEW_BUFFER_LOSS);
    cy.fixture("commonData").then((data) => {
      cy.get("body").then((body) => {
        if (body.find(SEND_BUTTON).length === 0) {
          cy.wait(2000);
          cy.get("body").then((body) => {
            if (body.find("[role=presentation]").length > 0) {
              body.find("[role=presentation]").click();
            }
          });
          this.doesNotExist("[role=dialog]");
          this.clear(`${FLOW_RATE_INPUT} input`);
          this.type(FLOW_RATE_INPUT, "1");
          this.click(RISK_CHECKBOX);
          this.overrideNextGasPrice();
          this.clickSendButton();
          this.isVisible(GO_TO_TOKENS_PAGE_BUTTON);
          this.click(OTHER_CLOSE_DIALOG_BUTTON, -1, { timeout: 60000 });
          this.isVisible(`${TX_DRAWER_BUTTON} span`);
          this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
            timeout: 90000,
          });
          this.inputStreamDetails(
            "2",
            "fDAIx",
            "month",
            data.accountWithLotsOfData
          );
          this.hasText(SEND_OR_MOD_STREAM, "Modify Stream");
        }
        if (body.find(SEND_BUTTON).length > 0) {
          if (
            body.find("[class*=MuiAlert-root] [class*=MuiAlert-message]")
              .length > 2
          ) {
            this.overrideNextGasPrice();
            this.click(CANCEL_STREAM_BUTTON);
            WrapPage.clickOkButton();
            this.isVisible(`${TX_DRAWER_BUTTON} span`);
            this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
              timeout: 60000,
            });
            this.inputStreamDetails(
              "1",
              "fDAIx",
              "month",
              data.accountWithLotsOfData
            );
            this.hasText(SEND_OR_MOD_STREAM, "Send Stream");
            this.overrideNextGasPrice();
            this.clickSendButton();
            this.click(OTHER_CLOSE_DIALOG_BUTTON);
            this.isVisible(`${TX_DRAWER_BUTTON} span`);
            this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
              timeout: 60000,
            });
            this.inputStreamDetails(
              "2",
              "fDAIx",
              "month",
              data.accountWithLotsOfData
            );
          }
        }
      });
    });
  }

  static startOrModifyStreamAndValidateTxApprovalDialog(network: string) {
    let selectedNetwork = this.getSelectedNetwork(network);
    this.overrideNextGasPrice();
    this.isVisible(PREVIEW_UPFRONT_BUFFER);
    this.clickSendButton();
    this.isVisible(LOADING_SPINNER);
    this.exists(`${SEND_BUTTON} ${LOADING_SPINNER}`);
    this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
    this.hasText(
      TX_MESSAGE_NETWORK,
      `(${networksBySlug.get(selectedNetwork)?.name})`
    );
  }

  static validateBroadcastedDialogsAfterModifyingStream() {
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(GO_TO_TOKENS_PAGE_BUTTON);
    this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`);
  }

  static startStreamIfNecessary() {
    this.isVisible(PREVIEW_BUFFER_LOSS);
    cy.wait(2000);
    cy.fixture("commonData").then((data) => {
      cy.get("body").then((body) => {
        if (body.find(CANCEL_STREAM_BUTTON).length < 1) {
          this.overrideNextGasPrice();
          this.clickSendButton();
          this.isVisible(GO_TO_TOKENS_PAGE_BUTTON);
          this.click(OTHER_CLOSE_DIALOG_BUTTON, -1, { timeout: 60000 });
          this.isVisible(`${TX_DRAWER_BUTTON} span`);
          this.isNotVisible(`${TX_DRAWER_BUTTON} span`, undefined, {
            timeout: 60000,
          });
          this.inputStreamDetails(
            "2",
            "fDAIx",
            "month",
            data.accountWithLotsOfData
          );
          this.hasText(SEND_OR_MOD_STREAM, "Modify Stream");
        }
      });
    });
  }

  static cancelStreamAndVerifyApprovalDialogs(network: string) {
    let selectedNetwork = this.getSelectedNetwork(network);
    this.overrideNextGasPrice();
    this.isNotDisabled(CANCEL_STREAM_BUTTON, undefined, { timeout: 30000 });
    this.click(CANCEL_STREAM_BUTTON);
    this.isVisible(LOADING_SPINNER);
    this.exists(`${CANCEL_STREAM_BUTTON} ${LOADING_SPINNER}`);
    this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...");
    this.hasText(
      TX_MESSAGE_NETWORK,
      `(${networksBySlug.get(selectedNetwork)?.name})`
    );
  }

  static verifyDialogAfterBroadcastingCancelledStream() {
    this.isVisible(TX_BROADCASTED_ICON, undefined, { timeout: 60000 });
    this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted");
    this.isVisible(OK_BUTTON);
    this.doesNotExist(`${CANCEL_STREAM_BUTTON} ${LOADING_SPINNER}`);
  }

  static validateDisabledSendButton() {
    this.isDisabled(SEND_BUTTON);
  }

  static validateEthereumMainnetMinimumDeposit() {
    cy.get("@lastChosenToken").then((token) => {
      this.hasText(PREVIEW_UPFRONT_BUFFER, `69 ${token}`);
      this.hasText(BUFFER_WARNING_AMOUNT, `69 ${token}`);
    });
  }

  static clickSchedulingToggle() {
    this.click(SCHEDULING_TOGGLE);
  }

  static inputStartDate(amount: number, timeunit: string) {
    this.clear(START_DATE);
    Common.inputDateIntoField(START_DATE, amount, timeunit);
  }

  static inputEndDate(amount: number, timeunit: string) {
    this.clear(END_DATE);
    Common.inputDateIntoField(END_DATE, amount, timeunit);
  }

  static validateEndDateBorderIsRed() {
    this.hasCSS(END_DATE_BORDER, "border-color", "rgb(210, 37, 37)");
  }

  static validateStartDateBorderIsRed() {
    this.hasCSS(START_DATE_BORDER, "border-color", "rgb(210, 37, 37)");
  }

  static validateVisibleAllowlistMessage() {
    this.isVisible(ALLOWLIST_MESSAGE);
    this.containsText(ALLOWLIST_MESSAGE, "You are not on the allow list.");
    this.containsText(
      ALLOWLIST_MESSAGE,
      "If you want to set start and end dates for your streams,"
    );
    this.containsText(ALLOWLIST_LINK, "Apply for access");
    this.hasAttributeWithValue(
      ALLOWLIST_LINK,
      "href",
      "https://use.superfluid.finance/schedulestreams"
    );
  }

  static validateScheduledStreamFieldsAreVisible() {
    this.isVisible(START_DATE);
    this.isVisible(END_DATE);
    this.isVisible(TOTAL_STREAM_INPUT);
  }

  static clickSendButton() {
    cy.get(SEND_BUTTON).as("sendButton");
    this.isNotDisabled("@sendButton", undefined, { timeout: 45000 });
    this.click("@sendButton");
  }

  static validateScheduledStreamDialogs() {
    this.isVisible(DIALOG_CONTENT);
    cy.get(DIALOG_CONTENT)
      .invoke("text")
      .should("match", /You are (sending|modifying) a scheduled stream/);
  }

  static validateTotalStreamAmount(amount: string) {
    this.hasValue(TOTAL_STREAM_INPUT, amount);
  }

  static validateDisabledStartDateField() {
    this.isDisabled(`${START_DATE} input`);
  }

  static validateSetFlowRate(flowrate: string) {
    this.hasValue(`${FLOW_RATE_INPUT} input`, flowrate);
  }

  static validateStreamStartDate(date: string) {
    this.hasValue(`${START_DATE} input`, date);
  }

  static validateStreamEndDate(date: string) {
    this.hasValue(`${END_DATE} input`, date);
  }

  static isPlatformDeployedOnNetwork(fn: () => void) {
    if (
      [
        "avalanche-fuji",
        "sepolia",
        "base",
        "scroll",
        "scrsepolia",
        "opsepolia",
      ].includes(Cypress.env("network")) &&
      Cypress.env("platformNeeded")
    ) {
      cy.log(
        `Skipping the step because ${Cypress.env("network")} is not supported`
      );
      return;
    } else {
      fn();
    }
  }
}
