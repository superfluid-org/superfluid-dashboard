import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { networks, networksByChainId } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { useAppDispatch } from "../redux/store";
import Web3Modal from "web3modal";
import { useNetworkContext } from "../network/NetworkContext";

const WalletContext = createContext<{
  walletChainId: number | undefined;
  walletAddress: string | undefined;
  walletProvider: ethers.providers.Web3Provider | undefined;
  switchNetwork: ((chainId: number) => void) | undefined;
  connectWallet: () => void;
  isWalletConnected: boolean;
  isWalletConnecting: boolean;
}>(null!);

export default WalletContext;

export const WalletContextProvider: FC = ({ children }) => {
  const { setNetwork } = useNetworkContext();

  const [walletProvider, setWalletProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [walletChainId, setWalletChainId] = useState<number | undefined>();
  const [walletConnecting, setWalletConnecting] = useState(false);

  const reset = useCallback(() => {
    setWalletAddress(undefined);
    setWalletChainId(undefined);
    setWalletProvider(undefined);
  }, []);

  const dispatch = useAppDispatch();

  const onWalletProvider = useCallback(
    async (walletProvider: ethers.providers.Web3Provider) => {
      setWalletConnecting(true);

      const chainId = (await walletProvider.getNetwork()).chainId;
      const address = await walletProvider.getSigner().getAddress();

      readOnlyFrameworks.map((x) =>
        setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
      );

      setSignerForSdkRedux(chainId, () =>
        Promise.resolve(walletProvider.getSigner())
      );

      setWalletProvider(walletProvider);

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

      setWalletConnecting(false);
    },
    [
      setWalletProvider,
      setWalletAddress,
      setWalletChainId,
      setWalletConnecting,
      dispatch,
    ]
  );

  const [web3Modal, setWeb3Modal] = useState<Web3Modal | undefined>();

  useEffect(() => {
    setWeb3Modal(
      new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: "fa4dab2732ac473b9a61b1d1b3b904fa",
            },
          },
        },
      })
    );
  }, []);

  // Set network from provider only on first load from cache.
  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      connectWallet().then(async (ethersProvider) => {
        const ethersNetwork = await ethersProvider.getNetwork();
        if (networksByChainId.get(ethersNetwork.chainId)) {
          setNetwork(ethersNetwork.chainId);
        }
      });
    }
  }, [web3Modal]);

  const connectWallet =
    useCallback(async (): Promise<ethers.providers.Web3Provider> => {
      if (!web3Modal)
        throw Error("Don't call this before web3modal has been initialized.");

      setWalletConnecting(true); // Do it ASAP.

      // NOTE: This is caught in closures.
      const web3Provider = await web3Modal.connect();

      const firstEthersProvider = new ethers.providers.Web3Provider(
        web3Provider
      );
      onWalletProvider(new ethers.providers.Web3Provider(web3Provider));

      web3Provider.on(
        "disconnect",
        (error: { code: number; message: string }) => {
          reset();
        }
      );

      web3Provider.on("accountsChanged", async (accounts: string[]) => {
        onWalletProvider(new ethers.providers.Web3Provider(web3Provider));
      });

      web3Provider.on("chainChanged", async (chainId: number) => {
        onWalletProvider(new ethers.providers.Web3Provider(web3Provider));
      });

      return firstEthersProvider;
    }, [web3Modal, onWalletProvider, setWalletConnecting]);

  const switchNetwork = useCallback(
    (chainId: number) => {
      if (!walletProvider?.provider?.request) return undefined;

      const desiredChainIdHex = `0x${chainId.toString(16)}`;

      walletProvider.provider
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChainIdHex }],
        })

      // TODO(KK): Handle errors
    },
    [walletProvider]
  );

  return (
    <WalletContext.Provider
      value={{
        walletChainId,
        walletAddress,
        walletProvider,
        connectWallet,
        switchNetwork,
        isWalletConnected: !!walletProvider,
        isWalletConnecting: walletConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
