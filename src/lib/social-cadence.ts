// ==============================================================================
// ASRA3.COM — Social Cadence, Gulf Peak Slot Guardrails & IG Caption Builder
// Pure helpers shared by /api/webhooks/jobs-social, /api/social-media, and tests
// ==============================================================================

import type { CountryCode } from "@/lib/types";

export type GulfPeakSlot = "morning" | "midday" | "evening";

export const GST_OFFSET_MS = 4 * 60 * 60 * 1000; // Gulf Standard Time (UTC+4)
export const DEFAULT_INSTAGRAM_DAILY_CAP = 3;
export const MIN_INSTAGRAM_REEL_SPACING_MS = 3.5 * 60 * 60 * 1000;

export const COUNTRY_IG_HASHTAGS: Record<CountryCode, string[]> = {
  AE: ["#وظائف_دبي", "#وظائف_الإمارات", "#DubaiJobs"],
  SA: ["#وظائف_الرياض", "#وظائف_السعودية", "#SaudiJobs"],
  QA: ["#وظائف_الدوحة", "#وظائف_قطر", "#QatarJobs"],
  KW: ["#وظائف_الكويت", "#توظيف_الكويت", "#KuwaitJobs"],
};

const VALID_SOCIAL_MEDIA_FILENAME_RE =
  /^[a-z0-9][a-z0-9._-]{0,118}\.(jpg|jpeg|png|mp4)$/i;

export function isValidSocialMediaFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  return VALID_SOCIAL_MEDIA_FILENAME_RE.test(filename);
}

export function safeDecodeSocialMediaFilename(rawFilename: string): string | null {
  try {
    const decoded = decodeURIComponent(rawFilename || "").trim();
    return isValidSocialMediaFilename(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function parseByteRange(
  rangeHeader: string,
  totalSize: number
): { start: number; end: number } | null {
  if (!Number.isFinite(totalSize) || totalSize <= 0) {
    return null;
  }
  const match = /^bytes=(\d*)-(\d*)$/i.exec((rangeHeader || "").trim());
  if (!match || (!match[1] && !match[2])) {
    return null;
  }

  let start: number;
  let end: number;

  if (!match[1] && match[2]) {
    // Suffix byte range: bytes=-N (last N bytes)
    const suffixLen = Number(match[2]);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) {
      return null;
    }
    start = Math.max(0, totalSize - suffixLen);
    end = totalSize - 1;
  } else {
    start = Number(match[1]);
    // RFC 9110 §14.1.2: clamp last-pos to totalSize - 1 when end >= totalSize
    const rawEnd = match[2] ? Number(match[2]) : totalSize - 1;
    end = Math.min(rawEnd, totalSize - 1);
  }

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    start >= totalSize ||
    end < start
  ) {
    return null;
  }

  return { start, end };
}

export function getSocialMediaContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

export function getGstClock(now: Date = new Date()): {
  gstDateKey: string;
  gstHour: number;
  gstMinute: number;
} {
  const gstDate = new Date(now.getTime() + GST_OFFSET_MS);
  const year = gstDate.getUTCFullYear();
  const month = String(gstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(gstDate.getUTCDate()).padStart(2, "0");
  return {
    gstDateKey: `${year}-${month}-${day}`,
    gstHour: gstDate.getUTCHours(),
    gstMinute: gstDate.getUTCMinutes(),
  };
}

export function getGstDateKeyFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return getGstClock(new Date(ms)).gstDateKey;
}

/**
 * Classifies Gulf Standard Time (UTC+4) hour into 3 high-engagement peak slots:
 * - morning: 07:00–10:59 GST (morning commute)
 * - midday:  11:00–15:59 GST (lunch peak)
 * - evening: 19:00–22:59 GST (prime Gulf evening)
 *
 * Every 4-hour schedule offset across a 24h cycle intersects all 3 windows
 * cleanly once per day, ensuring 2–3 well-spaced Reels/day during peak hours.
 */
export function getGulfPeakSlot(gstHour: number): GulfPeakSlot | null {
  if (gstHour >= 7 && gstHour <= 10) return "morning";
  if (gstHour >= 11 && gstHour <= 15) return "midday";
  if (gstHour >= 19 && gstHour <= 22) return "evening";
  return null;
}

export interface InstagramBudgetEvaluation {
  daily_cap: number;
  published_today_gst: number;
  remaining_today: number;
  gst_date: string;
  gst_hour: number;
  peak_slot: GulfPeakSlot | null;
  slots_used_today: GulfPeakSlot[];
  last_ig_posted_at: string | null;
  min_spacing_ok: boolean;
  eligible_now: boolean;
  skip_reason: string | null;
}

export function evaluateInstagramEligibility(params: {
  now?: Date;
  dailyCap?: number;
  publishedTodayGst: number;
  slotsUsedToday?: GulfPeakSlot[];
  lastIgPostedAt?: string | null;
  minSpacingMs?: number;
}): InstagramBudgetEvaluation {
  const now = params.now ?? new Date();
  const rawCap = Number(params.dailyCap ?? DEFAULT_INSTAGRAM_DAILY_CAP);
  const dailyCap = Number.isFinite(rawCap)
    ? Math.max(0, Math.min(6, Math.floor(rawCap)))
    : DEFAULT_INSTAGRAM_DAILY_CAP;

  const publishedToday = Math.max(0, Math.floor(params.publishedTodayGst || 0));
  const remainingToday = Math.max(0, dailyCap - publishedToday);
  const { gstDateKey, gstHour } = getGstClock(now);
  const peakSlot = getGulfPeakSlot(gstHour);
  const slotsUsedToday = Array.from(new Set(params.slotsUsedToday || []));

  const minSpacingMs = params.minSpacingMs ?? MIN_INSTAGRAM_REEL_SPACING_MS;
  let minSpacingOk = true;
  if (params.lastIgPostedAt) {
    const lastMs = Date.parse(params.lastIgPostedAt);
    if (Number.isFinite(lastMs)) {
      minSpacingOk = now.getTime() - lastMs >= minSpacingMs;
    }
  }

  let skipReason: string | null = null;
  if (dailyCap <= 0) {
    skipReason = "daily_cap_zero";
  } else if (remainingToday <= 0) {
    skipReason = "daily_cap_reached";
  } else if (!peakSlot) {
    skipReason = "outside_gulf_peak_hours";
  } else if (slotsUsedToday.includes(peakSlot)) {
    skipReason = `peak_slot_${peakSlot}_already_used`;
  } else if (!minSpacingOk) {
    skipReason = "min_spacing_guard";
  }

  return {
    daily_cap: dailyCap,
    published_today_gst: publishedToday,
    remaining_today: remainingToday,
    gst_date: gstDateKey,
    gst_hour: gstHour,
    peak_slot: peakSlot,
    slots_used_today: slotsUsedToday,
    last_ig_posted_at: params.lastIgPostedAt || null,
    min_spacing_ok: minSpacingOk,
    eligible_now: skipReason === null,
    skip_reason: skipReason,
  };
}

function stripSocialUrls(text: string): string {
  return String(text || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatBilingualJobTitle(titleAr: string, titleEn: string): string {
  const cleanAr = stripSocialUrls(String(titleAr || "").replace(/^title\s*:\s*/i, ""));
  const cleanEn = stripSocialUrls(String(titleEn || "").replace(/^title\s*:\s*/i, ""));

  if (!cleanAr) return cleanEn;
  if (!cleanEn) return cleanAr;

  const arLower = cleanAr.toLowerCase();
  const enLower = cleanEn.toLowerCase();
  if (arLower === enLower || arLower.includes(enLower)) {
    return cleanAr;
  }
  if (enLower.includes(arLower)) {
    return cleanEn;
  }
  return `${cleanAr} | ${cleanEn}`;
}

/**
 * Instagram-native Reel caption:
 * - Zero external URLs (Instagram captions do not linkify URLs & URLs reduce reach)
 * - Directs viewers to comment city keyword or tap the Bio Link
 * - Strict 5 hyper-relevant hashtags (no #fyp/#viral spam)
 */
export function buildInstagramReelCaption(params: {
  countryCode: CountryCode;
  countryNameAr: string;
  cityNameAr: string;
  titleAr: string;
  titleEn: string;
  companyName: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  commentKeyword: string;
}): string {
  const formattedTitle = formatBilingualJobTitle(params.titleAr, params.titleEn);
  const safeCity = stripSocialUrls(params.cityNameAr) || "الخليج";
  const safeCountry = stripSocialUrls(params.countryNameAr) || "الخليج";
  const safeCompany = stripSocialUrls(params.companyName) || "شركة موثقة";
  const safeKeyword = stripSocialUrls(params.commentKeyword) || "وظيفة";
  const currency = stripSocialUrls(params.salaryCurrency || "AED") || "AED";

  const minVal = typeof params.salaryMin === "number" && params.salaryMin > 0 ? params.salaryMin : null;
  const maxVal = typeof params.salaryMax === "number" && params.salaryMax > 0 ? params.salaryMax : null;
  let salaryLine = "";
  if (minVal && maxVal && minVal !== maxVal) {
    const lo = Math.min(minVal, maxVal);
    const hi = Math.max(minVal, maxVal);
    salaryLine = `💰 الراتب التقديري: ${lo.toLocaleString("en-US")} – ${hi.toLocaleString("en-US")} ${currency}`;
  } else if (minVal) {
    salaryLine = `💰 الراتب التقديري: ${minVal.toLocaleString("en-US")} ${currency}`;
  } else if (maxVal) {
    salaryLine = `💰 الراتب التقديري: حتى ${maxVal.toLocaleString("en-US")} ${currency}`;
  }

  const countryTags = COUNTRY_IG_HASHTAGS[params.countryCode] || [
    "#وظائف_دبي",
    "#وظائف_الإمارات",
    "#GCCJobs",
  ];
  // 5 hyper-relevant hashtags total (Playbook rule: 4–6 max on Instagram)
  const hashtags = [...countryTags, "#وظائف_الخليج", "#Asra3"].join(" ");

  const titleLine = `📌 ${formattedTitle}`;

  return [
    `⚡ وظيفة موثقة في ${safeCity} (${safeCountry}) — التقديم مباشر للـ HR بدون وسطاء!`,
    titleLine,
    `🏢 ${safeCompany} (بريد HR مفحوص DNS MX ✓)`,
    salaryLine,
    "",
    `💬 اكتب كلمة "${safeKeyword}" في التعليقات الآن أو افتح الرابط في البايو للتقديم المباشر وفحص الـ ATS مجاناً 👇`,
    `👇 Comment "${safeKeyword}" or tap the Bio Link to apply directly & run a free ATS CV check!`,
    "",
    hashtags,
  ]
    .filter((line, idx, arr) => {
      if (line !== "") return true;
      return idx > 0 && arr[idx - 1] !== "";
    })
    .join("\n")
    .trim();
}
