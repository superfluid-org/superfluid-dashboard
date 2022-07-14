import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {WrapPage} from "../../pageObjects/pages/WrapPage";
import {Common} from "../../pageObjects/pages/Common";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^User inputs "([^"]*)" into the wrap field$/, (amount: string) => {
    WrapPage.clearAndInputWrapAmount(amount);
});

Then(/^User switches to unwrap tab$/, () => {
    WrapPage.switchToUnwrapTab();
});

Then(/^User inputs "([^"]*)" into the unwrap field$/, (amount: string) => {
    WrapPage.clearAndInputUnwrapAmount(amount);
});

Given(/^The upgrade button is disabled$/, () => {
    WrapPage.upgradeButtonIsDisabled();
});

Then(/^The upgrade button is enabled and asks user to connect a wallet$/, () => {
    WrapPage.upgradeButtonAsksForConnection();
});

Then(/^The downgrade button is disabled$/, () => {
    WrapPage.downgradeButtonIsDisabled();
});

Then(/^The downgrade button is enabled and asks user to connect a wallet$/, () => {
    WrapPage.downgradeButtonAsksForConnection();
});

Then(/^User switches to wrap tab$/, () => {
    WrapPage.switchToWrapTab();
});

Given(/^Change network button is visible with a message asking user to switch to "([^"]*)"$/,
    (network: string) => {
        WrapPage.changeNetworkButtonShowsCorrectNetwork(network);
    });

Then(/^User clicks on the stop viewing as an address button$/, () => {
    WrapPage.clickStopViewingButton();
});

Then(/^Connect wallet button is visible in the wrap\/unwrap page$/, () => {
    WrapPage.connectWalletButtonIsVisible();
});

Given(/^View mode chip does not exist$/, () => {
    Common.viewModeChipDoesNotExist();
});

Then(/^The "([^"]*)" balance is shown correctly on "([^"]*)"$/, (token: string, network: string) => {
    WrapPage.validateWrapPageTokenBalance(token, network);
});

Then(/^User opens the token selection in the wrap page$/, () => {
    WrapPage.clickSelectTokenButton();
});

Then(/^The underlying token balances in the wrap token dialog are shown correctly on "([^"]*)"$/,
    (network: string) => {
        WrapPage.validateWrapTokenSelectionBalances(network);
    });

Then(/^None of the tokens shown have got an animation around them$/, () => {
    WrapPage.validateNoAnimationsInUnderlyingTokenSelection();
});

Then(/^User chooses "([^"]*)" to wrap$/, (token: string) => {
    WrapPage.chooseTokenToWrap(token);
});

Then(/^The super token balances in the unwrap token dialog are shown correctly on "([^"]*)"$/,
    (network: string) => {
        WrapPage.validateUnwrapTokenSelectionBalances(network);
    });

Then(/^All tokens have an animation around them$/, () => {
    SendPage.verifyAllSupertokenAnimations();
});
