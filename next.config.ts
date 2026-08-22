import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  typedRoutes: true,
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
