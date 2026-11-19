// ==============================================================================
// ASRA3.COM — Automated Structured GCC Job Harvester (Telegram + RSS Feeds)
// Extracts full structured bilingual job postings, verifies live DNS MX records,
// deduplicates via SHA-256, publishes to `/jobs`, and enriches HR directory.
// ==============================================================================

import { CountryCode, CurrencyCode, EmploymentType } from "@/lib/types";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";
import {
  classifyCompanyIndustry,
  verifyCompanyEmail,
} from "@/lib/company-verifier";
import { DEFAULT_TELEGRAM_CHANNELS } from "@/lib/telegram-harvester";
import { NewJobInput, upsertJobPostings } from "@/lib/jobs-store";
import { bulkImportCompanies } from "@/lib/store";

const SKILL_DICTIONARY: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(autocad|revit|bim)\b/i, label: "AutoCAD / BIM" },
  { pattern: /\b(primavera|p6)\b/i, label: "Primavera P6" },
  { pattern: /\b(pmp|prince2)\b/i, label: "PMP" },
  { pattern: /\b(mep|hvac)\b/i, label: "MEP / HVAC" },
  { pattern: /\b(fidic)\b/i, label: "FIDIC Contracts" },
  { pattern: /\b(ifrs|gaap)\b/i, label: "IFRS" },
  { pattern: /\b(cpa|acca|cma|cfa)\b/i, label: "CPA / ACCA" },
  { pattern: /\b(sap|oracle|erp)\b/i, label: "SAP / ERP" },
  { pattern: /\b(react|next\.?js|typescript|javascript)\b/i, label: "React & TypeScript" },
  { pattern: /\b(python|django|fastapi|ai|llm)\b/i, label: "Python & AI" },
  { pattern: /\b(aws|azure|kubernetes|devops|docker)\b/i, label: "Cloud & DevOps" },
  { pattern: /\b(cybersecurity|soc|iso\s*27001|nca)\b/i, label: "Cybersecurity" },
  { pattern: /\b(dha|haad|moh|scfhs|qchp)\b/i, label: "GCC Medical License" },
  { pattern: /\b(digital\s+marketing|seo|google\s+ads|meta\s+ads)\b/i, label: "Digital Growth & SEO" },
  { pattern: /\b(salesforce|crm|b2b\s+sales)\b/i, label: "CRM & Enterprise Sales" },
  { pattern: /\b(supply\s+chain|logistics|procurement)\b/i, label: "Supply Chain" },
  { pattern: /\b(talent\s+acquisition|hrbp|recruitment)\b/i, label: "Talent Acquisition" },
];

const ARABIC_ROLE_TRANSLATIONS: Array<{ pattern: RegExp; ar: string }> = [
  { pattern: /\bproject\s+manager\b/i, ar: "مدير مشاريع" },
  { pattern: /\bcivil\s+engineer\b/i, ar: "مهندس مدني" },
  { pattern: /\bmechanical\s+engineer\b/i, ar: "مهندس ميكانيكا" },
  { pattern: /\belectrical\s+engineer\b/i, ar: "مهندس كهرباء" },
  { pattern: /\bmep\s+engineer\b/i, ar: "مهندس إلكتروميكانيك (MEP)" },
  { pattern: /\bsite\s+engineer\b/i, ar: "مهندس موقع" },
  { pattern: /\bqa\/?qc\s+engineer\b/i, ar: "مهندس ضمان ومراقبة الجودة" },
  { pattern: /\bhse\s+(officer|engineer|manager)\b/i, ar: "مسؤول السلامة والصحة المهنية (HSE)" },
  { pattern: /\bquantity\s+surveyor\b/i, ar: "مهندس حصر كميات (QS)" },
  { pattern: /\barchitect\b/i, ar: "مهندس معماري" },
  { pattern: /\baccountant\b/i, ar: "محاسب مالي" },
  { pattern: /\bfinancial\s+(controller|manager|analyst)\b/i, ar: "مراقب / محلل مالي" },
  { pattern: /\bauditor\b/i, ar: "مدقق حسابات" },
  { pattern: /\bsoftware\s+(engineer|developer)\b/i, ar: "مهندس وتطوير برمجيات" },
  { pattern: /\bfull[\s-]?stack\b/i, ar: "مطور برمجيات متكامل (Full-Stack)" },
  { pattern: /\bdata\s+(analyst|scientist|engineer)\b/i, ar: "محلل / مهندس بيانات" },
  { pattern: /\bit\s+(support|specialist|engineer|manager)\b/i, ar: "أخصائي تقنية المعلومات والشبكات" },
  { pattern: /\bhr\s+(manager|specialist|executive|officer)\b/i, ar: "أخصائي موارد بشرية وتوظيف" },
  { pattern: /\brecruiter|talent\s+acquisition\b/i, ar: "مسؤول استقطاب كفاءات" },
  { pattern: /\bsales\s+(manager|executive|engineer)\b/i, ar: "تنفيذي تطوير أعمال ومبيعات" },
  { pattern: /\bmarketing\s+(manager|specialist|executive)\b/i, ar: "أخصائي تسويق رقمي ونمو" },
  { pattern: /\bprocurement|purchasing\b/i, ar: "أخصائي مشتريات وعقود" },
  { pattern: /\blogistics|supply\s+chain\b/i, ar: "منسق سلاسل إمداد ولوجستيات" },
  { pattern: /\bnurse\b/i, ar: "أخصائي تمريض معتمد" },
  { pattern: /\bpharmacist\b/i, ar: "صيدلي إكلينيكي" },
  { pattern: /\bdoctor|physician\b/i, ar: "طبيب أخصائي" },
  { pattern: /\bgraphic\s+designer\b/i, ar: "مصمم جرافيك وهوية بصرية" },
  { pattern: /\badmin(istrative)?\s+(assistant|officer|coordinator)\b/i, ar: "منسق شؤون إدارية وتنفيذية" },
  { pattern: /\bdocument\s+controller\b/i, ar: "مراقب وثائق ومستندات مشاريع" },
];

function decodeHtml(input: string): string {
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function formatCompanyFromDomain(domain: string): string {
  const base = domain
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co|me|io)\.(ae|sa|qa|kw)$/i, "")
    .replace(/\.(com|net|org|gov|edu|co|me|io|ae|sa|qa|kw)$/i, "")
    .replace(/[-_.]+/g, " ")
    .trim();
  const words = base
    .split(/\s+/)
    .filter(Boolean)
    .map((w) =>
      w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
    );
  return words.length ? `${words.join(" ")} Group` : "Verified GCC Employer";
}

function detectLocation(
  text: string,
  domain: string,
  fallback: CountryCode
): { countryCode: CountryCode; cityId: string } {
  const lower = text.toLowerCase();
  const dom = domain.toLowerCase();
  let countryCode: CountryCode = fallback;

  if (dom.endsWith(".sa") || /\b(riyadh|jeddah|dammam|khobar|neom|saudi|ksa|الرياض|جدة|الدمام|السعودية)\b/i.test(lower)) {
    countryCode = "SA";
  } else if (dom.endsWith(".qa") || /\b(doha|lusail|wakrah|qatar|الدوحة|لوسيل|قطر)\b/i.test(lower)) {
    countryCode = "QA";
  } else if (dom.endsWith(".kw") || /\b(kuwait|salmiya|hawalli|farwaniya|الكويت|السالمية|حولي)\b/i.test(lower)) {
    countryCode = "KW";
  } else if (dom.endsWith(".ae") || /\b(dubai|abu\s*dhabi|sharjah|ajman|rak|uae|دبي|أبوظبي|الشارقة|الإمارات)\b/i.test(lower)) {
    countryCode = "AE";
  }

  const cObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) || INITIAL_COUNTRIES[0];
  for (const city of cObj.cities) {
    if (lower.includes(city.name_en.toLowerCase()) || lower.includes(city.name_ar)) {
      return { countryCode, cityId: city.id };
    }
  }
  return { countryCode, cityId: cObj.cities[0].id };
}

function extractStructuredRoleFromPost(
  plainText: string,
  domain: string,
  countryCode: CountryCode,
  cityId: string,
  industryId: string
): {
  titleEn: string;
  titleAr: string;
  companyName: string;
  experienceLevel: string;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: CurrencyCode;
  skills: string[];
  summaryEn: string;
  summaryAr: string;
  requirementsEn: string[];
  requirementsAr: string[];
} | null {
  const lines = plainText
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let titleEn = "";
  let companyName = "";

  for (const line of lines) {
    if (!companyName) {
      const m = line.match(
        /(?:company\s*name|company|employer|organization)\s*[:\-–—]\s*([A-Za-z0-9\s&.,'()-]{3,55})/i
      );
      if (m?.[1] && !/confidential|leading|reputed/i.test(m[1])) {
        companyName = m[1].trim();
      }
    }
    if (!titleEn) {
      const r = line.match(
        /(?:position|role|job\s*title|designation|vacancy)\s*[:\-–—]\s*([A-Za-z0-9\s/&+.,()-]{4,62})/i
      );
      if (r?.[1]) {
        titleEn = r[1]
          .replace(/^[\s•\-*⚡🔥📌📢✅👉0-9.)]+/, "")
          .replace(/\b(urgent|urgently|hiring|required|apply\s+now)\b[:\s\-]*/gi, "")
          .trim();
      }
    }
  }

  if (!titleEn) {
    const nat = plainText.match(
      /(?:hiring|looking\s+for|seeking|required)\s+(?:a\s+|an\s+|experienced\s+)*([A-Za-z0-9\s/&+.-]{5,52}?)(?:\s+(?:in\s+|for\s+|with\s+|to\s+join|immediately)|[.,!\n\r|]|$)/i
    );
    if (nat?.[1]) {
      titleEn = nat[1].trim();
    }
  }

  if (!titleEn) {
    const ROLE_NOUN =
      /\b(engineer|accountant|auditor|developer|manager|specialist|officer|coordinator|supervisor|architect|designer|pharmacist|nurse|doctor|analyst|consultant|recruiter|controller|surveyor)\b/i;
    const candidateLine = lines.find(
      (l) => l.length >= 6 && l.length <= 62 && ROLE_NOUN.test(l)
    );
    if (candidateLine) {
      titleEn = candidateLine
        .replace(/^[\s•\-*⚡🔥📌📢✅👉0-9.)]+/, "")
        .trim();
    }
  }

  if (!titleEn || titleEn.length < 4) return null;

  // Normalize title casing
  titleEn = titleEn
    .replace(/\s{2,}/g, " ")
    .slice(0, 68)
    .replace(/\b[a-z]/g, (ch) => ch.toUpperCase());

  if (!companyName) {
    companyName = formatCompanyFromDomain(domain);
  }

  const countryObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) || INITIAL_COUNTRIES[0];
  const cityObj =
    countryObj.cities.find((c) => c.id === cityId) || countryObj.cities[0];
  const indObj =
    INITIAL_INDUSTRIES.find((i) => i.id === industryId) || INITIAL_INDUSTRIES[0];

  // Arabic localized title
  let titleAr = "";
  for (const item of ARABIC_ROLE_TRANSLATIONS) {
    if (item.pattern.test(titleEn)) {
      titleAr = /\bsr\.?|senior|lead\b/i.test(titleEn)
        ? `${item.ar} أول`
        : item.ar;
      break;
    }
  }
  if (!titleAr) {
    titleAr = `${titleEn} — ${indObj.name_ar}`;
  }

  // Experience detection
  const expMatch = plainText.match(/(\d{1,2})\s*(?:\+|to|\-)\s*(\d{1,2})?\s*years?/i);
  const experienceLevel = expMatch
    ? expMatch[2]
      ? `${expMatch[1]}-${expMatch[2]} Years Experience`
      : `${expMatch[1]}+ Years Experience`
    : "Mid-Senior (3-7 Years)";

  // Employment type detection
  const employmentType: EmploymentType = /\bremote\b/i.test(plainText)
    ? "REMOTE"
    : /\bpart[\s-]?time\b/i.test(plainText)
    ? "PART_TIME"
    : /\bcontract|temporary\b/i.test(plainText)
    ? "CONTRACT"
    : "FULL_TIME";

  // Optional salary extraction (e.g. AED 12,000 - 18,000)
  let salaryMin: number | null = null;
  let salaryMax: number | null = null;
  const salMatch = plainText.match(
    /\b(?:AED|SAR|QAR|KWD)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{3,5})(?:\s*[\-–to]+\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{3,5}))?/i
  );
  if (salMatch?.[1]) {
    const parsedMin = Number(salMatch[1].replace(/,/g, ""));
    const parsedMax = salMatch[2]
      ? Number(salMatch[2].replace(/,/g, ""))
      : null;
    if (parsedMin >= 300 && parsedMin <= 120000) {
      salaryMin = parsedMin;
      salaryMax =
        parsedMax && parsedMax >= parsedMin && parsedMax <= 180000
          ? parsedMax
          : null;
    }
  }

  // Skills extraction
  const skills: string[] = [];
  for (const s of SKILL_DICTIONARY) {
    if (s.pattern.test(plainText) && !skills.includes(s.label)) {
      skills.push(s.label);
    }
  }
  if (skills.length < 2) {
    skills.push(indObj.name_en.split(",")[0].trim(), "GCC Market Experience");
  }

  // Clean bilingual summaries (avoids raw duplicate thin content for Google SEO)
  const summaryEn = `${companyName} is actively recruiting a ${titleEn} based in ${cityObj.name_en}, ${countryObj.name_en} within the ${indObj.name_en} sector. Direct MX-verified corporate HR inbox open for qualified candidates (${experienceLevel}).`;
  const summaryAr = `تعلن شركة ${companyName} عن توفر شاغر وظيفي بمسمى (${titleAr}) للعمل في ${cityObj.name_ar} — ${countryObj.name_ar} ضمن قطاع ${indObj.name_ar}. التقديم متاح مباشرة لصندوق بريد الموارد البشرية الموثق بسجلات DNS MX (${experienceLevel}).`;

  const cleanBulletCandidates = lines
    .filter(
      (l) =>
        l.length >= 22 &&
        l.length <= 150 &&
        !/@/.test(l) &&
        !/https?:\/\//i.test(l)
    )
    .slice(0, 4);

  const requirementsEn =
    cleanBulletCandidates.length >= 2
      ? cleanBulletCandidates
      : [
          `${experienceLevel} in ${indObj.name_en} within the GCC or comparable markets`,
          `Demonstrated proficiency in ${skills.slice(0, 3).join(", ")}`,
          `Available for interview coordination with ${companyName} HR in ${cityObj.name_en}`,
        ];

  const requirementsAr = [
    `خبرة مهنية (${experienceLevel}) في قطاع ${indObj.name_ar} داخل ${countryObj.name_ar} أو دول الخليج`,
    `إتقان المهارات الأساسية المطلوبة للشاغر: ${skills.slice(0, 3).join("، ")}`,
    `جاهزية للتواصل المباشر مع قسم استقطاب الكفاءات في ${cityObj.name_ar}`,
  ];

  return {
    titleEn,
    titleAr,
    companyName,
    experienceLevel,
    employmentType,
    salaryMin,
    salaryMax,
    salaryCurrency: countryObj.currency_code,
    skills: skills.slice(0, 6),
    summaryEn,
    summaryAr,
    requirementsEn,
    requirementsAr,
  };
}

export async function harvestLiveGccJobs(options?: {
  pagesPerChannel?: number;
  maxJobsToInsert?: number;
}): Promise<{
  channelsScraped: number;
  postsScanned: number;
  jobsPublished: number;
  duplicatesSkipped: number;
  companiesEnriched: number;
  publishedSlugs: string[];
}> {
  const pagesPerChannel = Math.min(
    6,
    Math.max(1, options?.pagesPerChannel ?? 2)
  );
  const maxJobs = Math.min(60, Math.max(1, options?.maxJobsToInsert ?? 25));

  const rawCandidates: Array<{
    email: string;
    domain: string;
    postText: string;
    defaultCountry: CountryCode;
    channel: string;
  }> = [];
  const seenPostSignatures = new Set<string>();
  let postsScanned = 0;

  for (const ch of DEFAULT_TELEGRAM_CHANNELS) {
    const cleanUsername = ch.username.replace(/^@/, "").trim();
    if (!cleanUsername) continue;

    let beforeId = "";
    for (let page = 0; page < pagesPerChannel; page++) {
      const url = `https://t.me/s/${cleanUsername}${
        beforeId ? `?before=${beforeId}` : ""
      }`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) break;
        const html = await res.text();
        const msgBlocks = html.split("tgme_widget_message_text");
        postsScanned += Math.max(0, msgBlocks.length - 1);

        for (let b = 1; b < msgBlocks.length; b++) {
          const rawBlock = msgBlocks[b]
            .split(/tgme_widget_message_footer/i)[0]
            .slice(0, 2600)
            .replace(/^[^<]*>/, "");

          const plainText = decodeHtml(
            rawBlock
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<\/(?:p|div|li)>/gi, "\n")
              .replace(/<[^>]+>/g, " ")
          );

          const emails =
            plainText.match(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
            ) || [];

          for (const raw of emails) {
            const email = raw.toLowerCase().replace(/[.,;)>]+$/, "");
            const parts = email.split("@");
            if (parts.length !== 2) continue;
            const domain = parts[1];
            if (/\.(png|jpg|jpeg|gif|webp)$/i.test(domain)) continue;

            const sig = `${email}|${plainText.slice(0, 60)}`;
            if (!seenPostSignatures.has(sig)) {
              seenPostSignatures.add(sig);
              rawCandidates.push({
                email,
                domain,
                postText: plainText,
                defaultCountry: ch.defaultCountry,
                channel: cleanUsername,
              });
            }
          }
        }

        const postIds = [
          ...html.matchAll(/data-post="[^"]+\/(\d+)"/g),
        ].map((m) => Number(m[1]));
        if (postIds.length === 0) break;
        const minId = Math.min(...postIds);
        if (minId <= 1 || String(minId) === beforeId) break;
        beforeId = String(minId);
      } catch {
        break;
      }
    }
  }

  const structuredInputs: NewJobInput[] = [];
  const discoveredCompanies: Array<{
    company_name: string;
    hr_email: string;
    country_code: CountryCode;
    city_id: string;
    industry_id: string;
    sub_specialty: string;
  }> = [];

  const BATCH_SIZE = 12;
  for (
    let i = 0;
    i < rawCandidates.length && structuredInputs.length < maxJobs;
    i += BATCH_SIZE
  ) {
    const slice = rawCandidates.slice(i, i + BATCH_SIZE);
    const verifiedBatch = await Promise.all(
      slice.map(async (cand) => {
        const check = await verifyCompanyEmail(cand.email, {
          checkMx: true,
          allowPersonalWebmail: false,
        });
        if (!check.valid) return null;

        const loc = detectLocation(
          cand.postText,
          cand.domain,
          cand.defaultCountry
        );
        const industryId = classifyCompanyIndustry({
          rawIndustry: cand.postText.slice(0, 500),
          domain: cand.domain,
          email: cand.email,
        });
        const parsed = extractStructuredRoleFromPost(
          cand.postText,
          cand.domain,
          loc.countryCode,
          loc.cityId,
          industryId
        );
        if (!parsed) return null;

        return {
          jobInput: {
            title_ar: parsed.titleAr,
            title_en: parsed.titleEn,
            company_name: parsed.companyName,
            company_domain: cand.domain,
            apply_email: cand.email,
            country_code: loc.countryCode,
            city_id: loc.cityId,
            industry_id: industryId,
            employment_type: parsed.employmentType,
            experience_level: parsed.experienceLevel,
            salary_min: parsed.salaryMin,
            salary_max: parsed.salaryMax,
            salary_currency: parsed.salaryCurrency,
            summary_ar: parsed.summaryAr,
            summary_en: parsed.summaryEn,
            requirements_ar: parsed.requirementsAr,
            requirements_en: parsed.requirementsEn,
            skills: parsed.skills,
            source_type: "verified_harvester" as const,
            source_channel: `tg:${cand.channel}`,
            is_mx_verified: true,
            status: "published" as const,
          },
          companyInput: {
            company_name: parsed.companyName,
            hr_email: cand.email,
            country_code: loc.countryCode,
            city_id: loc.cityId,
            industry_id: industryId,
            sub_specialty: parsed.titleEn,
          },
        };
      })
    );

    for (const item of verifiedBatch) {
      if (!item) continue;
      if (structuredInputs.length < maxJobs) {
        structuredInputs.push(item.jobInput);
        discoveredCompanies.push(item.companyInput);
      }
    }
  }

  const { inserted, skippedDuplicates } =
    await upsertJobPostings(structuredInputs);

  let companiesEnriched = 0;
  if (discoveredCompanies.length > 0) {
    try {
      const compRes = await bulkImportCompanies(discoveredCompanies, {
        checkMx: false,
        allowPersonalWebmail: false,
      });
      companiesEnriched = compRes.imported;
    } catch {
      companiesEnriched = 0;
    }
  }

  return {
    channelsScraped: DEFAULT_TELEGRAM_CHANNELS.length,
    postsScanned,
    jobsPublished: inserted.length,
    duplicatesSkipped: skippedDuplicates,
    companiesEnriched,
    publishedSlugs: inserted.map((j) => j.slug),
  };
}
