import {BasePage} from "../BasePage";
import shortenHex from "../../../src/utils/shortenHex";

const SEND_BUTTON = "[data-cy=send-transaction-button]";
const RECEIVER_BUTTON = "[data-cy=address-button]";
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]";
const FLOW_RATE_INPUT = "[data-cy=flow-rate-input]";
const TIME_UNIT_SELECTION_BUTTON = "[data-cy=time-unit-selection-button]";
const AMOUNT_PER_SECOND = "[data-cy=amount-per-second] input";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input]";
const CLOSE_DIALOG_BUTTON = "[data-testid=CloseIcon]";
const ENS_ENTRIES = "[data-cy=ens-entry]";
const ENS_ENTRY_NAMES = "[data-cy=ens-entry] span";
const ENS_ENTRY_ADDRESS = "[data-cy=ens-entry] p";
const RECENT_ENTRIES = "[data-cy=recents-entry]";
const RECENT_ENTRIES_ADDRESS = "[data-cy=recents-entry] span";
const RECEIVER_CLEAR_BUTTON = "[data-testid=CancelIcon]";
const TOKEN_SEARCH_INPUT = "[data-cy=token-search-input]";
const TOKEN_SEARCH_RESULTS = "[data-cy$=list-item]";
const RESULTS_WRAP_BUTTONS = "[data-cy=wrap-button]";
const STREAM_ENDS_ON = "[data-cy=ends-on] input";
const PREVIEW_AMOUNT_PER_SECOND = "[data-cy=amount-per-second]";
const PREVIEW_FLOW_RATE = "[data-cy=preview-flow-rate]";
const PREVIEW_RECEIVER = "[data-cy=preview-receiver]";
const PREVIEW_ENDS_ON = "[data-cy=preview-ends-on]";
const PREVIEW_UPFRONT_BUFFER = "[data-cy=preview-upfront-buffer]";
const PROTECT_YOUR_BUFFER_ERROR = "[data-cy=protect-your-buffer-error]";
const RISK_CHECKBOX = "[data-cy=risk-checkbox]";
const ADDRESS_BUTTON_TEXT = "[data-cy=address-button] span span";
const CHOSEN_ENS_ADDRESS = "[data-cy=address-button] span p";
const TOKEN_SELECT_NAME = "[data-cy=token-symbol-and-name] p";
const TOKEN_SELECT_SYMBOL = "[data-cy=token-symbol-and-name] span";
const TOKEN_SELECT_BALANCE = "[data-cy=token-balance] span";
const BALANCE_WRAP_BUTTON = "[data-cy=balance-wrap-button]";
const PREVIEW_BALANCE = "[data-cy=balance]";
const TOKEN_NO_SEARCH_RESULTS = "[data-cy=token-search-no-results]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet]";

export class SendPage extends BasePage {
    static searchForTokenInTokenList(token: string) {
        this.type(TOKEN_SEARCH_INPUT, token);
    }

    static validateSendPagePreviewBalance() {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            this.hasText(
                PREVIEW_BALANCE,
                parseFloat(
                    networkSpecificData.polygon.staticBalanceAccount.tokenValues[0]
                        .balance
                ).toFixed(18)
            );
        });
    }

    static clickBalancePreviewWrapButton() {
        this.click(BALANCE_WRAP_BUTTON);
    }

    static recentReceiversAreShown(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            networkSpecificData[network].staticBalanceAccount.recentReceivers.forEach(
                (receiver: any, index: number) => {
                    cy.get(RECENT_ENTRIES)
                        .eq(index)
                        .should("have.text", receiver.address);
                }
            );
        });
    }

    static checkIfSendContainerIsVisible() {
        this.isVisible(SEND_BUTTON);
        this.isVisible(RECEIVER_BUTTON);
        this.isVisible(SELECT_TOKEN_BUTTON);
        this.isVisible(FLOW_RATE_INPUT);
        this.isVisible(TIME_UNIT_SELECTION_BUTTON);
        this.isVisible(AMOUNT_PER_SECOND);
    }

    static inputStreamTestData() {
        this.click(RECEIVER_BUTTON);
        cy.fixture("commonData").then((commonData) => {
            this.type(ADDRESS_DIALOG_INPUT, commonData.staticBalanceAccount);
            this.doesNotExist(ADDRESS_DIALOG_INPUT);
            this.hasText(
                ADDRESS_BUTTON_TEXT,
                shortenHex(commonData.staticBalanceAccount)
            );
            this.click(SELECT_TOKEN_BUTTON);
            this.clickFirstVisible(TOKEN_SEARCH_RESULTS);
            cy.get(TOKEN_SEARCH_RESULTS)
                .eq(0)
                .find("[data-cy=token-symbol-and-name] span")
                .then(($tokenSearchResultName) => {
                    cy.wrap($tokenSearchResultName.text()).as("lastChosenToken");
                });
            this.type(FLOW_RATE_INPUT, "1");
        });
    }

    static validateStreamEndingAndAmountPerSecond() {
        this.hasValue(STREAM_ENDS_ON, "∞");
        this.hasValue(AMOUNT_PER_SECOND, "0.000277777777777777");
    }

    static checkIfStreamPreviewIsCorrect() {
        cy.fixture("commonData").then((commonData) => {
            this.hasText(PREVIEW_RECEIVER, commonData.staticBalanceAccount);
            cy.get("@lastChosenToken").then((lastChosenToken) => {
                this.hasText(PREVIEW_FLOW_RATE, `1.0 ${lastChosenToken}/hour`);
                //A rounding error from the dashboard? Will probably change when we do some formatting changes
                this.hasText(
                    PREVIEW_UPFRONT_BUFFER,
                    `3.9999999999999888 ${lastChosenToken}`
                );
            });
        });
        this.hasText(PREVIEW_ENDS_ON, "Never");
    }

    static acceptRiskWarning() {
        this.click(RISK_CHECKBOX);
    }

    static checkConnectWalletButton() {
        this.isVisible(CONNECT_WALLET_BUTTON);
        this.isNotDisabled(CONNECT_WALLET_BUTTON);
        this.hasText(CONNECT_WALLET_BUTTON, "Connect Wallet");
    }

    static searchForReceiver(ensNameOrAddress: string) {
        this.click(RECEIVER_BUTTON);
        this.type(ADDRESS_DIALOG_INPUT, ensNameOrAddress);
        cy.wrap(ensNameOrAddress).as("ensNameOrAddress");
    }

    static recipientEnsResultsContain(result: string) {
        cy.get("@ensNameOrAddress").then((ensNameOrAddress) => {
            this.hasText(ENS_ENTRY_NAMES, ensNameOrAddress);
            this.hasText(ENS_ENTRY_ADDRESS, result);
        });
    }

    static selectFirstENSResult() {
        this.clickFirstVisible(ENS_ENTRIES);
    }

    static chosenEnsReceiverWalletAddress(name: string, address: string) {
        this.hasText(ADDRESS_BUTTON_TEXT, name);
        this.hasText(CHOSEN_ENS_ADDRESS, shortenHex(address));
    }

    static clearReceiverField() {
        this.click(RECEIVER_CLEAR_BUTTON);
        this.hasText(RECEIVER_BUTTON, "Public Address or ENS");
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
            this.hasText(
                ADDRESS_BUTTON_TEXT,
                this.getShortenedAddress(lastChosenReceiver)
            );
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
                    this.scrollToAndhasText(
                        specificToken + TOKEN_SELECT_SYMBOL,
                        values.token
                    );
                    this.scrollToAndhasText(
                        specificToken + TOKEN_SELECT_NAME,
                        values.tokenName
                    );
                    this.scrollToAndhasText(
                        specificToken + TOKEN_SELECT_BALANCE,
                        values.balance
                    );
                }
            );
        });
    }

    static verifyAllSupertokenAnimations() {
        cy.get("[data-cy*=list-item]").each((el) => {
            cy.wrap(el).find("[data-cy=animation]").should("exist");
        });
    }

    static tokenSelectionWrapToken(token: string) {
        let specificToken = `[data-cy=${token}-list-item] `;
        this.click(specificToken + RESULTS_WRAP_BUTTONS);
    }

    static selectTokenForStreaming(token: string) {
        this.click(SELECT_TOKEN_BUTTON);
        this.click(`[data-cy=${token}-list-item]`);
    }

    static nativeTokenDoesNotHaveWrapButtons(token: string) {
        let specificToken = `[data-cy=${token}-list-item] `;
        this.doesNotExist(specificToken + RESULTS_WRAP_BUTTONS);
    }

    static validateBalanceAndNoWrapButtonForNativeToken() {
        this.hasText(PREVIEW_BALANCE, "0");
        this.doesNotExist(BALANCE_WRAP_BUTTON);
    }

    static selectTokenFromTokenList(token: string) {
        this.click(`[data-cy=${token}-list-item]`);
    }

    static tokenSearchResultsOnlyContain(token: string) {
        cy.get("[data-cy*=-list-item] [data-cy=token-symbol-and-name] span").each(
            (el) => {
                cy.wrap(el).should("contain", token);
            }
        );
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
        cy.get("[data-cy=token-balance]").each((balance) => {
            balances.push(balance.text().replace("$", ""));
        });
        cy.wrap(balances).then((array) => {
            let expectedArray = [...array].sort((a, b) => a - b);
            expect(expectedArray).to.deep.eq(array);
        });
    }

    static waitForTokenBalancesToLoad() {
        this.exists("[data-cy=animation]");
        cy.get("[data-cy=token-balance]").eq(0).should("have.text", "0");
    }
}
