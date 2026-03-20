import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uiverse/schema", "@uiverse/exporter"]
};

export default nextConfig;
