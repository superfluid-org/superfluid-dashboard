import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";
import { SettingsPage } from "../../pageObjects/pages/SettingsPage";

Then(/^"([^"]*)" is visible in the settings page$/, function (address: string) {
  SettingsPage.validateVisibleAddress(address);
});
Given(/^User clicks on the notification button$/, function () {
  SettingsPage.clickNotificationButton();
});
Then(/^Settings page wallet not connected screen is visible$/, function () {
  SettingsPage.validateNotConnectedScreen();
});
