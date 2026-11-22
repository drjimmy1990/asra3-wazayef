// ==============================================================================
// ASRA3.COM — Hosted Social Media Asset Route (Carousels JPG & Hero Reels MP4)
// Serves files from persistent .data/social-media/ with HEAD + streaming Range 206
// Required for Meta Instagram & Facebook Graph API HTTPS media ingestion
// ==============================================================================

import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import {
  getSocialMediaContentType,
  parseByteRange,
  safeDecodeSocialMediaFilename,
} from "@/lib/social-cadence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSocialMediaDir(): string {
  return path.resolve(process.cwd(), ".data", "social-media");
}

function resolveSafeAsset(
  rawFilename: string
): { fullPath: string; filename: string; size: number } | null {
  const filename = safeDecodeSocialMediaFilename(rawFilename);
  if (!filename) {
    return null;
  }

  const baseDir = getSocialMediaDir();
  const fullPath = path.resolve(baseDir, filename);
  if (!fullPath.startsWith(`${baseDir}${path.sep}`)) {
    return null;
  }

  try {
    const st = fs.statSync(fullPath);
    if (!st.isFile() || st.size === 0) {
      return null;
    }
    return { fullPath, filename: path.basename(fullPath), size: st.size };
  } catch {
    return null;
  }
}

function createWebFileStream(
  filePath: string,
  options?: { start: number; end: number }
): ReadableStream<Uint8Array> {
  const nodeStream = options
    ? fs.createReadStream(filePath, { start: options.start, end: options.end })
    : fs.createReadStream(filePath);
  return Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
}

function serveSocialMediaFile(
  req: NextRequest,
  asset: { fullPath: string; filename: string; size: number },
  headOnly: boolean
): Response {
  const { fullPath, filename, size: totalSize } = asset;
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
    const parsed = parseByteRange(rangeHeader, totalSize);
    if (!parsed) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${totalSize}`,
        },
      });
    }

    const { start, end } = parsed;
    const chunkLength = end - start + 1;
    return new Response(createWebFileStream(fullPath, { start, end }), {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Content-Length": String(chunkLength),
      },
    });
  }

  return new Response(createWebFileStream(fullPath), {
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
  const resolved = resolveSafeAsset(filename);
  if (!resolved) {
    return new NextResponse(null, { status: 404 });
  }
  return serveSocialMediaFile(req, resolved, true);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const resolved = resolveSafeAsset(filename);
  if (!resolved) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
  return serveSocialMediaFile(req, resolved, false);
}
