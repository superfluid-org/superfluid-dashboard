import {Then,Given} from "@badeball/cypress-cucumber-preprocessor";
import {GnosisSafe} from "../../pageObjects/pages/GnosisSafe";
import {Common} from "../../pageObjects/pages/Common";

Given(/^Gnosis safe is open on "([^"]*)"$/, function (network:string) {
    GnosisSafe.openSafeOnNetwork(network)
    GnosisSafe.continueDisclaimer()
});
Given(/^Dashboard page is visible in the gnosis app$/, function () {
    GnosisSafe.validateThatDashboardLoaded()
});
Given(/^User connects their wallet in the gnosis app$/, function () {

});
Then(/^The correct wallet is connected to the gnosis app$/, function () {

});