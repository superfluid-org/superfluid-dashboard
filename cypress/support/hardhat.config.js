require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const GOERLI_PRIVATE_KEY = "9793263ec38f85238966c17c809bb96695a80d5693f8fd1132f3cb2292b32a31";

task("accounts", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `https://rpc-endpoints.superfluid.dev/eth-goerli`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  }
};