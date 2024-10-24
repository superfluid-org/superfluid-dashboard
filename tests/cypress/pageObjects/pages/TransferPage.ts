import { BasePage } from '../BasePage';
import { networksBySlug } from '../../superData/networks';
import { format } from 'date-fns';
import { CONNECT_WALLET_BUTTON, TOKEN_SEARCH_RESULTS } from './Common';

export const RANDOM_VALUE_DURING_TEST = Math.floor(Math.random() * 10) + 2;
const RECEIVER_BUTTON = '[data-cy=address-button]';
const SELECT_TOKEN_BUTTON = '[data-cy=select-token-button]';
const AMOUNT_INPUT = '[data-cy=amount-input]';
const ADDRESS_DIALOG_INPUT = '[data-cy=address-dialog-input]';
const OTHER_CLOSE_DIALOG_BUTTON = '[data-testid=CloseIcon]';
const ADDRESS_BUTTON_TEXT = '[data-cy=address-button]';
const TOKEN_SELECT_SYMBOL = '[data-cy=token-symbol-and-name] h6';
const PREVIEW_BALANCE = '[data-cy=balance]';
const DIALOG = '[role=dialog]';
const TOKEN_SEARCH_INPUT = '[data-cy=token-search-input] input';
const BALANCE_WRAP_BUTTON = '[data-cy=balance-wrap-button]';
const TRANSFER_BUTTON = '[data-cy=transfer-button]';
const RECENT_ENTRIES = '[data-cy=recents-entry]';
const DIALOG_CONTENT = '[data-cy=dialog-content]';
const OK_BUTTON = '[data-cy=ok-button]';
const TRANSACTION_ROWS = '[data-cy=transaction]';
const PENDING_MESSAGE = '[data-cy=pending-message]';
const LOADING_SPINNER = '.MuiCircularProgress-root';
const APPROVAL_MESSAGE = '[data-cy=approval-message]';
const TX_MESSAGE_NETWORK = '[data-cy=tx-network]';
const FORM_ERROR = '.MuiAlert-message';

export class TransferPage extends BasePage {
  static inputTransferTestData(isConnected: string) {
    const connected = isConnected === 'with';
    this.click(RECEIVER_BUTTON);
    cy.fixture('commonData').then((commonData) => {
      this.type(ADDRESS_DIALOG_INPUT, commonData.staticBalanceAccount);
      this.doesNotExist(ADDRESS_DIALOG_INPUT);
      this.hasText(ADDRESS_BUTTON_TEXT, commonData.staticBalanceAccount);
      this.click(SELECT_TOKEN_BUTTON);

      if (connected) {
        //Wait for all balances to load, then open and close the menu to sort them
        cy.get(TOKEN_SEARCH_RESULTS).then((el) => {
          this.hasLength(PREVIEW_BALANCE, el.length);
        });
        this.click(`${DIALOG} ${OTHER_CLOSE_DIALOG_BUTTON}`);
        this.click(SELECT_TOKEN_BUTTON);
      } else {
        this.doesNotExist(PREVIEW_BALANCE);
      }
      cy.get(TOKEN_SEARCH_RESULTS)
        .eq(0)
        .find(TOKEN_SELECT_SYMBOL)
        .then(($tokenSearchResultName) => {
          cy.wrap($tokenSearchResultName.text()).as('lastChosenToken');
        });
      this.clickFirstVisible(TOKEN_SEARCH_RESULTS);
      this.type(AMOUNT_INPUT, '1');
    });
  }

  static validateTransferPagePreviewBalance() {
    cy.fixture('networkSpecificData').then((networkSpecificData) => {
      let selectedValues =
        networkSpecificData.polygon.staticBalanceAccount.tokenValues[0].balance;

      this.hasText(PREVIEW_BALANCE, `${selectedValues} `);

      this.isVisible(BALANCE_WRAP_BUTTON);
    });
  }

  static clickBalancePreviewWrapButton() {
    this.doesNotExist(TOKEN_SEARCH_INPUT);
    this.click(BALANCE_WRAP_BUTTON);
  }

  static inputTransferDetails(amount: string, token: string, address: string) {
    this.getSelectedToken(token).then((selectedToken) => {
      this.click(RECEIVER_BUTTON);
      this.type(ADDRESS_DIALOG_INPUT, address);
      cy.wait(2000);
      cy.get('body').then((body) => {
        if (body.find('[role=presentation]').length > 0) {
          body.find('[role=presentation]').click();
        }
      });
      this.doesNotExist('[role=dialog]');
      this.click(SELECT_TOKEN_BUTTON);
      this.click(`[data-cy="${selectedToken}-list-item"]`, 0, {
        timeout: 60000,
      });
      this.hasText(SELECT_TOKEN_BUTTON, selectedToken, undefined, {
        timeout: 30000,
      });
      const amountToPutIn =
        amount === 'random' ? RANDOM_VALUE_DURING_TEST : amount;
      this.type(AMOUNT_INPUT, amountToPutIn);
    });
  }

  static clickTransferButton() {
    cy.get(TRANSFER_BUTTON).as('transferButton');
    this.isNotDisabled('@transferButton', undefined, { timeout: 45000 });
    this.click('@transferButton');
  }

  static validateTransferTxMessage(network: string) {
    this.isVisible(LOADING_SPINNER);
    this.hasText(APPROVAL_MESSAGE, 'Waiting for transaction approval...');
    this.hasText(TX_MESSAGE_NETWORK, `(${networksBySlug.get(network)?.name})`);
  }

  static validateBroadcastedTransactionTxMessage() {
    this.isVisible(DIALOG_CONTENT);
    this.hasText(DIALOG_CONTENT, 'Transaction broadcasted');
  }

  static clickOkButton() {
    this.isVisible(OK_BUTTON);
    this.click(OK_BUTTON);
  }

  static validateNoPendingStatusForFirstTransferRow() {
    cy.get(TRANSACTION_ROWS)
      .first()
      .find(PENDING_MESSAGE, { timeout: 120000 })
      .should('not.exist');
  }

  static validateRestoredTransferTransaction(
    amount: string,
    token: string,
    address: string,
    network: string
  ) {
    this.hasText(ADDRESS_BUTTON_TEXT, address);
    this.hasText(SELECT_TOKEN_BUTTON, token);
    const valueToCheck =
      amount === 'random' ? RANDOM_VALUE_DURING_TEST : amount;
    this.type(AMOUNT_INPUT, valueToCheck);
    this.isVisible(`[data-cy=network-badge-${networksBySlug.get(network)?.id}`);
  }

  static validateFormError(error: string) {
    this.hasText(FORM_ERROR, error, 0);
    this.isDisabled(TRANSFER_BUTTON);
  }
}
