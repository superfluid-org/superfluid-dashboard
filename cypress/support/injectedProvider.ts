/**
 * Updates cy.visit() to include an injected window.ethereum provider.
 */

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import {ethers} from "ethers";

// todo: figure out how env vars actually work in CI
// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
const TEST_PRIVATE_KEY = '47d567438b9ec683a9d1828c784d980ad6fe9cd3fcf4fcf6d5c357b534537468'

// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address

export const TEST_ADDRESS_NEVER_USE_SHORTENED = `${TEST_ADDRESS_NEVER_USE.substr(
    0,
    6
)}...${TEST_ADDRESS_NEVER_USE.substr(-4, 4)}`

const provider = new JsonRpcProvider('https://rpc-endpoints.superfluid.dev/polygon-mainnet', "matic")
const signer = new Wallet(TEST_PRIVATE_KEY, provider)
export const injected = new (class extends Eip1193Bridge {
    chainId = 137

    async sendAsync(...args: any[]) {
        console.debug('sendAsync called', ...args)
        return this.send(...args)
    }
    async send(...args: any[]) {
        console.debug('send called', ...args)
        const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
        let callback
        let method
        let params
        if (isCallbackForm) {
            callback = args[1]
            method = args[0].method
            params = args[0].params
        } else {
            method = args[0]
            params = args[1]
        }
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            if (isCallbackForm) {
                callback({ result: [TEST_ADDRESS_NEVER_USE] })
            } else {
                return Promise.resolve([TEST_ADDRESS_NEVER_USE])
            }
        }
        if (method === 'eth_chainId') {
            if (isCallbackForm) {
                callback(null, { result: '0x89' })
                console.debug("no idea what is a callback form but it is there")
            } else {
                console.debug('resolved promise with 0x89')
                return Promise.resolve('0x89')
            }
        }
        try {
            // If from is present on eth_call it errors, removing it makes the library set
            // from as the connected wallet which works fine
            if (params && params.length && params[0].from && method === 'eth_call') delete params[0].from
            let result
            // For sending a transaction if we call send it will error
            // as it wants gasLimit in sendTransaction but hexlify sets the property gas
            // to gasLimit which makes sensd transaction error.
            // This have taken the code from the super method for sendTransaction and altered
            // it slightly to make it work with the gas limit issues.
            if (params && params.length && params[0].from && method === 'eth_sendTransaction') {
                // Hexlify will not take gas, must be gasLimit, set this property to be gasLimit
                params[0].gasLimit = params[0].gas
                delete params[0].gas
                // If from is present on eth_sendTransaction it errors, removing it makes the library set
                // from as the connected wallet which works fine
                delete params[0].from
                console.log(params[0])
                const req = ethers.providers.JsonRpcProvider.hexlifyTransaction(params[0])

                // Hexlify sets the gasLimit property to be gas again and send transaction requires gasLimit
                req.gasLimit = req.gas
                delete req.gas
                // Send the transaction
                // @ts-ignore
                console.log("Signer network",await this.signer.provider.getNetwork())

                const tx = await this.signer.sendTransaction(req)
                result = tx.hash
                console.log("WOW",tx.hash)
            } else {
                // All other transactions the base class works for
                result = await super.send(method, params)
            }
            console.debug('result received', method, params, result)
            if (isCallbackForm) {
                callback(null, { result })
            } else {
                return result
            }
        } catch (error) {
            if (isCallbackForm) {
                callback(error, null)
            } else {
                throw error
            }
        }
    }
})(signer, provider)
