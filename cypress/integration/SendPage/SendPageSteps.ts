import {Given,Then} from "cypress-cucumber-preprocessor/steps";
import {SendPage} from "../../pageObjects/pages/SendPage";

Given(/^User fills all stream inputs$/, function () {
    SendPage.inputStreamTestData();
});

Given(/^Stream preview is shown correctly$/, function () {
    SendPage.checkIfStreamPreviewIsCorrect();
});
Given(/^User accepts the risk warning$/, function () {
    SendPage.acceptRiskWarning();
});

Given(/^Stream ending on and amount per second is shown correctly$/, function () {
    SendPage.validateStreamEndingAndAmountPerSecond();
});
Then(/^Send button is enabled and asks user to Connect their wallet$/, function () {
    SendPage.checkConnectWalletButton();
});
Given(/^User searches for "([^"]*)" as a receiver$/, function (ensNameOrAddress:string) {
    SendPage.searchForReceiver(ensNameOrAddress);
});
Then(/^"([^"]*)" is visible in the ENS recipient results$/, function (result:string) {
    SendPage.recipientEnsResultsContain(result)
});
Then(/^User selects the first ENS recipient result$/, function () {
    SendPage.selectFirstENSResult();
});

Then(/^Chosen ENS receiver wallet address shows ([^"]*) and ([^"]*)$/, function (name:string, address:string) {
    SendPage.chosenEnsReceiverWalletAddress(name, address);
});
Then(/^User clears the receiver field with the close button$/, function () {
    SendPage.clearReceiverField();
});