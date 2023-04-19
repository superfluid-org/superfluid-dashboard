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

Given(/^User wraps the "([^"]*)" of the selected token$/, (amount: string) => {
    WrapPage.clearAndInputWrapAmount(amount)
    WrapPage.rememberBalanceBeforeAndWrapToken()
});

Given(/^Transaction dialog for ([^"]*) is shown wrapping ([^"]*) ([^"]*)$/, (network: string, amount: string, token: string) => {
    WrapPage.validateWrapTxDialogMessage(network, amount, token)
});
Given(/^Wrap transaction broadcasted message is shown$/, () => {
    WrapPage.validateWrapTxBroadcastedDialog()
});
Given(/^User clicks on the go to tokens page button from tx dialog$/, () => {
    WrapPage.clickTxDialogGoToTokensPageButton()
});
Given(/^The transaction drawer shows a pending "([^"]*)" transaction on "([^"]*)"$/, (type: string, network: string) => {
    WrapPage.validatePendingTransaction(type, network)
});
Given(/^The transaction drawer shows a succeeded "([^"]*)" transaction on "([^"]*)"$/, (type: string, network: string) => {
    WrapPage.validateSuccessfulTransaction(type, network)
});
Given(/^Users super token balance of "([^"]*)" on "([^"]*)" increases by "([^"]*)" in the dashboard page$/, (token: string, network: string, amount: string) => {
    WrapPage.validateBalanceAfterWrapping(token, network, amount)
});
Then(/^Wrap field input field has "([^"]*)" written in it$/, (amount: string) => {
    WrapPage.validateWrapFieldInputAmount(amount)
});
Then(/^The token balances after wrapping "([^"]*)" tokens are correctly shown in the wrap page$/, (amount: string) => {
    WrapPage.validateTokenBalancesAfterWrap(amount)
});

Given(/^User unwraps the "([^"]*)" of the selected token$/, (amount: string) => {
    WrapPage.clearAndInputUnwrapAmount(amount)
    WrapPage.rememberBalanceBeforeAndUnwrapToken()
});
Given(/^Transaction dialog for ([^"]*) is shown unwrapping ([^"]*) ([^"]*)$/, (network: string, amount: string, token: string) => {
    WrapPage.validateUnwrapTxDialogMessage(network, amount, token)
});
Given(/^Transaction broadcasted message with ok button is shown$/, () => {
    WrapPage.validateUnwrapTxBroadcastedMessage()
});
Given(/^Users super token balance of "([^"]*)" on "([^"]*)" decreases by "([^"]*)" in the dashboard page$/, (token: string, network: string, amount: string) => {
    WrapPage.validateBalanceAfterUnwrapping(token, network, amount)
});
Then(/^Unwrap field input field has "([^"]*)" written in it$/, (amount: string) => {
    WrapPage.validateUnwrapInputFieldAmount(amount)
});
Then(/^The token balances after wrapping "([^"]*)" tokens are correctly shown in the unwrap page$/, (amount: string) => {
    WrapPage.validateTokenBalancesAfterUnwrap(amount)
});
Given(/^User opens the transaction drawer$/, () => {
    WrapPage.openTxDrawer()
});
Given(/^User clicks the OK button$/, () => {
    WrapPage.clickOkButton()
});

Given(/^User approves the protocol to use "([^"]*)"$/, (token: string) => {
    WrapPage.approveTokenSpending(token)
});
Given(/^Transaction dialog for ([^"]*) is shown approving allowance of ([^"]*) ([^"]*)$/, (network: string, amount: string, token: string) => {
    WrapPage.validateApprovalDialog(network, amount, token)
});
Given(/^The restore button is visible for the last transaction$/, () => {
    WrapPage.isRestoreButtonVisible()
});

Given(/^The restore button is not visible for the last transaction$/, () => {
    WrapPage.doesRestoreButtonExist()
});

Given(/^User approves the protocol to use "([^"]*)" "([^"]*)" on "([^"]*)" if necessary$/, (amount: string, token: string, network: string) => {
    WrapPage.approveTokenIfNeeded(token, network, amount)
});

Then(/^The native token "([^"]*)" balance for "([^"]*)" on "([^"]*)" is shown under the token selection button$/,  (token:string,account:string,network:string) => {
    WrapPage.validateWrapPageNativeTokenBalance(token,account,network)
});

Then(/^The could not find any tokens message is not shown$/,  () => {
    WrapPage.validateNoTokenMessageNotVisible()
});
Then(/^The native token "([^"]*)" balance for "([^"]*)" on "([^"]*)" in the token list$/,  (token:string,account:string,network:string) => {
    WrapPage.validateNativeTokenBalanceInTokenList(token,account,network)
});
Then(/^"([^"]*)" is selected as the token to wrap$/, function (token:string) {
    WrapPage.validateTokenSelectedForWrapping(token)
});
Then(/^"([^"]*)" is selected as the token to unwrap$/, function (token:string) {
    WrapPage.validateTokenSelectedForUnwrapping(token)

});
Then(/^"([^"]*)" is selected as the token to wrap and it has underlying balance of "([^"]*)"$/, function (token:string,balance:string) {
    WrapPage.validateSelectedTokenAndBalanceForWrapping(token,balance)
});