import {ethers} from "ethers";
import { JsonRpcProvider } from '@ethersproject/providers'

// Alternatively you can use CommonJS syntax:
// require('./commands')
const TEST_PRIVATE_KEY = '47d567438b9ec683a9d1828c784d980ad6fe9cd3fcf4fcf6d5c357b534537468'
import HDWalletProvider from "@truffle/hdwallet-provider";

Cypress.Commands.add("visitWithProvider" , (url) => {
    cy.visit(url, {
        onBeforeLoad(win) {
            // const provider = new JsonRpcProvider('https://rpc-endpoints.superfluid.dev/polygon-mainnet', "matic")
            // const wallet = new ethers.Wallet(TEST_PRIVATE_KEY,provider);

            const provider = new HDWalletProvider({
                privateKeys: [TEST_PRIVATE_KEY],
                url: "https://rpc-endpoints.superfluid.dev/polygon-mainnet",
                chainId: 137,
                pollingInterval: 10000,
            });
            HDWalletProvider.prototype.on = function (event, listener) {
                this.engine.on(event, listener);
            };
            const web3Signer = new ethers.providers.Web3Provider(provider).getSigner();
            //win.web3 = new Web3(provider);
            win.mockSigner = web3Signer;
        }
    })
})

