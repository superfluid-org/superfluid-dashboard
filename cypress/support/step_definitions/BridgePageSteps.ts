import {Given} from "@badeball/cypress-cucumber-preprocessor";
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
Given(/^You pay section icon for a token without icon is shown correctly$/,  () => {
    BridgePage.validatePaySectionIconsForDefaultIconTokens()
});
Given(/^Token swapping route for is correctly shown for a token that has no icon$/,  () => {
    BridgePage.validateSwapRouteForDefaultIconTokens()
});