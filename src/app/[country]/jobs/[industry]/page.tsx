import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobsBoardClient } from "@/components/JobsBoardClient";
import { searchAndRankJobs } from "@/lib/jobs-store";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";
import { CountryCode } from "@/lib/types";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

export const dynamic = "force-dynamic";

const SITE_URL = getCanonicalSiteUrl();

function resolveTaxonomy(countrySlug: string, industrySlug: string) {
  const code = countrySlug.toUpperCase() as CountryCode;
  const country = INITIAL_COUNTRIES.find((c) => c.code === code) || null;
  const industry =
    INITIAL_INDUSTRIES.find((i) => i.id === industrySlug.toLowerCase()) || null;
  return { country, industry };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; industry: string }>;
}): Promise<Metadata> {
  const { country: cSlug, industry: iSlug } = await params;
  const { country, industry } = resolveTaxonomy(cSlug, iSlug);
  if (!country || !industry) return {};

  const canonical = `/${country.code.toLowerCase()}/jobs/${industry.id}`;
  const citiesAr = country.cities.slice(0, 3).map((c) => c.name_ar).join("، ");

  return {
    title: `وظائف ${industry.name_ar} في ${country.name_ar} (${citiesAr}) | ${industry.name_en} Jobs in ${country.name_en}`,
    description: `قدّم مباشرة على أحدث وظائف ${industry.name_ar} الموثقة في ${country.name_ar} (${citiesAr}) أو أرسل سيرتك الذاتية المحسنة بنظام ATS إلى مئات شركات القطاع عبر Asra3.com.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `وظائف ${industry.name_ar} في ${country.name_ar} | Asra3.com`,
      description: `MX-verified ${industry.name_en} HR vacancies in ${country.name_en}.`,
      url: canonical,
      type: "website",
    },
  };
}

export default async function CountryIndustryJobsPage({
  params,
}: {
  params: Promise<{ country: string; industry: string }>;
}) {
  const { country: cSlug, industry: iSlug } = await params;
  const { country, industry } = resolveTaxonomy(cSlug, iSlug);

  if (!country || !industry) {
    notFound();
  }

  const initialData = await searchAndRankJobs({
    country: country.code,
    industry: industry.id,
    sort: "rank",
    limit: 12,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Asra3.com",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `وظائف ${country.name_ar}`,
        item: `${SITE_URL}/${country.code.toLowerCase()}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: industry.name_ar,
        item: `${SITE_URL}/${country.code.toLowerCase()}/jobs/${industry.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobsBoardClient
        initialData={initialData}
        lockedCountry={country.code}
        lockedIndustry={industry.id}
        heroHeadingAr={`وظائف ${industry.name_ar} في ${country.name_ar}`}
        heroHeadingEn={`${industry.name_en} Jobs in ${country.name_en}`}
        heroSubheadingAr={`شواغر قطاع (${industry.name_ar}) الموثقة في ${country.name_ar} — قدّم مباشرة أو وزّع سيرتك الذاتية على كافة شركات التخصص.`}
        heroSubheadingEn={`Verified ${industry.name_en} corporate vacancies in ${country.name_en} — apply direct to HR or broadcast your ATS-optimized CV across matching employers.`}
      />
    </>
  );
}
