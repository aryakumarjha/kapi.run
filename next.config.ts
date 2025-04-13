import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  images: {
    remotePatterns: [new URL("https://media-assets.swiggy.com/**")],
  },
};

export default nextConfig;
