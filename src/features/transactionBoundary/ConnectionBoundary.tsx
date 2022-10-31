import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { useConnectButton } from "../wallet/ConnectButtonProvider";

export interface ConnectionBoundaryContextValue {
  isImpersonated: boolean;
  stopImpersonation: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: (() => void) | undefined;
  expectedNetwork: Network;
}

const ConnectionBoundaryContext = createContext<ConnectionBoundaryContextValue>(
  null!
);

export const useConnectionBoundary = () =>
  useContext(ConnectionBoundaryContext);

type FunctionChildType = (arg: ConnectionBoundaryContextValue) => ReactNode;

interface ConnectionBoundaryProps {
  children: ReactNode | FunctionChildType;
  expectedNetwork?: Network;
}

const ConnectionBoundary: FC<ConnectionBoundaryProps> = ({
  children,
  ...props
}) => {
  const { isImpersonated, stopImpersonation } = useImpersonation();
  const { chain: activeChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isConnecting, isConnected } = useAccount();
  const { isAutoConnecting } = useAutoConnect();
  const { openConnectModal } = useConnectButton();
  const { network } = useExpectedNetwork();
  const expectedNetwork = props.expectedNetwork ?? network;

  const contextValue = useMemo<ConnectionBoundaryContextValue>(
    () => ({
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting: isConnecting || isAutoConnecting,
      connectWallet: () => openConnectModal(),
      isCorrectNetwork: expectedNetwork.id === activeChain?.id,
      switchNetwork: switchNetwork
        ? () => void switchNetwork(expectedNetwork.id)
        : undefined,
      expectedNetwork,
    }),
    [
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting,
      isAutoConnecting,
      openConnectModal,
      switchNetwork,
      expectedNetwork,
      activeChain,
    ]
  );

  return (
    <ConnectionBoundaryContext.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </ConnectionBoundaryContext.Provider>
  );
};

export default ConnectionBoundary;
