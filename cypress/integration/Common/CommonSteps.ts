import {Given, Then} from "cypress-cucumber-preprocessor/steps";
import {Common} from "../../pageObjects/pages/Common";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^"([^"]*)" is open without connecting a wallet$/, function (page: string) {
    Common.openPage(page);
});

Given(/^User clicks on the "([^"]*)" navigation button$/, function (button: string) {
    Common.clickNavBarButton(button);
});

Then(/^Dashboard page is open when wallet of the user is not connected$/, function () {
    DashboardPage.checkIfDashboardConnectIsVisible();
});

Then(/^Wrap\/Unwrap page is open and the wrap container is visible$/, function () {
    WrapPage.checkIfWrapContainerIsVisible();
});

Then(/^Send page is open and the send container is visible$/, function () {
    SendPage.checkIfSendContainerIsVisible();
});

Then(/^Wait for (\d+) seconds$/, function (seconds: number) {
    cy.wait(seconds * 1000);
});

Given(/^User clicks on the connect wallet button$/, function () {
    Common.clickConnectWallet();
});

Given(/^"([^"]*)" is open with a mocked connection to "([^"]*)" on "([^"]*)"$/,
    function (page: string, account: string, network: string) {
        Common.openPage(page, true, account, network);
    });

Given(/^User connects their wallet to the dashboard$/, function () {
    Common.clickConnectWallet();
    Common.clickInjectedWallet();
});

Given(/^User changes their network to "([^"]*)"$/, function (network: string) {
    Common.changeNetwork(network);
});

Given(/^The navigation drawer shows that "([^"]*)" is "([^"]*)"$/,
    function (account: string, message: string) {
    Common.checkNavBarWalletStatus(account, message);
});

Given(/^The navigation drawer shows connect wallet button$/, function () {
    Common.drawerConnectWalletButtonIsVisible();
});

Given(/^User uses view mode to look at "([^"]*)"$/, function (account: string) {
    Common.viewAccount(account);
});
