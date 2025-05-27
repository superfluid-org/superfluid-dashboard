import { FC, PropsWithChildren, useEffect, useState } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";
import dynamic from 'next/dynamic';

const WalletWeirdnessHandler = dynamic(
  () => import('@/components/WalletWeirdnessHandler/WalletWeirdnessHandler')
    .then(mod => mod.WalletWeirdnessHandler),
  { ssr: true }
);

export { wagmiConfig, resolvedWagmiClients };

export const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren<{
  cookies: string | undefined
}>> = ({ children, cookies }) => {
  // Without SSR wallet connection, this hack was necessary to avoid hydration errors.
  // const [reconnectOnMount, setReconnectOnMount] = useState(true);
  // useEffect(() => {
  //   setReconnectOnMount(true);
  // }, []);

  const initialState = cookieToInitialState(
    wagmiConfig,
    cookies
  )

  return (
    <WagmiProvider
      config={wagmiConfig}
      reconnectOnMount
      initialState={initialState}
    >
      <QueryClientProvider client={tanstackQueryClient}>
        {children}
        <WalletWeirdnessHandler />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WagmiManager;
