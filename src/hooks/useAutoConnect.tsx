import { useConnect } from "wagmi";
import { useEffect } from "react";
import { wagmiClient } from "../features/wallet/WagmiManager";

// Inspired by: https://github.com/safe-global/safe-apps-sdk/blob/master/examples/wagmi/src/useAutoConnect.ts
function useAutoConnect() {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const gnosisSafeConnector = connectors.find(
      (c) => c.id === "safe" && c.ready
    );
    if (gnosisSafeConnector) {
      connect({
        connector: gnosisSafeConnector,
      });
    } else {
      wagmiClient.autoConnect();
    }
  }, [connect, connectors]);
}

export { useAutoConnect };
