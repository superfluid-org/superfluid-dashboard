import {Then,Given} from "@badeball/cypress-cucumber-preprocessor";
import {mockingPage} from "../../pageObjects/pages/mockingPage";

Given(/^I try to visit the page with a connected wallet using ethers and web3 providers$/, function () {
    mockingPage.visitAndDoRealTxWithEthers()
});