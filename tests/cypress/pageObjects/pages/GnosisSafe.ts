///<reference types="cypress-iframe" />
import { BasePage } from "../BasePage";
import { networksBySlug } from "../../superData/networks";
import {
  TOP_BAR_NETWORK_BUTTON,
  CONNECT_WALLET_BUTTON,
  CONNECTED_WALLET,
  WALLET_CONNECTION_STATUS,
} from "./Common";

const GNOSIS_BUTTONS = ".MuiButton-contained";
const GNOSIS_SAFE_WALLET_OPTION = "[data-testid=rk-wallet-option-gnosis-safe]";
const SUPERFLUID_IFRAME = 'iframe[title="Superfluid Dashboard"]';
const LOADING_SPINNER = ".MuiCircularProgress-root";
const GNOSIS_WARNING_CHECKBOX = ".PrivateSwitchBase-input";
const CUSTOM_APP_URL_FIELD = "input[name=appUrl]";
const CUSTOM_APP_TITLE = "[class*=customAppContainer] h2";
const CUSTOM_APP_DESCRIPTION = "[class*=customAppContainer] p";
const CUSTOM_APP_ERROR_ELEMENT = "[class*=customAppPlaceholderContainer]";
const CUSTOM_APP_WARNING_CHECKBOX = "input[name=riskAcknowledgement]";
const CUSTOM_APP_ADD_BUTTON = "[role=dialog] [type=submit]";
const ADDED_CUSTOM_APP_TITLE =
  "[class*=safeAppsContainer] a[rel=noreferrer] div h5";
const ADDED_CUSTOM_APP_DESCRIPTION =
  "[class*=safeAppsContainer] a[rel=noreferrer] div p";
//Strings
const APP_TITLE = "Superfluid Dashboard";
const APP_DESCRIPTION = "Manage your Superfluid Protocol tokens";
const GNOSIS_SAFE_BASEURL = "https://app.safe.global/";

const GnosisSafePrefixByNetworkSlug = {
  gnosis: "gno:",
  ethereum: "eth:",
  polygon: "matic:",
  bsc: "bnb:",
  "arbitrum-one": "arb1:",
  avalanche: "avax:",
  optimism: "oeth:",
  goerli: "gor:",
  celo: "celo:",
};

const GnosisSafeAddressesPerNetwork = {
  gnosis: "0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49",
  ethereum: "0x982046AeF10d24b938d85BDBBe262B811b0403b7",
  polygon: "0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05",
  bsc: "0x36136B6b657D02812E4E8B88d23B552320F84698",
  "arbitrum-one": "0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501",
  avalanche: "0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0",
  optimism: "0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788",
  goerli: "0x3277Ea3910A354621f144022647082E1E06fDe8a",
  celo: "0x70fd86d7196813505ca9f9a77ef53Ab06A5ca603",
};

export class GnosisSafe extends BasePage {
  static openSafeOnNetwork(network: string) {
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}apps/open?safe=${
        GnosisSafePrefixByNetworkSlug[network]
      }${GnosisSafeAddressesPerNetwork[network]}&appUrl=${Cypress.config(
        "baseUrl"
      )}`
    );
  }

  static continueDisclaimer() {
    //The disclaimer is quite annoying and messes up when cypress quickly clicks on it
    //Waiting for other stuff to be visible / not be visible / exist / not exist didn't help here :(
    cy.get(GNOSIS_BUTTONS, { timeout: 30000 }).contains("Accept all").click();
    cy.get(GNOSIS_BUTTONS).contains("Accept all").should("not.exist");
    cy.wait(1000);
    cy.get(GNOSIS_BUTTONS, { timeout: 30000 }).contains("Continue").click();
    cy.wait(1000);
    cy.get(".MuiTypography-root > .MuiBox-root").should("not.be.visible");
    this.click(GNOSIS_WARNING_CHECKBOX);
    cy.wait(1000);
    cy.get(GNOSIS_BUTTONS).contains("Continue").click();
    this.isVisible(LOADING_SPINNER);
    this.doesNotExist(LOADING_SPINNER);
  }

  static validateThatDashboardLoaded() {
    cy.frameLoaded(SUPERFLUID_IFRAME);
  }

  static connectGnosisSafeWallet() {
    cy.enter(SUPERFLUID_IFRAME).then((getBody) => {
      getBody().find(CONNECT_WALLET_BUTTON).first().click();
      getBody().find(GNOSIS_SAFE_WALLET_OPTION).click();
    });
  }

  static validateCorrectlyConnectedWallet(network: string) {
    cy.enter(SUPERFLUID_IFRAME).then((getBody) => {
      getBody()
        .find(CONNECTED_WALLET)
        .should(
          "have.text",
          BasePage.shortenHex(GnosisSafeAddressesPerNetwork[network])
        );
      getBody().find(WALLET_CONNECTION_STATUS).should("have.text", "Connected");
      getBody()
        .find(TOP_BAR_NETWORK_BUTTON)
        .should("contain.text", networksBySlug.get(network).name);
    });
  }

  static openCustomAppPage(network) {
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}${GnosisSafePrefixByNetworkSlug[network]}${GnosisSafeAddressesPerNetwork[network]}/apps/custom`
    );
    Cypress.config("baseUrl", "https://app.superfluid.finance");
    cy.get(GNOSIS_BUTTONS, { timeout: 30000 }).contains("Accept all").click();
  }

  static addCustomSuperfluidApp() {
    cy.get(GNOSIS_BUTTONS).contains("Add custom app").click();
    this.type(CUSTOM_APP_URL_FIELD, Cypress.config("baseUrl"));
  }

  static validateSuperfluidManifestAndAddApp() {
    this.doesNotExist(CUSTOM_APP_ERROR_ELEMENT);
    this.hasText(CUSTOM_APP_TITLE, APP_TITLE);
    this.hasText(CUSTOM_APP_DESCRIPTION, APP_DESCRIPTION);
    this.click(CUSTOM_APP_WARNING_CHECKBOX);
    this.click(CUSTOM_APP_ADD_BUTTON);
  }

  static validateCustomAppExistsInGnosisSafe() {
    this.hasText(ADDED_CUSTOM_APP_TITLE, APP_TITLE);
    this.hasText(ADDED_CUSTOM_APP_DESCRIPTION, APP_DESCRIPTION);
  }
}
