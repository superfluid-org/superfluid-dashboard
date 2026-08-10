///<reference types="cypress-iframe" />
import { BasePage } from '../BasePage';
import { networksBySlug } from '../../superData/networks';
import {
  TOP_BAR_NETWORK_BUTTON,
  CONNECTED_WALLET,
  WALLET_CONNECTION_STATUS,
} from './Common';

const GNOSIS_BUTTONS = '.MuiButton-contained';
const GNOSIS_SAFE_WALLET_OPTION = '[data-testid=wallet-selector-external-safe]';
// Safe's own stable hooks for the two gates it shows before mounting a third-party app.
const CONSENT_BANNER = '[data-testid=cookies-popup]';
const APP_INFO_MODAL = '[data-testid=app-info-modal]';
// Verified against https://app.superfluid.org/manifest.json: Safe titles the iframe with the
// app manifest's `name`, which is exactly "Superfluid Dashboard".
const SUPERFLUID_IFRAME = 'iframe[title="Superfluid Dashboard"]';
const LOADING_SPINNER = '.MuiCircularProgress-root';
const GNOSIS_WARNING_CHECKBOX = '.PrivateSwitchBase-input';
const CUSTOM_APP_URL_FIELD = 'input[name=appUrl]';
const CUSTOM_APP_TITLE = '[class*=customAppContainer] h2';
const CUSTOM_APP_DESCRIPTION = '[class*=customAppContainer] p';
const CUSTOM_APP_ERROR_ELEMENT = '[class*=customAppPlaceholderContainer]';
const CUSTOM_APP_WARNING_CHECKBOX = 'input[name=riskAcknowledgement]';
const CUSTOM_APP_ADD_BUTTON = '[role=dialog] [type=submit]';
const ADDED_CUSTOM_APP_TITLE = 'a[rel=noreferrer] [class*=safeAppTitle]';
const ADDED_CUSTOM_APP_DESCRIPTION =
  'a[rel=noreferrer] [class*=safeAppDescription]';
//Strings
const APP_TITLE = 'Superfluid Dashboard';
const APP_DESCRIPTION = 'Manage your Superfluid Protocol tokens';
const GNOSIS_SAFE_BASEURL = 'https://app.safe.global/';

const GnosisSafePrefixByNetworkSlug = {
  gnosis: 'gno:',
  ethereum: 'eth:',
  polygon: 'matic:',
  bsc: 'bnb:',
  'arbitrum-one': 'arb1:',
  avalanche: 'avax:',
  optimism: 'oeth:',
  celo: 'celo:',
};

const GnosisSafeAddressesPerNetwork = {
  gnosis: '0x340aeC5e697Ed31D70382D8dF141aAefA6b15E49',
  ethereum: '0x982046AeF10d24b938d85BDBBe262B811b0403b7',
  polygon: '0x195Dba965938ED77F8F4D25eEd0eC8a08407dA05',
  bsc: '0x36136B6b657D02812E4E8B88d23B552320F84698',
  'arbitrum-one': '0xe7ec208720dbf905b43c312Aa8dD2E0f3C865501',
  avalanche: '0x0BBE3e9f2FB2813E1418ddAf647d64A70de697d0',
  optimism: '0x9Fa707BCCA8B7163da2A30143b70A9b8BE0d0788',
  celo: '0x70fd86d7196813505ca9f9a77ef53Ab06A5ca603',
};

export class GnosisSafe extends BasePage {
  static openSafeOnNetwork(network: string) {
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}apps/open?safe=${
        GnosisSafePrefixByNetworkSlug[network]
      }${GnosisSafeAddressesPerNetwork[network]}&appUrl=${Cypress.config(
        'baseUrl'
      )}`
    );
  }

  /**
   * Click through the two gates Safe puts in front of a third-party app.
   *
   * Safe renders both on every fresh browser profile, which is what Cypress
   * always gives us, so both are asserted rather than probed conditionally:
   *
   *   1. the consent banner   -- [data-testid=cookies-popup]  -> "Accept all"
   *   2. the disclaimer modal -- [data-testid=app-info-modal] -> "Continue"
   *
   * Until the app-info-modal is dismissed Safe never mounts the app iframe at
   * all, so the old failure ("Expected to find element:
   * iframe[title=\"Superfluid Dashboard\"], but never found it") was this modal
   * still sitting on screen -- not a problem with the iframe or the manifest.
   *
   * This previously tried to pre-accept both gates by seeding storage
   * (SAFE_v2__classicViewEnabled / SAFE_v2__cookies_terms /
   * SAFE_v2__SafeApps__infoModal). Every one of those keys is gone: none of
   * `classicView`, `infoModal`, `consentsAccepted`, `warningCheckedCustomApps`,
   * `SafeApps__` or `termsVersion` appears anywhere in Safe's current bundle,
   * so the seeding silently did nothing. The old `continueDisclaimer` fallback
   * could not save it either -- it was a single non-retrying `cy.get('body')`
   * probe fired immediately after `cy.visit`, long before the modal renders.
   *
   * Clicking the real controls is also more durable than guessing storage keys,
   * which Safe has now renamed at least twice.
   */
  static dismissSafeGates() {
    cy.get(CONSENT_BANNER, { timeout: 60000 })
      .should('be.visible')
      .contains('button', 'Accept all')
      .click();

    cy.get(APP_INFO_MODAL, { timeout: 60000 })
      .should('be.visible')
      .contains('button', 'Continue')
      .click();

    // Deliberately no "the modal is gone" assertion. Safe keeps the
    // app-info-modal container mounted after Continue is clicked, so asserting
    // it no longer exists fails even though the gate has been dismissed --
    // which is what the first CI run on this change showed: all six scenarios
    // failed on that line, having successfully clicked both buttons. The real
    // success condition is the app iframe mounting, and `frameLoaded` in
    // `validateThatDashboardLoaded` already asserts exactly that.
  }

  static validateThatDashboardLoaded() {
    cy.frameLoaded(SUPERFLUID_IFRAME, { timeout: 45000 });
  }

  static connectGnosisSafeWallet() {
    // The dashboard auto-connects to the Safe through the Safe Apps SDK, so no manual
    // connect-wallet click is needed; just wait for the connection to settle.
    cy.enter(SUPERFLUID_IFRAME, { timeout: 45000 }).then((getBody) => {
      getBody().find(WALLET_CONNECTION_STATUS).should('contain.text', 'Connected');
    });
  }

  static validateCorrectlyConnectedWallet(network: string) {
    cy.enter(SUPERFLUID_IFRAME).then((getBody) => {
      getBody()
        .find(CONNECTED_WALLET)
        .should(
          'have.text',
          BasePage.shortenHex(GnosisSafeAddressesPerNetwork[network])
        );
      getBody().find(WALLET_CONNECTION_STATUS).should('have.text', 'Connected');
      getBody()
        .find(TOP_BAR_NETWORK_BUTTON)
        .should('contain.text', networksBySlug.get(network).name);
    });
  }

  static openCustomAppPage(network: string) {
    // The custom-apps page is reached via the `?safe=<prefix><address>` query param (the old
    // `/<prefix><address>/apps/custom` path now redirects to the welcome screen). No wallet is
    // needed - the classic Safe Apps view lets you manage custom apps in read-only mode.
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}apps/custom?safe=${
        GnosisSafePrefixByNetworkSlug[network]
      }${GnosisSafeAddressesPerNetwork[network]}`,
      { failOnStatusCode: false }
    );
    // Always register the production dashboard URL: Safe fetches the app manifest server-side,
    // and preview deployments can be access-restricted.
    Cypress.config('baseUrl', 'https://app.superfluid.org');
  }

  static addCustomSuperfluidApp() {
    cy.get(GNOSIS_BUTTONS).contains('Add custom Safe App').click();
    this.type(CUSTOM_APP_URL_FIELD, Cypress.config('baseUrl'));
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
