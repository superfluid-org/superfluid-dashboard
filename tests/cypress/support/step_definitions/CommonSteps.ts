import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { Common } from '../../pageObjects/pages/Common';
import { DashboardPage } from '../../pageObjects/pages/DashboardPage';
import { WrapPage } from '../../pageObjects/pages/WrapPage';
import { SendPage } from '../../pageObjects/pages/SendPage';

Given(/^"([^"]*)" is open without connecting a wallet$/, (page: string) => {
  Common.openPage(page);
});

Given(/^User clicks on the "([^"]*)" navigation button$/, (button: string) => {
  Common.clickNavBarButton(button);
});

Then(
  /^Dashboard page is open when wallet of the user is not connected$/,
  () => {
    DashboardPage.checkIfDashboardConnectIsVisible();
  }
);

Then(
  /^Wrap\/Unwrap page is open and the wrap container is visible without a wallet connected$/,
  () => {
    WrapPage.checkIfWrapContainerIsVisible();
    WrapPage.connectWalletButtonIsVisible();
  }
);

Then(
  /^Wrap\/Unwrap page is open and the wrap container is visible with a wallet connected$/,
  () => {
    WrapPage.checkIfWrapContainerIsVisible();
    WrapPage.checkIfUpgradeButtonIsVisible();
  }
);

Then(/^Send page is open and the send container is visible$/, () => {
  SendPage.checkIfSendContainerIsVisible();
});

Then(/^Wait for (\d+) seconds$/, (seconds: number) => {
  cy.wait(seconds * 1000);
});

Given(/^User clicks on the connect wallet button$/, () => {
  Common.clickConnectWallet();
});

Given(
  /^"([^"]*)" is open with "([^"]*)" connected on "([^"]*)"$/,
  (page: string, account: string, network: string) => {
    Common.openPage(page, account, network);
  }
);

Given(
  /^The "([^"]*)" stream from "([^"]*)" to "([^"]*)" on "([^"]*)" is cancelled$/,
  (token: string, sender: string, receiver: string, network: string) => {
    cy.wrap(
      SendPage.cancelTokenStreamFromTo(token, sender, receiver, network),
      { timeout: 90000 }
    );
    //Waiting just to make sure the nonces don't get messed up between the cancel tx and the provider thats used to connect to the dashboard
    cy.wait(15000);
  }
);

Given(
  /^The "([^"]*)" stream from "([^"]*)" to "([^"]*)" on "([^"]*)" is running$/,
  (token: string, sender: string, receiver: string, network: string) => {
    cy.wrap(SendPage.startTokenStreamFromTo(token, sender, receiver, network), {
      timeout: 90000,
    });
    //Waiting just to make sure the nonces don't get messed up between the start tx and the provider thats used to connect to the dashboard
    cy.wait(30000);
  }
);

Given(/^User connects their wallet to the dashboard$/, () => {
  Common.clickConnectWallet();
  Common.clickInjectedWallet();
});

Given(/^User changes their network to "([^"]*)"$/, (network: string) => {
  Common.changeNetwork(network);
});

Given(
  /^The navigation drawer shows that "([^"]*)" is "([^"]*)"$/,
  (account: string, message: string) => {
    Common.checkNavBarWalletStatus(account, message);
  }
);

Given(/^The navigation drawer shows connect wallet button$/, () => {
  Common.drawerConnectWalletButtonIsVisible();
});

Given(/^User uses view mode to look at "([^"]*)"$/, (account: string) => {
  Common.viewAccount(account);
});

Given(/^User clicks on the dark mode button$/, () => {
  Common.clickDarkModeButton();
});

Given(/^The dashboard theme is set to dark mode$/, () => {
  Common.validateDashboardIsInDarkMode();
});

Given(/^User clicks on the light mode button$/, () => {
  Common.clickLightModeButton();
});

Given(/^The dashboard theme is set to light mode$/, () => {
  Common.validateDashboardIsInLightMode();
});

Given(/^A lens entry for "([^"]*)" is visible$/, (account: string) => {
  Common.validateLensEntryIsVisible(account);
});
Given(/^The avatar image for "([^"]*)" is shown loaded$/, (account: string) => {
  Common.validateLensImageIsLoaded(account);
});
Given(/^User chooses the first lens entry from the list$/, () => {
  Common.clickOnFirstLensEntry();
});

Given(/^User opens the connected account modal$/, () => {
  Common.clickOnConnectedWalletModal();
});
Given(/^User clicks on the copy address button in the account modal$/, () => {
  Common.clickOnAddressModalCopyButton();
});
Given(
  /^The address is copied and the buttons text in the address modal changes to "Copied!" with a checkmark icon$/,
  () => {
    Common.validateCopiedAddressInAddressModal();
  }
);
Given(/^User clicks on the disconnect button$/, () => {
  Common.clickDisconnectButton();
});

Then(/^The stop viewing as an address button is visible$/, () => {
  WrapPage.isStopViewingButtonVisible();
});

Given(/^User changes the visible networks to "([^"]*)"$/, (type: string) => {
  Common.changeVisibleNetworksTo(type);
});

Given(/^User opens the network selection dropdown$/, () => {
  Common.openNetworkSelectionDropdown();
});

Given(/^User closes the dropdown$/, () => {
  Common.closeDropdown();
});

Then(/^User clicks on the view mode button$/, () => {
  Common.clickOnViewModeButton();
});
Then(/^Lens and ENS api requests are blocked$/, () => {
  Common.blockLensAndENSApiRequests();
});
Then(
  /^An error is shown in the "([^"]*)" receiver list$/,
  (lensOrEns: string) => {
    Common.validateErrorShownInRecepientList(lensOrEns);
  }
);
Then(/^User types "([^"]*)" into the address input$/, (input: string) => {
  Common.typeIntoAddressInput(input);
});
Then(/^User hovers on the modify streams onboarding card$/, () => {
  Common.hoverOnModifyStreamsOnboardingCard();
});
Then(/^User clicks on the modify streams onboarding card$/, () => {
  Common.clickModifyStreamsOnboardingCard();
});
Then(
  /^The minigame container iframe is visible without a wallet connected$/,
  () => {
    Common.validateMiniGameContainerWithoutWalletConnected();
  }
);
Then(/^In-game cosmetics warning is shown$/, () => {
  Common.validateMiniGameCosmeticsWarningIsVisible();
});

Then(/^In-game cosmetics warning does not exist$/, () => {
  Common.validateMiniGameCosmeticsWarningDoesNotExist();
});
Then(
  /^The minigame container iframe is visible with a wallet connected$/,
  () => {
    Common.validateMiniGameContainerWithWalletConnected();
  }
);

Then(/^Wallet connection modal is shown$/, () => {
  Common.validateWalletConnectionModalIsShown();
});

Then(
  /^"([^"]*)" address book entry for "([^"]*)" is visible in the search results$/,
  (name: string, address: string) => {
    Common.validateAddressBookSearchResult(name, address);
  }
);

Then(/^User chooses the first address book result$/, () => {
  Common.chooseFirstAddressBookResult();
});
Then(/^View mode chip shows "([^"]*)"$/, (message: string) => {
  Common.validateViewModeChipMessage(message);
});
Then(/^View mode dialog does not exist$/, () => {
  Common.validateNoViewModeDialogExists();
});
Then(
  /^"([^"]*)" ENS entry in the address search results is shown$/,
  (ensName: string) => {
    SendPage.validateEnsEntry(ensName);
  }
);
Then(/^Connected account dialog does not exist$/, () => {
  Common.validateNoConnectedAccountDialogExists();
});
Then(/^404 page is shown$/, () => {
  Common.errorPageIsVisible();
});
Given(
  /^Transactional account ([^"]*) is connected to the dashboard on ([^"]*)$/,
  (persona: string, network: string) => {
    Common.openDashboardWithConnectedTxAccount('/', persona, network);
  }
);
Given(/^User restores the last transaction$/, () => {
  Common.restoreLastTx();
});
Given(/^User waits for (\d+) seconds$/, function (seconds: number) {
  Common.wait(seconds);
});
Then(/^Transaction rejected error is shown$/, function () {
  Common.transactionRejectedErrorIsShown();
});
Then(
  /^Transaction rejected error is shown for auto-wrap or vesting transaction$/,
  function () {
    SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
      Common.transactionRejectedErrorIsShown();
    });
  }
);

Given(/^Stream table requests are mocked to an empty state$/, function () {
  Common.mockQueryToEmptyState('streams');
});
Given(/^Transfer event requests are mocked to an empty state$/, function () {
  Common.mockQueryToEmptyState('transferEvents');
});

Given(/^User disconnects their wallet from the dashboard$/, () => {
  Common.disconnectWallet();
});
Given(/^User chooses to connect the mock wallet$/, () => {
  Common.clickMockWallet();
});
Then(
  /^Ethereum mainnet is not available in the network selection dropdown$/,
  function () {
    Common.validateNoEthereumMainnetShownInDropdown();
  }
);
Then(/^User opens the navigation more menu$/, function () {
  Common.openNavigationMoreMenu();
});
Then(/^User opens the access code menu$/, function () {
  Common.openAccessCodeMenu();
});
Then(
  /^User clicks on the "([^"]*)" button in the more menu$/,
  function (button: string) {
    Common.clickMoreMenuButton(button);
  }
);

Then(/^User types "([^"]*)" in the access code menu$/, function (code: string) {
  Common.inputAccessCode(code);
});
Then(/^User submits the access code$/, function () {
  Common.submitAccessCode();
});
Then(/^Access code window is not visible$/, function () {
  Common.validateAccessCodeWindowNotExisting();
});
Then(
  /^Ethereum mainnet is visible in the network selection dropdown$/,
  function () {
    Common.validateEthMainnetVisibleInNetworkSelection();
  }
);
Then(/^Invalid Access Code error is shown$/, function () {
  Common.validateInvalidAccessCodeError();
});
Then(/^User closes the access code dialog$/, function () {
  Common.closeAccessCodeDialog();
});
Given(/^User opens the dashboard network selection dropdown$/, function () {
  Common.openDashboardNetworkSelectionDropdown();
});
Given(/^HDWallet transactions are rejected$/, function () {
  Common.rejectTransactions();
});

Given(
  /^Superfluid RPCs are not more then (\d+) minutes behind on (.*)$/,
  function (minutes: number, network: string) {
    Common.checkThatSuperfluidRPCisNotBehind(minutes, network);
  }
);
Given(
  /^The graph is not more then (\d+) minutes behind on (.*)$/,
  function (minutes: number, network: string) {
    Common.checkThatTheGraphIsNotBehind(minutes, network);
  }
);
Then(
  /^The stream row to "([^"]*)" has a flow rate of "([^"]*)" and dates to "([^"]*)"$/,
  function (address: string, flowRate: number, startEndDate: string) {
    Common.validateScheduledStreamRow(address, flowRate, startEndDate);
  }
);
Given(/^User opens the faucet view from the navigation menu$/, function () {
  Common.openFaucetMenu();
});

Given(/^User opens the auto-wrap page from the navigation menu$/, function () {
  Common.openAutoWrapPage();
});

Then(/^Connect wallet button is visible in the faucet menu$/, function () {
  Common.validateConnectWalletButtonInFaucetMenu();
});
Then(
  /^Switch to Optimism Sepolia button is visible in the faucet menu$/,
  function () {
    Common.validateSwitchNetworkButtonInFaucetMenu();
  }
);
Then(/^User clicks on the switch network to button$/, function () {
  Common.clickSwitchNetworkButton();
});
Then(
  /^"([^"]*)" is the selected network in the dashboard$/,
  function (networkName: string) {
    Common.validateSelectedNetwork(networkName);
  }
);
Given(/^Faucet requests are mocked to an error state$/, function () {
  Common.mockFaucetRequestsToFailure();
});
Given(/^User clicks the claim tokens button$/, function () {
  Common.clickClaimTokensButton();
});
Then(
  /^The claim token is disabled and shows Tokens claimed message$/,
  function () {
    Common.validateDisabledClaimTokensButton();
  }
);
Then(/^Successfully claimed tokens message is shown$/, function () {
  Common.validateFaucetSuccessMessage();
});
Then(/^User clicks on the go to dashboard page button$/, function () {
  Common.clickFaucetGoToDashboardButton();
});
// Then(/^User sends back the remaining MATIC to the faucet$/, function () {
//   Common.sendBackNotMintableFaucetTokens();
// });
Then(/^You have already claimed tokens message is shown$/, function () {
  Common.validateYouHaveAlreadyClaimedTokensMessage();
});
Then(/^User clicks on the wrap into super tokens button$/, function () {
  Common.clickFaucetMenuWrapButton();
});
Then(/^Something went wrong message is shown in the faucet menu$/, function () {
  Common.validateSomethingWentWrongMessageInFaucet();
});
Then(/^User closes the presentation dialog$/, function () {
  Common.closePresentationDialog();
});
Given(/^The new wallet address is visible in the faucet menu$/, function () {
  Common.validateNewWalletAddress();
});
// Given(
//   /^The faucet contract has got enough funds to send to people$/,
//   function () {
//     Common.checkFaucetContractBalance();
//   }
// );
Then(/^Faucet view is visible$/, function () {
  Common.validateOpenFaucetView();
});
Given(/^User opens the notifications modal$/, function () {
  Common.clickNotificationButton();
});

Then(
  /^User switches to the "([^"]*)" notification tab$/,
  function (tab: string) {
    Common.switchNotificationTabTo(tab);
  }
);
Then(
  /^You are not subscribed to notifications message is shown$/,
  function (tab: string) {
    Common.validateNotSubscribedMessage();
  }
);
Then(
  /^Connect wallet button is visible in the notification modal$/,
  function () {
    Common.validateConnectWalletButtonInNotifModal();
  }
);
Given(
  /^Notifications requests are mocked to "([^"]*)"$/,
  function (type: string) {
    Common.mockNotificationRequestsTo(type);
  }
);
Then(/^Notification toast is visible for "([^"]*)"$/, function (type: string) {
  Common.validateNotificationToast(type);
});
Then(
  /^Notification badge shows "([^"]*)" new notification$/,
  function (amount: string) {
    Common.validateNotificationBadge(amount);
  }
);

Then(/^User closes the notification modal$/, function () {
  Common.closeDropdown();
});

Then(/^User archives the last notification$/, function () {
  Common.archiveLastNotification();
});
Then(/^Archived "([^"]*)" notification is shown$/, function (type: string) {
  Common.validateArchivedNotification(type);
});
Then(/^Wrap button is visible in the notifications modal$/, function () {
  Common.validateWrapButtonsInNotifModal();
});
Then(
  /^User clicks on the wrap button in the notifications modal$/,
  function () {
    Common.clickWrapButtonInNotifModal();
  }
);
Then(/^No wrap button is visible in the notifications modal$/, function () {
  Common.validateNoWrapButtonsInNotifModal();
});
Then(/^New "([^"]*)" notification is shown$/, function (type: string) {
  Common.validateNewNotification(type);
});
Then(/^Read "([^"]*)" notification is shown$/, function (type: string) {
  Common.validateReadNotification(type);
});
Then(/^No "([^"]*)" notifications message is shown$/, function (tab: string) {
  Common.validateNoNewNotificationsMessage(tab);
});
Given(/^User clicks on the notification settings button$/, function () {
  Common.clickNotificationSettingsButton();
});
Given(
  /^"([^"]*)" is open using view mode to look at "([^"]*)"$/,
  function (page: string, account: string) {
    Common.openViewModePage(page, account);
  }
);

Then(
  /^"([^"]*)" are visible in the table as the receivers or senders of streams$/,
  function (names: string) {
    Common.validateAddressBookNamesInTables(names);
  }
);
Then(/^User clears the receiver input field$/, function () {
  Common.clearReceiverField();
});
Then(/^No loading skeletons are visible in the page$/, function () {
  Common.waitForSpookySkeletonsToDisapear();
});

Then(
  /^Ecosystem page navigation button leads to an external site$/,
  function () {
    Common.validateEcosystemNavigationButtonHref();
  }
);

Given(
  /^The test case is skipped if the platform is not deployed on the network$/,
  function () {
    if (SendPage.skipTestIfPlatformNotAvailableOnNetwork()) {
      this.skip();
    }
  }
);
