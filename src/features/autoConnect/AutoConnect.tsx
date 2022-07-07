import { createContext, FC, useContext, useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { wagmiClient } from "../wallet/WagmiManager";

interface AutoConnectContextValue {
  isAutoConnecting: boolean;
  /**
   * Whether a connector was found and connected to.
   */
  didAutoConnect: boolean;
}

const AutoConnectContext = createContext<AutoConnectContextValue>(null!);

export const AutoConnectProvider: FC = ({ children }) => {
  const { connectAsync, connectors } = useConnect();
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);
  const [didAutoConnect, setDidAutoConnect] = useState(true);

  useEffect(() => {
    const doAsync = async (): Promise<{ didAutoConnect: boolean }> => {
      const gnosisSafeConnector = connectors.find(
        (c) => c.id === "safe" && c.ready
      );
      if (gnosisSafeConnector) {
        await connectAsync({
          connector: gnosisSafeConnector,
        });
        return { didAutoConnect: true };
      } else {
        const autoConnectedProvider = await wagmiClient.autoConnect();
        return { didAutoConnect: !!autoConnectedProvider };
      }
    };

    doAsync()
      .then((x) => setDidAutoConnect(x.didAutoConnect))
      .finally(() => setIsAutoConnecting(false));
  }, [connectAsync, connectors]);

  return (
    <AutoConnectContext.Provider
      value={{
        isAutoConnecting,
        didAutoConnect,
      }}
    >
      {children}
    </AutoConnectContext.Provider>
  );
};

export const useAutoConnect = () => useContext(AutoConnectContext);
