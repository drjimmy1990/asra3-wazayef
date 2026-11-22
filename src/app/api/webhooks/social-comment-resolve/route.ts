import { NextRequest, NextResponse } from "next/server";
import { isWebhookAuthorized } from "@/lib/admin-auth";
import { findJobBySocialPostId } from "@/lib/jobs-store";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import {
  resolveSocialCommentReply,
  type MatchedJobSummary,
  type SocialPlatform,
} from "@/lib/social-comment-dm";

/**
 * Authenticated Comment-to-DM Resolver Endpoint for n8n:
 * Given an Instagram or Facebook comment event (media_id, comment_id, text, sender),
 * looks up any matching Job Reel in Supabase/local store and returns tailored
 * DM + public reply copy with tracked UTM URLs.
 */
export async function POST(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawPlatform = String(body.platform || "instagram").trim().toLowerCase();
    const platform: SocialPlatform =
      rawPlatform === "facebook" ? "facebook" : "instagram";

    const commentId = String(body.comment_id || "").trim();
    const mediaId = body.media_id ? String(body.media_id).trim() : null;
    const text = String(body.text || "");
    const fromId = body.from_id ? String(body.from_id).trim() : null;
    const username = body.username ? String(body.username).trim() : null;
    const ownAccountId = body.own_account_id
      ? String(body.own_account_id).trim()
      : null;
    const ownUsername = body.own_username
      ? String(body.own_username).trim()
      : null;

    let matchedJob: MatchedJobSummary | null = null;
    if (mediaId) {
      const found = await findJobBySocialPostId(
        platform === "instagram" ? { igPostId: mediaId } : { fbPostId: mediaId }
      );
      if (found) {
        matchedJob = {
          id: found.id,
          slug: found.slug,
          title_ar: found.title_ar,
          title_en: found.title_en,
          company_name: found.company_name,
          country_code: found.country_code,
          city_name_ar: found.city_name_ar,
          city_name_en: found.city_name_en,
          salary_min: found.salary_min,
          salary_max: found.salary_max,
          salary_currency: found.salary_currency,
        };
      }
    }

    const result = resolveSocialCommentReply({
      platform,
      commentId,
      mediaId,
      text,
      fromId,
      username,
      ownAccountId,
      ownUsername,
      siteUrl: getCanonicalSiteUrl(),
      matchedJob,
    });

    return NextResponse.json({
      ok: true,
      platform,
      comment_id: commentId,
      media_id: mediaId,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid comment resolve payload" },
      { status: 400 }
    );
  }
}
