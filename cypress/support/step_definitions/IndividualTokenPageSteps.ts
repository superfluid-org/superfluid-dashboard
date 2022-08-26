import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {IndividualTokenPage} from "../../pageObjects/pages/IndividualTokenPage";

Then(/^Individual token page is open$/, () => {
    IndividualTokenPage.tokenPageIsOpen()
});
Given(/^The first row in the table shows "([^"]*)" "([^"]*)" an "([^"]*)" stream of "([^"]*)" token per month since "([^"]*)"$/,
    (address: string, sendOrReceive: string, ongoing: string, amount: string, fromTo: string) => {
        IndividualTokenPage.validateStreamTableFirstRowValues(address, sendOrReceive, ongoing, amount, fromTo)
    });
Given(/^The first stream row in the table shows "([^"]*)" pending transaction status$/, (message: string) => {
    IndividualTokenPage.validateFirstStreamRowPendingMessage(message)
});
Given(/^The first row does not have a pending transaction status$/, () => {
    IndividualTokenPage.validateNoPendingStatusForFirstStreamRow()
});
Given(/^User opens the distributions tab$/, () => {
    IndividualTokenPage.openDistributionTab()
});
Given(/^The last distribution row is from "([^"]*)" with "([^"]*)" received with "([^"]*)" "([^"]*)"$/, (address: string, amount: string, status: string, when: string) => {
    IndividualTokenPage.validateLastDistributionRow(address, amount, status, when)
});
Given(/^User approves the last index distributions$/, () => {
    IndividualTokenPage.approveLastIndex()
});
Given(/^The last distribution row has got a revoke subscription button$/, () => {
    IndividualTokenPage.validateLastDistRowHasRevokeButton()
});
Given(/^The first distribution row in the table shows "([^"]*)" pending transaction status$/, (message: string) => {
    IndividualTokenPage.validateFirstDistributionRowPendingMessage(message)
});

Given(/^Distribution approval dialog on "([^"]*)" shows up and user closes it$/, (network: string) => {
    IndividualTokenPage.validateApprovalDialogAndCloseIt(network)
});
Given(/^There is no pending status for the first distribution row$/, () => {
    IndividualTokenPage.validateNoPendingStatusForFirstDistributionsRow()
});
Given(/^User revokes the last index distributions$/, () => {
    IndividualTokenPage.revokeLastIndex()
});
Given(/^Distribution revoking dialog on "([^"]*)" shows up and user closes it$/, (network: string) => {
    IndividualTokenPage.validateRevokeDialogAndCloseIt(network)
});
Given(/^The last distribution row has got a approve subscription button$/, () => {
    IndividualTokenPage.validateLastDistRowHasApproveButton()
});
Given(/^User revokes the last index distribution if necessary$/, () => {
    IndividualTokenPage.revokeLastIndexIfNeeded()
});
Given(/^User approves the last index distribution if necessary$/, () => {
    IndividualTokenPage.approveLastIndexIfNeeded()
});
Given(/^The table shows "([^"]*)" total distributions "([^"]*)" approved and "([^"]*)" unapproved$/,  (total:string,approved:string,unapproved:string) => {
    IndividualTokenPage.validateDistributionTableTabAmounts(total,approved,unapproved)
});
Given(/^User opens the approved distribution tab$/,  () => {
    IndividualTokenPage.openApprovedDistributionTab()
});
Given(/^User opens the unapproved distribution tab$/,  () => {
    IndividualTokenPage.openUnapprovedDistributionTab()
});
Then(/^No data row is shown$/,  () => {
    IndividualTokenPage.validateNoRowsShown()
});