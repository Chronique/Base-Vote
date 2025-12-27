import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Properti 'eslint' dihapus karena tidak lagi didukung di tipe NextConfig

  // Tetap gunakan properti lain yang masih didukung
  typescript: {
    ignoreBuildErrors: true,
  },

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

  // Gunakan experimental settings untuk stabilitas build di Vercel
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  serverExternalPackages: ["pino", "pino-pretty", "lokijs", "encoding", "thread-stream"],
  
  webpack: (config) => { 
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    return config;
  },
};

export default nextConfig;