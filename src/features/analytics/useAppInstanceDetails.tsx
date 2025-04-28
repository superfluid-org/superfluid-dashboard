import { customAlphabet } from "nanoid";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useAppKitAccount } from "@reown/appkit/react";

export const supportId = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")(
  8
); // Alphabet: "nolookalikesSafe"

export type AppInstanceDetails = {
  appInstance: {
    supportId: string;
    expectedNetwork: {
      id: number;
      name: string;
      slug: string;
      isTestnet: boolean;
    };
    wallet: UnconnectedWalletDetails | ConnectedWalletDetails;
  };
};

export type UnconnectedWalletDetails = {
  isConnected: false;
  isReconnected?: undefined;
  address?: undefined;
  connector?: undefined;
  connectorId?: undefined;
  network?: undefined;
  networkId?: undefined;
};

export type ConnectedWalletDetails = {
  isConnected: boolean;
  isReconnected: boolean;
  address: string;
  connector: string;
  connectorId: string;
  network?: string;
  networkId?: number;
};

export const useAppInstanceDetails = () => {
  const { network: expectedNetwork } = useExpectedNetwork();
  const { transactionDrawerOpen } = useLayoutContext();
  const {
    connector: activeConnector,
    isConnected: isWagmiConnected,
    chain: activeChain
  } = useAccount();

  const {
    isConnected: isAppKitConnected,
    address: activeAccountAddress
  } = useAppKitAccount();
  
  const isConnected = isWagmiConnected && isAppKitConnected;

  return useMemo<AppInstanceDetails>(() => {
    const networkObj: AppInstanceDetails["appInstance"]["expectedNetwork"] = {
      id: expectedNetwork.id,
      name: expectedNetwork.name,
      slug: expectedNetwork.slugName,
      isTestnet: !!expectedNetwork.testnet,
    };

    const walletObj: AppInstanceDetails["appInstance"]["wallet"] = {
      ...(isConnected && activeConnector && activeAccountAddress
        ? {
          isConnected: true,
          isReconnected: false, // TODO(KK): This possibly doesn't work correctly.
          address: activeAccountAddress,
          connector: activeConnector.name,
          connectorId: activeConnector.id,
          ...(activeChain
            ? {
              network: activeChain.name,
              networkId: activeChain.id,
            }
            : {}),
        }
        : { isConnected: false }),
    };

    return {
      appInstance: {
        supportId: supportId,
        expectedNetwork: networkObj,
        wallet: walletObj,
      },
    };
  }, [
    expectedNetwork,
    isConnected,
    activeConnector,
    activeChain,
    activeAccountAddress,
    transactionDrawerOpen,
  ]);
};
