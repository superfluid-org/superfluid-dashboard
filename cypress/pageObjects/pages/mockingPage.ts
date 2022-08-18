import {BasePage} from "../BasePage";
// @ts-ignore
import {mock, trigger} from '@depay/web3-mock'
// @ts-ignore
import {wallets} from '@depay/web3-wallets'
import {ethers} from "ethers";


export class mockingPage extends BasePage {


    static visitAndDoRealTxWithEthers() {
        cy.visitWithProvider("/")
        cy.wait(10000)
    }
}