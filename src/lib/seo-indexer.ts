// ==============================================================================
// ASRA3.COM — Real-Time Search Engine Indexing Dispatcher
// Notifies IndexNow (Bing, Yandex, Seznam, ChatGPT Search) & Google Indexing API
// (when GOOGLE_INDEXING_ACCESS_TOKEN or service credentials are configured)
// ==============================================================================

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com")
).replace(/\/+$/, "");

export const INDEXNOW_KEY = "asra3-indexnow-2026";

export function getCanonicalSiteUrl(): string {
  return SITE_URL;
}

export async function notifySearchEnginesForUrls(
  urls: string[],
  action: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{
  indexNowOk: boolean;
  googleIndexingNotified: number;
  urlsSubmitted: number;
}> {
  const uniqueUrls = Array.from(
    new Set(
      urls
        .map((u) => u.trim())
        .filter(Boolean)
        .map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`))
    )
  );

  if (uniqueUrls.length === 0) {
    return { indexNowOk: false, googleIndexingNotified: 0, urlsSubmitted: 0 };
  }

  let indexNowOk = false;
  let googleIndexingNotified = 0;

  try {
    const host = new URL(SITE_URL).host;
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: uniqueUrls.slice(0, 500),
      }),
      signal: AbortSignal.timeout(8000),
    });
    indexNowOk = res.ok;
  } catch {
    indexNowOk = false;
  }

  // Optional Google Indexing API v3 (specifically allowed by Google for JobPosting pages)
  const googleBearer = (process.env.GOOGLE_INDEXING_ACCESS_TOKEN || "").trim();
  if (googleBearer && !googleBearer.startsWith("your-")) {
    for (const targetUrl of uniqueUrls.slice(0, 25)) {
      try {
        const gRes = await fetch(
          "https://indexing.googleapis.com/v3/urlNotifications:publish",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${googleBearer}`,
            },
            body: JSON.stringify({
              url: targetUrl,
              type: action,
            }),
            signal: AbortSignal.timeout(5000),
          }
        );
        if (gRes.ok) {
          googleIndexingNotified++;
        }
      } catch {
        // Non-blocking
      }
    }
  }

  return {
    indexNowOk,
    googleIndexingNotified,
    urlsSubmitted: uniqueUrls.length,
  };
}
