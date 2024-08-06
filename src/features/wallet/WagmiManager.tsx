import { FC, PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";

export { wagmiConfig, resolvedWagmiClients };

const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={tanstackQueryClient}>
      <WagmiProvider
        config={wagmiConfig}
        reconnectOnMount={false} // Re-connecting on mount causes hydration issues, as the app was built without this in mind. `reconnect` is triggered manually after mount.
      >
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default WagmiManager;
