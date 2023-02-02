import {BasePage,wordTimeUnitMap} from "../BasePage";
import { format } from "date-fns";
import {SendPage} from "./SendPage";

const NO_CREATED_TITLE = "[data-cy=no-created-schedules-title]"
const NO_CREATED_DESC = "[data-cy=no-created-schedules-description]"
const NO_RECEIVED_TITLE = "[data-cy=no-received-schedules-title]"
const NO_RECEIVED_DESC = "[data-cy=no-received-schedules-description]"
const CREATED_TABLE = "[data-cy=created-table]"
const RECEIVED_TABLE = "[data-cy=received-table]"
const FORM_ERROR = ".MuiAlert-message"
const CREATE_VESTING_SCHEDULE_BUTTON = "[data-cy=create-schedule-button]"
const PREVIEW_SCHEDULE_BUTTON = "[data-cy=preview-schedule-button]"
const DATE_INPUT = "[data-cy=date-input] input"
const CLIFF_AMOUNT_INPUT = "[data-cy=cliff-amount-input] input"
const CLIFF_PERIOD_INPUT = "[data-cy=cliff-period-input] input"
const CLIFF_PERIOD_UNIT = "[data-cy=cliff-period-unit]"
const CLIFF_PERIOD_SELECTED_UNIT = `${CLIFF_PERIOD_UNIT} div`
const TOTAL_AMOUNT_INPUT = "[data-cy=total-amount-input] input"
const TOTAL_PERIOD_INPUT = "[data-cy=total-period-input] input"
const TOTAL_PERIOD_UNIT = "[data-cy=total-period-unit]"
const TOTAL_PERIOD_SELECTED_UNIT = `${TOTAL_PERIOD_UNIT} div`
const LOADING_SKELETONS = "[class*=MuiSkeleton]"
const DELETE_SCHEDULE_BUTTON = "[data-cy=delete-schedule-button]"
const CHANGE_NETWORK_BUTTON = "[data-cy=change-network-button]"
const FORWARD_BUTTON = "[data-testid=ArrowForwardIcon]"
const BACK_BUTTON = "[data-testid=ArrowBackIcon]"
const VESTING_ROWS = "[data-cy=vesting-row]"
const OK_BUTTON = "[data-cy=ok-button]"
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]"
const GRAPH_CLIFF_DATE = "[data-cy=graph-cliff-date]"
const GRAPH_START_DATE = "[data-cy=graph-start-date]"
const GRAPH_END_DATE = "[data-cy=graph-end-date]"
const CREATE_SCHEDULE_TX_BUTTON = "[data-cy=create-schedule-tx-button]"
const PREVIEW_RECEIVER = "[data-cy=preview-receiver]"
const PREVIEW_START_DATE = "[data-cy=preview-start-date]"
const PREVIEW_CLIFF_AMOUNT = "[data-cy=preview-cliff-amount]"
const PREVIEW_CLIFF_PERIOD = "[data-cy=preview-cliff-period]"
const PREVIEW_TOTAL_AMOUNT = "[data-cy=preview-total-amount]"
const PREVIEW_TOTAL_PERIOD = "[data-cy=preview-total-period]"
const APPROVAL_MESSAGE = "[data-cy=approval-message]"
const TABLE_TOTAL_AMOUNTS = "[data-cy=total-vesting-amount]"
const TABLE_CLIFF_AMOUNT = "[data-cy=cliff-amount-and-date] h6"
const TABLE_CLIFF_DATE = "[data-cy=cliff-amount-and-date] p"
const TABLE_START_END_DATES = "[data-cy=start-end-dates]"
const TABLE_RECEIVER_SENDER = "[data-cy=receiver-sender]"
const PENDING_MESSAGE = "[data-cy=pending-message]"

//Strings
const NO_CREATED_TITLE_STRING = "No Sent Vesting Schedules"
const NO_CREATED_DESC_STRING = "Vesting schedules that you have created will appear here."
const NO_RECEIVED_TITLE_STRING = "No Received Vesting Schedules"
const NO_RECEIVED_DESC_STRING = "Vesting schedules that you have received will appear here."

//Dates for the vesting previews etc.
let staticStartDate = new Date(1733994660000)
let staticCliffDate = new Date(1765530660000)
let staticEndDate = new Date(1797066660000)
let currentTime = new Date()
let startDate = new Date(currentTime.getTime() + (wordTimeUnitMap["year"] * 1000) )
let cliffDate = new Date(startDate.getTime() + (wordTimeUnitMap["year"] * 1000))
let endDate = new Date(startDate.getTime() + 2 * (wordTimeUnitMap["year"] * 1000))

export class VestingPage extends BasePage {
    static validateFirstRowPendingStatus(status: string) {
        cy.get(VESTING_ROWS).first().find(PENDING_MESSAGE,{timeout: 60000}).should("have.text" , status)
    }

    static validateNoReceivedVestingScheduleMessage() {
        this.hasText(NO_RECEIVED_DESC,NO_RECEIVED_DESC_STRING)
        this.hasText(NO_RECEIVED_TITLE,NO_RECEIVED_TITLE_STRING)
        this.doesNotExist(RECEIVED_TABLE)
    }

    static validateNoCreatedVestingScheduleMessage() {
        this.hasText(NO_CREATED_DESC,NO_CREATED_DESC_STRING)
        this.hasText(NO_CREATED_TITLE,NO_CREATED_TITLE_STRING)
        this.doesNotExist(CREATED_TABLE)
    }

    static createNewVestingSchedule() {
        SendPage.overrideNextGasPrice()
        this.click(CREATE_SCHEDULE_TX_BUTTON)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        // cy.get(OK_BUTTON, {timeout: 45000}).should("be.visible").click()
        // this.click(TX_DRAWER_BUTTON)
        // WrapPage.validatePendingTransaction("Create Vesting Schedule" , "goerli")
    }

    static validateFormError(error: string) {
        this.hasText(FORM_ERROR,error)
        this.isDisabled(PREVIEW_SCHEDULE_BUTTON)
    }

    static inputFutureDateInVestingStartDateField(amount: number, timeUnit: string) {
            const currentDate = new Date();
            let newDate: Date;

            const unitOfTime = wordTimeUnitMap[timeUnit];
            if (unitOfTime === undefined) {
                throw new Error(`Invalid time unit: ${timeUnit}`);
            }

            newDate = new Date(currentDate.getTime() + amount * (unitOfTime * 1000));

            const month = `0${newDate.getMonth() + 1}`.slice(-2);
            const day = `0${newDate.getDate()}`.slice(-2);
            const year = newDate.getFullYear();
            const hours = `0${newDate.getHours()}`.slice(-2);
            const minutes = `0${newDate.getMinutes()}`.slice(-2);
            const finalFutureDate = `${month}/${day}/${year} ${hours}:${minutes}`;
            this.type(DATE_INPUT,finalFutureDate)
    }

    static inputCliffAmount(amount: number) {
        this.type(CLIFF_AMOUNT_INPUT , amount)
    }

    static inputCliffPeriod(amount: number, timeUnit: string) {
        this.type(CLIFF_PERIOD_INPUT,amount)
        this.click(CLIFF_PERIOD_UNIT)
        if (wordTimeUnitMap[timeUnit] === undefined) {
            throw new Error(`Invalid time unit: ${timeUnit}`);
        }
        this.click(`[data-value=${wordTimeUnitMap[timeUnit]}]`)
        this.hasText(CLIFF_PERIOD_SELECTED_UNIT , `${timeUnit}(s)`)
    }

    static inputTotalVestedAmount(amount: number) {
        this.type(TOTAL_AMOUNT_INPUT , amount)
    }

    static inputTotalVestingPeriod(amount: number, timeUnit: string) {
        this.type(TOTAL_PERIOD_INPUT,amount)
        this.click(TOTAL_PERIOD_UNIT)
        if (wordTimeUnitMap[timeUnit] === undefined) {
            throw new Error(`Invalid time unit: ${timeUnit}`);
        }
        this.click(`[data-value=${wordTimeUnitMap[timeUnit]}]`)
        this.hasText(TOTAL_PERIOD_SELECTED_UNIT , `${timeUnit}(s)`)
    }

    static clickPreviewButton() {
        this.isNotDisabled(PREVIEW_SCHEDULE_BUTTON)
        this.click(PREVIEW_SCHEDULE_BUTTON)
    }

    static deleteScheduleIfNecessary() {
        SendPage.overrideNextGasPrice()
        this.doesNotExist(LOADING_SKELETONS)
        cy.get("body").then(body => {
            if (body.find(FORWARD_BUTTON).length > 0) {
                this.clickFirstVisible(VESTING_ROWS)
                this.clickFirstVisible(DELETE_SCHEDULE_BUTTON)
                cy.get(OK_BUTTON, {timeout: 45000}).should("be.visible").click()
                cy.get(`${TX_DRAWER_BUTTON} span`, {timeout: 60000}).should("not.be.visible")
                this.doesNotExist(FORWARD_BUTTON)
                this.doesNotExist(VESTING_ROWS)
            }
        })
    }

    static validateVestingSchedulePreview() {
        this.hasText(PREVIEW_RECEIVER,this.shortenHex("0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"))
        this.validateSchedulePreviewDetails(cliffDate,startDate,endDate)
        this.hasText(PREVIEW_TOTAL_AMOUNT, "2 fTUSDx")
        this.hasText(PREVIEW_CLIFF_AMOUNT, "1 fTUSDx")
        this.containsText(PREVIEW_CLIFF_PERIOD,`1 year (${format(cliffDate, "LLLL d, yyyy")})`)
        this.containsText(PREVIEW_TOTAL_PERIOD , `2 year (${format(endDate, "LLLL d, yyyy")})`)
    }

    static validateNewlyCreatedSchedule() {
        this.isVisible(FORWARD_BUTTON)
        this.hasText(TABLE_RECEIVER_SENDER , this.shortenHex("0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"))
        this.hasText(TABLE_TOTAL_AMOUNTS , "2 fTUSDx")
        this.hasText(TABLE_CLIFF_AMOUNT , "1 fTUSDx")
        this.hasText(TABLE_CLIFF_DATE, format(cliffDate, "LLL d, yyyy"))
        cy.get(TABLE_START_END_DATES).first().should("contain.text" , format(startDate, "LLL d, yyyy"))
        cy.get(TABLE_START_END_DATES).last().should("contain.text", format(endDate,"LLL d, yyyy"))
        this.doesNotExist(PENDING_MESSAGE)
    }

    static clickCreateScheduleButton() {
        cy.get(LOADING_SKELETONS, {timeout: 45000}).should("not.exist")
        this.click(CREATE_VESTING_SCHEDULE_BUTTON)
    }

    static openLastCreatedSchedule() {
        cy.get(LOADING_SKELETONS, {timeout: 45000}).should("not.exist")
        this.clickFirstVisible(VESTING_ROWS)
    }

    static deleteVestingSchedule() {
        this.click(DELETE_SCHEDULE_BUTTON)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
    }

    static deleteVestingButtonDoesNotExist() {
        this.doesNotExist(DELETE_SCHEDULE_BUTTON)
    }

    static clickChangeNetworkButton() {
        this.click(CHANGE_NETWORK_BUTTON)
    }

    static changeNetworkButtonIsVisible() {
        this.isVisible(CHANGE_NETWORK_BUTTON)
    }

    static deleteVestingScheduleButtonIsVisible() {
        this.isVisible(DELETE_SCHEDULE_BUTTON)
    }

    static validateCreatedVestingSchedule() {
        this.isVisible(FORWARD_BUTTON)
        this.hasText(TABLE_RECEIVER_SENDER , this.shortenHex("0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"))
        this.hasText(TABLE_TOTAL_AMOUNTS , "4 TDLx")
        this.hasText(TABLE_CLIFF_AMOUNT , "2 TDLx")
        this.hasText(TABLE_CLIFF_DATE, format(staticCliffDate, "LLL d, yyyy"))
        cy.get(TABLE_START_END_DATES).first().should("contain.text" , format(staticStartDate, "LLL d, yyyy"))
        cy.get(TABLE_START_END_DATES).last().should("contain.text", format(staticEndDate,"LLL d, yyyy"))
    }

    static validateSchedulePreviewDetails(cliffDate: Date,startDate:Date ,endDate:Date) {
        this.containsText(GRAPH_CLIFF_DATE, `Cliff: ${format(cliffDate, "LLL d, yyyy HH:mm").slice(0, -1)}`);
        this.containsText(GRAPH_START_DATE, `Start: ${format(startDate, "LLL d, yyyy HH:mm").slice(0, -1)}`)
        this.containsText(GRAPH_END_DATE, `End: ${format(endDate, "LLL d, yyyy HH:mm").slice(0, -1)}`)
        this.containsText(PREVIEW_START_DATE, format(startDate, "LLLL d, yyyy"))
    }

    static validateCreatedVestingScheduleDetailsPage() {
        this.hasText(PREVIEW_RECEIVER,this.shortenHex("0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"))
        this.validateSchedulePreviewDetails(staticCliffDate,staticStartDate,staticEndDate)
        this.containsText(PREVIEW_CLIFF_PERIOD,`${format(staticCliffDate, "LLLL d, yyyy")}`)
        this.containsText(PREVIEW_TOTAL_PERIOD , `${format(staticEndDate, "LLLL d, yyyy")}`)
        this.hasText(PREVIEW_TOTAL_AMOUNT, "4 TDLx")
        this.hasText(PREVIEW_CLIFF_AMOUNT, "2.0 TDLx")
    }
}