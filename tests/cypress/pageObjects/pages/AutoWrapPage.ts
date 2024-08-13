import { networksBySlug } from '../../superData/networks';
import { BasePage } from '../BasePage';
import { TOP_BAR_NETWORK_BUTTON, CHANGE_NETWORK_BUTTON } from './Common';

const ENABLE_BUTTONS = '[data-cy=enable-auto-wrap-button]';
const DISABLE_BUTTONS = '[data-cy=disable-auto-wrap-button]';
const TOKEN_SYMBOLS = '[data-cy=auto-wrap-token]';
const ADD_TOKEN_BUTTON = '[data-cy=add-token-auto-wrap-button]';
const ADD_TOKEN_NETWORK_BUTTON = '[data-cy=top-bar-network-button]';
const ADD_TOKEN_DIALOG = '[data-cy=auto-wrap-add-token-dialog-section]';
const EMPTY_SCREEN_TITLE = '[data-cy=title]';
const EMPTY_SCREEN_DESCRIPTION = '[data-cy=description]';
const NO_PERMISSIONS_SCREEN = '[data-cy=empty-permissions-screen]';
const ALLOWLIST_MESSAGE = '[data-cy=no-scheduled-wrap-message]';
const APPLY_FOR_ACCESS_BUTTON = '[data-cy=auto-wrap-allowlist-link]';
const UNDERLYING_TOKEN_ALLOWANCES = '[data-cy=underlying-token-allowance]';

export class AutoWrapPage extends BasePage {
  static clickEnableAutoWrapInDialog() {
    this.click(`${ADD_TOKEN_DIALOG} ${ENABLE_BUTTONS}`);
  }
  static validateContractButtonsAndAddresses(network: string) {
    this.isVisible(`[data-cy=${network}-auto-wrap-manager-contract-buttons]`);
    this.hasAttributeWithValue(
      `[data-cy=${network}-auto-wrap-manager-contract-buttons] a`,
      'href',
      networksBySlug
        .get(network)
        .getLinkForAddress(
          networksBySlug.get(network).autoWrap?.managerContractAddress
        )
    );
    this.hasAttributeWithValue(
      `[data-cy=${network}-auto-wrap-strategy-contract-buttons] a`,
      'href',
      networksBySlug
        .get(network)
        .getLinkForAddress(
          networksBySlug.get(network).autoWrap?.strategyContractAddress
        )
    );
  }
  static validateNoEnableOrDisableButtonsInTable() {
    this.doesNotExist(DISABLE_BUTTONS);
  }
  static validateAllActionButtonsChangedToSwitchNetwork(network: string) {
    this.doesNotExist(
      `[data-cy=${network}-token-snapshot-table] ${DISABLE_BUTTONS}`
    );
    this.doesNotExist(
      `[data-cy=${network}-token-snapshot-table] ${ENABLE_BUTTONS}`
    );
    cy.get(`[data-cy=${network}-token-snapshot-table] [data-cy*=-row]`)
      .its('length')
      .then((length) => {
        this.hasLength(
          `[data-cy=${network}-token-snapshot-table] ${CHANGE_NETWORK_BUTTON}`,
          length
        );
      });
  }
  static validateNetworkAutoWrapData(network: string) {
    cy.fixture('autoWrapTableData').then((data) => {
      data[network].forEach(
        (row: {
          asset: string;
          underlyingAllowance: string;
          lowerLimit: string;
          upperLimit: string;
        }) => {
          let rowSelector = `[data-cy=${network}-token-snapshot-table] [data-cy=${row.asset}-row]`;
          this.hasText(`${rowSelector} ${TOKEN_SYMBOLS}`, row.asset);
          this.hasText(
            `${rowSelector} ${UNDERLYING_TOKEN_ALLOWANCES}`,
            row.underlyingAllowance
          );
          this.hasText(
            `${rowSelector} [data-cy=${row.asset}-lower-limit]`,
            row.lowerLimit
          );
          this.hasText(
            `[data-cy=${network}-token-snapshot-table] [data-cy=${row.asset}-upper-limit]`,
            row.upperLimit
          );
        }
      );
    });
  }
  static validateNoPermissionsSetScreen() {
    this.hasText(EMPTY_SCREEN_TITLE, 'Nothing to see here');
    this.hasText(
      EMPTY_SCREEN_DESCRIPTION,
      'Add your first Auto-Wrap configuration'
    );
  }
  static clickAddTokenButtonInNoPermissionsScreen() {
    this.click(`${NO_PERMISSIONS_SCREEN} ${ADD_TOKEN_BUTTON}`);
  }
  static validateAutoWrapDialogIsOpen() {
    this.isVisible(ADD_TOKEN_DIALOG);
  }
  static validateAllowlistScreenIsOpen() {
    this.doesNotExist(ADD_TOKEN_BUTTON);
    this.hasText(ALLOWLIST_MESSAGE, 'You are not on the allow list.');
    this.isVisible(APPLY_FOR_ACCESS_BUTTON);
    this.hasAttributeWithValue(
      APPLY_FOR_ACCESS_BUTTON,
      'href',
      'https://use.superfluid.finance/autowrap'
    );
  }

  static clickAddTokenButton() {
    this.click(ADD_TOKEN_BUTTON);
  }
  static selectNetworkForAutoWrap(network: string) {
    let selectedNetwork = this.getSelectedNetwork(network);
    this.click(TOP_BAR_NETWORK_BUTTON, -1);
    this.click(`[data-cy=${selectedNetwork}-button`);
    //Cypress is too fast and sometimes the token selection resets if we don't wait for sdk to initialize
    cy.wait(3000);
  }

  static clickEnableButtonForTokenOnNetwork(token: string, network: string) {
    let selectedNetwork = this.getSelectedNetwork(network);
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(
        `[data-cy=${selectedNetwork}-token-snapshot-table] [data-cy="${selectedToken}-row"] ${ENABLE_BUTTONS}`
      );
    });
  }
  static clickDisableButtonForTokenOnNetwork(token: any, network: any) {
    let selectedNetwork = this.getSelectedNetwork(network);
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(
        `[data-cy=${selectedNetwork}-token-snapshot-table] [data-cy="${selectedToken}-row"] ${DISABLE_BUTTONS}`
      );
    });
  }
  static clickAutoWrapCloseTxButton() {
    this.hasText(`${ADD_TOKEN_DIALOG} ${ENABLE_BUTTONS}`, 'Close').click();
  }

  static validateNoAutoWrapDialogIsVisible() {
    this.isNotVisible(ADD_TOKEN_DIALOG);
  }
}
