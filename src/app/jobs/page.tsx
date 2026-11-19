import React from "react";
import type { Metadata } from "next";
import { JobsBoardClient } from "@/components/JobsBoardClient";
import { searchAndRankJobs } from "@/lib/jobs-store";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

export const dynamic = "force-dynamic";

const SITE_URL = getCanonicalSiteUrl();

export const metadata: Metadata = {
  title:
    "وظائف الخليج الموثقة اليوم (الإمارات، السعودية، قطر، الكويت) | Verified GCC HR Jobs",
  description:
    "تصفح أحدث الوظائف الموثقة بسجلات DNS MX في دبي، أبوظبي، الرياض، جدة، الدوحة، ومدينة الكويت. تقديم مباشر لصناديق بريد الموارد البشرية (HR) مع فحص مجاني للسيرة الذاتية بنظام ATS عبر منصة أسرع (Asra3.com).",
  keywords: [
    "وظائف الخليج اليوم",
    "وظائف دبي الموثقة",
    "وظائف الرياض وجدة",
    "وظائف الدوحة قطر",
    "وظائف الكويت",
    "Verified GCC jobs",
    "Dubai HR jobs direct apply",
    "Saudi Vision 2030 vacancies",
    "Asra3 jobs",
  ],
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "الوظائف الموثقة في الخليج — تقديم مباشر للـ HR | Asra3.com/jobs",
    description:
      "شواغر وظيفية مفحوصة بسجلات DNS MX ومرتبة خوارزمياً في الإمارات والسعودية وقطر والكويت.",
    url: "/jobs",
    type: "website",
  },
};

export default async function JobsHubPage() {
  const initialData = await searchAndRankJobs({ sort: "rank", limit: 12 });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/jobs#collection`,
        url: `${SITE_URL}/jobs`,
        name: "الوظائف الموثقة في الخليج | Verified GCC Corporate HR Jobs — Asra3.com",
        description:
          "Live DNS MX-verified corporate HR job listings across the UAE, Saudi Arabia, Qatar, and Kuwait.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "ItemList",
        itemListElement: initialData.jobs.slice(0, 10).map((job, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${SITE_URL}/jobs/${job.slug}`,
          name: `${job.title_ar} — ${job.company_name} (${job.city_name_ar})`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobsBoardClient initialData={initialData} />
    </>
  );
}
