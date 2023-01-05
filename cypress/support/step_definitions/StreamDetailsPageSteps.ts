import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {StreamDetailsPage} from "../../pageObjects/pages/StreamDetailsPage";

Then(/^The token icon has got an animation around it$/, () => {
    StreamDetailsPage.validateTokenAnimation()
});
Then(/^The streamed amount is not flowing$/, () => {
    StreamDetailsPage.validateFlowNotMoving()
});
Then(/^Ended stream data is shown correctly$/, () => {
    StreamDetailsPage.validateEndedStreamData()
});
Then(/^Cancelled stream message is visible$/, () => {
    StreamDetailsPage.validateEndedStreamMessage()
});
Then(/^The streamed amount is flowing$/, () => {
    StreamDetailsPage.validateFlowMovingUp()
});
Then(/^Ongoing stream data is shown correctly$/, () => {
    StreamDetailsPage.validateOngoingFlowData()
});
Given(/^Receiver and Sender copy button an hyperlink tooltips show up when user hovers on them$/, () => {
    StreamDetailsPage.validateReceiverAndSenderTooltips()
});
Given(/^Receiver and Sender transaction hash buttons have the correct explorer link$/, () => {
    StreamDetailsPage.validateReceiverSenderExplorerLinks()
});
Given(/^The address gets copied when user clicks on the Receiver and Sender copy buttons$/, () => {
    StreamDetailsPage.clickReceiverSenderCopyButtonsAndValidateTooltip()
});
Given(/^The stream transaction hash copy and explorer link tooltips show up$/, () => {
    StreamDetailsPage.validateTxHashTooltips()
});
Given(/^The transaction hash gets copied when user clicks on the copy button$/, () => {
    StreamDetailsPage.validateTxHashTooltipsAfterClick()
});
Given(/^The transaction hash hyperlink has got the correct explorer link$/, () => {
    StreamDetailsPage.validateTxHashHyperlink()
});
Given(/^The stream copy button tooltips show up when user clicks on them$/, () => {
    StreamDetailsPage.validateStreamCopyButtonTooltipsAndLink()
});
Given(/^The social network tooltips show up and have the correct links$/, () => {
    StreamDetailsPage.validateSocialNetworkTooltipsAndLinks()
});
Given(/^User clicks on the back button$/, () => {
    StreamDetailsPage.clickBackButton()
});
Then(/^Close\-ended stream data is shown correctly$/, function () {
    StreamDetailsPage.validateCloseEndedStreamData()
});