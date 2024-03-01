import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { AutoWrapPage } from "../../pageObjects/pages/AutoWrapPage";
import { SendPage } from "../../pageObjects/pages/SendPage";

Then(
  /^There are no enable or disable auto\-wrap buttons visible$/,
  function () {
    AutoWrapPage.validateNoEnableOrDisableButtonsInTable();
  }
);
Then(
  /^All action buttons are changed to switch network buttons on "([^"]*)" table$/,
  function (network: string) {
    AutoWrapPage.validateAllActionButtonsChangedToSwitchNetwork(network);
  }
);
Then(
  /^Auto\-wrap data shown on "([^"]*)" is correct$/,
  function (network: string) {
    AutoWrapPage.validateNetworkAutoWrapData(network);
  }
);
Then(/^No permissions set screen is visible$/, function () {
  AutoWrapPage.validateNoPermissionsSetScreen();
});
Then(
  /^User clicks on the add token button in the no permissions set screen$/,
  function () {
    AutoWrapPage.clickAddTokenButtonInNoPermissionsScreen();
  }
);
Then(/^Add Auto\-wrap dialog is open$/, function () {
  AutoWrapPage.validateAutoWrapDialogIsOpen();
});
Then(/^Not in allowlist auto\-wrap page screen is visible$/, function () {
  AutoWrapPage.validateAllowlistScreenIsOpen();
});
Given(/^User clicks on the add token button$/, function () {
  SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
    AutoWrapPage.clickAddTokenButton();
  });
});
Given(
  /^User selects "([^"]*)" as the network for the auto\-wrap$/,
  function (network: string) {
    SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
      AutoWrapPage.selectNetworkForAutoWrap(network);
    });
  }
);
Given(
  /^User clicks on the "([^"]*)" enable button in the auto\-wrap table on "([^"]*)"$/,
  function (token: string, network: string) {
    SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
      AutoWrapPage.clickEnableButtonForTokenOnNetwork(token, network);
    });
  }
);
Given(
  /^User clicks on the "([^"]*)" disable auto\-wrap button on "([^"]*)"$/,
  function (token: string, network: string) {
    SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
      AutoWrapPage.clickDisableButtonForTokenOnNetwork(token, network);
    });
  }
);
Given(/^User clicks on the close auto wrap dialog button$/, function () {
  SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
    AutoWrapPage.clickAutoWrapCloseTxButton();
  });
});
Then(/^Auto\-wrap dialog is not visible$/, function () {
  SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
    AutoWrapPage.validateNoAutoWrapDialogIsVisible();
  });
});

Then(
  /^Auto-wrap contract addresses are shown correctly for "([^"]*)"$/,
  function (network: string) {
    AutoWrapPage.validateContractButtonsAndAddresses(network);
  }
);

Then(
  /^User clicks on the enable auto-wrap transaction button in the auto-wrap page dialog$/,
  function () {
    SendPage.runFunctionIfPlatformIsDeployedOnNetwork(() => {
      AutoWrapPage.clickEnableAutoWrapInDialog();
    });
  }
);
