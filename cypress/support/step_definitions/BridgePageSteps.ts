import {Given,Then} from "@badeball/cypress-cucumber-preprocessor";
import {BridgePage} from "../../pageObjects/pages/BridgePage";

Given(/^User chooses "([^"]*)" token to swap "([^"]*)" on "([^"]*)"$/, (token:string,toFrom:string,network:string) => {
    BridgePage.chooseTokenToSwapFromTo(token,toFrom,network)
});

Given(/^Connect wallet button is visible$/, () => {
    BridgePage.validateConnectWalletButton()
});

Given(/^User inputs "([^"]*)" into the swap amount$/,  (amount:string) => {
    BridgePage.inputSwapAmount(amount)
});

Given(/^Token swapping route for is correctly shown$/,  () => {
    BridgePage.validateSwapRoute()
});
Given(/^The You pay section shows the correct token and network icons$/,  () => {
    BridgePage.validateYouPayTokenIcons()
});

Given(/^Review swap button is disabled$/,  () => {
    BridgePage.validateReviewSwapButtonWithoutBalance()
});
Given(/^Not enough funds error is shown$/,  () => {
    BridgePage.validateNotEnoughFundsError()
});

Given(/^Not enough gas funds error is shown$/,  () => {
    BridgePage.validateNotEnoughGasFundsError()
});

Given(/^User clicks on the history button$/,  () => {
    BridgePage.clickOnHistoryPageButton()
});

Then(/^No history message is shown$/,  () => {
    BridgePage.validateNoHistoryMessage()
});

Then(/^LiFi bridge inputs are visible$/,  () => {
    BridgePage.validateFromToInputsVisible()
});

Given(/^History button is not visible$/,  () => {
    BridgePage.validateNoHistoryButtonWhenNotConnected()
});

Given(/^User clicks on the connect wallet button in the lifi widget$/,  () => {
    BridgePage.clickConnectWalletButton()
});
Given(/^User opens the lifi widget settings$/,  () => {
    BridgePage.openLifiSettings()
});
Given(/^Lifi widget settings are visible$/,  () => {
    BridgePage.verifyLifiSettingsFields()
});