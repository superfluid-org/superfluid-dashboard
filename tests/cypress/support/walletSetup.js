const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } = require("ethers");
const { getNetwork } = require("@ethersproject/networks");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2), {
  alias: {
    t1: "tokenOne",
    t2: "tokenTwo",
    pk: "privateKey",
  },
});

const networkGasTokenSymbols = {
  1: "ETHx",
  5: "ETHx",
  10: "ETHx",
  56: "BNBx",
  100: "xDAIx",
  137: "MATICx",
  42161: "ETHx",
  43113: "AVAXx",
  43114: "AVAXx",
  80001: "MATICx",
};

function checkArgs() {
  if (!args.tokenOne || !args.tokenTwo || !args.privateKey || !args.chainId) {
    throw new Error(
      "You forgot an argument to the script , it requires:\n" +
        "--t1 or --tokenOne : Resolver name or address of the token\n" +
        "--t2 or --tokenTwo : Resolver name or address of the token\n" +
        "--pk or --privateKey : The private key of the wallet you want to set up\n" +
        "--chainId : The chainId of the network you want to set the wallet on to\n" +
        "Optional:\n" +
        "--receiver : change the wallet who receives flows from the wallet\n" +
        "--rpc : in case the network is not supported by the free ethers InfuraProviders you can provide your own RPC\n" +
        "--amount : override the default 0.01 token upgrade amount"
    );
  }
  if (!networkGasTokenSymbols[args.chainId]) {
    throw new Error(
      `${args.chainId} does not seem to be supported by the script, please update the networkGasTokenSymbols JSON in the script `
    );
  }
}

async function main() {
  checkArgs();
  const receiverAddress = args.receiver
    ? args.receiver
    : "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2";
  const provider = args.rpc
    ? new ethers.providers.JsonRpcProvider(args.rpc)
    : new ethers.providers.InfuraProvider(getNetwork(args.chainId));
  const wallet = new ethers.Wallet(args.privateKey, provider);
  const nativeUnderlyingBalance = await wallet.getBalance();
  const nativeTokenSymbol = networkGasTokenSymbols[args.chainId];
  console.log(`Trying to set up ${wallet.address} on chain: ${args.chainId}`);
  const sf = await Framework.create({
    chainId: args.chainId,
    provider: provider,
  });

  const signer = sf.createSigner({
    privateKey: args.privateKey,
    provider,
  });
  const units = ethers.utils.parseUnits("0.01").toString();
  const upgradeTargetAmount = args.amount
    ? args.amount
    : ethers.utils.parseEther("0.01");
  const nativeToken = await sf.loadNativeAssetSuperToken(nativeTokenSymbol);

  const tokenOne = await sf.loadSuperToken(args.tokenOne);
  let tokenOneIndex = await tokenOne.getIndex({
    publisher: wallet.address,
    indexId: "0",
    providerOrSigner: signer,
  });
  const tokenOneStream = await tokenOne.getFlow({
    sender: wallet.address,
    receiver: receiverAddress,
    providerOrSigner: signer,
  });

  const tokenTwo = await sf.loadSuperToken(args.tokenTwo);
  let tokenTwoIndex = await tokenTwo.getIndex({
    publisher: wallet.address,
    indexId: "0",
    providerOrSigner: signer,
  });

  try {
    const nativeBalance = (
      await nativeToken.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenOneBalance = (
      await tokenOne.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenOneUnderylingBalance = await tokenOne.underlyingToken.balanceOf({
      providerOrSigner: provider,
      account: wallet.address,
    });

    const tokenTwoBalance = (
      await tokenOne.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenTwoUnderylingBalance = await tokenTwo.underlyingToken.balanceOf({
      providerOrSigner: provider,
      account: wallet.address,
    });

    const underlyingBalances = {
      tokenOneUnderylingBalance,
      tokenTwoUnderylingBalance,
      nativeUnderlyingBalance: nativeUnderlyingBalance.toString(),
    };

    const balanceValues = Object.values(underlyingBalances);
    if (balanceValues.some((x) => x / 1e18 < 0.02)) {
      //TODO go over all balances , check the wrapped ones also , and downgrade if neccessary to save some tokens
      // when running the script on used wallets , not needed atm
      console.log(underlyingBalances);
      new Error(
        "Amigo, you need to add some balances to the wallet, this is not enough"
      );
    }

    if (nativeBalance / 1e18 < 0.01) {
      console.log(
        `${nativeTokenSymbol} balance not sufficient for rejected tx tests:`
      );
      const upgradeAmount = upgradeTargetAmount - nativeBalance;
      console.log(
        `Upgrading ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${nativeTokenSymbol} to get 0.01 ${nativeTokenSymbol}`
      );
      const upgradeTx = await nativeToken
        .upgrade({ amount: upgradeAmount.toString() })
        .exec(signer);
      await upgradeTx.wait();
    } else {
      console.log(
        `${nativeTokenSymbol} balance already sufficient, not upgrading`
      );
    }

    if (tokenOneBalance / 1e18 < 0.01) {
      console.log(
        `${args.tokenOne} balance not sufficient for rejected tx tests:`
      );
      //Upgrades 1.5 tokens , will stream 0.01 per month afterwards
      const upgradeAmount =
        parseFloat(upgradeTargetAmount) * 150 - tokenOneBalance;
      const approvalTxn = await tokenOne.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenOne.address,
        })
        .exec(signer);
      console.log(
        `Approving the use of ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${args.tokenOne}`
      );
      await approvalTxn.wait();
      const upgradeTx = await tokenOne
        .upgrade({ amount: upgradeAmount.toString() })
        .exec(signer);
      console.log(
        `Upgrading ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenOne
        } , to get ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenOne
        }`
      );
      await upgradeTx.wait();
    } else {
      console.log(`${args.tokenOne} balance already sufficient, not upgrading`);
    }

    if (tokenTwoBalance / 1e18 < 0.01) {
      console.log(
        `${args.tokenTwo} balance not sufficient for rejected tx tests:`
      );
      const upgradeAmount = ethers.utils.parseEther("0.1") - tokenTwoBalance;
      const approvalTxn = await tokenTwo.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenTwo.address,
        })
        .exec(signer);
      const overApprovalTxn = await tokenTwo.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenTwo.address,
        })
        .exec(signer);
      console.log(
        `Approving the use of ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${args.tokenTwo}`
      );
      await approvalTxn.wait();
      await overApprovalTxn.wait();
      const upgradeTx = await tokenTwo
        .upgrade({ amount: upgradeAmount.toString().toString() })
        .exec(signer);
      console.log(
        `Upgrading ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenTwo
        } , to get 0.1 ${args.tokenTwo}`
      );
      upgradeTx.wait();
    } else {
      console.log(`${args.tokenTwo} balance already sufficient, not upgrading`);
    }

    if (tokenOneStream.flowRate === "0") {
      console.log(
        `Creating a flow of 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
      const createStreamTx = await tokenOne
        .createFlow({
          sender: wallet.address,
          receiver: receiverAddress,
          flowRate: "3858024691", //0.01 per month
        })
        .exec(signer);
      await createStreamTx.wait();
    } else if (tokenOneStream.flowRate !== "3858024691") {
      console.log(
        `There seems to be a different flow rate than 0.01 , lets fix it`
      );
      const updateStreamTx = await tokenOne
        .updateFlow({
          sender: wallet.address,
          receiver: receiverAddress,
          flowRate: "3858024691", //0.01 per month
        })
        .exec(signer);
      console.log(
        `Updating the flowrate to 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
      await updateStreamTx.wait();
    } else {
      console.log(
        `Already streaming 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
    }

    if (!tokenOneIndex.exist) {
      const createIndexTx = await tokenOne
        .createIndex({ indexId: "0" })
        .exec(signer);
      console.log(`Creating ${args.tokenOne} index`);
      await createIndexTx.wait();
    } else {
      console.log(`${args.tokenOne} index already created`);
    }
    if (
      parseFloat(tokenOneIndex.totalUnitsPending) +
        parseFloat(tokenOneIndex.totalUnitsApproved) ===
      0
    ) {
      const updateUnitsTx = await tokenOne
        .updateSubscriptionUnits({
          indexId: "0",
          subscriber: wallet.address,
          units,
        })
        .exec(signer);
      console.log(`Updating ${args.tokenTwo} index units to ${units}`);
      await updateUnitsTx.wait();
      tokenOneIndex = await tokenOne.getIndex({
        publisher: wallet.address,
        indexId: "0",
        providerOrSigner: signer,
      });
    }

    if (tokenOneIndex.totalUnitsPending === "0") {
      console.log(`${args.tokenOne} index needs to be revoked!`);
      const revokeTx = await tokenOne
        .revokeSubscription({
          indexId: "0",
          publisher: wallet.address,
        })
        .exec(signer);
      console.log(`Revoking ${args.tokenOne} index`);
      await revokeTx.wait();
    } else {
      console.log(`${args.tokenOne} index approval status is correct`);
    }

    if (!tokenTwoIndex.exist) {
      const createIndexTx = await tokenTwo
        .createIndex({ indexId: "0" })
        .exec(signer);
      console.log(`Creating ${args.tokenTwo} index`);
      await createIndexTx.wait();
      const updateUnitsTx = await tokenTwo
        .updateSubscriptionUnits({
          indexId: "0",
          subscriber: wallet.address,
          units,
        })
        .exec(signer);
      console.log(`Updating ${args.tokenTwo} index units`);
      await updateUnitsTx.wait();
      tokenTwoIndex = await tokenTwo.getIndex({
        publisher: wallet.address,
        indexId: "0",
        providerOrSigner: signer,
      });
    } else {
      console.log(`${args.tokenTwo} index already created`);
    }

    if (tokenTwoIndex.totalUnitsPending !== "0") {
      console.log(`Approving ${args.tokenTwo} index`);
      await tokenTwo
        .approveSubscription({
          indexId: "0",
          publisher: wallet.address,
        })
        .exec(signer);
    } else {
      console.log(`${args.tokenTwo} index already approved`);
    }

    console.log(
      `${wallet.address} was successfully set up for being used with rejected tx test cases on chain: ${args.chainId}`
    );
  } catch (e) {
    console.log(e);
  }
}

main();
