// ==============================================================================
// WAZAYEF GCC — EasyKash DirectPayV1 API & HMAC-SHA512 Verification Engine
// ==============================================================================

import crypto from "crypto";
import {
  CurrencyCode,
  EasyKashCallbackPayload,
  EasyKashDirectPayRequest,
} from "@/lib/types";

const EASYKASH_API_URL =
  process.env.EASYKASH_API_URL ||
  "https://back.easykash.net/api/directpayv1/pay";

const EASYKASH_INQUIRE_URL =
  process.env.EASYKASH_INQUIRE_URL ||
  "https://back.easykash.net/api/cash-api/inquire";

export interface InitiateEasyKashResult {
  redirectUrl: string;
  isLiveGateway: boolean;
  customerReference: string;
}

export interface InquireEasyKashResult {
  ok: boolean;
  isPaid: boolean;
  statusUpper: string;
  paidAmount?: number;
  easykashRef?: string;
  paymentMethod?: string;
  voucher?: string;
  reason?: string;
}

export function isEasyKashLiveConfigured(): boolean {
  const apiKey = (process.env.EASYKASH_API_KEY || "").trim();
  return (
    Boolean(apiKey) &&
    !apiKey.startsWith("your-") &&
    !apiKey.startsWith("your_")
  );
}

export function isEasyKashHmacConfigured(): boolean {
  const hmacSecret = (process.env.EASYKASH_HMAC_SECRET || "").trim();
  return (
    Boolean(hmacSecret) &&
    !hmacSecret.startsWith("your-") &&
    !hmacSecret.startsWith("your_")
  );
}

/**
 * Initiates a hosted payment session via EasyKash DirectPayV1 API.
 * If EASYKASH_API_KEY is not configured yet, returns an interactive
 * EasyKash Checkout Simulator URL so the full end-to-end flow can be tested.
 */
export async function initiateEasyKashPayment(params: {
  amount: number;
  currency: CurrencyCode;
  name: string;
  email: string;
  mobile: string;
  customerReference: string;
  trackingToken: string;
  appBaseUrl: string;
}): Promise<InitiateEasyKashResult> {
  const apiKey = (process.env.EASYKASH_API_KEY || "").trim();
  const cashExpiry = Number(process.env.EASYKASH_CASH_EXPIRY_DAYS || 3);
  const cleanBaseUrl = (params.appBaseUrl || "https://asra3.com").replace(
    /\/+$/,
    ""
  );
  // Keep redirectUrl free of query params so EasyKash appends ?status=...&customerReference=... cleanly
  const redirectUrl = `${cleanBaseUrl}/track/${params.trackingToken}`;

  // Normalize phone number for EasyKash (expects digits/standard format)
  const cleanMobile =
    params.mobile.replace(/[^\d+]/g, "") || "01000000000";

  if (isEasyKashLiveConfigured() && apiKey) {
    const payload: EasyKashDirectPayRequest = {
      amount: Number(params.amount.toFixed(2)),
      currency: params.currency,
      paymentOptions: [2, 3, 4, 5, 6],
      cashExpiry,
      name: params.name,
      email: params.email,
      mobile: cleanMobile,
      redirectUrl,
      customerReference: params.customerReference,
    };

    const response = await fetch(EASYKASH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `EasyKash API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = (await response.json()) as { redirectUrl?: string };
    if (!data.redirectUrl) {
      throw new Error("EasyKash did not return a redirectUrl");
    }

    return {
      redirectUrl: data.redirectUrl,
      isLiveGateway: true,
      customerReference: params.customerReference,
    };
  }

  // Fallback Interactive EasyKash Checkout Simulator for local testing / staging
  const simParams = new URLSearchParams({
    ref: params.customerReference,
    token: params.trackingToken,
    amount: String(params.amount),
    currency: params.currency,
    name: params.name,
    email: params.email,
  });

  return {
    redirectUrl: `/checkout/easykash-simulator?${simParams.toString()}`,
    isLiveGateway: false,
    customerReference: params.customerReference,
  };
}

/**
 * Queries EasyKash directly for authoritative transaction status when a user
 * returns from hosted checkout before an asynchronous webhook arrives.
 */
export async function inquireEasyKashPayment(
  customerReference: string
): Promise<InquireEasyKashResult> {
  const apiKey = (process.env.EASYKASH_API_KEY || "").trim();
  if (!isEasyKashLiveConfigured() || !apiKey) {
    return {
      ok: false,
      isPaid: false,
      statusUpper: "NOT_CONFIGURED",
      reason: "EASYKASH_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch(EASYKASH_INQUIRE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: apiKey,
      },
      body: JSON.stringify({ customerReference }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        ok: false,
        isPaid: false,
        statusUpper: "HTTP_ERROR",
        reason: `EasyKash inquire returned ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      status?: string;
      Amount?: string | number;
      easykashRef?: string | number;
      PaymentMethod?: string;
      voucher?: string;
    };

    const statusUpper = String(data.status || "").toUpperCase();
    const isPaid =
      statusUpper === "PAID" ||
      statusUpper === "SUCCESS" ||
      statusUpper === "DELIVERED";

    const parsedAmount =
      data.Amount !== undefined && Number.isFinite(Number(data.Amount))
        ? Number(data.Amount)
        : undefined;

    return {
      ok: true,
      isPaid,
      statusUpper,
      paidAmount: parsedAmount,
      easykashRef: data.easykashRef ? String(data.easykashRef) : undefined,
      paymentMethod: data.PaymentMethod ? String(data.PaymentMethod) : undefined,
      voucher: data.voucher ? String(data.voucher) : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      isPaid: false,
      statusUpper: "NETWORK_ERROR",
      reason: err instanceof Error ? err.message : "Inquiry failed",
    };
  }
}

/**
 * Computes the official EasyKash HMAC-SHA512 signature hash for callback verification.
 * Exact field concatenation order mandated by EasyKash docs:
 * 1. ProductCode
 * 2. Amount
 * 3. ProductType
 * 4. PaymentMethod
 * 5. status
 * 6. easykashRef
 * 7. customerReference
 */
export function computeEasyKashSignature(
  payload: EasyKashCallbackPayload,
  hmacSecret: string
): string {
  const dataToSecure = [
    payload.ProductCode ?? "",
    payload.Amount !== undefined ? String(payload.Amount) : "",
    payload.ProductType ?? "",
    payload.PaymentMethod ?? "",
    payload.status ?? "",
    payload.easykashRef ?? "",
    payload.customerReference ?? "",
  ];

  const concatenated = dataToSecure.join("");
  return crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");
}

/**
 * Verifies an incoming EasyKash webhook callback payload.
 */
export function verifyEasyKashWebhook(
  payload: EasyKashCallbackPayload
): { valid: boolean; reason?: string } {
  const hmacSecret = process.env.EASYKASH_HMAC_SECRET;
  const isConfiguredSecret =
    Boolean(hmacSecret) &&
    !hmacSecret!.startsWith("your-") &&
    !hmacSecret!.startsWith("your_");

  if (!isConfiguredSecret) {
    // Never allow unverified webhook payloads in production unless sandbox is explicitly enabled
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_PAYMENT_SANDBOX !== "true"
    ) {
      return {
        valid: false,
        reason: "EASYKASH_HMAC_SECRET is required in production",
      };
    }
    return { valid: true, reason: "dev_sandbox_no_hmac_secret" };
  }

  if (!payload.signatureHash) {
    return { valid: false, reason: "Missing signatureHash in EasyKash payload" };
  }

  const expectedSignature = computeEasyKashSignature(payload, hmacSecret!);
  const providedSignature = payload.signatureHash.toLowerCase().trim();

  const expectedBuf = Buffer.from(expectedSignature.toLowerCase());
  const providedBuf = Buffer.from(providedSignature);
  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return {
      valid: false,
      reason: "HMAC-SHA512 signature mismatch",
    };
  }

  return { valid: true };
}
