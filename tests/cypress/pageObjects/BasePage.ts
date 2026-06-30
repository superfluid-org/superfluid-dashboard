import format from 'date-fns/format';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export enum UnitOfTime {
  Second = 1,
  Minute = 60,
  Hour = 3600,
  Day = 86400,
  Week = 604800,
  Month = 2628000,
  Year = 31536000,
}

export const wordTimeUnitMap: Record<string, UnitOfTime> = {
  second: UnitOfTime.Second,
  minute: UnitOfTime.Minute,
  hour: UnitOfTime.Hour,
  day: UnitOfTime.Day,
  week: UnitOfTime.Week,
  month: UnitOfTime.Month,
  year: UnitOfTime.Year,
};

export class BasePage {
  static getSelectedNetwork(network: string) {
    return network === 'selected network' ? Cypress.env('network') : network;
  }
  static getSelectedToken(token: string) {
    return cy.fixture('rejectedCaseTokens').then((tokens) => {
      let selectedToken: string;

      if (token.startsWith('Token')) {
        selectedToken = token.endsWith('x')
          ? `${tokens[Cypress.env('network')][token.slice(0, -1)]}x`
          : tokens[Cypress.env('network')][token];
        if (selectedToken === 'WORKx') {
          selectedToken = 'WORK';
        }
      } else {
        selectedToken = token;
      }
      return selectedToken;
    });
  }

  // Select a token in the shared token dialog and confirm it actually "stuck".
  // The old helpers clicked the list item and moved on, so a missed pick only
  // surfaced much later as a disabled/placeholder action button. We instead
  // assert the select button shows the chosen token before continuing (the
  // assertion retries, giving the form state time to settle).
  static selectTokenFromDialog(token: string) {
    const SELECT_TOKEN_BUTTON = '[data-cy=select-token-button]';
    const SELECTED_TOKEN = `${SELECT_TOKEN_BUTTON} span[translate=no]`;
    const TOKEN_SEARCH_INPUT = '[data-cy=token-search-input] input';

    return this.getSelectedToken(token).then((selectedToken) => {
      // Some flows open the dialog in a previous step; only open it if needed.
      cy.get('body', { log: false }).then(($body) => {
        if ($body.find(TOKEN_SEARCH_INPUT).filter(':visible').length) return;
        // force:true because a *previous* transaction/confirmation dialog can still be fading
        // out (MuiDialog-container, 225ms opacity) and transiently "cover" this button on slow
        // CI — and in the ACL / auto-wrap flows the button legitimately lives *inside* a dialog,
        // so we can't wait for all dialogs to disappear. The open is confirmed below by waiting
        // for the token search input + list to render.
        cy.get(SELECT_TOKEN_BUTTON, { timeout: 30000 })
          .filter(':visible')
          .first()
          .scrollIntoView()
          .click({ force: true });
      });
      cy.get(TOKEN_SEARCH_INPUT, { timeout: 30000 }).should('be.visible');
      // Wait for the initial token fetch to render the list BEFORE typing. The dialog shows a
      // spinner while fetching and re-renders as balances load; typing/clearing mid-re-render
      // detaches the search input on slower CI ("cy.clear() failed because the page updated").
      cy.get('[data-cy$="-list-item"]', { timeout: 30000 }).should(
        'have.length.gte',
        1
      );
      // Filter the (balance-sorted) list by symbol so a token the connected account holds no
      // balance of still surfaces. The dialog resets the search to empty on open, so type
      // directly — no chained .clear() (which would detach the chain on re-render).
      cy.get(TOKEN_SEARCH_INPUT).type(selectedToken);
      cy.get(`[data-cy="${selectedToken}-list-item"]`, { timeout: 30000 })
        .filter(':visible')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      return cy
        .get(SELECTED_TOKEN, { timeout: 30000 })
        .filter(':visible')
        .first()
        .should('have.text', selectedToken);
    });
  }

  static ensureDefined<T>(value: T | undefined | null): T {
    if (!value) throw Error('Value has to be defined.');
    return value;
  }

  static shortenHex(address: string, length = 4) {
    return address.includes('@')
      ? address
      : `${address.substring(0, 2 + length)}...${address.substring(
          address.length - length,
          address.length
        )}`;
  }

  static get(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    if (index !== undefined) {
      return cy.get(selector, options).eq(index);
    }
    return cy.get(selector, options);
  }

  static click(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    this.get(selector, index, options).click();
  }

  static forceClick(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    this.get(selector, index, options).click({ force: true });
  }

  static select(
    selector: string,
    selectionOption: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    this.get(selector, index, options).select(selectionOption);
  }

  static clickFirstVisible(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .filter(':visible')
      .first()
      .click();
  }

  static type(
    selector: string,
    text: string | number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .filter(':visible')
      .type(text.toString());
  }

  static typeDateTime(
    selector: string,
    text: string | number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .filter(':visible')
      .then(($input) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call($input[0], text.toString());

          $input[0].dispatchEvent(new Event('input', { bubbles: true }));
          $input[0].dispatchEvent(new Event('change', { bubbles: true }));
          $input[0].dispatchEvent(new Event('blur'));
        }
      });
  }

  static hasText(
    selector: string,
    text?: JQuery<HTMLElement> | string | string[] | number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .filter(':visible')
      .should('have.text', text);
  }

  static doesNotHaveText(
    selector: string,
    text?: JQuery<HTMLElement> | string | string[] | number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .filter(':visible')
      .should('not.have.text', text);
  }

  static check(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).check();
  }

  static scrollToAndHasText(
    selector: string,
    text: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options)
      .scrollIntoView()
      .should('have.text', text);
  }

  static scrollTo(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).scrollIntoView();
  }

  static doesNotExist(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('not.exist');
  }

  static exists(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('exist');
  }

  static isVisible(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('be.visible');
  }

  static isNotVisible(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('not.be.visible');
  }

  static isNotDisabled(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should(
      'not.have.attr',
      'disabled'
    );
  }

  static isEnabled(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('be.enabled');
  }

  static isDisabled(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('have.attr', 'disabled');
  }

  static containsText(
    selector: string,
    text: JQuery<HTMLElement> | string | string[] | number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('contain.text', text);
  }

  static contains(
    selector: string,
    number: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('contain', number);
  }

  static clear(
    selector: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).filter(':visible').clear();
  }

  static hasCSS(
    selector: string,
    value: string,
    match: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('have.css', value, match);
  }

  static hasLength(
    selector: string,
    length: number,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('have.length', length);
  }

  static hasValue(
    selector: string,
    value: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should('have.value', value);
  }

  static trigger(
    selector: string,
    event: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).trigger(event);
  }

  static hasAttributeWithValue(
    selector: string,
    attribute: string,
    value: string,
    index?: number,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ) {
    return this.get(selector, index, options).should(
      'have.attr',
      attribute,
      value
    );
  }

  static getDayTimestamp(days: number) {
    let today = new Date();
    let timestamp = today.setDate(today.getDate() + days);
    return Number((timestamp.valueOf() / 1000).toFixed());
  }

  static getNotificationDateString(date: Date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  }

  static generateNewWallet() {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const publicKey = account.address;

    cy.wrap(privateKey).as('newWalletPrivateKey');
    cy.wrap(publicKey).as('newWalletPublicKey');
    cy.log(`Public key:${publicKey}`);
    cy.log(`Private key:${privateKey}`);
    return privateKey;
  }

  static getNotifDateAssertStringFromDate(date: Date) {
    return format(
      Number((date.getTime() / 1000).toFixed(0)) * 1000,
      'yyyy/MM/dd HH:mm'
    );
  }
}
