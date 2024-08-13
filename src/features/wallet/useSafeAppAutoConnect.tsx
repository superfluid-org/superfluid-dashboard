import { useConnect } from 'wagmi';
import { useEffect } from 'react';

const SAFE_CONNECTOR_ID = "safe";

const useSafeAppAutoConnect = () => {
    const { connect, connectors } = useConnect();

    useEffect(() => {
        const connector = connectors.find((c) => c.id === SAFE_CONNECTOR_ID);

        if (connector) {
            connect({ connector: connector });
        }
    }, [connect, connectors]);
}

export { useSafeAppAutoConnect };