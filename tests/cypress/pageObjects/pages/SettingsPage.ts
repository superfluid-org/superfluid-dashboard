import { BasePage } from "../BasePage";
import { CONNECT_WALLET_BUTTON } from "./Common";

const NOTIFICATION_BUTTON = "[data-cy=notification-button]";
const WALLET_ADDRESS = "[data-cy=wallet-address]";
const NOT_CONNECTED_TITLE = "[data-cy=no-user-settings]";
const NOT_CONNECTED_MESSAGE = "[data-cy=no-history-text]";

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
}
