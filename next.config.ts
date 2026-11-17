import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["unpdf", "mammoth", "nodemailer"],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    const rootRedirectPaths = [
      "/docs",
      "/docs/:path*",
      "/documentation",
      "/documentation/:path*",
      "/api-docs",
      "/api-docs/:path*",
      "/openapi.json",
      "/postman.json",
      "/login",
      "/signin",
      "/register",
      "/signup",
      "/auth/:path*",
      "/dashboard",
      "/dashboard/:path*",
      "/workspace",
      "/workspace/:path*",
      "/crm",
      "/crm/:path*",
      "/whatsapp",
      "/facebook",
      "/instagram",
      "/channels",
      "/broadcasts",
      "/campaigns",
      "/features",
      "/pricing",
      "/plans",
      "/solutions",
      "/services",
      "/blog",
      "/blog/:path*",
      "/contact",
      "/support",
      "/ar",
    ];

    return [
      ...rootRedirectPaths.map((source) => ({
        source,
        destination: "/",
        permanent: true,
      })),
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/data-deletion", destination: "/privacy", permanent: true },
      { source: "/terms-of-service", destination: "/terms", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/uae", destination: "/ae", permanent: true },
      { source: "/dubai", destination: "/ae", permanent: true },
      { source: "/ksa", destination: "/sa", permanent: true },
      { source: "/saudi", destination: "/sa", permanent: true },
      { source: "/saudi-arabia", destination: "/sa", permanent: true },
      { source: "/riyadh", destination: "/sa", permanent: true },
      { source: "/qatar", destination: "/qa", permanent: true },
      { source: "/doha", destination: "/qa", permanent: true },
      { source: "/kuwait", destination: "/kw", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
