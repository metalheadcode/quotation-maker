import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.cache = {
      type: "memory",
    };
    return config;
  },
};

export default nextConfig;
