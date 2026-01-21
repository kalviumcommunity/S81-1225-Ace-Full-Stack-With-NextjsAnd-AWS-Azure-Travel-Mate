import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker deployment
  // This creates a minimal production build that can run without node_modules
  output: "standalone",

  // Disable TypeScript errors during builds (already checked in CI/CD)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure allowed image domains for next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
