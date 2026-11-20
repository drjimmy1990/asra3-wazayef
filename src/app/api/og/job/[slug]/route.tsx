import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import type { ReactElement } from "react";
import { getJobBySlug } from "@/lib/jobs-store";
import { buildBrandedQrDataUri } from "@/lib/qr-code";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";
import {
  bilingualSafe,
  buildOgJobCardElement,
  latinSafe,
  OgJobCardData,
} from "@/lib/og-job-card-renderer";
import {
  getActiveOgJobTemplate,
  loadOgArabicFonts,
} from "@/lib/og-settings";
import {
  isValidOgJobTemplateId,
  OgJobTemplateId,
} from "@/lib/og-template-catalog";

export const dynamic = "force-dynamic";

const size = {
  width: 1200,
  height: 630,
};

const EMPLOYMENT_AR: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACT: "عقد",
  REMOTE: "عن بُعد",
};

function companyFromDomain(domain: string | null | undefined): string {
  const base = String(domain || "")
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co)\.(ae|sa|qa|kw)$/, "")
    .replace(/\.(com|net|org|gov|edu|co|io|ae|sa|qa|kw)$/, "")
    .split(".")
    .pop();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

// Render fully into memory so any renderer failure is catchable (never a
// half-streamed response that takes the server down).
async function renderToPng(
  element: ReactElement,
  cacheHeader: string
): Promise<Response> {
  const fonts = loadOgArabicFonts();
  const img = new ImageResponse(element, {
    ...size,
    fonts: fonts.length > 0 ? fonts : undefined,
  });
  const buf = await img.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cacheHeader,
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = req.nextUrl.searchParams;
  const requestedTemplate =
    searchParams.get("template") || searchParams.get("t") || "";
  const templateId: OgJobTemplateId = isValidOgJobTemplateId(requestedTemplate)
    ? requestedTemplate
    : getActiveOgJobTemplate();

  const isPreviewSlug = slug === "preview";
  const { job } = isPreviewSlug ? { job: null } : await getJobBySlug(slug);

  const siteUrl = getCanonicalSiteUrl();
  const jobUrl = isPreviewSlug
    ? `${siteUrl}/jobs`
    : `${siteUrl}/jobs/${encodeURIComponent(job?.slug || slug)}`;

  let qrDataUri = "";
  try {
    qrDataUri = buildBrandedQrDataUri(jobUrl, 210);
  } catch {
    qrDataUri = "";
  }

  let cardData: OgJobCardData;

  if (isPreviewSlug) {
    cardData = {
      titleAr: "مهندس مشاريع أول — البنية التحتية والطاقة",
      titleEn: "Senior MEP & Infrastructure Project Manager",
      companyName: "Emaar Engineering Group",
      countryCode: "AE",
      countryNameAr: "الإمارات",
      countryNameEn: "UAE",
      cityAr: "دبي",
      cityEn: "Dubai",
      industryAr: "الهندسة والإنشاءات",
      industryEn: "Engineering & Construction",
      salaryText: "18,000 - 24,000 AED",
      employmentLabelEn: "FULL TIME",
      employmentLabelAr: "دوام كامل",
      skills: ["PMP Certified", "Revit BIM", "FIDIC Contracts", "Primavera P6"],
      qrDataUri,
      isMxVerified: true,
    };
  } else {
    const countryCode = job?.country_code || "AE";
    const countryObj =
      INITIAL_COUNTRIES.find((c) => c.code === countryCode) ||
      INITIAL_COUNTRIES[0];
    const cityEn = latinSafe(job?.city_name_en, countryObj.cities[0].name_en);
    const cityAr = bilingualSafe(
      job?.city_name_ar,
      countryObj.cities[0].name_ar
    );
    const industryObj =
      INITIAL_INDUSTRIES.find((i) => i.id === job?.industry_id) ||
      INITIAL_INDUSTRIES[0];

    const titleEn = latinSafe(
      job?.title_en,
      "Verified Executive Opportunity in the GCC"
    );
    const titleAr = bilingualSafe(job?.title_ar, "");

    const companyName = bilingualSafe(
      job?.company_name,
      latinSafe(companyFromDomain(job?.company_domain), "GCC Verified Employer")
    );

    const empType = job?.employment_type || "FULL_TIME";
    const employmentLabelEn = empType.replace("_", " ");
    const employmentLabelAr = EMPLOYMENT_AR[empType] || "دوام كامل";

    const salaryText =
      job?.salary_min && job?.salary_max
        ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
        : `${countryCode} • ${employmentLabelEn}`;

    const skills = (job?.skills || ["ATS Ready", "Direct HR Inbox"])
      .map((s) => latinSafe(s, ""))
      .filter(Boolean)
      .slice(0, 4);

    // Keep country name compact for badges
    const shortCountryAr: Record<string, string> = {
      AE: "الإمارات",
      SA: "السعودية",
      QA: "قطر",
      KW: "الكويت",
    };

    cardData = {
      titleAr,
      titleEn,
      companyName,
      countryCode,
      countryNameAr: shortCountryAr[countryCode] || countryObj.name_ar,
      countryNameEn: countryObj.name_en,
      cityAr,
      cityEn,
      industryAr: industryObj.name_ar,
      industryEn: industryObj.name_en,
      salaryText,
      employmentLabelEn,
      employmentLabelAr,
      skills,
      qrDataUri,
      isMxVerified: job?.is_mx_verified !== false,
    };
  }

  const cacheHeader = isPreviewSlug
    ? "no-store, max-age=0"
    : requestedTemplate
    ? "public, max-age=3600, s-maxage=86400"
    : "public, max-age=300, s-maxage=600";

  try {
    return await renderToPng(
      buildOgJobCardElement(templateId, cardData),
      cacheHeader
    );
  } catch (err) {
    console.error(
      `[og] job card render failed for ${slug} (template=${templateId}):`,
      err
    );
    return Response.redirect(new URL("/opengraph-image", req.url), 302);
  }
}
