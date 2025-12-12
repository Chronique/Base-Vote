import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matikan indikator dev (opsional, biar gak warning)
  // devIndicators: false, 

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
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Access-Control-Allow-Origin", value: "*" }
        ]
      }
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  serverExternalPackages: ["pino", "pino-pretty", "lokijs", "encoding", "thread-stream"],
  
  webpack: (config) => { 
    // 1. Ignore modul-modul server/logger yang suka bikin error di browser
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // 2. Fallback untuk modul nodejs yang tidak ada di browser
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };

    // === INI PERBAIKAN PENTINGNYA ===
    // Memaksa webpack mengabaikan modul React Native agar build Vercel SUKSES
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    return config;
  },
};

export default nextConfig;