const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } =  require("ethers");
const { getNetwork } = require("@ethersproject/networks");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2) , {
    alias: {
        t1: "tokenOne",
        t2: "tokenTwo",
    }
});

const nativeUnderlyingTokenAddresses = {
    goerli: ""
}

//Check native token balance
//Check native super token balance
//Check super token one balance
//Check super token two balance

async function main() {
    try {
        console.log(args)
        const provider = new ethers.providers.InfuraProvider(getNetwork(args.chainId));


        const sf = await Framework.create({
            networkName: args.networkName,
            chainId: args.chainId,
            provider: provider
        });

        const nativeToken = await sf.loadNativeAssetSuperToken(args.gasToken).catch(() => {
            console.log(`Looks like I was unable to fetch the gas token: ${args.gasToken}, make sure the address is correct , or the token symbol is listed in the resolver`)
        });

        const underlyingNativeToken = await sf.loadNativeAssetSuperToken()

        const tokenOne = await sf.loadSuperToken(args.tokenOne).catch(() => {
            console.log(`Looks like I was unable to fetch the first token: ${args.tokenOne}, make sure the address is correct , or the token symbol is listed in the resolver`)
        });


        const tokenOneBalance = await tokenOne.realtimeBalanceOf({
            providerOrSigner: provider,
            account: "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        });

        const tokenTwo = await sf.loadSuperToken(args.tokenOne).catch(() => {
            console.log(`Looks like I was unable to fetch the first token: ${args.tokenOne}, make sure the address is correct , or the token symbol is listed in the resolver`)
        });


        const tokenTwoBalance = await tokenOne.realtimeBalanceOf({
            providerOrSigner: provider,
            account: "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
        });

        if(tokenOneBalance.availableBalance === "0" || tokenOneBalance.availableBalance === "0" ){
            new Error(`${args.tokenOne} does not have enough balance to continue setting up the wallet , please add some`)
        }
        console.log(tokenOneBalance);
    } catch (e) {
            console.log(e)
    }

}

main();