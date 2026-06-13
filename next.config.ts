import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Logos are served from local approved assets under /public/airline-logos.
    remotePatterns: [],
  },
};

export default nextConfig;
