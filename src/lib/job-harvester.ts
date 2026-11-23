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
import {
  computeJobDedupeHash,
  getAllJobsRaw,
  NewJobInput,
  upsertJobPostings,
} from "@/lib/jobs-store";
import {
  collectUniqueNewJobs,
  extractTelegramMessageCandidates,
  prioritizeHarvestCandidates,
  stripLeadingBulletOrEmoji,
  stripLoneSurrogates,
  TelegramRawCandidate,
} from "@/lib/job-harvester-utils";
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

const ARABIC_JOB_LABEL_PATTERNS: RegExp[] = [
  /(?:المسمى(?:\s+الوظيفي)?|الوظيفة)\s*[:\-–—]\s*([\u0600-\u06FF0-9A-Za-z\s/&+.,()–—-]{4,68})/i,
  /📌\s*([\u0600-\u06FF0-9A-Za-z\s/&+.,()–—-]{4,68})/u,
];

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

function extractStructuredRolesFromPost(
  plainText: string,
  domain: string,
  email: string,
  countryCode: CountryCode,
  cityId: string
): Array<{
  titleEn: string;
  titleAr: string;
  isPureArabicRole: boolean;
  companyName: string;
  industryId: string;
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
}> {
  const lines = plainText
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const ROLE_NOUN =
    /\b(engineer|accountant|auditor|developer|programmer|manager|specialist|officer|coordinator|supervisor|architect|designer|pharmacist|nurse|doctor|physician|analyst|consultant|recruiter|controller|surveyor|draftsman|foreman|estimator|purchaser|buyer|technician|secretary|receptionist|executive|lawyer|teacher)\b/i;

  let companyName = "";
  const rawRoleTitles: string[] = [];

  const stripRoleLabelPrefix = (val: string) =>
    stripLeadingBulletOrEmoji(val)
      .replace(
        /^(?:position|role|job\s*title|designation|vacancy|المسمى(?:\s+الوظيفي)?|الوظيفة)\s*[:\-–—]\s*/i,
        ""
      )
      .trim();

  for (const line of lines) {
    if (!companyName) {
      const m = line.match(
        /(?:company\s*name|company|employer|organization|الجهة|الشركة|اسم\s+الشركة)\s*[:\-–—]\s*([A-Za-z0-9\u0600-\u06FF\s&.,'()–—-]{3,65})/i
      );
      if (m?.[1] && !/confidential|leading|reputed/i.test(m[1])) {
        companyName = stripLoneSurrogates(m[1].trim());
      } else if (/🏢/u.test(line) && !/employer|company|الجهة|الشركة/i.test(line)) {
        const pinOrg = line.match(
          /🏢\s*([A-Za-z0-9\u0600-\u06FF\s&.,'()–—-]{3,65})/u
        );
        if (pinOrg?.[1] && !/confidential|leading|reputed/i.test(pinOrg[1])) {
          companyName = stripLoneSurrogates(pinOrg[1].trim());
        }
      }
    }

    const explicitRole = line.match(
      /(?:position|role|job\s*title|designation|vacancy)\s*[:\-–—]\s*([A-Za-z0-9\s/&+.,()–—-]{4,68})/i
    );
    if (explicitRole?.[1]) {
      const cleaned = stripRoleLabelPrefix(explicitRole[1])
        .replace(/\b(urgent|urgently|hiring|required|apply\s+now)\b[:\s\-]*/gi, "")
        .trim();
      if (cleaned.length >= 4) rawRoleTitles.push(cleaned);
      continue;
    }

    // Detect multi-vacancy numbered or bulleted role lines (e.g. "1. Civil Engineer", "• Senior Accountant")
    const bulletMatch = line.match(
      /^(?:[0-9]{1,2}[.)\-]|[•\-–—*⚡🔥📌📢✅👉💼])\s*([A-Za-z0-9\s/&+.,()–—-]{4,58})$/u
    );
    if (bulletMatch?.[1] && ROLE_NOUN.test(bulletMatch[1])) {
      const cleaned = stripRoleLabelPrefix(bulletMatch[1])
        .replace(/\s*\([0-9]+\s*(?:nos?|positions?|vacancies|yrs?|years?).*\)$/i, "")
        .replace(/\b(urgent|urgently|hiring|required|apply\s+now)\b[:\s\-]*/gi, "")
        .trim();
      if (cleaned.length >= 4 && !/@/.test(cleaned)) {
        rawRoleTitles.push(cleaned);
      }
    }
  }

  if (rawRoleTitles.length === 0) {
    for (const line of lines) {
      for (const arPat of ARABIC_JOB_LABEL_PATTERNS) {
        const m = line.match(arPat);
        if (m?.[1]) {
          const cleaned = stripRoleLabelPrefix(
            m[1].replace(/\s*[•·|].*$/, "")
          );
          if (cleaned.length >= 4 && !/@/.test(cleaned)) {
            rawRoleTitles.push(cleaned);
            break;
          }
        }
      }
      if (rawRoleTitles.length >= 3) break;
    }
  }

  if (rawRoleTitles.length === 0) {
    const nat = plainText.match(
      /(?:hiring|looking\s+for|seeking|required)\s+(?:a\s+|an\s+|experienced\s+)*([A-Za-z0-9\s/&+.-]{5,52}?)(?:\s+(?:in\s+|for\s+|with\s+|to\s+join|immediately)|[.,!\n\r|]|$)/i
    );
    if (nat?.[1] && ROLE_NOUN.test(nat[1])) {
      rawRoleTitles.push(stripRoleLabelPrefix(nat[1]));
    }
  }

  if (rawRoleTitles.length === 0) {
    for (const l of lines) {
      if (l.length >= 6 && l.length <= 68 && ROLE_NOUN.test(l) && !/@/.test(l)) {
        const cleaned = stripRoleLabelPrefix(l);
        if (cleaned.length >= 4) {
          rawRoleTitles.push(cleaned);
          if (rawRoleTitles.length >= 4) break;
        }
      }
    }
  }

  // Deduplicate extracted role titles within the same company post (up to 5 roles)
  const NOISE_ROLE_TITLE =
    /^(?:candidates?|applicants?|staff|personnel|workers?|long[\s-]term.*|short[\s-]term.*|any\s+nationality|all\s+nationalities|immediately|urgent(?:ly)?|job\s+opportunity|uae\s+jobs|ksa\s+jobs|saudi\s+jobs|qatar\s+jobs|kuwait\s+jobs|فرصة\s+وظيفية|وظائف\s+الإمارات)$/i;
  const uniqueTitles: string[] = [];
  const seenKeys = new Set<string>();
  for (const t of rawRoleTitles) {
    const normalized = t
      .replace(/\s{2,}/g, " ")
      .slice(0, 68)
      .replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
    if (NOISE_ROLE_TITLE.test(normalized) || /@/.test(normalized)) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (normalized.length >= 4 && !seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueTitles.push(normalized);
      if (uniqueTitles.length >= 5) break;
    }
  }

  if (uniqueTitles.length === 0) return [];

  if (!companyName) {
    companyName = formatCompanyFromDomain(domain);
  }

  const countryObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) || INITIAL_COUNTRIES[0];
  const cityObj =
    countryObj.cities.find((c) => c.id === cityId) || countryObj.cities[0];

  const expMatch = plainText.match(/(\d{1,2})\s*(?:\+|to|\-)\s*(\d{1,2})?\s*years?/i);
  const experienceLevel = expMatch
    ? expMatch[2]
      ? `${expMatch[1]}-${expMatch[2]} Years Experience`
      : `${expMatch[1]}+ Years Experience`
    : "Mid-Senior (3-7 Years)";

  const employmentType: EmploymentType = /\bremote\b/i.test(plainText)
    ? "REMOTE"
    : /\bpart[\s-]?time\b/i.test(plainText)
    ? "PART_TIME"
    : /\bcontract|temporary\b/i.test(plainText)
    ? "CONTRACT"
    : "FULL_TIME";

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

  const postSkills: string[] = [];
  for (const s of SKILL_DICTIONARY) {
    if (s.pattern.test(plainText) && !postSkills.includes(s.label)) {
      postSkills.push(s.label);
    }
  }

  const cleanBulletCandidates = lines
    .filter(
      (l) =>
        l.length >= 22 &&
        l.length <= 150 &&
        /[A-Za-z]{4,}/.test(l) &&
        !/@/.test(l) &&
        !/https?:\/\//i.test(l)
    )
    .slice(0, 4);

  return uniqueTitles.map((rawRoleTitle) => {
    const isPureArabicRole =
      /[\u0600-\u06FF]/.test(rawRoleTitle) && !/[A-Za-z]{3,}/.test(rawRoleTitle);

    // Classify each role into its own exact category independently!
    const industryId = classifyCompanyIndustry({
      subSpecialty: rawRoleTitle,
      companyName,
      domain,
      email,
      rawIndustry:
        uniqueTitles.length === 1 || isPureArabicRole
          ? plainText.slice(0, 500)
          : rawRoleTitle,
    });
    const indObj =
      INITIAL_INDUSTRIES.find((i) => i.id === industryId) ||
      INITIAL_INDUSTRIES[0];

    let titleEn = rawRoleTitle;
    let titleAr = "";
    if (isPureArabicRole) {
      titleAr = rawRoleTitle;
      titleEn = `${indObj.name_en.split(",")[0].trim()} Specialist`;
    } else {
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
    }

    const roleSkills = [...postSkills];
    if (roleSkills.length < 2) {
      roleSkills.push(indObj.name_en.split(",")[0].trim(), "GCC Market Experience");
    }

    const summaryEn = `${companyName} is actively recruiting a ${titleEn} based in ${cityObj.name_en}, ${countryObj.name_en} within the ${indObj.name_en} sector. Direct MX-verified corporate HR inbox open for qualified candidates (${experienceLevel}).`;
    const summaryAr = `تعلن شركة ${companyName} عن توفر شاغر وظيفي بمسمى (${titleAr}) للعمل في ${cityObj.name_ar} — ${countryObj.name_ar} ضمن قطاع ${indObj.name_ar}. التقديم متاح مباشرة لصندوق بريد الموارد البشرية الموثق بسجلات DNS MX (${experienceLevel}).`;

    const requirementsEn =
      cleanBulletCandidates.length >= 2 && uniqueTitles.length === 1
        ? cleanBulletCandidates
        : [
            `${experienceLevel} in ${indObj.name_en} within the GCC or comparable markets`,
            `Demonstrated proficiency in ${roleSkills.slice(0, 3).join(", ")}`,
            `Available for interview coordination with ${companyName} HR in ${cityObj.name_en}`,
          ];

    const requirementsAr = [
      `خبرة مهنية (${experienceLevel}) في قطاع ${indObj.name_ar} داخل ${countryObj.name_ar} أو دول الخليج`,
      `إتقان المهارات الأساسية المطلوبة للشاغر: ${roleSkills.slice(0, 3).join("، ")}`,
      `جاهزية للتواصل المباشر مع قسم استقطاب الكفاءات في ${cityObj.name_ar}`,
    ];

    return {
      titleEn: stripLoneSurrogates(titleEn),
      titleAr: stripLoneSurrogates(titleAr),
      isPureArabicRole,
      companyName: stripLoneSurrogates(companyName),
      industryId,
      experienceLevel,
      employmentType,
      salaryMin,
      salaryMax,
      salaryCurrency: countryObj.currency_code,
      skills: roleSkills.slice(0, 6),
      summaryEn: stripLoneSurrogates(summaryEn),
      summaryAr: stripLoneSurrogates(summaryAr),
      requirementsEn: requirementsEn.map((r) => stripLoneSurrogates(r)),
      requirementsAr: requirementsAr.map((r) => stripLoneSurrogates(r)),
    };
  });
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
  categoriesUpdated: number;
  publishedSlugs: string[];
}> {
  const pagesPerChannel = Math.min(
    6,
    Math.max(1, options?.pagesPerChannel ?? 2)
  );
  const maxJobs = Math.min(60, Math.max(1, options?.maxJobsToInsert ?? 25));

  const rawCandidates: TelegramRawCandidate[] = [];
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
        const extracted = extractTelegramMessageCandidates(
          html,
          cleanUsername,
          ch.defaultCountry
        );
        postsScanned += extracted.postsScanned;

        for (const cand of extracted.candidates) {
          const sig = `${cand.email}|${cand.postText.slice(0, 60)}`;
          if (!seenPostSignatures.has(sig)) {
            seenPostSignatures.add(sig);
            rawCandidates.push(cand);
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

  const sortedCandidates = prioritizeHarvestCandidates(rawCandidates);
  const existingJobs = await getAllJobsRaw();
  const existingHashes = new Set<string>(
    existingJobs.map((j) => j.dedupe_hash).filter(Boolean)
  );
  const knownApplyEmails = new Set<string>(
    existingJobs
      .map((j) => (j.apply_email || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const seenBatchHashes = new Set<string>();
  let preSkippedDuplicates = 0;

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
  const maxCandidatesToCheck = Math.min(
    sortedCandidates.length,
    Math.max(120, maxJobs * 8)
  );

  for (
    let i = 0;
    i < maxCandidatesToCheck && structuredInputs.length < maxJobs;
    i += BATCH_SIZE
  ) {
    const slice = sortedCandidates.slice(i, i + BATCH_SIZE);
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
        const parsedRoles = extractStructuredRolesFromPost(
          cand.postText,
          cand.domain,
          cand.email,
          loc.countryCode,
          loc.cityId
        );
        if (parsedRoles.length === 0) return null;

        return parsedRoles.map((parsed) => ({
          applyEmail: cand.email,
          isPureArabicRole: parsed.isPureArabicRole,
          dedupeHash: computeJobDedupeHash({
            titleEn: parsed.titleEn,
            titleAr: parsed.titleAr,
            companyDomain: cand.domain,
            companyName: parsed.companyName,
            countryCode: loc.countryCode,
            cityId: loc.cityId,
          }),
          jobInput: {
            title_ar: parsed.titleAr,
            title_en: parsed.titleEn,
            company_name: parsed.companyName,
            company_domain: cand.domain,
            apply_email: cand.email,
            country_code: loc.countryCode,
            city_id: loc.cityId,
            industry_id: parsed.industryId,
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
            industry_id: parsed.industryId,
            sub_specialty: parsed.titleEn,
          },
        }));
      })
    );

    const flatBatch: Array<{
      applyEmail: string;
      isPureArabicRole: boolean;
      dedupeHash: string;
      jobInput: NewJobInput;
      companyInput: (typeof discoveredCompanies)[number];
    }> = [];

    for (const group of verifiedBatch) {
      if (!group) continue;
      for (const item of group) {
        // Avoid duplicating a bilingual mirror post when the same HR inbox already has a primary role
        if (item.isPureArabicRole && knownApplyEmails.has(item.applyEmail)) {
          preSkippedDuplicates++;
          continue;
        }
        knownApplyEmails.add(item.applyEmail);
        flatBatch.push(item);
      }
    }

    const filtered = collectUniqueNewJobs(
      flatBatch,
      existingHashes,
      seenBatchHashes,
      maxJobs - structuredInputs.length
    );
    preSkippedDuplicates += filtered.skippedDuplicates;

    for (const item of filtered.accepted) {
      structuredInputs.push(item.jobInput);
      discoveredCompanies.push(item.companyInput);
    }
  }

  const { inserted, skippedDuplicates } =
    await upsertJobPostings(structuredInputs);

  let companiesEnriched = 0;
  let categoriesUpdated = 0;
  if (discoveredCompanies.length > 0) {
    try {
      const compRes = await bulkImportCompanies(discoveredCompanies, {
        checkMx: false,
        allowPersonalWebmail: false,
      });
      companiesEnriched = compRes.imported;
      categoriesUpdated = compRes.updatedCategories || 0;
    } catch {
      companiesEnriched = 0;
    }
  }

  return {
    channelsScraped: DEFAULT_TELEGRAM_CHANNELS.length,
    postsScanned,
    jobsPublished: inserted.length,
    duplicatesSkipped: preSkippedDuplicates + skippedDuplicates,
    companiesEnriched,
    categoriesUpdated,
    publishedSlugs: inserted.map((j) => j.slug),
  };
}
