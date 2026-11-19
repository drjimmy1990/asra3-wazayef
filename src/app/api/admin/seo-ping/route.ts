import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { searchAndRankJobs } from "@/lib/jobs-store";
import {
  getCanonicalSiteUrl,
  notifySearchEnginesForUrls,
} from "@/lib/seo-indexer";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cleanBase = getCanonicalSiteUrl();
  const { jobs } = await searchAndRankJobs({ sort: "newest", limit: 35 });

  const urlList = [
    `${cleanBase}/`,
    `${cleanBase}/en`,
    `${cleanBase}/jobs`,
    `${cleanBase}/employers`,
    `${cleanBase}/ae`,
    `${cleanBase}/sa`,
    `${cleanBase}/qa`,
    `${cleanBase}/kw`,
    `${cleanBase}/ae/jobs`,
    `${cleanBase}/sa/jobs`,
    `${cleanBase}/qa/jobs`,
    `${cleanBase}/kw/jobs`,
    `${cleanBase}/about`,
    ...jobs.map((j) => `${cleanBase}/jobs/${j.slug}`),
  ];

  const pingResult = await notifySearchEnginesForUrls(urlList, "URL_UPDATED");

  return NextResponse.json({
    ok: pingResult.indexNowOk || pingResult.googleIndexingNotified > 0,
    ...pingResult,
  });
}
