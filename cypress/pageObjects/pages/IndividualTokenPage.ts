import {BasePage} from "../BasePage";
import shortenHex from "../../../src/utils/shortenHex";
import { format } from "date-fns";

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

export class IndividualTokenPage extends BasePage {

    static tokenPageIsOpen() {
        this.isVisible(LIQUIDATION_DATE)
        this.isVisible(TOKEN_GRAPH)
        this.isVisible(STREAM_ROWS)
        this.isVisible(TOKEN_BALANCE)
    }

    static validateStreamTableFirstRowValues(address: string, sendOrReceive: string,ongoing:string ,amount: string, fromTo: string) {
        cy.get(`${STREAM_ROWS} ${SENDER_RECEIVER_ADDRESSES}`).first().should("have.text",shortenHex(address))
        let plusOrMinus;
        if (sendOrReceive === "receiving" ) {
            plusOrMinus = "-"
            cy.get(STREAM_ROWS).first().find(SENDING_ICON).should("be.visible")
        } else {
            plusOrMinus = "+"
            cy.get(STREAM_ROWS).first().find(RECEIVING_ICON).should("be.visible")
        }
        let flowRateString = parseInt(amount) > 0 ? `${plusOrMinus + amount}/mo` : "-"
        cy.get(`${STREAM_ROWS} ${STREAM_FLOW_RATES}`).first({timeout:60000}).should("have.text", flowRateString)
        let fromToDate = fromTo === "now" ? format((Date.now()), "d MMM. yyyy") : format(parseInt(fromTo) * 1000, "d MMM. yyyy")
        cy.get(`${STREAM_ROWS} ${START_END_DATES}`).first().should("have.text",fromToDate)
    }

    static validateFirstRowPendingMessage(message:string) {
        cy.get(STREAM_ROWS).first({timeout:60000}).find(PENDING_MESSAGE).should("have.text",message)
    }

    static validateNoPendingStatusForFirstRow() {
        cy.get(STREAM_ROWS).first({timeout:60000}).find(PENDING_MESSAGE).should("not.exist")
    }
}