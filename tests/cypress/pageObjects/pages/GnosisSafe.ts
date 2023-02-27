///<reference types="cypress-iframe" />
import {BasePage} from "../BasePage";
import {networksBySlug} from "../../superData/networks";
import {
    TOP_BAR_NETWORK_BUTTON,
    NAVIGATION_MORE_BUTTON,
    ACCESS_CODE_BUTTON,
    ACCESS_CODE_INPUT,
    ACCESS_CODE_SUBMIT,
    CONNECT_WALLET_BUTTON,
    CONNECTED_WALLET,
    WALLET_CONNECTION_STATUS
} from "./Common";

const GNOSIS_BUTTONS = ".MuiButton-contained"
const GNOSIS_SAFE_WALLET_OPTION = "[data-testid=rk-wallet-option-gnosis-safe]"
const SUPERFLUID_IFRAME = 'iframe[title="Superfluid Dashboard"]'
const LOADING_SPINNER = ".MuiCircularProgress-root"
const GNOSIS_WARNING_CHECKBOX = ".PrivateSwitchBase-input"

const GnosisSafePrefixByNetworkSlug = {
    "gnosis": "gno:",
    "ethereum": "eth:",
    "polygon": "matic:",
    "bsc": "bnb:",
    "arbitrum-one": "arb1:",
    "avalanche": "avax:",
    "optimism": "oeth:",
    "goerli": "gor:"
}

const GnosisSafeAddressesPerNetwork = {
    "gnosis": "0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49",
    "ethereum": "0x982046AeF10d24b938d85BDBBe262B811b0403b7",
    "polygon": "0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05",
    "bsc": "0x36136B6b657D02812E4E8B88d23B552320F84698",
    "arbitrum-one": "0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501",
    "avalanche": "0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0",
    "optimism": "0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788",
    "goerli": "0x3277Ea3910A354621f144022647082E1E06fDe8a"
}

export class GnosisSafe extends BasePage {
    static openSafeOnNetwork(network: string) {
        cy.wrap(network).as("selectedNetwork")
        cy.visit(`https://app.safe.global/${GnosisSafePrefixByNetworkSlug[network]}${GnosisSafeAddressesPerNetwork[network]}/apps?appUrl=${Cypress.config("baseUrl")}`)

    }

    static continueDisclaimer() {
        cy.get(GNOSIS_BUTTONS).contains("Accept all").click()
        cy.get(GNOSIS_BUTTONS).contains("Continue").click()
        cy.get(GNOSIS_WARNING_CHECKBOX).click()
        //Cypress too fast :(
        cy.wait(1000)
        cy.get(GNOSIS_BUTTONS).contains("Continue").click()
        cy.get(LOADING_SPINNER).should("be.visible")
        cy.get(LOADING_SPINNER).should("not.exist")
    }

    static validateThatDashboardLoaded() {
        cy.frameLoaded(SUPERFLUID_IFRAME)
        cy.enter(SUPERFLUID_IFRAME).then(getBody => {
            getBody().find(CONNECT_WALLET_BUTTON).should("be.visible")
        })
    }

    static connectGnosisSafeWallet() {
        cy.enter(SUPERFLUID_IFRAME).then(getBody => {
            cy.get("@selectedNetwork").then((network) => {
                // @ts-ignore
                if (network === "ethereum") {
                    getBody().find(NAVIGATION_MORE_BUTTON).click();
                    getBody().find(ACCESS_CODE_BUTTON).click();
                    getBody().find(ACCESS_CODE_INPUT).type("AHR2_MAINNET");
                    getBody().find(ACCESS_CODE_SUBMIT).click();
                }
            })
            getBody().find(CONNECT_WALLET_BUTTON).first().click()
            getBody().find(GNOSIS_SAFE_WALLET_OPTION).click()
        })
    }

    static validateCorrectlyConnectedWallet(network: string) {
        cy.enter(SUPERFLUID_IFRAME).then(getBody => {
            getBody().find(CONNECTED_WALLET).should("have.text", BasePage.shortenHex(GnosisSafeAddressesPerNetwork[network]))
            getBody().find(WALLET_CONNECTION_STATUS).should("have.text", "Connected")
            getBody().find(TOP_BAR_NETWORK_BUTTON).should("contain.text", networksBySlug.get(network).name)
        })
    }
}