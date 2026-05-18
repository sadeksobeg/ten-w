import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** CSP for marketing site + Sentry + GA4 + Turnstile + Formspree + fonts */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://browser.sentry-cdn.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' https: blob:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.ingest.sentry.io https://challenges.cloudflare.com https://formspree.io https://*.formspree.io",
  "frame-src https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
].join("; ");

const staticAssetCache = "public, max-age=31536000, immutable";
const imageCache = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  poweredByHeader: false,
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "gsap",
      "three",
      "@react-three/fiber",
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ar",
        permanent: false,
      },
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
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: staticAssetCache }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: imageCache }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
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

const configWithIntl = withNextIntl(nextConfig);

export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithIntl, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
    })
  : configWithIntl;
