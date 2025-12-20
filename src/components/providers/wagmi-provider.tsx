"use client";

import { createConfig, http, WagmiProvider, fallback } from "wagmi";
import { base, baseSepolia } from "wagmi/chains"; // Tambahkan Sepolia jika sedang tes
import { baseAccount } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { METADATA } from "../../lib/utils";

export const config = createConfig({
  // Gunakan base atau baseSepolia sesuai tempat kontrak di-deploy
  chains: [base, baseSepolia], 
  transports: {
    [base.id]: fallback([
      http("URL_RPC_1"), // Ganti dengan RPC Alchemy/QuickNode/Lainnya
      http("URL_RPC_2"),
      http(), // Public RPC sebagai cadangan terakhir
    ]),
    [baseSepolia.id]: http(),
  },
  connectors: [
    farcasterMiniApp(), 
    baseAccount({
      appName: METADATA.name,
      appLogoUrl: METADATA.iconImageUrl,
    })
  ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}