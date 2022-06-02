import {BasePage} from "../BasePage";
import {networksBySlug} from "../../../src/features/network/networks";
// @ts-ignore
import {MockProvider} from "@rsksmart/mock-web3-provider";
import shortenAddress from "../../../src/utils/shortenAddress";

const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";
const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
const CONNECTED_WALLET = "[data-cy=wallet-connection-status] span";
const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
const NAVIGATION_DRAWER = "[data-cy=navigation-drawer]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
const VIEW_MODE_INPUT = "[data-cy=view-mode-inputs] input";
const VIEW_MODE_SEARCH = "[data-cy=view-mode-search-button]";
const VIEWED_ACCOUNT = "[data-cy=view-mode-chip] span";
const VIEW_MODE_CHIP_CLOSE =
    "[data-cy=view-mode-chip] [data-testid=CancelIcon]";
const WAGMI_CONNECT_WALLET_TITLE = "#rk_connect_title";

export class Common extends BasePage {
    static clickNavBarButton(button: string) {
        this.click(NAVIGATION_BUTTON_PREFIX + button + "]");
    }

    static openPage(
        page: string,
        mocked: boolean = false,
        account?: string,
        network?: string
    ) {
        switch (page.toLowerCase()) {
            case "dashboard page":
                this.visitPage("/", mocked, account, network);
                break;
            case "wrap page":
                this.visitPage("/wrap?upgrade", mocked, account, network);
                break;
            case "send page":
                this.visitPage("/send", mocked, account, network);
                break;
            default:
                throw new Error("Hmm, you haven't set up the link for : " + page);
        }
    }

    static visitPage(
        page: string,
        mocked: boolean = false,
        account?: string,
        network?: string
    ) {
        let usedAccountPrivateKey =
            account === "staticBalanceAccount"
                ? "f71d82b0cf12f254e05ea19698332588a7c4f3a4916516d58e8b55c2681c09f6"
                : "b10c648af33a1ca521700055f57663d7e293cc1501390544283c6528ba458d9b";
        if (mocked && account && network) {
            cy.fixture("commonData").then((commonData) => {
                cy.visit(page, {
                    onBeforeLoad: (win) => {
                        win.ethereum = new MockProvider({
                            address: commonData[account],
                            privateKey: usedAccountPrivateKey,
                            networkVersion: networksBySlug.get(network)?.id,
                            debug: false,
                            answerEnable: true,
                        });
                    },
                });
            });
        } else {
            cy.visit(page);
        }
    }

    static clickConnectWallet() {
        this.clickFirstVisible("[data-cy=connect-wallet-button]");
    }

    static clickInjectedWallet() {
        this.isVisible(WAGMI_CONNECT_WALLET_TITLE);
        cy.contains("Injected Wallet").click();
    }

    static changeNetwork(network: string) {
        this.click(TOP_BAR_NETWORK_BUTTON);
        this.click("[data-cy=" + network + "-button]");
    }

    static checkNavBarWalletStatus(account: string, message: string) {
        cy.fixture("commonData").then((commonData) => {
            this.hasText(WALLET_CONNECTION_STATUS, message);
            this.hasText(CONNECTED_WALLET, shortenAddress(commonData[account]));
        });
    }

    static drawerConnectWalletButtonIsVisible() {
        this.isVisible(NAVIGATION_DRAWER + " " + CONNECT_WALLET_BUTTON);
    }

    static viewAccount(account: string) {
        cy.fixture("commonData").then((commonData) => {
            this.type(VIEW_MODE_INPUT, commonData[account]);
            this.click(VIEW_MODE_SEARCH);
        });
    }

    static viewModeChipDoesNotExist() {
        this.doesNotExist(VIEW_MODE_CHIP_CLOSE);
        this.doesNotExist(VIEWED_ACCOUNT);
    }
}
