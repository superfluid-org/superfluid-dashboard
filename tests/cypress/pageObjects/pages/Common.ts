import {BasePage, wordTimeUnitMap} from "../BasePage";
import { networksBySlug, superfluidRpcUrls } from "../../superData/networks";
import {BigNumber, ethers} from "ethers";
import HDWalletProvider from "@truffle/hdwallet-provider";
import {MockProvider} from "@rsksmart/mock-web3-provider";
import Web3 from "web3";

export const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
export const CONNECTED_WALLET = "[data-cy=wallet-connection-status] h6";
export const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
export const NAVIGATION_MORE_BUTTON = "[data-cy=nav-more-button]";
export const ACCESS_CODE_BUTTON = "[data-cy=more-access-code-btn]";
export const ACCESS_CODE_INPUT = "[data-cy=access-code-input]";
export const ACCESS_CODE_SUBMIT = "[data-cy=submit-access-code]";
export const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
export const CHANGE_NETWORK_BUTTON = "[data-cy=change-network-button]"
const VESTING_CODE_BUTTON = "[data-cy=vesting-code-button]"
const NAVIGATION_BUTTON_PREFIX = "[data-cy=nav-";
const NAVIGATION_DRAWER = "[data-cy=navigation-drawer]";
const VIEW_MODE_INPUT = "[data-cy=view-mode-inputs]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input] input";
const VIEWED_ACCOUNT = "[data-cy=view-mode-chip] > span";
const VIEW_MODE_CHIP_CLOSE =
  "[data-cy=view-mode-chip] [data-testid=CancelIcon]";
const WAGMI_CONNECT_WALLET_TITLE = "#rk_connect_title";
const ADDRESS_BOOK_ENTRIES = "[data-cy=address-book-entry]";
const ADDRESS_BOOK_RESULT_NAMES = "[data-cy=address-book-entry] h6";
const ADDRESS_BOOK_RESULT_ADDRESS = "[data-cy=address-book-entry] p";
const TESTNETS_BUTTON = "[data-cy=testnets-button]";
const MAINNETS_BUTTON = "[data-cy=mainnets-button]";
const NETWORK_SELECTION_BUTTON = "[data-cy=network-selection-button]";
const DROPDOWN_BACKDROP = "[role=presentation]";
const ERROR_PAGE_MESSAGE = "[data-cy=404-message]";
const RETURN_TO_DASHBOARD_BUTTON = "[data-cy=return-to-dashboard-button]";
const HELP_CENTER_LINK = "[data-cy=help-center-link]";
const RESTORE_BUTTONS = "[data-testid=ReplayIcon]";
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]";
const STREAM_FLOW_RATES = "[data-cy=flow-rate]";
const START_END_DATES = "[data-cy=start-end-date]";
const DISCONNECT_BUTTON = "[data-testid=rk-disconnect-button]";
const RAINBOWKIT_CLOSE_BUTTON = "[aria-label=Close]";
const TX_ERROR = "[data-cy=tx-error]";
const CLOSE_BUTTON = "[data-testid=CloseRoundedIcon]";
const ACCESS_CODE_DIALOG = "[data-cy=access-code-dialog]";
const ACCESS_CODE_ERROR = "[data-cy=access-code-error]";
const ACCESS_CODE_MESSAGE = "[data-cy=access-code-error-msg]";
const VESTING_ACCESS_CODE_BUTTON = "[data-cy=more-vesting-code-btn]";
const STREAM_ROWS = "[data-cy=stream-row]"
const TIMER_ICONS = "[data-testid=TimerOutlinedIcon]"
const FAUCET_BUTTON = "[data-cy=more-faucet-btn]";
const CLAIM_TOKENS_BUTTON = "[data-cy=claim-button]"
const FAUCET_SUCCESS_MESSAGE = "[data-cy=faucet-success]"
const FAUCET_ERROR_MESSAGE = "[data-cy=faucet-error]"
const FAUCET_GO_TO_DASHBOARD = "[data-cy=open-dashboard-button]"
const FAUCET_WRAP_BUTTON = "[data-cy=wrap-button]"
const MUI_PRESENTATION = ".MuiDialog-root [role=presentation]"
const FAUCET_WALLET_ADDRESS = "[data-cy=connected-address] input"
const TOKEN_CHIPS = ".MuiChip-root"
const FAUCET_CONTRACT_ADDRESS = "0x74CDF863b00789c29734F8dFd9F83423Bc55E4cE"

export class Common extends BasePage {
  static clickNavBarButton(button: string) {
    this.click(`${NAVIGATION_BUTTON_PREFIX + button}]`);
  }

  static openPage(
    page: string,
    account?: string,
    network?: string
  ) {
    cy.fixture("streamData").then((streamData) => {
      cy.fixture("vestingData").then((vestingData) => {
        switch (page.toLowerCase()) {
          case "dashboard page":
            this.visitPage(`/`, account, network);
            break;
          case "wrap page":
            this.visitPage("/wrap", account, network);
            break;
          case "send page":
            this.visitPage("/send", account, network);
            break;
          case "ecosystem page":
            this.visitPage("/ecosystem", account, network);
            break;
          case "address book page":
            this.visitPage("/address-book", account, network);
            break;
          case "activity history page":
            this.visitPage("/history", account, network);
            break;
          case "bridge page":
            this.visitPage("/bridge", account, network);
            break;
          case "ended stream details page":
            this.visitPage(
              streamData["staticBalanceAccount"]["polygon"][0].v2Link,
              account,
              network
            );
            break;
          case "ongoing stream details page":
            this.visitPage(
              streamData["ongoingStreamAccount"]["polygon"][0].v2Link,
              account,
              network
            );
            break;
          case "invalid stream details page":
            this.visitPage(
              "/stream/polygon/testing-testing-testing",
              account,
              network
            );
            break;
          case "v1 ended stream details page":
            this.visitPage(
              streamData["staticBalanceAccount"]["polygon"][0].v1Link,
              account,
              network
            );
            break;
          case "close-ended stream details page":
            this.visitPage(
              streamData["accountWithLotsOfData"]["goerli"][0].v2Link,
              account,
              network
            );
            break;
          case "vesting details page":
            this.visitPage(
              `/vesting/goerli/${vestingData.goerli.fUSDCx.schedule.id}`
            );
            break;
          case "vesting stream details page":
            this.visitPage(
              `/stream/polygon/${vestingData.polygon.USDCx.vestingStream.id}`
            );
            break;
          case "accounting export page":
            this.visitPage(`/accounting`);
            break;
          default:
            throw new Error(`Hmm, you haven't set up the link for : ${page}`);
        }
      });
    });
    if (Cypress.env("dev")) {
      //The nextjs error is annoying when developing test cases in dev mode
      cy.get("nextjs-portal").shadow().find("[aria-label=Close]").click();
    }
  }

  static visitPage(
    page: string,
    account?: string,
    network?: string
  ) {
    if (account && network) {
      this.openDashboardWithConnectedTxAccount(page,account,network)
    } else {
      cy.visit(page);
    }
  }

  static openDashboardWithConnectedTxAccount(page : string, persona: string, network: string) {
    let usedAccountPrivateKey;
    let personas = ["alice", "bob", "dan", "john"];
    let selectedNetwork =
        network === "selected network" ? Cypress.env("network") : network;
    if (personas.includes(persona)) {
      let chosenPersona = personas.findIndex((el) => el === persona) + 1;
      usedAccountPrivateKey = Cypress.env(`TX_ACCOUNT_PRIVATE_KEY${chosenPersona}`)
    }
    if (persona === "NewRandomWallet") {
      usedAccountPrivateKey = this.generateNewWallet()
    } else {
      usedAccountPrivateKey = persona === "staticBalanceAccount"
          ? Cypress.env("STATIC_BALANCE_ACCOUNT_PRIVATE_KEY")
          : Cypress.env("ONGOING_STREAM_ACCOUNT_PRIVATE_KEY");
    }

    let chainId = networksBySlug.get(selectedNetwork)?.id;

    let networkRpc = networksBySlug.get(selectedNetwork)?.superfluidRpcUrl;

    cy.visit(page, {
      onBeforeLoad: (win: any) => {
        const hdwallet = new HDWalletProvider({
          privateKeys: [usedAccountPrivateKey],
          url: networkRpc,
          chainId: chainId,
          pollingInterval: 1000,
        });

        if (Cypress.env("rejected")) {
          // Make HDWallet automatically reject transaction.
          // Inspired by: https://github.com/MetaMask/web3-provider-engine/blob/e835b80bf09e76d92b785d797f89baa43ae3fd60/subproviders/hooked-wallet.js#L326
          for (const provider of hdwallet.engine["_providers"]) {
            if (provider.checkApproval) {
              provider.checkApproval = function (type, didApprove, cb) {
                cb(new Error(`User denied ${type} signature.`));
              };
            }
          }
        }
        // @ts-ignore
        win.mockSigner = new ethers.providers.Web3Provider(
          hdwallet
        ).getSigner();
      },
    });
    if (Cypress.env("dev")) {
      //The nextjs error is annoying when developing test cases in dev mode
      cy.get("nextjs-portal").shadow().find("[aria-label=Close]").click();
    }
    if (Cypress.env("vesting")) {
      this.clickNavBarButton("vesting")
      this.click(VESTING_CODE_BUTTON);
      this.type(ACCESS_CODE_INPUT, "98S_VEST");
      this.click(ACCESS_CODE_SUBMIT);
    }
    this.changeNetwork(selectedNetwork);
    let workaroundNetwork =
        selectedNetwork === "goerli" ? "avalanche-fuji" : "goerli";
    this.changeNetwork(workaroundNetwork);
    this.changeNetwork(selectedNetwork);
  }

  static rejectTransactions() {
    cy.log("Cypress will reject HDWalletProvider Transactions!");
    Cypress.env("rejected", true);
  }

  static clickConnectWallet() {
    this.clickFirstVisible(CONNECT_WALLET_BUTTON);
  }

  static clickInjectedWallet() {
    this.isVisible(WAGMI_CONNECT_WALLET_TITLE);
    cy.contains("Injected").click();
  }

  static clickMockWallet() {
    this.isVisible(WAGMI_CONNECT_WALLET_TITLE);
    cy.contains("Mock").click();
  }

  static changeNetwork(network: string) {
    this.click(TOP_BAR_NETWORK_BUTTON);
    this.click(MAINNETS_BUTTON);
    if (networksBySlug.get(network)?.testnet) {
      this.click(TESTNETS_BUTTON);
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
      this.click(VIEW_MODE_INPUT);
      this.type(ADDRESS_DIALOG_INPUT, commonData[account]);
    });
  }

  static viewModeChipDoesNotExist() {
    this.doesNotExist(VIEW_MODE_CHIP_CLOSE);
    this.doesNotExist(VIEWED_ACCOUNT);
  }

  static typeIntoAddressInput(address: string) {
    this.type(ADDRESS_DIALOG_INPUT, address);
  }

  static clickOnViewModeButton() {
    this.click(VIEW_MODE_INPUT);
  }

  static validateAddressBookSearchResult(name: string, address: string) {
    this.isVisible(ADDRESS_BOOK_ENTRIES);
    this.hasText(ADDRESS_BOOK_RESULT_NAMES, name);
    this.hasText(ADDRESS_BOOK_RESULT_ADDRESS, address);
  }

  static chooseFirstAddressBookResult() {
    this.click(ADDRESS_BOOK_ENTRIES);
  }

  static validateViewModeChipMessage(message: string) {
    this.hasText(VIEWED_ACCOUNT, `Viewing ${message}`);
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
    this.isVisible(ERROR_PAGE_MESSAGE);
    this.isVisible(RETURN_TO_DASHBOARD_BUTTON);
    this.isVisible(HELP_CENTER_LINK);
  }

  static restoreLastTx() {
    this.clickFirstVisible(RESTORE_BUTTONS);
  }

  static validateStreamsTable(network: string, selector: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      this.hasLength(
        selector,
        networkSpecificData[network].ongoingStreamsAccount.tokenValues.streams
          .length
      );
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

  static mockQueryToEmptyState(operationName: string) {
    cy.intercept("POST", "**protocol-v1**", (req) => {
      const { body } = req;
      if (
        body.hasOwnProperty("operationName") &&
        body.operationName === operationName
      ) {
        req.alias = `${operationName}Query`;
        req.continue((res) => {
          res.body.data[operationName] = [];
        });
      }
    });
  }

  static disconnectWallet() {
    this.click(WALLET_CONNECTION_STATUS);
    this.click(DISCONNECT_BUTTON);
  }

  static wait(seconds: number) {
    cy.wait(seconds * 1000);
  }

  static transactionRejectedErrorIsShown() {
    Cypress.once("uncaught:exception", (err) => {
      if (err.message.includes("user rejected transaction")) {
        return false;
      }
    });
    cy.get(TX_ERROR, { timeout: 45000 }).should(
      "have.text",
      "Transaction Rejected"
    );
  }

  static validateNoEthereumMainnetShownInDropdown() {
    this.doesNotExist("[data-cy=ethereum-button]");
  }

  static openNavigationMoreMenu() {
    this.click(NAVIGATION_MORE_BUTTON);
  }

  static openAccessCodeMenu() {
    this.click(ACCESS_CODE_BUTTON);
  }

  static inputAccessCode(code: string) {
    this.type(ACCESS_CODE_INPUT, code);
  }

  static submitAccessCode() {
    this.click(ACCESS_CODE_SUBMIT);
  }

  static validateAccessCodeWindowNotExisting() {
    this.doesNotExist(ACCESS_CODE_DIALOG);
  }

  static validateEthMainnetVisibleInNetworkSelection() {
    this.isVisible("[data-cy=ethereum-button]");
  }

  static validateInvalidAccessCodeError() {
    this.isVisible(ACCESS_CODE_ERROR);
    this.hasText(ACCESS_CODE_MESSAGE, "Invalid Access Code!");
  }

  static closeAccessCodeDialog() {
    this.click(CLOSE_BUTTON);
  }

  static openDashboardNetworkSelectionDropdown() {
    this.click(TOP_BAR_NETWORK_BUTTON);
  }

  static mockConnectionTo(account: string, network: string) {
      let usedAccountPrivateKey =
          account === "staticBalanceAccount"
              ? Cypress.env("STATIC_BALANCE_ACCOUNT_PRIVATE_KEY")
              : Cypress.env("ONGOING_STREAM_ACCOUNT_PRIVATE_KEY");
        cy.fixture("commonData").then((commonData) => {
          cy.visit("/", {
            onBeforeLoad: (win) => {
              // @ts-ignore
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
  }

  static checkThatSuperfluidRPCisNotBehind(minutes: number, network: string) {
    const Web3 = require("web3");
    const web3 = new Web3(new Web3.providers.HttpProvider(networksBySlug.get(network).superfluidRpcUrl));
    cy.wrap(null).then(() => {
      return web3.eth.getBlock("latest").then(block => {
        let blockVsTimeNowDifferenceInMinutes = (Date.now() - (block.timestamp * 1000)) / 1000 / 60
        expect(blockVsTimeNowDifferenceInMinutes).to.be.lessThan(minutes,
            `${networksBySlug.get(network).name} RPC node is behind by ${blockVsTimeNowDifferenceInMinutes.toFixed(0)} minutes.
       Latest block number: ${block.number}`)
      })
    })
  }

  static checkThatTheGraphIsNotBehind(minutes: number, network: string) {
    cy.request({
      method: 'POST',
      url: networksBySlug.get(network).subgraphUrl,
      body: {
        operationName: 'MyQuery',
        query: "query MyQuery {" +
            "  _meta {" +
            "    hasIndexingErrors" +
            "    block {" +
            "      number" +
            "      timestamp" +
            "    }" +
            "  }" +
            "}"
        ,
      },
    }).then(res => {
      let metaData = res.body.data._meta
      let blockVsTimeNowDifferenceInMinutes = (Date.now() - (metaData.block.timestamp * 1000)) / 1000 / 60
      //Sometimes the graph meta does not return timestamp for blocks, don't assert if it is so
      if (metaData.block.timestamp !== null) {
        expect(metaData.hasIndexingErrors).to.be.false
        expect(blockVsTimeNowDifferenceInMinutes).to.be.lessThan(minutes,
            `${networksBySlug.get(network).name} graph is behind by ${blockVsTimeNowDifferenceInMinutes.toFixed(0)} minutes.
       Last synced block number: ${metaData.block.number} 
       URL:
       ${networksBySlug.get(network).subgraphUrl}
      `)
      }
    })
  }

  static inputDateIntoField(selector:string,amount: number,timeUnit) {
    let newDate: Date;
    let currentTime = new Date()
    const unitOfTime = wordTimeUnitMap[timeUnit];
    if (unitOfTime === undefined) {
      throw new Error(`Invalid time unit: ${timeUnit}`);
    }

    newDate = new Date(currentTime.getTime() + amount * (unitOfTime * 1000));

    const month = `0${newDate.getMonth() + 1}`.slice(-2);
    const day = `0${newDate.getDate()}`.slice(-2);
    const year = newDate.getFullYear();
    const hours = `0${newDate.getHours()}`.slice(-2);
    const minutes = `0${newDate.getMinutes()}`.slice(-2);
    const finalFutureDate = `${month}/${day}/${year} ${hours}:${minutes}`;
    this.type(selector,finalFutureDate)
  }


  static validateScheduledStreamRow(address: string, flowRate: number, startEndDate: string) {
    cy.contains(SENDER_RECEIVER_ADDRESSES,this.shortenHex(address)).parents(STREAM_ROWS).find(STREAM_FLOW_RATES).should("have.text",`${flowRate}/mo`)
    cy.contains(SENDER_RECEIVER_ADDRESSES,this.shortenHex(address)).parents(STREAM_ROWS).find(START_END_DATES).should("have.text",startEndDate)
    cy.contains(SENDER_RECEIVER_ADDRESSES,this.shortenHex(address)).parents(STREAM_ROWS).find(TIMER_ICONS).should("be.visible")
  }

    static openFaucetMenu() {
        this.click(FAUCET_BUTTON)
    }

  static validateConnectWalletButtonInFaucetMenu() {
    this.isVisible(`[role=dialog] ${CONNECT_WALLET_BUTTON}`)
  }

  static validateSwitchNetworkButtonInFaucetMenu() {
    this.isVisible(CHANGE_NETWORK_BUTTON)
    this.hasText(CHANGE_NETWORK_BUTTON,"Change Network to Polygon Mumbai")
  }

  static clickSwitchNetworkButton() {
    this.click(CHANGE_NETWORK_BUTTON)
  }

  static validateSelectedNetwork(networkName: string) {
    this.containsText(TOP_BAR_NETWORK_BUTTON,networkName)
  }

  static mockFaucetRequestsToFailure() {
    cy.intercept("OPTIONS","**fund-me-on-multi-network",{statusCode: 500 , body: {}})
  }

  static clickClaimTokensButton() {
    this.click(CLAIM_TOKENS_BUTTON)
  }

  static validateDisabledClaimTokensButton() {
    this.isDisabled(CLAIM_TOKENS_BUTTON)
    this.hasText(CLAIM_TOKENS_BUTTON,"Tokens Claimed")
  }

  static validateFaucetSuccessMessage() {
    this.hasText(FAUCET_SUCCESS_MESSAGE ,"Streams opened and testnet tokens successfully sent")
  }

  static clickFaucetGoToDashboardButton() {
    this.click(FAUCET_GO_TO_DASHBOARD)
  }

  static async sendBackNotMintableFaucetTokens() {
    const web3 = new Web3(networksBySlug.get("polygon-mumbai").superfluidRpcUrl);

    cy.get("@newWalletPublicKey").then(fromAddress => {
      cy.get("@newWalletPrivateKey").then(async privateKey => {
        const gasPrice = web3.utils.toWei('50', 'gwei'); //Didis recommendation
        const gasLimit = 23000 //Takes a little bit more than a normal 21k transfer because contracts deposit function
        // @ts-ignore
        const balance = BigNumber.from(await web3.eth.getBalance(fromAddress))
        const valueToSend = balance.sub(BigNumber.from(gasPrice).mul(BigNumber.from(gasLimit)))

    const txObj = {
          from: fromAddress,
          to: FAUCET_CONTRACT_ADDRESS,
          value: valueToSend,
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        };

        cy.wrap(null,{log:false}).then(() => {
          // @ts-ignore
          return web3.eth.accounts.signTransaction(txObj, privateKey)
              .then(async signedTx => {
                await web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(tx => {
                  cy.log(`Matic recycled, transaction hash: ${tx.transactionHash}`)
                })
              });
          })
      })
    })
  }

  static validateYouHaveAlreadyClaimedTokensMessage() {
    this.isVisible(FAUCET_ERROR_MESSAGE)
    this.hasText(FAUCET_ERROR_MESSAGE,"You’ve already claimed tokens from the faucet using this address")
  }

  static clickFaucetMenuWrapButton() {
    this.click(FAUCET_WRAP_BUTTON)
  }

  static validateSomethingWentWrongMessageInFaucet() {
    this.isVisible(FAUCET_ERROR_MESSAGE)
    this.hasText(FAUCET_ERROR_MESSAGE,"Something went wrong, please try again")
  }

  static closePresentationDialog() {
    this.click(MUI_PRESENTATION)
  }

  static validateNewWalletAddress() {
    cy.get("@newWalletPublicKey").then(address => {
      this.hasValue(FAUCET_WALLET_ADDRESS , address)
    })
  }

  static checkFaucetContractBalance() {
    const web3 = new Web3(networksBySlug.get("polygon-mumbai").superfluidRpcUrl);
    cy.wrap(null,{log:false}).then(() => {
      return web3.eth.getBalance(FAUCET_CONTRACT_ADDRESS).then(balance => {
        expect(parseInt(balance)).to.be.greaterThan(1e19)
      })
    })

      }

    static validateOpenFaucetView() {
    const FAUCET_TOKENS = ["MATIC","fUSDC","fDAI"]
        this.isVisible(CLAIM_TOKENS_BUTTON)
      FAUCET_TOKENS.forEach(token => {
        this.containsText(TOKEN_CHIPS,token)
      })
      this.isVisible(FAUCET_WALLET_ADDRESS)
    }
}
