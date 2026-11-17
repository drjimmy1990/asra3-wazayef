import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

const INDEXNOW_KEY = "asra3-indexnow-2026";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cleanBase = SITE_URL.replace(/\/+$/, "");
  const host = new URL(cleanBase).host;
  const urlList = [
    `${cleanBase}/`,
    `${cleanBase}/en`,
    `${cleanBase}/ae`,
    `${cleanBase}/sa`,
    `${cleanBase}/qa`,
    `${cleanBase}/kw`,
    `${cleanBase}/about`,
    `${cleanBase}/track`,
    `${cleanBase}/privacy`,
    `${cleanBase}/terms`,
  ];

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${cleanBase}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(10000),
    });

    return NextResponse.json({
      ok: res.ok,
      indexNowStatus: res.status,
      urlsSubmitted: urlList.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "IndexNow ping failed",
        urlsSubmitted: 0,
      },
      { status: 502 }
    );
  }
}
