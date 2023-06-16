import { providers } from "ethers";
import { PublicClient, WalletClient } from "viem";

export const providerFromPublicClient = (
  publicClient: PublicClient
): providers.Web3Provider =>
  new providers.Web3Provider(publicClient.transport, publicClient.chain?.id);

export const signerFromWalletClient = async (
  walletClient: WalletClient
): Promise<providers.JsonRpcSigner> =>
  new providers.Web3Provider(
    walletClient.transport,
    walletClient.chain?.id
  ).getSigner();
