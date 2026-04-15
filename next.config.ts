import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath controls the subpath the app is served from.
  // Set NEXT_PUBLIC_BASE_PATH='' (empty) when moving to a subdomain or root domain.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/ttfinder",
};

export default nextConfig;
