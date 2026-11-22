// ==============================================================================
// ASRA3.COM — Pure Harvester Parsing, Freshness Sorting & Dedupe Helpers
// Side-effect free (import type only) so Node `--test` can verify directly.
// ==============================================================================

import type { CountryCode } from "@/lib/types";

export interface TelegramRawCandidate {
  email: string;
  domain: string;
  postText: string;
  defaultCountry: CountryCode;
  channel: string;
  postedAtMs: number;
}

export function decodeTelegramHtml(input: string): string {
  return String(input || "")
    .replace(/&amp;/gi, "&")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractPlainMessageText(rawHtmlSegment: string): string {
  const withoutHeaderAttrs = rawHtmlSegment
    .split(/tgme_widget_message_footer/i)[0]
    .slice(0, 2600)
    .replace(/^[^<]*>/, "");

  return decodeTelegramHtml(
    withoutHeaderAttrs
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|li)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

/**
 * Extracts message timestamp (`datetime="..."`), decoded body text, and
 * non-image emails from public Telegram `https://t.me/s/<channel>` HTML.
 */
export function extractTelegramMessageCandidates(
  html: string,
  channel: string,
  defaultCountry: CountryCode
): { postsScanned: number; candidates: TelegramRawCandidate[] } {
  const sourceHtml = String(html || "");
  if (!sourceHtml) {
    return { postsScanned: 0, candidates: [] };
  }

  const cleanChannel = channel.replace(/^@/, "").trim();
  const candidates: TelegramRawCandidate[] = [];
  let postsScanned = 0;

  const wrapBlocks = sourceHtml.split("tgme_widget_message_wrap");
  if (wrapBlocks.length > 1) {
    for (let i = 1; i < wrapBlocks.length; i++) {
      const wrap = wrapBlocks[i];
      const textParts = wrap.split("tgme_widget_message_text");
      if (textParts.length < 2) continue;

      postsScanned++;
      const dtMatch = wrap.match(/datetime="([^"]+)"/i);
      const parsedMs = dtMatch?.[1] ? Date.parse(dtMatch[1]) : NaN;
      const postedAtMs = Number.isFinite(parsedMs) ? parsedMs : 0;

      const plainText = extractPlainMessageText(textParts[1]);
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

        candidates.push({
          email,
          domain,
          postText: plainText,
          defaultCountry,
          channel: cleanChannel,
          postedAtMs,
        });
      }
    }
    return { postsScanned, candidates };
  }

  // Fallback for markup containing only `tgme_widget_message_text`
  const msgBlocks = sourceHtml.split("tgme_widget_message_text");
  postsScanned = Math.max(0, msgBlocks.length - 1);

  for (let b = 1; b < msgBlocks.length; b++) {
    const plainText = extractPlainMessageText(msgBlocks[b]);
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

      candidates.push({
        email,
        domain,
        postText: plainText,
        defaultCountry,
        channel: cleanChannel,
        postedAtMs: 0,
      });
    }
  }

  return { postsScanned, candidates };
}

/**
 * Sorts harvested candidates newest-first so active channels posting today
 * always run ahead of stale archives, while preserving channel order on ties.
 */
export function prioritizeHarvestCandidates<T extends { postedAtMs: number }>(
  candidates: T[]
): T[] {
  return candidates
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const diff = (b.item.postedAtMs || 0) - (a.item.postedAtMs || 0);
      return diff !== 0 ? diff : a.idx - b.idx;
    })
    .map((entry) => entry.item);
}

/**
 * Filters a verified batch against already-known hashes so duplicates are
 * skipped BEFORE consuming `remainingSlots`.
 */
export function collectUniqueNewJobs<T extends { dedupeHash: string }>(
  batch: T[],
  existingHashes: Set<string>,
  seenBatchHashes: Set<string>,
  remainingSlots: number
): { accepted: T[]; skippedDuplicates: number } {
  const accepted: T[] = [];
  let skippedDuplicates = 0;
  let slots = Math.max(0, remainingSlots);

  for (const item of batch) {
    if (existingHashes.has(item.dedupeHash) || seenBatchHashes.has(item.dedupeHash)) {
      skippedDuplicates++;
      continue;
    }
    if (slots <= 0) {
      break;
    }
    seenBatchHashes.add(item.dedupeHash);
    accepted.push(item);
    slots--;
  }

  return { accepted, skippedDuplicates };
}
