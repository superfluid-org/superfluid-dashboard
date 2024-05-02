import sfMeta from "@superfluid-finance/metadata";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist";
import { ethers } from "ethers";

import {
  cfAv1ForwarderABI,
  erc20ABI,
  superTokenABI,
} from "./abis/wagmi-generated";

export class EthHelper {
  private wallet: ethers.Wallet;
  private provider: ethers.providers.JsonRpcProvider;
  private networkName: string;

  constructor(networkName: string, privateKey: string) {
    const rpcUrl =
      "https://rpc-endpoints.superfluid.dev/" +
      this.getNetworkByName(networkName).name;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.networkName = networkName;
  }

  public getNetworkByHumanReadableName(name: string) {
    return sfMeta.networks.filter((n) => n.humanReadableName === name)[0];
  }

  public getNetworkByName(name: string) {
    return sfMeta.networks.filter((n) => n.name === name)[0];
  }

  public getTokenBySymbolAndChainId(symbol: string, chainId: number) {
    return extendedSuperTokenList.tokens.filter(
      (token: any) => token.symbol === symbol && token.chainId === chainId
    )[0];
  }

  public getTokenByAddress(address: string) {
    return extendedSuperTokenList.tokens.filter(
      (token: any) => token.address === address
    )[0];
  }

  public async revokeAllowanceIfNeccesary(
    tokenSymbol: string,
    contractToRevokeAllowanceTo: string
  ) {
    let chainId = this.getNetworkByName(this.networkName).chainId;
    const token = new ethers.Contract(
      this.getTokenBySymbolAndChainId(tokenSymbol, chainId).address,
      erc20ABI,
      this.wallet.provider
    );

    await token
      .allowance(
        process.env.AVERAGEX_WALLET_PUBLIC_KEY,
        contractToRevokeAllowanceTo
      )
      .then(async (allowance: bigint) => {
        if (Number(allowance) > 0) {
          console.log("Allowance over 0 , revoking...");
          const data = token.interface.encodeFunctionData("approve", [
            contractToRevokeAllowanceTo,
            0,
          ]);
          const tx = await this.wallet.sendTransaction({
            to: contractToRevokeAllowanceTo,
            from: this.wallet.address,
            data: data,
          });
          await tx.wait().then((receipt) => {
            console.log(`Allowance revoked: ${receipt.transactionHash}`);
          });
        }
      });
  }

  public async deleteFlowIfNeccesary(
    tokenSymbol: string,
    sender: string,
    receiver: string
  ) {
    const chainId = this.getNetworkByName(this.networkName).chainId;
    const tokenAddress = this.getTokenBySymbolAndChainId(
      tokenSymbol,
      chainId
    ).address;
    let cfaV1ForwarderAddress = this.getNetworkByName(this.networkName)
      .contractsV1.cfaV1Forwarder;

    const CFAv1Forwarder = new ethers.Contract(
      cfaV1ForwarderAddress,
      cfAv1ForwarderABI,
      this.wallet.provider
    );
    await CFAv1Forwarder.getFlowInfo(tokenAddress, sender, receiver).then(
      async (flow: bigint[]) => {
        //returns lastUpdated uint256, flowRate int96, deposit uint256, owedDeposit uint256
        if (flow[1] > 0) {
          console.log("Flow still ongoing, deleting...");
          const data = CFAv1Forwarder.interface.encodeFunctionData(
            "deleteFlow",
            [tokenAddress, sender, receiver, "0x"]
          );
          const tx = await this.wallet.sendTransaction({
            to: cfaV1ForwarderAddress,
            from: this.wallet.address,
            data: data,
          });
          await tx.wait().then((receipt) => {
            console.log(`Flow deleted: ${receipt?.transactionHash}`);
          });
        }
      }
    );
  }

  public async startFlowIfNeccesary(
    tokenSymbol: string,
    sender: string,
    receiver: string,
    flowRate: string
  ) {
    const chainId = this.getNetworkByName(this.networkName).chainId;
    const tokenAddress = this.getTokenBySymbolAndChainId(
      tokenSymbol,
      chainId
    ).address;
    let cfaV1ForwarderAddress = this.getNetworkByName(this.networkName)
      .contractsV1.cfaV1Forwarder;

    const CFAv1Forwarder = new ethers.Contract(
      cfaV1ForwarderAddress,
      cfAv1ForwarderABI,
      this.wallet.provider
    );
    await CFAv1Forwarder.getFlowInfo(tokenAddress, sender, receiver).then(
      async (flow: bigint[]) => {
        //returns lastUpdated uint256, flowRate int96, deposit uint256, owedDeposit uint256
        if (flow[1] <= 0) {
          console.log("Flow not going , lets create a new one");
          const data = CFAv1Forwarder.interface.encodeFunctionData(
            "createFlow",
            [tokenAddress, sender, receiver, flowRate, "0x"]
          );
          const tx = await this.wallet.sendTransaction({
            to: cfaV1ForwarderAddress,
            from: this.wallet.address,
            data: data,
          });
          await tx.wait().then((receipt) => {
            console.log(`Flow created: ${receipt?.transactionHash}`);
          });
        }
      }
    );
  }

  public async getUnderlyingTokenBalance(
    tokenSymbol: string,
    addressToCheckBalanceOf = process.env.AVERAGEX_WALLET_PUBLIC_KEY
  ) {
    let chainId = this.getNetworkByName(this.networkName).chainId;
    const token = new ethers.Contract(
      this.getTokenBySymbolAndChainId(tokenSymbol, chainId).address,
      erc20ABI,
      this.wallet.provider
    );
    return await token.balanceOf(addressToCheckBalanceOf);
  }

  public async getSuperTokenBalanceBySymbol(
    tokenSymbol: string,
    addressToCheckBalanceOf = process.env.AVERAGEX_WALLET_PUBLIC_KEY
  ) {
    let chainId = this.getNetworkByName(this.networkName).chainId;
    const token = new ethers.Contract(
      this.getTokenBySymbolAndChainId(tokenSymbol, chainId).address,
      superTokenABI,
      this.wallet.provider
    );
    return await token.realtimeBalanceOfNow(addressToCheckBalanceOf);
  }

  public async getSuperTokenBalanceByAddress(
    tokenAddress: string,
    addressToCheckBalanceOf = process.env.AVERAGEX_WALLET_PUBLIC_KEY!
  ) {
    const token = new ethers.Contract(
      tokenAddress,
      superTokenABI,
      this.wallet.provider
    );
    return await token.realtimeBalanceOfNow(addressToCheckBalanceOf);
  }

  public async transferTokenTo(
    tokenAddress: string,
    receiverAddress: string,
    amount: string
  ) {
    const token = new ethers.Contract(
      tokenAddress,
      superTokenABI,
      this.wallet.provider
    );
    return await token.transfer(receiverAddress, amount);
  }

  async sendEtherTo(toAddress: string, amountEther: string) {
    const tx = {
      to: toAddress,
      value: ethers.utils.parseEther(amountEther),
    };

    const transactionResponse = await this.wallet.sendTransaction(tx);
    await transactionResponse.wait();
  }
}
