import {Given,Then} from "cypress-cucumber-preprocessor/steps";
import {WrapPage} from "../../pageObjects/pages/WrapPage";

Given(/^User inputs "([^"]*)" into the wrap field$/, function (amount:string) {
    WrapPage.inputWrapAmount(amount)
});

Then(/^User switches to unwrap tab$/, function () {
    WrapPage.switchToUnwrapTab()
});

Then(/^User inputs "([^"]*)" into the unwrap field$/, function (amount:string) {
    WrapPage.inputUnwrapAmount(amount)
});
Given(/^The upgrade button is disabled$/, function () {
    WrapPage.upgradeButtonIsDisabled()
});
Then(/^The upgrade button is enabled and asks user to connect a wallet$/, function () {
    WrapPage.upgradeButtonAsksForConnection()
});
Then(/^The downgrade button is disabled$/, function () {
    WrapPage.downgradeButtonIsDisabled()
});
Then(/^The downgrade button is enabled and asks user to connect a wallet$/, function () {
    WrapPage.downgradeButtonAsksForConnection()
});
Then(/^User switches to wrap tab$/, function () {
    WrapPage.switchToWrapTab()
});