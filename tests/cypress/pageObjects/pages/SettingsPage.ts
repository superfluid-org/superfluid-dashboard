import { BasePage } from "../BasePage";
import { CONNECT_WALLET_BUTTON, Common } from "./Common";

const NOTIFICATION_BUTTON = "[data-cy=notification-button]";
const WALLET_ADDRESS = "[data-cy=wallet-address]";
const NOT_CONNECTED_TITLE = "[data-cy=no-user-settings]";
const NOT_CONNECTED_MESSAGE = "[data-cy=no-history-text]";
const NO_APPROVAL_TITLE = "[data-cy=no-access-data-title]";
const NO_APPROVAL_BODY = "[data-cy=no-access-data-description]";
const ADD_APPROVAL_GLOBAL_BUTTON = "[data-cy=add-token-access-global-button]";
const APPROVAL_MODAL = "[data-cy=upsert-approvals-form]";
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

export class SettingsPage extends BasePage {
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
    this.doesNotExist(APPROVAL_MODAL);
  }

  static inputAllowanceInFormField(amount: string) {
    this.type(APPROVAL_MODAL_ALLOWANCE_FIELD, amount);
  }

  static inputFlowRateInFormField(amount: string) {
    this.type(APPROVAL_MODAL_FLOW_RATE_FIELD, amount);
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
}
