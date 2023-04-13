import {BasePage,wordTimeUnitMap} from "../BasePage";
import { format } from "date-fns";
import {SendPage} from "./SendPage";
import {Common} from "./Common";

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
const TABLE_ALLOCATED_AMOUNT = "[data-cy=allocated-amount]"
const VESTED_AMOUNT = "[data-cy=vested-amount]"
const TABLE_START_END_DATES = "[data-cy=start-end-dates]"
const TABLE_VESTING_STATUS = "[data-cy=vesting-status]"
const TABLE_RECEIVER_SENDER = "[data-cy=receiver-sender]"
const PENDING_MESSAGE = "[data-cy=pending-message]"
const NOT_SUPPORTED_NETWORK_MSG = "[data-cy=not-supported-network-msg]"
const MAINNET_NETWORK_LINK = "[data-cy=ethereum-link]"
const CLIFF_TOGGLE = "[data-cy=cliff-toggle]"
const DETAILS_SCHEDULED_DATE = "[data-cy=vesting-scheduled-date]"
const DETAILS_CLIFF_START = "[data-cy=cliff-start-date]"
const DETAILS_CLIFF_END = "[data-cy=cliff-end-date]"
const DETAILS_VESTING_START = "[data-cy=vesting-start-date]"
const DETAILS_VESTING_END = "[data-cy=vesting-end-date]"
const DETAILS_VESTED_SO_FAR_AMOUNT = "[data-cy=balance]"
const DETAILS_VESTED_TOKEN_SYMBOL = "[data-cy=token-symbol]"
const SCHEDULE_VESTING_SCHEDULED = "[data-cy=vesting-scheduled]"
const SCHEDULE_CLIFF_START = "[data-cy=cliff-start]"
const SCHEDULE_CLIFF_END = "[data-cy=cliff-end]"
const SCHEDULE_VESTING_START = "[data-cy=vesting-start]"
const SCHEDULE_VESTING_END = "[data-cy=vesting-end]"
const ACCESS_CODE_BUTTON = "[data-cy=vesting-code-button]"
const TRY_MUMBAI_BUTTON = "[data-cy=polygon-mumbai-link]"
const TOPUP_WARNING_TITLE = "[data-cy=top-up-alert-title]"
const TOPUP_WARNING_TEXT = "[data-cy=top-up-alert-text]"
const ALLOWLIST_MESSAGE = "[data-cy=allowlist-message]"
const ALLOWLIST_LINK = "[data-cy=allowlist-link]"

//Strings
const NO_CREATED_TITLE_STRING = "No Sent Vesting Schedules"
const NO_CREATED_DESC_STRING = "Vesting schedules that you have created will appear here."
const NO_RECEIVED_TITLE_STRING = "No Received Vesting Schedules"
const NO_RECEIVED_DESC_STRING = "Vesting schedules that you have received will appear here."

//Dates for the vesting previews etc.
let staticStartDate = new Date(1676642460000)
let staticEndDate = new Date(1992002460000)
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
        cy.get(FORM_ERROR).first().should("have.text",error)
        this.isDisabled(PREVIEW_SCHEDULE_BUTTON)
    }

    static inputFutureDateInVestingStartDateField(amount: number, timeUnit: string) {
        Common.inputDateIntoField(DATE_INPUT,amount,timeUnit)
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
        this.hasText(TABLE_ALLOCATED_AMOUNT , "2 fTUSDx")
        this.hasText(VESTED_AMOUNT , "1 fTUSDx")
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
        cy.get(TABLE_VESTING_STATUS).first().should("have.text","Scheduled")
        cy.get(TABLE_RECEIVER_SENDER).first().should("have.text",this.shortenHex("0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"))
        cy.get(TABLE_ALLOCATED_AMOUNT).first().should("have.text","100 fUSDCx")
        cy.get(VESTED_AMOUNT).first().should("have.text","0  fUSDCx")
        cy.get(TABLE_START_END_DATES).first().should("contain.text" , format(staticStartDate, "LLL d, yyyy"))
        cy.get(TABLE_START_END_DATES).last().should("contain.text", format(staticEndDate,"LLL d, yyyy"))
    }

    static validateSchedulePreviewDetails(cliffDate: Date,startDate:Date ,endDate:Date) {
        //The graph goes up by 1 minute if test is too slow in the form
        cy.get(GRAPH_CLIFF_DATE).then(el => {
            let graphCliffTimestamp = Date.parse(el.text().replace("Cliff: ",""))
            expect(graphCliffTimestamp).to.be.closeTo(cliffDate.getTime(),180000)
        })
        cy.get(GRAPH_END_DATE).then(el => {
            let graphCliffTimestamp = Date.parse(el.text().replace("End: ",""))
            expect(graphCliffTimestamp).to.be.closeTo(endDate.getTime(),180000)
        })
        cy.get(GRAPH_START_DATE).then(el => {
            let graphCliffTimestamp = Date.parse(el.text().replace("Start: ",""))
            expect(graphCliffTimestamp).to.be.closeTo(startDate.getTime(),180000)
        })
    }

    static validateCreatedVestingScheduleDetailsPage() {
        this.hasText(DETAILS_VESTED_SO_FAR_AMOUNT, "0 ")
        this.hasText(DETAILS_VESTED_TOKEN_SYMBOL, "fUSDCx")
        this.hasText("[data-cy=fUSDCx-cliff-amount]", "50fUSDCx")
        this.hasText("[data-cy=fUSDCx-allocated]", "100fUSDCx")
        cy.fixture("vestingData").then(data => {
            let schedule = data.goerli.fUSDCx.schedule
            this.hasText(DETAILS_SCHEDULED_DATE ,format((schedule.createdAt * 1000), "MMM do, yyyy HH:mm") )
            this.hasText(DETAILS_CLIFF_START,format((schedule.startDate * 1000), "MMM do, yyyy HH:mm") )
            this.hasText(DETAILS_CLIFF_END,format((schedule.cliffDate * 1000), "MMM do, yyyy HH:mm") )
            this.hasText(DETAILS_VESTING_END,format((schedule.endDate * 1000), "MMM do, yyyy HH:mm") )
        })
    }

    static validateNotSupportedNetworkScreen() {
        const supportedNetworks = ["ethereum","polygon","bsc","goerli","gnosis","polygon-mumbai","optimism","arbitrum-one","avalanche"]
        this.hasText(NOT_SUPPORTED_NETWORK_MSG,"This network is not supported.")
        supportedNetworks.forEach(network => {
            this.isVisible(`[data-cy=${network}-link]` )
        })
        this.doesNotExist("[data-cy=avalanche-fuji-link]")
    }

    static validateDisabledMainnetNetworkLink() {
        this.isDisabled(MAINNET_NETWORK_LINK)
    }

    static validateEnabledMainnetNetworkLink() {
        this.isNotDisabled(MAINNET_NETWORK_LINK)
    }

    static validateTokenPermissionIcons(token: string, color: string) {
        let rgbValue = color === "green" ? "rgb(16, 187, 53)" : "rgb(210, 37, 37)"
        cy.get(`[data-cy=${token}-allowance-status]`, {timeout:30000}).should("have.css","color" , rgbValue)
        cy.get(`[data-cy=${token}-permission-status]`).should("have.css","color" , rgbValue)
        cy.get(`[data-cy=${token}-flow-allowance-status]`).should("have.css","color" , rgbValue)
    }

    static openTokenPermissionRow(token: string) {
        this.click(`[data-cy=${token}-row] [data-testid=ExpandMoreRoundedIcon]`)
    }

    static validateTokenPermissionsData(token: string) {
        cy.fixture("vestingData").then(data => {
            let selectedToken = data.goerli[token]
            this.hasText(`[data-cy=${token}-current-allowance] p`, `${selectedToken.currentAllowances.tokenAllowance} ${token}`)
            this.hasText(`[data-cy=${token}-recommended-allowance] p`, `${selectedToken.recommendedAllowances.tokenAllowance} ${token}`)
            this.hasText(`[data-cy=${token}-current-permissions] p`, selectedToken.currentAllowances.operatorPermissions)
            this.hasText(`[data-cy=${token}-recommended-permissions] p`, selectedToken.recommendedAllowances.operatorPermissions)
            this.hasText(`[data-cy=${token}-current-flow-allowance] p`, `${selectedToken.currentAllowances.flowAllowance} ${token}/sec`)
            this.hasText(`[data-cy=${token}-recommended-flow-allowance] p`, `${selectedToken.recommendedAllowances.flowAllowance} ${token}/sec`)
        })
    }

    static clickCliffToggle() {
        this.click(CLIFF_TOGGLE)
        //Workaround for a race condition which leaves the preview button enabled after inputting cliff amounts too fast
        Common.wait(2)
    }

    static mockScheduleToStatus(status: string) {
        let today = BasePage.getDayTimestamp(0)
        let yesterday = BasePage.getDayTimestamp(-1)

        cy.intercept("POST", "**vesting-v1**", (req => {
            req.continue((res) => {
                if (req.body.variables._0_where.sender) {
                    let schedule = res.body.data._0_vestingSchedules[0]
                    switch (status) {
                        case "Cancel Error":
                            schedule.failedAt = today
                            schedule.endDateValidAt = yesterday
                            break;
                        case "Scheduled":
                            //Scheduled in a few years, no need to modify the response
                            break;
                        case "Vesting":
                            schedule.cliffAndFlowExecutedAt = today
                            break;
                        case "Vested":
                            schedule.endDate = yesterday
                            schedule.endExecutedAt = yesterday
                            break;
                        case "Cliff":
                            schedule.cliffDate = yesterday
                            break;
                        case "Stream Error":
                            schedule.cliffAndFlowExpirationAt = yesterday
                            break;
                        case "Overflow Error":
                            schedule.endDate = yesterday
                            schedule.endExecutedAt = yesterday + 1
                            break;
                        case "Deleted":
                            schedule.deletedAt = yesterday
                            break;
                        case "Transfer Error":
                            schedule.didEarlyEndCompensationFail = true
                            break;
                    }
                }
            })
        }))
    }

    static validateVestingRowStatus(status: string) {
        if (status === "Deleted") {
            cy.get(TABLE_VESTING_STATUS).should("be.visible")
            cy.contains("Deleted").click()
        }
        cy.get(TABLE_VESTING_STATUS).first().should("have.text", status)
    }

    static validateScheduleBarElements(greenOnes: string[], greyOnes: string[], barPercentage: number) {
        greenOnes.forEach((greenOne, i) => {
            cy.get(`${greenOne} div div`).should("have.css", "background", "rgb(16, 187, 53) none repeat scroll 0% 0% / auto padding-box border-box")
            if (greyOnes.length === 0 && i === greenOnes.length - 1) {
                return;
            }
            cy.get("[data-cy=total-progress-line]").eq(i).then(el => {
                let expectedWidth = i === (greenOnes.length - 1) ? (el.width() / 100 * barPercentage) : el.width()
                cy.get("[data-cy=actual-progress-line]").eq(i).invoke("width").should("be.closeTo", expectedWidth, 1)
                cy.get("[data-cy=actual-progress-line]").eq(i).should("be.visible")

            })
        })
        greyOnes.forEach((greyOne, i) => {
            if (greyOne) {
                cy.get(`${greyOne} div div`).should("have.css", "background", "rgba(0, 0, 0, 0.12) none repeat scroll 0% 0% / auto padding-box border-box")
            }
        })
    }

    static validateScheduleBar(status: string) {

        switch (status) {
            case "Scheduled":
                this.validateScheduleBarElements([SCHEDULE_VESTING_SCHEDULED], [SCHEDULE_CLIFF_START, SCHEDULE_CLIFF_END, SCHEDULE_VESTING_END], 50)
                break;
            case "Vesting Started":
                this.validateScheduleBarElements([SCHEDULE_VESTING_SCHEDULED, SCHEDULE_CLIFF_START], [SCHEDULE_CLIFF_END, SCHEDULE_VESTING_END], 50)
                break;
            case "Cliff vested":
                this.validateScheduleBarElements([SCHEDULE_VESTING_SCHEDULED, SCHEDULE_CLIFF_START, SCHEDULE_CLIFF_END], [SCHEDULE_VESTING_END], 50)
                break;
            case "Vesting ended":
                this.validateScheduleBarElements([SCHEDULE_VESTING_SCHEDULED, SCHEDULE_CLIFF_START, SCHEDULE_CLIFF_END, SCHEDULE_VESTING_END], [] , 100)
                break;
            default:
                throw new Error(`Unknown schedule bar state: ${status}`)
        }

    }

    static mockProgressTo(status: string) {
        let today = BasePage.getDayTimestamp(0)
        let yesterday = BasePage.getDayTimestamp(-1)

        cy.intercept("POST", "**vesting-v1**", (req => {
            req.continue((res) => {
                if (req.body.variables._0_id) {
                    let schedule = res.body.data._0_vestingSchedule
                    switch (status) {
                        case "Scheduled":
                            schedule.cliffAndFlowDate = this.getDayTimestamp(2)
                            schedule.cliffAndFlowExecutedAt = null
                            schedule.cliffAndFlowExpirationAt = this.getDayTimestamp(2) + 1000
                            schedule.cliffDate = this.getDayTimestamp(2)
                            schedule.createdAt = this.getDayTimestamp(-1)
                            schedule.earlyEndCompensation = null
                            schedule.endDate = this.getDayTimestamp(3)
                            schedule.endDateValidAt = this.getDayTimestamp(3) + 1000
                            schedule.endExecutedAt = null
                            schedule.failedAt = null
                            schedule.startDate = this.getDayTimestamp(1)
                            break;
                        case "Vesting Started":
                            //Vesting scheduled
                            schedule.createdAt = this.getDayTimestamp(-2)
                            //Cliff starts
                            schedule.startDate = this.getDayTimestamp(-1)
                            //Cliff Ends
                            schedule.cliffDate = this.getDayTimestamp(1)
                            //Vesting starts
                            schedule.cliffAndFlowDate = this.getDayTimestamp(2)
                            schedule.cliffAndFlowExecutedAt = null
                            schedule.cliffAndFlowExpirationAt = this.getDayTimestamp(2) + 1000
                            //Vesting ends
                            schedule.endDate = this.getDayTimestamp(3)
                            schedule.endDateValidAt = this.getDayTimestamp(3) + 1000
                            schedule.endExecutedAt = null
                            //Error states
                            schedule.earlyEndCompensation = null
                            schedule.failedAt = null
                            break;
                        case "Cliff vested":
                            //Vesting scheduled
                            schedule.createdAt = this.getDayTimestamp(-3)
                            //Cliff starts
                            schedule.startDate = this.getDayTimestamp(-2)
                            //Cliff Ends
                            schedule.cliffDate = this.getDayTimestamp(-1)
                            //Vesting starts
                            schedule.cliffAndFlowDate = this.getDayTimestamp(-1)
                            schedule.cliffAndFlowExecutedAt = this.getDayTimestamp(-1)
                            schedule.cliffAndFlowExpirationAt = this.getDayTimestamp(-1) + 1000
                            //Vesting ends
                            schedule.endDate = this.getDayTimestamp(1)
                            schedule.endDateValidAt = this.getDayTimestamp(1) + 1000
                            schedule.endExecutedAt = null
                            //Error states
                            schedule.earlyEndCompensation = null
                            schedule.failedAt = null
                            break;
                        case "Vesting ended":
                            //Vesting scheduled
                            schedule.createdAt = this.getDayTimestamp(-4)
                            //Cliff starts
                            schedule.startDate = this.getDayTimestamp(-3)
                            //Cliff Ends
                            schedule.cliffDate = this.getDayTimestamp(-2)
                            //Vesting starts
                            schedule.cliffAndFlowDate = this.getDayTimestamp(-2)
                            schedule.cliffAndFlowExecutedAt = this.getDayTimestamp(-2)
                            schedule.cliffAndFlowExpirationAt = this.getDayTimestamp(-2) + 1000
                            //Vesting ends
                            schedule.endDate = this.getDayTimestamp(-1)
                            schedule.endDateValidAt = this.getDayTimestamp(-1) + 1000
                            schedule.endExecutedAt = this.getDayTimestamp(-1)
                            //Error states
                            schedule.earlyEndCompensation = null
                            schedule.failedAt = null
                            break;

                    }
                }
            })
        }))
    }

    static validateAggregateStats() {
        cy.fixture("vestingData").then(data => {
            let schedule = data.polygon.USDCx.schedule
            let stream = data.polygon.USDCx.vestingStream
            let totalVestedAmount = (schedule.cliffAmount / 1e18 + (((Date.now() - stream.startedAtUnix) * stream.flowRate) / 1e21)).toString().substring(0, 8)
            this.hasText(`[data-cy=${stream.token.symbol}-total-allocated]` , `${schedule.totalAllocated}${stream.token.symbol}`)
            this.containsText(`[data-cy=${stream.token.symbol}-total-vested]` , totalVestedAmount )
        })
        //Make sure deleted schedules don't get shown in the aggregate stats
        cy.get("[data-cy=DAIx-total-allocated]").should("not.exist")
        cy.get("[data-cy=DAIx-total-vested]").should("not.exist")
    }

    static validateAllowListMessage() {
        this.hasText(ALLOWLIST_MESSAGE,"You are not on the allow list.If you want to create vesting schedules, Apply for access or try it out on Polygon Mumbai.")
        this.isVisible(ALLOWLIST_LINK)
        this.hasAttributeWithValue(ALLOWLIST_LINK,"href","https://use.superfluid.finance/vesting")
        this.isVisible(TRY_MUMBAI_BUTTON)
    }

    static clickOnTryOnMumbaiButton() {
        this.click(TRY_MUMBAI_BUTTON)
    }

    static clickInputAccessCodeButton() {
        this.click(ACCESS_CODE_BUTTON)
    }

    static validateVestingFormIsVisible() {
        this.isVisible(CLIFF_TOGGLE)
        this.isVisible(TOTAL_AMOUNT_INPUT)
        this.isVisible(TOTAL_PERIOD_INPUT)
        this.isVisible(PREVIEW_SCHEDULE_BUTTON)
    }

    static validateTopUpMessageWithoutCliff() {
        this.hasText(TOPUP_WARNING_TITLE,"Don’t forget to top up for the vesting schedule!")
        this.hasText(TOPUP_WARNING_TEXT,"Remember to top up your Super Token balance in time for the vesting stream.")
    }

    static validateTopUpMessageWithCliff() {
        this.hasText(TOPUP_WARNING_TITLE, "Don’t forget to top up for the vesting schedule!")
        this.hasText(TOPUP_WARNING_TEXT, "Remember to top up your Super Token balance in time for the cliff amount and vesting stream.")
    }
}