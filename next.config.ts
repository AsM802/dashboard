import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// next.config.js
module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
};
