import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { SendPage } from "../../pageObjects/pages/SendPage";
import { WrapPage } from "../../pageObjects/pages/WrapPage";

Given(
  /^User fills all stream inputs "([^"]*)" a wallet connected$/,
  (isConnected: string) => {
    SendPage.inputStreamTestData(isConnected);
  }
);

Given(/^Stream preview is shown correctly when user is not connected$/, () => {
  SendPage.checkIfStreamPreviewIsCorrectWhenUserNotConnected();
});
Given(/^User accepts the risk warning$/, () => {
  SendPage.isPlatformDeployedOnNetwork(() => SendPage.acceptRiskWarning());
});

Given(/^Stream ending on and amount per second is shown correctly$/, () => {
  SendPage.validateStreamEndingAndAmountPerSecond();
});

Then(/^Send button is enabled and asks user to Connect their wallet$/, () => {
  SendPage.checkConnectWalletButton();
});

Given(
  /^User searches for "([^"]*)" as a receiver$/,
  (ensNameOrAddress: string) => {
    SendPage.searchForReceiver(ensNameOrAddress);
  }
);

Then(
  /^"([^"]*)" is visible in the ENS recipient results$/,
  (result: string) => {
    SendPage.recipientEnsResultsContain(result);
  }
);

Then(/^User selects the first ENS recipient result$/, () => {
  SendPage.selectFirstENSResult();
});

Then(/^Chosen wallet address shows up as ([^"]*)$/, (chosenAddress: string) => {
  SendPage.chosenReceiverAddress(chosenAddress);
});

Then(/^User clears the receiver field with the close button$/, () => {
  SendPage.clearReceiverField();
});

Given(/^User opens the receiver dialog$/, () => {
  SendPage.receiverDialog();
});

Then(/^The recent receivers are shown on "([^"]*)"$/, (network: string) => {
  SendPage.recentReceiversAreShown(network);
});

Then(/^User closes the dialog$/, () => {
  SendPage.closeDialog();
});

Then(/^The receiver dialog is not visible$/, () => {
  SendPage.receiverDialogDoesNotExist();
});

Then(/^And user selects the first recent receiver$/, () => {
  SendPage.selectFirstRecentReceiver();
});

Then(
  /^The receiver address is shown as the chosen receiver in the send stream page$/,
  () => {
    SendPage.correctRecentReceiverIsChosen();
  }
);

Given(/^User opens the token selection screen$/, () => {
  SendPage.openTokenSelection();
});

Then(
  /^Super token balances are shown correctly for "([^"]*)" on "([^"]*)"$/,
  (account: string, network: string) => {
    SendPage.validateTokenBalancesInSelectionScreen(account, network);
  }
);

Then(/^All of the tokens shown have an animation around them$/, () => {
  SendPage.verifyAllSupertokenAnimations();
});

Given(/^The user clicks on the "([^"]*)" wrap button$/, (token: string) => {
  SendPage.tokenSelectionWrapToken(token);
});

Then(
  /^The user is redirected to the wrap page and "([^"]*)" is selected$/,
  (token: string) => {
    WrapPage.checkIfWrapContainerIsVisible();
    WrapPage.verifyWrapPageSelectedToken(token);
  }
);

Then(
  /^User selects "([^"]*)" as the super token to use for the stream$/,
  (token: string) => {
    SendPage.selectTokenForStreaming(token);
  }
);

Then(
  /^Token balance is shown correctly in the send stream page with a wrap button next to it$/,
  () => {
    SendPage.validateSendPagePreviewBalance();
  }
);

Then(/^User clicks on the wrap button in the send stream page$/, () => {
  SendPage.clickBalancePreviewWrapButton();
});

Then(
  /^"([^"]*)" does not have a wrap button next to the balance$/,
  (token: string) => {
    SendPage.nativeTokenDoesNotHaveWrapButtons(token);
  }
);

Then(
  /^Token balance is shown correctly in the send stream page without a wrap button next to it$/,
  () => {
    SendPage.validateBalanceAndNoWrapButtonForNativeToken();
  }
);

Then(/^User selects "([^"]*)" from the super token list$/, (token: string) => {
  SendPage.selectTokenFromTokenList(token);
});

Given(
  /^User searches for "([^"]*)" in the select token search field$/,
  (token: string) => {
    SendPage.searchForTokenInTokenList(token);
  }
);

Then(
  /^The "([^"]*)" is only shown as a token search result$/,
  (token: string) => {
    SendPage.tokenSearchResultsOnlyContain(token);
  }
);

Then(/^The could not find any tokens message is shown$/, () => {
  SendPage.tokenSearchNoResultsMessageIsShown();
});

Then(/^User clears the token search field$/, () => {
  SendPage.clearTokenSearchField();
});

Given(/^User changes the time unit to "([^"]*)"$/, (unit: string) => {
  SendPage.changeTimeUnit(unit);
});
Then(/^The tokens are sorted by amount in the token selection screen$/, () => {
  SendPage.validateSortedTokensByAmount();
});
Given(/^User waits for token balances to load$/, () => {
  SendPage.waitForTokenBalancesToLoad();
});
Then(/^User clicks on the address button in the send page$/, () => {
  SendPage.clickAddressButton();
});
Given(
  /^User inputs all the details to send "([^"]*)" "([^"]*)" per "([^"]*)" to "([^"]*)"$/,
  (amount: string, token: string, timeUnit: string, address: string) => {
    SendPage.inputStreamDetails(amount, token, timeUnit, address);
  }
);
Given(
  /^User starts the stream and the transaction dialogs are visible for "([^"]*)"$/,
  (network: string) => {
    SendPage.startOrModifyStreamAndValidateTxApprovalDialog(network);
    SendPage.checkNewStreamBrodcastedDialogs();
  }
);
Given(/^User goes to the token page from the transaction dialog$/, () => {
  SendPage.goToTokensPageAfterTx();
});
Then(
  /^All the details to send "([^"]*)" "([^"]*)" per "([^"]*)" to "([^"]*)" on "([^"]*)" are set in the fields$/,
  (
    amount: string,
    token: string,
    timeUnit: string,
    address: string,
    network: string
  ) => {
    SendPage.validateRestoredTransaction(
      amount,
      token,
      timeUnit,
      address,
      network
    );
  }
);
Given(/^User cancels the stream if necessary$/, () => {
  SendPage.cancelStreamIfStillOngoing();
});
Given(/^User starts or cancels the stream if necessary$/, () => {
  SendPage.startOrCancelStreamIfNecessary();
});
Given(
  /^User modifies the stream and the transaction dialogs are visible for "([^"]*)"$/,
  (network: string) => {
    SendPage.startOrModifyStreamAndValidateTxApprovalDialog(network);
    SendPage.validateBroadcastedDialogsAfterModifyingStream();
  }
);
Given(/^User starts the stream if necessary$/, () => {
  SendPage.startStreamIfNecessary();
});
Given(
  /^User cancels the stream and the transaction dialogs are visible for "([^"]*)"$/,
  (network: string) => {
    SendPage.cancelStreamAndVerifyApprovalDialogs(network);
    SendPage.verifyDialogAfterBroadcastingCancelledStream();
  }
);
Given(
  /^User tries to start or modify the stream and the first transaction dialogs are visible on "([^"]*)"$/,
  function (network: string) {
    SendPage.startOrModifyStreamAndValidateTxApprovalDialog(network);
  }
);
Given(
  /^User tries to cancel the stream and the first transaction dialogs are visible on "([^"]*)"$/,
  function (network: string) {
    SendPage.cancelStreamAndVerifyApprovalDialogs(network);
  }
);
Then(/^The start stream button is disabled$/, function () {
  SendPage.validateDisabledSendButton();
});
Then(
  /^The preview buffer amount shown and warning sections shows (\d+) tokens are needed for the buffer$/,
  function () {
    SendPage.validateEthereumMainnetMinimumDeposit();
  }
);
Given(/^User clicks the scheduling toggle$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() => SendPage.clickSchedulingToggle());
});
Given(
  /^User inputs a date "([^"]*)" "([^"]*)" into the future into the stream start date$/,
  function (amount: number, timeunit: string) {
    SendPage.isPlatformDeployedOnNetwork(() =>
      SendPage.inputStartDate(amount, timeunit)
    );
  }
);
Given(
  /^User inputs a date "([^"]*)" "([^"]*)" into the future into the stream end date$/,
  function (amount: number, timeunit: string) {
    SendPage.isPlatformDeployedOnNetwork(() =>
      SendPage.inputEndDate(amount, timeunit)
    );
  }
);
Then(/^The end date container outline is red$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateEndDateBorderIsRed()
  );
});
Then(/^The start date container outline is red$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateStartDateBorderIsRed()
  );
});

Then(/^Allowlist message is shown$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateVisibleAllowlistMessage()
  );
});
Then(/^Scheduled stream fields are visible$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateScheduledStreamFieldsAreVisible()
  );
});
Given(/^User clicks the send transaction button$/, function () {
  SendPage.clickSendButton();
});
Given(/^Scheduled stream transaction dialogs are shown$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateScheduledStreamDialogs()
  );
});
Then(
  /^The total stream amount is correctly calculated to be "([^"]*)"$/,
  function (amount: string) {
    SendPage.isPlatformDeployedOnNetwork(() =>
      SendPage.validateTotalStreamAmount(amount)
    );
  }
);
Given(/^Stream start date field is disabled$/, function () {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateDisabledStartDateField()
  );
});
Then(
  /^The flow rate field in the send page is "([^"]*)"$/,
  function (flowrate: string) {
    SendPage.isPlatformDeployedOnNetwork(() =>
      SendPage.validateSetFlowRate(flowrate)
    );
  }
);
Then(/^The stream start date is set to "([^"]*)"$/, function (date: string) {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateStreamStartDate(date)
  );
});
Then(/^The stream end date is set to "([^"]*)"$/, function (date: string) {
  SendPage.isPlatformDeployedOnNetwork(() =>
    SendPage.validateStreamEndDate(date)
  );
});
