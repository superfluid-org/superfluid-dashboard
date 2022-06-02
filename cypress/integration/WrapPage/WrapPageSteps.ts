import {Given, Then} from "cypress-cucumber-preprocessor/steps";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {Common} from "../../pageObjects/pages/Common";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^User inputs "([^"]*)" into the wrap field$/, function (amount: string) {
    WrapPage.inputWrapAmount(amount);
});

Then(/^User switches to unwrap tab$/, function () {
    WrapPage.switchToUnwrapTab();
});

Then(/^User inputs "([^"]*)" into the unwrap field$/, function (amount: string) {
    WrapPage.inputUnwrapAmount(amount);
});

Given(/^The upgrade button is disabled$/, function () {
    WrapPage.upgradeButtonIsDisabled();
});

Then(/^The upgrade button is enabled and asks user to connect a wallet$/, function () {
    WrapPage.upgradeButtonAsksForConnection();
});

Then(/^The downgrade button is disabled$/, function () {
    WrapPage.downgradeButtonIsDisabled();
});

Then(/^The downgrade button is enabled and asks user to connect a wallet$/, function () {
    WrapPage.downgradeButtonAsksForConnection();
});

Then(/^User switches to wrap tab$/, function () {
    WrapPage.switchToWrapTab();
});

Given(/^Change network button is visible with a message asking user to switch to "([^"]*)"$/,
    function (network: string) {
        WrapPage.changeNetworkButtonShowsCorrectNetwork(network);
    });

Then(/^User clicks on the stop viewing as an address button$/, function () {
    WrapPage.clickStopViewingButton();
});

Then(/^Connect wallet button is visible in the wrap\/unwrap page$/, function () {
    WrapPage.connectWalletButtonIsVisible();
});

Given(/^View mode chip does not exist$/, function () {
    Common.viewModeChipDoesNotExist();
});

Then(/^The "([^"]*)" balance is shown correctly on "([^"]*)"$/, function (token: string, network: string) {
    WrapPage.validateWrapPageTokenBalance(token, network);
});

Then(/^User opens the token selection in the wrap page$/, function () {
    WrapPage.clickSelectTokenButton();
});

Then(/^The underlying token balances in the wrap token dialog are shown correctly on "([^"]*)"$/,
    function (network: string) {
        WrapPage.validateWrapTokenSelectionBalances(network);
    });

Then(/^None of the tokens shown have got an animation around them$/, function () {
    WrapPage.validateNoAnimationsInUnderlyingTokenSelection();
});

Then(/^User chooses "([^"]*)" to wrap$/, function (token: string) {
    WrapPage.chooseTokenToWrap(token);
});

Then(/^The super token balances in the unwrap token dialog are shown correctly on "([^"]*)"$/,
    function (network: string) {
        WrapPage.validateUnwrapTokenSelectionBalances(network);
    });

Then(/^All tokens have an animation around them$/, function () {
    SendPage.verifyAllSupertokenAnimations();
});

Then(/^The stop viewing as an address button is visible$/, function () {
    WrapPage.isStopViewingButtonVisible();
});
