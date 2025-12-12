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
import { WagmiProvider, createConfig, http } from "wagmi"; 
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

// SETUP WALLET RAINBOWKIT
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

// === BAGIAN INI YANG DIUBAH ===
const config = createConfig({
  chains: [base],
  transports: {
    // Gunakan RPC Alchemy jika ada di env, jika tidak fallback ke public (yang sering gagal)
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "https://mainnet.base.org"),
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