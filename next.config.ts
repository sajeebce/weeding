import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for VPS deployment
  output: "standalone",

  // Reduce parallel build workers to avoid OOM
  experimental: {
    cpus: 1,
  },


  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: "llcpad.com", // Main domain
      },
      {
        protocol: "https",
        hostname: "cdn.llcpad.com", // R2 CDN for uploaded files
      },
      {
        protocol: "https",
        hostname: "flagcdn.com", // Flag images for language switcher
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
