import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["three"],
  async redirects() {
    return [
      {
        source: "/:locale/industries/:slug",
        destination: "/:locale/solutions",
        permanent: true,
      },
      {
        source: "/:locale/industries",
        destination: "/:locale/solutions",
        permanent: true,
      },
      {
        source: "/:locale/careers",
        destination: "/:locale/contact",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.strapiapp.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
