import {Then} from "@badeball/cypress-cucumber-preprocessor";
import {IndividualTokenPage} from "../../pageObjects/pages/IndividualTokenPage";

Then(/^Individual token page is open$/,  () => {
    IndividualTokenPage.tokenPageIsOpen()
});
