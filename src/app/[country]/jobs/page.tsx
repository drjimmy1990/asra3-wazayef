import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobsBoardClient } from "@/components/JobsBoardClient";
import { searchAndRankJobs } from "@/lib/jobs-store";
import { INITIAL_COUNTRIES } from "@/lib/seed-data";
import { CountryCode } from "@/lib/types";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

export const dynamic = "force-dynamic";

const SITE_URL = getCanonicalSiteUrl();

function resolveCountry(slug: string) {
  const code = slug.toUpperCase() as CountryCode;
  return INITIAL_COUNTRIES.find((c) => c.code === code) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const cObj = resolveCountry(country);
  if (!cObj) return {};

  const citiesAr = cObj.cities.slice(0, 3).map((c) => c.name_ar).join("، ");
  const citiesEn = cObj.cities.slice(0, 3).map((c) => c.name_en).join(", ");
  const canonical = `/${cObj.code.toLowerCase()}/jobs`;

  return {
    title: `وظائف ${cObj.name_ar} الموثقة اليوم (${citiesAr}) | Verified ${cObj.name_en} HR Jobs`,
    description: `تصفح أحدث الشواغر الوظيفية الموثقة بسجلات DNS MX في ${cObj.name_ar} (${citiesAr}) مع التقديم المباشر لبريد مسؤولي الموارد البشرية وفحص السيرة الذاتية مجاناً بنظام ATS. Direct HR vacancies in ${citiesEn}.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `وظائف ${cObj.name_ar} الموثقة — Asra3.com${canonical}`,
      description: `Verified corporate HR vacancies in ${citiesEn}, ${cObj.name_en}.`,
      url: canonical,
      type: "website",
    },
  };
}

export default async function CountryJobsHubPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const cObj = resolveCountry(country);
  if (!cObj) {
    notFound();
  }

  const initialData = await searchAndRankJobs({
    country: cObj.code,
    sort: "rank",
    limit: 12,
  });

  const citiesAr = cObj.cities.slice(0, 4).map((c) => c.name_ar).join("، ");
  const citiesEn = cObj.cities.slice(0, 4).map((c) => c.name_en).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${SITE_URL}/${cObj.code.toLowerCase()}/jobs`,
    name: `وظائف ${cObj.name_ar} الموثقة | Verified Jobs in ${cObj.name_en}`,
    about: {
      "@type": "Country",
      name: cObj.name_en,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobsBoardClient
        key={cObj.code}
        initialData={initialData}
        lockedCountry={cObj.code}
        heroHeadingAr={`الوظائف الموثقة في ${cObj.name_ar} (${citiesAr})`}
        heroHeadingEn={`Verified Corporate HR Jobs in ${cObj.name_en}`}
        heroSubheadingAr={`شواغر وظيفية مفحوصة بسجلات DNS MX في ${citiesAr} بعملة (${cObj.currency_code}) مع تقديم مباشر لقسم الموارد البشرية.`}
        heroSubheadingEn={`Live MX-verified corporate HR vacancies across ${citiesEn} (${cObj.currency_code}) with 1-click direct HR contact and ATS CV distribution.`}
      />
    </>
  );
}
