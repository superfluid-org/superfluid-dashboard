import {BasePage} from "../BasePage";
import {networksBySlug} from "../../superData/networks";
import {format} from "date-fns";

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
const TX_TYPE = `${DRAWER_TX} h6`
const TX_DATE = `${DRAWER_TX} [data-cy=tx-date]`
const TX_HASH = `${DRAWER_TX} [data-cy=tx-hash]`
const TX_HASH_BUTTONS = `${DRAWER_TX} [data-cy=tx-hash-buttons] a`
const RESTORE_BUTTONS = "[data-testid=ReplayIcon]"
const TX_NETWORK_BADGES = `${DRAWER_TX} [data-cy=network-badge-`
const PROGRESS_LINE = "[data-cy=progress-line]"
const UNWRAP_MESSAGE = "[data-cy=unwrap-message]"
const OK_BUTTON = "[data-cy=ok-button]"
const TX_DRAWER_BUTTON = "[data-cy=tx-drawer-button]"
const APPROVE_ALLOWANCE_BUTTON = "[data-cy=approve-allowance-button]"
const APPROVE_ALLOWANCE_MESSAGE = "[data-cy=allowance-message]"
const WRAP_SCREEN = "[data-cy=wrap-screen]"
const MAIN_BUTTONS = `${WRAP_SCREEN} [data-cy*=e-button]`
const MAX_BUTTON = "[data-cy=max-button]"
const TOKEN_SEARCH_NO_RESULTS = "[data-cy=token-search-no-results]"

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
        this.clear(`${WRAP_INPUT} input`)
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
        this.isVisible(UNWRAP_INPUT)
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
        cy.get(`[data-cy=${token}-list-item]`, {timeout: 60000}).click()
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
        cy.get(SELECT_TOKEN_BUTTON).then(el => {
            cy.wrap(el.text()).as("lastWrappedToken")
        })
        cy.get(UNDERLYING_BALANCE).then(el => {
            cy.wrap(el.text().split("Balance: ")[1]).as("underlyingBalanceBeforeWrap")
        })
        cy.get(SUPER_TOKEN_BALANCE).then(el => {
            cy.wrap(el.text()).as("superTokenBalanceBeforeWrap")
        })
        this.click(UPGRADE_BUTTON)
    }

    static rememberBalanceBeforeAndUnwrapToken() {
        this.isNotDisabled(DOWNGRADE_BUTTON)
        cy.get(UNDERLYING_BALANCE).then(el => {
            cy.wrap(el.text().split("Balance: ")[1]).as("underlyingBalanceBeforeUnwrap")
        })
        cy.get(SUPER_TOKEN_BALANCE).then(el => {
            cy.wrap(el.text()).as("superTokenBalanceBeforeUnwrap")
        })
        cy.get(SELECT_TOKEN_BUTTON).then(el => {
            cy.wrap(el.text()).as("lastUnwrappedToken")
        })
        this.click(DOWNGRADE_BUTTON)
    }

    static validateWrapTxDialogMessage(network: string, amount: string, token: string) {
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_NETWORK, `(${networksBySlug.get(network)?.name})`)
        this.hasText(WRAP_MESSAGE, `You are wrapping ${amount} ${token} to the super token ${token}x.`)
        this.isDisabled(UPGRADE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${UPGRADE_BUTTON} ${LOADING_SPINNER}`)
    }

    static validateWrapTxBroadcastedDialog() {
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.isVisible(WRAP_MORE_TOKENS_BUTTON)
        this.isVisible(GO_TO_TOKENS_PAGE_BUTTON)
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
    }

    static clickTxDialogGoToTokensPageButton() {
        this.click(GO_TO_TOKENS_PAGE_BUTTON)
    }

    static validatePendingTransaction(type: string, network: string) {
        cy.get(TX_TYPE).first().should("have.text", type)
        cy.get(DRAWER_TX).first().find("[data-cy=Pending-tx-status]").should("be.visible")
        cy.get(TX_HASH_BUTTONS).first().then(el => {
            el.attr("href")?.substr(-66)
            cy.get(TX_HASH).should("be.visible")
            cy.get(TX_HASH).first().should("have.text", BasePage.shortenHex(el.attr("href")!.substr(-66)))
        })
        this.isVisible(PROGRESS_LINE)
        cy.get(TX_DATE).first().should("have.text", `${format(Date.now(), "d MMM")} •`)
        cy.get(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`).first().should("have.attr", "aria-label", networksBySlug.get(network)!.name)
        cy.get(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`).first().should("be.visible")
    }

    static validateSuccessfulTransaction(type: any, network: any) {
        cy.get(TX_TYPE).first().should("have.text", type)
        cy.get(DRAWER_TX).first().find("[data-cy=Succeeded-tx-status]", {timeout: 60000}).should("be.visible")
        cy.get(TX_HASH_BUTTONS).first().then(el => {
            el.attr("href")?.substr(-66)
            cy.get(TX_HASH).should("be.visible")
            cy.get(TX_HASH).first().should("have.text", BasePage.shortenHex(el.attr("href")!.substr(-66)))
        })
        this.doesNotExist(PROGRESS_LINE)
        cy.get(TX_DATE).first().should("have.text", `${format(Date.now(), "d MMM")} •`)
        cy.get(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`).first().should("have.attr", "aria-label", networksBySlug.get(network)!.name)
        cy.get(`${TX_NETWORK_BADGES}${networksBySlug.get(network)!.id}]`).first().should("be.visible")
    }

    static validateBalanceAfterWrapping(token: string, network: string, amount: string) {
        cy.get("@superTokenBalanceBeforeWrap").then((balanceBefore: any) => {
            let expectedAmount = (parseFloat(balanceBefore) + parseFloat(amount)).toFixed(1).toString()
            cy.wrap(expectedAmount).as("expectedSuperTokenBalance")
            this.hasText(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`, `${expectedAmount} `)
            cy.get(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`).then(el => {
                cy.wrap(parseFloat(el.text()).toFixed(1)).should("equal", expectedAmount)
            })
        })
    }

    static validateBalanceAfterUnwrapping(token: string, network: string, amount: string) {
        cy.get("@superTokenBalanceBeforeUnwrap").then((balanceBefore: any) => {
            let expectedAmount = (parseFloat(balanceBefore) - parseFloat(amount)).toFixed(1).toString()
            cy.wrap(expectedAmount).as("expectedSuperTokenBalance")
            this.hasText(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`, `${expectedAmount} `)
            cy.get(`[data-cy=${network}-token-snapshot-table] [data-cy=${token}-cell] [data-cy=balance]`).then(el => {
                cy.wrap(parseFloat(el.text()).toFixed(1)).should("equal", expectedAmount)
            })
        })
    }

    static validateWrapFieldInputAmount(amount: string) {
        this.hasValue(`${WRAP_INPUT} input`, amount)
    }

    static validateTokenBalancesAfterWrap(amount: string) {
        cy.get("@expectedSuperTokenBalance").then((balance: any) => {
            this.hasText(SUPER_TOKEN_BALANCE, `${balance} `)
        })
        cy.get("@underlyingBalanceBeforeWrap").then((balanceBefore: any) => {
            let expectedAmount = (parseFloat(balanceBefore) - parseFloat(amount)).toFixed(4).toString().substr(0, 4)
            this.containsText(UNDERLYING_BALANCE, `Balance: ${expectedAmount}`)
        })
        cy.get("@lastWrappedToken").then((lastToken: any) => {
            this.hasText(SELECT_TOKEN_BUTTON, lastToken)
        })
    }

    static validateUnwrapTxDialogMessage(network: string, amount: string, token: string) {
       // Sometimes the tx gets broadcasted too fast and this check adds some flakiness so disabling it for now
       // this.hasText(UNWRAP_MESSAGE, `You are unwrapping  ${amount} ${token}x to the underlying token ${token}.`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_NETWORK, `(${networksBySlug.get(network)?.name})`)
        this.isDisabled(DOWNGRADE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${DOWNGRADE_BUTTON} ${LOADING_SPINNER}`)
    }

    static validateUnwrapTxBroadcastedMessage() {
        this.hasText(TX_BROADCASTED_MESSAGE, "Transaction broadcasted")
        cy.get(TX_BROADCASTED_ICON, {timeout: 60000}).should("be.visible")
        this.isVisible(OK_BUTTON)
    }

    static validateUnwrapInputFieldAmount(amount: string) {
        this.hasValue(`${UNWRAP_INPUT} input`, amount)
    }

    static validateTokenBalancesAfterUnwrap(amount: string) {
        cy.get("@expectedSuperTokenBalance").then((balance: any) => {
            this.hasText(SUPER_TOKEN_BALANCE, `${balance} `)
        })
        cy.get("@underlyingBalanceBeforeUnwrap").then((balanceBefore: any) => {
            let expectedAmount = (parseFloat(balanceBefore) + parseFloat(amount)).toFixed(4).toString().substr(0, 4)
            this.containsText(UNDERLYING_BALANCE, `Balance: ${expectedAmount}`)
        })
        cy.get("@lastUnwrappedToken").then((lastToken: any) => {
            this.hasText(SELECT_TOKEN_BUTTON, lastToken)
        })
    }

    static openTxDrawer() {
        this.click(TX_DRAWER_BUTTON)
    }

    static clickOkButton() {
        this.click(OK_BUTTON)
    }

    static approveTokenSpending(token: string) {
        cy.get(APPROVE_ALLOWANCE_BUTTON, {timeout: 60000}).should("be.visible")
        this.hasText(APPROVE_ALLOWANCE_BUTTON, `Allow Superfluid Protocol to wrap your ${token}`)
        this.click(APPROVE_ALLOWANCE_BUTTON)
    }

    static validateApprovalDialog(network: string, amount: string, token: string) {
        this.hasText(APPROVE_ALLOWANCE_MESSAGE, `You are approving additional allowance of ${amount} ${token} for Superfluid Protocol to use.`)
        this.hasText(APPROVAL_MESSAGE, "Waiting for transaction approval...")
        this.hasText(TX_NETWORK, `(${networksBySlug.get(network)?.name})`)
        this.isDisabled(UPGRADE_BUTTON)
        this.isVisible(LOADING_SPINNER)
        this.exists(`${APPROVE_ALLOWANCE_BUTTON} ${LOADING_SPINNER}`)
    }

    static isRestoreButtonVisible() {
        cy.get(DRAWER_TX).first().find(RESTORE_BUTTONS).should("be.visible")
    }

    static doesRestoreButtonExist() {
        cy.get(DRAWER_TX).first().find(RESTORE_BUTTONS).should("not.exist")
    }

    static approveTokenIfNeeded(token: string, network: string, amount: string) {
        cy.get(MAX_BUTTON).should("be.visible")
        cy.get(MAIN_BUTTONS).should("be.enabled")
        cy.get(MAIN_BUTTONS).first().then(el => {
            if (el.text() === `Allow Superfluid Protocol to wrap your ${token}`) {
                this.approveTokenSpending(token)
                this.validateApprovalDialog(network, amount, token)
                this.validateUnwrapTxBroadcastedMessage()
                this.clickOkButton()
                this.validatePendingTransaction("Approve Allowance", network)
                this.doesRestoreButtonExist()
                this.validateSuccessfulTransaction("Approve Allowance", network)
                this.doesRestoreButtonExist()
            }
        })
    }

    static validateWrapPageNativeTokenBalance(token: string, account: string, network: string) {
        cy.fixture("nativeTokenBalances").then(fixture => {
            cy.get(UNDERLYING_BALANCE , {timeout: 60000}).should("have.text",`Balance: ${fixture[account][network][token].underlyingBalance}`)
            cy.get(SUPER_TOKEN_BALANCE , {timeout: 60000}).should("have.text",`${fixture[account][network][token].superTokenBalance} `)
        })
    }

    static validateNoTokenMessageNotVisible() {
        this.doesNotExist(TOKEN_SEARCH_NO_RESULTS)
    }

    static validateNativeTokenBalanceInTokenList(token: string, account: string, network: string) {
        cy.fixture("nativeTokenBalances").then(fixture => {
            let expectedString = fixture[account][network][token].underlyingBalance === "0" ? fixture[account][network][token].underlyingBalance : `~${fixture[account][network][token].underlyingBalance}`
            cy.get(`[data-cy=${token}-list-item]`).scrollIntoView()
            this.hasText(`[data-cy=${token}-list-item] ${TOKEN_SELECT_BALANCE}`,expectedString)
        })
    }
}
