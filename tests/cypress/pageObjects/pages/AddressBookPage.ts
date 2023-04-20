import { BasePage } from "../BasePage";

const NO_ADDRESSES_TITLE = "[data-cy=no-address-title]";
const NO_ADDRESSES_MESSAGE = "[data-cy=no-address-message]";
const ADD_ADDRESS_BUTTON = "[data-cy=add-address-btn]";
const REMOVE_ADDRESS_BUTTON = "[data-cy=remove-button]";
const ADDRESS_DIALOG_INPUT = "[data-cy=address-dialog-input]";
const ADDRESS_NAMES = "[data-cy=address-name]";
const ENS_NAMES = "[data-cy=ens-name]";
const ACTUAL_ADDRESSES = "[data-cy=actual-address]";
const REMOVE_CHECKBOX = "[data-cy=delete-name-checkbox]";
const CANCEL_BUTTON = "[data-cy=cancel-button]";
const EDIT_BUTTON = "[data-cy=edit-button]";
const EDIT_INPUT = "[data-cy=edit-input] input";

export class AddressBookPage extends BasePage {
  static validateNoAddressesMessage() {
    this.hasText(NO_ADDRESSES_TITLE, "No Addresses Available");
    this.hasText(
      NO_ADDRESSES_MESSAGE,
      "Addresses you have transacted with or imported will appear here."
    );
  }

  static addAddressBookEntry(address: string) {
    this.click(ADD_ADDRESS_BUTTON);
    this.type(ADDRESS_DIALOG_INPUT, address);
  }

  static validateLastAddressBookName(name: string) {
    this.hasText(ADDRESS_NAMES, name, -1);
  }

  static editLastEntry(name: string) {
    this.trigger(ADDRESS_NAMES, "mouseover", -1);
    this.click(EDIT_BUTTON);
    this.clear(EDIT_INPUT);
    this.type(EDIT_INPUT, name);
    this.click(EDIT_BUTTON);
  }

  static removeLastEntry() {
    this.click(REMOVE_ADDRESS_BUTTON);
    this.hasText(REMOVE_ADDRESS_BUTTON, "Confirm removing (0)");
    this.isDisabled(REMOVE_ADDRESS_BUTTON);
    this.click(REMOVE_CHECKBOX, -1);
    this.hasText(REMOVE_ADDRESS_BUTTON, "Confirm removing (1)");
    this.click(REMOVE_ADDRESS_BUTTON);
  }
}
