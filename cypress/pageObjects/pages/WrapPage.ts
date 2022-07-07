import {BasePage} from "../BasePage";
import {networksBySlug} from "../../../src/features/network/networks";

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
const CHANGE_NETWORK_BUTTON = "[data-cy=change-network-button]";
const STOP_VIEWING_BUTTON = "[data-cy=view-mode-button]";
const CONNECT_WALLET = "[data-cy=connect-wallet]";
const UNDERLYING_BALANCE = "[data-cy=underlying-balance]";
const SUPER_TOKEN_BALANCE = "[data-cy=balance]";
const TOKEN_SELECT_NAME = "[data-cy=token-symbol-and-name] p";
const TOKEN_SELECT_SYMBOL = "[data-cy=token-symbol-and-name] span";
const TOKEN_SELECT_BALANCE = "[data-cy=token-balance]";

export class WrapPage extends BasePage {
    static checkIfWrapContainerIsVisible() {
        this.isVisible(WRAP_TAB);
        this.isVisible(UNWRAP_TAB);
        this.isVisible(WRAP_INPUT);
        this.isVisible(SELECT_TOKEN_BUTTON);
        this.isVisible(WRAP_PREVIEW);
        this.isVisible(TOKEN_PAIR);
        this.isVisible(UPGRADE_BUTTON);
    }

    static clearAndInputWrapAmount(amount: string) {
        this.clear(WRAP_INPUT)
        this.type(WRAP_INPUT, amount);
        this.hasValue(WRAP_PREVIEW, amount);
    }

    static upgradeButtonIsDisabled() {
        this.hasText(UPGRADE_BUTTON, "Upgrade to Super Token");
        this.isDisabled(UPGRADE_BUTTON);
    }

    static upgradeButtonAsksForConnection() {
        this.hasText(UPGRADE_BUTTON, "Connect Wallet");
        this.isNotDisabled(UPGRADE_BUTTON);
    }

    static switchToUnwrapTab() {
        this.click(UNWRAP_TAB);
    }

    static switchToWrapTab() {
        this.click(WRAP_TAB);
    }

    static downgradeButtonIsDisabled() {
        this.hasText(DOWNGRADE_BUTTON, "Downgrade");
        this.isDisabled(DOWNGRADE_BUTTON);
    }

    static clearAndInputUnwrapAmount(amount: string) {
        this.clear(UNWRAP_INPUT)
        this.type(UNWRAP_INPUT, amount);
        this.hasValue(UNWRAP_PREVIEW, amount);
    }

    static downgradeButtonAsksForConnection() {
        this.hasText(DOWNGRADE_BUTTON, "Connect Wallet");
        this.isNotDisabled(DOWNGRADE_BUTTON);
    }

    static changeNetworkButtonShowsCorrectNetwork(network: string) {
        this.hasText(
            CHANGE_NETWORK_BUTTON,
            `Change Network to ${networksBySlug.get(network)?.name}`
        );
    }

    static isStopViewingButtonVisible() {
        this.isVisible(STOP_VIEWING_BUTTON);
    }

    static clickStopViewingButton() {
        this.click(STOP_VIEWING_BUTTON);
    }

    static connectWalletButtonIsVisible() {
        this.isVisible(CONNECT_WALLET);
    }

    static verifyWrapPageSelectedToken(token: string) {
        this.contains(SELECT_TOKEN_BUTTON, token.slice(0, -1));
    }

    static validateWrapPageTokenBalance(token: string, network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let filteredToken = networkSpecificData[
                network
                ].staticBalanceAccount.tokenValues.filter(
                (values: any) => values.underlyingTokenSymbol === token
            )[0];
            this.hasText(
                UNDERLYING_BALANCE,
                `Balance: ${parseFloat(filteredToken.underlyingBalance).toFixed(4)}`
            );
            this.hasText(SUPER_TOKEN_BALANCE, filteredToken.balance);
        });
    }

    static clickSelectTokenButton() {
        this.click(SELECT_TOKEN_BUTTON);
    }

    static validateWrapTokenSelectionBalances(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            networkSpecificData[network].staticBalanceAccount.tokenValues.forEach(
                (values: any) => {
                    let specificToken =
                        `[data-cy=${values.underlyingTokenSymbol}-list-item] `;
                    if (values.underlyingBalance) {
                        this.scrollToAndhasText(
                            specificToken + TOKEN_SELECT_SYMBOL,
                            values.underlyingTokenSymbol
                        );
                        this.scrollToAndhasText(
                            specificToken + TOKEN_SELECT_NAME,
                            values.underlyingTokenName
                        );
                        if (values.balance === "0") {
                            this.scrollToAndhasText(
                                specificToken + TOKEN_SELECT_BALANCE,
                                "0"
                            );
                        } else {
                            cy.get(specificToken + TOKEN_SELECT_BALANCE)
                                .scrollIntoView()
                                .invoke("text")
                                .should((text) => {
                                    expect(parseFloat(text.replace("~", ""))).to.be.closeTo(
                                        Number(parseFloat(values.underlyingBalance).toFixed(8)),
                                        0.000001
                                    );
                                });
                        }
                    }
                }
            );
        });
    }

    static validateNoAnimationsInUnderlyingTokenSelection() {
        cy.get("[data-cy*=list-item]").each((el) => {
            cy.wrap(el).find("[data-cy=animation]").should("not.exist");
        });
    }

    static chooseTokenToWrap(token: string) {
        this.click(`[data-cy=${token}-list-item]`);
    }

    static validateUnwrapTokenSelectionBalances(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            networkSpecificData[network].staticBalanceAccount.tokenValues.forEach(
                (values: any) => {
                    let specificToken = `[data-cy=${values.token}-list-item] `;
                    this.scrollToAndhasText(
                        specificToken + TOKEN_SELECT_SYMBOL,
                        values.token
                    );
                    this.scrollToAndhasText(
                        specificToken + TOKEN_SELECT_NAME,
                        values.tokenName
                    );
                    if (values.balance === "0") {
                        this.scrollToAndhasText(specificToken + TOKEN_SELECT_BALANCE, "0");
                    } else {
                        cy.get(specificToken + TOKEN_SELECT_BALANCE)
                            .scrollIntoView()
                            .invoke("text")
                            .should((text) => {
                                expect(parseFloat(text.replace("~", ""))).to.be.closeTo(
                                    Number(parseFloat(values.balance).toFixed(8)),
                                    0.000001
                                );
                            });
                    }
                }
            );
        });
    }
}
