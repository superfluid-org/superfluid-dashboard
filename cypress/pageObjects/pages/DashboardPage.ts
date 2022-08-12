import {BasePage} from "../BasePage";
import {mainNetworks, networksBySlug, testNetworks,} from "../../../src/features/network/networks";

const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";
const NETWORK_SNAPSHOT_TABLE_APPENDIX = "-token-snapshot-table]";
const TOKEN_SYMBOLS = "[data-cy=token-symbol]";
const TOKEN_BALANCES = "[data-cy=balance]";
const CANCEL_BUTTON_BACKDROP = "[class*=backdrop]";
const NETWORK_SELECTION_TOGGLE_APPENDIX = "-toggle]";
const NO_BALANCE_WRAP_BUTTON = "[data-cy=no-balance-wrap-button]";
const NO_BALANCE_MESSAGE = "[data-cy=no-balance-message]";
const LOADING_SKELETONS = "[data-cy=loading-skeletons]";
const NET_FLOW_VALUES = "[data-cy=net-flow-value]";
const INFLOW_VALUES = "[data-cy=inflow]";
const OUTFLOW_VALUES = "[data-cy=outflow]";
const SENDER_RECEIVER_ADDRESSES = "[data-cy=sender-receiver-address]";
const STREAM_FLOW_RATES = "[data-cy=flow-rate]";
const START_END_DATES = "[data-cy=start-end-date]";
const CANCEL_BUTTONS = "[data-cy=cancel-button]";
const CANCEL_STREAM_BUTTON = "[data-cy=cancel-stream-button]";
const TOOLTIPS = "[role=tooltip]";
const ROWS_PER_PAGE_ARROW = "[data-testid=ArrowDropDownIcon]";
const DISPLAYED_ROWS = "[class*=displayedRows]";
const NEXT_PAGE_BUTTON = "[data-testid=KeyboardArrowRightIcon]";
const STREAM_ROWS = "[data-cy=stream-row]"
const ALL_BALANCE_ROWS = "[data-cy*=-cell]"

export class DashboardPage extends BasePage {
    static checkIfDashboardConnectIsVisible() {
        this.isVisible(CONNECT_WALLET_BUTTON);
        //2 buttons should be visible, one in the nav drawer, one in the dashboard page
        this.hasLength(CONNECT_WALLET_BUTTON, 2);
    }

    static verifyBalancesForAccount(networkType: string, account: string) {
        let network = networkType === "testnet" ? testNetworks : mainNetworks;
        network.forEach((network) => {
            cy.fixture("networkSpecificData").then((networkSpecificData) => {
                networkSpecificData[network.slugName][account].tokenValues.forEach(
                    (tokenValues: any, index: number) => {
                        cy.get(
                            `[data-cy=${network.slugName}${NETWORK_SNAPSHOT_TABLE_APPENDIX} ${TOKEN_SYMBOLS}`
                        )
                            .eq(index)
                            .should("have.text", tokenValues.token);
                        cy.get(
                            `[data-cy=${network.slugName}${NETWORK_SNAPSHOT_TABLE_APPENDIX} ${TOKEN_BALANCES}`
                        )
                            .eq(index)
                            .should("have.text", `${parseFloat(tokenValues.balance).toFixed(0)} `);
                    }
                );
            });
        });
    }

    static clickNetworkSelectionToogle(network: string) {
        this.click(`[data-cy=${network}${NETWORK_SELECTION_TOGGLE_APPENDIX}`);
    }

    static tokenBalancesAreNotVisible(network: string) {
        this.doesNotExist(`[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX}`);
    }

    static noBalancesScreenIsVisible() {
        this.isVisible(NO_BALANCE_WRAP_BUTTON);
        this.isVisible(NO_BALANCE_MESSAGE);
    }

    static clickNoBalanceWrapButton() {
        this.click(NO_BALANCE_WRAP_BUTTON);
    }

    static waitForBalancesToLoad() {
        this.isVisible(LOADING_SKELETONS);
        cy.get(LOADING_SKELETONS,{ timeout: 45000 }).should("not.exist")
    }

    static clickTokenStreamRow(network: string, token: string) {
        this.click(
            `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] [data-cy=show-streams-button]`
        );
    }

    static validateTokenTotalFlowRates(network: string, token: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let flowValues =
                networkSpecificData[network].ongoingStreamsAccount.tokenValues;
            this.hasText(
                `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${NET_FLOW_VALUES}`,
                flowValues.netFlowRate
            );
            this.hasText(
                `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${OUTFLOW_VALUES}`,
                flowValues.outFlow
            );
            this.hasText(
                `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell] ${INFLOW_VALUES}`,
                flowValues.inFlow
            );
        });
    }

    static validateTokenStreams(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let specificSelector =
                `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${networkSpecificData[
                    network
                    ].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase()}-streams-table] ${STREAM_ROWS} `;
            // The data in tables doesn't show up all at the same time , and skeletons dissapear with the first entry
            // waiting and need to re-check to make sure all streams are loaded
            this.hasLength(specificSelector,networkSpecificData[
                network
                ].ongoingStreamsAccount.tokenValues.streams.length)
            networkSpecificData[
                network
                ].ongoingStreamsAccount.tokenValues.streams.forEach(
                (stream: any, index: number) => {
                    cy.get(specificSelector + STREAM_FLOW_RATES)
                        .eq(index)
                        .should("have.text", stream.flowRate);
                    cy.get(specificSelector + SENDER_RECEIVER_ADDRESSES)
                        .eq(index)
                        .should("have.text", stream.fromTo);
                    cy.get(specificSelector + START_END_DATES)
                        .eq(index)
                        .should("have.text", stream.endDate);
                }
            );
        });
    }

    static clickFirstCancelButton() {
        this.click(CANCEL_BUTTONS);
    }

    static cancelStreamButtonIsVisible() {
        this.isVisible(CANCEL_STREAM_BUTTON);
    }

    static clickOnCancelStreamBackdrop() {
        this.click(CANCEL_BUTTON_BACKDROP);
    }

    static cancelStreamButtonDoesNotExist() {
        this.doesNotExist(CANCEL_STREAM_BUTTON);
    }

    static validateAllCancelButtonsDisabledForToken(network: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            cy.get(
                `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${networkSpecificData[
                    network
                    ].ongoingStreamsAccount.tokenValues.tokenAddress.toLowerCase()}-streams-table] ${STREAM_ROWS} ${CANCEL_BUTTONS}`
            ).each((button: any) => {
                cy.wrap(button).should("have.attr", "disabled");
            });
        });
    }

    static hoverOnFirstCancelButton(network: string) {
        cy.get(
            `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=switch-network-tooltip]`
        )
            .first()
            .trigger("mouseover");
    }

    static validateChangeNetworkTooltip(network: string) {
        let expectedMessage =
            `Switch network to ${networksBySlug.get(network)?.name} to cancel stream`;
        this.isVisible(TOOLTIPS);
        this.hasText(TOOLTIPS, expectedMessage);
    }

    static changeRowsPerPageShown(amount: number) {
        cy.get(ROWS_PER_PAGE_ARROW).parent().click();
        this.click(`[data-value=${amount}]`);
    }

    static checkVisibleRowsAmount(amount: string, token: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let tokenAddress =
                networkSpecificData.gnosis.staticBalanceAccount.tokenValues
                    .filter((values: any) => values.token === token)[0]
                    .tokenAddress.toLowerCase();
            let expectedAmount = parseInt(amount);
            let lastRowData: string[] = [];
            cy.get(`[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`)
                .should("have.length", expectedAmount)
                .and(($el) => {
                    lastRowData.push($el.text());
                });
            cy.wrap(lastRowData).as("lastStreamRows");
            cy.log("@lastStreamRows", lastRowData);
        });
    }

    static switchToNextStreamPage(token: string) {
        cy.fixture("networkSpecificData").then((networkSpecificData) => {
            let tokenAddress =
                networkSpecificData.gnosis.staticBalanceAccount.tokenValues
                    .filter((values: any) => values.token === token)[0]
                    .tokenAddress.toLowerCase();
            cy.get(DISPLAYED_ROWS).then((el) => {
                let totalRows = parseInt(el.text().split(" ")[2]);
                //Some kind of special dash here between visible pages counter "1–"
                let currentPagesVisible = parseInt(
                    el.text().split(" ")[0].replaceAll("1–", "")
                );
                let amountOfExpectedPagesInNewPage =
                    totalRows - currentPagesVisible;

                this.click(NEXT_PAGE_BUTTON);
                this.hasLength(
                    `[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`,
                    amountOfExpectedPagesInNewPage
                );
                let newRows: string[] = [];
                cy.get("@lastStreamRows").then((rows) => {
                    cy.get(`[data-cy="${tokenAddress}-streams-table"] ${STREAM_ROWS}`).then(($el) => {
                        newRows.push($el.text());
                        cy.wrap(newRows).should("not.equal", rows);
                    });
                });
                cy.get(DISPLAYED_ROWS).then((el) => {
                    cy.wrap(el.text()).should(
                        "eq",
                        `${currentPagesVisible + 1}–${totalRows} of ${totalRows}`
                    );
                });
            });
        });
    }

    static openFirstVisibleStreamDetailsPage() {
        this.clickFirstVisible(STREAM_ROWS)
    }

    static checkIfAnyTokenBalancesAreShown() {
        this.isVisible(ALL_BALANCE_ROWS)
    }

    static openIndividualTokenPage(network: string, token: string) {
        this.click(
            `[data-cy=${network}${NETWORK_SNAPSHOT_TABLE_APPENDIX} [data-cy=${token}-cell]`
        );
    }

    static waitForXAmountOfEntries(amount: number) {
        this.hasLength(STREAM_ROWS,amount)
    }
}
