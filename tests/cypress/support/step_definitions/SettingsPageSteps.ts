import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { SettingsPage } from "../../pageObjects/pages/SettingsPage";

Then(/^"([^"]*)" is visible in the settings page$/, function (address: string) {
  SettingsPage.validateVisibleAddress(address);
});
Given(/^User clicks on the notification button$/, function () {
  SettingsPage.clickNotificationButton();
});
Then(/^Settings page wallet not connected screen is visible$/, function () {
  SettingsPage.validateNotConnectedScreen();
});

Then(/^Settings page No Access Data screen screen is visible$/, function () {
  SettingsPage.validateNoAccessDataScreen();
});

Then(/^User clicks on the add approval button$/, () => {
  SettingsPage.clickOnAddApprovalButton();
});

Then(/^User opens the add approval modal is visible$/, () => {
  SettingsPage.validateApprovalModalScreen();
});

Then(/^User closes the add approval modal$/, () => {
  SettingsPage.clickOnCloseApprovalModalButton();
});

Then(/^Approval modal should not exist$/, () => {
  SettingsPage.approvalModalShouldNotExist();
});

Then(
  /^User inputs a allowance "([^"]*)" into the field$/,
  function (amount: string) {
    SettingsPage.inputAllowanceInFormField(amount);
  }
);

Then(
  /^User inputs a flow rate "([^"]*)" into the field$/,
  function (flowRate: string) {
    SettingsPage.inputFlowRateInFormField(flowRate);
  }
);

Then(/^User toggle on a create permission$/, function () {
  SettingsPage.toggleOnCreatePermission();
});

Then(/^User toggle on a update permission$/, function () {
  SettingsPage.toggleOnUpdatePermission();
});

Then(/^User toggle on a delete permission$/, function () {
  SettingsPage.toggleOnDeletePermission();
});

Then(/^User toggle off a update permission$/, function () {
  SettingsPage.toggleOffUpdatePermission();
});

Then(/^Unsaved Changes modal should be visible$/, function () {
  SettingsPage.unsavedConfirmationModalShouldBeVisible();
});

Then(/^User closes the unsaved changes modal$/, function () {
  SettingsPage.userClosesUnsavedChangesModal();
});

Then(/^Unsaved Changes modal should not exist$/, function () {
  SettingsPage.unsavedConfirmationModalShouldNotExist();
});

Then(/^User click on approvals add button$/, function () {
  SettingsPage.clickSaveChangesButton();
});

Then(/^User closes tx the dialog$/, function () {
  SettingsPage.userCloseTxDialog();
});
Given(
  /^User opens the first modify permissions form on "([^"]*)"$/,
  function (network: string) {
    SettingsPage.openFirstModifyFormOnNetwork(network);
  }
);
Given(/^User clicks the create permission toggle$/, function () {
  SettingsPage.clickCreatePermissionToggle();
});
Given(/^User clicks the update permission toggle$/, function () {
  SettingsPage.clickUpdatePermissionToggle();
});
Given(/^User clicks the delete permission toggle$/, function () {
  SettingsPage.clickDeletePermissionToggle();
});

Then(
  /^"([^"]*)" permission row with "([^"]*)" as an operator on "([^"]*)" is visible$/,
  function (token: string, operator: string, network: string) {
    SettingsPage.validatePermissionRowIsVisible(token, operator, network);
  }
);
Then(
  /^Permission row for "([^"]*)" to use "([^"]*)" on "([^"]*)" does not exist$/,
  function (operator: string, token: string, network: string) {
    SettingsPage.validatePermissionRowDoesNotExist(operator, token, network);
  }
);
Given(
  /^User clicks on the revoke button in the permissions form$/,
  function () {
    SettingsPage.clickRevokeButtonInPermissionsForm();
  }
);
Then(
  /^The selected row token , network and operator are auto\-filled in the modify form$/,
  function () {
    SettingsPage.validatePreFilledForm();
  }
);
Given(/^User clicks on the save changes button$/, function () {
  SettingsPage.clickSaveChangesButton();
});
Then(
  /^One stop viewing button is visible in the permissions form$/,
  function () {
    SettingsPage.validateOneStopViewingButtonIsVisibleInPermissionsForm();
  }
);
Then(/^One change network is visible in the permissions form$/, function () {
  SettingsPage.validateOneChangeNetworkButtonIsVisibleInPermissionsForm();
});
Then(
  /^"([^"]*)" permission row with "([^"]*)" as an operator has "([^"]*)" token allowance on "([^"]*)"$/,
  function (
    token: string,
    operator: string,
    allowance: string,
    network: string
  ) {
    SettingsPage.validateTokenAllowanceForSpecificRow(
      token,
      operator,
      allowance,
      network
    );
  }
);
Then(
  /^"([^"]*)" permission row with "([^"]*)" as an operator has "([^"]*)" stream allowance on "([^"]*)"$/,
  function (
    token: string,
    operator: string,
    allowance: string,
    network: string
  ) {
    SettingsPage.validateStreamAllowanceForSpecificRow(
      token,
      operator,
      allowance,
      network
    );
  }
);
