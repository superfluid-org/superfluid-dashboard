import {BasePage} from "../BasePage";
import {mainNetworks, networksBySlug, testNetworks} from "../../../src/features/network/networks";

const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]"
const DASHBOARD_CONNECT_PLACEHOLDER = "[data-cy=dashboard-placeholder-connect]"
const NETWORK_SNAPSHOT_TABLE_APPENDIX = "-token-snapshot-table]"
const TOKEN_SYMBOLS = "[data-cy=token-symbol]"
const TOKEN_BALANCES = "[data-cy=balance]"
const NETWORK_SELECTION_BUTTON = "[data-cy=network-selection-button]"
const TESTNETS_BUTTON = "[data-cy=testnets-button]"
const MAINNETS_BUTTON = "[data-cy=mainnets-button]"
const NETWORK_SELECTION_BACKDROP = "[role=presentation]"
const CANCEL_BUTTON_BACKDROP = "[class*=backdrop]"
const NETWORK_SELECTION_TOGGLE_APPENDIX = "-toggle]"
const NO_BALANCE_WRAP_BUTTON = "[data-cy=no-balance-wrap-button]"
const NO_BALANCE_MESSAGE = "[data-cy=no-balance-message]"
const LOADING_SKELETONS = "[data-cy=loading-skeletons]"
const NET_FLOW_VALUES = "[data-cy=net-flow-value]"
const INFLOW_VALUES = "[data-cy=inflow]"
const OUTFLOW_VALUES = "[data-cy=outflow]"
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]"
const STREAM_FLOW_RATES = "[data-cy=flow-rate]"
const START_END_DATES = "[data-cy=start-end-date]"
const CANCEL_BUTTONS = "[data-cy=cancel-button]"
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]"
const TOOLTIPS = "[role=tooltip]"

export class DashboardPage extends BasePage {

    static checkIfDashboardConnectIsVisible() {
        this.isVisible(DASHBOARD_CONNECT_PLACEHOLDER)
        this.isVisible(CONNECT_WALLET_BUTTON)
        //2 buttons should be visible, one in the nav drawer, one in the dashboard page
        this.hasLength(CONNECT_WALLET_BUTTON,2)
    }

    static verifyBalancesForAccount(networkType: string, account: string) {
        let network = networkType === "testnet" ? testNetworks : mainNetworks
            network.forEach((network) => {
                cy.fixture("networkSpecificData").then((networkSpecificData) => {
                    networkSpecificData[network.slugName][account].tokenValues.forEach((tokenValues:any , index:number) => {
                            cy.get("[data-cy="+network.slugName + NETWORK_SNAPSHOT_TABLE_APPENDIX + " " + TOKEN_SYMBOLS).eq(index).should("have.text",tokenValues.token)
                            cy.get("[data-cy="+network.slugName + NETWORK_SNAPSHOT_TABLE_APPENDIX + " " + TOKEN_BALANCES).eq(index).should("have.text",tokenValues.value)
                        })
                })
            })
    }

    static changeVisibleNetworksTo(type: string) {
            let clickableButton = type === "testnet" ? TESTNETS_BUTTON : MAINNETS_BUTTON
            this.click(NETWORK_SELECTION_BUTTON)
            this.click(clickableButton)
            this.click(NETWORK_SELECTION_BACKDROP)
    }

    static clickNetworkSelectionToogle(network:string) {
        this.click("[data-cy=" + network + NETWORK_SELECTION_TOGGLE_APPENDIX)
    }

    static tokenBalancesAreNotVisible(network: string) {
        this.doesNotExist("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX)
    }

    static noBalancesScreenIsVisible() {
        this.isVisible(NO_BALANCE_WRAP_BUTTON)
        this.isVisible(NO_BALANCE_MESSAGE)
    }

    static clickNoBalanceWrapButton() {
        this.click(NO_BALANCE_WRAP_BUTTON)
    }

    static openNetworkSelectionDropdown() {
        this.click(NETWORK_SELECTION_BUTTON)
    }

    static waitForBalancesToLoad() {
        this.isVisible(LOADING_SKELETONS)
        this.doesNotExist(LOADING_SKELETONS)
    }

    static closeNetworkSelectionDropdown() {
        this.click(NETWORK_SELECTION_BACKDROP)
    }

    static clickTokenStreamRow(network: string ,token:string) {
        this.click("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + token + "-cell]")
    }

    static validateTokenTotalFlowRates(network: string, token: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let flowValues = networkSpecificData[network].ongoingStreamsAccount.tokenValues
            this.hasText("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + token + "-cell] " + NET_FLOW_VALUES, flowValues.netFlowRate)
            this.hasText("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + token + "-cell] " + OUTFLOW_VALUES, flowValues.outFlow)
            this.hasText("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + token + "-cell] " + INFLOW_VALUES, flowValues.inFlow)
        })
    }

    static validateTokenStreams(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let specificSelector = "[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + networkSpecificData[network].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase() + "-streams] "
            networkSpecificData[network].ongoingStreamsAccount.tokenValues.streams.forEach((stream:any, index:number) => {
                cy.get(specificSelector + STREAM_FLOW_RATES).eq(index).should("have.text",stream.flowRate)
                cy.get(specificSelector + SENDER_RECEIVER_ADDRESSES).eq(index).should("have.text",stream.fromTo)
                cy.get(specificSelector + START_END_DATES).eq(index).should("have.text",stream.endDate)
            })
        })
    }

    static clickFirstCancelButton() {
        this.click(CANCEL_BUTTONS)
    }

    static cancelStreamButtonIsVisible() {
        this.isVisible(CANCEL_STREAM_BUTTON)
    }

    static clickOnCancelStreamBackdrop() {
        this.click(CANCEL_BUTTON_BACKDROP)
    }

    static cancelStreamButtonDoesNotExist() {
        this.doesNotExist(CANCEL_STREAM_BUTTON)
    }

    static validateAllCancelButtonsDisabledForToken(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            console.log(networkSpecificData[network])
        cy.get("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=" + networkSpecificData[network].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase() + "-streams] [data-cy=cancel-button]").each((button:any) => {
            cy.wrap(button).should("have.attr","disabled")
        })
        })
    }

    static hoverOnFirstCancelButton(network:string) {
        cy.get("[data-cy=" + network + NETWORK_SNAPSHOT_TABLE_APPENDIX + " [data-cy=switch-network-tooltip]").first().trigger("mouseover")
    }

    static validateChangeNetworkTooltip(network:string) {
        //let expectedMessage = "Please switch provider network to " + networksBySlug.get(network)?.networkName + " in order to cancel the stream."
        this.isVisible(TOOLTIPS)
       // this.hasText(TOOLTIPS, expectedMessage)
    }
}