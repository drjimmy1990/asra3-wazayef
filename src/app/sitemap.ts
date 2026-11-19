import type { MetadataRoute } from "next";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";
import { getAllJobsRaw } from "@/lib/jobs-store";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = getCanonicalSiteUrl();
  const now = new Date();
  const bilingualAlternates = {
    languages: {
      ar: `${SITE_URL}/`,
      en: `${SITE_URL}/en`,
    },
  };

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: bilingualAlternates,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.98,
      alternates: bilingualAlternates,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.99,
    },
    {
      url: `${SITE_URL}/employers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ae`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/sa`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/qa`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kw`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/track`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Published jobs drive both the per-job URLs and which sector hubs are listed
  const publishedJobs = (await getAllJobsRaw()).filter(
    (j) => j.status === "published"
  );
  const populatedHubs = new Set<string>();
  for (const job of publishedJobs) {
    const cSlug = job.country_code.toLowerCase();
    populatedHubs.add(`${cSlug}/${job.industry_id}`);
    for (const sec of job.secondary_industries || []) {
      populatedHubs.add(`${cSlug}/${sec}`);
    }
  }

  // 4 country job hubs always; country x industry hubs only when they have jobs
  // (empty hubs are thin content / soft-404s and are marked noindex)
  const programmaticEntries: MetadataRoute.Sitemap = [];
  for (const country of INITIAL_COUNTRIES) {
    const cSlug = country.code.toLowerCase();
    programmaticEntries.push({
      url: `${SITE_URL}/${cSlug}/jobs`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.94,
    });
    for (const ind of INITIAL_INDUSTRIES) {
      if (!populatedHubs.has(`${cSlug}/${ind.id}`)) continue;
      programmaticEntries.push({
        url: `${SITE_URL}/${cSlug}/jobs/${ind.id}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.86,
      });
    }
  }

  const jobEntries: MetadataRoute.Sitemap = publishedJobs
    .slice(0, 1000)
    .map((job) => ({
      url: `${SITE_URL}/jobs/${job.slug}`,
      lastModified: new Date(job.published_at),
      changeFrequency: "daily",
      priority: job.is_featured ? 0.92 : 0.88,
    }));

  return [...staticEntries, ...programmaticEntries, ...jobEntries];
}
