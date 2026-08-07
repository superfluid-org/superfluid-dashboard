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
// Safe sets the iframe title to the app's manifest name (previously a generic "unknown").
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
  // Safe migrated to a new "Workspaces" UI that hides the classic Safe Apps flow behind a
  // sign-in wall. These storage entries replicate what clicking "Use the old UI" + accepting
  // the cookie banner + the third-party app disclaimer would set, so no modal blocks the app.
  static seedSafeClassicView(window: Window, chainId?: number) {
    // What the "Use the old UI" button sets - keeps us on the classic Safe Apps experience.
    window.sessionStorage.setItem('SAFE_v2__classicViewEnabled', 'true');
    // Pre-accept the cookie banner.
    window.localStorage.setItem(
      'SAFE_v2__cookies_terms',
      JSON.stringify({
        terms: true,
        necessary: true,
        updates: true,
        analytics: true,
        termsVersion: '1.3',
      })
    );
    // Pre-accept the "third-party apps" disclaimer (keyed per chainId).
    if (chainId !== undefined) {
      window.localStorage.setItem(
        'SAFE_v2__SafeApps__infoModal',
        JSON.stringify({
          [chainId]: { consentsAccepted: true, warningCheckedCustomApps: [] },
        })
      );
    }
  }

  static openSafeOnNetwork(network: string) {
    const chainId = networksBySlug.get(network)?.id;
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}apps/open?safe=${
        GnosisSafePrefixByNetworkSlug[network]
      }${GnosisSafeAddressesPerNetwork[network]}&appUrl=${Cypress.config(
        'baseUrl'
      )}`,
      {
        onBeforeLoad: (window) => {
          this.seedSafeClassicView(window, chainId);
        },
      }
    );
  }

  static continueDisclaimer() {
    // The cookie banner and disclaimer are pre-accepted via seeded storage in openSafeOnNetwork.
    // Kept as a guarded fallback in case Safe still renders the disclaimer "Continue" button.
    cy.get('body').then(($body) => {
      const continueButton = $body
        .find(GNOSIS_BUTTONS)
        .filter((_i, el) => el.textContent?.trim() === 'Continue');
      if (continueButton.length) {
        cy.wrap(continueButton.first()).click();
      }
    });
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
    const chainId = networksBySlug.get(network)?.id;
    // The custom-apps page is reached via the `?safe=<prefix><address>` query param (the old
    // `/<prefix><address>/apps/custom` path now redirects to the welcome screen). No wallet is
    // needed - the classic Safe Apps view lets you manage custom apps in read-only mode.
    cy.visit(
      `${GNOSIS_SAFE_BASEURL}apps/custom?safe=${
        GnosisSafePrefixByNetworkSlug[network]
      }${GnosisSafeAddressesPerNetwork[network]}`,
      {
        failOnStatusCode: false,
        onBeforeLoad: (window) => {
          this.seedSafeClassicView(window, chainId);
        },
      }
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
