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
    if (isReconnecting || isConnected) return;

    const connector = priorityConnectors[0];
    if (!connector) return;

    // Only connect when the connector actually has a provider. The Safe connector
    // returns none outside of a Safe App iframe, and connecting anyway rejects and
    // leaves wagmi reporting a storage-restored connector stub as "connected".
    let cancelled = false;
    void (async () => {
      const provider = await connector.getProvider().catch(() => undefined);
      if (cancelled || !provider) return;

      console.log(`Auto-connecting to ${connector.id} wallet`);
      connect({ connector });
    })();

    return () => {
      cancelled = true;
    };
  }, [connect, isReconnecting, priorityConnectors]); // Don't include `isConnected` to avoid re-trying
};

export { useSafeAppAutoConnect };
