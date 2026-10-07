import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/images/:slug(.*[Hh]erry.*)",
        destination: "/images/herry-ristiawan.png",
      },
      {
        source: "/images/:slug(.*[Aa]gung.*)",
        destination: "/images/agung-nugraha.jpg",
      },
      {
        source: "/images/:slug(.*[Cc]haidar.*)",
        destination: "/images/chaidar-syaifullah.png",
      },
    ];
  },
};

export default nextConfig;
