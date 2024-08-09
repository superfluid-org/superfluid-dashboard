import { FC, PropsWithChildren, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";

export { wagmiConfig, resolvedWagmiClients };

const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  const [reconnectOnMount, setReconnectOnMount] = useState(false);

  useEffect(() => {
    // It's a bit of a funny fix to avoid hydration errors. The server-side pages are statically generated without a wallet connected.
    setReconnectOnMount(true)
  }, [])

  return (
    <QueryClientProvider client={tanstackQueryClient}>
      <WagmiProvider
        config={wagmiConfig}
        reconnectOnMount={reconnectOnMount}
      >
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default WagmiManager;
