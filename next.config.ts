import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gomoku-trainer',
  images: { unoptimized: true },
};

export default nextConfig;
