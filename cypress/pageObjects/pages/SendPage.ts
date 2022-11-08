import {BasePage} from "../BasePage";
import {UnitOfTime} from "../../../src/features/send/FlowRateInput";
import {WrapPage} from "./WrapPage";
import {networksBySlug} from "../../../src/features/network/networks";

const SEND_BUTTON = "[data-cy=send-transaction-button]";
const RECEIVER_BUTTON = "[data-cy=address-button]";
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]";
const FLOW_RATE_INPUT = "[data-cy=flow-rate-input]";
const TIME_UNIT_SELECTION_BUTTON = "[data-cy=time-unit-selection-button]";
const AMOUNT_PER_SECOND = "[data-cy=preview-per-second]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input]";
const CLOSE_DIALOG_BUTTON = "[data-testid=CloseIcon]";
const ENS_ENTRIES = "[data-cy=ens-entry]";
const ENS_ENTRY_NAMES = "[data-cy=ens-entry] span";
const ENS_ENTRY_ADDRESS = "[data-cy=ens-entry] p";
const RECENT_ENTRIES = "[data-cy=recents-entry]";
const RECENT_ENTRIES_ADDRESS = "[data-cy=recents-entry] span";
const RECEIVER_CLEAR_BUTTON = "[data-testid=CloseIcon]";
const TOKEN_SEARCH_INPUT = "[data-cy=token-search-input]";
const TOKEN_SEARCH_RESULTS = "[data-cy$=list-item]";
const RESULTS_WRAP_BUTTONS = "[data-cy=wrap-button]";
const STREAM_ENDS_ON = "[data-cy=preview-ends-on]";
const PREVIEW_AMOUNT_PER_SECOND = "[data-cy=amount-per-second]";
const PREVIEW_FLOW_RATE = "[data-cy=preview-flow-rate]";
const PREVIEW_RECEIVER = "[data-cy=preview-receiver]";
const PREVIEW_ENDS_ON = "[data-cy=preview-ends-on]";
const PREVIEW_UPFRONT_BUFFER = "[data-cy=preview-upfront-buffer]";
const PROTECT_YOUR_BUFFER_ERROR = "[data-cy=protect-your-buffer-error]";
const RISK_CHECKBOX = "[data-cy=risk-checkbox]";
const ADDRESS_BUTTON_TEXT = "[data-cy=address-button]";
const CHOSEN_ENS_ADDRESS = "[data-cy=address-button] span p";
const TOKEN_SELECT_NAME = "[data-cy=token-symbol-and-name] p";
const TOKEN_SELECT_SYMBOL = "[data-cy=token-symbol-and-name] h6";
const TOKEN_SELECT_BALANCE = "[data-cy=token-balance] span";
const BALANCE_WRAP_BUTTON = "[data-cy=balance-wrap-button]";
const PREVIEW_BALANCE = "[data-cy=balance]";
const TOKEN_NO_SEARCH_RESULTS = "[data-cy=token-search-no-results]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet]";
const DIALOG = "[role=dialog]"
const APPROVAL_MESSAGE = "[data-cy=approval-message]"
const TX_MESSAGE_NETWORK = "[data-cy=tx-network]"
const LOADING_SPINNER = "[role=progressbar]"
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]"
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]"
const SEND_MORE_STREAMS_BUTTON = "[data-cy=send-more-streams-button]"
const GO_TO_TOKENS_PAGE_BUTTON = "[data-cy=go-to-token-page-button]"
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]"
const MODIFY_STREAM_BUTTON = "[data-cy=modify-stream-button]"
const SEND_OR_MOD_STREAM = "[data-cy=send-or-modify-stream]"
const ALL_BUTTONS = "[data-cy=send-card] [data-cy*=button]"
const PREVIEW_BUFFER_LOSS = "[data-cy=buffer-loss]"
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]"
const OK_BUTTON = "[data-cy=ok-button]"
const RECENTS_LOADING = "[data-cy=recents-loading]"
const RECEIVER_DIALOG = "[data-cy=receiver-dialog]"
const SCHEDULING_TOGGLE = "[data-cy=scheduling-toggle] span"
const SCHEDULING_TOOLTIP = "[data-cy=scheduling-tooltip] svg"
const SCHEDULING_END_DATE = "[data-cy=scheduling-end-date-input] input"
const SCHEDULING_TOKEN_AMOUNT = "[data-cy=scheduling-token-amount-input] input"
const TRANSACTION_TYPE_MESSAGE = "[data-cy=transaction-type-message]"
const TRANSACTION_SUBTITLES = "[data-cy=transaction-subtitles] span"

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
    }

    static inputStreamTestData(isConnected: string) {
        const connected = isConnected === "with"
        this.click(RECEIVER_BUTTON);
        cy.fixture("commonData").then((commonData) => {
            this.type(ADDRESS_DIALOG_INPUT, commonData.staticBalanceAccount);
            this.doesNotExist(ADDRESS_DIALOG_INPUT);
            this.hasText(
                ADDRESS_BUTTON_TEXT,
                commonData.staticBalanceAccount
            );
            this.click(SELECT_TOKEN_BUTTON);

            if (connected) {
                //Wait for all balances to load, then open and close the menu to sort them
                cy.get(TOKEN_SEARCH_RESULTS).then(el => {
                    this.hasLength(PREVIEW_BALANCE, el.length)
                })
                this.click(`${DIALOG} ${CLOSE_DIALOG_BUTTON}`)
                this.click(SELECT_TOKEN_BUTTON)
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
        this.containsText(AMOUNT_PER_SECOND, "0.000000385802469135");
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

    static chosenReceiverAddress(chosenAddress: string) {
        this.hasText(ADDRESS_BUTTON_TEXT, chosenAddress);
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
                lastChosenReceiver
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
        cy.get(`[data-cy*=-list-item] ${TOKEN_SELECT_SYMBOL}`).each(
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
            balances.push(parseFloat(balance.text().replace("$", "")));
        });
        cy.wrap(balances).then((array) => {
            let expectedArray = [...array].sort(function (a, b) {
                return b - a
            });
            expect(expectedArray).to.deep.eq(array);
        });
    }

    static waitForTokenBalancesToLoad() {
        this.exists("[data-cy=animation]");
        cy.get("[data-cy=token-balance]").eq(0).should("have.text", "0 ");
    }

    static clickAddressButton() {
        this.click(RECEIVER_BUTTON)
    }

    static inputStreamDetails(amount: string, token: string, timeUnit: any, address: string) {
        this.click(RECEIVER_BUTTON);
        //Sometimes typing the address doesn't pick up it as a receiver , so re-typing to make sure it tries again
        this.type(ADDRESS_DIALOG_INPUT, address);
        cy.get("body").then( el => {
           if(el.find(RECEIVER_DIALOG).length < 1 ) {
               this.clear(ADDRESS_DIALOG_INPUT)
               this.type(ADDRESS_DIALOG_INPUT,address)
           }
        })
        this.click(SELECT_TOKEN_BUTTON);
        cy.get(`[data-cy=${token}-list-item]`, {timeout: 60000}).click()
        this.type(FLOW_RATE_INPUT, amount);
        this.click(TIME_UNIT_SELECTION_BUTTON)
        this.click(`[data-value=${UnitOfTime[timeUnit[0].toUpperCase() + timeUnit.substring(1)]!}]`)
        this.click(RISK_CHECKBOX)
    }

    static startStreamAndCheckDialogs(network: string) {
        this.sendStreamAndValidateCommonElements(network)
        this.isVisible(SEND_MORE_STREAMS_BUTTON)
        this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
        this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`)
    }

    static goToTokensPageAfterTx() {
        this.click(GO_TO_TOKENS_PAGE_BUTTON)
    }

    static validateRestoredTransaction(amount: string, token: string, timeUnit: string, address: string, network: string) {
        this.hasText(ADDRESS_BUTTON_TEXT, address)
        this.hasText(SELECT_TOKEN_BUTTON, token)
        this.hasValue(`${FLOW_RATE_INPUT} input`, parseFloat(amount).toFixed(1).toString())
        this.hasText(`${TIME_UNIT_SELECTION_BUTTON} div`, `/ ${timeUnit}`)
        this.isVisible(`[data-cy=network-badge-${networksBySlug.get(network)?.id}`)
    }

    static cancelStreamIfStillOngoing() {
        cy.fixture("commonData").then(data => {
            this.isVisible(PREVIEW_BUFFER_LOSS)
            cy.get("body").then(body => {
                if (body.find(CANCEL_STREAM_BUTTON).length > 0) {
                    this.click(CANCEL_STREAM_BUTTON)
                    WrapPage.clickOkButton()
                    this.inputStreamDetails("1", "fDAIx", "month", data.accountWithLotsOfData)
                    cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 90000}).should("not.be.visible")
                    this.hasText(SEND_OR_MOD_STREAM, "Send Stream")
                    //Working around the apps dirty bugs
                    this.clear(FLOW_RATE_INPUT)
                    this.type(FLOW_RATE_INPUT, "1")
                    this.click(RISK_CHECKBOX)
                }
            })
        })
    }

    static startOrCancelStreamIfNecessary() {
        this.isVisible(PREVIEW_BUFFER_LOSS)
        cy.fixture("commonData").then(data => {
        cy.get("body").then(body => {
            if (body.find(SEND_BUTTON).length > 0) {
                this.clear(FLOW_RATE_INPUT)
                this.type(FLOW_RATE_INPUT, "1")
                this.click(RISK_CHECKBOX)
                this.click(SEND_BUTTON)
                this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
                cy.get(CLOSE_DIALOG_BUTTON, {timeout: 60000}).last().click()
                this.inputStreamDetails("2", "fDAIx", "month", data.accountWithLotsOfData)
                cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                this.hasText(SEND_OR_MOD_STREAM, "Modify Stream")
                //There should be a workaround here but the app won't throw the "same flowrate" error
            }
            if (body.find(SEND_BUTTON).length > 0) {
                if (body.find("[class*=MuiAlert-root] [class*=MuiAlert-message]").length > 2) {
                    this.click(CANCEL_STREAM_BUTTON)
                    WrapPage.clickOkButton()
                    this.inputStreamDetails("1", "fDAIx", "month", data.accountWithLotsOfData)
                    cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                    this.hasText(SEND_OR_MOD_STREAM, "Send Stream")
                    this.click(SEND_BUTTON)
                    this.click(CLOSE_DIALOG_BUTTON)
                    this.inputStreamDetails("2", "fDAIx", "month", data.accountWithLotsOfData)
                    cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                }
            }
        })
        })
    }

    static modifyStreamAndValidateDialogs(network: string) {
        this.sendStreamAndValidateCommonElements(network)
        this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
        this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`)
    }

    static startStreamIfNecessary() {
        this.isVisible(PREVIEW_BUFFER_LOSS)
        cy.fixture("commonData").then(data => {
        cy.get("body").then(body => {
            if (body.find(SEND_BUTTON).length > 0) {
                this.click(SEND_BUTTON)
                this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
                cy.get(CLOSE_DIALOG_BUTTON, {timeout: 60000}).last().click()
                this.inputStreamDetails("2", "fDAIx", "month",data.accountWithLotsOfData)
                cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                this.hasText(SEND_OR_MOD_STREAM, "Modify Stream")
            }
        })
        })
    }

    static cancelStreamAndVerifyDialogs(network: string) {
        this.isNotDisabled(CANCEL_STREAM_BUTTON)
        this.click(CANCEL_STREAM_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${CANCEL_STREAM_BUTTON} ${LOADING_SPINNER}`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`)
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
        this.isVisible(OK_BUTTON)
        this.doesNotExist(`${CANCEL_STREAM_BUTTON} ${LOADING_SPINNER}`)
    }

    static inputStreamScheduleDateInFuture(minutes: number) {
        let currentTime = new Date()
        let timeInFuture = new Date(currentTime.getTime() + (minutes * 60 * 1000))
        let inputString = `${timeInFuture.getMonth() + 1}${timeInFuture.getDate()}${timeInFuture.getFullYear()}${timeInFuture.getHours()}${timeInFuture.getMinutes()}`
        cy.wrap(inputString).as("scheduledTime")
        this.click(SCHEDULING_TOGGLE)
        this.type(SCHEDULING_END_DATE, inputString)
    }

    static sendStreamAndValidateCommonElements(network:string , message?:string) {
        this.isNotDisabled(SEND_BUTTON)
        this.click(SEND_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${SEND_BUTTON} ${LOADING_SPINNER}`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`)
        if(message) {
            this.hasText(TRANSACTION_TYPE_MESSAGE,message)
        }
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
    }

    static scheduleStreamAndVerifyDialogs(network: string) {
        this.sendStreamAndValidateCommonElements(network,"You are sending a closed-ended stream.")
        this.isVisible(SEND_MORE_STREAMS_BUTTON)
        this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`)
        this.click(SEND_MORE_STREAMS_BUTTON)
    }

    static validateRestoredScheduledDate() {
        this.isVisible(SCHEDULING_END_DATE)
        cy.get("@scheduledTime").then(date => {
            cy.get(SCHEDULING_END_DATE).then( el => {
                cy.wrap(el.val()!.toString().replace(/(\/)|(:)|( )/g ,"")).should("eq",date)
            })
        })
    }

    static modifyScheduledStreamAndVerifyDialogs(network: string) {
            this.sendStreamAndValidateCommonElements(network,"You are modifying a closed-ended stream.")
            this.isVisible(SEND_MORE_STREAMS_BUTTON)
            this.doesNotExist(`${SEND_BUTTON} ${LOADING_SPINNER}`)
            this.click(SEND_MORE_STREAMS_BUTTON)
    }
}
