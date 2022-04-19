import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { createContext, FC, useContext, useState } from "react";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { useAppDispatch } from "../redux/store";
import Web3Modal from "web3modal";

const WalletContext = createContext<{
  walletChainId: number | undefined;
  walletAddress: string | undefined;
  walletProvider: ethers.providers.Web3Provider | undefined;
  connect: () => void; // TODO(KK): ugly
}>(null!);

export default WalletContext;

export const WalletContextProvider: FC = ({ children }) => {
  const [walletProvider, setWalletProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [walletChainId, setWalletChainId] = useState<number | undefined>();
  const dispatch = useAppDispatch();

  // TODO(KK): Ugly any?
  const onWalletProvider = async (
    walletProvder: ethers.providers.Web3Provider
  ) => {
    const chainId = (await walletProvder.getNetwork()).chainId;
    const address = await walletProvder.getSigner().getAddress();

    readOnlyFrameworks.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );

    setSignerForSdkRedux(chainId, () =>
      Promise.resolve(walletProvder.getSigner())
    );

    setWalletProvider(walletProvder);

    if (chainId !== walletChainId) {
      setWalletChainId(chainId);
    }

    if (address !== walletAddress) {
      setWalletAddress(address);
    }

    dispatch(
      initiateOldPendingTransactionsTrackingThunk({
        chainIds: networks.map((x) => x.chainId),
        signerAddress: address,
      }) as any
    ); // TODO(weird version mismatch):
  };

  return (
    <WalletContext.Provider
      value={{
        walletChainId: walletChainId,
        walletAddress: walletAddress,
        walletProvider: walletProvider,
        connect: async () => {
          const providerOptions = {
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                infuraId: "fa4dab2732ac473b9a61b1d1b3b904fa",
              },
            },
          };
          const web3Modal = new Web3Modal({
            cacheProvider: true,
            providerOptions,
          });

          // NOTE: This is caught in closures.
          const web3Provider = await web3Modal.connect();

          onWalletProvider(new ethers.providers.Web3Provider(web3Provider));

          web3Provider.on("accountsChanged", async (accounts: string[]) => {
            onWalletProvider(new ethers.providers.Web3Provider(web3Provider));
          });

          web3Provider.on("chainChanged", async (chainId: number) => {
            onWalletProvider(new ethers.providers.Web3Provider(web3Provider));
          });
        },
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
