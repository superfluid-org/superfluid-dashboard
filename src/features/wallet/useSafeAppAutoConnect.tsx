import { useConnect } from "wagmi";
import { useAccount } from "@/hooks/useAccount";
import { useEffect, useMemo } from "react";

const SAFE_CONNECTOR_ID = "safe";
const MOCK_CONNECTOR_ID = "Mock";

const useSafeAppAutoConnect = () => {
  const { connect, connectors } = useConnect();
  const { isConnected, isReconnecting } = useAccount();

  const priorityConnectors = useMemo(() => {
    const safeConnector = connectors.find((c) => c.id === SAFE_CONNECTOR_ID);
    const mockConnector = connectors.find((c) => c.id === MOCK_CONNECTOR_ID);

    return [mockConnector, safeConnector].filter(Boolean);
  }, [connectors]);

  useEffect(() => {
    if (!isReconnecting && !isConnected && priorityConnectors.length > 0) {
      const connector = priorityConnectors[0];

      if (connector) {
        console.log(`Auto-connecting to ${connector.id} wallet`);
        connect({ connector });
      }
    }
  }, [connect, isReconnecting, priorityConnectors]); // Don't include `isConnected` to avoid re-trying
};

export { useSafeAppAutoConnect };
