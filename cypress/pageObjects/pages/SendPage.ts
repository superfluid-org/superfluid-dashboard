import {BasePage} from "../BasePage";
import shortenAddress from "../../../src/utils/shortenAddress";

const SEND_BUTTON = "[data-cy=send-transaction-button]"
const RECEIVER_BUTTON = "[data-cy=address-button]"
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]"
const FLOW_RATE_INPUT = "[data-cy=flow-rate-input]"
const TIME_UNIT_SELECTION_BUTTON = "[data-cy=time-unit-selection-button]";
const AMOUNT_PER_SECOND = "[data-cy=amount-per-second] input";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input]";
const CLOSE_DIALOG_BUTTON = "[data-testid=CloseIcon]";
const ENS_ENTRIES = "[data-cy=ens-entry]";
const ENS_ENTRY_NAMES = "[data-cy=ens-entry] span";
const ENS_ENTRY_ADDRESS = "[data-cy=ens-entry] p";
const RECENT_ENTRIES = "[data-cy=recent-entry]";
const RECENT_ENTRY_NAMES = "[data-cy=recent-entry] span";
const RECENT_ENTRY_ADDRESS = "[data-cy=recent-entry] p";
const RECEIVER_CLEAR_BUTTON = "[data-testid=CancelIcon]";
const TOKEN_SEARCH_INPUT = "[data-cy=token-search-input]";
const TOKEN_SEARCH_RESULTS = "[data-cy$=list-item]";
const SPECIFIC_TOKEN_RESULT = ["[data-cy=","-list-item]"]
const SPECIFIC_SEARCH_RESULT_NAME = ["[data-cy=","-list-item] [data-cy=token-symbol-and-name] p"]
const SPECIFIC_SEARCH_RESULT_SYMBOL = ["[data-cy=","-list-item] [data-cy=token-symbol-and-name] span"]
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


export class SendPage extends BasePage {

    static checkIfSendContainerIsVisible() {
        this.isVisible(SEND_BUTTON)
        this.isVisible(RECEIVER_BUTTON)
        this.isVisible(SELECT_TOKEN_BUTTON)
        this.isVisible(FLOW_RATE_INPUT)
        this.isVisible(TIME_UNIT_SELECTION_BUTTON)
        this.isVisible(AMOUNT_PER_SECOND)
    }



    static inputStreamTestData() {
        this.click(RECEIVER_BUTTON)
        cy.fixture("commonData").then(commonData => {
            this.type(ADDRESS_DIALOG_INPUT, commonData.staticBalanceAccount)
            this.doesNotExist(ADDRESS_DIALOG_INPUT)
            this.hasText(ADDRESS_BUTTON_TEXT, shortenAddress(commonData.staticBalanceAccount))
            this.click(SELECT_TOKEN_BUTTON)
            this.clickFirstVisible(TOKEN_SEARCH_RESULTS)
            cy.get(TOKEN_SEARCH_RESULTS).eq(0).find("[data-cy=token-symbol-and-name] span").then(($tokenSearchResultName) => {
                    cy.wrap($tokenSearchResultName.text()).as("lastChosenToken")
            })
            this.type(FLOW_RATE_INPUT, "1")
        })
    }

    static validateStreamEndingAndAmountPerSecond() {
        this.hasValue(STREAM_ENDS_ON, "∞")
        this.hasValue(AMOUNT_PER_SECOND, "0.000277777777777777")
    }

    static checkIfStreamPreviewIsCorrect() {
        cy.fixture("commonData").then(commonData => {
            this.hasText(PREVIEW_RECEIVER, commonData.staticBalanceAccount)
            cy.get("@lastChosenToken").then(lastChosenToken => {
                this.hasText(PREVIEW_FLOW_RATE, "1.0 " + lastChosenToken + "/hour")
                //A rounding error from the dashboard? Will probably change when we do some formatting changes
                this.hasText(PREVIEW_UPFRONT_BUFFER, "3.9999999999999888 " + lastChosenToken)
            })
        })
        this.hasText(PREVIEW_ENDS_ON, "Never")

    }

    static acceptRiskWarning() {
        this.click(RISK_CHECKBOX)
    }

    static checkConnectWalletButton() {
        this.hasText(SEND_BUTTON, "Connect Wallet")
        this.isNotDisabled(SEND_BUTTON)
    }

    static searchForReceiver(ensNameOrAddress: string) {
        this.click(RECEIVER_BUTTON)
        this.type(ADDRESS_DIALOG_INPUT, ensNameOrAddress)
        cy.wrap(ensNameOrAddress).as("ensNameOrAddress")
    }

    static recipientEnsResultsContain(result: string) {
        cy.get("@ensNameOrAddress").then(ensNameOrAddress => {
            this.hasText(ENS_ENTRY_NAMES, ensNameOrAddress)
            this.hasText(ENS_ENTRY_ADDRESS, result)
        })
    }

    static selectFirstENSResult() {
        this.clickFirstVisible(ENS_ENTRIES)
    }

    static chosenEnsReceiverWalletAddress(name: string, address: string) {
        this.hasText(ADDRESS_BUTTON_TEXT, name)
        this.hasText(CHOSEN_ENS_ADDRESS, shortenAddress(address))
    }

    static clearReceiverField() {
        this.click(RECEIVER_CLEAR_BUTTON)
        this.hasText(RECEIVER_BUTTON,"Public Address or ENS")
    }
}