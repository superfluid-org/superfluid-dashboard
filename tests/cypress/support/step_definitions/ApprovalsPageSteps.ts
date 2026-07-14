import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { ApprovalsPage } from "../../pageObjects/pages/ApprovalsPage";

Then(/^"([^"]*)" is visible in the approvals page$/, function (address: string) {
  ApprovalsPage.validateVisibleAddress(address);
});
Then(/^Approvals page wallet not connected screen is visible$/, function () {
  ApprovalsPage.validateNotConnectedScreen();
});

Then(/^Approvals page No Access Data screen screen is visible$/, function () {
  ApprovalsPage.validateNoAccessDataScreen();
});

Then(/^User clicks on the add approval button$/, () => {
  ApprovalsPage.clickOnAddApprovalButton();
});

Then(/^User opens the add approval modal is visible$/, () => {
  ApprovalsPage.validateApprovalModalScreen();
});

Then(/^User closes the add approval modal$/, () => {
  ApprovalsPage.clickOnCloseApprovalModalButton();
});

Then(/^Approval modal should not exist$/, () => {
  ApprovalsPage.approvalModalShouldNotExist();
});

Then(
  /^User inputs a allowance "([^"]*)" into the field$/,
  function (amount: string) {
    ApprovalsPage.inputAllowanceInFormField(amount);
  }
);

Then(
  /^User inputs a flow rate "([^"]*)" into the field$/,
  function (flowRate: string) {
    ApprovalsPage.inputFlowRateInFormField(flowRate);
  }
);

Then(/^User toggle on a create permission$/, function () {
  ApprovalsPage.toggleOnCreatePermission();
});

Then(/^User toggle on a update permission$/, function () {
  ApprovalsPage.toggleOnUpdatePermission();
});

Then(/^User toggle on a delete permission$/, function () {
  ApprovalsPage.toggleOnDeletePermission();
});

Then(/^User toggle off a update permission$/, function () {
  ApprovalsPage.toggleOffUpdatePermission();
});

Then(/^Unsaved Changes modal should be visible$/, function () {
  ApprovalsPage.unsavedConfirmationModalShouldBeVisible();
});

Then(/^User closes the unsaved changes modal$/, function () {
  ApprovalsPage.userClosesUnsavedChangesModal();
});

Then(/^Unsaved Changes modal should not exist$/, function () {
  ApprovalsPage.unsavedConfirmationModalShouldNotExist();
});

Then(/^User click on approvals add button$/, function () {
  ApprovalsPage.clickSaveChangesButton();
});

Then(/^User closes tx the dialog$/, function () {
  ApprovalsPage.userCloseTxDialog();
});
Given(
  /^User opens the first modify permissions form on "([^"]*)"$/,
  function (network: string) {
    ApprovalsPage.openFirstModifyFormOnNetwork(network);
  }
);
Given(/^User clicks the create permission toggle$/, function () {
  ApprovalsPage.clickCreatePermissionToggle();
});
Given(/^User clicks the update permission toggle$/, function () {
  ApprovalsPage.clickUpdatePermissionToggle();
});
Given(/^User clicks the delete permission toggle$/, function () {
  ApprovalsPage.clickDeletePermissionToggle();
});

Then(
  /^"([^"]*)" permission row with "([^"]*)" as an operator on "([^"]*)" is visible$/,
  function (token: string, operator: string, network: string) {
    ApprovalsPage.validatePermissionRowIsVisible(token, operator, network);
  }
);
Then(
  /^Permission row for "([^"]*)" to use "([^"]*)" on "([^"]*)" does not exist$/,
  function (operator: string, token: string, network: string) {
    ApprovalsPage.validatePermissionRowDoesNotExist(operator, token, network);
  }
);
Given(
  /^User clicks on the revoke button in the permissions form$/,
  function () {
    ApprovalsPage.clickRevokeButtonInPermissionsForm();
  }
);
Then(
  /^The selected row token , network and operator are auto\-filled in the modify form$/,
  function () {
    ApprovalsPage.validatePreFilledForm();
  }
);
Given(/^User clicks on the save changes button$/, function () {
  ApprovalsPage.clickSaveChangesButton();
});
Then(
  /^One stop viewing button is visible in the permissions form$/,
  function () {
    ApprovalsPage.validateOneStopViewingButtonIsVisibleInPermissionsForm();
  }
);
Then(/^One change network is visible in the permissions form$/, function () {
  ApprovalsPage.validateOneChangeNetworkButtonIsVisibleInPermissionsForm();
});
Then(
  /^"([^"]*)" permission row with "([^"]*)" as an operator has "([^"]*)" token allowance on "([^"]*)"$/,
  function (
    token: string,
    operator: string,
    allowance: string,
    network: string
  ) {
    ApprovalsPage.validateTokenAllowanceForSpecificRow(
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
    ApprovalsPage.validateStreamAllowanceForSpecificRow(
      token,
      operator,
      allowance,
      network
    );
  }
);
