// ==============================================================================
// ASRA3.COM — Hosted Social Media Asset Route (Carousels JPG & Hero Reels MP4)
// Serves files from persistent .data/social-media/ with HEAD + Range 206 support
// Required for Meta Instagram & Facebook Graph API HTTPS media ingestion
// ==============================================================================

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  getSocialMediaContentType,
  isValidSocialMediaFilename,
} from "@/lib/social-cadence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSocialMediaDir(): string {
  return path.resolve(process.cwd(), ".data", "social-media");
}

function resolveSafeAssetPath(rawFilename: string): string | null {
  const filename = decodeURIComponent(rawFilename || "").trim();
  if (!isValidSocialMediaFilename(filename)) {
    return null;
  }

  const baseDir = getSocialMediaDir();
  const fullPath = path.resolve(baseDir, filename);
  if (!fullPath.startsWith(`${baseDir}${path.sep}`)) {
    return null;
  }
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const st = fs.statSync(fullPath);
  if (!st.isFile() || st.size === 0) {
    return null;
  }
  return fullPath;
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

function serveSocialMediaFile(
  req: NextRequest,
  filePath: string,
  filename: string,
  headOnly: boolean
): Response {
  const totalSize = fs.statSync(filePath).size;
  const contentType = getSocialMediaContentType(filename);
  const baseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
    "Content-Disposition": `inline; filename="${filename}"`,
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
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const resolved = resolveSafeAssetPath(filename);
  if (!resolved) {
    return new NextResponse(null, { status: 404 });
  }
  return serveSocialMediaFile(req, resolved, path.basename(resolved), true);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const resolved = resolveSafeAssetPath(filename);
  if (!resolved) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
  return serveSocialMediaFile(req, resolved, path.basename(resolved), false);
}
