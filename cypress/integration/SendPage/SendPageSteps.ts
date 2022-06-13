import {Given, Then} from "cypress-cucumber-preprocessor/steps";
import {SendPage} from "../../pageObjects/pages/SendPage";
import {WrapPage} from "../../pageObjects/pages/WrapPage";

Given(/^User fills all stream inputs$/, function () {
    SendPage.inputStreamTestData();
});

Given(/^Stream preview is shown correctly$/, function () {
    SendPage.checkIfStreamPreviewIsCorrect();
});
Given(/^User accepts the risk warning$/, function () {
    SendPage.acceptRiskWarning();
});

Given(/^Stream ending on and amount per second is shown correctly$/, function () {
    SendPage.validateStreamEndingAndAmountPerSecond();
});

Then(/^Send button is enabled and asks user to Connect their wallet$/, function () {
    SendPage.checkConnectWalletButton();
});

Given(/^User searches for "([^"]*)" as a receiver$/, function (ensNameOrAddress: string) {
    SendPage.searchForReceiver(ensNameOrAddress);
});

Then(/^"([^"]*)" is visible in the ENS recipient results$/, function (result: string) {
    SendPage.recipientEnsResultsContain(result);
});

Then(/^User selects the first ENS recipient result$/, function () {
    SendPage.selectFirstENSResult();
});

Then(/^Chosen ENS receiver wallet address shows ([^"]*) and ([^"]*)$/,
    function (name: string, address: string) {
        SendPage.chosenEnsReceiverWalletAddress(name, address);
    });

Then(/^User clears the receiver field with the close button$/, function () {
    SendPage.clearReceiverField();
});

Then(/^The stop viewing as an address button is visible$/, function () {
    WrapPage.isStopViewingButtonVisible();
});

Given(/^Change network button is visible with a message asking user to switch to "([^"]*)"$/,
    function (network: string) {
        WrapPage.changeNetworkButtonShowsCorrectNetwork(network);
    });

Given(/^User opens the receiver dialog$/, function () {
    SendPage.receiverDialog();
});

Then(/^The recent receivers are shown on "([^"]*)"$/, function (network: string) {
    SendPage.recentReceiversAreShown(network);
});

Then(/^User closes the dialog$/, function () {
    SendPage.closeDialog();
});

Then(/^The receiver dialog is not visible$/, function () {
    SendPage.receiverDialogDoesNotExist();
});

Then(/^And user selects the first recent receiver$/, function () {
    SendPage.selectFirstRecentReceiver();
});

Then(/^The receiver address is shown as the chosen receiver in the send stream page$/,
    function () {
        SendPage.correctRecentReceiverIsChosen();
    });

Given(/^User opens the token selection screen$/, function () {
    SendPage.openTokenSelection();
});

Then(/^Super token balances are shown correctly for "([^"]*)" on "([^"]*)"$/,
    function (account: string, network: string) {
        SendPage.validateTokenBalancesInSelectionScreen(account, network);
    });

Then(/^All of the tokens shown have an animation around them$/, function () {
    SendPage.verifyAllSupertokenAnimations();
});

Given(/^The user clicks on the "([^"]*)" wrap button$/, function (token: string) {
    SendPage.tokenSelectionWrapToken(token);
});

Then(/^The user is redirected to the wrap page and "([^"]*)" is selected$/,
    function (token: string) {
        WrapPage.checkIfWrapContainerIsVisible();
        WrapPage.verifyWrapPageSelectedToken(token);
    });

Then(/^User selects "([^"]*)" as the super token to use for the stream$/,
    function (token: string) {
        SendPage.selectTokenForStreaming(token);
    });

Then(/^Token balance is shown correctly in the send stream page with a wrap button next to it$/,
    function () {
        SendPage.validateSendPagePreviewBalance();
    });

Then(/^User clicks on the wrap button in the send stream page$/, function () {
    SendPage.clickBalancePreviewWrapButton();
});

Then(/^"([^"]*)" does not have a wrap button next to the balance$/, function (token: string) {
    SendPage.nativeTokenDoesNotHaveWrapButtons(token);
});

Then(/^Token balance is shown correctly in the send stream page without a wrap button next to it$/,
    function () {
        SendPage.validateBalanceAndNoWrapButtonForNativeToken();
    });

Then(/^User selects "([^"]*)" from the super token list$/, function (token: string) {
    SendPage.selectTokenFromTokenList(token);
});

Given(/^User searches for "([^"]*)" in the select token search field$/,
    function (token: string) {
        SendPage.searchForTokenInTokenList(token);
    });

Then(/^The "([^"]*)" is only shown as a token search result$/, function (token: string) {
    SendPage.tokenSearchResultsOnlyContain(token);
});

Then(/^The could not find any tokens message is shown$/, function () {
    SendPage.tokenSearchNoResultsMessageIsShown();
});

Then(/^User clears the token search field$/, function () {
    SendPage.clearTokenSearchField();
});

Given(/^User changes the time unit to "([^"]*)"$/, function (unit: string) {
    SendPage.changeTimeUnit(unit);
});
Then(/^The tokens are sorted by amount in the token selection screen$/, function () {
    SendPage.validateSortedTokensByAmount();
});
Given(/^User waits for token balances to load$/, function () {
    SendPage.waitForTokenBalancesToLoad();
});