import {BasePage} from "../BasePage";
import {format, fromUnixTime} from "date-fns";

const ANIMATION = "[data-cy=animation]"
const SENT_SO_FAR = "[data-cy=balance]"
const TOKEN_STREAMED = "[data-cy=streamed-token]"
const SENDER_AND_RECEIVER = "[data-cy=sender-and-receiver]"
const AMOUNT_PER_MONTH = "[data-cy=amount-per-month]"
const START_DATE = "[data-cy=start-date]"
const BUFFER = "[data-cy=buffer]"
const UPDATED_END_DATE = "[data-cy=updated-end-date]"
const NETWORK_NAME = "[data-cy=network-name] h6"
const PROJECTED_LIQUIDATION = "[data-cy=projected-liquidation]"
const TX_HASH = "[data-cy=tx-hash]"
const ENDED_STREAM_MESSAGE = "[data-cy=ended-stream-message]"
const SENDER_RECEIVER_COPY_BUTTONS = "[data-cy=sender-and-receiver] + * button"
const SENDER_RECEIVER_EXPLORER_BUTTONS = "[data-cy=sender-and-receiver] + * span"
const VISIBLE_TOOLTIP = "[role=tooltip] div"
const TX_HASH_COPY_BUTTON = "[data-cy=tx-hash] [data-cy=copy-button]"
const TX_HASH_EXPLORER_BUTTON = "[data-cy=tx-hash] span a"
const ALL_COPY_BUTTONS = "[data-cy=copy-button]"
const TWITTER_BUTTON = "[data-cy=twitter-button]"
const TELEGRAM_BUTTON = "[data-cy=telegram-button]"
const BACK_BUTTON = "[data-testid=ArrowBackIcon]"
const TIMER_ICON = "[data-testid=TimerOutlinedIcon]"
const TOTAL_SCHEDULED_AMOUNT = "[data-cy=scheduled-amount]"
const CLIFF_DATE = "[data-cy=cliff-date]"
const VESTING_START_DATE = "[data-cy=vesting-start-date]"
const VESTING_END_DATE = "[data-cy=vesting-end-date]"
const CLIFF_AMOUNT = "[data-cy=cliff-amount]"

const polygonExplorerLink = "https://polygonscan.com"


export class StreamDetailsPage extends BasePage {

    static validateTokenAnimation() {
        this.isVisible(ANIMATION)
    }

    static validateFlowNotMoving() {
        cy.get(SENT_SO_FAR).then(el => {
            cy.get(SENT_SO_FAR).then(elAfter => {
                //Lets wait just to be sure the flowed amount doesn't start to move
                cy.wait(1000)
                cy.wrap(parseFloat(elAfter.text())).should("eq", parseFloat(el.text()))
            })
        })
    }

    static validateEndedStreamData() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            this.hasText(TOKEN_STREAMED, endedStream.token)
            //this.containsText(START_DATE, endedStream.startDate.slice(0, -1))
            //this.containsText(UPDATED_END_DATE, endedStream.endDate.slice(0, -1))
            cy.get(SENDER_AND_RECEIVER).first().should("have.text", BasePage.shortenHex(endedStream.sender))
            cy.get(SENDER_AND_RECEIVER).last().should("have.text", BasePage.shortenHex(endedStream.receiver))
            this.hasText(BUFFER, endedStream.buffer)
            this.hasText(NETWORK_NAME, endedStream.networkName)
            this.hasText(TX_HASH, BasePage.shortenHex(endedStream.txHash))
            this.hasText(PROJECTED_LIQUIDATION, endedStream.projectedLiquidation)
            this.hasText(SENT_SO_FAR, endedStream.totalAmountStreamed)
            this.doesNotExist(AMOUNT_PER_MONTH)
        })
    }

    static validateEndedStreamMessage() {
        cy.fixture("streamData").then(streamData => {
            this.hasText(ENDED_STREAM_MESSAGE, streamData["staticBalanceAccount"]["polygon"][0].cancelledMessage)
        })
    }

    static validateFlowMovingUp() {
        cy.get(SENT_SO_FAR).invoke("text").then(text => {
            cy.get(SENT_SO_FAR).should("not.have.text", text)
            cy.get(SENT_SO_FAR).invoke("text").then(textAfter => {
                expect(parseFloat(textAfter)).to.be.gt(parseFloat(text))
            })
        })
    }

    static validateOngoingFlowData() {
        cy.fixture("streamData").then(streamData => {
            const ongoingStream = streamData["ongoingStreamAccount"]["polygon"][0]
            this.hasText(TOKEN_STREAMED, ongoingStream.token)
            //this.containsText(START_DATE, ongoingStream.startDate.slice(0, -1))
            //this.containsText(UPDATED_END_DATE, ongoingStream.updatedDate.slice(0, -1))
            cy.get(SENDER_AND_RECEIVER).first().should("have.text", BasePage.shortenHex(ongoingStream.sender))
            cy.get(SENDER_AND_RECEIVER).last().should("have.text", BasePage.shortenHex(ongoingStream.receiver))
            this.hasText(BUFFER, `${ongoingStream.buffer} ${ongoingStream.token}`)
            this.hasText(NETWORK_NAME, ongoingStream.networkName)
            this.hasText(TX_HASH, BasePage.shortenHex(ongoingStream.txHash))
            this.containsText(PROJECTED_LIQUIDATION, ongoingStream.projectedLiquidation.slice(0, -1))
            this.hasText(AMOUNT_PER_MONTH, `${ongoingStream.amountPerMonth} ${ongoingStream.token}`)
            //Asserting without last 4 decimals
            //because the calculation can be a little off from the animation and test would fail
            this.containsText(
                SENT_SO_FAR,
                (((Date.now() - ongoingStream.startedAtUnix) * ongoingStream.flowRate) /
                    1e21
                ).toString().substring(0, 9)
            );
        })
    }

    static validateReceiverAndSenderTooltips() {
        //Tooltips don't show up in firefox headless mode
        if (Cypress.browser.name !== "firefox" && Cypress.browser.isHeadless) {
            cy.get(SENDER_AND_RECEIVER).first().trigger("mouseover")
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).first().trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "Copy address")
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).first().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
            cy.get(SENDER_AND_RECEIVER).first().trigger("mouseover")
            cy.get(SENDER_RECEIVER_EXPLORER_BUTTONS).first().trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "View on blockchain explorer")
            cy.get(SENDER_RECEIVER_EXPLORER_BUTTONS).first().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
            cy.get(SENDER_AND_RECEIVER).last().trigger("mouseover")
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).last().trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "Copy address")
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).last().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
            cy.get(SENDER_AND_RECEIVER).last().trigger("mouseover")
            cy.get(SENDER_RECEIVER_EXPLORER_BUTTONS).last().trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "View on blockchain explorer")
            cy.get(SENDER_RECEIVER_EXPLORER_BUTTONS).last().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
        }
    }

    static validateReceiverSenderExplorerLinks() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            cy.get(`${SENDER_RECEIVER_EXPLORER_BUTTONS} a`).first().should("have.attr", "href", `${polygonExplorerLink}/address/${endedStream.sender}`)
            cy.get(`${SENDER_RECEIVER_EXPLORER_BUTTONS} a`).first().should("have.attr", "target", "_blank")
            cy.get(`${SENDER_RECEIVER_EXPLORER_BUTTONS} a`).last().should("have.attr", "href", `${polygonExplorerLink}/address/${endedStream.receiver}`)
            cy.get(`${SENDER_RECEIVER_EXPLORER_BUTTONS} a`).last().should("have.attr", "target", "_blank")
        })
    }

    static clickReceiverSenderCopyButtonsAndValidateTooltip() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            //In headless mode clicking on the button , does not show "Copied" , fine on headed
            if (!Cypress.browser.isHeadless) {
                cy.get(SENDER_AND_RECEIVER).first().trigger("mouseover")
                cy.get(SENDER_RECEIVER_COPY_BUTTONS).first().click()
                this.isVisible(VISIBLE_TOOLTIP)
                this.hasText(VISIBLE_TOOLTIP, "Copied!")
                cy.get(SENDER_RECEIVER_COPY_BUTTONS).first().trigger("mouseout")
                this.doesNotExist(VISIBLE_TOOLTIP)
                cy.get(SENDER_AND_RECEIVER).last().trigger("mouseover")
                cy.get(SENDER_RECEIVER_COPY_BUTTONS).last().click()
                this.isVisible(VISIBLE_TOOLTIP)
                this.hasText(VISIBLE_TOOLTIP, "Copied!")
                cy.get(SENDER_RECEIVER_COPY_BUTTONS).last().trigger("mouseout")
                this.doesNotExist(VISIBLE_TOOLTIP)
            }
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).first().should("have.attr", "test-data", endedStream.sender)
            cy.get(SENDER_RECEIVER_COPY_BUTTONS).last().should("have.attr", "test-data", endedStream.receiver)
        })
    }

    static validateTxHashTooltips() {
        if (Cypress.browser.name !== "firefox" && Cypress.browser.isHeadless) {
            cy.get(TX_HASH_COPY_BUTTON).trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "Copy transaction hash")
            cy.get(TX_HASH_COPY_BUTTON).first().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
            cy.get(TX_HASH_EXPLORER_BUTTON).trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "View on blockchain explorer")
            cy.get(TX_HASH_EXPLORER_BUTTON).trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
        }
    }

    static validateTxHashTooltipsAfterClick() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            if (!Cypress.browser.isHeadless) {
                cy.get(TX_HASH_COPY_BUTTON).click()
                this.isVisible(VISIBLE_TOOLTIP)
                this.hasText(VISIBLE_TOOLTIP, "Copied!")
                cy.get(TX_HASH_COPY_BUTTON).trigger("mouseout")
                this.doesNotExist(VISIBLE_TOOLTIP)
            }
            this.hasAttributeWithValue(TX_HASH_COPY_BUTTON, "test-data", endedStream.txHash)
        })
    }

    static validateTxHashHyperlink() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            cy.get(TX_HASH_EXPLORER_BUTTON).first().should("have.attr", "href", `${polygonExplorerLink}/tx/${endedStream.txHash}`)
            cy.get(TX_HASH_EXPLORER_BUTTON).first().should("have.attr", "target", "_blank")
        })
    }

    static validateStreamCopyButtonTooltipsAndLink() {
        cy.fixture("streamData").then(streamData => {
            const endedStream = streamData["staticBalanceAccount"]["polygon"][0]
            cy.get(ALL_COPY_BUTTONS).last().trigger("mouseover")
            this.isVisible(VISIBLE_TOOLTIP)
            this.hasText(VISIBLE_TOOLTIP, "Copy link")
            if (!Cypress.browser.isHeadless) {
                cy.get(ALL_COPY_BUTTONS).last().click()
                this.hasText(VISIBLE_TOOLTIP, "Copied!")
            }
            cy.get(ALL_COPY_BUTTONS).last().trigger("mouseout")
            this.doesNotExist(VISIBLE_TOOLTIP)
            cy.get(ALL_COPY_BUTTONS).last().should("have.attr", "test-data", `https://app.superfluid.finance${endedStream.v2Link}`)
        })
    }

    static validateSocialNetworkTooltipsAndLinks() {
        cy.get(TELEGRAM_BUTTON).trigger("mouseover")
        this.isVisible(VISIBLE_TOOLTIP)
        this.hasText(VISIBLE_TOOLTIP, "Share on Telegram")
        cy.get(TELEGRAM_BUTTON).trigger("mouseout")
        this.doesNotExist(VISIBLE_TOOLTIP)
        this.hasAttributeWithValue(TELEGRAM_BUTTON, "href", "https://t.me/share/url?text=I%E2%80%99m%20streaming%20money%20every%20second%20with%20%40Superfluid_HQ!%20%F0%9F%8C%8A%0A%0ACheck%20out%20my%20stream%20here%20%E2%98%9D%EF%B8%8F&url=https%3A%2F%2Fapp.superfluid.finance%2Fstream%2Fpolygon%2F0x384bec1faf849929dcce6b293f7bee432f2a299cc9afc6750179dc96dd81b8ff-211")
        this.hasAttributeWithValue(TELEGRAM_BUTTON, "target", "_blank")
        cy.get(TWITTER_BUTTON).trigger("mouseover")
        this.isVisible(VISIBLE_TOOLTIP)
        this.hasText(VISIBLE_TOOLTIP, "Share on Twitter")
        cy.get(TWITTER_BUTTON).trigger("mouseout")
        this.doesNotExist(VISIBLE_TOOLTIP)
        this.hasAttributeWithValue(TWITTER_BUTTON, "href", "https://twitter.com/intent/tweet?text=I%E2%80%99m%20streaming%20money%20every%20second%20with%20%40Superfluid_HQ!%20%F0%9F%8C%8A%0A%0ACheck%20out%20my%20stream%20here%20%F0%9F%91%87&url=https%3A%2F%2Fapp.superfluid.finance%2Fstream%2Fpolygon%2F0x384bec1faf849929dcce6b293f7bee432f2a299cc9afc6750179dc96dd81b8ff-211&hashtags=superfluid%2Cmoneystreaming%2Crealtimefinance")
        this.hasAttributeWithValue(TWITTER_BUTTON, "target", "_blank")
    }

    static clickBackButton() {
        this.click(BACK_BUTTON)
    }

    static validateCloseEndedStreamData() {
        cy.fixture("streamData").then(streamData => {
            const closeEndedStream = streamData["accountWithLotsOfData"]["goerli"][0]
            this.hasText(TOKEN_STREAMED, closeEndedStream.token)
            cy.get(SENDER_AND_RECEIVER).first().should("have.text", BasePage.shortenHex(closeEndedStream.sender))
            cy.get(SENDER_AND_RECEIVER).last().should("have.text", BasePage.shortenHex(closeEndedStream.receiver))
            this.isVisible(TIMER_ICON)
            this.hasText(TOTAL_SCHEDULED_AMOUNT, `${closeEndedStream.scheduledAmount} ${closeEndedStream.token}`)
            this.hasText(BUFFER, `${closeEndedStream.buffer} ${closeEndedStream.token}`)
            this.hasText(NETWORK_NAME, closeEndedStream.networkName)
            this.hasText(TX_HASH, BasePage.shortenHex(closeEndedStream.txHash))
            this.hasText(AMOUNT_PER_MONTH, `${closeEndedStream.amountPerMonth} ${closeEndedStream.token}`)
            this.containsText(
                SENT_SO_FAR,
                (((Date.now() - closeEndedStream.startedAtUnix) * closeEndedStream.flowRate) /
                    1e21
                ).toString().substring(0, 6)
            );
        })
    }

    static validateVestingStreamDetails() {
        cy.fixture("vestingData").then(data => {
            let schedule = data.polygon.USDCx.schedule
            let stream = data.polygon.USDCx.vestingStream;
            this.hasText(CLIFF_DATE, format(
                fromUnixTime(Number(schedule.cliffDate)),
                "LLL d, yyyy HH:mm"
            ))
            this.hasText(VESTING_START_DATE, format(
                fromUnixTime(Number(schedule.startDate)),
                "LLL d, yyyy HH:mm"
            ))
            this.hasText(VESTING_END_DATE, format(
                fromUnixTime(Number(schedule.endDate)),
                "LLL d, yyyy HH:mm"
            ))
            this.hasText(CLIFF_AMOUNT, `${parseFloat(schedule.cliffAmount) / 1e18} ${stream.token.symbol}`)
            this.hasText(NETWORK_NAME, stream.networkName)
            this.hasText(TX_HASH, BasePage.shortenHex(stream.txHash))
            this.hasText(AMOUNT_PER_MONTH, `${stream.amountPerMonth} ${stream.token.symbol}`)
        })
    }
}