import {
  DataTable,
  Given,
  Then,
} from "@badeball/cypress-cucumber-preprocessor";
import { ActivityPage } from "../../pageObjects/pages/ActivityPage";

Given(/^RECORD ACTIVITY HISTORY DATA$/, () => {
  ActivityPage.saveActivityHistoryData();
});
Given(
  /^User changes the activity history filter to (\d+) months before$/,
  (months: number) => {
    ActivityPage.changeActivityHistoryDateBack(months);
  }
);
Given(
  /^Activity history data for "([^"]*)" is shown correctly on "([^"]*)"$/,
  (account: string, networkType: string) => {
    ActivityPage.validateActivityHistoryForAccount(account, networkType);
  }
);
Then(/^No activity history message is shown$/, () => {
  ActivityPage.validateNoHistoryMessage();
});
Given(/^User opens activity filter$/, () => {
  ActivityPage.openFilter();
});
Given(
  /^User clicks on the "([^"]*)" toggle in the activity filter$/,
  (toggle: string) => {
    ActivityPage.clickFilterToogle(toggle);
  }
);
Then(
  /^No "([^"]*)" activities are shown in the activity history$/,
  (type: string) => {
    ActivityPage.validateNoActivityByTypeShown(type);
  }
);
Then(
  /^Activity history entries with "([^"]*)" are visible$/,
  (type: string) => {
    ActivityPage.validateActivityVisibleByType(type);
  }
);
Then(
  /^Only the activity history entries with "([^"]*)" are shown$/,
  (address: string) => {
    ActivityPage.validateActivityVisibleByAddress(address);
  }
);

Given(/^User waits for the activity history to load$/, () => {
  ActivityPage.waitForSkeletonsToDisappear();
});
Then(/^No "([^"]*)" activity rows are visible$/, (network: string) => {
  ActivityPage.validateNoEntriesVisibleByNetwork(network);
});
Then(/^Activity rows for "([^"]*)" are visible$/, (network: string) => {
  ActivityPage.validateActivityVisibleByNetwork(network);
});
Given(
  /^Activity history request is mocked to "([^"]*)" on "([^"]*)"$/,
  function (activity: string, network: string) {
    ActivityPage.mockActivityRequestTo(activity, network);
  }
);
Then(
  /^Mocked "([^"]*)" entry on "([^"]*)" is shown in the activity history$/,
  function (activity: string, network: string) {
    ActivityPage.validateMockedActivityHistoryEntry(activity, network);
  }
);
Then(
  /^Mocked activity history entries are visible in this order$/,
  function (entries: DataTable) {
    ActivityPage.validateActivityHistoryOrder(entries);
  }
);
Then(
  /^The activity rows address shows up as "([^"]*)"$/,
  function (name: string) {
    ActivityPage.validateAddressBookNameInActivityRow(name);
  }
);
