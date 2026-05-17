import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone bundle for VPS / PM2 (see deploy/DEPLOYMENT.md)
  output: "standalone",
};

export default nextConfig;
