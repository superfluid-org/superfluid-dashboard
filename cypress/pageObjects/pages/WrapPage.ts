import {BasePage} from "../BasePage";
import {networksBySlug} from "../../../src/features/network/networks";
import shortenHex from "../../../src/utils/shortenHex";
import { format } from "date-fns";

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
const APPROVAL_MESSAGE = "[data-cy=approval-message]";
const TX_NETWORK = "[data-cy=tx-network]"
const WRAP_MESSAGE = "[data-cy=wrap-message]"
const LOADING_SPINNER = "[role=progressbar]"
const WRAP_MORE_TOKENS_BUTTON = "[data-cy=wrap-more-tokens-button]"
const GO_TO_TOKENS_PAGE_BUTTON = "[data-cy=go-to-tokens-page-button]"
const TX_BROADCASTED_MESSAGE = "[data-cy=broadcasted-message]"
const TX_BROADCASTED_ICON = "[data-cy=broadcasted-icon]"
const DRAWER_TX = "[data-cy=transaction]"
const TX_TYPE = `${DRAWER_TX} > * > span`
const TX_DATE = `${DRAWER_TX} [data-cy=tx-date]`
const TX_HASH = `${DRAWER_TX} [data-cy=tx-hash]`
const TX_HASH_BUTTONS = `${DRAWER_TX} [data-cy=tx-hash-buttons] a`
const RESTORE_BUTTONS = "[data-testid=ReplayIcon]"
const TX_NETWORK_BADGES = `${DRAWER_TX} [data-cy=network-badge-`
const PROGRESS_LINE = "[data-cy=progress-line]"

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
        this.hasText(UPGRADE_BUTTON, "Wrap");
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
        this.hasText(DOWNGRADE_BUTTON, "Unwrap");
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

    static rememberBalanceBeforeAndWrapToken() {
        this.isNotDisabled(UPGRADE_BUTTON)
        cy.get(UNDERLYING_BALANCE).then( el => {
            cy.wrap(el.text().split("Balance: ")[1]).as("underlyingBalanceBeforeWrap")
        })
        cy.get(SUPER_TOKEN_BALANCE).then( el => {
            cy.wrap(el.text()).as("superTokenBalanceBeforeWrap")
        })
        this.click(UPGRADE_BUTTON)
    }

    static validateWrapTxDialogMessage(network: string , amount:string , token:string) {
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_NETWORK , `(${networksBySlug.get(network)?.name})`)
        this.hasText(WRAP_MESSAGE , `You are wrapping ${amount} ${token} to the super token ${token}x.`)
        this.isDisabled(UPGRADE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${UPGRADE_BUTTON} ${LOADING_SPINNER}`)
    }

    static validateWrapTxBroadcastedDialog() {
        cy.get(TX_BROADCASTED_ICON, {timeout: 45000}).should("be.visible")
        this.isVisible(WRAP_MORE_TOKENS_BUTTON)
        this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
        this.hasText(TX_BROADCASTED_MESSAGE , "Transaction broadcasted")
    }

    static clickTxDialogGoToTokensPageButton() {
        this.click(GO_TO_TOKENS_PAGE_BUTTON)
    }

    static validatePendingTransaction(type: string, network: string) {
        this.hasText(TX_TYPE , type)
        this.isVisible("[data-cy=Pending-tx-status]")
        cy.get(TX_HASH_BUTTONS).then(el => {
            el.attr("href")?.substr(-66)
            this.isVisible(TX_HASH)
            this.hasText(TX_HASH,shortenHex(el.attr("href")!.substr(-66)))
        })
        this.isVisible(PROGRESS_LINE)
        this.isVisible(RESTORE_BUTTONS)
        this.hasText(TX_DATE,`${format(Date.now(), "d MMM")} •`)
        this.hasAttributeWithValue(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`, "aria-label" , networksBySlug.get(network)!.name)
        this.isVisible(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`)
    }

    static validateSuccessfulTransaction(type: any, network: any) {
        this.hasText(TX_TYPE , type)
        cy.get("[data-cy=Succeeded-tx-status]" , {timeout: 45000}).should("be.visible")
        cy.get(TX_HASH_BUTTONS).then(el => {
            el.attr("href")?.substr(-66)
            this.isVisible(TX_HASH)
            this.hasText(TX_HASH,shortenHex(el.attr("href")!.substr(-66)))
        })
        this.doesNotExist(PROGRESS_LINE)
        this.isVisible(RESTORE_BUTTONS)
        this.hasText(TX_DATE,`${format(Date.now(), "d MMM")} •`)
        this.hasAttributeWithValue(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]` , "aria-label" , networksBySlug.get(network)!.name)
        this.isVisible(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`)
    }

    static validateBalanceAfterWrapping(token: string,network:string ,amount: string) {
        cy.get("@superTokenBalanceBeforeWrap").then((balanceBefore:any) => {
            let expectedAmount = (parseFloat(balanceBefore) + parseFloat(amount)).toFixed(1).toString()
            cy.wrap(expectedAmount).as("expectedSuperTokenBalance")
            this.hasText(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]` , `${expectedAmount} `)
            cy.get(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`).then(el => {
                cy.wrap(parseFloat(el.text()).toFixed(1)).should("equal" , expectedAmount)
            })
        })
    }

    static validateWrapAmountAfterRestoration(amount: string) {
        this.hasValue(`${WRAP_INPUT} input`,amount)
    }

    static validateTokenBalancesAfterWrap(amount: string) {
        cy.get("@expectedSuperTokenBalance").then((balance:any) => {
            this.hasText(SUPER_TOKEN_BALANCE,`${balance} `)
        })
        cy.get("@underlyingBalanceBeforeWrap").then((balanceBefore:any) => {
            let expectedAmount = (parseFloat(balanceBefore) - parseFloat(amount)).toFixed(4).toString().substr(0,5)
            this.containsText(UNDERLYING_BALANCE , `Balance: ${expectedAmount}`)
        })
        }
}
