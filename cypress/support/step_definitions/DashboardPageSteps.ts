import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";

Given(/^Correct "([^"]*)" wallet balances are shown for the "([^"]*)"$/,
    (networkType: string, account: string) => {
        DashboardPage.verifyBalancesForAccount(networkType, account);
});

Given(/^User clicks on the "([^"]*)" toggle$/, (network: string) => {
    DashboardPage.clickNetworkSelectionToogle(network);
});

Then(/^"([^"]*)" balances are not visible$/, (network: string) => {
    DashboardPage.tokenBalancesAreNotVisible(network);
});

Then(/^No Super Token balance is shown$/, () => {
    DashboardPage.noBalancesScreenIsVisible();
});

Then(/^User clicks on the no balance wrap button$/, () => {
    DashboardPage.clickNoBalanceWrapButton();
});

Then(/^User clicks away from the cancel stream button$/, () => {
    DashboardPage.clickOnCancelStreamBackdrop();
});

Then(/^The cancel stream button is not visible$/, () => {
    DashboardPage.cancelStreamButtonDoesNotExist();
});

Given(/^User waits for balances to load$/, () => {
    DashboardPage.waitForBalancesToLoad();
});

Given(/^User clicks on "([^"]*)" "([^"]*)" row$/, (network: string, token: string) => {
    DashboardPage.clickTokenStreamRow(network, token);
});
Then(/^"([^"]*)" streams are shown with the correct values$/, (network: string) => {
        DashboardPage.validateTokenStreams(network);
});

Given(/^"([^"]*)" "([^"]*)" flow rates are shown with the correct values$/,
    (network: string, token: string) => {
    DashboardPage.validateTokenTotalFlowRates(network, token);
});

Then(/^User clicks on the first visible cancel button$/, () => {
    DashboardPage.clickFirstCancelButton();
});

Then(/^The cancel stream popup button is visible$/, () => {
    DashboardPage.cancelStreamButtonIsVisible();
});

Given(/^Cancel button is disabled on all streams on "([^"]*)"$/,
    (network: string) => {
    DashboardPage.validateAllCancelButtonsDisabledForToken(network);
});

Given(/^User hovers on the first "([^"]*)" stream cancel button$/, (network: string) => {
        DashboardPage.hoverOnFirstCancelButton(network);
});

Then(/^A tooltip asking user to switch to "([^"]*)" is shown$/, (network: string) => {
        DashboardPage.validateChangeNetworkTooltip(network);
});

Given(/^User changes the amount of rows shown to "([^"]*)"$/, (amount: number) => {
    DashboardPage.changeRowsPerPageShown(amount);
});

Then(/^"([^"]*)" streams with "([^"]*)" are shown$/, (amount: string, token: string) => {
    DashboardPage.checkVisibleRowsAmount(amount, token);
});

Then(/^User switches to the next page for the "([^"]*)" token and new results are shown$/,
    (token: string) => {
    DashboardPage.switchToNextStreamPage(token);
});

Then(/^No Super Token balance screen is shown$/, () => {
    DashboardPage.noBalancesScreenIsVisible();
});
Given(/^User opens the first visible stream details page from the table$/,  () => {
    DashboardPage.openFirstVisibleStreamDetailsPage()
});
Given(/^Dashboard page is open when wallet of the user is connected or in view mode$/,  () => {
    DashboardPage.checkIfAnyTokenBalancesAreShown()
});
Given(/^User opens "([^"]*)" "([^"]*)" individual token page$/, (network: string, token: string) =>  {
    DashboardPage.openIndividualTokenPage(network, token);
});
Given(/^User waits for (\d+) stream entries to be shown$/,  (amount:number) => {
    DashboardPage.waitForXAmountOfEntries(amount)
});