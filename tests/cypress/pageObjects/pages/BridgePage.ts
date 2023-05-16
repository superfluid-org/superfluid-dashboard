import { BasePage } from "../BasePage";

const LIFI_WIDGET_CONTAINER = "[data-cy=lifi-widget]";
const FROM_TO_SEARCH_BAR = `${LIFI_WIDGET_CONTAINER} input`;
const TOKEN_LIST_NAMES = `${LIFI_WIDGET_CONTAINER} [class*=MuiListItem] span`;
const SWAP_ROUTE_AMOUNT = `${LIFI_WIDGET_CONTAINER} [class*=MuiBox-root] text`;
const LIFI_BUTTONS = `${LIFI_WIDGET_CONTAINER} [class*=MuiBox] button`;
const WARNING_TEXT = "[data-testid=WarningAmberRoundedIcon] + div > p";
const FROM_AMOUNT = "[name=fromAmount]";
const LOADING_SKELETONS = "[class*=MuiSkeleton]";
const FROM_TO_HEADERS = `${LIFI_WIDGET_CONTAINER} [class*=MuiCardHeader-avatar]`;
const HISTORY_BUTTON = "[data-testid=ReceiptLongRoundedIcon]";
const SETTINGS_BUTTON = "[data-testid=SettingsOutlinedIcon]";
const NETWORK_BUTTONS = "[aria-label] > .MuiAvatar-root > .MuiAvatar-img";

export class BridgePage extends BasePage {
  static chooseTokenToSwapFromTo(
    token: string,
    toFrom: string,
    network: string
  ) {
    cy.wrap(token).as(`${toFrom}Token`);
    cy.wrap(network).as(`${toFrom}Network`);
    cy.contains(toFrom).click();
    this.click(`${LIFI_WIDGET_CONTAINER} [aria-label=${network}]`);
    this.doesNotExist(LOADING_SKELETONS);
    cy.get(TOKEN_LIST_NAMES)
      .its("length")
      .then((amount) => {
        this.type(FROM_TO_SEARCH_BAR, token);
        cy.get(TOKEN_LIST_NAMES).should("have.length.below", amount);
        cy.get(TOKEN_LIST_NAMES).each((el) => {
          if (el.text() === token) {
            cy.wrap(el).click();
          }
        });
      });
  }

  static inputSwapAmount(amount: string) {
    this.type(FROM_AMOUNT, amount);
    cy.wrap(amount).as("swapAmount");
  }

  static validateSwapRoute() {
    cy.get("@ToNetwork").then((network) => {
      cy.get("@ToToken").then((token) => {
        cy.get("@swapAmount").then((amount) => {
          cy.get(SWAP_ROUTE_AMOUNT)
            .first()
            .then((el) => {
              expect(parseFloat(el.text())).to.be.closeTo(
                parseFloat(amount.toString()),
                0.1
              );
            });
          cy.get(SWAP_ROUTE_AMOUNT)
            .parent()
            .parent()
            .find("img")
            .first()
            .should("have.attr", "alt", token);
          cy.get(SWAP_ROUTE_AMOUNT)
            .parent()
            .parent()
            .find("img")
            .last()
            .should("have.attr", "alt", network);
        });
      });
    });
  }

  static validateYouPayTokenIcons() {
    cy.get("@FromToken").then((token) => {
      cy.get("@FromNetwork").then((network) => {
        cy.contains("You pay")
          .parent()
          .find("img")
          .first()
          .should("have.attr", "alt", token);
        cy.contains("You pay")
          .parent()
          .find("img")
          .last()
          .should("have.attr", "alt", network);
      });
    });
  }

  static validateConnectWalletButton() {
    cy.get(LIFI_BUTTONS)
      .contains("Connect wallet")
      .should("be.visible")
      .and("be.enabled");
  }

  static validateReviewSwapButtonWithoutBalance() {
    cy.get(LIFI_BUTTONS)
      .contains("Review swap")
      .should("be.visible")
      .and("be.enabled");
  }

  static validateNotEnoughFundsError() {
    this.hasText(
      WARNING_TEXT,
      "You don't have enough funds to execute the swap."
    );
  }

  static validateNotEnoughGasFundsError() {
    this.containsText(WARNING_TEXT, "Insufficient gas");
  }

  static clickOnHistoryPageButton() {
    this.click(HISTORY_BUTTON);
  }

  static validateNoHistoryMessage() {
    cy.get(HISTORY_BUTTON)
      .parent()
      .parent()
      .find("p")
      .contains("No recent swaps");
    cy.get(HISTORY_BUTTON)
      .parent()
      .parent()
      .find("p")
      .contains(
        "Swap history is only stored locally and will be deleted if you clear your browser data."
      );
  }

  static validateFromToInputsVisible() {
    cy.contains("From").should("be.visible");
    cy.contains("To").should("be.visible");
    cy.contains("Select chain and token");
    cy.contains("You pay");
  }

  static validateNoHistoryButtonWhenNotConnected() {
    this.doesNotExist(HISTORY_BUTTON);
  }

  static clickConnectWalletButton() {
    cy.get(LIFI_BUTTONS).contains("Connect wallet").click();
  }

  static openLifiSettings() {
    this.click(SETTINGS_BUTTON);
  }

  static verifyLifiSettingsFields() {
    cy.contains("Language").should("be.visible");
    cy.contains("English").should("be.visible");
    cy.contains("Route priority").should("be.visible");
    cy.contains("Recommended").should("be.visible");
    cy.contains("Slippage").should("be.visible");
    cy.contains("Gas price").should("be.visible");
    cy.contains("Show destination wallet").should("be.visible");
    cy.contains("Advanced preferences").should("be.visible");
  }

  static openTokenSelection() {
    cy.contains("From").click();
  }

  static validateOnlySupportedNetworksShown() {
    let supportedNetworks = [
      "Ethereum",
      "Polygon",
      "BSC",
      "Gnosis",
      "Avalanche",
      "Arbitrum",
      "Optimism",
    ];
    cy.get(NETWORK_BUTTONS)
      .parent()
      .parent()
      .each((button) => {
        expect(supportedNetworks).to.include(button.attr("aria-label"));
      });
  }

  static validateMainnetVisibleInNetworksList() {
    cy.get(NETWORK_BUTTONS)
      .parent()
      .parent()
      .should("have.attr", "aria-label", "Ethereum")
      .and("be.visible");
  }
}
