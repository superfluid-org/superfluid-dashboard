import {Then,Given} from "@badeball/cypress-cucumber-preprocessor";
import {GnosisSafe} from "../../pageObjects/pages/GnosisSafe";
import {Common} from "../../pageObjects/pages/Common";

Given(/^Gnosis safe Superfluid app is open on "([^"]*)"$/, function (network:string) {
    GnosisSafe.openSafeOnNetwork(network)
    GnosisSafe.continueDisclaimer()
});
Given(/^Dashboard page is visible in the gnosis app$/, function () {
    GnosisSafe.validateThatDashboardLoaded()
});
Given(/^User connects their wallet in the gnosis app$/, function () {
    GnosisSafe.connectGnosisSafeWallet()
});
Then(/^The correct wallet is connected to the gnosis app on "([^"]*)"$/, function (network:string) {
    GnosisSafe.validateCorrectlyConnectedWallet(network)
});
Given(/^Gnosis safe custom app page is open on "([^"]*)"$/, function (network:string) {
    GnosisSafe.openCustomAppPage(network)
});
Given(/^User tries to add Superfluid as a custom app$/, function () {
    GnosisSafe.addCustomSuperfluidApp()
});
Given(/^Manifest is loaded correctly and user accepts the warning and adds the app$/, function () {
    GnosisSafe.validateSuperfluidManifestAndAddApp()
});
Then(/^Superfluid app is visible on the custom app page$/, function () {
    GnosisSafe.validateCustomAppExistsInGnosisSafe()
});