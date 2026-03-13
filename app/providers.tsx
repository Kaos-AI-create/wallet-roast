"use client";

import { useState, useEffect } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During the build/server-side rendering, 'mounted' is false.
  // We return the children directly, skipping all Providers.
  // This prevents the WagmiProvider crash.
  if (!mounted) {
    return <>{children}</>;
  }

  // Once mounted in the browser, the providers are safely initialized.
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