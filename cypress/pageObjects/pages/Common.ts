import {BasePage} from "../BasePage";
import {networksBySlug, superfluidRpcUrls} from "../../superData/networks";
// @ts-ignore
import {MockProvider} from "@rsksmart/mock-web3-provider";
import {ethers} from "ethers";
import HDWalletProvider from "@truffle/hdwallet-provider";

// @ts-ignore - web3-provider-engine doesn't have declaration files for these subproviders
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";

const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";
const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
const CONNECTED_WALLET = "[data-cy=wallet-connection-status] h6";
const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
const NAVIGATION_DRAWER = "[data-cy=navigation-drawer]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
const VIEW_MODE_INPUT = "[data-cy=view-mode-inputs]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input] input";
const VIEWED_ACCOUNT = "[data-cy=view-mode-chip] > span";
const VIEW_MODE_CHIP_CLOSE =
    "[data-cy=view-mode-chip] [data-testid=CancelIcon]";
const WAGMI_CONNECT_WALLET_TITLE = "#rk_connect_title";
const ADDRESS_BOOK_ENTRIES = "[data-cy=address-book-entry]"
const ADDRESS_BOOK_RESULT_NAMES = "[data-cy=address-book-entry] h6"
const ADDRESS_BOOK_RESULT_ADDRESS = "[data-cy=address-book-entry] p"
const TESTNETS_BUTTON = "[data-cy=testnets-button]";
const MAINNETS_BUTTON = "[data-cy=mainnets-button]";
const NETWORK_SELECTION_BUTTON = "[data-cy=network-selection-button]";
const DROPDOWN_BACKDROP = "[role=presentation]";
const ERROR_PAGE_MESSAGE = "[data-cy=404-message]"
const RETURN_TO_DASHBOARD_BUTTON = "[data-cy=return-to-dashboard-button]"
const HELP_CENTER_LINK = "[data-cy=help-center-link]"
const RESTORE_BUTTONS = "[data-testid=ReplayIcon]"
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]";
const STREAM_FLOW_RATES = "[data-cy=flow-rate]";
const START_END_DATES = "[data-cy=start-end-date]";
const DISCONNECT_BUTTON = "[data-testid=rk-disconnect-button]"
const RAINBOWKIT_CLOSE_BUTTON = "[aria-label=Close]"
const TX_ERROR = "[data-cy=tx-error]"
const NAVIGATION_MORE_BUTTON = "[data-cy=nav-more-button]"
const ACCESS_CODE_BUTTON = "[data-cy=more-access-code-btn]"
const ACCESS_CODE_INPUT = "[data-cy=access-code-input]"
const ACCESS_CODE_SUBMIT = "[data-cy=submit-access-code]"

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
        cy.fixture("streamData").then(streamData => {

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
                case "bridge page":
                    this.visitPage("/bridge", mocked, account, network);
                    break;
                case "ended stream details page":
                    this.visitPage(streamData["staticBalanceAccount"]["polygon"][0].v2Link, mocked, account, network);
                    break;
                case "ongoing stream details page":
                    this.visitPage(streamData["ongoingStreamAccount"]["polygon"][0].v2Link, mocked, account, network);
                    break;
                case "invalid stream details page":
                    this.visitPage("/stream/polygon/testing-testing-testing", mocked, account, network);
                    break;
                case "v1 ended stream details page":
                    this.visitPage(streamData["staticBalanceAccount"]["polygon"][0].v1Link, mocked, account, network);
                    break;
                case "close-ended stream details page":
                    this.visitPage(streamData["accountWithLotsOfData"]["goerli"][0].v2Link, mocked, account, network);
                    break;
                default:
                    throw new Error(`Hmm, you haven't set up the link for : ${page}`);
            }
        })
        if (Cypress.env("dev")) {
            //The nextjs error is annoying when developing test cases in dev mode
            cy.get("nextjs-portal").shadow().find("[aria-label=Close]").click()
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

    static openDashboardWithConnectedTxAccount(persona:string,network: string) {
        let selectedNetwork = network === "selected network" ? Cypress.env("network") : network
        let personas = ["alice","bob","dan","john"]
        let chosenPersona = personas.findIndex((el) => el === persona) + 1

        let chainId = networksBySlug.get(selectedNetwork)?.id

        let networkRpc = networksBySlug.get(selectedNetwork)?.rpcUrls.superfluid

        cy.visit("/", {
            onBeforeLoad: (win: any) => {
                const hdwallet = new HDWalletProvider({
                    privateKeys: [Cypress.env(`TX_ACCOUNT_PRIVATE_KEY${chosenPersona}`)],
                    url: networkRpc,
                    chainId: chainId,
                    pollingInterval: 1000,
                });

                if(Cypress.env("rejected")) {
                // Make HDWallet automatically reject transaction.
                // Inspired by: https://github.com/MetaMask/web3-provider-engine/blob/e835b80bf09e76d92b785d797f89baa43ae3fd60/subproviders/hooked-wallet.js#L326
                    for (const provider of hdwallet.engine._providers) {
                        if (provider.checkApproval) {
                          provider.checkApproval = function(type, didApprove, cb) {
                              cb(new Error('User denied '+type+' signature.') )
                          }
                        }
                    }
                }
                win.mockSigner = new ethers.providers.Web3Provider(hdwallet).getSigner();
            },
        });
        if (Cypress.env("dev")) {
            //The nextjs error is annoying when developing test cases in dev mode
            cy.get("nextjs-portal").shadow().find("[aria-label=Close]").click()
        }
        if(selectedNetwork === "ethereum") {
            this.click(NAVIGATION_MORE_BUTTON)
            this.click(ACCESS_CODE_BUTTON)
            this.type(ACCESS_CODE_INPUT ,"724ZX_ENS")
            this.click(ACCESS_CODE_SUBMIT)
        }
        this.changeNetwork(selectedNetwork)
        this.clickConnectWallet()
        this.clickMockWallet()
        //Workaround for the connection issue after mainnet branch was merged
        let workaroundNetwork = selectedNetwork === "goerli" ? "polygon-mumbai" : "goerli"
        this.changeNetwork(workaroundNetwork)
        this.changeNetwork(selectedNetwork)
    }

    static clickConnectWallet() {
        this.clickFirstVisible("[data-cy=connect-wallet-button]");
    }

    static clickInjectedWallet() {
        this.isVisible(WAGMI_CONNECT_WALLET_TITLE);
        cy.contains("Injected Wallet").click();
    }

    static clickMockWallet() {
        this.isVisible(WAGMI_CONNECT_WALLET_TITLE);
        cy.contains("Mock").click();
    }

    static changeNetwork(network: string) {
        this.click(TOP_BAR_NETWORK_BUTTON);
        this.click(MAINNETS_BUTTON)
        if (networksBySlug.get(network)?.testnet) {
            this.click(TESTNETS_BUTTON)
        }
        this.click(`[data-cy=${network}-button]`);
    }

    static checkNavBarWalletStatus(account: string, message: string) {
        cy.fixture("commonData").then((commonData) => {
            this.hasText(WALLET_CONNECTION_STATUS, message);
            this.hasText(CONNECTED_WALLET, BasePage.shortenHex(commonData[account]));
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
        this.type(ADDRESS_DIALOG_INPUT, address)
    }

    static clickOnViewModeButton() {
        this.click(VIEW_MODE_INPUT)
    }

    static validateAddressBookSearchResult(name: string, address: string) {
        this.isVisible(ADDRESS_BOOK_ENTRIES)
        this.hasText(ADDRESS_BOOK_RESULT_NAMES, name)
        this.hasText(ADDRESS_BOOK_RESULT_ADDRESS, address)
    }

    static chooseFirstAddressBookResult() {
        this.click(ADDRESS_BOOK_ENTRIES)
    }

    static validateViewModeChipMessage(message: string) {
        this.hasText(VIEWED_ACCOUNT, `Viewing ${message}`)
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

    static errorPageIsVisible() {
        this.isVisible(ERROR_PAGE_MESSAGE)
        this.isVisible(RETURN_TO_DASHBOARD_BUTTON)
        this.isVisible(HELP_CENTER_LINK)
    }

    static restoreLastTx() {
        this.clickFirstVisible(RESTORE_BUTTONS)
    }

    static validateStreamsTable(network:string , selector:string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            this.hasLength(selector, networkSpecificData[
                network
                ].ongoingStreamsAccount.tokenValues.streams.length)
            networkSpecificData[
                network
                ].ongoingStreamsAccount.tokenValues.streams.forEach(
                (stream: any, index: number) => {
                    cy.get(`${selector} ${STREAM_FLOW_RATES}`)
                        .eq(index)
                        .should("have.text", stream.flowRate);
                    cy.get(`${selector} ${SENDER_RECEIVER_ADDRESSES}`)
                        .eq(index)
                        .should("have.text", stream.fromTo);
                    cy.get(`${selector} ${START_END_DATES}`)
                        .eq(index)
                        .should("have.text", stream.endDate);
                }
            );
        });
    }

    static mockQueryToEmptyState(operationName:string) {
        cy.intercept("POST","**protocol-v1**" , (req) => {
            const { body } = req;
            if(body.hasOwnProperty("operationName") && body.operationName === operationName) {
                req.alias = `${operationName}Query`
                req.continue((res) => {
                    res.body.data[operationName] = []
                })
            }
        })
    }


    static disconnectWallet() {
        this.click(WALLET_CONNECTION_STATUS)
        this.click(DISCONNECT_BUTTON)
    }

    static wait(seconds: number) {
        cy.wait(seconds * 1000)
    }

    static transactionRejectedErrorIsShown() {
        cy.get(TX_ERROR,{timeout:45000}).should("have.text","Transaction Rejected")
    }
}
