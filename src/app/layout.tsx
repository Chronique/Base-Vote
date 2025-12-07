import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css"; 
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

// === KONFIGURASI METADATA ===
export const metadata: Metadata = {
  title: "Base Vote - Vote Everything on Base",
  description: "The easiest way to create and participate in on-chain polls on the Base network. Transparent, immutable, and fun.",
  
  // Konfigurasi Open Graph (Untuk preview di sosmed)
  openGraph: {
    title: "Base Vote - On-Chain Polling App",
    description: "Create polls, vote with your wallet, and see real-time results on Base.",
    url: "https://base-vote-app.vercel.app", // Ganti kalau punya domain sendiri
    siteName: "Base Vote",
    images: [
      {
        url: "https://placehold.co/1200x630/0052FF/ffffff?text=Base+Vote", // Banner sementara (bisa diganti)
        width: 1200,
        height: 630,
        alt: "Base Vote Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Konfigurasi Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Base Vote",
    description: "Vote everything on Base. Decentralized and verifiable.",
    images: ["https://placehold.co/1200x630/0052FF/ffffff?text=Base+Vote"], // Sama dengan atas
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}