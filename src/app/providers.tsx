"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme, // Import Light Theme juga
} from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
// 1. Import ThemeProvider
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"; 

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Base Voting Factory",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 2. Bungkus dengan NextThemesProvider */}
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
           <RainbowKitWrapper>{children}</RainbowKitWrapper>
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// 3. Komponen Kecil untuk Sinkronisasi RainbowKit dengan Tema Kita
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