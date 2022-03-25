import { ethers } from "ethers";
import { createContext, useContext } from "react";

const WalletContext = createContext<{
    walletChainId: number | undefined,
    walletAddress: string | undefined,
    walletProvider: ethers.providers.Web3Provider | undefined,
    setProvider: (provider: any) => void, // TODO(KK): ugly
}>({
    walletChainId: undefined,
    walletAddress: undefined,
    walletProvider: undefined,
    setProvider: () => { throw new Error("`setProvider` has not been initialized.") }
});

export default WalletContext;

export const useWalletContext = () => useContext(WalletContext);