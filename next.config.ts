import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.kiwi.com',
        pathname: '/airlines/**',
      },
    ],
  },
};

export default nextConfig;
