import {BasePage} from "../BasePage";
// @ts-ignore
import { mock,trigger } from '@depay/web3-mock'
// @ts-ignore
import { wallets } from '@depay/web3-wallets'
import { Ethereum } from "@wagmi/core"
import {ethers} from "ethers";
import HDWalletProvider = require("@truffle/hdwallet-provider");
import Web3 from "web3";


export class mockingPage extends BasePage {


    static visitAndDoRealTxWithEthers() {
        let rpc = "https://rpc-endpoints.superfluid.dev/polygon-mainnet"
        let privateKey = "47d567438b9ec683a9d1828c784d980ad6fe9cd3fcf4fcf6d5c357b534537468"
        cy.visit("/", {
            onBeforeLoad(win) {
                win.ethereum = undefined;

                const provider = new HDWalletProvider({
                    privateKeys: [privateKey],
                    url: rpc,
                    chainId: 137,
                    pollingInterval: 10000,
                });
                //worked fine on v1 , but v2 doesn't like the old api
                win.web3 = new Web3(provider);
            },
        })
        cy.wait(10000)
    }
}