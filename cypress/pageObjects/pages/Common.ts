import {BasePage} from "../BasePage";
import {networksBySlug} from "../../../src/features/network/networks";
// @ts-ignore
import {MockProvider} from "@rsksmart/mock-web3-provider";
import shortenHex from "../../../src/utils/shortenHex";

const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";
const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
const CONNECTED_WALLET = "[data-cy=wallet-connection-status] span";
const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
const NAVIGATION_DRAWER = "[data-cy=navigation-drawer]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
const VIEW_MODE_INPUT = "[data-cy=view-mode-inputs]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input] input";
const VIEWED_ACCOUNT = "[data-cy=view-mode-chip] span";
const VIEW_MODE_CHIP_CLOSE =
    "[data-cy=view-mode-chip] [data-testid=CancelIcon]";
const WAGMI_CONNECT_WALLET_TITLE = "#rk_connect_title";
const ADDRESS_BOOK_ENTRIES = "[data-cy=address-book-entry]"
const ADDRESS_BOOK_RESULT_NAMES = "[data-cy=address-book-entry] span"
const ADDRESS_BOOK_RESULT_ADDRESS = "[data-cy=address-book-entry] p"
const TESTNETS_BUTTON = "[data-cy=testnets-button]";
const MAINNETS_BUTTON = "[data-cy=mainnets-button]";
const NETWORK_SELECTION_BUTTON = "[data-cy=network-selection-button]";
const DROPDOWN_BACKDROP = "[role=presentation]";

export class Common extends BasePage {
    static clickNavBarButton(button: string) {
        this.click(`${NAVIGATION_BUTTON_PREFIX + button}]`);
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
                this.visitPage("/wrap", mocked, account, network);
                break;
            case "send page":
                this.visitPage("/send", mocked, account, network);
                break;
            case "ecosystem page":
                this.visitPage("/ecosystem", mocked, account, network);
                break;
            case "address book page":
                this.visitPage("/address-book", mocked, account, network);
                break;
            case "activity history page":
                this.visitPage("/history", mocked, account, network);
                break;
            default:
                throw new Error(`Hmm, you haven't set up the link for : ${page}`);
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
                ? Cypress.env("STATIC_BALANCE_ACCOUNT_PRIVATE_KEY")
                : Cypress.env("ONGOING_STREAM_ACCOUNT_PRIVATE_KEY");
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
        this.click(`[data-cy=${network}-button]`);
    }

    static checkNavBarWalletStatus(account: string, message: string) {
        cy.fixture("commonData").then((commonData) => {
            this.hasText(WALLET_CONNECTION_STATUS, message);
            this.hasText(CONNECTED_WALLET, shortenHex(commonData[account]));
        });
    }

    static drawerConnectWalletButtonIsVisible() {
        this.isVisible(`${NAVIGATION_DRAWER} ${CONNECT_WALLET_BUTTON}`);
    }

    static viewAccount(account: string) {
        cy.fixture("commonData").then((commonData) => {
            this.click(VIEW_MODE_INPUT)
            this.type(ADDRESS_DIALOG_INPUT, commonData[account]);
        });
    }

    static viewModeChipDoesNotExist() {
        this.doesNotExist(VIEW_MODE_CHIP_CLOSE);
        this.doesNotExist(VIEWED_ACCOUNT);
    }

    static typeIntoAddressInput(address: string) {
        this.type(ADDRESS_DIALOG_INPUT,address)
    }

    static clickOnViewModeButton() {
        this.click(VIEW_MODE_INPUT)
    }

    static validateAddressBookSearchResult(name: string, address: string) {
        this.isVisible(ADDRESS_BOOK_ENTRIES)
        this.hasText(ADDRESS_BOOK_RESULT_NAMES,name)
        this.hasText(ADDRESS_BOOK_RESULT_ADDRESS,address)
    }

    static chooseFirstAddressBookResult() {
        this.click(ADDRESS_BOOK_ENTRIES)
    }

    static validateViewModeChipMessage(message: string) {
        this.hasText(VIEWED_ACCOUNT,`Viewing ${message}`)
    }

    static changeVisibleNetworksTo(type: string) {
        let clickableButton =
            type === "testnet" ? TESTNETS_BUTTON : MAINNETS_BUTTON;
        this.click(NETWORK_SELECTION_BUTTON);
        this.click(clickableButton);
        this.click(DROPDOWN_BACKDROP);
    }

    static openNetworkSelectionDropdown() {
        this.click(NETWORK_SELECTION_BUTTON);
    }

    static closeDropdown() {
        this.click(DROPDOWN_BACKDROP);
    }


}
