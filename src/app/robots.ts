import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

const PRIVATE_DISALLOW = ["/admin", "/api/", "/track/", "/checkout/"];

export default function robots(): MetadataRoute.Robots {
  const cleanSiteUrl = SITE_URL.replace(/\/+$/, "");
  const explicitBots = [
    "*",
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
    "Applebot-Extended",
  ];

  return {
    rules: explicitBots.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: PRIVATE_DISALLOW,
    })),
    sitemap: `${cleanSiteUrl}/sitemap.xml`,
    host: cleanSiteUrl,
  };
}
