import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@livesupport/core',
    '@livesupport/ui',
    '@livesupport/database',
    '@livesupport/ai',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
