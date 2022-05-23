// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";

Cypress.Commands.add(
    "openSuperfluidMockedWeb3",
    () => {
        cy.visit("/", {
            onBeforeLoad(win) {

                const provider = new HDWalletProvider({
                    privateKeys: ["f71d82b0cf12f254e05ea19698332588a7c4f3a4916516d58e8b55c2681c09f6"],
                    url: "https://rpc-endpoints.superfluid.dev/matic",
                    chainId: 137,
                    pollingInterval: 10000,
                });
                HDWalletProvider.prototype.on = function (event, listener) {
                    this.engine.on(event, listener);
                };
                console.log(win.web3)
                win.web3 = new Web3(provider);
            },
        });
    }
);