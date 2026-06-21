import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Approved logos are served from Vercel Blob (unoptimized) or /api/airline-logos/asset/.
    remotePatterns: [],
  },
};

export default nextConfig;
