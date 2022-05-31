import {BasePage} from "../BasePage";
import {networksBySlug} from "../../../src/features/network/networks";
// @ts-ignore
import { MockProvider } from "@rsksmart/mock-web3-provider";
import shortenAddress from "../../../src/utils/shortenAddress";

const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";
const INJECTED_WALLET_BUTTON = "[data-cy=injected-wallet]";
const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
const CONNECTED_WALLET = "[data-cy=wallet-connection-status] span"
const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
const NAVIGATION_DRAWER = "[data-cy=navigation-drawer]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";

export class Common extends BasePage {
    static clickNavBarButton(button: string) {
        this.click(NAVIGATION_BUTTON_PREFIX + button + "]")
    }

    static openPage(page: string) {
        switch(page.toLowerCase()) {
            case "dashboard page":
                cy.visit("/")
                break;
            case "wrap page":
                cy.visit("/wrap?upgrade")
                break;
            case "send page":
                cy.visit("/send")
                break;
        }
    }

    static openPageWithMockedProvider(page : string,account : string,network :string) {
        let usedAccountPrivateKey = account === "staticBalanceAccount" ? "f71d82b0cf12f254e05ea19698332588a7c4f3a4916516d58e8b55c2681c09f6" : "b10c648af33a1ca521700055f57663d7e293cc1501390544283c6528ba458d9b"
        cy.fixture("commonData").then((commonData) => {
           console.log()
        cy.visit("/", {
            onBeforeLoad(win) {
                win.ethereum = new MockProvider({ address: commonData[account], privateKey:usedAccountPrivateKey, networkVersion: networksBySlug.get(network)?.chainId, debug:false ,answerEnable:true})
            },
        });
        })

    }

    static clickConnectWallet() {
        this.clickFirstVisible("[data-cy=connect-wallet-button]")
    }

    static clickInjectedWallet() {
        cy.contains("Injected Wallet").click()
    }

    static changeNetwork(network: string ) {
        this.click(TOP_BAR_NETWORK_BUTTON)
        this.click("[data-cy=" + network + "-button]")
    }

    static checkNavBarWalletStatus(account: string, message: string) {
        cy.fixture("commonData").then((commonData) => {
            this.hasText(WALLET_CONNECTION_STATUS, message)
            this.hasText(CONNECTED_WALLET,shortenAddress(commonData[account]))
        })
    }

    static drawerConnectWalletButtonIsVisible() {
        this.isVisible(NAVIGATION_DRAWER + " " + CONNECT_WALLET_BUTTON)
    }
}