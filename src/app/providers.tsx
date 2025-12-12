"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// PENTING: Import 'fallback'
import { WagmiProvider, createConfig, http, fallback } from "wagmi"; 
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

const rainbowKitConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        coinbaseWallet,
        rainbowWallet,
        metaMaskWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'Base Vote',
    projectId: projectId,
  }
);

// === KONFIGURASI RPC YANG LEBIH KUAT ===
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback([
      // 1. PRIORITAS UTAMA: QuickNode atau Ankr (Wajib isi di Env Var Vercel!)
      http(process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL), 
      
      // 2. CADANGAN: Base Official Public RPC (Limit lumayan longgar, ~2000 blok)
      http("https://mainnet.base.org"),
      
      // 3. CADANGAN TERAKHIR: Alchemy (Karena limit log cuma 10 blok, taruh bawah aja)
      http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
    ]),
  },
  connectors: [
    ...rainbowKitConnectors, 
    farcasterFrame() 
  ],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
           <RainbowKitWrapper>{children}</RainbowKitWrapper>
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <RainbowKitProvider 
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()} 
      coolMode
    >
      {children}
    </RainbowKitProvider>
  );
}