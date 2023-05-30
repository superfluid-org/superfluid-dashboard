import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { AddressBookPage } from "../../pageObjects/pages/AddressBookPage";

Then(/^No addresses added message is shown$/, () => {
  AddressBookPage.validateNoAddressesMessage();
});

Then(/^The last address book entry name is "([^"]*)"$/, (name: string) => {
  AddressBookPage.validateAddressBookName(name, -1);
});
Then(
  /^User edits the name of the last address book entry to "([^"]*)"$/,
  (name: string) => {
    AddressBookPage.editLastEntry(name);
  }
);
Then(/^User removes the last address book entry$/, function () {
  AddressBookPage.removeLastEntry();
});
Given(
  /^User adds "([^"]*)" as "([^"]*)" on "([^"]*)" to their address book$/,
  function (address: string, name: string, network: string) {
    AddressBookPage.addNewAddress(address, name, network);
  }
);
Then(
  /^Last added address book entry network is "([^"]*)"$/,
  function (network: string) {
    AddressBookPage.validateAddressBookNetwork(network);
  }
);
Then(/^The last saved address is "([^"]*)"$/, function (address: string) {
  AddressBookPage.validateSavedAddress(address);
});
Then(
  /^ENS name "([^"]*)" is shown by the last saved address book entry$/,
  function (name: string) {
    AddressBookPage.validateLastSavedAddressENSName(name);
  }
);
Given(/^User exports their address book$/, function () {
  AddressBookPage.exportAddressBook();
});
Given(/^User imports their address book$/, function () {
  AddressBookPage.importAddressBook();
});
Then(/^The exported address book is in correct format$/, function () {
  AddressBookPage.validateExportedAddressBook();
});
Then(
  /^A contract address "([^"]*)" on "([^"]*)" is saved as "([^"]*)"$/,
  function (address: string, network: string, name: string) {
    AddressBookPage.validateAddedContractAddress(address, name, network);
  }
);
Then(
  /^No results found message is shown by the address book entries$/,
  function () {
    AddressBookPage.validateNoAddressBookResults();
  }
);
Then(
  /^"([^"]*)" with address "([^"]*)" is visible as an address book result$/,
  function (name: string, address: string) {
    AddressBookPage.validateAddressBookResult(name, address);
  }
);
Then(
  /^Wallet connection status "([^"]*)" as the connected address$/,
  function (name: string) {
    AddressBookPage.validateConnectedWalletName(name);
  }
);
Given(/^Address book test data is set up$/, function () {
  AddressBookPage.setupAddressBook();
});
Given(
  /^User searches for "([^"]*)" as a receiver and selects it$/,
  function (name: string) {
    AddressBookPage.searchForAddressBookReceiverAndSelectIt(name);
  }
);
Then(/^The imported addresses are shown correctly$/, function () {
  AddressBookPage.validateImportedAndSetupAddresses();
});
Given(/^User opens the address filter$/, function () {
  AddressBookPage.openAddressFilter();
});
Given(
  /^User searches for "([^"]*)" in the address filter$/,
  function (name: string) {
    AddressBookPage.typeInAddressFilter(name);
  }
);
Given(
  /^User selects "([^"]*)" from the address filter$/,
  function (name: string) {
    AddressBookPage.selectNameInAddressFilter(name);
  }
);
Then(
  /^Only address names containing "([^"]*)" are visible$/,
  function (name: string) {
    AddressBookPage.validateFilteredAddresses(name);
  }
);
Then(
  /^User clears the address book filter by using the clear all chip$/,
  function () {
    AddressBookPage.clickClearAllFilterChip();
  }
);
Then(
  /^User clears the "([^"]*)" filter by using the clear button by the specific chip$/,
  function (name: string) {
    AddressBookPage.clickSpecificAddressClearChip(name);
  }
);
Then(/^User clears the address book search field$/, function () {
  AddressBookPage.clearAddressBookSearchField();
});
Then(
  /^No addresses are shown in the address book filter dropdown$/,
  function () {
    AddressBookPage.validateNoNamesInAddressFilter();
  }
);
