import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://vaic-2026.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
