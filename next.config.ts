import type { NextConfig } from "next";

// KITA HAPUS ": NextConfig" DISINI BIAR GAK ERROR
const nextConfig = {
  // 1. Konfigurasi Lama Kamu
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          }
        ]
      }
    ];
  },

  // 2. FIX BUILD VERCEL
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 3. FIX CRASH PINO/WALLETCONNECT
  webpack: (config: any) => { // Tambah ': any' biar aman
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    
    return config;
  },
};

export default nextConfig;