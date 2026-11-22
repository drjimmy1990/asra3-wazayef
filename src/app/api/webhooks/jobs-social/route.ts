import { NextRequest, NextResponse } from "next/server";
import { isWebhookAuthorized } from "@/lib/admin-auth";
import {
  getInstagramDailyStats,
  getUnpostedSocialJobs,
  markJobPostedToSocial,
} from "@/lib/jobs-store";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import { getActiveOgJobTemplate } from "@/lib/og-settings";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";
import {
  buildInstagramReelCaption,
  DEFAULT_INSTAGRAM_DAILY_CAP,
  evaluateInstagramEligibility,
  formatBilingualJobTitle,
} from "@/lib/social-cadence";

const COUNTRY_HASHTAGS: Record<string, string> = {
  AE: "#وظائف_الإمارات #وظائف_دبي #UAEJobs #DubaiJobs #AbuDhabiJobs",
  SA: "#وظائف_السعودية #وظائف_الرياض #SaudiJobs #RiyadhJobs #رؤية_2030",
  QA: "#وظائف_قطر #وظائف_الدوحة #QatarJobs #DohaJobs",
  KW: "#وظائف_الكويت #KuwaitJobs #توظيف_الكويت",
};

// Telegram parse_mode=HTML rejects the whole message on unescaped & < >
function tgEscape(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Social Syndication Queue for n8n (Facebook Page + Telegram Channel Autopilot):
 * - GET: Returns top unposted MX-verified jobs with pre-formatted bilingual
 *   Facebook Photo Caption (NO external URL in main caption for 3x organic reach!),
 *   1st-comment direct apply URL, OG card image URL, and Telegram HTML message.
 * - POST: Marks job(s) as posted (`fb_post_id`, `tg_message_id`) idempotently.
 */
export async function GET(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    10,
    Math.max(1, Number(searchParams.get("limit") || "2") || 2)
  );

  const siteUrl = getCanonicalSiteUrl();
  const activeOgTemplate = getActiveOgJobTemplate();
  const [queue, igDailyStats] = await Promise.all([
    getUnpostedSocialJobs(limit),
    getInstagramDailyStats(),
  ]);

  const rawCapEnv = process.env.INSTAGRAM_DAILY_REEL_CAP;
  const parsedCap =
    rawCapEnv !== undefined && rawCapEnv.trim() !== ""
      ? Number(rawCapEnv)
      : DEFAULT_INSTAGRAM_DAILY_CAP;
  const igDailyCap = Number.isFinite(parsedCap)
    ? Math.max(0, Math.min(6, Math.floor(parsedCap)))
    : DEFAULT_INSTAGRAM_DAILY_CAP;
  const instagramBudget = evaluateInstagramEligibility({
    dailyCap: igDailyCap,
    publishedTodayGst: igDailyStats.publishedTodayGst,
    slotsUsedToday: igDailyStats.slotsUsedToday,
    lastIgPostedAt: igDailyStats.lastIgPostedAt,
  });

  const items = queue.map((job) => {
    const country =
      INITIAL_COUNTRIES.find((c) => c.code === job.country_code) ||
      INITIAL_COUNTRIES[0];
    const industry =
      INITIAL_INDUSTRIES.find((i) => i.id === job.industry_id) ||
      INITIAL_INDUSTRIES[0];

    const jobUrl = `${siteUrl}/jobs/${job.slug}`;
    const fbCommentApplyUrl = `${jobUrl}?utm_source=facebook&utm_medium=social_comment&utm_campaign=jobs_autopilot`;
    const tgApplyUrl = `${jobUrl}?utm_source=telegram&utm_medium=channel&utm_campaign=jobs_autopilot`;
    const ogImageUrl = `${siteUrl}/api/og/job/${job.slug}?t=${activeOgTemplate}`;
    const reelVideoUrl = `${siteUrl}/api/reel/job/${encodeURIComponent(job.slug)}`;
    const reelPrepareUrl = `${reelVideoUrl}?prepare=1`;
    const socialMode = process.env.FACEBOOK_SOCIAL_MODE || "reels";
    const commentKeyword = job.city_name_ar || "وظيفة";

    const salaryLineAr =
      job.salary_min && job.salary_max
        ? `💰 الراتب التقديري: ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}\n`
        : "";
    const salaryLineEn =
      job.salary_min && job.salary_max
        ? `💰 Est. Package: ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}\n`
        : "";

    const hashtags = `${COUNTRY_HASHTAGS[job.country_code] || ""} #توظف_أسرع #Asra3 #وظائف_الخليج`;
    const cleanBilingualTitle = formatBilingualJobTitle(job.title_ar, job.title_en);

    // Main Facebook caption intentionally omits external links to avoid Meta feed throttling
    const facebookPhotoCaption = [
      `⚡ شاغر وظيفي موثق في ${country.name_ar} (${job.city_name_ar})`,
      `📌 المسمى: ${cleanBilingualTitle}`,
      `🏢 جهة العمل: ${job.company_name} (بريد HR موثق DNS MX ✓)`,
      `📂 القطاع: ${industry.name_ar}`,
      salaryLineAr.trim(),
      ``,
      `${job.summary_ar}`,
      ``,
      `🔹 ${job.title_en} — ${job.city_name_en}, ${country.name_en}`,
      salaryLineEn.trim(),
      `Skills: ${job.skills.slice(0, 5).join(" • ")}`,
      ``,
      `👇 رابط التقديم المباشر وفحص توافق سيرتك الذاتية مجاناً بنظام ATS موجود في أول تعليق!`,
      `👇 Direct HR Apply Link & Free AI ATS CV Match Check in the first comment below!`,
      ``,
      hashtags,
    ]
      .filter((line) => line !== "")
      .join("\n");

    const facebookReelCaption = [
      `⚡ فرصة موثقة في ${job.city_name_ar} (${country.name_ar}) — التقديم مباشر للـ HR بدون وسطاء!`,
      `📌 ${cleanBilingualTitle}`,
      `🏢 ${job.company_name} (بريد HR مفحوص DNS MX ✓)`,
      salaryLineAr.trim(),
      ``,
      `💬 اكتب كلمة "${commentKeyword}" في التعليقات الآن أو افتح رابط التقديم المباشر في أول تعليق 👇`,
      `👇 Direct HR apply link & free ATS CV check in the first comment!`,
      ``,
      `#Reels #ريلز #وظائف ${hashtags}`,
    ]
      .filter((line) => line !== "")
      .join("\n");

    const facebookFirstComment = `✅ قدّم مباشرة الآن أو افحص توافق سيرتك الذاتية مع هذه الوظيفة عبر منصة أسرع:\nApply directly & check your ATS match score here:\n${fbCommentApplyUrl}`;

    const instagramReelCaption = buildInstagramReelCaption({
      countryCode: job.country_code,
      countryNameAr: country.name_ar,
      cityNameAr: job.city_name_ar,
      titleAr: job.title_ar,
      titleEn: job.title_en,
      companyName: job.company_name,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: job.salary_currency,
      commentKeyword,
    });

    const telegramMessage = [
      `⚡ <b>${tgEscape(job.title_ar)}</b>`,
      `<b>${tgEscape(job.title_en)}</b>`,
      ``,
      `🏢 <b>${tgEscape(job.company_name)}</b> (MX-Verified HR ✓)`,
      `📍 ${tgEscape(job.city_name_ar)}، ${tgEscape(country.name_ar)} (${tgEscape(job.city_name_en)})`,
      job.salary_min && job.salary_max
        ? `💰 ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
        : null,
      ``,
      `🔗 <a href="${tgApplyUrl}">التقديم المباشر وفحص الـ ATS عبر Asra3.com ←</a>`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      id: job.id,
      slug: job.slug,
      title_ar: job.title_ar,
      title_en: job.title_en,
      company_name: job.company_name,
      country_code: job.country_code,
      city_name_en: job.city_name_en,
      og_image_url: ogImageUrl,
      reel_video_url: reelVideoUrl,
      reel_prepare_url: reelPrepareUrl,
      comment_keyword: commentKeyword,
      social_mode: socialMode,
      canonical_url: jobUrl,
      facebook_photo_caption: facebookPhotoCaption,
      facebook_reel_caption: facebookReelCaption,
      facebook_first_comment: facebookFirstComment,
      instagram_reel_caption: instagramReelCaption,
      instagram_budget: instagramBudget,
      telegram_html: telegramMessage,
    };
  });

  return NextResponse.json({
    ok: true,
    count: items.length,
    instagram_budget: instagramBudget,
    items,
  });
}

export async function POST(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const idOrSlug = String(body.id || body.slug || "").trim();
    if (!idOrSlug) {
      return NextResponse.json(
        { error: "Missing job id or slug" },
        { status: 400 }
      );
    }

    const fbPostId = typeof body.fb_post_id === "string" || typeof body.fb_post_id === "number"
      ? String(body.fb_post_id).trim() || undefined
      : undefined;
    const igPostId = typeof body.ig_post_id === "string" || typeof body.ig_post_id === "number"
      ? String(body.ig_post_id).trim() || undefined
      : undefined;
    const tgMessageId = typeof body.tg_message_id === "string" || typeof body.tg_message_id === "number"
      ? String(body.tg_message_id).trim() || undefined
      : undefined;

    const updated = await markJobPostedToSocial(idOrSlug, {
      fb_post_id: fbPostId,
      ig_post_id: igPostId,
      tg_message_id: tgMessageId,
    });

    return NextResponse.json({ ok: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to record social post metadata" },
      { status: 400 }
    );
  }
}
