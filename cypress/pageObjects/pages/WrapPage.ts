import {BasePage} from "../BasePage";

const WRAP_TAB = "[data-cy=wrap-toggle]";
const UNWRAP_TAB = "[data-cy=unwrap-toggle]";
const WRAP_INPUT = "[data-cy=wrap-input]";
const UNWRAP_INPUT = "[data-cy=unwrap-input]";
const SELECT_TOKEN_BUTTON = "[data-cy=select-token-button]";
const WRAP_PREVIEW = "[data-cy=wrapable-amount] input";
const UNWRAP_PREVIEW = "[data-cy=unwrap-amount-preview] input";
const TOKEN_PAIR = "[data-cy=token-pair]";
const UPGRADE_BUTTON = "[data-cy=upgrade-button]";
const DOWNGRADE_BUTTON = "[data-cy=downgrade-button]";

export class WrapPage extends BasePage {

    static checkIfWrapContainerIsVisible() {
        this.isVisible(WRAP_TAB)
        this.isVisible(UNWRAP_TAB)
        this.isVisible(WRAP_INPUT)
        this.isVisible(SELECT_TOKEN_BUTTON)
        this.isVisible(WRAP_PREVIEW)
        this.isVisible(TOKEN_PAIR)
        this.isVisible(UPGRADE_BUTTON)
    }

    static inputWrapAmount(amount: string) {
        this.type(WRAP_INPUT, amount)
        this.hasValue(WRAP_PREVIEW,amount)
    }

    static upgradeButtonIsDisabled(){
        this.hasText(UPGRADE_BUTTON, "Upgrade to Super Token")
        this.isDisabled(UPGRADE_BUTTON)
    }

    static upgradeButtonAsksForConnection() {
        this.hasText(UPGRADE_BUTTON, "Connect Wallet")
        this.isNotDisabled(UPGRADE_BUTTON)
    }

    static switchToUnwrapTab() {
        this.click(UNWRAP_TAB)
    }

    static switchToWrapTab() {
        this.click(WRAP_TAB)
    }

    static downgradeButtonIsDisabled() {
        this.hasText(DOWNGRADE_BUTTON, "Downgrade")
        this.isDisabled(DOWNGRADE_BUTTON)
    }

    static inputUnwrapAmount(amount: string) {
        this.type(UNWRAP_INPUT, amount)
        this.hasValue(UNWRAP_PREVIEW,amount)
    }

    static downgradeButtonAsksForConnection() {
        this.hasText(DOWNGRADE_BUTTON, "Connect Wallet")
        this.isNotDisabled(DOWNGRADE_BUTTON)
    }
}