import { NextRequest, NextResponse } from "next/server";
import { isWebhookAuthorized } from "@/lib/admin-auth";
import { harvestLiveGccJobs } from "@/lib/job-harvester";
import { NewJobInput, upsertJobPostings } from "@/lib/jobs-store";
import { CountryCode, EmploymentType } from "@/lib/types";

/**
 * Automated Job Harvester & External RSS/Webhook Ingest Endpoint (called by n8n)
 * 1) If `body.jobs` array is provided, validates, deduplicates & publishes them.
 * 2) Otherwise (or if `body.runTelegramHarvest !== false`), scrapes live GCC
 *    Telegram job channels, verifies corporate DNS MX, publishes structured jobs,
 *    and triggers IndexNow + Google Indexing API pings.
 */
export async function POST(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized webhook signature" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    let externalInserted = 0;
    let externalDuplicates = 0;

    if (Array.isArray(body.jobs) && body.jobs.length > 0) {
      const mapped: NewJobInput[] = body.jobs
        .map((raw: Record<string, unknown>) => {
          const titleEn = String(raw.title_en || raw.title || "").trim();
          const titleAr = String(raw.title_ar || titleEn).trim();
          const companyName = String(raw.company_name || "GCC Employer").trim();
          if (!titleEn) return null;

          const rawCountry = String(raw.country_code || "AE")
            .toUpperCase()
            .trim();
          const country_code: CountryCode = ["AE", "SA", "QA", "KW"].includes(
            rawCountry
          )
            ? (rawCountry as CountryCode)
            : "AE";

          const rawType = String(raw.employment_type || "FULL_TIME")
            .toUpperCase()
            .trim();
          const employment_type: EmploymentType = [
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "REMOTE",
          ].includes(rawType)
            ? (rawType as EmploymentType)
            : "FULL_TIME";

          return {
            title_ar: titleAr,
            title_en: titleEn,
            company_name: companyName,
            company_domain: raw.company_domain
              ? String(raw.company_domain)
              : undefined,
            apply_email: raw.apply_email ? String(raw.apply_email) : null,
            apply_url: raw.apply_url ? String(raw.apply_url) : null,
            country_code,
            city_id: raw.city_id ? String(raw.city_id) : undefined,
            industry_id: raw.industry_id ? String(raw.industry_id) : undefined,
            employment_type,
            summary_ar: String(raw.summary_ar || raw.summary_en || titleAr),
            summary_en: String(raw.summary_en || raw.summary_ar || titleEn),
            skills: Array.isArray(raw.skills)
              ? raw.skills.map((s) => String(s))
              : undefined,
            source_type: "verified_harvester" as const,
            source_channel: String(body.source || "n8n_external_feed"),
            is_mx_verified: raw.is_mx_verified !== false,
          } as NewJobInput;
        })
        .filter((x: NewJobInput | null): x is NewJobInput => x !== null);

      const res = await upsertJobPostings(mapped);
      externalInserted = res.inserted.length;
      externalDuplicates = res.skippedDuplicates;
    }

    let tgSummary = {
      channelsScraped: 0,
      postsScanned: 0,
      jobsPublished: 0,
      duplicatesSkipped: 0,
      companiesEnriched: 0,
      categoriesUpdated: 0,
      publishedSlugs: [] as string[],
    };

    if (body.runTelegramHarvest !== false) {
      tgSummary = await harvestLiveGccJobs({
        pagesPerChannel: Number(body.pagesPerChannel) || 2,
        maxJobsToInsert: Number(body.maxJobsToInsert) || 18,
      });
    }

    return NextResponse.json({
      ok: true,
      externalInserted,
      externalDuplicates,
      ...tgSummary,
      totalNewJobsPublished: externalInserted + tgSummary.jobsPublished,
    });
  } catch (err) {
    console.error("jobs-harvest webhook error:", err);
    return NextResponse.json(
      { error: "Failed to run automated job harvest" },
      { status: 500 }
    );
  }
}
