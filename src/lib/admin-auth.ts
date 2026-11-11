// ==============================================================================
// ASRA3.COM — Server-Side Admin Session & Webhook Authentication Guard
// ==============================================================================

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "asra3_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getAllowedAdminPasscodes(): string[] {
  const configured = [
    process.env.ADMIN_PASSCODE,
    process.env.ADMIN_SECRET_PASSCODE,
    process.env.NEXT_PUBLIC_ADMIN_PIN,
  ]
    .map((v) => (v || "").trim())
    .filter((v) => v.length > 0 && !v.startsWith("your-"));

  if (configured.length > 0) {
    return configured;
  }

  // Safe local/staging defaults when env variable is not yet defined
  if (process.env.NODE_ENV !== "production") {
    return ["asra3@2026", "wazayef2026"];
  }
  return ["asra3@2026"];
}

function getSigningSecret(): string {
  const base =
    process.env.ADMIN_PASSCODE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.EASYKASH_HMAC_SECRET ||
    "asra3-default-signing-key-2026";
  return crypto.createHash("sha256").update(`asra3-admin:${base}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPasscode(input: string): boolean {
  const candidate = (input || "").trim();
  if (!candidate) return false;
  return getAllowedAdminPasscodes().some((valid) => safeEqual(candidate, valid));
}

export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expiresAt}`;
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");

  return safeEqual(parts[2], expectedSig);
}

/**
 * Verifies incoming request is authorized via either:
 * 1) HttpOnly signed `asra3_admin_session` cookie (Admin Dashboard UI), OR
 * 2) `x-admin-secret` / `x-webhook-secret` / `Bearer` header (CLI scripts & n8n).
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(cookieToken)) {
    return true;
  }

  const headerSecret = (
    req.headers.get("x-admin-secret") ||
    req.headers.get("x-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  ).trim();

  if (headerSecret) {
    if (verifyAdminPasscode(headerSecret)) return true;

    const webhookSecret = (process.env.N8N_WEBHOOK_SECRET || "").trim();
    if (
      webhookSecret &&
      !webhookSecret.startsWith("your-") &&
      safeEqual(headerSecret, webhookSecret)
    ) {
      return true;
    }
  }

  return false;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(
    { error: "Unauthorized: Valid administrator session required." },
    { status: 401 }
  );
}

/**
 * Verifies n8n / webhook secret when N8N_WEBHOOK_SECRET is configured.
 */
export function isWebhookAuthorized(req: NextRequest): boolean {
  if (isAdminAuthorized(req)) return true;

  const webhookSecret = (process.env.N8N_WEBHOOK_SECRET || "").trim();
  if (!webhookSecret || webhookSecret.startsWith("your-")) {
    // Allow in local dev when N8N_WEBHOOK_SECRET is not set yet, require in prod if set
    return process.env.NODE_ENV !== "production";
  }

  const provided = (
    req.headers.get("x-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  ).trim();

  return Boolean(provided) && safeEqual(provided, webhookSecret);
}

export function signCvAccessKey(fileKey: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(`cv:${fileKey}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyCvAccessKey(fileKey: string, sig: string): boolean {
  if (!fileKey || !sig) return false;
  const expected = signCvAccessKey(fileKey);
  return safeEqual(sig, expected);
}
