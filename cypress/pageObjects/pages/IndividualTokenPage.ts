import {BasePage} from "../BasePage";
import shortenHex from "../../../src/utils/shortenHex";
import {format} from "date-fns";
import {networksBySlug} from "../../../src/features/network/networks";

const TOKEN_BALANCE = "[data-cy=token-balance]"
const TOKEN_GRAPH = "[data-cy=token-graph]"
const LIQUIDATION_DATE = "[data-cy=liquidation-date]"
const STREAM_ROWS = "[data-cy=stream-row]"
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]";
const STREAM_FLOW_RATES = "[data-cy=flow-rate]";
const START_END_DATES = "[data-cy=start-end-date]";
const CANCEL_BUTTONS = "[data-cy=cancel-button]";
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]";
const TOOLTIPS = "[role=tooltip]";
const RECEIVING_ICON = "[data-testid=ArrowBackIcon]"
const SENDING_ICON = "[data-testid=ArrowForwardIcon]"
const INFINITY_ICON = "[data-testid=AllInclusiveIcon]"
const PENDING_MESSAGE = "[data-cy=pending-message]"
const DISTRIBUTIONS_TAB = "[data-cy=distribution-tab]"
const STREAMS_TAB = "[data-cy=streams-tab]"
const TRANSFERS_TAB = "[data-cy=transfers-tab]"
const APPROVE_SUBSCRIPTION_MESSAGE = "[data-cy=approve-index-message]"
const REVOKE_MESSAGE = "[data-cy=revoke-message]"
const PUBLISHERS = "[data-cy=publisher]"
const AMOUNT_RECEIVED = "[data-cy=amount-received]"
const STATUS = "[data-cy=status]"
const LAST_UPDATED_AT = "[data-cy=last-updated-at]"
const APPROVE_BUTTON = "[data-cy=approve-button]"
const REVOKE_BUTTON = "[data-cy=revoke-button]"
const DISTRIBUTION_ROWS = "[data-cy=distribution-row]"
const APPROVAL_MESSAGE = "[data-cy=approval-message]"
const TX_MESSAGE_NETWORK = "[data-cy=tx-network]"
const LOADING_SPINNER = "[role=progressbar]"
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]"
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]"
const OK_BUTTON = "[data-cy=ok-button]"
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]"
const DIST_TABLE_ALL_TAB = "[data-cy=all-tab]"
const DIST_TABLE_APPROVED_TAB = "[data-cy=approved-tab]"
const DIST_TABLE_UNAPPROVED_TAB = "[data-cy=unapproved-tab]"
const NO_DATA_ROW = "[data-cy=no-data-row]"
const NO_DATA_MESSAGE = "[data-cy=no-data-message]"

export class IndividualTokenPage extends BasePage {

    static tokenPageIsOpen() {
        this.isVisible(LIQUIDATION_DATE)
        this.isVisible(TOKEN_GRAPH)
        this.isVisible(STREAM_ROWS)
        this.isVisible(TOKEN_BALANCE)
    }

    static validateStreamTableFirstRowValues(address: string, sendOrReceive: string, ongoing: string, amount: string, fromTo: string) {
        cy.get(`${STREAM_ROWS} ${SENDER_RECEIVER_ADDRESSES}`).first().should("have.text", shortenHex(address))
        let plusOrMinus;
        if (sendOrReceive === "receiving") {
            plusOrMinus = "-"
            cy.get(STREAM_ROWS).first().find(SENDING_ICON).should("be.visible")
        } else {
            plusOrMinus = "+"
            cy.get(STREAM_ROWS).first().find(RECEIVING_ICON).should("be.visible")
        }
        let flowRateString = parseInt(amount) > 0 ? `${plusOrMinus + amount}/mo` : "-"
        cy.get(`${STREAM_ROWS} ${STREAM_FLOW_RATES}`).first({timeout: 60000}).should("have.text", flowRateString)
        let fromToDate = fromTo === "now" ? format((Date.now()), "d MMM. yyyy") : format(parseInt(fromTo) * 1000, "d MMM. yyyy")
        cy.get(`${STREAM_ROWS} ${START_END_DATES}`).first().should("contain.text",  fromToDate)
    }

    static validateFirstStreamRowPendingMessage(message: string) {
        cy.get(STREAM_ROWS).first({timeout: 60000}).find(PENDING_MESSAGE).should("have.text", message)
    }

    static validateFirstDistributionRowPendingMessage(message: string) {
        cy.get(DISTRIBUTION_ROWS).first({timeout: 60000}).find(PENDING_MESSAGE).should("have.text", message)
    }

    static validateNoPendingStatusForFirstStreamRow() {
        cy.get(STREAM_ROWS).first().find(PENDING_MESSAGE, {timeout: 60000}).should("not.exist")
    }

    static validateNoPendingStatusForFirstDistributionsRow() {
        cy.get(DISTRIBUTION_ROWS).first().find(PENDING_MESSAGE, {timeout: 60000}).should("not.exist")
    }

    static openDistributionTab() {
        this.click(DISTRIBUTIONS_TAB)
    }

    static validateLastDistributionRow(address: string, amount: string, status: string, when: string) {
        cy.get(PUBLISHERS).first().should("have.text", shortenHex(address))
        cy.get(AMOUNT_RECEIVED).first().should("have.text", amount)
        cy.get(STATUS).first().should("have.text", status)
        let fromToDate = when === "now" ? format((Date.now()), "d MMM. yyyy") : format(parseInt(when) * 1000, "d MMM. yyyy")
        cy.get(LAST_UPDATED_AT).first().should("have.text", fromToDate)
    }

    static approveLastIndex() {
        this.clickFirstVisible(APPROVE_BUTTON)
    }

    static validateLastDistRowHasRevokeButton() {
        cy.get(DISTRIBUTION_ROWS).first().find(REVOKE_BUTTON).should("be.visible")
    }

    static validateApprovalDialogAndCloseIt(network: string) {
        this.doesNotExist(APPROVE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${DISTRIBUTION_ROWS} ${LOADING_SPINNER}`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(APPROVE_SUBSCRIPTION_MESSAGE, "You are approving an index subscription.")
        this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`)
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
        this.isVisible(OK_BUTTON)
        this.click(OK_BUTTON)
    }

    static validateRevokeDialogAndCloseIt(network: string) {
        this.doesNotExist(REVOKE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${DISTRIBUTION_ROWS} ${LOADING_SPINNER}`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(REVOKE_MESSAGE, "You are revoking approval of an index subscription.")
        this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`)
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
        this.isVisible(OK_BUTTON)
        this.click(OK_BUTTON)
    }

    static revokeLastIndex() {
        this.click(REVOKE_BUTTON)
    }

    static validateLastDistRowHasApproveButton() {
        cy.get(DISTRIBUTION_ROWS).first().find(APPROVE_BUTTON).should("be.visible")
    }

    static revokeLastIndexIfNeeded() {
        this.isVisible(PUBLISHERS)
        cy.get("body").then(body => {
            if (body.find(REVOKE_BUTTON).length > 0) {
                this.click(REVOKE_BUTTON)
                cy.get(OK_BUTTON, {timeout: 45000}).should("be.visible").click()
                cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                cy.get(STATUS, {timeout: 60000}).should("have.text", "Awaiting Approval")
            }
        })
    }

    static approveLastIndexIfNeeded() {
        this.isVisible(PUBLISHERS)
        cy.get("body").then(body => {
            if (body.find(APPROVE_BUTTON).length > 0) {
                this.click(APPROVE_BUTTON)
                cy.get(OK_BUTTON, {timeout: 45000}).should("be.visible").click()
                cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                cy.get(STATUS, {timeout: 60000}).should("have.text", "Approved")
            }
        })
    }

    static validateDistributionTableTabAmounts(total: string, approved: string, unapproved: string) {
        this.hasText(DIST_TABLE_ALL_TAB,`All  (${total})`)
        this.hasText(DIST_TABLE_APPROVED_TAB,`Approved  (${approved})`)
        this.hasText(DIST_TABLE_UNAPPROVED_TAB,`Unapproved  (${unapproved})`)
    }

    static openApprovedDistributionTab() {
        this.click(DIST_TABLE_APPROVED_TAB)
    }

    static openUnapprovedDistributionTab() {
        this.click(DIST_TABLE_UNAPPROVED_TAB)
    }

    static validateNoRowsShown() {
        this.isVisible(NO_DATA_ROW)
        this.hasText(NO_DATA_MESSAGE,"No data")
        this.doesNotExist(STREAM_ROWS)
        this.doesNotExist(DISTRIBUTION_ROWS)
    }
}