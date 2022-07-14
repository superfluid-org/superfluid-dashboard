import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {Common} from "../../pageObjects/pages/Common";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^"([^"]*)" is open without connecting a wallet$/,  (page: string) => {
    Common.openPage(page);
});

Given(/^User clicks on the "([^"]*)" navigation button$/,  (button: string) => {
    Common.clickNavBarButton(button);
});

Then(/^Dashboard page is open when wallet of the user is not connected$/,  () => {
    DashboardPage.checkIfDashboardConnectIsVisible();
});

Then(/^Wrap\/Unwrap page is open and the wrap container is visible$/,  () => {
    WrapPage.checkIfWrapContainerIsVisible();
});

Then(/^Send page is open and the send container is visible$/,  () => {
    SendPage.checkIfSendContainerIsVisible();
});

Then(/^Wait for (\d+) seconds$/,  (seconds: number) => {
    cy.wait(seconds * 1000);
});

Given(/^User clicks on the connect wallet button$/,  () => {
    Common.clickConnectWallet();
});

Given(/^"([^"]*)" is open with a mocked connection to "([^"]*)" on "([^"]*)"$/,
     (page: string, account: string, network: string) => {
        Common.openPage(page, true, account, network);
    });

Given(/^User connects their wallet to the dashboard$/,  () => {
    Common.clickConnectWallet();
    Common.clickInjectedWallet();
});

Given(/^User changes their network to "([^"]*)"$/,  (network: string) => {
    Common.changeNetwork(network);
});

Given(/^The navigation drawer shows that "([^"]*)" is "([^"]*)"$/,
     (account: string, message: string) => {
    Common.checkNavBarWalletStatus(account, message);
});

Given(/^The navigation drawer shows connect wallet button$/,  () => {
    Common.drawerConnectWalletButtonIsVisible();
});

Given(/^User uses view mode to look at "([^"]*)"$/,  (account: string) => {
    Common.viewAccount(account);
});

Given(/^User types "([^"]*)" into the address input$/,  (address: string) => {
    Common.typeIntoAddressInput(address);
});

Then(/^The stop viewing as an address button is visible$/,  () => {
    WrapPage.isStopViewingButtonVisible();
});

Then(/^User clicks on the view mode button$/,  () => {
    Common.clickOnViewModeButton()
});

Then(/^"([^"]*)" address book entry for "([^"]*)" is visible in the search results$/,  (name:string,address:string) => {
    Common.validateAddressBookSearchResult(name,address)
});
Then(/^User chooses the first address book result$/,  () => {
    Common.chooseFirstAddressBookResult()
});
Then(/^View mode chip shows "([^"]*)"$/,  (message:string) => {
    Common.validateViewModeChipMessage(message)
});