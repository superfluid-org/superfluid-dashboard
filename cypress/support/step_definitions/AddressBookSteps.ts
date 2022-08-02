import {Then,Given} from "@badeball/cypress-cucumber-preprocessor";
import {AddressBookPage} from "../../pageObjects/pages/AddressBookPage";

Then(/^No addresses added message is shown$/,  () => {
    AddressBookPage.validateNoAddressesMessage()
});
Given(/^User adds "([^"]*)" to their address book$/,  (address:string) => {
    AddressBookPage.addAddressBookEntry(address)
});

Then(/^The last address book entry name is "([^"]*)"$/,  (name:string) => {
    AddressBookPage.validateLastAddressBookName(name)
});
Then(/^User edits the name of the last address book entry to "([^"]*)"$/,  (name:string) => {
    AddressBookPage.editLastEntry(name)
});
Then(/^User removes the last address book entry$/, function () {
    AddressBookPage.removeLastEntry()
});