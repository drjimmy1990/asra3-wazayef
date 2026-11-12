import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthorized,
  verifyAdminPasscode,
} from "@/lib/admin-auth";

function isHttpsRequest(req: NextRequest): boolean {
  const forwardedProto = (req.headers.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (forwardedProto) {
    return forwardedProto === "https";
  }
  return req.nextUrl.protocol === "https:";
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    authenticated: isAdminAuthorized(req),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passcode = String(body.passcode || "").trim();

    if (!verifyAdminPasscode(passcode)) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid administrator passcode." },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSessionToken();
    const res = NextResponse.json({ authenticated: true });

    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isHttpsRequest(req),
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    return res;
  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(req),
    path: "/",
    maxAge: 0,
  });
  return res;
}
