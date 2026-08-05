import { BasePage, UnitOfTime } from '../BasePage';

const ADDRESS_BUTTONS = '[data-cy=address-button]';
const ADDRESS_INPUT = '[data-cy=address-dialog-input]';
const ADDRESS_BOOK_ENTRIES = '[data-cy=address-book-entry]';
const SEARCH_ENTRIES = '[data-cy=search-entry]';
const REMOVE_ADDRESS_BUTTON = '[data-cy=remove-address-btn]';
const SELECTED_ADDRESSES = '[data-cy=list-selected-address]';
const SELECTED_FORM_ADDRESSES = '[data-cy=selected-address]';
const OK_BUTTON = '[data-cy=ok-button]';
const SEARCH_ADDRESSES = '[data-cy=list-search-address]';
const EXPORT_START_DATE = '[data-cy=export-start-date]';
const EXPORT_END_DATE = '[data-cy=export-end-date]';
const PRICE_GRANULARITY = '[data-cy=price-granularity]';
const ACCOUNTING_PERIOD = '[data-cy=accounting-period]';
const CURRENCY_BUTTON = '[data-cy=currency-button]';
const EXPORT_PREVIEW = '[data-cy=export-preview-button]';
const COLUMN_HEADERS = '.MuiDataGrid-columnHeaderTitleContainer';
const HEADER_TRIPLE_DOTS = '.MuiDataGrid-menuIconButton';
const COLUMN_MENU = '.MuiDataGrid-menu';
const FILTER_OPTIONS = `${COLUMN_MENU} li`;
const COLUMN_CHECKBOXES =
  '.MuiDataGrid-panelWrapper input.PrivateSwitchBase-input';
const DATE_PICKER_YEAR_BUTTONS = '.MuiYearCalendar-button';
const DATE_PICKER_MONTH_BUTTONS = '.MuiMonthCalendar-button';
const END_DATE_PICKER_BUTTON = '[data-cy=end-date-picker-button]';
const EXPORT_CSV = '[data-cy=export-csv-button]';
const AMOUNT_CELLS = '.MuiDataGrid-cell[data-field=amount]';
const COUNTERPARTY_CELLS = '.MuiDataGrid-cell[data-field=counterparty]';
const DATE_CELLS = '.MuiDataGrid-cell[data-field=date]';
const FILTER_SELECT_FIELDS = '.MuiFormControl-root .MuiInputBase-root select';
const FILTER_INPUT_FIELDS = '.MuiFormControl-root .MuiInputBase-root input';

const EXPORTING_ENDPOINT =
  'https://accounting.superfluid.dev/v1/stream-periods**';
const TESTING_ACCOUNT1 = '0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40';
const TESTING_ACCOUNT2 = '0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2';

const GranularityWordMap: Record<string, UnitOfTime> = {
  Hourly: UnitOfTime.Hour,
  Daily: UnitOfTime.Day,
  Weekly: UnitOfTime.Week,
  Monthly: UnitOfTime.Month,
  Yearly: UnitOfTime.Year,
};

const ApiWordMap: Record<string, string> = {
  Hourly: 'hour',
  Daily: 'day',
  Weekly: 'week',
  Monthly: 'month',
  Yearly: 'year',
};

// The accounting API's fiat values are derived from an upstream historical price
// backfill which gets re-indexed from time to time: replaying the exact same
// (fixed, historical) query months apart returns the same on-chain data but fiat
// values that drift by a fraction of a percent. Comparing those exactly asserts
// that a third-party price index has not been recomputed, which is not something
// this suite is meant to test. Everything else in the response - ids, wei amounts,
// timestamps, block numbers, tx hashes, token metadata, row order - is still
// compared exactly, and the fiat values are still checked to be within 1% of the
// recorded ones (which catches a wrong currency, wrong granularity, a missing
// price, or a sign flip).
const FIAT_FIELDS = [
  'amountFiat',
  'streamedAmountFiat',
  'transferredAmountFiat',
] as const;
const FIAT_RELATIVE_TOLERANCE = 0.01;

// The same three fiat values as they appear in the CSV export, by column header.
// (The "Token amount" / "Token streamed" / "Token transferred" columns are the
// on-chain token amounts, not fiat, and stay byte-exact.)
const CSV_FIAT_COLUMNS = ['Amount', 'Streamed', 'Transferred'];

// The CSV rounds fiat to 2 decimals, which makes a purely relative tolerance
// useless there: a recorded "0.02" against a re-indexed "0.03" is a 50% relative
// difference but only one cent, and a recorded "0.00" gives a tolerance of
// exactly 0. One cent of absolute slack absorbs a price re-index crossing a
// rounding boundary while still catching a wrong currency, wrong granularity,
// a missing price or a sign flip.
const CSV_FIAT_ABSOLUTE_TOLERANCE = 0.01;

const allColumns = [
  'date',
  'startDate',
  'amount',
  'counterparty',
  'counterpartyAddress',
  'tokenSymbol',
  'network',
  'transaction',
  'sender',
  'receiver',
  'transactionHash',
  'tokenAddress',
  'tokenName',
];

export class ExportPage extends BasePage {
  private static expectStreamPeriodsToMatch(actual: any, expected: any) {
    expect(actual).to.be.an('array');
    expect(expected).to.be.an('array');

    const withoutFiat = (streamPeriods: any[]) =>
      streamPeriods.map((streamPeriod) => ({
        ...streamPeriod,
        virtualPeriods: streamPeriod.virtualPeriods.map(
          (virtualPeriod: any) => {
            const stripped = { ...virtualPeriod };
            FIAT_FIELDS.forEach((field) => delete stripped[field]);
            return stripped;
          }
        ),
      }));

    expect(withoutFiat(actual)).to.deep.eq(withoutFiat(expected));

    actual.forEach((streamPeriod: any, streamPeriodIndex: number) => {
      streamPeriod.virtualPeriods.forEach(
        (virtualPeriod: any, virtualPeriodIndex: number) => {
          const expectedVirtualPeriod =
            expected[streamPeriodIndex].virtualPeriods[virtualPeriodIndex];
          FIAT_FIELDS.forEach((field) => {
            const label = `${streamPeriod.id} virtual period #${virtualPeriodIndex} ${field}`;
            // Presence is asserted BEFORE the numeric comparison. `withoutFiat`
            // deletes these fields before the deep-equality check, so nothing
            // else notices if the API stops returning one; and since many of the
            // recorded values are 0, coercing a missing field to 0 would compare
            // 0 against 0 and pass. A dropped field must fail here or nowhere.
            const actualRaw = virtualPeriod[field];
            const expectedRaw = expectedVirtualPeriod[field];
            expect(
              expectedRaw,
              `${label}: the recorded fixture is missing this field — re-record it`
            ).to.not.be.oneOf([undefined, null]);
            expect(
              actualRaw,
              `${label}: the API response is missing this field`
            ).to.not.be.oneOf([undefined, null]);

            const actualValue = Number(actualRaw);
            const expectedValue = Number(expectedRaw);
            expect(
              Number.isFinite(actualValue),
              `${label}: the API returned a non-numeric value ${JSON.stringify(
                actualRaw
              )}`
            ).to.eq(true);
            expect(
              Number.isFinite(expectedValue),
              `${label}: the recorded fixture holds a non-numeric value ${JSON.stringify(
                expectedRaw
              )}`
            ).to.eq(true);

            expect(
              Math.abs(actualValue - expectedValue),
              `${label}: ${actualValue} vs recorded ${expectedValue}`
            ).to.be.at.most(
              Math.abs(expectedValue) * FIAT_RELATIVE_TOLERANCE
            );
          });
        }
      );
    });
  }

  // The DataGrid column menu button is `visibility: hidden` until its column
  // header is hovered (MUI X v9 GridRootStyles) and CSS `:hover` can't be
  // simulated from Cypress, so it has to be force clicked. The old code force
  // clicked it and then clicked "the first visible menu button" - which is the
  // same button, now visible because its menu is open, so the second click
  // toggled the menu straight back closed (and timed out with "cy.click()
  // failed because it requires a DOM element" whenever the first click hadn't
  // made anything visible yet). One click, then wait for the menu.
  private static openFirstColumnMenu() {
    this.forceClick(HEADER_TRIPLE_DOTS, 0);
    this.isVisible(COLUMN_MENU);
  }

  static searchForAccount(address: string) {
    this.clickFirstVisible(ADDRESS_BUTTONS);
    this.type(ADDRESS_INPUT, address);
  }

  // search-entry / list-selected-address render the address as shortenHex(address, 6)
  // (and may show a whois name in the primary line) — the full 42-char address is never
  // in the DOM text, so match the shortened form instead. Case-insensitive to tolerate
  // EIP-55 checksum casing differences.
  private static shortenAddress(address: string) {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }

  static selectAddressFromSearchResults(address: string) {
    cy.get(SEARCH_ENTRIES)
      .contains(this.shortenAddress(address), { matchCase: false })
      .click();
  }

  static validateSelectedAddress(address: string) {
    cy.get(SELECTED_ADDRESSES)
      .contains(this.shortenAddress(address), { matchCase: false })
      .should('be.visible');
    cy.get(SEARCH_ENTRIES)
      .contains(this.shortenAddress(address), { matchCase: false })
      .should('be.visible');
  }

  static removeLastSelectedAddressFromSearchList() {
    this.clickFirstVisible(SELECTED_ADDRESSES);
  }

  static validateNoOkPageAndNoEntriesHighlighted() {
    this.doesNotExist(OK_BUTTON);
    this.doesNotExist(SELECTED_ADDRESSES);
  }

  static validateSelectedAddressAmount(amount: string) {
    let expectedText =
      amount === '0' ? 'Select address(es)' : `${amount} address(es) selected`;
    this.hasText(ADDRESS_BUTTONS, expectedText, 0);
  }

  static validatePreviewButtonIsEnabled() {
    this.isNotDisabled(EXPORT_PREVIEW);
  }

  static removeAddressFromTheSelectedAddressList() {
    this.click(REMOVE_ADDRESS_BUTTON);
  }

  static changePriceGranularityTo(period: string) {
    this.click(PRICE_GRANULARITY);
    this.click(`[data-value=${GranularityWordMap[period]}]`);
  }

  static changeAccountingPeriodTo(period: string) {
    this.click(ACCOUNTING_PERIOD);
    this.click(`[data-value=${GranularityWordMap[period]}]`);
  }

  static validateAPIResultsFor(period: string) {
    cy.intercept('GET', EXPORTING_ENDPOINT, (req) => {
      req.query.start = '1672524000';
      req.query.end = '1675202399';
      expect(req.query.priceGranularity).to.eq(ApiWordMap[period].toString());
      expect(req.query.virtualization).to.eq(ApiWordMap[period].toString());
      req.continue((res) => {});
    }).as('exportRequest');

    this.clickExportPreview();
    cy.wait('@exportRequest').then((req) => {
      cy.writeFile(
        `cypress/fixtures/newData/${period}.json`,
        req.response?.body
      );
      cy.fixture('exportData.json').then((data) => {
        this.expectStreamPeriodsToMatch(req.response?.body, data[period]);
      });
    });
    this.isVisible(AMOUNT_CELLS);
  }

  static clickExportPreview() {
    this.click(EXPORT_PREVIEW);
  }

  static validateCorrectlyExportedData(type: string) {
    switch (type) {
      case 'multiple accounts':
        cy.intercept('GET', EXPORTING_ENDPOINT, (req) => {
          expect(req.query.addresses).to.eq(
            `${TESTING_ACCOUNT1},${TESTING_ACCOUNT2}`
          );
        }).as('exportRequest');
        this.clickExportPreview();
        cy.wait('@exportRequest').then((req) => {
          cy.writeFile(
            `cypress/fixtures/newData/${type}.json`,
            req.response?.body
          );
          cy.fixture('exportData.json').then((data) => {
            this.expectStreamPeriodsToMatch(req.response?.body, data[type]);
          });
        });
        this.isVisible(AMOUNT_CELLS);
        break;
      case 'counterparty':
        cy.intercept('GET', EXPORTING_ENDPOINT, (req) => {
          expect(req.query.counterparties).to.eq(TESTING_ACCOUNT1);
        }).as('exportRequest');
        this.clickExportPreview();
        cy.wait('@exportRequest').then((req) => {
          cy.writeFile(
            `cypress/fixtures/newData/${type}.json`,
            req.response?.body
          );
          cy.fixture('exportData.json').then((data) => {
            this.expectStreamPeriodsToMatch(req.response?.body, data[type]);
          });
        });
        cy.get(COUNTERPARTY_CELLS).each((row) => {
          expect(row).to.have.text(TESTING_ACCOUNT1);
        });
        this.isVisible(AMOUNT_CELLS);
        break;
      case 'custom dates':
        cy.intercept('GET', EXPORTING_ENDPOINT, (req) => {
          expect(req.query.start).to.eq('1640995200');
          expect(req.query.end).to.eq('1646092799');
        }).as('exportRequest');
        this.click(EXPORT_PREVIEW);
        cy.wait('@exportRequest').then((req) => {
          cy.writeFile(
            `cypress/fixtures/newData/${type}.json`,
            req.response?.body
          );
          cy.fixture('exportData.json').then((data) => {
            this.expectStreamPeriodsToMatch(req.response?.body, data[type]);
          });
        });
        // The date column renders in M/D/YYYY locale format now (e.g. "1/6/2022"); assert the
        // rows fall within the requested 2022 window by year rather than a fixed YYYY/MM/ string.
        cy.get(DATE_CELLS).each((row) => {
          expect(row).to.contain.text('/2022');
        });
        break;
      case 'all columns':
        //Reversing because the first columns aren't rendered when looking from the last
        let json = {};
        allColumns.reverse().forEach((column) => {
          json[column] = [];
          this.get(
            `.MuiDataGrid-cell[data-field=${column}]`,
            0
          ).scrollIntoView();
          cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each((row, i) => {
            cy.fixture('exportData.json').then((data) => {
              json[column][i] = row.text();
              cy.writeFile('cypress/fixtures/newData/allColumns.json', json);
              expect(row).to.have.text(data[type][column][i]);
            });
          });
        });
        break;

      default:
        throw new Error(`${type} export data to validate is not defined`);
    }
  }

  static changeExportStartDate(date: string) {
    this.setPickersFieldValue(EXPORT_START_DATE, date);
  }

  static changeExportEndDate(date: string) {
    // The end date is intentionally left at its default (typing it used to
    // auto-fill zeroes for the year); clicking the field just moves focus off
    // the start date so its value commits.
    this.click(EXPORT_END_DATE);
  }

  static enableAllPreviewColumns() {
    this.isVisible(AMOUNT_CELLS);
    //Cypress too fast ,waiting for request or data to show up doesn't help,
    //Checkboxes get magically disabled without waiting,
    //Force clicking because mouse events not triggering the three dots to appear
    cy.wait(2000);
    this.openFirstColumnMenu();
    // MUI X renamed the column menu entry from "Show columns" to
    // "Manage columns" (localeText `columnMenuManageColumns`).
    cy.get(FILTER_OPTIONS).contains('Manage columns').click();
    cy.get(COLUMN_CHECKBOXES).each((checkbox) => {
      if (!checkbox.attr('checked')) {
        cy.wrap(checkbox).click();
      }
      this.get(
        `.MuiDataGrid-cell[data-field=${checkbox.attr('name')}]`,
        0
      ).scrollIntoView();
      this.isVisible(`.MuiDataGrid-cell[data-field=${checkbox.attr('name')}]`);
      this.hasLength(
        `.MuiDataGrid-cell[data-field=${checkbox.attr('name')}]`,
        8
      );
    });
  }

  static disableAllPreviewColumns() {
    cy.get(COLUMN_CHECKBOXES).click({ multiple: true });
  }

  static validateNoDataShownInThePreview() {
    allColumns.forEach((column) => {
      this.doesNotExist(`[data-field=${column}]`);
    });
  }

  static clickPreviewColumn(column: string) {
    this.click(`.MuiDataGrid-columnHeader[data-field=${column}]`);
  }

  static validateColumnSorting(column: string, ascdesc: string) {
    let actualArray: any[] = [];
    cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each((row) => {
      actualArray.push(row.text());
    });

    cy.wrap(actualArray).then((array) => {
      let expectedArray = [...array].sort(function (a, b) {
        return ascdesc === 'ascending' ? a - b : b - a;
      });
      expect(expectedArray).to.deep.eq(array);
    });
  }

  static addCustomFilter(column: string, operator: string, value: string) {
    this.openFirstColumnMenu();
    cy.get(FILTER_OPTIONS).contains('Filter').click();
    // MUI X DataGrid v7 renders the column/operator pickers as MUI <Select> components
    // (no native <select>). Open each and pick the option by its data-value (the column
    // field / operator key) so we don't depend on the visible header label.
    cy.get('.MuiDataGrid-filterFormColumnInput .MuiSelect-select').click();
    cy.get(`[role=listbox] [role=option][data-value="${column}"]`).click();
    cy.get('.MuiDataGrid-filterFormOperatorInput .MuiSelect-select').click();
    cy.get(`[role=listbox] [role=option][data-value="${operator}"]`).click();
    cy.get(FILTER_INPUT_FIELDS).last().clear().type(value);
  }

  static validateFilteredRows(column: string, value: string) {
    cy.get(`.MuiDataGrid-cell[data-field=${column}]`).should(
      'have.length.below',
      11
    );
    //Lazy fix , not really anything else to assert on
    //The small loading spinner disapears too fast and getting the whole table during filtering might re-render the values
    cy.wait(1000);
    cy.get(`.MuiDataGrid-cell[data-field=${column}]`).each((row) => {
      cy.wrap(row).should('contain.text', value);
    });
  }

  static validateDisabledPreviewButton() {
    this.isDisabled(EXPORT_PREVIEW);
  }

  static searchForExtraAccount(address: string) {
    this.clear(ADDRESS_INPUT);
    this.type(ADDRESS_INPUT, address);
  }

  static searchForCounterPartyAddress(address: string) {
    this.click(ADDRESS_BUTTONS, -1);
    this.type(ADDRESS_INPUT, address);
  }

  static changeEndDateWithUI(month: string, year: string) {
    // Was `click(CalendarIcon, -1)` — index -1 meant "the second of the two
    // date pickers", i.e. the end date. The picker's open button now carries
    // its own hook, so the position dependency is gone.
    this.click(END_DATE_PICKER_BUTTON);
    cy.get(DATE_PICKER_YEAR_BUTTONS).contains(year).click();
    cy.get(DATE_PICKER_MONTH_BUTTONS).contains(month).click();
  }

  static clickExportCSVButton() {
    this.isVisible(AMOUNT_CELLS);
    this.click(EXPORT_CSV);
  }

  // The CSV export carries the same third-party fiat values as the JSON one, so
  // it has the same problem: a byte-exact comparison asserts that an upstream
  // historical price index has not been recomputed. That is what re-broke this
  // spec before. The fiat columns therefore get a tolerance (see
  // CSV_FIAT_ABSOLUTE_TOLERANCE) and EVERY other column - dates, addresses, tx
  // hashes, token metadata, the raw token amounts, the row order and the header
  // itself - is still compared exactly, cell by cell, so a shape change is
  // caught rather than smoothed over.
  static validateDownloadedCSV() {
    cy.fixture('streamPeriodExportExample.csv').then((csv: string) => {
      cy.readFile('cypress/downloads/Stream periods export.csv').then(
        (downloadedCSV: string) => {
          this.expectCSVToMatch(downloadedCSV, csv);
        }
      );
    });
  }

  private static expectCSVToMatch(actual: string, expected: string) {
    // No quoted-field handling: this export writes no quotes or embedded commas
    // (addresses, hashes, ISO-ish dates, symbols). The per-row column-count
    // assertion below would fail loudly if that ever changed, rather than
    // silently mis-aligning columns.
    const rowsOf = (content: string) =>
      content.split(/\r?\n/).map((line) => line.split(','));
    const actualRows = rowsOf(actual);
    const expectedRows = rowsOf(expected);

    expect(actualRows.length, 'downloaded CSV row count').to.eq(
      expectedRows.length
    );

    const header = expectedRows[0];
    expect(actualRows[0], 'downloaded CSV header row').to.deep.eq(header);

    const fiatColumns = CSV_FIAT_COLUMNS.map((name) => {
      const columnIndex = header.indexOf(name);
      expect(
        columnIndex,
        `the recorded CSV must contain a "${name}" column`
      ).to.be.at.least(0);
      return columnIndex;
    });

    for (let row = 1; row < expectedRows.length; row++) {
      const actualCells = actualRows[row];
      const expectedCells = expectedRows[row];
      expect(actualCells.length, `downloaded CSV row ${row} column count`).to.eq(
        expectedCells.length
      );

      expectedCells.forEach((expectedCell, column) => {
        const actualCell = actualCells[column];
        const label = `downloaded CSV row ${row}, column "${
          header[column] ?? column
        }"`;

        if (fiatColumns.indexOf(column) === -1) {
          expect(actualCell, label).to.eq(expectedCell);
          return;
        }

        const actualValue = Number(actualCell);
        const expectedValue = Number(expectedCell);
        expect(
          Number.isFinite(actualValue),
          `${label}: expected a fiat number but got ${JSON.stringify(
            actualCell
          )}`
        ).to.eq(true);
        expect(
          Number.isFinite(expectedValue),
          `${label}: the recorded fixture holds a non-numeric fiat value ${JSON.stringify(
            expectedCell
          )}`
        ).to.eq(true);

        const tolerance = Math.max(
          CSV_FIAT_ABSOLUTE_TOLERANCE,
          Math.abs(expectedValue) * FIAT_RELATIVE_TOLERANCE
        );
        expect(
          Math.abs(actualValue - expectedValue),
          `${label}: ${actualValue} vs recorded ${expectedValue} (tolerance ${tolerance})`
        ).to.be.at.most(tolerance);
      });
    }
  }

  static validateSelectedAddressBookEntry(nameOrAddress: string) {
    cy.get(SELECTED_ADDRESSES).contains(nameOrAddress).should('be.visible');
    cy.get(ADDRESS_BOOK_ENTRIES)
      .contains(nameOrAddress)
      .scrollIntoView()
      .should('be.visible');
  }

  static validateSelectedAddressInForm(nameOrAddress: string, index = 0) {
    this.hasText(SELECTED_FORM_ADDRESSES, nameOrAddress, index);
  }

  static selectAddressFromAddressBookResults(nameOrAddress: string) {
    cy.contains(ADDRESS_BOOK_ENTRIES, nameOrAddress).click();
  }
}
