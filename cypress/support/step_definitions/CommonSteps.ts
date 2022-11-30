import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {Common} from "../../pageObjects/pages/Common";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^"([^"]*)" is open without connecting a wallet$/, (page: string) => {
    Common.openPage(page);
});

Given(/^User clicks on the "([^"]*)" navigation button$/, (button: string) => {
    Common.clickNavBarButton(button);
});

Then(/^Dashboard page is open when wallet of the user is not connected$/, () => {
    DashboardPage.checkIfDashboardConnectIsVisible();
});

Then(/^Wrap\/Unwrap page is open and the wrap container is visible$/, () => {
    WrapPage.checkIfWrapContainerIsVisible();
});

Then(/^Send page is open and the send container is visible$/, () => {
    SendPage.checkIfSendContainerIsVisible();
});

Then(/^Wait for (\d+) seconds$/, (seconds: number) => {
    cy.wait(seconds * 1000);
});

Given(/^User clicks on the connect wallet button$/, () => {
    Common.clickConnectWallet();
});

Given(/^"([^"]*)" is open with a mocked connection to "([^"]*)" on "([^"]*)"$/,
    (page: string, account: string, network: string) => {
        Common.openPage(page, true, account, network);
    });

Given(/^User connects their wallet to the dashboard$/, () => {
    Common.clickConnectWallet();
    Common.clickInjectedWallet();
});

Given(/^User changes their network to "([^"]*)"$/, (network: string) => {
    Common.changeNetwork(network);
});

Given(/^The navigation drawer shows that "([^"]*)" is "([^"]*)"$/,
    (account: string, message: string) => {
        Common.checkNavBarWalletStatus(account, message);
    });

Given(/^The navigation drawer shows connect wallet button$/, () => {
    Common.drawerConnectWalletButtonIsVisible();
});

Given(/^User uses view mode to look at "([^"]*)"$/, (account: string) => {
    Common.viewAccount(account);
});

Then(/^The stop viewing as an address button is visible$/, () => {
    WrapPage.isStopViewingButtonVisible();
});

Given(/^User changes the visible networks to "([^"]*)"$/, (type: string) => {
    Common.changeVisibleNetworksTo(type);
});

Given(/^User opens the network selection dropdown$/, () => {
    Common.openNetworkSelectionDropdown();
});

Given(/^User closes the dropdown$/, () => {
    Common.closeDropdown();
});

Then(/^User clicks on the view mode button$/, () => {
    Common.clickOnViewModeButton()
});

Then(/^User types "([^"]*)" into the address input$/, (input: string) => {
    Common.typeIntoAddressInput(input)
});

Then(/^"([^"]*)" address book entry for "([^"]*)" is visible in the search results$/, (name: string, address: string) => {
    Common.validateAddressBookSearchResult(name, address)
});

Then(/^User chooses the first address book result$/, () => {
    Common.chooseFirstAddressBookResult()
});
Then(/^View mode chip shows "([^"]*)"$/, (message: string) => {
    Common.validateViewModeChipMessage(message)
});
Then(/^404 page is shown$/, () => {
    Common.errorPageIsVisible()
});
Given(/^Transactional account ([^"]*) is connected to the dashboard on ([^"]*)$/, (persona:string,network: string) => {
    Common.openDashboardWithConnectedTxAccount(persona,network)
});
Given(/^User restores the last transaction$/, () => {
    Common.restoreLastTx()
});
Given(/^User waits for (\d+) seconds$/, function (seconds:number) {
    Common.wait(seconds)
});
Then(/^Transaction rejected error is shown$/, function () {
    Common.transactionRejectedErrorIsShown()
});
Given(/^Stream table requests are mocked to an empty state$/, function () {
    Common.mockQueryToEmptyState("streams")
});
Given(/^Transfer event requests are mocked to an empty state$/, function () {
    Common.mockQueryToEmptyState("transferEvents")
});

Given(/^User disconnects their wallet from the dashboard$/,  () => {
    Common.disconnectWallet()
});
Given(/^User chooses to connect the mock wallet$/,  () => {
    Common.clickMockWallet()
});