import type { NextConfig } from "next";


const nextConfig = {
  
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

  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  
  serverExternalPackages: ["pino", "pino-pretty", "lokijs", "encoding", "thread-stream"],
  
  // 4. FIX WEBPACK 
  webpack: (config: any) => { 
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