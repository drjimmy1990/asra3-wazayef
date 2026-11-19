import { NextResponse } from "next/server";
import { searchAndRankJobs } from "@/lib/jobs-store";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getCanonicalSiteUrl();
  const { jobs } = await searchAndRankJobs({ sort: "newest", limit: 50 });

  const itemsXml = jobs
    .map((job) => {
      const link = `${siteUrl}/jobs/${job.slug}`;
      return `    <item>
      <title>${escapeXml(`${job.title_en} — ${job.company_name} (${job.city_name_en}, ${job.country_code})`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(job.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(job.country_code)}</category>
      <description>${escapeXml(`${job.summary_ar} | ${job.summary_en}`)}</description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Asra3.com | وظائف الخليج الموثقة — Verified GCC Jobs (UAE, Saudi, Qatar, Kuwait)</title>
    <link>${siteUrl}/jobs</link>
    <atom:link href="${siteUrl}/jobs/rss.xml" rel="self" type="application/rss+xml" />
    <description>Live MX-verified corporate HR job vacancies across Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, and Kuwait City powered by Asra3.com.</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
