import { FC, PropsWithChildren, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, resolvedWagmiClients } from "./wagmiConfig";
import { WalletWeirdnessHandler } from "../../components/WalletWeirdnessHandler/WalletWeirdnessHandler";

export { wagmiConfig, resolvedWagmiClients };

export const tanstackQueryClient = new QueryClient();

const WagmiManager: FC<PropsWithChildren> = ({ children }) => {
  const reconnectOnMount = true;

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
