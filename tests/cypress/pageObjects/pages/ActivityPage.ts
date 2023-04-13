import {BasePage} from "../BasePage";
import {mainNetworks, networksBySlug, testNetworks} from "../../superData/networks";
import {Common} from "./Common";
import {format} from "date-fns";

const ACTIVITY_TYPE = "[data-cy=activity]"
const ACTIVITY_NAME = `${ACTIVITY_TYPE} h6`
const ACTIVITY_TIME = `${ACTIVITY_TYPE} span`
const ACTIVITY_AMOUNT = "[data-cy=amount]"
const AMOUNT_TO_FROM = "[data-cy=amountToFrom]"
const ALL_ROWS = "[data-cy*=-row]"
const DATE_PICKER_BUTTON = "[data-cy=date-picker-button]"
const MONTH_BACK_BUTTON = "[data-cy=month-back-button]"
const AVAILABLE_DAYS = "[data-cy=available-days]"
const TX_HASH_BUTTONS = "[data-cy=tx-hash-link]"
const TX_HASH_LINKS = "[data-cy=tx-hash-link] a"
const TOKEN_ICONS = "[data-cy=token-icon]"
const SKELETON_ROW = "[data-cy=skeleton-row]"
const NO_ACTIVITY_TITLE = "[data-cy=no-history-title]"
const NO_ACTIVITY_TEXT = "[data-cy=no-history-text]"
const ACTIVITY_FILTER = "[data-cy=activity-filter-button]"
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]"


type ActivityData = {
    amount: string;
    activity: string;
    amountToFrom: string;
    timestamp:number;
    txHash: string | undefined;
}

export class ActivityPage extends BasePage {


    static saveActivityHistoryData() {
        let activityHistoryData: any = {account: {}}
        Common.closeDropdown()
        cy.get(SKELETON_ROW).should("not.exist", {timeout: 60000})
        cy.wait(30000)
        mainNetworks.forEach(network => {
            this.recordNetworkData(network, activityHistoryData)
        })
        Common.changeVisibleNetworksTo("testnet")
        cy.get(SKELETON_ROW).should("not.exist", {timeout: 60000})
        cy.wait(30000)
        testNetworks.forEach(network => {
            this.recordNetworkData(network, activityHistoryData)
        })
        cy.writeFile("cypress/record/activityData.json", activityHistoryData)
    }

    static recordNetworkData(network: { slugName: string }, json: { account: Record<string, any[]> }) {
        json.account[network.slugName] = []
        cy.get("body").then(el => {
            if (el.find(`[data-cy=${network.slugName}-row]`).length > 0) {
                cy.get(`[data-cy=${network.slugName}-row]`).each((row, index) => {
                    let savableRow: ActivityData = json.account[network.slugName][index]
                    cy.wrap(row).find(TOKEN_ICONS).should("exist").then(() => {
                        // To save the correct timestamp
                        // You need to remove the formatting from the entries before recording
                        savableRow.timestamp = parseInt(row.find(`${ACTIVITY_TYPE} span`).last().text())
                        savableRow.activity = row.find(`${ACTIVITY_TYPE} span`).first().text()
                        savableRow.amount = row.find(ACTIVITY_AMOUNT).text()
                        savableRow.amountToFrom = row.find(AMOUNT_TO_FROM).text()
                        let fullHref = row.find(TX_HASH_LINKS).attr("href")
                        savableRow.txHash = fullHref?.split("/")[fullHref.split("/").length - 1]
                    })
                })
            }
        })
    }

    static changeActivityHistoryDateBack(months: number) {
        this.click(DATE_PICKER_BUTTON)
        for (let i = 0; i < months; i++) {
            this.click(MONTH_BACK_BUTTON)
        }
        this.clickFirstVisible(AVAILABLE_DAYS)
        this.waitForSkeletonsToDisappear()
    }

    static validateActivityHistoryForAccount(account: string, networkType: string) {
        let testAbleNetworks = networkType === "testnet" ? testNetworks : mainNetworks
        cy.fixture("activityHistoryData").then(data => {
            testAbleNetworks.forEach(network => {
                if (data[account][network.slugName][0]) {
                    //The entries load faster than the amounts shown, check to make sure all are loaded
                    cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}`, {timeout: 60000}).should("have.length", data[account][network.slugName].length)
                    data[account][network.slugName].forEach((activity: ActivityData, index: number) => {
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}`).eq(index).should("have.text", activity.amount)
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`).eq(index).find("span").first().should("have.text", activity.activity)
                        cy.get(`[data-cy=${network.slugName}-row] ${AMOUNT_TO_FROM}`).eq(index).should("have.text", activity.amountToFrom)
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`).eq(index).find("span").last().should("have.text", format(activity.timestamp * 1000, "HH:mm"))
                        cy.get(`[data-cy=${network.slugName}-row] ${TX_HASH_LINKS}`).eq(index).should("have.attr", "href", network.getLinkForTransaction(activity.txHash!))
                    })
                }
            })
        })

    }

    static validateNoHistoryMessage() {
        this.hasText(NO_ACTIVITY_TITLE, "No Activity History Available")
        this.hasText(NO_ACTIVITY_TEXT, "Connect wallet or view the dashboard as any address to see transactions.")
        this.isVisible(CONNECT_WALLET_BUTTON)
    }

    static openFilter() {
        this.click(ACTIVITY_FILTER)
    }

    static clickFilterToogle(toggle: string) {
        this.click(`[data-cy="${toggle}-toggle"]`)
    }

    static validateNoActivityByTypeShown(type: string) {
        cy.get(ACTIVITY_TYPE).each(el => {
            cy.wrap(el).find("span").first().should("not.have.text", type)
        })
    }

    static validateActivityVisibleByType(type: string) {
        cy.get(`${ACTIVITY_TYPE} span`).contains(type).should("be.visible")
    }

    static validateActivityVisibleByAddress(address: string) {
        cy.get(AMOUNT_TO_FROM).should("have.length", 2)
        cy.get(AMOUNT_TO_FROM).each(el => {
            cy.wrap(el).should("have.text", `From${BasePage.shortenHex(address)}`)
        })
    }

    static waitForSkeletonsToDisappear() {
        this.isVisible(SKELETON_ROW)
        this.doesNotExist(SKELETON_ROW)
    }

    static validateNoEntriesVisibleByNetwork(network: string) {
        this.doesNotExist(`[data-cy=${network}-row]`)
    }

    static validateActivityVisibleByNetwork(network: string) {
        this.isVisible(`[data-cy=${network}-row]`)
    }

    static mockActivityRequestTo(activity:string,network:string) {
        cy.fixture("activityHistoryEvents").then(events => {
        cy.intercept("POST",`*protocol-**-${networksBySlug.get(network).v1ShortName}`, (req => {
            if(req.body.operationName === "events") {
                req.continue(res => {
                    if(!events[activity]) {
                        throw new Error(`Unknown activity type: ${activity}`)
                    }
                    res.body.data.events = events[activity]
                })
            }
        }))
        })
    }

    static validateMockedActivityHistoryEntry(activity:string,network:string) {
        cy.get(ACTIVITY_NAME).last().should("have.text",activity)
        this.isVisible(`[data-cy=${networksBySlug.get(network).id}-icon]`)
        this.isVisible(TX_HASH_LINKS)
        this.hasAttributeWithValue(TX_HASH_LINKS,"href","https://polygonscan.com/tx/testTransactionHash")
        switch (activity) {
            case "Liquidated":
                cy.get(ACTIVITY_NAME).first().should("have.text","Send Transfer")
                cy.get(ACTIVITY_AMOUNT).first().should("have.text","1 TDLx")
                cy.get(AMOUNT_TO_FROM).first().should("have.text",`To${this.shortenHex("0x2597c6abba5724fb99f343abddd4569ee4223179")}`)
                cy.get(ACTIVITY_AMOUNT).last().should("have.text","-")
                cy.get(AMOUNT_TO_FROM).last().should("have.text",`To${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Wrap":
                this.hasText(ACTIVITY_AMOUNT,"-1 TDL")
                this.hasText(AMOUNT_TO_FROM,"+1 TDLx")
                break;
            case "Send Stream":
                this.hasText(ACTIVITY_AMOUNT,"1 TDLx/mo")
                this.hasText(AMOUNT_TO_FROM,`To${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Unwrap":
                this.hasText(ACTIVITY_AMOUNT,"-1 TDLx")
                this.hasText(AMOUNT_TO_FROM,"+1 TDL")
                break;
            case "Receive Transfer":
                this.hasText(ACTIVITY_AMOUNT,"1 TDLx")
                this.hasText(AMOUNT_TO_FROM,`From${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Stream Updated":
                this.hasText(ACTIVITY_AMOUNT,"1 TDLx/mo")
                this.hasText(AMOUNT_TO_FROM,`To${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Receive Stream":
                this.hasText(ACTIVITY_AMOUNT,"1 TDLx/mo")
                this.hasText(AMOUNT_TO_FROM,`From${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Stream Cancelled":
                this.hasText(ACTIVITY_AMOUNT,"0 TDLx/mo")
                this.hasText(AMOUNT_TO_FROM,`To${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Subscription Approved":
                this.hasText(ACTIVITY_AMOUNT," TDLx")
                this.hasText(AMOUNT_TO_FROM,`Publisher${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Subscription Updated":
                this.hasText(ACTIVITY_AMOUNT,"+100 units")
                this.hasText(AMOUNT_TO_FROM,`Publisher${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Subscription Rejected":
                this.hasText(ACTIVITY_AMOUNT,"TDLx")
                this.hasText(AMOUNT_TO_FROM,`Publisher${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;
            case "Index Created":
                this.hasText(ACTIVITY_AMOUNT,"TDLx")
                this.doesNotExist(AMOUNT_TO_FROM)
                break;
            case "Send Transfer":
                this.hasText(ACTIVITY_AMOUNT,"1 TDLx")
                this.hasText(AMOUNT_TO_FROM,`To${this.shortenHex("0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40")}`)
                break;

        }
    }
}