import { useAccount, useConnect } from 'wagmi';
import { useEffect, useMemo } from 'react';

const SAFE_CONNECTOR_ID = "safe";

const useSafeAppAutoConnect = () => {
    const { connect, connectors } = useConnect();
    const { isConnected, isReconnecting } = useAccount();

    const safeConnector = useMemo(() => {
        return connectors.find((c) => c.id === SAFE_CONNECTOR_ID);
    }, [connect, connectors]);

    useEffect(() => {
        if (!isReconnecting && !isConnected && safeConnector) {
            connect({ connector: safeConnector });
        }
    }, [isReconnecting, safeConnector]); // Don't include `isConnected` here, we only want to run this once in practice.
}

export { useSafeAppAutoConnect };