import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Web Workers are handled natively by webpack 5
  // via `new Worker(new URL('./path.ts', import.meta.url))`
};

export default nextConfig;
