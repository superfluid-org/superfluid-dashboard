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

Then(/^Approval modal should not be visible$/, () => {
  SettingsPage.approvalModalShouldNotBeVisible();
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

Then(/^Unsaved Changes modal should not be visible$/, function () {
  SettingsPage.unsavedConfirmationModalShouldNotBeVisible();
});

Then(/^User click on approvals add button$/, function () {
  SettingsPage.userClickOnApprovalsAddButton();
});

Then(/^User closes tx the dialog$/, function () {
  SettingsPage.userCloseTxDialog();
});
