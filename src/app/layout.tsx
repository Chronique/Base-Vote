import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css"; 
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

// GANTI URL INI DENGAN URL VERCEL KAMU YANG ASLI
const appUrl = "https://base-vote-app.vercel.app"; 

export const metadata: Metadata = {
  title: "Base Vote - Vote Everything on Base",
  description: "The easiest way to create and participate in on-chain polls on the Base network.",
  
  // === INI KUNCINYA: METADATA FRAME V2 ===
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/screenshot.png`, // Gambar Banner
      button: {
        title: "Vote Now",
        action: {
          type: "launch_frame",
          name: "Base Vote",
          url: appUrl, // URL Aplikasi
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#0052FF"
        }
      }
    })
  },

  // Open Graph (Untuk Twitter/WA)
  openGraph: {
    title: "Base Vote",
    description: "Create polls and vote on Base.",
    url: appUrl,
    siteName: "Base Vote",
    images: [
      {
        url: `${appUrl}/screenshot.png`,
        width: 1200,
        height: 630,
        alt: "Base Vote Preview",
      },
    ],
    locale: "en_US",
    type: "website",
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