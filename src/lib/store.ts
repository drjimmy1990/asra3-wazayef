// ==============================================================================
// WAZAYEF GCC — Unified Data Repository (Supabase PostgreSQL + Local Fallback)
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  CampaignRecipient,
  CampaignRecord,
  CompanyRecord,
  CountryCode,
  CountryConfig,
  CurrencyCode,
  Industry,
  PackageTier,
} from "@/lib/types";
import {
  INITIAL_COMPANIES,
  INITIAL_COUNTRIES,
  INITIAL_DEMO_CAMPAIGNS,
  INITIAL_INDUSTRIES,
  INITIAL_PACKAGES,
  maskEmail,
} from "@/lib/seed-data";
import {
  classifyCompanyIndustry,
  verifyCompanyEmail,
} from "@/lib/company-verifier";
import {
  REAL_GCC_ENTERPRISES,
  scrapeLiveTelegramJobChannels,
} from "@/lib/telegram-harvester";
import { GCC_ENTERPRISES_EXPANDED } from "@/lib/gcc-enterprises-expanded";
import {
  hasActiveSmtpAccounts,
  sendCandidateConfirmationEmail,
  startBackgroundCampaignSmtpDrip,
} from "@/lib/smtp-mailer";

interface LocalStoreData {
  countries: CountryConfig[];
  industries: Industry[];
  packages: PackageTier[];
  companies: CompanyRecord[];
  campaigns: CampaignRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const JOBS_STORE_FILE = path.join(DATA_DIR, "jobs.json");

function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw || "")
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"))
  );
}

export function isQaTestModeEnabled(): boolean {
  return (
    parseEmailList(process.env.QA_TEST_CANDIDATE_EMAILS).size > 0 &&
    parseEmailList(process.env.QA_TEST_HR_EMAILS).size > 0
  );
}

export interface ActiveCompanyCategoryMap {
  byEmail: Map<string, Set<string>>;
  byDomain: Map<string, Set<string>>;
}

export async function getActiveJobIndustriesByCompany(): Promise<ActiveCompanyCategoryMap> {
  const byEmail = new Map<string, Set<string>>();
  const byDomain = new Map<string, Set<string>>();

  const register = (
    email: string | null | undefined,
    domain: string | null | undefined,
    indId: string | null | undefined,
    extra?: string[]
  ) => {
    const allInds = [indId, ...(Array.isArray(extra) ? extra : [])].filter(
      (x): x is string => Boolean(x)
    );
    if (allInds.length === 0) return;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanDomain = (
      domain ||
      (cleanEmail.includes("@") ? cleanEmail.split("@")[1] : "")
    )
      .trim()
      .toLowerCase();

    if (cleanEmail) {
      if (!byEmail.has(cleanEmail)) byEmail.set(cleanEmail, new Set());
      const set = byEmail.get(cleanEmail)!;
      allInds.forEach((i) => set.add(i));
    }
    if (cleanDomain) {
      if (!byDomain.has(cleanDomain)) byDomain.set(cleanDomain, new Set());
      const set = byDomain.get(cleanDomain)!;
      allInds.forEach((i) => set.add(i));
    }
  };

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb
        .from("jobs")
        .select("apply_email, company_domain, industry_id")
        .eq("status", "published")
        .limit(1000);
      if (Array.isArray(data)) {
        for (const row of data) {
          register(row.apply_email, row.company_domain, row.industry_id);
        }
      }
    } catch {
      // Fallback to local jobs file below
    }
  }

  try {
    if (fs.existsSync(JOBS_STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(JOBS_STORE_FILE, "utf8"));
      if (Array.isArray(parsed)) {
        for (const row of parsed) {
          if (row?.status === "published") {
            register(
              row.apply_email,
              row.company_domain,
              row.industry_id,
              row.secondary_industries
            );
          }
        }
      }
    }
  } catch {
    // Ignore local read errors
  }

  return { byEmail, byDomain };
}

export function doesCompanyHireInIndustry(
  company: CompanyRecord,
  targetIndustryId: string,
  jobCategoryMap?: ActiveCompanyCategoryMap
): boolean {
  if (!targetIndustryId) return true;
  if (company.industry_id === targetIndustryId) return true;
  if (
    Array.isArray(company.secondary_industries) &&
    company.secondary_industries.includes(targetIndustryId)
  ) {
    return true;
  }
  if (
    company.sub_specialty &&
    company.sub_specialty.toLowerCase().includes(`#${targetIndustryId.toLowerCase()}`)
  ) {
    return true;
  }

  if (jobCategoryMap) {
    const email = (company.hr_email || "").trim().toLowerCase();
    if (email && jobCategoryMap.byEmail.get(email)?.has(targetIndustryId)) {
      return true;
    }
    const domain = email.includes("@") ? email.split("@")[1] : "";
    if (domain && jobCategoryMap.byDomain.get(domain)?.has(targetIndustryId)) {
      return true;
    }
  }

  return false;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project-id") &&
      !key.includes("your-")
  );
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function readLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: LocalStoreData = {
        countries: INITIAL_COUNTRIES,
        industries: INITIAL_INDUSTRIES,
        packages: INITIAL_PACKAGES,
        companies: INITIAL_COMPANIES,
        campaigns: INITIAL_DEMO_CAMPAIGNS,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
    return {
      countries: parsed.countries?.length ? parsed.countries : INITIAL_COUNTRIES,
      industries: parsed.industries?.length
        ? parsed.industries
        : INITIAL_INDUSTRIES,
      packages: parsed.packages?.length ? parsed.packages : INITIAL_PACKAGES,
      companies: parsed.companies?.length ? parsed.companies : INITIAL_COMPANIES,
      campaigns: parsed.campaigns?.length
        ? parsed.campaigns
        : INITIAL_DEMO_CAMPAIGNS,
    };
  } catch {
    return {
      countries: INITIAL_COUNTRIES,
      industries: INITIAL_INDUSTRIES,
      packages: INITIAL_PACKAGES,
      companies: INITIAL_COMPANIES,
      campaigns: INITIAL_DEMO_CAMPAIGNS,
    };
  }
}

function writeLocalStore(data: LocalStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Ignore on read-only serverless filesystems when Supabase is primary
  }
}

export async function getCatalogData(): Promise<{
  countries: CountryConfig[];
  industries: Industry[];
  packages: PackageTier[];
}> {
  const mergeAsra3PackageBranding = (pkgs: PackageTier[]): PackageTier[] =>
    pkgs.map((p) => {
      const seedPkg = INITIAL_PACKAGES.find((sp) => sp.id === p.id);
      if (!seedPkg) return p;
      return {
        ...p,
        name_ar: seedPkg.name_ar,
        name_en: seedPkg.name_en,
        tagline_ar: seedPkg.tagline_ar,
        tagline_en: seedPkg.tagline_en,
        features_ar: seedPkg.features_ar,
        features_en: seedPkg.features_en,
      };
    });

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const [countriesRes, industriesRes, packagesRes] = await Promise.all([
        sb.from("countries").select("*").eq("is_active", true).order("sort_order"),
        sb.from("industries").select("*").order("sort_order"),
        sb.from("packages").select("*").order("sort_order"),
      ]);
      if (
        countriesRes.data?.length &&
        industriesRes.data?.length &&
        packagesRes.data?.length
      ) {
        return {
          countries: countriesRes.data as CountryConfig[],
          industries: industriesRes.data as Industry[],
          packages: mergeAsra3PackageBranding(
            packagesRes.data as PackageTier[]
          ),
        };
      }
    } catch (e) {
      console.warn("Supabase catalog fallback to local store:", e);
    }
  }
  const store = readLocalStore();
  return {
    countries: store.countries,
    industries: store.industries,
    packages: mergeAsra3PackageBranding(store.packages),
  };
}

export async function listCompanies(filters?: {
  country_code?: CountryCode;
  industry_id?: string;
  search?: string;
}): Promise<CompanyRecord[]> {
  let list: CompanyRecord[] = [];

  let fetchedFromSupabase = false;

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const allRows: CompanyRecord[] = [];
      let from = 0;
      const CHUNK = 1000;

      while (true) {
        let q = sb
          .from("companies")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + CHUNK - 1);

        if (filters?.country_code) q = q.eq("country_code", filters.country_code);
        if (filters?.industry_id) q = q.eq("industry_id", filters.industry_id);

        const { data, error } = await q;
        if (error || !data || data.length === 0) break;
        allRows.push(...(data as CompanyRecord[]));
        if (data.length < CHUNK) break;
        from += CHUNK;
      }

      if (allRows.length > 0) {
        list = allRows;
        fetchedFromSupabase = true;
      }
    } catch {
      // Fallback below
    }
  }

  if (!fetchedFromSupabase && list.length === 0) {
    const store = readLocalStore();
    list = [...store.companies];
  }

  if (filters?.country_code) {
    list = list.filter((c) => c.country_code === filters.country_code);
  }
  if (filters?.industry_id) {
    list = list.filter((c) => c.industry_id === filters.industry_id);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        c.hr_email.toLowerCase().includes(q) ||
        c.sub_specialty.toLowerCase().includes(q) ||
        c.city_name_en.toLowerCase().includes(q) ||
        c.city_name_ar.includes(q)
    );
  }
  return list;
}

export async function bulkImportCompanies(
  incoming: Array<{
    company_name: string;
    hr_email: string;
    country_code: CountryCode;
    city_id?: string;
    city_name_ar?: string;
    city_name_en?: string;
    industry_id?: string;
    sub_specialty?: string;
    company_size?: string;
  }>,
  options?: { checkMx?: boolean; allowPersonalWebmail?: boolean }
): Promise<{
  imported: number;
  updatedCategories?: number;
  skippedDuplicates: number;
  rejectedInvalid: number;
  total: number;
}> {
  const existingCompanies = await listCompanies();
  const existingByEmail = new Map<string, CompanyRecord>();
  for (const c of existingCompanies) {
    existingByEmail.set(c.hr_email.toLowerCase().trim(), c);
  }

  const newRows: CompanyRecord[] = [];
  const categoryEnrichments = new Map<
    string,
    { company: CompanyRecord; addedIndustries: Set<string> }
  >();
  let skippedDuplicates = 0;
  let rejectedInvalid = 0;

  for (const row of incoming) {
    const email = (row.hr_email || "").toLowerCase().trim();
    if (!email || !row.company_name?.trim()) {
      rejectedInvalid++;
      continue;
    }

    const incomingIndustry = classifyCompanyIndustry({
      rawIndustry: row.industry_id,
      companyName: row.company_name,
      subSpecialty: row.sub_specialty,
      email,
    });

    const existingMatch = existingByEmail.get(email);
    if (existingMatch) {
      if (!doesCompanyHireInIndustry(existingMatch, incomingIndustry)) {
        if (!categoryEnrichments.has(email)) {
          categoryEnrichments.set(email, {
            company: existingMatch,
            addedIndustries: new Set(),
          });
        }
        categoryEnrichments.get(email)!.addedIndustries.add(incomingIndustry);
        existingMatch.secondary_industries = Array.from(
          new Set([...(existingMatch.secondary_industries || []), incomingIndustry])
        );
      }
      skippedDuplicates++;
      continue;
    }

    const verification = await verifyCompanyEmail(email, {
      checkMx: options?.checkMx,
      allowPersonalWebmail: options?.allowPersonalWebmail,
    });
    if (!verification.valid) {
      rejectedInvalid++;
      continue;
    }

    const countryObj =
      INITIAL_COUNTRIES.find((c) => c.code === row.country_code) ||
      INITIAL_COUNTRIES[0];
    const defaultCity = countryObj.cities[0];
    const matchedCity =
      countryObj.cities.find(
        (ct) =>
          ct.id === row.city_id?.toLowerCase() ||
          ct.name_en.toLowerCase() === row.city_name_en?.toLowerCase() ||
          ct.name_ar === row.city_name_ar
      ) || defaultCity;

    const classifiedIndustry = classifyCompanyIndustry({
      rawIndustry: row.industry_id,
      companyName: row.company_name,
      subSpecialty: row.sub_specialty,
      email,
    });

    const newCompany: CompanyRecord = {
      id: `comp-${crypto.randomUUID().slice(0, 12)}`,
      company_name: row.company_name.trim(),
      hr_email: email,
      country_code: row.country_code,
      city_id: matchedCity.id,
      city_name_ar: row.city_name_ar || matchedCity.name_ar,
      city_name_en: row.city_name_en || matchedCity.name_en,
      industry_id: classifiedIndustry,
      sub_specialty: row.sub_specialty || "Direct HR Recruitment",
      company_size: row.company_size || "100-500",
      is_verified: true,
      is_active: true,
      last_contacted_at: null,
      total_emails_received: 0,
      created_at: new Date().toISOString(),
    };

    newRows.push(newCompany);
    existingByEmail.set(email, newCompany);
  }

  if (isSupabaseConfigured() && (newRows.length > 0 || categoryEnrichments.size > 0)) {
    try {
      const sb = getSupabaseAdmin();
      const dbNewRows = newRows.map((r) => {
        const copy = { ...r };
        delete copy.secondary_industries;
        return copy;
      });
      const CHUNK_SIZE = 50;
      for (let i = 0; i < dbNewRows.length; i += CHUNK_SIZE) {
        const chunk = dbNewRows.slice(i, i + CHUNK_SIZE);
        const { error } = await sb.from("companies").insert(chunk);
        if (error) {
          for (const row of chunk) {
            await sb.from("companies").insert(row);
          }
        }
      }

      // Persist newly discovered secondary hiring categories onto existing Supabase rows via sub_specialty tags
      for (const [email, item] of categoryEnrichments.entries()) {
        const tags = Array.from(item.addedIndustries)
          .map((ind) => `#${ind}`)
          .join(" ");
        const nextSpecialty = `${item.company.sub_specialty || "Direct HR"} ${tags}`.slice(
          0,
          140
        );
        await sb
          .from("companies")
          .update({ sub_specialty: nextSpecialty })
          .ilike("hr_email", email);
      }
    } catch (e) {
      console.warn("Supabase bulk insert warning:", e);
    }
  }

  const store = readLocalStore();
  if (categoryEnrichments.size > 0) {
    for (const comp of store.companies) {
      const enrich = categoryEnrichments.get(comp.hr_email.toLowerCase().trim());
      if (enrich) {
        const added = Array.from(enrich.addedIndustries);
        comp.secondary_industries = Array.from(
          new Set([...(comp.secondary_industries || []), ...added])
        );
        const tags = added.map((ind) => `#${ind}`).join(" ");
        if (!comp.sub_specialty.includes(tags)) {
          comp.sub_specialty = `${comp.sub_specialty} ${tags}`.slice(0, 140);
        }
      }
    }
  }
  store.companies = [...newRows, ...store.companies];
  writeLocalStore(store);

  return {
    imported: newRows.length,
    updatedCategories: categoryEnrichments.size,
    skippedDuplicates,
    rejectedInvalid,
    total: existingCompanies.length + newRows.length,
  };
}

/**
 * Harvests 100% REAL GCC companies from live public Telegram job channels
 * + verified major GCC enterprises, checks live DNS MX records, and
 * inserts only new (non-duplicate) companies into Supabase.
 */
export async function seedGccExpansionPack(options?: {
  customChannels?: Array<{ username: string; defaultCountry: CountryCode }>;
  pagesPerChannel?: number;
  refreshExisting?: boolean;
}): Promise<{
  imported: number;
  skippedDuplicates: number;
  rejectedInvalid: number;
  total: number;
  channelsScraped: number;
  postsScanned: number;
}> {
  if (options?.refreshExisting) {
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        await sb.from("companies").delete().neq("id", "000");
      } catch (e) {
        console.warn("Supabase refresh clear warning:", e);
      }
    }
    const store = readLocalStore();
    store.companies = [];
    writeLocalStore(store);
  }

  const tgResult = await scrapeLiveTelegramJobChannels({
    channels: options?.customChannels,
    pagesPerChannel: options?.pagesPerChannel ?? 6,
    verifyMx: true,
  });

  const combinedIncoming = [
    ...REAL_GCC_ENTERPRISES,
    ...GCC_ENTERPRISES_EXPANDED,
    ...tgResult.companies,
  ];

  const res = await bulkImportCompanies(combinedIncoming, { checkMx: true });
  return {
    imported: res.imported,
    skippedDuplicates: res.skippedDuplicates,
    rejectedInvalid: res.rejectedInvalid,
    total: res.total,
    channelsScraped: tgResult.channelsScraped,
    postsScanned: tgResult.postsScanned,
  };
}

/**
 * Verifies DNS MX and syntax health for a batch of companies in the database.
 */
export async function verifyCompaniesBatch(limit = 100): Promise<{
  checked: number;
  validCount: number;
  disabledCount: number;
}> {
  const companies = await listCompanies();
  const batch = companies.slice(0, limit);
  let validCount = 0;
  let disabledCount = 0;
  const disabledIds: string[] = [];
  const verifiedIds: string[] = [];

  for (const comp of batch) {
    const check = await verifyCompanyEmail(comp.hr_email, { checkMx: true });
    if (check.valid && check.mxValid) {
      validCount++;
      verifiedIds.push(comp.id);
    } else {
      disabledCount++;
      disabledIds.push(comp.id);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      if (disabledIds.length > 0) {
        await sb
          .from("companies")
          .update({ is_active: false, is_verified: false })
          .in("id", disabledIds);
      }
      if (verifiedIds.length > 0) {
        await sb
          .from("companies")
          .update({ is_verified: true })
          .in("id", verifiedIds);
      }
    } catch (e) {
      console.warn("Supabase verifyCompaniesBatch warning:", e);
    }
  }

  const store = readLocalStore();
  for (const c of store.companies) {
    if (disabledIds.includes(c.id)) {
      c.is_active = false;
      c.is_verified = false;
    } else if (verifiedIds.includes(c.id)) {
      c.is_verified = true;
    }
  }
  writeLocalStore(store);

  return {
    checked: batch.length,
    validCount,
    disabledCount,
  };
}

/**
 * Self-healing hygiene: updates company status on bounce, delivery, or open events.
 */
export async function recordEmailHealthEvent(params: {
  hr_email: string;
  event: "hard_bounce" | "soft_bounce" | "delivered" | "opened" | "complained";
  country_code?: CountryCode;
}): Promise<{ updated: boolean; action: string }> {
  const email = (params.hr_email || "").trim().toLowerCase();
  if (!email) return { updated: false, action: "missing_email" };

  const shouldDisable =
    params.event === "hard_bounce" || params.event === "complained";
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      if (shouldDisable) {
        let q = sb
          .from("companies")
          .update({ is_active: false, is_verified: false })
          .ilike("hr_email", email);
        if (params.country_code) q = q.eq("country_code", params.country_code);
        await q;
      } else if (params.event === "delivered" || params.event === "opened") {
        let q = sb
          .from("companies")
          .update({ last_contacted_at: nowIso, is_verified: true })
          .ilike("hr_email", email);
        if (params.country_code) q = q.eq("country_code", params.country_code);
        await q;
      }
    } catch (e) {
      console.warn("Supabase recordEmailHealthEvent warning:", e);
    }
  }

  const store = readLocalStore();
  let updated = false;
  for (const c of store.companies) {
    if (
      c.hr_email.toLowerCase() === email &&
      (!params.country_code || c.country_code === params.country_code)
    ) {
      updated = true;
      if (shouldDisable) {
        c.is_active = false;
        c.is_verified = false;
      } else {
        c.last_contacted_at = nowIso;
        c.total_emails_received = (c.total_emails_received || 0) + 1;
      }
    }
  }
  if (updated) writeLocalStore(store);

  return {
    updated: true,
    action: shouldDisable ? "deactivated_bounced_email" : "recorded_delivery",
  };
}

export function generateAiCoverLetter(params: {
  candidateName: string;
  candidatePhone?: string;
  candidateEmail?: string;
  jobTitle: string;
  industryNameEn: string;
  industryNameAr?: string;
  yearsExperience: number;
  skills: string[];
  countryNameEn: string;
  countryNameAr?: string;
  bilingual?: boolean;
}): string {
  const skillsText = params.skills.slice(0, 6).join(", ");
  const contactLine = [params.candidateEmail, params.candidatePhone]
    .filter(Boolean)
    .join(" | ");

  const enLetter = `Dear Hiring Manager & Talent Acquisition Team,

I am writing to express my strong interest in joining your organization in ${params.countryNameEn} as a ${params.jobTitle}. With over ${params.yearsExperience} years of hands-on experience in ${params.industryNameEn}, I have built a proven track record of delivering measurable impact across ${skillsText}.

Throughout my career, I have combined technical excellence with an execution-first mindset suited for fast-paced GCC enterprises. Please find my updated CV attached for your review. I welcome the opportunity to discuss how my background aligns with your current and upcoming hiring priorities.

Warm regards,
${params.candidateName}${contactLine ? `\n${contactLine}` : ""}`;

  if (!params.bilingual) {
    return enLetter;
  }

  const arLetter = `السادة إدارة الموارد البشرية واستقطاب الكفاءات المحترمين،

أتقدم إليكم برغبتي الجادة في الانضمام إلى فريق عملكم الموقر في ${params.countryNameAr || params.countryNameEn} بمسمى (${params.jobTitle})، مستنداً إلى خبرة عملية تتجاوز ${params.yearsExperience} سنوات في قطاع ${params.industryNameAr || params.industryNameEn}، ومهارات متقدمة تشمل: ${skillsText}.

أرفق لعنايتكم سيرتي الذاتية المحدثة، وأتطلع لفرصة إجراء مقابلة عمل لمناقشة كيف يمكن لخبراتي الإسهام بفاعلية في تحقيق مستهدفاتكم القادمة.

وتفضلوا بقبول فائق الاحترام والتقدير،
${params.candidateName}${contactLine ? `\n${contactLine}` : ""}`;

  return `${enLetter}\n\n--------------------------------------------------------------------\n\n${arLetter}`;
}

export function generateOptimizedAtsCvSummary(params: {
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  jobTitle: string;
  industryNameEn: string;
  yearsExperience: number;
  skills: string[];
  countryNameEn: string;
}): string {
  const headerContact = [params.candidateEmail, params.candidatePhone]
    .filter(Boolean)
    .join("  •  ");
  return `====================================================================
ASRA3.COM — ATS-OPTIMIZED EXECUTIVE PROFILE
Candidate: ${params.candidateName.toUpperCase()}
${headerContact ? `Contact:   ${headerContact}\n` : ""}Target Role: ${params.jobTitle} | Market: ${params.countryNameEn} (GCC Standard)
====================================================================

PROFESSIONAL SUMMARY
Results-oriented ${params.jobTitle} with ${params.yearsExperience}+ years of progressive experience in ${params.industryNameEn}. Demonstrated expertise in driving operational excellence, cross-functional project delivery, and GCC regulatory & quality standards.

CORE ATS KEYWORDS & VERIFIED COMPETENCIES
${params.skills.map((s) => `• ${s}`).join("\n")}

KEY ACHIEVEMENTS HIGHLIGHTS (STAR FORMAT)
• Spearheaded high-impact initiatives in ${params.industryNameEn}, improving team efficiency and delivery timelines across priority KPIs.
• Collaborated with regional stakeholders and senior leadership to align execution with ${params.countryNameEn} market standards.
• Maintained strict quality, safety, and compliance benchmarks across multi-disciplinary deliverables.`;
}

export async function createCampaignOrder(input: {
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  preferred_lang: "ar" | "en";
  primary_country_code: CountryCode;
  extra_country_codes: CountryCode[];
  selected_cities: string[];
  industry_id: string;
  job_title: string;
  years_experience: number;
  cv_file_name: string;
  original_cv_url?: string | null;
  detected_skills: string[];
  ats_score: number;
  package_id: "starter" | "pro" | "ultimate";
  promo_code?: string;
  excluded_domain?: string;
}): Promise<CampaignRecord> {
  const { countries, industries, packages } = await getCatalogData();
  const allCompanies = await listCompanies();

  const pkg =
    packages.find((p) => p.id === input.package_id) || packages[1];
  const primaryCountry =
    countries.find((c) => c.code === input.primary_country_code) ||
    countries[0];
  const industry =
    industries.find((i) => i.id === input.industry_id) ||
    industries[0];

  const allowedCurrencies = new Set([
    "AED",
    "SAR",
    "QAR",
    "KWD",
    "EGP",
    "USD",
  ]);
  const overrideRaw = (process.env.EASYKASH_CURRENCY_OVERRIDE || "")
    .trim()
    .toUpperCase();
  const currency = allowedCurrencies.has(overrideRaw)
    ? (overrideRaw as CurrencyCode)
    : primaryCountry.currency_code;
  const basePrice = pkg.prices_by_currency[currency] ?? pkg.prices_by_currency.AED;
  const addonUnit =
    pkg.addon_country_price_by_currency[currency] ??
    pkg.addon_country_price_by_currency.AED;
  const extraCount = input.extra_country_codes.length;
  const originalAmount = basePrice + extraCount * addonUnit;

  let discountPercent = 0;
  const upperPromo = input.promo_code?.trim().toUpperCase() || "";
  if (upperPromo === "ASRA3VIP" || upperPromo === "GCC20") {
    discountPercent = 20;
  } else if (upperPromo === "FAST15" || upperPromo === "WAZAYEF15") {
    discountPercent = 15;
  }
  const finalAmount = Math.max(
    1,
    Math.round(originalAmount * (1 - discountPercent / 100))
  );

  const requestedTargetCompanies =
    pkg.company_limit + extraCount * Math.round(pkg.company_limit * 0.5);

  const trackingToken = crypto.randomBytes(12).toString("hex");
  const customerReference = `${Math.floor(100 + Math.random() * 900)}${Date.now()
    .toString()
    .slice(-6)}`;

  const coverLetter = pkg.includes_cover_letter
    ? generateAiCoverLetter({
        candidateName: input.candidate_name,
        candidateEmail: input.candidate_email,
        candidatePhone: input.candidate_phone,
        jobTitle: input.job_title,
        industryNameEn: industry.name_en,
        industryNameAr: industry.name_ar,
        yearsExperience: input.years_experience,
        skills: input.detected_skills,
        countryNameEn: primaryCountry.name_en,
        countryNameAr: primaryCountry.name_ar,
        bilingual: pkg.includes_cv_rewrite || input.preferred_lang === "ar",
      })
    : null;

  const optimizedCvText = pkg.includes_cv_rewrite
    ? generateOptimizedAtsCvSummary({
        candidateName: input.candidate_name,
        candidateEmail: input.candidate_email,
        candidatePhone: input.candidate_phone,
        jobTitle: input.job_title,
        industryNameEn: industry.name_en,
        yearsExperience: input.years_experience,
        skills: input.detected_skills,
        countryNameEn: primaryCountry.name_en,
      })
    : null;

  const targetCountries = [
    input.primary_country_code,
    ...input.extra_country_codes,
  ];
  const cleanExcludedDomain = (input.excluded_domain || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^@/, "");

  const matchingPool = allCompanies.filter((c) => {
    if (c.is_active === false || c.is_verified === false) return false;
    if (!targetCountries.includes(c.country_code)) return false;
    if (
      cleanExcludedDomain &&
      c.hr_email.toLowerCase().endsWith(cleanExcludedDomain)
    ) {
      return false;
    }
    return true;
  });

  // QA Safe Test Mode: when the candidate email is in QA_TEST_CANDIDATE_EMAILS,
  // the campaign targets ONLY the inboxes in QA_TEST_HR_EMAILS (which must exist
  // in the companies directory). Real HR companies are never contacted.
  const qaCandidates = parseEmailList(process.env.QA_TEST_CANDIDATE_EMAILS);
  const qaHrInboxes = parseEmailList(process.env.QA_TEST_HR_EMAILS);
  const isQaTestCampaign =
    qaCandidates.has(input.candidate_email.trim().toLowerCase()) &&
    qaHrInboxes.size > 0;

  if (isQaTestCampaign) {
    const qaPool = allCompanies.filter((c) =>
      qaHrInboxes.has(c.hr_email.trim().toLowerCase())
    );
    if (qaPool.length === 0) {
      throw new Error(
        "QA test mode: none of the QA_TEST_HR_EMAILS inboxes exist in the companies directory. Import them in /admin first."
      );
    }
    matchingPool.length = 0;
    matchingPool.push(...qaPool);
  }

  // Smart Cooldown & Multi-Category Relevance Ranking:
  // 0. Exact primary OR secondary/active-job category match for this company
  // 1. Multi-sector HR / Recruitment firms (`hr-admin`)
  // 2. Other active verified employers in target countries
  const jobCategoryMap = await getActiveJobIndustriesByCompany();
  const selectedCitySet = new Set(input.selected_cities || []);
  const industryRank = (comp: CompanyRecord) =>
    doesCompanyHireInIndustry(comp, input.industry_id, jobCategoryMap)
      ? 0
      : comp.industry_id === "hr-admin"
      ? 1
      : 2;

  const sortedPool = [...matchingPool].sort((a, b) => {
    const aInd = industryRank(a);
    const bInd = industryRank(b);
    if (aInd !== bInd) return aInd - bInd;

    const aPrimaryCountry =
      a.country_code === input.primary_country_code ? 0 : 1;
    const bPrimaryCountry =
      b.country_code === input.primary_country_code ? 0 : 1;
    if (aPrimaryCountry !== bPrimaryCountry)
      return aPrimaryCountry - bPrimaryCountry;

    const aCity =
      selectedCitySet.size === 0 || selectedCitySet.has(a.city_id) ? 0 : 1;
    const bCity =
      selectedCitySet.size === 0 || selectedCitySet.has(b.city_id) ? 0 : 1;
    if (aCity !== bCity) return aCity - bCity;

    const aTime = a.last_contacted_at
      ? new Date(a.last_contacted_at).getTime()
      : 0;
    const bTime = b.last_contacted_at
      ? new Date(b.last_contacted_at).getTime()
      : 0;
    if (aTime !== bTime) return aTime - bTime;

    return (a.total_emails_received || 0) - (b.total_emails_received || 0);
  });

  const campaignId = crypto.randomUUID();
  const chosenCompanies = sortedPool.slice(0, requestedTargetCompanies);
  const actualTargetCount =
    chosenCompanies.length > 0
      ? chosenCompanies.length
      : requestedTargetCompanies;

  const recipients: CampaignRecipient[] = chosenCompanies.map((comp) => ({
    id: crypto.randomUUID(),
    campaign_id: campaignId,
    company_id: comp.id,
    company_name: comp.company_name,
    masked_hr_email: maskEmail(comp.hr_email),
    country_code: comp.country_code,
    city_name_ar: comp.city_name_ar,
    city_name_en: comp.city_name_en,
    industry_id: comp.industry_id,
    status: "queued",
    sent_at: null,
  }));

  const record: CampaignRecord = {
    id: campaignId,
    tracking_token: trackingToken,
    customer_reference: customerReference,
    candidate_name: input.candidate_name,
    candidate_email: input.candidate_email,
    candidate_phone: input.candidate_phone,
    preferred_lang: input.preferred_lang,
    primary_country_code: input.primary_country_code,
    extra_country_codes: input.extra_country_codes,
    selected_cities: input.selected_cities,
    industry_id: input.industry_id,
    job_title: input.job_title,
    years_experience: input.years_experience,
    cv_file_name: input.cv_file_name,
    original_cv_url: input.original_cv_url || null,
    optimized_cv_text: optimizedCvText,
    generated_cover_letter: coverLetter,
    detected_skills: input.detected_skills,
    ats_score: input.ats_score,
    package_id: input.package_id,
    total_target_companies: actualTargetCount,
    emails_sent_count: 0,
    emails_opened_count: 0,
    payment_status: "pending",
    campaign_status: "awaiting_payment",
    easykash_ref: null,
    easykash_product_code: null,
    easykash_voucher: null,
    payment_method: null,
    promo_code: input.promo_code || null,
    amount_original: originalAmount,
    amount_paid: finalAmount,
    currency,
    created_at: new Date().toISOString(),
    paid_at: null,
    completed_at: null,
    recipients,
  };

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { recipients: recList, ...dbCampaign } = record;
      await sb.from("campaigns").insert(dbCampaign);
      if (recList && recList.length > 0) {
        const CHUNK = 100;
        for (let i = 0; i < recList.length; i += CHUNK) {
          await sb
            .from("campaign_recipients")
            .insert(recList.slice(i, i + CHUNK));
        }
      }
    } catch (e) {
      console.warn("Supabase createCampaignOrder warning:", e);
    }
  }

  const store = readLocalStore();
  store.campaigns.unshift(record);
  writeLocalStore(store);

  return record;
}

/**
 * Persists real SMTP delivery result (sent / failed + hard-bounce hygiene)
 * for an individual campaign recipient.
 */
export async function recordSmtpRecipientDispatch(params: {
  campaignId: string;
  recipientId: string;
  companyId: string;
  status: "sent" | "failed";
  isHardBounce: boolean;
}): Promise<void> {
  const nowIso = new Date().toISOString();

  // 1. Update local store atomically
  const store = readLocalStore();
  const camp = store.campaigns.find((c) => c.id === params.campaignId);
  let sentCount = 0;
  let openedCount = 0;
  let remainingQueued = 0;

  if (camp && camp.recipients) {
    const rec = camp.recipients.find((r) => r.id === params.recipientId);
    if (rec && rec.status !== "opened") {
      rec.status = params.status;
      rec.sent_at = nowIso;
    }

    sentCount = camp.recipients.filter(
      (r) => r.status === "sent" || r.status === "opened"
    ).length;
    openedCount = camp.recipients.filter((r) => r.status === "opened").length;
    remainingQueued = camp.recipients.filter((r) => r.status === "queued").length;

    camp.emails_sent_count = sentCount;
    camp.emails_opened_count = openedCount;

    if (remainingQueued === 0) {
      camp.campaign_status = "completed";
      camp.completed_at = camp.completed_at || nowIso;
    }
  }

  const comp = store.companies.find((c) => c.id === params.companyId);
  if (comp) {
    if (params.isHardBounce) {
      comp.is_active = false;
      comp.is_verified = false;
    } else if (params.status === "sent") {
      comp.last_contacted_at = nowIso;
      comp.total_emails_received = (comp.total_emails_received || 0) + 1;
    }
  }

  writeLocalStore(store);

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("campaign_recipients")
        .update({ status: params.status, sent_at: nowIso })
        .eq("id", params.recipientId)
        .neq("status", "opened");

      if (camp) {
        await sb
          .from("campaigns")
          .update({
            emails_sent_count: camp.emails_sent_count,
            emails_opened_count: camp.emails_opened_count,
            campaign_status: camp.campaign_status,
            completed_at: camp.completed_at,
          })
          .eq("id", params.campaignId);
      }

      if (params.isHardBounce) {
        await sb
          .from("companies")
          .update({ is_active: false, is_verified: false })
          .eq("id", params.companyId);
      } else if (params.status === "sent") {
        await sb
          .from("companies")
          .update({ last_contacted_at: nowIso, is_verified: true })
          .eq("id", params.companyId);
      }
    } catch (err) {
      console.warn("Supabase recordSmtpRecipientDispatch warning:", err);
    }
  }
}

/**
 * Marks a specific recipient email as opened when the 1x1 tracking pixel loads.
 */
export async function markCampaignRecipientOpened(
  campaignId: string,
  recipientId: string
): Promise<void> {
  const safeCid = (campaignId || "").replace(/[^A-Za-z0-9_-]/g, "");
  const safeRid = (recipientId || "").replace(/[^A-Za-z0-9_-]/g, "");
  if (safeCid.length < 6 || safeRid.length < 6) return;

  const nowIso = new Date().toISOString();
  const store = readLocalStore();
  const camp = store.campaigns.find((c) => c.id === safeCid);

  if (camp && camp.recipients) {
    const rec = camp.recipients.find((r) => r.id === safeRid);
    if (rec && rec.status !== "opened") {
      rec.status = "opened";
      rec.sent_at = rec.sent_at || nowIso;

      camp.emails_opened_count = camp.recipients.filter(
        (r) => r.status === "opened"
      ).length;
      camp.emails_sent_count = Math.max(
        camp.emails_sent_count,
        camp.recipients.filter(
          (r) => r.status === "sent" || r.status === "opened"
        ).length
      );
      writeLocalStore(store);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("campaign_recipients")
        .update({ status: "opened" })
        .eq("id", safeRid)
        .eq("campaign_id", safeCid);

      const { count } = await sb
        .from("campaign_recipients")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", safeCid)
        .eq("status", "opened");

      if (typeof count === "number") {
        await sb
          .from("campaigns")
          .update({ emails_opened_count: count })
          .eq("id", safeCid);
      }
    } catch {
      // Non-fatal pixel update
    }
  }
}

/**
 * Ensures the background real-SMTP drip worker is active for any paid campaign
 * that still has `"queued"` recipients (including automatic resume after container restart).
 */
async function ensureRealSmtpDripRunning(
  campaign: CampaignRecord
): Promise<void> {
  if (!hasActiveSmtpAccounts()) return;
  if (
    campaign.tracking_token.startsWith("demo-") ||
    campaign.payment_status !== "paid" ||
    campaign.campaign_status === "completed"
  ) {
    return;
  }

  const hasQueued = (campaign.recipients || []).some(
    (r) => r.status === "queued"
  );
  if (!hasQueued) return;

  try {
    const allCompanies = await listCompanies();
    const companyEmailMap = new Map(
      allCompanies.map((c) => [c.id, c.hr_email])
    );

    startBackgroundCampaignSmtpDrip({
      campaign,
      companyEmailMap,
      onRecipientDispatched: (recipientId, companyId, status, isHardBounce) =>
        recordSmtpRecipientDispatch({
          campaignId: campaign.id,
          recipientId,
          companyId,
          status,
          isHardBounce,
        }),
    });
  } catch (err) {
    console.warn("Failed starting background SMTP drip:", err);
  }
}

/**
 * Synchronizes server-side drip progress:
 * - When active SMTP accounts exist: reports exact real delivery counts and resumes any queued real SMTP worker.
 * - When no SMTP accounts exist yet: falls back to wall-clock simulation for local/sandbox preview.
 */
async function syncElapsedServerDrip(
  campaign: CampaignRecord
): Promise<CampaignRecord> {
  if (
    campaign.tracking_token.startsWith("demo-") ||
    campaign.payment_status !== "paid" ||
    campaign.campaign_status === "completed" ||
    !campaign.paid_at
  ) {
    return campaign;
  }

  if (hasActiveSmtpAccounts()) {
    if (campaign.recipients && campaign.recipients.length > 0) {
      campaign.emails_sent_count = campaign.recipients.filter(
        (r) => r.status === "sent" || r.status === "opened"
      ).length;
      campaign.emails_opened_count = campaign.recipients.filter(
        (r) => r.status === "opened"
      ).length;
    }
    void ensureRealSmtpDripRunning(campaign);
    return campaign;
  }

  const paidMs = new Date(campaign.paid_at).getTime();
  if (!Number.isFinite(paidMs)) return campaign;

  const elapsedSeconds = Math.max(0, (Date.now() - paidMs) / 1000);
  // Realistic warm-up batch cadence (~1 company every 2 seconds = 30/min)
  const expectedSent = Math.min(
    campaign.total_target_companies,
    Math.max(
      campaign.emails_sent_count,
      Math.min(12, campaign.total_target_companies) +
        Math.floor(elapsedSeconds * 0.5)
    )
  );

  if (expectedSent <= campaign.emails_sent_count) {
    return campaign;
  }

  const nowIso = new Date().toISOString();
  campaign.emails_sent_count = expectedSent;

  if (campaign.recipients && campaign.recipients.length > 0) {
    for (let i = 0; i < campaign.recipients.length; i++) {
      if (i < expectedSent && campaign.recipients[i].status === "queued") {
        campaign.recipients[i].status = "sent";
        campaign.recipients[i].sent_at = nowIso;
      }
    }
    campaign.emails_opened_count = campaign.recipients.filter(
      (r) => r.status === "opened"
    ).length;
  }

  if (campaign.emails_sent_count >= campaign.total_target_companies) {
    campaign.campaign_status = "completed";
    campaign.completed_at = campaign.completed_at || nowIso;
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("campaigns")
        .update({
          emails_sent_count: campaign.emails_sent_count,
          emails_opened_count: campaign.emails_opened_count,
          campaign_status: campaign.campaign_status,
          completed_at: campaign.completed_at,
        })
        .eq("id", campaign.id);
    } catch {
      // Non-fatal sync update
    }
  }

  const store = readLocalStore();
  const idx = store.campaigns.findIndex((c) => c.id === campaign.id);
  if (idx !== -1) {
    store.campaigns[idx] = campaign;
    writeLocalStore(store);
  }

  return campaign;
}

export async function getCampaignByToken(
  rawQuery: string
): Promise<CampaignRecord | null> {
  const token = decodeURIComponent(rawQuery || "").trim();
  // Security & Privacy: Never allow direct lookup by email address
  if (!token || token.includes("@")) return null;

  // Always serve a clean, non-mutating snapshot for the public interactive demo
  if (
    token.toLowerCase() === "demo-uae-campaign-2026" ||
    token.toUpperCase() === "ASR-884120" ||
    token.toUpperCase() === "WZ-884120"
  ) {
    const demo = INITIAL_DEMO_CAMPAIGNS[0];
    return demo ? JSON.parse(JSON.stringify(demo)) : null;
  }

  // Strict alphanumeric + hyphen/underscore whitelist to prevent PostgREST `.or()` injection
  const safeToken = token.replace(/[^A-Za-z0-9_-]/g, "");
  if (safeToken.length < 4 || safeToken !== token) {
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data: campRows } = await sb
        .from("campaigns")
        .select("*")
        .or(
          `tracking_token.eq.${safeToken},customer_reference.ilike.${safeToken},easykash_ref.ilike.${safeToken}`
        )
        .order("created_at", { ascending: false })
        .limit(1);

      const camp = campRows?.[0];
      if (camp) {
        const allRecs: CampaignRecipient[] = [];
        let from = 0;
        while (true) {
          const { data: recs } = await sb
            .from("campaign_recipients")
            .select("*")
            .eq("campaign_id", camp.id)
            .range(from, from + 499);
          if (!recs || recs.length === 0) break;
          allRecs.push(...(recs as CampaignRecipient[]));
          if (recs.length < 500) break;
          from += 500;
        }

        const hydrated: CampaignRecord = {
          ...(camp as CampaignRecord),
          recipients: allRecs,
        };
        return await syncElapsedServerDrip(hydrated);
      }
    } catch {
      // Fallback to local store
    }
  }

  const store = readLocalStore();
  const lower = safeToken.toLowerCase();
  const campaign = store.campaigns.find(
    (c) =>
      c.tracking_token.toLowerCase() === lower ||
      c.customer_reference.toLowerCase() === lower ||
      (c.easykash_ref && c.easykash_ref.toLowerCase() === lower)
  );
  if (!campaign) return null;
  return await syncElapsedServerDrip(campaign);
}

export async function findCampaignsByEmail(
  rawEmail: string
): Promise<CampaignRecord[]> {
  const email = (rawEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return [];

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb
        .from("campaigns")
        .select("*")
        .ilike("candidate_email", email)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length > 0) {
        return data as CampaignRecord[];
      }
    } catch {
      // Fallback to local store
    }
  }

  const store = readLocalStore();
  return store.campaigns.filter(
    (c) => c.candidate_email.toLowerCase() === email
  );
}

export async function markCampaignPaidAndStart(params: {
  customerReference?: string;
  trackingToken?: string;
  easykashRef?: string;
  productCode?: string;
  paymentMethod?: string;
  voucher?: string;
  paidAmount?: number;
}): Promise<CampaignRecord | null> {
  const lookupKey = params.trackingToken || params.customerReference || "";
  const existing = await getCampaignByToken(lookupKey);
  if (!existing) return null;

  // Idempotency: if already marked paid, return existing state without re-triggering duplicate email blasts
  if (existing.payment_status === "paid" && existing.paid_at) {
    return existing;
  }

  // Verify webhook paid amount covers order amount (allow gateway convenience fees; strictly block underpayments)
  if (
    params.paidAmount !== undefined &&
    Number.isFinite(params.paidAmount) &&
    params.paidAmount > 0 &&
    params.paidAmount < existing.amount_paid - 1.5
  ) {
    console.error(
      `[Security] EasyKash underpayment rejected for ${existing.customer_reference}: expected >= ${existing.amount_paid}, got ${params.paidAmount}`
    );
    return null;
  }

  const nowIso = new Date().toISOString();
  existing.payment_status = "paid";
  existing.campaign_status = "distributing";
  existing.paid_at = nowIso;
  existing.easykash_ref =
    params.easykashRef || `EK-${Date.now().toString().slice(-8)}`;
  existing.easykash_product_code = params.productCode || "DIRECTPAY-V1";
  existing.payment_method = params.paymentMethod || "EasyKash DirectPayV1";
  existing.easykash_voucher = params.voucher || null;

  const realSmtpActive = hasActiveSmtpAccounts();

  if (existing.recipients && existing.recipients.length > 0) {
    if (realSmtpActive) {
      // Real Multi-SMTP mode: keep all recipients "queued" so every HR inbox receives an actual email
      existing.emails_sent_count = 0;
      existing.emails_opened_count = 0;
    } else {
      // Sandbox / preview fallback when no SMTP account is configured yet
      const initialBatchCount = Math.min(10, existing.recipients.length);
      for (let i = 0; i < initialBatchCount; i++) {
        existing.recipients[i].status = "sent";
        existing.recipients[i].sent_at = nowIso;
      }
      existing.emails_sent_count = initialBatchCount;
      existing.emails_opened_count = 0;
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("campaigns")
        .update({
          payment_status: existing.payment_status,
          campaign_status: existing.campaign_status,
          paid_at: existing.paid_at,
          easykash_ref: existing.easykash_ref,
          easykash_product_code: existing.easykash_product_code,
          payment_method: existing.payment_method,
          easykash_voucher: existing.easykash_voucher,
          emails_sent_count: existing.emails_sent_count,
          emails_opened_count: existing.emails_opened_count,
        })
        .eq("id", existing.id);

      if (existing.recipients?.length && !realSmtpActive) {
        const CHUNK = 100;
        for (let i = 0; i < existing.recipients.length; i += CHUNK) {
          await sb
            .from("campaign_recipients")
            .upsert(existing.recipients.slice(i, i + CHUNK));
        }
      }
    } catch (e) {
      console.warn("Supabase markCampaignPaidAndStart warning:", e);
    }
  }

  const store = readLocalStore();
  const idx = store.campaigns.findIndex((c) => c.id === existing.id);
  if (idx !== -1) {
    store.campaigns[idx] = existing;
    writeLocalStore(store);
  }

  // 1. Built-In Multi-SMTP Pool: send candidate payment confirmation + start round-robin HR CV drip
  if (realSmtpActive) {
    void sendCandidateConfirmationEmail(existing);
    void ensureRealSmtpDripRunning(existing);
  }

  // 2. Optional secondary n8n Campaign Webhook if configured alongside SMTP
  const n8nWebhook = process.env.N8N_CAMPAIGN_START_WEBHOOK;
  if (n8nWebhook && !n8nWebhook.includes("your-")) {
    try {
      const allCompanies = await listCompanies();
      const companyEmailMap = new Map(
        allCompanies.map((c) => [c.id, c.hr_email])
      );
      const outboundRecipients = (existing.recipients || [])
        .map((r) => ({
          recipientId: r.id,
          companyId: r.company_id,
          companyName: r.company_name,
          hrEmail: companyEmailMap.get(r.company_id) || "",
          countryCode: r.country_code,
          cityEn: r.city_name_en,
        }))
        .filter((r) => r.hrEmail.includes("@"));

      const appBase = (
        process.env.NEXT_PUBLIC_APP_URL || "https://asra3.com"
      ).replace(/\/+$/, "");
      const absoluteCvUrl = existing.original_cv_url?.startsWith("/")
        ? `${appBase}${existing.original_cv_url}`
        : existing.original_cv_url;

      fetch(n8nWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({
          brand: "Asra3.com",
          campaignId: existing.id,
          trackingToken: existing.tracking_token,
          customerReference: existing.customer_reference,
          candidateName: existing.candidate_name,
          candidateEmail: existing.candidate_email,
          replyToEmail: existing.candidate_email,
          candidatePhone: existing.candidate_phone,
          preferredLang: existing.preferred_lang,
          primaryCountry: existing.primary_country_code,
          extraCountries: existing.extra_country_codes,
          industryId: existing.industry_id,
          jobTitle: existing.job_title,
          packageId: existing.package_id,
          cvFileName: existing.cv_file_name,
          originalCvUrl: absoluteCvUrl,
          optimizedCvText: existing.optimized_cv_text,
          coverLetter: existing.generated_cover_letter,
          totalTargetCompanies: existing.total_target_companies,
          recipients: outboundRecipients,
        }),
      }).catch((err) =>
        console.warn("n8n webhook background trigger notice:", err)
      );
    } catch (err) {
      console.warn("Failed preparing n8n dispatch payload:", err);
    }
  }

  return existing;
}

export async function advanceCampaignProgress(
  token: string
): Promise<CampaignRecord | null> {
  if (token.toLowerCase().startsWith("demo-")) {
    return getCampaignByToken(token);
  }

  const campaign = await getCampaignByToken(token);
  if (!campaign) return null;
  if (campaign.payment_status !== "paid") return campaign;
  if (campaign.campaign_status === "completed") return campaign;

  // When active SMTP accounts exist, real nodemailer dispatch drives progress (never fake counts)
  if (hasActiveSmtpAccounts()) {
    await ensureRealSmtpDripRunning(campaign);
    return campaign;
  }

  const step = Math.max(5, Math.ceil(campaign.total_target_companies * 0.06));
  campaign.emails_sent_count = Math.min(
    campaign.total_target_companies,
    campaign.emails_sent_count + step
  );

  const nowIso = new Date().toISOString();
  if (campaign.recipients) {
    let newlyMarked = 0;
    for (const r of campaign.recipients) {
      if (r.status === "queued" && newlyMarked < step) {
        r.status = "sent";
        r.sent_at = nowIso;
        newlyMarked++;
      }
    }
    campaign.emails_opened_count = campaign.recipients.filter(
      (r) => r.status === "opened"
    ).length;
  }

  if (campaign.emails_sent_count >= campaign.total_target_companies) {
    campaign.campaign_status = "completed";
    campaign.completed_at = campaign.completed_at || nowIso;
    if (campaign.recipients) {
      for (const r of campaign.recipients) {
        if (r.status === "queued") {
          r.status = "sent";
          r.sent_at = nowIso;
        }
      }
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("campaigns")
        .update({
          emails_sent_count: campaign.emails_sent_count,
          emails_opened_count: campaign.emails_opened_count,
          campaign_status: campaign.campaign_status,
          completed_at: campaign.completed_at,
        })
        .eq("id", campaign.id);

      if (campaign.recipients?.length) {
        const CHUNK = 100;
        for (let i = 0; i < campaign.recipients.length; i += CHUNK) {
          await sb
            .from("campaign_recipients")
            .upsert(campaign.recipients.slice(i, i + CHUNK));
        }
      }
    } catch (e) {
      console.warn("Supabase advanceCampaignProgress warning:", e);
    }
  }

  const store = readLocalStore();
  const idx = store.campaigns.findIndex((c) => c.id === campaign.id);
  if (idx !== -1) {
    store.campaigns[idx] = campaign;
    writeLocalStore(store);
  }

  return campaign;
}

export async function listAllCampaigns(): Promise<CampaignRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        return data as CampaignRecord[];
      }
    } catch {
      // Fallback below
    }
  }
  const store = readLocalStore();
  return store.campaigns;
}

export async function toggleCompanyActiveStatus(
  companyId: string,
  isActive: boolean
): Promise<boolean> {
  if (!companyId) return false;
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb
        .from("companies")
        .update({ is_active: isActive })
        .eq("id", companyId);
    } catch (e) {
      console.warn("Supabase toggleCompanyActiveStatus warning:", e);
    }
  }
  const store = readLocalStore();
  const comp = store.companies.find((c) => c.id === companyId);
  if (comp) {
    comp.is_active = isActive;
    writeLocalStore(store);
  }
  return true;
}

export async function deleteCompanyRecord(companyId: string): Promise<boolean> {
  if (!companyId) return false;
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      await sb.from("companies").delete().eq("id", companyId);
    } catch (e) {
      console.warn("Supabase deleteCompanyRecord warning:", e);
    }
  }
  const store = readLocalStore();
  store.companies = store.companies.filter((c) => c.id !== companyId);
  writeLocalStore(store);
  return true;
}

export async function updatePackagePricing(
  packageId: string,
  pricesByCurrency: Record<string, number>,
  addonPricesByCurrency?: Record<string, number>
): Promise<PackageTier[]> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const updatePayload: Record<string, unknown> = {
        prices_by_currency: pricesByCurrency,
      };
      if (addonPricesByCurrency) {
        updatePayload.addon_country_price_by_currency = addonPricesByCurrency;
      }
      await sb.from("packages").update(updatePayload).eq("id", packageId);
    } catch (e) {
      console.warn("Supabase updatePackagePricing warning:", e);
    }
  }

  const store = readLocalStore();
  const idx = store.packages.findIndex((p) => p.id === packageId);
  if (idx !== -1) {
    store.packages[idx].prices_by_currency = {
      ...store.packages[idx].prices_by_currency,
      ...pricesByCurrency,
    };
    if (addonPricesByCurrency) {
      store.packages[idx].addon_country_price_by_currency = {
        ...store.packages[idx].addon_country_price_by_currency,
        ...addonPricesByCurrency,
      };
    }
    writeLocalStore(store);
  }
  return store.packages;
}
