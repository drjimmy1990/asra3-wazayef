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

export interface InitiateEasyKashResult {
  redirectUrl: string;
  isLiveGateway: boolean;
  customerReference: string;
}

/**
 * Initiates a hosted payment session via EasyKash DirectPayV1 API.
 * If EASYKASH_API_KEY is not configured yet, returns a realistic interactive
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
  const apiKey = process.env.EASYKASH_API_KEY;
  const cashExpiry = Number(process.env.EASYKASH_CASH_EXPIRY_DAYS || 3);
  const redirectUrl = `${params.appBaseUrl}/track/${params.trackingToken}?payment=callback`;

  // Normalize phone number for EasyKash (expects digits/standard format)
  const cleanMobile =
    params.mobile.replace(/[^\d+]/g, "") || "01000000000";

  const isConfiguredApiKey =
    Boolean(apiKey) &&
    !apiKey!.startsWith("your-") &&
    !apiKey!.startsWith("your_");

  if (isConfiguredApiKey && apiKey) {
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
