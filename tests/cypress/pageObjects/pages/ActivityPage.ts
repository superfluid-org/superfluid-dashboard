import { BasePage } from "../BasePage";
import {
  mainNetworks,
  networksBySlug,
  testNetworks,
} from "../../superData/networks";
import { Common } from "./Common";
import { format } from "date-fns";
import { DataTable, Then } from "@badeball/cypress-cucumber-preprocessor";
import superfluidMetadata from "@superfluid-finance/metadata";
import { ethers } from "ethers";

const ACTIVITY_TYPE = "[data-cy=activity]";
const ACTIVITY_NAME = `${ACTIVITY_TYPE} h6`;
const ACTIVITY_TIME = `${ACTIVITY_TYPE} span`;
const ACTIVITY_AMOUNT = "[data-cy=amount]";
const FIAT_AMOUNTS = "[data-cy=fiat-amount]";
const AMOUNT_TO_FROM = "[data-cy=amountToFrom]";
const ALL_ROWS = "[data-cy*=-row]";
const DATE_PICKER_BUTTON = "[data-cy=date-picker-button]";
const MONTH_BACK_BUTTON = "[data-cy=month-back-button]";
const AVAILABLE_DAYS = "[data-cy=available-days]";
const TX_HASH_BUTTONS = "[data-cy=tx-hash-link]";
const TX_HASH_LINKS = "[data-cy=tx-hash-link] a";
const TOKEN_ICONS = "[data-cy=token-icon]";
const SKELETON_ROW = "[data-cy=skeleton-row]";
const NO_ACTIVITY_TITLE = "[data-cy=no-history-title]";
const NO_ACTIVITY_TEXT = "[data-cy=no-history-text]";
const ACTIVITY_FILTER = "[data-cy=activity-filter-button]";
const CONNECT_WALLET_BUTTON = "[data-cy=connect-wallet-button]";

const DISTRIBUTION_ICON = "[data-testid=CallSplitRoundedIcon]";
const SUBSCRIPTION_APPROVED_ICON = "[data-testid=CheckRoundedIcon]";
const SUBSCRIPTION_REJECTED_ICON = "[data-testid=NotInterestedRoundedIcon]";
const SUBSCRIPTION_UPDATED_ICON = "[data-testid=PercentRoundedIcon]";
const INDEX_CREATED_ICON = "[data-testid=AddRoundedIcon]";
const STREAM_CANCELLED_ICON = "[data-testid=CloseRoundedIcon]";
const STREAM_UPDATED_ICON = "[data-testid=EditRoundedIcon]";
const RECEIVE_ICON = "[data-testid=ArrowBackRoundedIcon]";
const SEND_ICON = "[data-testid=ArrowForwardRoundedIcon]";
const WRAP_UNWRAP_ICON = "[data-testid=SwapVertIcon]";
const LIQUIDATED_ICON = "[data-testid=PriorityHighIcon]";
const ADDRESS_COMPONENTS = "[data-cy=address-to-copy]";
const COPY_TOOLTIPS = ".MuiTypography-tooltip";
const NOW_TIMESTAMP = Date.now();

type ActivityData = {
  amount: string;
  activity: string;
  amountToFrom: string;
  timestamp: number;
  txHash: string | undefined;
};

export class ActivityPage extends BasePage {
  static hoverOnFirstAddress() {
    this.trigger(ADDRESS_COMPONENTS, "mouseover");
  }

  static clickOnCopyTooltip() {
    //https://github.com/cypress-io/cypress/issues/18198
    cy.get(COPY_TOOLTIPS).realClick();
  }

  static validateCopyTooltipText(text: string) {
    this.hasText(COPY_TOOLTIPS, text);
  }
  static saveActivityHistoryData() {
    let activityHistoryData: any = { account: {} };
    Common.closeDropdown();
    this.doesNotExist(SKELETON_ROW, 0, { timeout: 60000 });
    cy.wait(30000);
    mainNetworks.forEach((network) => {
      this.recordNetworkData(network, activityHistoryData);
    });
    Common.changeVisibleNetworksTo("testnet");
    this.doesNotExist(SKELETON_ROW, 0, { timeout: 60000 });
    cy.wait(30000);
    testNetworks.forEach((network) => {
      this.recordNetworkData(network, activityHistoryData);
    });
    cy.writeFile("cypress/record/activityData.json", activityHistoryData);
  }

  static recordNetworkData(
    network: { slugName: string },
    json: { account: Record<string, any[]> }
  ) {
    json.account[network.slugName] = [];
    cy.get("body").then((el) => {
      if (el.find(`[data-cy=${network.slugName}-row]`).length > 0) {
        cy.get(`[data-cy=${network.slugName}-row]`).each((row, index) => {
          let savableRow: ActivityData = json.account[network.slugName][index];
          cy.wrap(row)
            .find(TOKEN_ICONS)
            .should("exist")
            .then(() => {
              // To save the correct timestamp
              // You need to remove the formatting from the entries before recording
              savableRow.timestamp = parseInt(
                row.find(`${ACTIVITY_TYPE} span`).last().text()
              );
              savableRow.activity = row
                .find(`${ACTIVITY_TYPE} span`)
                .first()
                .text();
              savableRow.amount = row.find(ACTIVITY_AMOUNT).text();
              savableRow.amountToFrom = row.find(AMOUNT_TO_FROM).text();
              let fullHref = row.find(TX_HASH_LINKS).attr("href");
              savableRow.txHash =
                fullHref?.split("/")[fullHref.split("/").length - 1];
            });
        });
      }
    });
  }

  static changeActivityHistoryDateBack(months: number) {
    this.click(DATE_PICKER_BUTTON);
    for (let i = 0; i < months; i++) {
      this.click(MONTH_BACK_BUTTON);
    }
    this.clickFirstVisible(AVAILABLE_DAYS);
    this.waitForSkeletonsToDisappear();
  }

  static validateActivityHistoryForAccount(
    account: string,
    networkType: string
  ) {
    let testAbleNetworks =
      networkType === "testnet" ? testNetworks : mainNetworks;
    cy.fixture("activityHistoryData").then((data) => {
      testAbleNetworks.forEach((network) => {
        if (data[account][network.slugName][0]) {
          //The entries load faster than the amounts shown, check to make sure all are loaded
          this.hasLength(
            `[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}`,
            data[account][network.slugName].length,
            0,
            { timeout: 60000 }
          );
          data[account][network.slugName].forEach(
            (activity: ActivityData, index: number) => {
              this.hasText(
                `[data-cy=${network.slugName}-row] ${ACTIVITY_AMOUNT}`,
                activity.amount,
                index
              );
              this.get(
                `[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`,
                index
              )
                .find("span")
                .first()
                .should("have.text", activity.activity);
              this.hasText(
                `[data-cy=${network.slugName}-row] ${AMOUNT_TO_FROM}`,
                activity.amountToFrom,
                index
              );
              this.get(
                `[data-cy=${network.slugName}-row] ${ACTIVITY_TYPE}`,
                index
              )
                .find("span")
                .last()
                .should(
                  "have.text",
                  format(activity.timestamp * 1000, "HH:mm")
                );
              this.hasAttributeWithValue(
                `[data-cy=${network.slugName}-row] ${TX_HASH_LINKS}`,
                "href",
                network.getLinkForTransaction(activity.txHash!),
                index
              );
            }
          );
        }
      });
    });
  }

  static validateNoHistoryMessage() {
    this.hasText(NO_ACTIVITY_TITLE, "No Activity History Available");
    this.hasText(
      NO_ACTIVITY_TEXT,
      "Connect wallet or view the dashboard as any address to see transactions."
    );
    this.isVisible(CONNECT_WALLET_BUTTON);
  }

  static openFilter() {
    this.click(ACTIVITY_FILTER);
  }

  static clickFilterCheckbox(toggle: string) {
    this.click(`[data-cy="${toggle}-row"]`);
  }

  static validateNoActivityByTypeShown(type: string) {
    cy.get(ACTIVITY_NAME).each((el) => {
      cy.wrap(el).should("not.have.text", type);
    });
  }

  static validateActivityVisibleByType(type: string) {
    cy.get(`${ACTIVITY_NAME}`).contains(type).should("be.visible");
  }

  static validateActivityVisibleByAddress(address: string) {
    let assertableString = ethers.utils.isAddress(address)
      ? BasePage.shortenHex(address)
      : address;
    cy.get(AMOUNT_TO_FROM).each((el) => {
      cy.log(el.text());
      let regex = new RegExp(`(From|To)${assertableString}`);
      cy.wrap(el.text()).should("match", regex);
    });
  }

  static waitForSkeletonsToDisappear() {
    this.isVisible(SKELETON_ROW);
    this.doesNotExist(SKELETON_ROW);
  }

  static validateNoEntriesVisibleByNetwork(network: string) {
    this.doesNotExist(`[data-cy=${network}-row]`);
  }

  static validateActivityVisibleByNetwork(network: string) {
    this.isVisible(`[data-cy=${network}-row]`);
  }

  static mockActivityRequestTo(activity: string, network: string) {
    cy.fixture("activityHistoryEvents").then((activities) => {
      const networkFromMetadata = superfluidMetadata.getNetworkByChainId(
        networksBySlug.get(network).id
      );
      const subgraphEndpoint =
        networkFromMetadata?.subgraphV1?.satsumaEndpoint ??
        networkFromMetadata?.subgraphV1?.hostedEndpoint;

      cy.intercept("POST", subgraphEndpoint, (req) => {
        if (req.body.operationName === "events") {
          req.continue((res) => {
            if (activity == "all activities") {
              let allEvents = [];
              Object.keys(activities).forEach((activity, i) => {
                activities[activity].forEach((event) => {
                  event.timestamp = NOW_TIMESTAMP / 1000 + i * 60;
                  allEvents.push(event);
                });
              });
              res.body.data.events = allEvents;
            } else {
              if (!activities[activity]) {
                throw new Error(`Unknown activity type: ${activity}`);
              }
              res.body.data.events = activities[activity];
              res.body.data.events.forEach((event) => {
                event.timestamp = NOW_TIMESTAMP;
              });
            }
          });
        }
      });
    });
  }

  static validateMockedActivityHistoryEntry(activity: string, network: string) {
    this.hasText(ACTIVITY_NAME, activity.split("/")[0], -1, { timeout: 30000 });
    this.isVisible(`[data-cy=${networksBySlug.get(network).id}-icon]`);
    this.isVisible(TX_HASH_LINKS);
    this.hasAttributeWithValue(
      TX_HASH_LINKS,
      "href",
      networksBySlug.get(network).getLinkForTransaction("testTransactionHash")
    );
    this.containsText(ACTIVITY_TIME, format(NOW_TIMESTAMP * 1000, "HH:mm"));
    switch (activity.split("/")[0]) {
      case "Liquidated":
        this.isVisible(LIQUIDATED_ICON);
        if (activity.split("/")[1] === "v2") {
          this.hasText(ACTIVITY_NAME, "Send Transfer", 0);
          this.hasText(ACTIVITY_AMOUNT, "1 TDLx", 0);
          this.hasText(
            AMOUNT_TO_FROM,
            `To${this.shortenHex(
              "0x2597c6abba5724fb99f343abddd4569ee4223179"
            )}`,
            0
          );
        }
        let toFrom = activity.split("/")[1] === "sender" ? "From" : "To";
        this.hasText(ACTIVITY_AMOUNT, "-", -1);
        this.hasText(
          AMOUNT_TO_FROM,
          `${toFrom}${this.shortenHex(
            "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
          )}`,
          -1
        );
        break;
      case "Wrap":
        this.isVisible(WRAP_UNWRAP_ICON);
        this.hasText(ACTIVITY_AMOUNT, "-1 TDL");
        this.hasText(AMOUNT_TO_FROM, "+1 TDLx");
        break;
      case "Send Stream":
        this.isVisible(SEND_ICON);
        this.hasText(ACTIVITY_AMOUNT, "1 TDLx/mo");
        this.hasText(
          AMOUNT_TO_FROM,
          `To${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Unwrap":
        let tokenUsed = activity.split("/")[1] === "wrapper" ? "TDL" : "MATIC";
        this.isVisible(WRAP_UNWRAP_ICON);
        this.containsText(ACTIVITY_AMOUNT, `-1 ${tokenUsed}x`);
        this.containsText(AMOUNT_TO_FROM, `+1 ${tokenUsed}`);
        if (tokenUsed === "MATIC") {
          this.isVisible(FIAT_AMOUNTS);
          this.hasLength(FIAT_AMOUNTS, 2);
        }
        break;
      case "Receive Transfer":
        this.hasText(ACTIVITY_AMOUNT, "1 TDLx");
        this.hasText(
          AMOUNT_TO_FROM,
          `From${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Stream Updated":
        this.isVisible(STREAM_UPDATED_ICON);
        this.hasText(ACTIVITY_AMOUNT, "1 TDLx/mo");
        this.hasText(
          AMOUNT_TO_FROM,
          `To${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Receive Stream":
        this.isVisible(RECEIVE_ICON);
        this.hasText(ACTIVITY_AMOUNT, "1 TDLx/mo");
        this.hasText(
          AMOUNT_TO_FROM,
          `From${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Stream Cancelled":
        this.isVisible(STREAM_CANCELLED_ICON);
        this.hasText(ACTIVITY_AMOUNT, "0 TDLx/mo");
        this.hasText(
          AMOUNT_TO_FROM,
          `To${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Subscription Approved":
        this.isVisible(SUBSCRIPTION_APPROVED_ICON);
        this.hasText(ACTIVITY_AMOUNT, " TDLx");
        this.hasText(
          AMOUNT_TO_FROM,
          `${activity.split("/")[1]}${this.shortenHex(
            "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
          )}`
        );
        break;
      case "Subscription Updated":
        this.isVisible(SUBSCRIPTION_UPDATED_ICON);
        this.hasText(ACTIVITY_AMOUNT, "+100 units");
        this.hasText(
          AMOUNT_TO_FROM,
          `${activity.split("/")[1]}${this.shortenHex(
            "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
          )}`
        );
        break;
      case "Subscription Rejected":
        this.isVisible(SUBSCRIPTION_REJECTED_ICON);
        this.hasText(ACTIVITY_AMOUNT, "TDLx");
        this.hasText(
          AMOUNT_TO_FROM,
          `${activity.split("/")[1]}${this.shortenHex(
            "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
          )}`
        );
        break;
      case "Index Created":
        this.isVisible(INDEX_CREATED_ICON);
        this.hasText(ACTIVITY_AMOUNT, "TDLx");
        this.doesNotExist(AMOUNT_TO_FROM);
        break;
      case "Send Transfer":
        this.isVisible(SEND_ICON);
        this.hasText(ACTIVITY_AMOUNT, "1 TDLx");
        this.hasText(
          AMOUNT_TO_FROM,
          `To${this.shortenHex("0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9")}`
        );
        break;
      case "Send Distribution":
        this.isVisible(DISTRIBUTION_ICON);
        this.hasText(ACTIVITY_AMOUNT, "-489 TDLx");
        this.hasText(AMOUNT_TO_FROM, `Approved: 69 TDLxPending: 420 TDLx`);
        break;
      case "Distribution Claimed":
        this.isVisible(DISTRIBUTION_ICON);
        this.hasText(ACTIVITY_AMOUNT, "+1 TDLx");
        this.hasText(
          AMOUNT_TO_FROM,
          `${activity.split("/")[1]}${this.shortenHex(
            "0x9Be85A79D847dFa90584F3FD40cC1f6D4026E2B9"
          )}`
        );
        break;
    }
  }

  static validateActivityHistoryOrder(entries: DataTable) {
    entries.raw().forEach((entry, i) => {
      this.scrollToAndHasText(ACTIVITY_NAME, entry[0], i);
    });
  }

  static validateAddressBookNameInActivityRow(name: string) {
    this.containsText(AMOUNT_TO_FROM, name, undefined, { timeout: 30000 });
  }
}
