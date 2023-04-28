import { BasePage } from "../BasePage";
import {
  mainNetworks,
  networksBySlug,
  testNetworks,
} from "../../superData/networks";
import { Common, CONNECT_WALLET_BUTTON } from "./Common";

const NETWORK_SNAPSHOT_TABLE_APPENDIX = "-token-snapshot-table]";
const TOKEN_SYMBOLS = "[data-cy=token-symbol]";
const TOKEN_BALANCES = "[data-cy=balance]";
const CANCEL_BUTTON_BACKDROP = "[class*=backdrop]";
const NETWORK_SELECTION_TOGGLE_APPENDIX = "-toggle]";
const NO_BALANCE_WRAP_BUTTON = "[data-cy=no-balance-wrap-button]";
const NO_BALANCE_MESSAGE = "[data-cy=no-balance-message]";
const LOADING_SKELETONS = "[data-cy=loading-skeletons]";
const NET_FLOW_VALUES = "[data-cy=net-flow-value] span:first-child";
const NO_NET_FLOW_VALUE = "[data-cy=net-flow-value]";
const NET_FLOW_FIAT = "[data-cy=net-flow-value] span:last-child";
const INFLOW_VALUES = "[data-cy=inflow]";
const OUTFLOW_VALUES = "[data-cy=outflow]";
const CANCEL_BUTTONS = "[data-cy=cancel-button]";
const EDIT_BUTTONS = "[data-testid=EditRoundedIcon]";
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]";
const TOOLTIPS = "[role=tooltip]";
const ROWS_PER_PAGE_ARROW = "[data-testid=ArrowDropDownIcon]";
const DISPLAYED_ROWS = "[class*=displayedRows]";
const NEXT_PAGE_BUTTON = "[data-testid=KeyboardArrowRightIcon]";
const STREAM_ROWS = "[data-cy=stream-row]";
const ALL_BALANCE_ROWS = "[data-cy*=-cell]";
const MODIFY_STREAM_BUTTON = "[data-cy=modify-stream-tooltip]";
const SWITCH_NETWORK_BUTTON = "[data-cy=switch-network-tooltip]";
const FAUCET_MESSAGE_CONTAINER = "[data-cy=dashboard-faucet-message]";
const FAUCET_CLAIM_BUTTON = "[data-cy=dashboard-claim-button]";
const FAUCET_MESSAGE_TITLE = `${FAUCET_MESSAGE_CONTAINER} h5`;
const FAUCET_MESSAGE_DESCRIPTION = `${FAUCET_MESSAGE_CONTAINER} p`;

export class DashboardPage extends BasePage {
  static checkIfDashboardConnectIsVisible() {
    this.isVisible(CONNECT_WALLET_BUTTON);
    //2 buttons should be visible, one in the nav drawer, one in the dashboard page
    this.hasLength(CONNECT_WALLET_BUTTON, 2);
  }

  static verifyBalancesForAccount(networkType: string, account: string) {
    let network = networkType === "testnet" ? testNetworks : mainNetworks;
    network.forEach((network) => {
      cy.fixture("networkSpecificData").then((networkSpecificData) => {
        networkSpecificData[network.slugName][account].tokenValues.forEach(
          (tokenValues: any, index: number) => {
            this.hasText(
              `[data-cy=${network.slugName}${NETWORK_SNAPSHOT_TABLE_APPENDIX} ${TOKEN_SYMBOLS}`,
              tokenValues.token,
              index
            );
            this.hasText(
              `[data-cy=${network.slugName}${NETWORK_SNAPSHOT_TABLE_APPENDIX} ${TOKEN_BALANCES}`,
              `${parseFloat(tokenValues.balance).toFixed(0)} `,
              index
            );
          }
        );
      });
    });
  }

  static clickNetworkSelectionToogle(network: string) {
    this.click(`[data-cy=${network}${NETWORK_SELECTION_TOGGLE_APPENDIX}`);
  }

  static tokenBalancesAreNotVisible(network: string) {
    this.doesNotExist(`[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX}`);
  }

  static noBalancesScreenIsVisible() {
    this.isVisible(NO_BALANCE_WRAP_BUTTON);
    this.isVisible(NO_BALANCE_MESSAGE);
  }

  static clickNoBalanceWrapButton() {
    this.click(NO_BALANCE_WRAP_BUTTON);
  }

  static waitForBalancesToLoad() {
    this.isVisible(LOADING_SKELETONS);
    this.doesNotExist(LOADING_SKELETONS, undefined, { timeout: 60000 });
  }

  static clickTokenStreamRow(network: string, token: string) {
    this.click(
      `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] [data-cy=show-streams-button]`
    );
  }

  static validateTokenTotalFlowRates(network: string, token: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let flowValues =
        networkSpecificData[network].ongoingStreamsAccount.tokenValues;
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${NET_FLOW_VALUES}`,
        flowValues.netFlowRate
      );
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${OUTFLOW_VALUES}`,
        flowValues.outFlow
      );
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${INFLOW_VALUES}`,
        flowValues.inFlow
      );
    });
  }

  static validateTokenStreams(network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let specificSelector = `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${networkSpecificData[
        network
      ].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase()}-streams-table] ${STREAM_ROWS} `;
      Common.validateStreamsTable(network, specificSelector);
    });
  }

  static clickFirstCancelButton() {
    this.click(CANCEL_BUTTONS);
  }

  static cancelStreamButtonIsVisible() {
    this.isVisible(CANCEL_STREAM_BUTTON);
  }

  static clickOnCancelStreamBackdrop() {
    this.click(CANCEL_BUTTON_BACKDROP);
  }

  static cancelStreamButtonDoesNotExist() {
    this.doesNotExist(CANCEL_STREAM_BUTTON);
  }

  static validateAllCancelButtonsDisabledForToken(network: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      cy.get(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${networkSpecificData[
          network
        ].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase()}-streams-table] ${STREAM_ROWS} ${CANCEL_BUTTONS}`
      ).each((button: JQuery<HTMLElement>) => {
        cy.wrap(button).should("have.attr", "disabled");
      });
    });
  }

  static hoverOnFirstCancelButton(network: string) {
    this.trigger(
      `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} ${SWITCH_NETWORK_BUTTON}`,
      "mouseover",
      0
    );
  }

  static validateChangeNetworkTooltip(network: string) {
    let expectedMessage = `Switch network to ${
      networksBySlug.get(network)?.name
    } to cancel stream`;
    this.isVisible(TOOLTIPS);
    this.hasText(TOOLTIPS, expectedMessage);
  }

  static changeRowsPerPageShown(amount: number) {
    cy.get(ROWS_PER_PAGE_ARROW).parent().click();
    this.click(`[data-value=${amount}]`);
  }

  static checkVisibleRowsAmount(amount: string, token: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let tokenAddress =
        networkSpecificData.gnosis.staticBalanceAccount.tokenValues
          .filter((values: any) => values.token === token)[0]
          .tokenAddress.toLowerCase();
      let expectedAmount = parseInt(amount);
      let lastRowData: string[] = [];
      this.hasLength(
        `[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`,
        expectedAmount
      ).and(($el) => {
        lastRowData.push($el.text());
      });
      cy.wrap(lastRowData).as("lastStreamRows");
      cy.log("@lastStreamRows", lastRowData);
    });
  }

  static switchToNextStreamPage(token: string) {
    cy.fixture("networkSpecificData").then((networkSpecificData) => {
      let tokenAddress =
        networkSpecificData.gnosis.staticBalanceAccount.tokenValues
          .filter((values: any) => values.token === token)[0]
          .tokenAddress.toLowerCase();
      cy.get(DISPLAYED_ROWS).then((el) => {
        let totalRows = parseInt(el.text().split(" ")[2]);
        //Some kind of special dash here between visible pages counter "1–"
        let currentPagesVisible = parseInt(
          el.text().split(" ")[0].replaceAll("1–", "")
        );
        let amountOfExpectedPagesInNewPage = totalRows - currentPagesVisible;

        this.click(NEXT_PAGE_BUTTON);
        this.hasLength(
          `[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`,
          amountOfExpectedPagesInNewPage
        );
        let newRows: string[] = [];
        cy.get("@lastStreamRows").then((rows) => {
          cy.get(
            `[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`
          ).then(($el) => {
            newRows.push($el.text());
            cy.wrap(newRows).should("not.equal", rows);
          });
        });
        cy.get(DISPLAYED_ROWS).then((el) => {
          cy.wrap(el.text()).should(
            "eq",
            `${currentPagesVisible + 1}–${totalRows} of ${totalRows}`
          );
        });
      });
    });
  }

  static openFirstVisibleStreamDetailsPage() {
    this.clickFirstVisible(STREAM_ROWS);
  }

  static checkIfAnyTokenBalancesAreShown() {
    this.isVisible(ALL_BALANCE_ROWS);
  }

  static openIndividualTokenPage(network: string, token: string) {
    cy.fixture("rejectedCaseTokens").then((tokens) => {
      let selectedToken;
      if (token.startsWith("Token")) {
        selectedToken = token.endsWith("x")
          ? `${tokens[Cypress.env("network")][token.slice(0, -1)]}x`
          : tokens[Cypress.env("network")][token];
      } else {
        selectedToken = token;
      }
      let selectedNetwork =
        network === "selected network" ? Cypress.env("network") : network;
      this.isVisible(
        `[data-cy=${selectedNetwork}${NETWORK_SNAPSHOT_TABLE_APPENDIX}`,
        undefined,
        { timeout: 45000 }
      );
      this.click(
        `[data-cy=${selectedNetwork}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy="${selectedToken}-cell"]`
      );
    });
  }

  static waitForXAmountOfEntries(amount: number) {
    this.hasLength(STREAM_ROWS, amount);
  }

  static validateLastStreamRowNotFlowing() {
    cy.get(`${STREAM_ROWS} ${TOKEN_BALANCES}`)
      .first()
      .then((el) => {
        cy.wait(1000);
        cy.get(`${STREAM_ROWS} ${TOKEN_BALANCES}`)
          .first()
          .then((elAfter) => {
            cy.wrap(parseFloat(elAfter.text())).should(
              "eq",
              parseFloat(el.text())
            );
          });
      });
  }

  static validateNoButtonsInLastStreamRow() {
    cy.get(STREAM_ROWS)
      .first({ timeout: 45000 })
      .find(CANCEL_BUTTONS)
      .should("not.exist");
    cy.get(STREAM_ROWS)
      .first({ timeout: 45000 })
      .find(SWITCH_NETWORK_BUTTON)
      .should("not.exist");
    cy.get(STREAM_ROWS)
      .first({ timeout: 45000 })
      .find(MODIFY_STREAM_BUTTON)
      .should("not.exist");
  }

  static validateTokenTotalNetFlowRates(
    token: string,
    network: string,
    amounts: string
  ) {
    //Input the amounts in order seperating with a comma, e.g. 1,-1,2 = 1 net , -1 outflow , 1 inflow
    let flowValues = amounts === "-" ? amounts : amounts.split(",");
    cy.get(
      `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell]`,
      { timeout: 30000 }
    ).should("be.visible");
    if (amounts === "-") {
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${NO_NET_FLOW_VALUE}`,
        flowValues[0]
      );
    } else {
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${NET_FLOW_VALUES}`,
        flowValues[0]
      );
    }
    if (flowValues[1]) {
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${INFLOW_VALUES}`,
        flowValues[2]
      );
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${OUTFLOW_VALUES}`,
        flowValues[1]
      );
    } else {
      this.hasText(
        `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${OUTFLOW_VALUES}`,
        flowValues
      );
    }
  }

  static validateAmountOfStreamRows(amount: number) {
    this.hasLength(STREAM_ROWS, amount);
  }

  static validateCancelAndEditButtonsAreVisible() {
    this.isVisible(CANCEL_BUTTONS);
    this.isVisible(EDIT_BUTTONS);
  }

  static validateThatFaucetMessageIsShown() {
    this.isVisible(FAUCET_MESSAGE_CONTAINER);
    this.hasText(FAUCET_MESSAGE_TITLE, "Get Testnet Tokens");
    this.hasText(
      FAUCET_MESSAGE_DESCRIPTION,
      "Claim tokens from our free testnet faucet to try out streaming payments."
    );
  }

  static openFaucetView() {
    this.click(FAUCET_CLAIM_BUTTON);
  }

  static validateNoFaucetMessageExists() {
    this.doesNotExist(FAUCET_MESSAGE_CONTAINER);
  }
}
