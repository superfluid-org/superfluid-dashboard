import {BasePage, wordTimeUnitMap} from "../BasePage";
import { networksBySlug, superfluidRpcUrls } from "../../superData/networks";
import { ethers } from "ethers";
import HDWalletProvider from "@truffle/hdwallet-provider";
import {MockProvider} from "@rsksmart/mock-web3-provider";

export const TOP_BAR_NETWORK_BUTTON = "[data-cy=top-bar-network-button]";
export const CONNECTED_WALLET = "[data-cy=wallet-connection-status] h6";
export const WALLET_CONNECTION_STATUS = "[data-cy=wallet-connection-status] p";
export const NAVIGATION_MORE_BUTTON = "[data-cy=nav-more-button]";
export const ACCESS_CODE_BUTTON = "[data-cy=more-access-code-btn]";
export const ACCESS_CODE_INPUT = "[data-cy=access-code-input]";
export const ACCESS_CODE_SUBMIT = "[data-cy=submit-access-code]";
export const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
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
const NOTIFICATIONS_BUTTON = "[data-testid=NotificationsIcon]"
const NOTIF_SETTINGS_BUTTON = "[data-testid=SettingsOutlinedIcon]"
const NOTIF_ARCHIVE_BUTTON = "[data-cy=archive-button]"
const NOTIF_BADGE = "[aria-describedby=notifications-bell] span span"
const NOTIF_MESSAGE = "[data-cy=notification-message]"
const NOTIF_TITLE = "[data-cy=notification-title]"
const EMPTY_NOTIF_MESSAGE = "[data-cy=empty-notifs-message]"
const NOTIF_NO_WALLET_MESSAGE = "[data-cy=notif-no-wallet]"
const NOTIFICATION_MODAL = "#notifications-bell"
const NEW_NOTIF_DOT = "[data-cy=new-notif-dot]"
const LIQUIDATED_ICON = "[data-testid=CancelIcon]"
const WARNING_ICON = "[data-testid=ErrorIcon]"
const INFO_ICON = "[data-testid=InfoIcon]"
const TOAST_MESSAGE = "[data-cy=toast-notification-message]"
const TOAST_TITLE = "[data-cy=toast-notification-title]"
const TOAST_CLOSE_BUTTON = "button[aria-label=close]"
const NOTIF_WRAP_TOKEN_BUTTON = "[data-cy=wrap-tokens-button]"

const NEW_NOTIF_DATE = new Date(Date.now())
const NEW_NOTIF_STRING_DATE = BasePage.getNotificationDateString(NEW_NOTIF_DATE)
const OLD_NOTIF_DATE = new Date(1000 * BasePage.getDayTimestamp(-30))
const OLD_DATE_STRING = BasePage.getNotificationDateString(OLD_NOTIF_DATE)

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
          case "settings page":
            this.visitPage("/settings", account, network);
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
    if(personas.includes(persona)) {
      let chosenPersona = personas.findIndex((el) => el === persona) + 1;
      usedAccountPrivateKey = Cypress.env(`TX_ACCOUNT_PRIVATE_KEY${chosenPersona}`)
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
    this.clickFirstVisible("[data-cy=connect-wallet-button]");
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

  static mockNotificationRequestsTo(type: string) {
    cy.intercept("GET", "**/feeds**", (req) => {
      req.continue(res => {
        switch (type.toLowerCase()) {
          case "liquidated":
            res.body = {
              feeds: [{
                "payload_id": 3769521,
                "sender": "0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa",
                "epoch": NEW_NOTIF_DATE.toISOString(),
                "payload": {
                  "data": {
                    "app": "Superfluid",
                    "sid": "40196540",
                    "url": "https://app.superfluid.finance",
                    "acta": "https://app.superfluid.finance/",
                    "aimg": "",
                    "amsg": `Your TDLx(TDLx) on network Polygon was liquidated (at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${NEW_NOTIF_DATE.getTime() / 100}]`,
                    "asub": "Liquidated",
                    "icon": "https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA",
                    "type": 3,
                    "epoch": NEW_NOTIF_DATE.getTime() / 100,
                    "etime": null,
                    "hidden": "0",
                    "sectype": null,
                    "additionalMeta": null
                  },
                  "recipients": {"eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2": null},
                  "notification": {
                    "body": `type:liquidation,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(NEW_NOTIF_DATE.getTime() / 1000).toFixed(0)}`,
                    "title": "Superfluid - Liquidated"
                  },
                  "verificationProof": "eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989"
                },
                "source": "ETH_MAINNET",
                "etime": null
              }]
            }
            break;
          case "old notification":
            res.body = {
              feeds: [{
                "payload_id": 3769521,
                "sender": "0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa",
                "epoch": OLD_NOTIF_DATE.toISOString(),
                "payload": {
                  "data": {
                    "app": "Superfluid",
                    "sid": "40196540",
                    "url": "https://app.superfluid.finance",
                    "acta": "https://app.superfluid.finance/",
                    "aimg": "",
                    "amsg": `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${OLD_DATE_STRING}).[timestamp: ${OLD_NOTIF_DATE.getTime() / 100}]`,
                    "asub": "Liquidation Risk",
                    "icon": "https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA",
                    "type": 3,
                    "epoch": OLD_NOTIF_DATE.getTime() / 100,
                    "etime": null,
                    "hidden": "0",
                    "sectype": null,
                    "additionalMeta": null
                  },
                  "recipients": {"eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2": null},
                  "notification": {
                    "body": `type:liquidation-risk-7day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(OLD_NOTIF_DATE.getTime() / 1000).toFixed(0)}`,
                    "title": "Superfluid - Liquidation Risk"
                  },
                  "verificationProof": "eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989"
                },
                "source": "ETH_MAINNET",
                "etime": null
              }]
            }
            break;
          case "liquidation risk":
            res.body = {
              feeds: [{
                "payload_id": 3769521,
                "sender": "0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa",
                "epoch": NEW_NOTIF_DATE.toISOString(),
                "payload": {
                  "data": {
                    "app": "Superfluid",
                    "sid": "40196540",
                    "url": "https://app.superfluid.finance",
                    "acta": "https://app.superfluid.finance/",
                    "aimg": "",
                    "amsg": `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${NEW_NOTIF_DATE.getTime() / 100}]`,
                    "asub": "Liquidation Risk",
                    "icon": "https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA",
                    "type": 3,
                    "epoch": NEW_NOTIF_DATE.getTime() / 100,
                    "etime": null,
                    "hidden": "0",
                    "sectype": null,
                    "additionalMeta": null
                  },
                  "recipients": {"eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2": null},
                  "notification": {
                    "body": `type:liquidation-risk-7day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(NEW_NOTIF_DATE.getTime() / 1000).toFixed(0)}`,
                    "title": "Superfluid - Liquidation Risk"
                  },
                  "verificationProof": "eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989"
                },
                "source": "ETH_MAINNET",
                "etime": null
              }]
            }
            break;
          case "urgent liquidation risk":
            res.body = {
              feeds: [{
                "payload_id": 3769521,
                "sender": "0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa",
                "epoch": NEW_NOTIF_DATE.toISOString(),
                "payload": {
                  "data": {
                    "app": "Superfluid",
                    "sid": "40196540",
                    "url": "https://app.superfluid.finance",
                    "acta": "https://app.superfluid.finance/",
                    "aimg": "",
                    "amsg": `Your TDLx(TDLx) on network Polygon is about to be liquidated in less than 7 days(at ${NEW_NOTIF_STRING_DATE}).[timestamp: ${NEW_NOTIF_DATE.getTime() / 100}]`,
                    "asub": "Urgent Liquidation Risk",
                    "icon": "https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA",
                    "type": 3,
                    "epoch": NEW_NOTIF_DATE.getTime() / 100,
                    "etime": null,
                    "hidden": "0",
                    "sectype": null,
                    "additionalMeta": null
                  },
                  "recipients": {"eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2": null},
                  "notification": {
                    "body": `type:liquidation-risk-2day,network:polygon,symbol:TDLx,token:TDLx,tokenAddress:0xa794221d92d77490ff319e95da1461bdf2bd3953,liquidation:${(NEW_NOTIF_DATE.getTime() / 1000).toFixed(0)}`,
                    "title": "Superfluid - Urgent Liquidation Risk"
                  },
                  "verificationProof": "eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989"
                },
                "source": "ETH_MAINNET",
                "etime": null
              }]
            }
            break;
          case "outdated format":
            res.body = {
              feeds: [{
                "payload_id": 3769521,
                "sender": "0xa947E9cFc724f05D83b995e53572c4bcCB00D7Aa",
                "epoch": NEW_NOTIF_DATE.toISOString(),
                "payload": {
                  "data": {
                    "app": "Superfluid",
                    "sid": "40196540",
                    "url": "https://app.superfluid.finance",
                    "acta": "https://app.superfluid.finance/",
                    "aimg": "",
                    "amsg": `Some Test message`,
                    "asub": "What happens with outdated formats?",
                    "icon": "https://gateway.ipfs.io/ipfs/bafybeiew4vxj6npyn5j5ck6co64bla4zqfbgrk7mjbdxqv6vbyioei3b2y/QmaFbcUvWdxnbHNLMe9goScf9A5YX8uE7nryetdaEnaPWA",
                    "type": 3,
                    "epoch": NEW_NOTIF_DATE.getTime() / 100,
                    "etime": null,
                    "hidden": "0",
                    "sectype": null,
                    "additionalMeta": null
                  },
                  "recipients": {"eip155:0xf9ce34dfcd3cc92804772f3022af27bcd5e43ff2": null},
                  "notification": {
                    "body": `This is an outdated format aka something that is not explicitly handled`,
                    "title": "Outdated Format"
                  },
                  "verificationProof": "eip712v2:0x1e2bb5e08b056882baa8e4bbc664c60c058bd9d27082b11b94bc888e77ddad0f667b360304f56626f7e6f908d0051ca7e684cfe5d3c6acce65bce9a75317447b1c::uid::8572f30d-d652-4516-9e2f-914d47b3d989"
                },
                "source": "ETH_MAINNET",
                "etime": null
              }]
            }
            break;
          default:
            throw new Error(`Unknown notification type: ${type}`)
        }
      })
    })
  }

  static clickNotificationButton() {
    this.click(NOTIFICATIONS_BUTTON)
  }

  static validateNoNewNotificationsMessage(tab: string) {
    this.hasText(EMPTY_NOTIF_MESSAGE, `You don't have any ${tab} notifications.`)
  }

  static switchNotificationTabTo(tab: string) {
    this.click(`[data-cy=${tab}-tab]`)
  }

  static validateNotSubscribedMessage() {
    this.hasText(EMPTY_NOTIF_MESSAGE, "You are not subscribed. Check settings to enable notifications")
  }

  static validateConnectWalletButtonInNotifModal() {
    this.hasText(NOTIF_NO_WALLET_MESSAGE, "Connect your wallet to check your notifications.")
    this.isVisible(`${NOTIFICATION_MODAL} ${CONNECT_WALLET_BUTTON}`)
  }

  static validateNotificationToast(type: string) {
    this.validateNotifTitleAndMessage(TOAST_MESSAGE, TOAST_TITLE, type , true)
  }

  static validateNotificationBadge(amount: string) {
    if (amount === "0") {
      this.isNotVisible(NOTIF_BADGE)
    } else {
      this.hasText(NOTIF_BADGE, amount)
    }
  }

  static archiveLastNotification() {
    //One of the rare cases where triggering mouseevents or invoking show function does not make the element visible
    cy.get(NOTIF_ARCHIVE_BUTTON).first().click({force: true})
  }

  static validateArchivedNotification(type: string) {
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type , true)
  }

  static validateNewNotification(type: string) {
    this.isVisible(NEW_NOTIF_DOT)
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type , false)
  }

  static validateReadNotification(type: string) {
    this.doesNotExist(NEW_NOTIF_DOT)
    this.validateNotifTitleAndMessage(NOTIF_MESSAGE, NOTIF_TITLE, type , false)
  }

  static validateNotifTitleAndMessage(messageSelector: string, titleSelector: string, type: string , archivedOrToast: boolean) {
    const ASSERT_STRING = type.toLowerCase() === "old notification" ? this.getNotifDateAssertStringFromDate(OLD_NOTIF_DATE) : this.getNotifDateAssertStringFromDate(NEW_NOTIF_DATE)
    switch (type.toLowerCase()) {
      case "liquidated":
        this.hasText(titleSelector, ` ${type}`)
        this.isVisible(LIQUIDATED_ICON)
        this.hasText(messageSelector, `Your TDLx on Polygon was liquidated at ${ASSERT_STRING}.`)
        this.validateNoWrapButtonsInNotifModal()
        break;
      case "old notification":
        this.hasText(titleSelector, ` Liquidation Risk`)
        this.isVisible(WARNING_ICON)
        this.validateNoWrapButtonsInNotifModal()
        this.hasText(messageSelector, `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`)
        break;
      case "liquidation risk":
        this.hasText(titleSelector, ` ${type}`)
        this.isVisible(WARNING_ICON)
        if(!archivedOrToast) {
          this.validateWrapButtonsInNotifModal()
        }
        this.hasText(messageSelector, `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`)
        break;
      case "urgent liquidation risk":
        this.hasText(titleSelector, ` ${type}`)
        this.isVisible(WARNING_ICON)
        if(!archivedOrToast) {
          this.validateWrapButtonsInNotifModal()
        }
        this.hasText(messageSelector, `Your TDLx on Polygon is about to be liquidated at ${ASSERT_STRING}.`)
        break;
      case "outdated format":
        this.isVisible(INFO_ICON)
        this.hasText(messageSelector, "This is an outdated format aka something that is not explicitly handled")
        this.validateNoWrapButtonsInNotifModal()
        break;
    }
  }

  static validateWrapButtonsInNotifModal() {
    this.isVisible(NOTIF_WRAP_TOKEN_BUTTON)
  }

  static clickWrapButtonInNotifModal() {
    this.click(NOTIF_WRAP_TOKEN_BUTTON)
  }

  static validateNoWrapButtonsInNotifModal() {
    this.doesNotExist(NOTIF_WRAP_TOKEN_BUTTON)
  }

  static clickNotificationSettingsButton() {
    this.click(NOTIF_SETTINGS_BUTTON)
  }
}
