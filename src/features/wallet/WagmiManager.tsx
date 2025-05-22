import { FC, PropsWithChildren, useEffect, useState } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";
import dynamic from 'next/dynamic';

const WalletWeirdnessHandler = dynamic(
  () => import('@/components/WalletWeirdnessHandler/WalletWeirdnessHandler')
    .then(mod => mod.WalletWeirdnessHandler),
  { ssr: false }
);

export { wagmiConfig, resolvedWagmiClients };

export const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren<{
  cookie: string | undefined;
}>> = ({ children, cookie }) => {
  const initialState = cookieToInitialState(
    wagmiConfig,
    cookie
  )

  return (
    <WagmiProvider
      config={wagmiConfig}
      reconnectOnMount={true}
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
