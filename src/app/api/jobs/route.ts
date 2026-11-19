import { NextRequest, NextResponse } from "next/server";
import {
  getJobBySlug,
  incrementJobEngagement,
  searchAndRankJobs,
} from "@/lib/jobs-store";
import { CountryCode, EmploymentType, JobSortOption } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const rawCountry = (searchParams.get("country") || "").toUpperCase().trim();
  const country: CountryCode | "" = ["AE", "SA", "QA", "KW"].includes(
    rawCountry
  )
    ? (rawCountry as CountryCode)
    : "";
  const city = searchParams.get("city") || "";
  const industry = searchParams.get("industry") || "";
  const rawType = (searchParams.get("type") || "").toUpperCase().trim();
  const employmentType: EmploymentType | "" = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "REMOTE",
  ].includes(rawType)
    ? (rawType as EmploymentType)
    : "";
  const verifiedOnly = searchParams.get("verified") === "1";
  const rawSort = searchParams.get("sort") || "rank";
  const sort: JobSortOption = ["rank", "newest", "salary", "verified"].includes(
    rawSort
  )
    ? (rawSort as JobSortOption)
    : "rank";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "12") || 12));

  const result = await searchAndRankJobs({
    q,
    country,
    city,
    industry,
    employmentType,
    verifiedOnly,
    sort,
    page,
    limit,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "").trim();
    const action = body.action === "apply" ? "apply" : "view";

    if (!slug) {
      return NextResponse.json({ error: "Missing job slug" }, { status: 400 });
    }

    await incrementJobEngagement(slug, action);

    if (action === "apply") {
      const { job, isExpired } = await getJobBySlug(slug);
      if (!job || isExpired) {
        return NextResponse.json(
          { error: "This position is no longer accepting applications." },
          { status: 410 }
        );
      }
      return NextResponse.json({
        ok: true,
        apply_email: job.apply_email || null,
        apply_url: job.apply_url || null,
        apply_whatsapp: job.apply_whatsapp || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
