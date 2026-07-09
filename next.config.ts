import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile as the monorepo root
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
