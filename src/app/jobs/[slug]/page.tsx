import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailClient } from "@/components/JobDetailClient";
import { getJobBySlug } from "@/lib/jobs-store";
import { buildBrandedQrDataUri } from "@/lib/qr-code";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import { getActiveOgJobTemplate } from "@/lib/og-settings";

export const dynamic = "force-dynamic";

const SITE_URL = getCanonicalSiteUrl();

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job Not Found | Asra3.com" };
  }

  const title = `${job.title_ar} — ${job.company_name} (${job.city_name_ar}) | ${job.title_en}`;
  const description = `${job.summary_ar} | Direct HR Apply at ${job.company_name} in ${job.city_name_en}, ${job.country_code}.`;
  const canonicalPath = `/jobs/${job.slug}`;
  const activeOgTemplate = getActiveOgJobTemplate();
  const ogImage = `${SITE_URL}/api/og/job/${job.slug}?t=${activeOgTemplate}`;

  return {
    title,
    description,
    keywords: [
      job.title_ar,
      job.title_en,
      job.company_name,
      `وظائف ${job.city_name_ar}`,
      `${job.title_en} jobs ${job.city_name_en}`,
      ...job.skills,
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${job.title_en} at ${job.company_name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { job, isExpired, similarJobs } = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  // Google Jobs Rich Result HTML description requirement
  const htmlDescription = [
    `<p>${escapeHtml(job.summary_ar)}</p>`,
    `<p>${escapeHtml(job.summary_en)}</p>`,
    job.requirements_en.length
      ? `<h3>Key Qualifications</h3><ul>${job.requirements_en
          .map((r) => `<li>${escapeHtml(r)}</li>`)
          .join("")}</ul>`
      : "",
    job.skills.length
      ? `<p><strong>Required Skills:</strong> ${escapeHtml(job.skills.join(", "))}</p>`
      : "",
  ].join("");

  const breadcrumbJsonLd = {
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
        name: "وظائف الخليج | GCC Jobs",
        item: `${SITE_URL}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.city_name_en,
        item: `${SITE_URL}/${job.country_code.toLowerCase()}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: job.title_en,
        item: `${SITE_URL}/jobs/${job.slug}`,
      },
    ],
  };

  // Google Jobs only accepts these employmentType values. REMOTE is not a type —
  // it is expressed via jobLocationType=TELECOMMUTE + applicantLocationRequirements.
  const googleEmploymentType =
    job.employment_type === "CONTRACT"
      ? "CONTRACTOR"
      : job.employment_type === "PART_TIME"
      ? "PART_TIME"
      : "FULL_TIME";
  const isRemote = job.employment_type === "REMOTE";

  // Emit Google Jobs `JobPosting` structured data ONLY while active (Google Jobs policy)
  const jobPostingJsonLd = !isExpired
    ? {
        "@type": "JobPosting",
        title: job.title_en,
        description: htmlDescription,
        identifier: {
          "@type": "PropertyValue",
          name: job.company_name,
          value: job.id,
        },
        datePosted: job.published_at,
        validThrough: job.expires_at,
        employmentType: googleEmploymentType,
        // Candidates apply by emailing the employer's HR inbox, not on-site
        directApply: false,
        hiringOrganization: {
          "@type": "Organization",
          name: job.company_name,
          ...(job.company_website ? { sameAs: job.company_website } : {}),
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city_name_en,
            addressRegion: job.city_name_en,
            addressCountry: job.country_code,
          },
        },
        ...(isRemote
          ? {
              jobLocationType: "TELECOMMUTE",
              applicantLocationRequirements: {
                "@type": "Country",
                name: job.country_code,
              },
            }
          : {}),
        ...(job.salary_min && job.salary_max
          ? {
              baseSalary: {
                "@type": "MonetaryAmount",
                currency: job.salary_currency,
                value: {
                  "@type": "QuantitativeValue",
                  minValue: job.salary_min,
                  maxValue: job.salary_max,
                  unitText: "MONTH",
                },
              },
            }
          : {}),
      }
    : null;

  const fullGraph = {
    "@context": "https://schema.org",
    "@graph": jobPostingJsonLd
      ? [breadcrumbJsonLd, jobPostingJsonLd]
      : [breadcrumbJsonLd],
  };

  const activeOgTemplate = getActiveOgJobTemplate();
  const jobCanonicalUrl = `${SITE_URL}/jobs/${job.slug}`;
  let qrDataUri = "";
  try {
    qrDataUri = buildBrandedQrDataUri(jobCanonicalUrl, 196);
  } catch {
    qrDataUri = "";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fullGraph) }}
      />
      <JobDetailClient
        job={{ ...job, apply_email: null }}
        isExpired={isExpired}
        similarJobs={similarJobs}
        qrDataUri={qrDataUri}
        jobUrl={jobCanonicalUrl}
        ogTemplate={activeOgTemplate}
      />
    </>
  );
}
