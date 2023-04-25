import { Then, Given } from "@badeball/cypress-cucumber-preprocessor";
import { ExportPage } from "../../pageObjects/pages/ExportPage";
import { WrapPage } from "../../pageObjects/pages/WrapPage";

Given(
  /^User searches for "([^"]*)" as the accountable account$/,
  function (address: string) {
    ExportPage.searchForAccount(address);
  }
);

Given(/^Selected sections shows "([^"]*)"$/, function (address: string) {
  ExportPage.validateSelectedAddress(address);
});
Given(
  /^User removes the selected address from the list of addresses$/,
  function () {
    ExportPage.removeLastSelectedAddressFromSearchList();
  }
);
Given(/^Ok button is not visible and no entries are highlighted$/, function () {
  ExportPage.validateNoOkPageAndNoEntriesHighlighted();
});
Given(
  /^User selects "([^"]*)" from the search section$/,
  function (address: string) {
    ExportPage.selectAddressFromSearchResults(address);
  }
);
Given(
  /^"([^"]*)" is shown as one of the selected addresses for export preview$/,
  function (address: string) {
    ExportPage.validateSelectedAddress(address);
  }
);
Given(
  /^And address search box shows that "([^"]*)" address is selected$/,
  function (amount: string) {
    ExportPage.validateSelectedAddressAmount(amount);
  }
);
Given(/^Export preview button is enabled$/, function () {
  ExportPage.validatePreviewButtonIsEnabled();
});
Given(
  /^User removes the selected address from the list of selected addresses$/,
  function () {
    ExportPage.removeAddressFromTheSelectedAddressList();
  }
);
Given(
  /^User selects "([^"]*)" for the accounting export$/,
  function (address: string) {
    ExportPage.searchForAccount(address);
    ExportPage.selectAddressFromSearchResults(address);
    WrapPage.clickOkButton();
  }
);
Given(
  /^User changes the price granularity to "([^"]*)"$/,
  function (period: string) {
    ExportPage.changePriceGranularityTo(period);
  }
);
Given(
  /^User changes the accounting period to "([^"]*)"$/,
  function (period: string) {
    ExportPage.changeAccountingPeriodTo(period);
  }
);
Then(
  /^Export preview is correctly fetched from the accounting API for "([^"]*)"$/,
  function (period: string) {
    ExportPage.validateAPIResultsFor(period);
  }
);
Given(/^User clicks on the export preview button$/, function () {
  ExportPage.clickExportPreview();
});
Then(
  /^Exported data for "([^"]*)" is fetched and shown correctly$/,
  function (type: string) {
    ExportPage.validateCorrectlyExportedData(type);
  }
);
Given(
  /^User changes the export start date to "([^"]*)"$/,
  function (date: string) {
    ExportPage.changeExportStartDate(date);
  }
);
Given(
  /^User changes the export end date with date picker to "([^"]*)"$/,
  function (date: string) {
    ExportPage.changeExportEndDate(date);
  }
);
Given(/^User enables all of the columns$/, function () {
  ExportPage.enableAllPreviewColumns();
});
Then(/^User disables all of the columns$/, function () {
  ExportPage.disableAllPreviewColumns();
});
Then(/^No data is shown in the export preview$/, function () {
  ExportPage.validateNoDataShownInThePreview();
});
Given(/^User clicks on the "([^"]*)" column$/, function (column: string) {
  ExportPage.clickPreviewColumn(column);
});
Then(
  /^The "([^"]*)" column is sorted in "([^"]*)" order$/,
  function (column: string, ascdesc: string) {
    ExportPage.validateColumnSorting(column, ascdesc);
  }
);
Given(
  /^User adds a custom filter for "([^"]*)" to "([^"]*)" "([^"]*)"$/,
  function (column: string, operator: string, value: string) {
    ExportPage.addCustomFilter(column, operator, value);
  }
);
Then(
  /^The export preview table only shows "([^"]*)" rows with "([^"]*)"$/,
  function (column: string, value: string) {
    ExportPage.validateFilteredRows(column, value);
  }
);
Given(/^Export preview button is disabled$/, function () {
  ExportPage.validateDisabledPreviewButton();
});
Given(
  /^User searches for "([^"]*)" as an extra accountable account$/,
  function (address: string) {
    ExportPage.searchForExtraAccount(address);
  }
);
Given(
  /^User searches for "([^"]*)" as the counterparty account$/,
  function (address: string) {
    ExportPage.searchForCounterPartyAddress(address);
  }
);
Given(
  /^User changes the export end date with date picker to "([^"]*)" "([^"]*)"$/,
  function (month: string, year: string) {
    ExportPage.changeEndDateWithUI(month, year);
  }
);
Given(/^User exports the CSV$/, function () {
  ExportPage.clickExportCSVButton();
});
Then(/^CSV contains the correct data$/, function () {
  ExportPage.validateDownloadedCSV();
});
