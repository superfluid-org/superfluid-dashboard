import { networksBySlug } from "../../superData/networks";
import { BasePage } from "../BasePage";
import {
  CONNECT_WALLET_BUTTON,
  TOP_BAR_NETWORK_BUTTON,
  SELECT_TOKEN_BUTTON,
  ADDRESS_BUTTON,
  STOP_VIEWING_BUTTON,
  CHANGE_NETWORK_BUTTON,
} from "./Common";
import { ethers } from "ethers";

const NOTIFICATION_BUTTON = "[data-cy=notification-button]";
const WALLET_ADDRESS = "[data-cy=wallet-address]";
const NOT_CONNECTED_TITLE = "[data-cy=no-user-settings]";
const NOT_CONNECTED_MESSAGE = "[data-cy=no-history-text]";
const NO_APPROVAL_TITLE = "[data-cy=no-access-data-title]";
const NO_APPROVAL_BODY = "[data-cy=no-access-data-description]";
const ADD_APPROVAL_GLOBAL_BUTTON = "[data-cy=add-token-access-global-button]";
const APPROVAL_MODAL = "[data-cy=upsert-approvals-form]";

const OTHER_CLOSE_TX_BUTTON = "[data-testid=CloseIcon]";

const APPROVAL_MODAL_CLOSE_BUTTON =
  "[data-cy=upsert-approvals-form-close-button]";
const APPROVAL_MODAL_ALLOWANCE_FIELD =
  "[data-cy=approvals-modal-allowance-field]";
const APPROVAL_MODAL_FLOW_RATE_FIELD = "[data-cy=flow-rate-input]";
const APPROVAL_MODAL_CREATE_ACL_PERMISSION =
  "[data-cy=flow-acl-permission-Create-switch]";
const APPROVAL_MODAL_DELETE_ACL_PERMISSION =
  "[data-cy=flow-acl-permission-Delete-switch]";
const APPROVAL_MODAL_UPDATE_ACL_PERMISSION =
  "[data-cy=flow-acl-permission-Update-switch]";

const SAVE_CHANGES_BUTTON = "[data-cy=approvals-save-button]";

const UNSAVED_CONFIRMATION_MODAL =
  "[data-cy=approvals-unsaved-confirmation-form]";

const UNSAVED_CONFIRMATION_MODAL_CLOSE_ICON =
  "[data-cy=upsert-approvals-unsaved-form-close-button]";

const OPERATOR_ADDRESSES = "[data-cy=access-setting-address]";
const REVOKE_BUTTON = "[data-cy=revoke-button]";
const PERMISSIONS_DIALOG = "[data-cy=permissions-dialog]";
const MODIFY_BUTTONS = "[data-cy=modify-token-access-row-button]";
const TOKEN_ALLOWANCES = "[data-cy=token-allowance]";
const STREAM_ALLOWANCES = "[data-cy=flow-rate-allowance]";
const ASSETS_IN_TABLE = "[data-cy=token-symbol]";
const PERMISSIONS_FORM_TITLE = "[data-cy=permissions-form-title]";

export class SettingsPage extends BasePage {
  static clickUpdatePermissionToggle() {
    this.click(APPROVAL_MODAL_UPDATE_ACL_PERMISSION);
  }
  static clickDeletePermissionToggle() {
    this.click(APPROVAL_MODAL_DELETE_ACL_PERMISSION);
  }
  static validatePermissionRowIsVisible(
    token: string,
    operator: string,
    network: string
  ) {
    cy.fixture("commonData").then((data) => {
      let address = data[operator]
        ? data[operator].toLowerCase()
        : operator.toLowerCase();
      let assertableString = ethers.utils.isAddress(operator)
        ? BasePage.shortenHex(address)
        : operator;
      let checkedRowSelector = `[data-cy=${network}-permission-and-allowances-table] [data-cy=${token}-${address}-row]`;
      this.isVisible(checkedRowSelector);
      this.hasText(
        `${checkedRowSelector} ${OPERATOR_ADDRESSES}`,
        assertableString
      );
    });
  }
  static validatePermissionRowDoesNotExist(
    operator: string,
    token: string,
    network: string
  ) {
    cy.fixture("commonData").then((data) => {
      let address = data[operator] ? data[operator] : operator;
      this.doesNotExist(
        `[data-cy=${network}-permission-and-allowances-table] [data-cy=${token}-${address}-row]`
      );
    });
  }
  static clickRevokeButtonInPermissionsForm() {
    this.click(REVOKE_BUTTON);
  }
  static validatePreFilledForm() {
    cy.get("@selectedPermissionNetwork").then((network) => {
      cy.get("@selectedPermissionToken").then((token) => {
        cy.get<string>("@selectedPermissionOperator").then((operator) => {
          this.isDisabled(`${PERMISSIONS_DIALOG} ${TOP_BAR_NETWORK_BUTTON}`);
          this.containsText(
            `${PERMISSIONS_DIALOG} ${TOP_BAR_NETWORK_BUTTON}`,
            network
          );
          this.isDisabled(`${PERMISSIONS_DIALOG} ${SELECT_TOKEN_BUTTON}`);
          this.hasText(`${PERMISSIONS_DIALOG} ${SELECT_TOKEN_BUTTON}`, token);
          this.isDisabled(`${PERMISSIONS_DIALOG} ${ADDRESS_BUTTON}`);

          cy.get(`${PERMISSIONS_DIALOG} ${ADDRESS_BUTTON}`)
            .invoke("text")
            .then((text) => {
              let assertableString = ethers.utils.isAddress(text)
                ? BasePage.shortenHex(text)
                : text;
              cy.wrap(operator).should("be.equal", assertableString);
            });
        });
      });
    });
  }

  static validateOneStopViewingButtonIsVisibleInPermissionsForm() {
    this.isVisible(`${PERMISSIONS_DIALOG} ${STOP_VIEWING_BUTTON}`);
    this.hasLength(`${PERMISSIONS_DIALOG} ${STOP_VIEWING_BUTTON}`, 1);
  }
  static validateOneChangeNetworkButtonIsVisibleInPermissionsForm() {
    this.isVisible(`${PERMISSIONS_DIALOG} ${CHANGE_NETWORK_BUTTON}`);
    this.hasLength(`${PERMISSIONS_DIALOG} ${CHANGE_NETWORK_BUTTON}`, 1);
  }
  static validateTokenAllowanceForSpecificRow(
    token: string,
    operator: string,
    allowance: string,
    network: string
  ) {
    cy.fixture("commonData").then((data) => {
      let address = data[operator]
        ? data[operator].toLowerCase()
        : operator.toLowerCase();
      let checkedRowSelector = `[data-cy=${network}-permission-and-allowances-table] [data-cy=${token}-${address}-row]`;
      this.hasText(`${checkedRowSelector} ${TOKEN_ALLOWANCES}`, allowance);
    });
  }
  static validateStreamAllowanceForSpecificRow(
    token: string,
    operator: string,
    allowance: string,
    network: string
  ) {
    cy.fixture("commonData").then((data) => {
      let address = data[operator]
        ? data[operator].toLowerCase()
        : operator.toLowerCase();
      let checkedRowSelector = `[data-cy=${network}-permission-and-allowances-table] [data-cy=${token}-${address}-row]`;
      this.hasText(`${checkedRowSelector} ${STREAM_ALLOWANCES}`, allowance);
    });
  }

  static clickCreatePermissionToggle() {
    this.click(APPROVAL_MODAL_CREATE_ACL_PERMISSION);
  }
  static openFirstModifyFormOnNetwork(network: string) {
    let selectedNetwork = this.getSelectedNetwork(network);
    cy.get(
      `[data-cy=${selectedNetwork}-permission-and-allowances-table] ${ASSETS_IN_TABLE}`
    )
      .first()
      .invoke("text")
      .as("selectedPermissionToken");
    cy.get(
      `[data-cy=${selectedNetwork}-permission-and-allowances-table] ${OPERATOR_ADDRESSES}`
    )
      .first()
      .invoke("text")
      .as("selectedPermissionOperator");
    cy.wrap(networksBySlug.get(selectedNetwork).name).as(
      "selectedPermissionNetwork"
    );
    this.clickFirstVisible(
      `[data-cy=${selectedNetwork}-permission-and-allowances-table] ${MODIFY_BUTTONS}`
    );
  }
  static validateVisibleAddress(address: string) {
    this.hasText(WALLET_ADDRESS, address);
  }

  static clickNotificationButton() {
    this.click(NOTIFICATION_BUTTON);
  }

  static validateNotConnectedScreen() {
    this.hasText(NOT_CONNECTED_TITLE, "Wallet not connected");
    this.hasText(
      NOT_CONNECTED_MESSAGE,
      "Wallet is not connected, please connect wallet to modify settings."
    );
    this.isVisible(CONNECT_WALLET_BUTTON);
  }

  static validateNoAccessDataScreen() {
    this.hasText(NO_APPROVAL_TITLE, "No Access Data");
    this.hasText(
      NO_APPROVAL_BODY,
      "You currently don’t have any Super Token permissions and allowance set."
    );
  }

  static clickOnAddApprovalButton() {
    this.click(ADD_APPROVAL_GLOBAL_BUTTON);
  }

  static validateApprovalModalScreen() {
    this.isVisible(APPROVAL_MODAL);
  }

  static clickOnCloseApprovalModalButton() {
    this.click(APPROVAL_MODAL_CLOSE_BUTTON);
  }

  static inputAllowanceInFormField(amount: string) {
    this.type(APPROVAL_MODAL_ALLOWANCE_FIELD, amount);
    //Workaround because "save changes" button does not update until user stops focusing the field
    this.click(PERMISSIONS_FORM_TITLE);
  }

  static inputFlowRateInFormField(amount: string) {
    this.type(APPROVAL_MODAL_FLOW_RATE_FIELD, amount);
    //Workaround because "save changes" button does not update until user stops focusing the field
    this.click(PERMISSIONS_FORM_TITLE);
  }

  static toggleOnCreatePermission() {
    this.click(APPROVAL_MODAL_CREATE_ACL_PERMISSION);
  }

  static toggleOnUpdatePermission() {
    this.click(APPROVAL_MODAL_UPDATE_ACL_PERMISSION);
  }

  static toggleOnDeletePermission() {
    this.click(APPROVAL_MODAL_DELETE_ACL_PERMISSION);
  }

  static toggleOffUpdatePermission() {
    this.click(APPROVAL_MODAL_UPDATE_ACL_PERMISSION);
  }

  static approvalModalShouldNotExist = () => this.doesNotExist(APPROVAL_MODAL);

  static unsavedConfirmationModalShouldBeVisible = () =>
    this.isVisible(UNSAVED_CONFIRMATION_MODAL);

  static userClosesUnsavedChangesModal = () =>
    this.click(UNSAVED_CONFIRMATION_MODAL_CLOSE_ICON);

  static unsavedConfirmationModalShouldNotExist = () =>
    this.doesNotExist(UNSAVED_CONFIRMATION_MODAL);

  static clickSaveChangesButton = () => this.click(SAVE_CHANGES_BUTTON);

  static userCloseTxDialog = () =>
    this.clickFirstVisible(OTHER_CLOSE_TX_BUTTON);
}
