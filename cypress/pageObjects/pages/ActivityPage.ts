import {BasePage} from "../BasePage";
import {mainNetworks, networksBySlug, testNetworks} from "../../../src/features/network/networks";
import {Common} from "./Common";
import { format } from "date-fns";
import shortenHex from "../../../src/utils/shortenHex";

const ACTIVITY_TYPE = "[data-cy=activity]"
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


export class ActivityPage extends BasePage {


    static saveActivityHistoryData(){
        let activityHistoryData:any = { account: {}}
        Common.closeDropdown()
        cy.get(SKELETON_ROW).should("not.exist" , {timeout: 60000})
        cy.wait(30000)
        mainNetworks.forEach(network => {
            this.recordNetworkData(network,activityHistoryData)
        })
        Common.changeVisibleNetworksTo("testnet")
        cy.get(SKELETON_ROW).should("not.exist" , {timeout: 60000})
        cy.wait(30000)
        testNetworks.forEach(network => {
            this.recordNetworkData(network,activityHistoryData)
        })
        cy.writeFile("cypress/record/activityData.json" , activityHistoryData)
        console.log(activityHistoryData)
    }

    static recordNetworkData(network:any ,json:any) {
        json.account[network.slugName] = []
        cy.get("body").then(el => {
            if(el.find(`[data-cy=${network.slugName}-row]`).length > 0) {
                cy.get(`[data-cy=${network.slugName}-row]`).each((row, index) => {
                    let savableRow:any = json.account[network.slugName][index] = {}
                    cy.wrap(row).find(TOKEN_ICONS).should("exist").then(() => {
                        // To save the correct timestamp
                        // You need to remove the formatting from the entries before recording
                        savableRow.timestamp = parseInt(row.find(`${ACTIVITY_TYPE} span`).last().text())
                        savableRow.activity =  row.find(`${ACTIVITY_TYPE} span`).first().text()
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

    static validateActivityHistoryForAccount(account:string,networkType:string) {
        let testAbleNetworks = networkType === "testnet" ? testNetworks : mainNetworks
        cy.fixture("activityHistoryData").then(data => {
            testAbleNetworks.forEach(network => {
                if(data[account][network.slugName][0]){
                    //The entries load faster than the amounts shown, check to make sure all are loaded
                    cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}` , {timeout:45000}).should("have.length" , data[account][network.slugName].length)
                    data[account][network.slugName].forEach((activity:any ,index:number) => {
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}`).eq(index).should("have.text",activity.amount)
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`).eq(index).find("span").first().should("have.text",activity.activity)
                        cy.get(`[data-cy=${network.slugName}-row] ${AMOUNT_TO_FROM}`).eq(index).should("have.text",activity.amountToFrom)
                        cy.get(`[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`).eq(index).find("span").last().should("have.text",format(activity.timestamp * 1000, "HH:mm") )
                        cy.get(`[data-cy=${network.slugName}-row] ${TX_HASH_LINKS}`).eq(index).should("have.attr","href",network.getLinkForTransaction(activity.txHash))
                    })

                }
            })
        })

    }

    static validateNoHistoryMessage() {
        this.hasText(NO_ACTIVITY_TITLE , "No Activity History Available")
        this.hasText(NO_ACTIVITY_TEXT , "Transactions including wrapping tokens and sending streams will appear here.")
    }

    static openFilter() {
        this.click(ACTIVITY_FILTER)
    }

    static clickFilterToogle(toggle: string) {
        this.click(`[data-cy="${toggle}-toggle"]`)
    }

    static validateNoActivityByTypeShown(type: string) {
        cy.get(ACTIVITY_TYPE).each( el => {
            cy.wrap(el).find("span").first().should("not.have.text",type)
        })
    }

    static validateActivityVisibleByType(type: string) {
        cy.get(`${ACTIVITY_TYPE} span`).contains(type).should("be.visible")
    }

    static validateActivityVisibleByAddress(address: string) {
        cy.get(AMOUNT_TO_FROM).should("have.length",2)
        cy.get(AMOUNT_TO_FROM).each(el => {
            cy.wrap(el).should("have.text",`From${shortenHex(address)}`)
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

}