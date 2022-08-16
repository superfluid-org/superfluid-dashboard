import {BasePage} from "../BasePage";

const TOKEN_BALANCE = "[data-cy=token-balance]"
const TOKEN_GRAPH = "[data-cy=token-graph]"
const LIQUIDATION_DATE = "[data-cy=liquidation-date]"
const STREAM_ROWS = "[data-cy=stream-row]"

export class IndividualTokenPage extends BasePage {

    static tokenPageIsOpen() {
        this.isVisible(LIQUIDATION_DATE)
        this.isVisible(TOKEN_GRAPH)
        this.isVisible(STREAM_ROWS)
        this.isVisible(TOKEN_BALANCE)
    }
}