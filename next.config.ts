import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Ignora gli errori di ESLint durante la build
  },
};

export default nextConfig;
