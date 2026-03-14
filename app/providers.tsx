"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { ReactNode, useState } from "react";

// 1. Memoize config outside component to prevent re-instantiation
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
});

export function Providers({ children }: { children: ReactNode }) {
  // 2. Use stable state for the QueryClient
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider 
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} 
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}