import {Given,Then} from "cypress-cucumber-preprocessor/steps";
import {Common} from "../../pageObjects/pages/Common";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";

Given(/^"([^"]*)" is open without connecting a wallet$/, function (page:string) {
    Common.openPage(page);
});
Given(/^Correct "([^"]*)" wallet balances are shown for the "([^"]*)"$/, function (networkType:string , account:string) {
    DashboardPage.verifyBalancesForAccount(networkType, account);
});
Given(/^User changes the visible networks to "([^"]*)"$/, function (type:string) {
    DashboardPage.changeVisibleNetworksTo(type);
});
Given(/^User clicks on the "([^"]*)" toggle$/, function (network:string) {
    DashboardPage.clickNetworkSelectionToogle(network)
});
Then(/^"([^"]*)" balances are not visible$/, function (network:string) {
    DashboardPage.tokenBalancesAreNotVisible(network);
});
Then(/^No Super Token balance is shown$/, function () {
    DashboardPage.noBalancesScreenIsVisible();
});
Then(/^User clicks on the no balance wrap button$/, function () {
    DashboardPage.clickNoBalanceWrapButton();
});
Given(/^User clicks on "([^"]*)" row$/, function () {

});

Then(/^User clicks on the cancel button for "([^"]*)" stream$/, function () {

});
Then(/^The cancel stream button is visible$/, function () {

});
Then(/^User clicks away from the cancel stream button$/, function () {
  DashboardPage.clickOnCancelStreamBackdrop();
});
Then(/^The cancel stream button is not visible$/, function () {
    DashboardPage.cancelStreamButtonDoesNotExist()
});
Then(/^No streams table is shown for "([^"]*)"$/, function () {

});
Then(/^User sees that the "([^"]*)" row has got no dropdown icon and no flow rates$/, function () {

});
Given(/^User changes the amount of rows shown to "([^"]*)"$/, function () {

});
Then(/^"([^"]*)" streams with "([^"]*)" are shown$/, function () {

});
Then(/^User switches to the next page$/, function () {

});
Then(/^The streams table is showing the next page of results and the footer is showing the correct result amounts$/, function () {

});

Then(/^No Super Token balance screen is shown$/, function () {

});
Given(/^User opens the network selection dropdown$/, function () {
    DashboardPage.openNetworkSelectionDropdown();
});
Given(/^User waits for balances to load$/, function () {
    DashboardPage.waitForBalancesToLoad();
});
Given(/^User closes the network selection dropdown$/, function () {
    DashboardPage.closeNetworkSelectionDropdown();
});
Given(/^User clicks on "([^"]*)" "([^"]*)" row$/, function (network:string, token:string) {
    DashboardPage.clickTokenStreamRow(network, token);
});
Then(/^"([^"]*)" streams are shown with the correct values$/, function (network:string) {
    DashboardPage.validateTokenStreams(network);
});
Given(/^"([^"]*)" "([^"]*)" flow rates are shown with the correct values$/, function (network:string, token:string) {
    DashboardPage.validateTokenTotalFlowRates(network, token);
});
Then(/^User clicks on the first visible cancel button$/, function () {
    DashboardPage.clickFirstCancelButton();
});
Then(/^The cancel stream popup button is visible$/, function () {
    DashboardPage.cancelStreamButtonIsVisible();
});

Given(/^Cancel button is disabled on all streams on "([^"]*)"$/, function (network:string) {
    DashboardPage.validateAllCancelButtonsDisabledForToken(network)
});
Given(/^User hovers on the first "([^"]*)" stream cancel button$/, function (network:string) {
    DashboardPage.hoverOnFirstCancelButton(network)
});
Then(/^A tooltip asking user to switch to "([^"]*)" is shown$/, function (network:string) {
    DashboardPage.validateChangeNetworkTooltip(network)
});