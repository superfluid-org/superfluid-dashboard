import { FC, PropsWithChildren, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";
import dynamic from 'next/dynamic';

const WalletWeirdnessHandler = dynamic(
  () => import('@/components/WalletWeirdnessHandler/WalletWeirdnessHandler')
    .then(mod => mod.WalletWeirdnessHandler),
  { ssr: false }
);

export { wagmiConfig, resolvedWagmiClients };

export const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  const [reconnectOnMount, setReconnectOnMount] = useState(true);
  useEffect(() => {
    setReconnectOnMount(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={reconnectOnMount}>
      <QueryClientProvider client={tanstackQueryClient}>
        {children}
        <WalletWeirdnessHandler />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WagmiManager;
