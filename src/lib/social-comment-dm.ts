// ==============================================================================
// ASRA3.COM — Instagram & Facebook Comment-to-DM Keyword Router
// Pure domain module (zero Next.js runtime deps so Node tests import directly)
// ==============================================================================

import type { CountryCode } from "@/lib/types";
import { formatBilingualJobTitle } from "@/lib/social-cadence";

export type SocialPlatform = "instagram" | "facebook";

export const PINNED_IG_MEDIA_IDS = {
  WELCOME_JOBS: "18112628279260777",
  ATS_CAROUSEL: "17934584481162759",
  VIP_SHIELD: "18082305320722909",
} as const;

export const DEFAULT_IG_ACCOUNT_ID = "17841466030342647";
export const DEFAULT_IG_USERNAME = "asra3_jobs";
export const PROMO_CODE = "ASRA3VIP";
export const INSTAGRAM_DM_MAX_CHARS = 950;

export interface MatchedJobSummary {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  company_name: string;
  country_code: CountryCode;
  city_name_ar: string;
  city_name_en: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
}

export interface SocialCommentResolveInput {
  platform: SocialPlatform;
  commentId: string;
  mediaId?: string | null;
  text: string;
  fromId?: string | null;
  username?: string | null;
  ownAccountId?: string | null;
  ownUsername?: string | null;
  siteUrl?: string;
  matchedJob?: MatchedJobSummary | null;
}

export type CommentSkipReason =
  | "empty_comment"
  | "self_comment"
  | "no_keyword_match"
  | null;

export type CommentMatchedRule =
  | "employer_intent"
  | "job_reel_exact"
  | "pin1_welcome_jobs"
  | "pin2_ats_carousel"
  | "pin3_vip_shield"
  | "vip_ats_intent"
  | "country_hub"
  | "general_jobs"
  | null;

export interface SocialCommentResolveResult {
  should_reply: boolean;
  skip_reason: CommentSkipReason;
  matched_rule: CommentMatchedRule;
  matched_keyword: string | null;
  matched_country: CountryCode | null;
  job_slug: string | null;
  target_url: string | null;
  dm_text: string | null;
  public_reply_text: string | null;
  public_reply_fallback_text: string | null;
}

const COUNTRY_META: Record<CountryCode, { labelAr: string; labelEn: string }> = {
  AE: { labelAr: "الإمارات (دبي / أبوظبي)", labelEn: "UAE" },
  SA: { labelAr: "السعودية (الرياض / جدة)", labelEn: "Saudi Arabia" },
  QA: { labelAr: "قطر (الدوحة)", labelEn: "Qatar" },
  KW: { labelAr: "الكويت", labelEn: "Kuwait" },
};

const ARABIC_BASE_PREFIX_RE = /^(?:وال|بال|كال|فال|لل|ال|و|ب|ل)/;

const EMPLOYER_PHRASES = [
  "صاحب عمل",
  "نشر وظيفه",
  "اعلان وظيفه",
  "توظيف مجاني",
  "post job",
];
const EMPLOYER_TOKENS = [
  "شركات",
  "شركه",
  "للتوظيف",
  "employer",
  "employers",
  "hire",
  "hiring",
  "recruiter",
];

const VIP_ATS_PHRASES = ["حجب مديري", "كود خصم"];
const VIP_ATS_TOKENS = [
  "خصم",
  "عرض",
  "كود",
  "باقه",
  "باقات",
  "سيره",
  "سيرتي",
  "فحص",
  "توزيع",
  "حجب",
  "مديري",
  "vip",
  "asra3vip",
  "ats",
  "cv",
  "resume",
  "scan",
  "shield",
  "discount",
  "offer",
  "promo",
  "packages",
  "pricing",
];

const COUNTRY_TRIGGERS: Array<{
  code: CountryCode;
  phrases: string[];
  tokens: string[];
}> = [
  {
    code: "AE",
    phrases: ["ابو ظبي"],
    tokens: [
      "دبي",
      "ابوظبي",
      "شارقه",
      "الشارقه",
      "امارات",
      "الامارات",
      "dubai",
      "abudhabi",
      "sharjah",
      "uae",
      "emirates",
    ],
  },
  {
    code: "SA",
    phrases: [],
    tokens: [
      "رياض",
      "الرياض",
      "جده",
      "دمام",
      "الدمام",
      "الخبر",
      "سعوديه",
      "السعوديه",
      "riyadh",
      "jeddah",
      "dammam",
      "khobar",
      "saudi",
      "ksa",
    ],
  },
  {
    code: "QA",
    phrases: [],
    tokens: ["دوحه", "الدوحه", "قطر", "doha", "qatar"],
  },
  {
    code: "KW",
    phrases: [],
    tokens: ["كويت", "الكويت", "kuwait"],
  },
];

const GENERAL_JOB_TOKENS = [
  "وظيفه",
  "وظائف",
  "شواغر",
  "شاغر",
  "تقديم",
  "اقدم",
  "قدم",
  "رابط",
  "مهتم",
  "مهتمه",
  "تفاصيل",
  "اسرع",
  "معلومات",
  "ابغي",
  "ابغى",
  "عايز",
  "اريد",
  "كيف",
  "job",
  "jobs",
  "apply",
  "link",
  "info",
  "details",
  "interested",
  "dm",
  "asra3",
  "send",
  "salary",
  "vacancy",
  "vacancies",
];

const PUBLIC_REPLY_VARIANTS = [
  "أهلاً بك! أرسلنا لك الرابط المباشر وفحص الـ ATS مجاناً في الرسائل الخاصة 📩✨ (تأكد من خانة طلبات الرسائل Message Requests)",
  "تم إرسال رابط التقديم المباشر + تفاصيل فحص السيرة الذاتية في الخاص 📩⚡ بالتوفيق!",
  "شيك الرسائل الخاصة الآن 📩 أرسلنا لك الرابط المباشر وكود الخصم الحصري ASRA3VIP ✨",
  "تم الإرسال في الـ DM 📩✨ راجع صندوق الرسائل (أو Message Requests) لفتح الرابط المباشر.",
];

const PUBLIC_REPLY_FALLBACK_VARIANTS = [
  "أهلاً بك! لم نتمكن من إرسال رسالة خاصة بسبب إعدادات الخصوصية — افتح الرابط في البايو مباشرة للتقديم وفحص الـ ATS مجاناً (كود الخصم 20%: ASRA3VIP) 🔗⚡",
  "مرحباً! حسابك يقيّد استلام الرسائل من غير المتابعين — استخدم رابط البايو الآن للتقديم المباشر وفحص سيرتك مجاناً + كود ASRA3VIP 🔗✨",
];

/**
 * Normalizes Arabic & Latin comment text for deterministic keyword matching:
 * strips tashkeel/tatweel, unifies alef/taa marbuta/alef maqsura, removes punctuation/emoji.
 */
export function normalizeCommentText(input: string): string {
  return String(input || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    // Keep Latin alphanumeric + Arabic letters/digits only (drops ؟ ، ؛ emoji/punctuation)
    .replace(/[^a-z0-9\u0621-\u064A\u0660-\u0669]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Appends UTM query parameters cleanly before any URL #hash anchor.
 */
export function buildTrackedUrl(
  siteUrl: string,
  pathname: string,
  utm: { source: string; medium: string; campaign: string },
  hash?: string
): string {
  const base = (siteUrl || "https://asra3.com").replace(/\/+$/, "");
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = new URLSearchParams({
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
  }).toString();
  const fragment = hash ? `#${hash.replace(/^#/, "")}` : "";
  return `${base}${cleanPath}?${query}${fragment}`;
}

interface ParsedComment {
  tokens: string[];
  tokenSet: Set<string>;
  padded: string;
}

function parseNormalizedComment(norm: string): ParsedComment {
  const tokens = norm ? norm.split(" ").filter(Boolean) : [];
  return {
    tokens,
    tokenSet: new Set(tokens),
    padded: norm ? ` ${norm} ` : "",
  };
}

function tokenMatchesTrigger(token: string, trigger: string): boolean {
  if (token === trigger) return true;
  // Permit Arabic definite-article & single-letter prepositions (e.g. دبي -> بدبي / لدبي, ال... -> بال...)
  const isArabic = /[\u0600-\u06FF]/.test(trigger);
  if (!isArabic || trigger.length < 3) return false;

  const triggerRoot = trigger.startsWith("ال") ? trigger.slice(2) : trigger;
  if (triggerRoot.length < 3) return false;
  if (!ARABIC_BASE_PREFIX_RE.test(token)) return false;

  const stripped = token.replace(ARABIC_BASE_PREFIX_RE, "");
  return stripped === trigger || stripped === triggerRoot;
}

function matchTriggers(
  parsed: ParsedComment,
  phrases: string[],
  tokens: string[]
): string | null {
  for (const phrase of phrases) {
    if (parsed.padded.includes(` ${phrase} `)) {
      return phrase;
    }
  }
  for (const trigger of tokens) {
    if (parsed.tokenSet.has(trigger)) {
      return trigger;
    }
    if (/[\u0600-\u06FF]/.test(trigger)) {
      for (const tok of parsed.tokens) {
        if (tokenMatchesTrigger(tok, trigger)) {
          return trigger;
        }
      }
    }
  }
  return null;
}

function pickVariant(commentId: string, list: string[]): string {
  let hash = 0;
  for (let i = 0; i < commentId.length; i++) {
    hash = (hash * 31 + commentId.charCodeAt(i)) >>> 0;
  }
  return list[hash % list.length];
}

function formatCompactSalary(job: MatchedJobSummary): string {
  const minVal = typeof job.salary_min === "number" && job.salary_min > 0 ? job.salary_min : null;
  const maxVal = typeof job.salary_max === "number" && job.salary_max > 0 ? job.salary_max : null;
  const currency = job.salary_currency || "AED";
  if (minVal && maxVal && minVal !== maxVal) {
    return `${Math.min(minVal, maxVal).toLocaleString("en-US")}–${Math.max(minVal, maxVal).toLocaleString("en-US")} ${currency}`;
  }
  if (minVal) return `${minVal.toLocaleString("en-US")} ${currency}`;
  if (maxVal) return `Up to ${maxVal.toLocaleString("en-US")} ${currency}`;
  return "";
}

function clampDmText(text: string): string {
  if (text.length <= INSTAGRAM_DM_MAX_CHARS) {
    return text;
  }
  return `${text.slice(0, INSTAGRAM_DM_MAX_CHARS - 3).trimEnd()}...`;
}

/**
 * Resolves the exact DM & public reply payload for an Instagram or Facebook comment.
 * Enforces self-comment loop prevention, zero false-positive keyword matching,
 * exact Job Reel resolution, Pinned Foundation Post routing, and DM length safety.
 */
export function resolveSocialCommentReply(
  input: SocialCommentResolveInput
): SocialCommentResolveResult {
  const emptyResult = (skipReason: CommentSkipReason): SocialCommentResolveResult => ({
    should_reply: false,
    skip_reason: skipReason,
    matched_rule: null,
    matched_keyword: null,
    matched_country: null,
    job_slug: null,
    target_url: null,
    dm_text: null,
    public_reply_text: null,
    public_reply_fallback_text: null,
  });

  const commentId = String(input.commentId || "").trim();
  const rawText = String(input.text || "").trim();
  if (!commentId || !rawText) {
    return emptyResult("empty_comment");
  }

  const ownId = String(input.ownAccountId || DEFAULT_IG_ACCOUNT_ID).trim();
  const ownUser = String(input.ownUsername || DEFAULT_IG_USERNAME).trim().toLowerCase();
  const fromId = String(input.fromId || "").trim();
  const fromUser = String(input.username || "").trim().toLowerCase();
  if ((ownId && fromId === ownId) || (ownUser && fromUser === ownUser)) {
    return emptyResult("self_comment");
  }

  const norm = normalizeCommentText(rawText);
  const parsed = parseNormalizedComment(norm);

  const employerMatch = matchTriggers(parsed, EMPLOYER_PHRASES, EMPLOYER_TOKENS);
  const vipAtsMatch = matchTriggers(parsed, VIP_ATS_PHRASES, VIP_ATS_TOKENS);

  let matchedCountry: CountryCode | null = null;
  let countryKeyword: string | null = null;
  for (const entry of COUNTRY_TRIGGERS) {
    const hit = matchTriggers(parsed, entry.phrases, entry.tokens);
    if (hit) {
      matchedCountry = entry.code;
      countryKeyword = hit;
      break;
    }
  }

  const generalMatch = matchTriggers(parsed, [], GENERAL_JOB_TOKENS);
  const firstMatch = employerMatch || countryKeyword || vipAtsMatch || generalMatch;

  if (!firstMatch) {
    return emptyResult("no_keyword_match");
  }

  const siteUrl = (input.siteUrl || "https://asra3.com").replace(/\/+$/, "");
  const mediaId = String(input.mediaId || "").trim();
  const utmBase = { source: input.platform, medium: "dm" };
  const wizardVipUrl = buildTrackedUrl(
    siteUrl,
    "/",
    { ...utmBase, campaign: "comment_ats_vip" },
    "wizard-section"
  );

  let matchedRule: CommentMatchedRule = null;
  let matchedKeyword = firstMatch;
  let targetUrl = "";
  let dmText = "";
  let jobSlug: string | null = null;

  if (employerMatch) {
    matchedRule = "employer_intent";
    matchedKeyword = employerMatch;
    targetUrl = buildTrackedUrl(siteUrl, "/employers", {
      ...utmBase,
      campaign: "comment_employers",
    });
    dmText = [
      "أهلاً بك في منصة أسرع للشركات (Asra3 for Employers) 🏢⚡",
      "",
      "✅ انشر شواغرك في الخليج مجاناً 100% خلال 60 ثانية:",
      "• فهرسة تلقائية على Google Jobs + توزيع أوتوماتيكي لباحثين موثقين",
      "• عرض شارة بريد HR المفحوص بسجل DNS MX",
      "",
      `🔗 رابط بوابة الشركات المجانية:\n${targetUrl}`,
    ].join("\n");
  } else if (input.matchedJob) {
    const job = input.matchedJob;
    matchedRule = "job_reel_exact";
    matchedKeyword = countryKeyword || vipAtsMatch || generalMatch || firstMatch;
    jobSlug = job.slug;
    targetUrl = buildTrackedUrl(siteUrl, `/jobs/${job.slug}`, {
      ...utmBase,
      campaign: "comment_job_reel",
    });
    const cleanTitle = formatBilingualJobTitle(job.title_ar, job.title_en);
    const salaryLine = formatCompactSalary(job);

    const lines = [
      "أهلاً بك! هذا رابط التقديم المباشر على الوظيفة في الفيديو 👇⚡",
      "",
      `📌 ${cleanTitle}`,
      `🏢 ${job.company_name} (بريد HR مفحوص DNS MX ✓)`,
      `📍 ${job.city_name_ar} (${job.city_name_en})`,
      salaryLine ? `💰 الراتب التقديري: ${salaryLine}` : "",
      "",
      `🔗 التقديم المباشر للـ HR:\n${targetUrl}`,
      "",
      `🛡️ فحص سيرتك بالـ ATS مجاناً + توزيع مباشر لـ 500+ شركة (خصم 20% بكود ${PROMO_CODE}):\n${wizardVipUrl}`,
    ];

    if (matchedCountry && matchedCountry !== job.country_code) {
      const altUrl = buildTrackedUrl(
        siteUrl,
        `/${matchedCountry.toLowerCase()}/jobs`,
        { ...utmBase, campaign: `comment_city_${matchedCountry.toLowerCase()}` }
      );
      lines.push("", `🌍 تبحث في ${COUNTRY_META[matchedCountry].labelAr}؟\n${altUrl}`);
    }

    dmText = lines.filter(Boolean).join("\n");
  } else if (mediaId === PINNED_IG_MEDIA_IDS.WELCOME_JOBS) {
    matchedRule = "pin1_welcome_jobs";
    if (matchedCountry) {
      matchedKeyword = countryKeyword!;
      targetUrl = buildTrackedUrl(
        siteUrl,
        `/${matchedCountry.toLowerCase()}/jobs`,
        { ...utmBase, campaign: `pin1_city_${matchedCountry.toLowerCase()}` }
      );
      dmText = [
        `أهلاً بك في أسرع! هذه أحدث شواغر ${COUNTRY_META[matchedCountry].labelAr} الموثقة اليوم 👇⚡`,
        "",
        `🔗 وظائف ${COUNTRY_META[matchedCountry].labelEn} الموثقة:\n${targetUrl}`,
        "",
        `🛡️ افحص سيرتك الذاتية بالـ ATS مجاناً واستخدم كود ${PROMO_CODE} لخصم 20% على باقات التوزيع المباشر للـ HR:\n${wizardVipUrl}`,
      ].join("\n");
    } else {
      targetUrl = buildTrackedUrl(siteUrl, "/jobs", {
        ...utmBase,
        campaign: "pin1_welcome",
      });
      dmText = [
        "أهلاً بك في منصة أسرع (Asra3.com) ⚡",
        "وظائف حقيقية في الإمارات والسعودية وقطر والكويت — التقديم مباشر لبريد الـ HR المفحوص بسجلات DNS MX ✓",
        "",
        `🔗 تصفح وظائف الخليج الموثقة الآن:\n${targetUrl}`,
        "",
        `🤖 افحص سيرتك بالـ ATS مجاناً + خصم 20% بكود ${PROMO_CODE}:\n${wizardVipUrl}`,
      ].join("\n");
    }
  } else if (mediaId === PINNED_IG_MEDIA_IDS.ATS_CAROUSEL) {
    matchedRule = "pin2_ats_carousel";
    targetUrl = buildTrackedUrl(
      siteUrl,
      "/",
      { ...utmBase, campaign: "pin2_carousel" },
      "wizard-section"
    );
    dmText = [
      "دليل أسرع لتجاوز أنظمة الفرز ATS والوصول لبريد الـ HR في الخليج مباشرة 🎯⚡",
      "",
      "1️⃣ ارفع سيرتك الذاتية واحصل على فحص ATS فوري مجاناً",
      "2️⃣ اختر باقة التوزيع: Launch (129) / Turbo (229) / Hyper (349)",
      `3️⃣ استخدم كود ${PROMO_CODE} لخصم 20% فوري + تفعيل درع حجب شركتك الحالية 100%`,
      "",
      `🔗 ابدأ الفحص المجاني الآن:\n${targetUrl}`,
    ].join("\n");
  } else if (mediaId === PINNED_IG_MEDIA_IDS.VIP_SHIELD) {
    matchedRule = "pin3_vip_shield";
    targetUrl = buildTrackedUrl(
      siteUrl,
      "/",
      { ...utmBase, campaign: "pin3_vip_shield" },
      "wizard-section"
    );
    dmText = [
      `🎁 عرض الإطلاق الحصري — خصم 20% بكود: ${PROMO_CODE}`,
      "🛡️ مع درع الحماية 100% (Employer Exclusion Shield): مديرك الحالي وشركتك لن يشاهدوا سيرتك الذاتية أبداً!",
      "",
      "ارفع سيرتك للفحص المجاني بالـ ATS ووزّعها مباشرة لصناديق بريد الـ HR الموثقة في الإمارات والسعودية وقطر والكويت:",
      `🔗 ${targetUrl}`,
    ].join("\n");
  } else if (vipAtsMatch) {
    matchedRule = "vip_ats_intent";
    matchedKeyword = vipAtsMatch;
    targetUrl = buildTrackedUrl(
      siteUrl,
      "/",
      { ...utmBase, campaign: "comment_vip_ats" },
      "wizard-section"
    );
    dmText = [
      "🤖 افحص سيرتك الذاتية بنظام ATS مجاناً في 30 ثانية + احصل على خطاب تقديم مخصص بالذكاء الاصطناعي!",
      `🎁 كود خصم 20% على جميع باقات التوزيع المباشر للـ HR: ${PROMO_CODE}`,
      "🛡️ يشمل درع حجب شركتك ومديرك الحالي 100%.",
      "",
      `🔗 ابدأ الآن عبر الرابط:\n${targetUrl}`,
    ].join("\n");
  } else if (matchedCountry) {
    matchedRule = "country_hub";
    matchedKeyword = countryKeyword!;
    targetUrl = buildTrackedUrl(siteUrl, `/${matchedCountry.toLowerCase()}/jobs`, {
      ...utmBase,
      campaign: `comment_city_${matchedCountry.toLowerCase()}`,
    });
    dmText = [
      `أهلاً بك! هذه أحدث الشواغر الموثقة في ${COUNTRY_META[matchedCountry].labelAr} (بريد HR مفحوص DNS MX ✓) 👇⚡`,
      "",
      `🔗 تصفح وظائف ${COUNTRY_META[matchedCountry].labelEn} مباشرة:\n${targetUrl}`,
      "",
      `🤖 افحص سيرتك بالـ ATS مجاناً + خصم 20% بكود ${PROMO_CODE}:\n${wizardVipUrl}`,
    ].join("\n");
  } else {
    matchedRule = "general_jobs";
    matchedKeyword = generalMatch!;
    targetUrl = buildTrackedUrl(siteUrl, "/jobs", {
      ...utmBase,
      campaign: "comment_jobs_board",
    });
    dmText = [
      "أهلاً بك في منصة أسرع (Asra3.com) ⚡ وظائف الخليج الموثقة مباشرة للـ HR بدون وسطاء!",
      "",
      `🔗 جميع الوظائف الموثقة اليوم:\n${targetUrl}`,
      "",
      `🤖 فحص السيرة مجاناً بالـ ATS + كود خصم 20% (${PROMO_CODE}):\n${wizardVipUrl}`,
    ].join("\n");
  }

  return {
    should_reply: true,
    skip_reason: null,
    matched_rule: matchedRule,
    matched_keyword: matchedKeyword,
    matched_country: matchedCountry,
    job_slug: jobSlug,
    target_url: targetUrl,
    dm_text: clampDmText(dmText),
    public_reply_text: pickVariant(commentId, PUBLIC_REPLY_VARIANTS),
    public_reply_fallback_text: pickVariant(
      commentId,
      PUBLIC_REPLY_FALLBACK_VARIANTS
    ),
  };
}
