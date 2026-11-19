// ==============================================================================
// ASRA3.COM — Automated GCC Jobs Store, Ranking Engine & Employer Intake
// Dual Persistence: Supabase PostgreSQL (`jobs` table) + `.data/jobs.json`
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  CountryCode,
  CurrencyCode,
  EmploymentType,
  JobPostingRecord,
  JobPostingStatus,
  JobSearchParams,
  JobSearchResponse,
  JobSourceType,
} from "@/lib/types";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES, maskEmail } from "@/lib/seed-data";
import {
  classifyCompanyIndustry,
  verifyCompanyEmail,
} from "@/lib/company-verifier";
import { bulkImportCompanies, isSupabaseConfigured } from "@/lib/store";
import { notifySearchEnginesForUrls } from "@/lib/seo-indexer";

const DATA_DIR = path.join(process.cwd(), ".data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

function getSupabaseJobsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function slugifyJobSegment(input: string): string {
  const ascii = input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return ascii || "gcc-executive-role";
}

export function computeJobDedupeHash(params: {
  titleEn: string;
  titleAr?: string;
  companyDomain?: string;
  companyName: string;
  countryCode: CountryCode;
  cityId: string;
}): string {
  const titleKey = (params.titleEn || params.titleAr || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .trim();
  const orgKey = (params.companyDomain || params.companyName || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF.]+/g, "")
    .trim();
  const raw = `${titleKey}|${orgKey}|${params.countryCode}|${params.cityId}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

/**
 * Early builds shipped fabricated demo listings (ids `seed-job-*`, channel
 * `asra3_verified_seed`). They are never real vacancies, so they are purged
 * from the local store on read and never shown publicly.
 */
function isLegacyDemoSeed(job: Partial<JobPostingRecord>): boolean {
  return (
    String(job.id || "").startsWith("seed-job-") ||
    job.source_channel === "asra3_verified_seed"
  );
}

function readLocalJobs(): JobPostingRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(JOBS_FILE)) {
      return [];
    }
    const parsed = JSON.parse(fs.readFileSync(JOBS_FILE, "utf8"));
    if (!Array.isArray(parsed)) return [];

    const real = (parsed as JobPostingRecord[]).filter(
      (j) => !isLegacyDemoSeed(j)
    );
    if (real.length !== parsed.length) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify(real, null, 2), "utf8");
    }
    return real;
  } catch {
    return [];
  }
}

function writeLocalJobs(jobs: JobPostingRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf8");
  } catch (err) {
    console.error("Failed writing .data/jobs.json:", err);
  }
}

function normalizeJobRow(row: JobPostingRecord): JobPostingRecord {
  const nowMs = Date.now();
  const expMs = new Date(row.expires_at).getTime();
  const autoStatus: JobPostingStatus =
    row.status === "published" && Number.isFinite(expMs) && expMs < nowMs
      ? "expired"
      : row.status;

  let cleanSourceChannel = row.source_channel || null;
  const parsedSecondary: string[] = Array.isArray(row.secondary_industries)
    ? [...row.secondary_industries]
    : [];

  if (cleanSourceChannel && cleanSourceChannel.includes("|sectors:")) {
    const [baseChan, secRaw] = cleanSourceChannel.split("|sectors:");
    cleanSourceChannel = baseChan || null;
    if (secRaw) {
      for (const s of secRaw.split(",")) {
        const trimmed = s.trim();
        if (trimmed && !parsedSecondary.includes(trimmed)) {
          parsedSecondary.push(trimmed);
        }
      }
    }
  }

  return {
    ...row,
    status: autoStatus,
    source_channel: cleanSourceChannel,
    secondary_industries: parsedSecondary,
    masked_apply_email: row.apply_email ? maskEmail(row.apply_email) : null,
    requirements_ar: Array.isArray(row.requirements_ar) ? row.requirements_ar : [],
    requirements_en: Array.isArray(row.requirements_en) ? row.requirements_en : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
  };
}

/**
 * Single source of truth for reads: merges the Supabase `jobs` table with the
 * local `.data/jobs.json` volume (keyed by dedupe_hash) so a job that exists in
 * either store always resolves — no more 404s from the two stores drifting.
 * Supabase wins on status/social fields; local keeps `secondary_industries`.
 */
export async function getAllJobsRaw(): Promise<JobPostingRecord[]> {
  const merged = new Map<string, JobPostingRecord>();

  for (const row of readLocalJobs()) {
    merged.set(row.dedupe_hash || row.id, row);
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseJobsClient();
      const { data, error } = await sb
        .from("jobs")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(1000);
      if (!error && Array.isArray(data)) {
        for (const row of data as JobPostingRecord[]) {
          if (isLegacyDemoSeed(row)) continue;
          const key = row.dedupe_hash || row.id;
          const local = merged.get(key);
          merged.set(key, {
            ...local,
            ...row,
            secondary_industries:
              local?.secondary_industries || row.secondary_industries,
          });
        }
      }
    } catch {
      // `jobs` table not created yet — local volume store still serves jobs
    }
  }

  return Array.from(merged.values())
    .map(normalizeJobRow)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
}

/**
 * Multi-Signal Search & Relevance Ranking Scorer (0 - 135 scale)
 * RankScore = (0.35 * TextMatch) + (0.25 * FreshnessDecay) + (0.20 * TrustTier)
 *           + (0.10 * CompletenessScore) + (0.10 * EngagementBoost) + FeaturedBoost
 */
export function scoreJobForQuery(
  job: JobPostingRecord,
  rawQuery?: string
): number {
  const q = (rawQuery || "").trim().toLowerCase();
  let textMatch = 70; // Baseline relevance when browsing without keyword query

  if (q) {
    const terms = q.split(/\s+/).filter((t) => t.length >= 2);
    const titleHaystack = `${job.title_en} ${job.title_ar}`.toLowerCase();
    const skillHaystack = job.skills.join(" ").toLowerCase();
    const companyHaystack = `${job.company_name} ${job.city_name_en} ${job.city_name_ar}`.toLowerCase();
    const bodyHaystack = `${job.summary_en} ${job.summary_ar} ${job.requirements_en.join(" ")} ${job.requirements_ar.join(" ")}`.toLowerCase();

    if (terms.length === 0) {
      textMatch = titleHaystack.includes(q) ? 100 : bodyHaystack.includes(q) ? 65 : 0;
    } else {
      let matchedTerms = 0;
      let weightedHits = 0;
      for (const term of terms) {
        let hit = false;
        if (titleHaystack.includes(term)) {
          weightedHits += 45;
          hit = true;
        }
        if (skillHaystack.includes(term)) {
          weightedHits += 30;
          hit = true;
        }
        if (companyHaystack.includes(term)) {
          weightedHits += 20;
          hit = true;
        }
        if (bodyHaystack.includes(term)) {
          weightedHits += 12;
          hit = true;
        }
        if (hit) matchedTerms++;
      }
      if (matchedTerms === 0) return -1; // Exclude non-matching jobs when query is present
      const coverageRatio = matchedTerms / terms.length;
      textMatch = Math.min(100, Math.round(weightedHits / terms.length) * coverageRatio + 25);
    }
  }

  // Freshness decay (14-day half-life)
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(job.published_at).getTime()) / (1000 * 3600)
  );
  const freshnessDecay = Math.round(100 * Math.pow(0.5, ageHours / (14 * 24)));

  // Trust tier (Direct MX-verified employer > MX-verified harvester > unverified)
  const trustTier =
    job.source_type === "employer_direct" && job.is_mx_verified
      ? 100
      : job.is_mx_verified
      ? 88
      : 50;

  // Detail & salary transparency completeness
  let completeness = 50;
  if (job.salary_min && job.salary_max) completeness += 25;
  if (job.skills.length >= 4) completeness += 15;
  if (job.requirements_en.length >= 2 || job.requirements_ar.length >= 2) {
    completeness += 10;
  }

  // Engagement velocity boost
  const engagement = Math.min(
    100,
    25 + job.apply_clicks_count * 4 + Math.round(job.views_count * 0.4)
  );

  const featuredBoost = job.is_featured ? 35 : 0;

  const composite =
    0.35 * textMatch +
    0.25 * freshnessDecay +
    0.2 * trustTier +
    0.1 * Math.min(100, completeness) +
    0.1 * engagement +
    featuredBoost;

  return Math.round(composite * 10) / 10;
}

export async function searchAndRankJobs(
  params: JobSearchParams = {},
  options?: { includeSensitiveApplyEmail?: boolean }
): Promise<JobSearchResponse> {
  const all = await getAllJobsRaw();
  const activePool = all.filter((j) =>
    params.includePending
      ? j.status === "published" || j.status === "pending_review"
      : j.status === "published"
  );

  const countsByCountry: Record<CountryCode, number> = {
    AE: 0,
    SA: 0,
    QA: 0,
    KW: 0,
  };
  const countsByIndustry: Record<string, number> = {};

  for (const j of all) {
    if (j.status !== "published") continue;
    if (countsByCountry[j.country_code] !== undefined) {
      countsByCountry[j.country_code]++;
    }
    const allCats = new Set([
      j.industry_id,
      ...(j.secondary_industries || []),
    ]);
    for (const cat of allCats) {
      countsByIndustry[cat] = (countsByIndustry[cat] || 0) + 1;
    }
  }

  const scored: JobPostingRecord[] = [];

  for (const job of activePool) {
    if (params.country && job.country_code !== params.country) continue;
    if (params.city && job.city_id !== params.city) continue;
    if (
      params.industry &&
      job.industry_id !== params.industry &&
      !job.secondary_industries?.includes(params.industry)
    ) {
      continue;
    }
    if (params.employmentType && job.employment_type !== params.employmentType) {
      continue;
    }
    if (params.verifiedOnly && !job.is_mx_verified) continue;

    const score = scoreJobForQuery(job, params.q);
    if (score < 0) continue;

    scored.push({
      ...job,
      apply_email: options?.includeSensitiveApplyEmail ? job.apply_email : null,
      rank_score: score,
    });
  }

  const sortMode = params.sort || "rank";
  scored.sort((a, b) => {
    if (sortMode === "newest") {
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }
    if (sortMode === "salary") {
      const aSal = a.salary_max || a.salary_min || 0;
      const bSal = b.salary_max || b.salary_min || 0;
      if (bSal !== aSal) return bSal - aSal;
    }
    if (sortMode === "verified") {
      if (a.is_mx_verified !== b.is_mx_verified) {
        return a.is_mx_verified ? -1 : 1;
      }
    }
    return (b.rank_score || 0) - (a.rank_score || 0);
  });

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 12));
  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;

  return {
    jobs: scored.slice(offset, offset + limit),
    total,
    page,
    totalPages,
    totalActiveJobs:
      countsByCountry.AE +
      countsByCountry.SA +
      countsByCountry.QA +
      countsByCountry.KW,
    countsByCountry,
    countsByIndustry,
  };
}

export async function getJobBySlug(slug: string): Promise<{
  job: JobPostingRecord | null;
  isExpired: boolean;
  similarJobs: JobPostingRecord[];
}> {
  const cleanSlug = decodeURIComponent(slug || "").trim().toLowerCase();
  const all = await getAllJobsRaw();
  const found = all.find((j) => j.slug.toLowerCase() === cleanSlug) || null;

  if (!found || found.status === "rejected" || found.status === "pending_review") {
    return { job: null, isExpired: false, similarJobs: [] };
  }

  const isExpired = found.status === "expired";

  const similarJobs = all
    .filter(
      (j) =>
        j.status === "published" &&
        j.id !== found.id &&
        (j.country_code === found.country_code ||
          j.industry_id === found.industry_id)
    )
    .sort((a, b) => {
      const aMatch =
        (a.country_code === found.country_code ? 2 : 0) +
        (a.industry_id === found.industry_id ? 3 : 0);
      const bMatch =
        (b.country_code === found.country_code ? 2 : 0) +
        (b.industry_id === found.industry_id ? 3 : 0);
      if (bMatch !== aMatch) return bMatch - aMatch;
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    })
    .slice(0, 6)
    .map((j) => ({ ...j, apply_email: null }));

  return { job: found, isExpired, similarJobs };
}

export interface NewJobInput {
  title_ar: string;
  title_en: string;
  company_name: string;
  company_domain?: string;
  company_website?: string | null;
  apply_email?: string | null;
  apply_url?: string | null;
  apply_whatsapp?: string | null;
  country_code: CountryCode;
  city_id?: string;
  industry_id?: string;
  secondary_industries?: string[];
  employment_type?: EmploymentType;
  experience_level?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: CurrencyCode;
  summary_ar: string;
  summary_en: string;
  requirements_ar?: string[];
  requirements_en?: string[];
  skills?: string[];
  source_type?: JobSourceType;
  source_channel?: string | null;
  is_mx_verified?: boolean;
  is_featured?: boolean;
  status?: JobPostingStatus;
}

export async function upsertJobPostings(
  inputs: NewJobInput[]
): Promise<{
  inserted: JobPostingRecord[];
  skippedDuplicates: number;
}> {
  if (inputs.length === 0) {
    return { inserted: [], skippedDuplicates: 0 };
  }

  const existing = readLocalJobs();
  const seenHashes = new Set(existing.map((j) => j.dedupe_hash));
  const seenSlugs = new Set(existing.map((j) => j.slug));

  const inserted: JobPostingRecord[] = [];
  let skippedDuplicates = 0;
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString();

  for (const item of inputs) {
    const countryObj =
      INITIAL_COUNTRIES.find((c) => c.code === item.country_code) ||
      INITIAL_COUNTRIES[0];
    const cityObj =
      countryObj.cities.find((c) => c.id === item.city_id) ||
      countryObj.cities[0];

    const emailDomain = item.apply_email?.includes("@")
      ? item.apply_email.split("@")[1].toLowerCase().trim()
      : "";
    const domain = (item.company_domain || emailDomain || "").toLowerCase();

    const industryId =
      item.industry_id &&
      INITIAL_INDUSTRIES.some((ind) => ind.id === item.industry_id)
        ? item.industry_id
        : classifyCompanyIndustry({
            rawIndustry: `${item.summary_en} ${item.summary_ar}`,
            companyName: item.company_name,
            subSpecialty: `${item.title_en} ${item.title_ar}`,
            domain,
            email: item.apply_email || "",
          });

    const dedupe_hash = computeJobDedupeHash({
      titleEn: item.title_en,
      titleAr: item.title_ar,
      companyDomain: domain,
      companyName: item.company_name,
      countryCode: countryObj.code,
      cityId: cityObj.id,
    });

    if (seenHashes.has(dedupe_hash)) {
      skippedDuplicates++;
      continue;
    }

    let slug = `${slugifyJobSegment(item.title_en || item.title_ar)}-${cityObj.id}-${countryObj.code.toLowerCase()}-${dedupe_hash.slice(0, 6)}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${Date.now().toString(36).slice(-3)}`;
    }

    const qualityScore = Math.min(
      99,
      65 +
        (item.is_mx_verified !== false ? 15 : 0) +
        (item.salary_min || item.salary_max ? 8 : 0) +
        ((item.skills?.length || 0) >= 3 ? 7 : 0) +
        ((item.requirements_en?.length || 0) >= 2 ? 4 : 0)
    );

    const record: JobPostingRecord = {
      id: `job-${countryObj.code.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      slug,
      dedupe_hash,
      title_ar: item.title_ar.trim(),
      title_en: item.title_en.trim(),
      company_name: item.company_name.trim(),
      company_domain: domain,
      company_website:
        item.company_website || (domain ? `https://${domain}` : null),
      apply_email: item.apply_email ? item.apply_email.trim().toLowerCase() : null,
      masked_apply_email: item.apply_email ? maskEmail(item.apply_email) : null,
      apply_url: item.apply_url || null,
      apply_whatsapp: item.apply_whatsapp || null,
      country_code: countryObj.code,
      city_id: cityObj.id,
      city_name_ar: cityObj.name_ar,
      city_name_en: cityObj.name_en,
      industry_id: industryId,
      secondary_industries: (item.secondary_industries || []).filter(
        (s) =>
          s !== industryId &&
          INITIAL_INDUSTRIES.some((ind) => ind.id === s)
      ),
      employment_type: item.employment_type || "FULL_TIME",
      experience_level: item.experience_level || "Mid-Senior (3-7 Years)",
      salary_min: item.salary_min ?? null,
      salary_max: item.salary_max ?? null,
      salary_currency: item.salary_currency || countryObj.currency_code,
      summary_ar: item.summary_ar.trim(),
      summary_en: item.summary_en.trim(),
      requirements_ar: item.requirements_ar?.length
        ? item.requirements_ar
        : [
            `خبرة عملية موثقة في مجال ${item.title_ar} داخل ${countryObj.name_ar} أو دول الخليج`,
            "إجادة مهارات التواصل المهني والعمل ضمن فرق متعددة التخصصات",
          ],
      requirements_en: item.requirements_en?.length
        ? item.requirements_en
        : [
            `Proven hands-on GCC or international experience in ${item.title_en}`,
            "Strong professional communication and execution skills",
          ],
      skills: item.skills?.length ? item.skills.slice(0, 8) : ["GCC Experience", "ATS Ready"],
      source_type: item.source_type || "verified_harvester",
      source_channel: item.source_channel || null,
      is_mx_verified: item.is_mx_verified !== false,
      is_featured: Boolean(item.is_featured),
      quality_score: qualityScore,
      views_count: 1,
      apply_clicks_count: 0,
      status: item.status || "published",
      fb_post_id: null,
      fb_posted_at: null,
      tg_message_id: null,
      tg_posted_at: null,
      published_at: nowIso,
      expires_at: expiresIso,
      created_at: nowIso,
    };

    seenHashes.add(dedupe_hash);
    seenSlugs.add(slug);
    inserted.push(record);
  }

  if (inserted.length > 0) {
    const merged = [...inserted, ...existing].slice(0, 1500);
    writeLocalJobs(merged);

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseJobsClient();
        const dbRows = inserted.map((r) => {
          const copy = { ...r };
          if (copy.secondary_industries?.length) {
            copy.source_channel = `${copy.source_channel || "asra3"}|sectors:${copy.secondary_industries.join(",")}`;
          }
          delete copy.secondary_industries;
          delete copy.masked_apply_email;
          delete copy.rank_score;
          return copy;
        });
        await sb.from("jobs").upsert(dbRows, { onConflict: "dedupe_hash" });
      } catch {
        // Non-blocking if Supabase migration 002 hasn't been executed yet
      }
    }

    const publishedUrls = inserted
      .filter((j) => j.status === "published")
      .flatMap((j) => [
        `/jobs/${j.slug}`,
        `/jobs`,
        `/${j.country_code.toLowerCase()}/jobs`,
        `/${j.country_code.toLowerCase()}/jobs/${j.industry_id}`,
      ]);

    if (publishedUrls.length > 0) {
      notifySearchEnginesForUrls(publishedUrls, "URL_UPDATED").catch(() => {});
    }
  }

  return { inserted, skippedDuplicates };
}

/**
 * Handles Direct Employer Job Submissions (/employers):
 * - Corporate domain passing live DNS MX -> auto-published immediately + enriches HR directory!
 * - Free webmail (@gmail.com, @outlook.com) with valid MX -> held in `pending_review` for /admin!
 * - Dead/invalid email -> rejected cleanly with clear error code.
 */
export async function submitEmployerJobRequest(payload: {
  company_name: string;
  company_website?: string;
  hr_email: string;
  apply_url?: string;
  apply_whatsapp?: string;
  country_code: CountryCode;
  city_id: string;
  industry_id: string;
  secondary_industries?: string[];
  employment_type: EmploymentType;
  experience_level: string;
  title_ar?: string;
  title_en?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  description: string;
  skills?: string[];
  additional_roles?: Array<{
    title_ar?: string;
    title_en?: string;
    industry_id: string;
    salary_min?: number | null;
    salary_max?: number | null;
  }>;
}): Promise<{
  ok: boolean;
  autoPublished: boolean;
  job?: JobPostingRecord;
  jobs?: JobPostingRecord[];
  errorReason?: string;
}> {
  const cleanEmail = (payload.hr_email || "").trim().toLowerCase();

  // Step 1: Test strict corporate domain + DNS MX
  const corporateCheck = await verifyCompanyEmail(cleanEmail, {
    checkMx: true,
    allowPersonalWebmail: false,
  });

  let isCorporateMxVerified = false;
  let targetStatus: JobPostingStatus = "pending_review";

  if (corporateCheck.valid) {
    isCorporateMxVerified = true;
    targetStatus = "published";
  } else if (corporateCheck.reason === "personal_webmail_blocked") {
    // Allow free webmail into Admin Moderation Queue if syntax & MX are valid
    const webmailCheck = await verifyCompanyEmail(cleanEmail, {
      checkMx: true,
      allowPersonalWebmail: true,
    });
    if (!webmailCheck.valid) {
      return {
        ok: false,
        autoPublished: false,
        errorReason: webmailCheck.reason || "invalid_email",
      };
    }
    isCorporateMxVerified = false;
    targetStatus = "pending_review";
  } else {
    return {
      ok: false,
      autoPublished: false,
      errorReason: corporateCheck.reason || "invalid_corporate_email",
    };
  }

  const titleEn = (payload.title_en || payload.title_ar || "").trim();
  const titleAr = (payload.title_ar || payload.title_en || "").trim();
  const rawDesc = payload.description.trim();
  const bulletLines = rawDesc
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter((l) => l.length >= 6)
    .slice(0, 6);

  const allRolesToCreate: Array<{
    titleAr: string;
    titleEn: string;
    industryId: string;
    secondaryIndustries?: string[];
    salaryMin?: number | null;
    salaryMax?: number | null;
  }> = [
    {
      titleAr,
      titleEn,
      industryId: payload.industry_id,
      secondaryIndustries: payload.secondary_industries,
      salaryMin: payload.salary_min ?? null,
      salaryMax: payload.salary_max ?? null,
    },
  ];

  if (Array.isArray(payload.additional_roles)) {
    for (const extra of payload.additional_roles.slice(0, 8)) {
      const exEn = (extra.title_en || extra.title_ar || "").trim();
      const exAr = (extra.title_ar || extra.title_en || "").trim();
      if (!exEn) continue;
      allRolesToCreate.push({
        titleAr: exAr,
        titleEn: exEn,
        industryId: extra.industry_id || payload.industry_id,
        salaryMin: extra.salary_min ?? null,
        salaryMax: extra.salary_max ?? null,
      });
    }
  }

  const { inserted } = await upsertJobPostings(
    allRolesToCreate.map((r) => ({
      title_ar: r.titleAr,
      title_en: r.titleEn,
      company_name: payload.company_name,
      company_domain: isCorporateMxVerified ? corporateCheck.domain : "",
      company_website: payload.company_website || null,
      apply_email: cleanEmail,
      apply_url: payload.apply_url || null,
      apply_whatsapp: payload.apply_whatsapp || null,
      country_code: payload.country_code,
      city_id: payload.city_id,
      industry_id: r.industryId,
      secondary_industries: r.secondaryIndustries,
      employment_type: payload.employment_type,
      experience_level: payload.experience_level,
      salary_min: r.salaryMin ?? null,
      salary_max: r.salaryMax ?? null,
      summary_ar: rawDesc.slice(0, 420),
      summary_en: rawDesc.slice(0, 420),
      requirements_ar: bulletLines,
      requirements_en: bulletLines,
      skills: payload.skills?.length ? payload.skills : ["Direct Employer Hiring"],
      source_type: "employer_direct" as const,
      source_channel: "employer_portal",
      is_mx_verified: isCorporateMxVerified,
      status: targetStatus,
    }))
  );

  // Automatically enrich the verified GCC Company HR directory across ALL submitted categories!
  if (isCorporateMxVerified) {
    const allSubmittedIndustries = new Set<string>();
    for (const r of allRolesToCreate) {
      allSubmittedIndustries.add(r.industryId);
      for (const sec of r.secondaryIndustries || []) {
        allSubmittedIndustries.add(sec);
      }
    }

    bulkImportCompanies(
      Array.from(allSubmittedIndustries).map((indId) => ({
        company_name: payload.company_name,
        hr_email: cleanEmail,
        country_code: payload.country_code,
        city_id: payload.city_id,
        industry_id: indId,
        sub_specialty: titleEn.slice(0, 65),
      })),
      { checkMx: false, allowPersonalWebmail: false }
    ).catch(() => {});
  }

  return {
    ok: true,
    autoPublished: targetStatus === "published",
    job: inserted[0],
    jobs: inserted,
  };
}

export async function getUnpostedSocialJobs(
  limit = 2
): Promise<JobPostingRecord[]> {
  const all = await getAllJobsRaw();
  return all
    .filter(
      (j) =>
        j.status === "published" &&
        j.is_mx_verified &&
        !j.fb_posted_at
    )
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (b.quality_score !== a.quality_score) {
        return b.quality_score - a.quality_score;
      }
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    })
    .slice(0, Math.min(20, Math.max(1, limit)));
}

export async function markJobPostedToSocial(
  idOrSlug: string,
  meta: { fb_post_id?: string; tg_message_id?: string }
): Promise<boolean> {
  const jobs = readLocalJobs();
  const idx = jobs.findIndex(
    (j) => j.id === idOrSlug || j.slug === idOrSlug
  );
  const nowIso = new Date().toISOString();

  if (idx !== -1) {
    if (meta.fb_post_id) {
      jobs[idx].fb_post_id = meta.fb_post_id;
      jobs[idx].fb_posted_at = nowIso;
    }
    if (meta.tg_message_id) {
      jobs[idx].tg_message_id = meta.tg_message_id;
      jobs[idx].tg_posted_at = nowIso;
    }
    writeLocalJobs(jobs);
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseJobsClient();
      const patch: Record<string, string> = {};
      if (meta.fb_post_id) {
        patch.fb_post_id = meta.fb_post_id;
        patch.fb_posted_at = nowIso;
      }
      if (meta.tg_message_id) {
        patch.tg_message_id = meta.tg_message_id;
        patch.tg_posted_at = nowIso;
      }
      await sb.from("jobs").update(patch).or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    } catch {
      // Ignore
    }
  }

  return idx !== -1;
}

export async function performAdminJobAction(
  id: string,
  action:
    | "approve"
    | "reject"
    | "toggle_featured"
    | "expire"
    | "reset_social"
    | "delete"
): Promise<{ ok: boolean; job?: JobPostingRecord }> {
  const jobs = readLocalJobs();
  let idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) {
    // Job lives only in Supabase (e.g. local volume was reset) — adopt it locally
    const remote = (await getAllJobsRaw()).find((j) => j.id === id);
    if (!remote) return { ok: false };
    jobs.unshift(remote);
    idx = 0;
  }

  const target = { ...jobs[idx] };

  if (action === "delete") {
    jobs.splice(idx, 1);
    writeLocalJobs(jobs);
    if (isSupabaseConfigured()) {
      try {
        await getSupabaseJobsClient().from("jobs").delete().eq("id", id);
      } catch {}
    }
    notifySearchEnginesForUrls([`/jobs/${target.slug}`], "URL_DELETED").catch(
      () => {}
    );
    return { ok: true };
  }

  if (action === "approve") {
    target.status = "published";
    target.published_at = new Date().toISOString();
    notifySearchEnginesForUrls([`/jobs/${target.slug}`, `/jobs`], "URL_UPDATED").catch(
      () => {}
    );
  } else if (action === "reject") {
    target.status = "rejected";
  } else if (action === "toggle_featured") {
    target.is_featured = !target.is_featured;
  } else if (action === "expire") {
    target.status = "expired";
    target.expires_at = new Date(Date.now() - 1000).toISOString();
  } else if (action === "reset_social") {
    target.fb_post_id = null;
    target.fb_posted_at = null;
  }

  jobs[idx] = target;
  writeLocalJobs(jobs);

  if (isSupabaseConfigured()) {
    try {
      await getSupabaseJobsClient()
        .from("jobs")
        .update({
          status: target.status,
          published_at: target.published_at,
          expires_at: target.expires_at,
          is_featured: target.is_featured,
          fb_post_id: target.fb_post_id,
          fb_posted_at: target.fb_posted_at,
        })
        .eq("id", id);
    } catch {}
  }

  return { ok: true, job: normalizeJobRow(target) };
}

export async function incrementJobEngagement(
  slug: string,
  metric: "view" | "apply"
): Promise<void> {
  const jobs = readLocalJobs();
  const idx = jobs.findIndex((j) => j.slug === slug);
  if (idx !== -1) {
    if (metric === "view") jobs[idx].views_count = (jobs[idx].views_count || 0) + 1;
    if (metric === "apply") {
      jobs[idx].apply_clicks_count = (jobs[idx].apply_clicks_count || 0) + 1;
    }
    writeLocalJobs(jobs);
  }
}
