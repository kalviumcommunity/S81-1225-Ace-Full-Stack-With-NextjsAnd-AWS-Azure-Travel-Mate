import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker deployment
  // This creates a minimal production build that can run without node_modules
  output: "standalone",

  // Disable ESLint during production builds (already run in CI/CD)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during builds (already checked in CI/CD)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
