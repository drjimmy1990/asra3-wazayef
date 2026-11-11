import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, verifyCvAccessKey } from "@/lib/admin-auth";
import { resolveLocalCvPath } from "@/lib/cv-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "";
  const sig = searchParams.get("sig") || "";

  if (!key) {
    return NextResponse.json({ error: "Missing CV file key" }, { status: 400 });
  }

  const authorized = isAdminAuthorized(req) || verifyCvAccessKey(key, sig);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized CV access" }, { status: 401 });
  }

  const filePath = resolveLocalCvPath(key);
  if (!filePath) {
    return NextResponse.json({ error: "CV file not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : ext === ".doc"
      ? "application/msword"
      : "application/octet-stream";

  const downloadName = path.basename(filePath).replace(/^[a-f0-9-]+-/, "");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${downloadName}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
