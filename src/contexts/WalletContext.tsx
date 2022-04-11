import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { createContext, FC, useContext, useState } from "react";
import { networks } from "../networks";
import readOnlyFrameworks from "../readOnlyFrameworks";
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
          const web3Provider = await web3Modal.connect();

          const ethersProvider = new ethers.providers.Web3Provider(
            web3Provider
          );

          const chainId = (await ethersProvider.getNetwork()).chainId;
          const address = await ethersProvider.getSigner().getAddress();
          setWalletChainId(chainId);
          setWalletAddress(address);
          setWalletProvider(ethersProvider);
          setSignerForSdkRedux(Number(chainId), () =>
            Promise.resolve(ethersProvider.getSigner())
          );

          readOnlyFrameworks.map((x) =>
            setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
          );

          dispatch(
            initiateOldPendingTransactionsTrackingThunk({
              chainIds: networks.map((x) => x.chainId),
              signerAddress: address,
            }) as any
          ); // TODO(weird version mismatch):

          web3Provider.on("accountsChanged", (accounts: string[]) => {
            setWalletAddress(accounts[0]);

            setSignerForSdkRedux(chainId, () =>
              Promise.resolve(ethersProvider.getSigner())
            );

            dispatch(
              initiateOldPendingTransactionsTrackingThunk({
                chainIds: networks.map((x) => x.chainId),
                signerAddress: address,
              }) as any
            ); // TODO(weird version mismatch):
          });

          web3Provider.on("chainChanged", (chainId: number) => {
            readOnlyFrameworks.map((x) =>
              setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
            );

            setWalletChainId(Number(chainId)); // Chain ID might be coming in hex.
            setSignerForSdkRedux(Number(chainId), () =>
              Promise.resolve(ethersProvider.getSigner())
            );
          });
        },
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
