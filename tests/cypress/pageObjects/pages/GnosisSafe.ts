///<reference types="cypress-iframe" />
import {BasePage} from "../BasePage";

const GNOSIS_BUTTONS = ".MuiButton-contained"
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]"
const GNOSIS_SAFE_WALLET_OPTION = "[data-testid=rk-wallet-option-gnosis-safe]"
const WALLET_CONNECTION_ADDRESS = "[data-cy=wallet-connection-status] h6"
const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p"
const SELECTED_NETWORK = "[data-cy=top-bar-network-button]"

const GnosisSafeAddressesPerNetwork = {
    gnosis: "gno:0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49"
}

export class GnosisSafe extends BasePage {
    static openSafeOnNetwork(network: string) {
        cy.visit(`https://app.safe.global/${GnosisSafeAddressesPerNetwork[network]}/apps?appUrl=${Cypress.config("baseUrl")}`)
    }

    static continueDisclaimer() {
        cy.get(GNOSIS_BUTTONS).contains("Accept all").click()
        cy.get(GNOSIS_BUTTONS).contains("Continue").click()
        cy.get(".PrivateSwitchBase-input").click()
        cy.wait(1000)
        cy.get(GNOSIS_BUTTONS).contains("Continue").click()
        cy.get(".MuiCircularProgress-root").should("be.visible")
        cy.get(".MuiCircularProgress-root").should("not.exist")
    }

    static validateThatDashboardLoaded() {
        cy.frameLoaded('iframe[title="Superfluid Dashboard"]')
        cy.enter('iframe[title="Superfluid Dashboard"]').then(getBody => {
            getBody().find(CONNECT_WALLET_BUTTON).first().click()
            getBody().find(GNOSIS_SAFE_WALLET_OPTION).click()
            getBody().find(WALLET_CONNECTION_ADDRESS).should("have.text", BasePage.shortenHex("0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49"))
            getBody().find(WALLET_CONNECTION_STATUS).should("have.text", "Connected")
            getBody().find(SELECTED_NETWORK).should("have.text", "Gnosis Chain")
        })

    }
}