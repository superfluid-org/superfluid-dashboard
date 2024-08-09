import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { useConnectButton } from "../wallet/ConnectButtonProvider";

export interface ConnectionBoundaryContextValue {
  allowImpersonation: boolean;
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
  expectedNetwork?: Network | null;
  allowImpersonation?: boolean;
  instantlyForceGlobalExpectedNetworkOnSwitch?: boolean; // Note: might not be the best UX. Better to set once the wallet internally changes the network.
}

const ConnectionBoundary: FC<ConnectionBoundaryProps> = ({
  children,
  allowImpersonation = false,
  instantlyForceGlobalExpectedNetworkOnSwitch,
  ...props
}) => {
  const { isImpersonated, stopImpersonation } = useImpersonation();
  const { switchChain } = useSwitchChain();
  const { isConnecting, isReconnecting, isConnected, chain: activeChain } = useAccount();
  const { openConnectModal } = useConnectButton();
  const { network, setExpectedNetwork } = useExpectedNetwork();
  const expectedNetwork = props.expectedNetwork ?? network;

  const isCorrectNetwork = useMemo(() => {
    if (allowImpersonation && isImpersonated) return true;

    if (props.expectedNetwork) {
      return props.expectedNetwork.id === activeChain?.id;
    }

    return network.id === activeChain?.id;
  }, [props.expectedNetwork, network, activeChain, allowImpersonation]);

  const contextValue = useMemo<ConnectionBoundaryContextValue>(
    () => ({
      allowImpersonation,
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting: isConnecting || isReconnecting,
      connectWallet: () => openConnectModal(),
      isCorrectNetwork: isCorrectNetwork,
      switchNetwork: switchChain
        ? () => {
            switchChain({ chainId: expectedNetwork.id });
            if (instantlyForceGlobalExpectedNetworkOnSwitch) {
              setExpectedNetwork(expectedNetwork.id);
            }
          }
        : undefined,
      expectedNetwork,
    }),
    [
      isCorrectNetwork,
      allowImpersonation,
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting,
      isReconnecting,
      openConnectModal,
      switchChain,
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
