import {After, Before} from "@badeball/cypress-cucumber-preprocessor";

Before({ tags: "@rejected" }, function () {
    //Don't add rejected cases together with transactional ones , as the before hook will change the env value and it should
    //persist for the whole spec file, sadly the cucumber After hook doesn't get executed if a test case fails, so it might reject transactional cases
    //Could add another hook before transactional cases, but will leave as is for now, to not mess around with the env values too much
    cy.log("Cypress will reject HDWalletProvider Transactions!")
    Cypress.env("rejected" , true)
});

//Enable hidden vesting feature
Before({ tags: "@vesting and not @NoCode" }, function () {
    Cypress.env("vesting" , true)
});

Before({ tags: "@workaround" }, function () {
    Cypress.env("workaround" , true)
});

After({ tags: "@workaround" }, function () {
    Cypress.env("workaround" , false)
});

Before({ tags: "@NoCode" }, function () {
    Cypress.env("vesting" , false)
});