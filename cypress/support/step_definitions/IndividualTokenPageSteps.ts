import {Then,Given} from "@badeball/cypress-cucumber-preprocessor";
import {IndividualTokenPage} from "../../pageObjects/pages/IndividualTokenPage";

Then(/^Individual token page is open$/,  () => {
    IndividualTokenPage.tokenPageIsOpen()
});
Given(/^The first row in the table shows "([^"]*)" "([^"]*)" an "([^"]*)" stream of "([^"]*)" token per month since "([^"]*)"$/,
    (address:string,sendOrReceive:string,ongoing:string,amount:string,fromTo:string) => {
    IndividualTokenPage.validateStreamTableFirstRowValues(address,sendOrReceive,ongoing,amount,fromTo)
});
Given(/^The first row in the table shows "([^"]*)" pending transaction status$/,  (message:string) => {
    IndividualTokenPage.validateFirstRowPendingMessage(message)
});
Given(/^The first row does not have a pending transaction status$/,  () => {
    IndividualTokenPage.validateNoPendingStatusForFirstRow()
});