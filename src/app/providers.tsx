"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets, // Gunakan ini untuk setup wallet manual
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"; // Import wallet standar
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi"; // Kita pakai createConfig (native Wagmi)
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

// 1. SETUP WALLET RAINBOWKIT
// Kita definisikan wallet apa saja yang mau muncul di tombol Connect
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

// 2. BUAT CONFIG WAGMI MANUAL
// Di sini kita gabungkan konektor RainbowKit + Konektor Farcaster
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    // Masukkan konektor RainbowKit (hasil dari connectorsForWallets)
    ...rainbowKitConnectors, 
    // Masukkan konektor Farcaster (ini yang bikin error tadi kalau pakai getDefaultConfig)
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