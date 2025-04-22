import { FC, PropsWithChildren, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";
import { WalletWeirdnessHandler } from "../../components/WalletWeirdnessHandler/WalletWeirdnessHandler";

export { wagmiConfig, resolvedWagmiClients };

export const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  const [reconnectOnMount, setReconnectOnMount] = useState(false);

  useEffect(() => {
    // It's a bit of a funny fix to avoid hydration errors. The server-side pages are statically generated without a wallet connected.
    setReconnectOnMount(true)
  }, [])

  return (
    <WagmiProvider
      config={wagmiConfig}
      reconnectOnMount={reconnectOnMount}
    >
      <QueryClientProvider client={tanstackQueryClient}>
        {children}
        <WalletWeirdnessHandler />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WagmiManager;
