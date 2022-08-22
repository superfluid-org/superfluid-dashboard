// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import { injected } from "./injectedProvider"
//import "@cypress/code-coverage/support";
import {ethers} from "ethers";
import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'

// Alternatively you can use CommonJS syntax:
// require('./commands')
const TEST_PRIVATE_KEY = '47d567438b9ec683a9d1828c784d980ad6fe9cd3fcf4fcf6d5c357b534537468'

Cypress.Commands.add("visitWithProvider" , (url) => {
    cy.visit(url, {
        onBeforeLoad(win) {
            // const wallet = new ethers.Wallet(TEST_PRIVATE_KEY);
            // const provider = new JsonRpcProvider('https://rpc-endpoints.superfluid.dev/polygon-mainnet', "matic")
            // const eip1193Bridge = new Eip1193Bridge(provider,wallet);
            // win.ethereum = eip1193Bridge as any;
            win.ethereum = injected
        }
    })
})


Cypress.on("uncaught:exception", (err, runnable) => {
    if (err.name === "ConnectorNotFoundError" ||
        err.message.includes("The method eth_call is not implemented by the mock provider.")) {
        return false
    }
});