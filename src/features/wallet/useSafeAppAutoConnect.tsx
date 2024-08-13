import { useAccount, useConnect } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';

const SAFE_CONNECTOR_ID = "safe";

const useSafeAppAutoConnect = () => {
    const { connect, connectors } = useConnect();
    const { isConnected, isReconnecting } = useAccount();

    const safeConnector = useMemo(() => {
        return connectors.find((c) => c.id === SAFE_CONNECTOR_ID);
    }, [connectors]);

    const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

    useEffect(() => {
        if (!hasAttemptedConnection && !isReconnecting && !isConnected && safeConnector) {
            connect({ connector: safeConnector });
            setHasAttemptedConnection(true);
        }
    }, [isReconnecting, safeConnector, connect]); // Don't include `isConnected` here, we only want to run this once in practice.
}

const SafeAppAutoConnector = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Safe App connecting is flaky, so we fight with any chance of a race condition.
    return mounted ? <SafeAppAutoConnectorInternal /> : null;
}

const SafeAppAutoConnectorInternal = () => {
    useSafeAppAutoConnect();
    return null;
}

export { SafeAppAutoConnector };