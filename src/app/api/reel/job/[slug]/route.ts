// ==============================================================================
// ASRA3.COM — Motion-Graphics Job Reel API Route (9:16 1080x1920 MP4)
// Supports Meta rupload file_url fetching (HEAD + Range 206 + GET 200)
// ==============================================================================

import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { isWebhookAuthorized } from "@/lib/admin-auth";
import {
  getCachedJobReelPath,
  renderOrGetJobReel,
} from "@/lib/job-reel-renderer";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeFilenameSlug(slug: string): string {
  return (
    slug
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "job"
  );
}

function readFileRange(filePath: string, start: number, end: number): Buffer {
  const length = end - start + 1;
  const buf = Buffer.allocUnsafe(length);
  const fd = fs.openSync(filePath, "r");
  try {
    let offset = 0;
    while (offset < length) {
      const bytesRead = fs.readSync(
        fd,
        buf,
        offset,
        length - offset,
        start + offset
      );
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    return offset === length ? buf : buf.subarray(0, offset);
  } finally {
    fs.closeSync(fd);
  }
}

function serveMp4File(
  req: NextRequest,
  filePath: string,
  slug: string,
  headOnly: boolean
): Response {
  const totalSize = fs.statSync(filePath).size;
  const safeName = sanitizeFilenameSlug(slug);
  const baseHeaders: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
    "Content-Disposition": `inline; filename="asra3-${safeName}.mp4"`,
  };

  if (headOnly) {
    return new Response(null, {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Length": String(totalSize),
      },
    });
  }

  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (!match || (!match[1] && !match[2])) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${totalSize}`,
        },
      });
    }

    let start = match[1] ? Number(match[1]) : 0;
    let end = match[2] ? Number(match[2]) : totalSize - 1;
    if (!match[1] && match[2]) {
      const suffixLen = Number(match[2]);
      start = Math.max(0, totalSize - suffixLen);
      end = totalSize - 1;
    }

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end >= totalSize ||
      start > end
    ) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${totalSize}`,
        },
      });
    }

    const chunk = readFileRange(filePath, start, end);
    return new Response(new Uint8Array(chunk), {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Content-Length": String(chunk.byteLength),
      },
    });
  }

  const fullBuffer = fs.readFileSync(filePath);
  return new Response(new Uint8Array(fullBuffer), {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(totalSize),
    },
  });
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cached = getCachedJobReelPath(slug);
  if (cached) {
    return serveMp4File(req, cached, slug, true);
  }

  try {
    const rendered = await renderOrGetJobReel(slug);
    if (!rendered) {
      return new NextResponse(null, { status: 404 });
    }
    return serveMp4File(req, rendered.filePath, slug, true);
  } catch (err) {
    console.error(`[reel] HEAD failed for ${slug}:`, err);
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = req.nextUrl.searchParams;
  const prepare = searchParams.get("prepare") === "1";
  const force = searchParams.get("force") === "1";

  if ((prepare || force) && !isWebhookAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await renderOrGetJobReel(slug, { force });
    if (!result) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (prepare) {
      const siteUrl = getCanonicalSiteUrl();
      return NextResponse.json({
        ok: true,
        slug: result.slug,
        reel_url: `${siteUrl}/api/reel/job/${encodeURIComponent(result.slug)}`,
        file_size: result.sizeBytes,
        cached: result.cached,
        render_ms: result.renderMs,
      });
    }

    return serveMp4File(req, result.filePath, result.slug, false);
  } catch (err) {
    console.error(`[reel] GET failed for ${slug}:`, err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed rendering job reel",
      },
      { status: 500 }
    );
  }
}
