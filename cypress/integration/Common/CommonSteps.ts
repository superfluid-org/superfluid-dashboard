import {Given , Then} from "cypress-cucumber-preprocessor/steps";
import {Common} from "../../pageObjects/pages/Common";
import {DashboardPage} from "../../pageObjects/pages/DashboardPage";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^"([^"]*)" is open without connecting a wallet$/, function (page:string) {
    Common.openPage(page);
});

Given(/^User clicks on the "([^"]*)" navigation button$/, function (button:string) {
    Common.clickNavBarButton(button);
});

Then(/^Dashboard page is open when users wallet is not connected$/, function () {
    DashboardPage.checkIfDashboardConnectIsVisible()
});

Then(/^Wrap\/Unwrap page is open and the wrap container is visible$/, function () {
    WrapPage.checkIfWrapContainerIsVisible()
});

Then(/^Send page is open and the send container is visible$/, function () {
    SendPage.checkIfSendContainerIsVisible();
});
Given(/^"([^"]*)" is open with a mocked web3 provider$/, function () {
    Common.openPageWithMockedProvider();
});
Then(/^Wait for (\d+) seconds$/, function (seconds:number) {
    cy.wait(seconds * 1000)
});
Given(/^User clicks on the connect wallet button$/, function () {
    Common.clickConnectWallet();
});