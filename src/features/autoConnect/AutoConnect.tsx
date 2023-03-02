import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount, useClient, useConnect } from "wagmi";

interface AutoConnectContextValue {
  isAutoConnecting: boolean;
  /**
   * Whether a connector was found and connected to.
   * NOTE: Ref is used because of weird race conditions.
   */
  isAutoConnectedRef: MutableRefObject<boolean>;
}

const AutoConnectContext = createContext<AutoConnectContextValue>(null!);

export const AutoConnectProvider: FC<PropsWithChildren> = ({ children }) => {
  const { connect } = useConnect();
  const wagmiClient = useClient();
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);
  const isAutoConnectedRef = useRef(true); // Assume auto-connected because of weird race conditions.
  useAccount({
    onDisconnect: () => {
      return (isAutoConnectedRef.current = false);
    },
  });

  useEffect(() => {
    const doAsync = async (): Promise<void> => {
      const gnosisSafeConnector = wagmiClient.connectors.find(
        (c) => c.id === "safe" && c.ready
      );
      if (gnosisSafeConnector) {
        connect({
          connector: gnosisSafeConnector,
        });
        isAutoConnectedRef.current = true;
      } else {
        const provider = await wagmiClient.autoConnect();
        isAutoConnectedRef.current = !!provider;
      }
    };
    doAsync().finally(() => void setIsAutoConnecting(false));
  }, [wagmiClient, connect]);

  return (
    <AutoConnectContext.Provider
      value={{
        isAutoConnecting,
        isAutoConnectedRef,
      }}
    >
      {children}
    </AutoConnectContext.Provider>
  );
};

export const useAutoConnect = () => useContext(AutoConnectContext);
