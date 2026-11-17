import { NextRequest, NextResponse } from "next/server";
import {
  inquireEasyKashPayment,
  isEasyKashHmacConfigured,
  isEasyKashLiveConfigured,
  verifyEasyKashWebhook,
} from "@/lib/easykash";
import { getCampaignByToken, markCampaignPaidAndStart } from "@/lib/store";
import { EasyKashCallbackPayload } from "@/lib/types";

const PAID_STATUSES = new Set(["PAID", "SUCCESS", "DELIVERED"]);

function resolvePublicBaseUrl(req: NextRequest): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (configured && !configured.includes("your-")) {
    return configured;
  }
  const forwardedProto = (req.headers.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim();
  const forwardedHost = (
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim();
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

function isRealBrowserDocumentNavigation(req: NextRequest): boolean {
  const secFetchMode = (req.headers.get("sec-fetch-mode") || "")
    .trim()
    .toLowerCase();
  if (secFetchMode === "navigate") {
    return true;
  }

  const accept = (req.headers.get("accept") || "").toLowerCase();
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isAutomatedClient =
    ua.includes("postman") ||
    ua.includes("curl") ||
    ua.includes("axios") ||
    ua.includes("guzzle") ||
    ua.includes("insomnia") ||
    ua.includes("httpie") ||
    ua.includes("python") ||
    ua.includes("node");

  return (
    accept.includes("text/html") &&
    ua.includes("mozilla/") &&
    !isAutomatedClient
  );
}

function getQueryParam(
  searchParams: URLSearchParams,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const val = searchParams.get(key);
    if (val !== null && val.trim() !== "") {
      return val.trim();
    }
  }
  return undefined;
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, HEAD, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * EasyKash DirectPayV1 Callback / Webhook Endpoint (GET + POST)
 * - Returns HTTP 200 OK JSON on bare GET / Postman validation probes so EasyKash can save Callback URL & generate HMAC Secret Key.
 * - Verifies HMAC-SHA512 signatureHash across:
 *   [ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference]
 *   or performs authoritative server-to-server Cash API inquiry.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerReference =
    getQueryParam(searchParams, [
      "customerReference",
      "CustomerReference",
      "customer_reference",
    ]) || "";

  if (!customerReference) {
    return NextResponse.json(
      {
        ok: true,
        status: "ready",
        service: "asra3-easykash-callback",
        methods: ["GET", "POST"],
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const baseUrl = resolvePublicBaseUrl(req);
  let existing = await getCampaignByToken(customerReference);

  if (!existing) {
    if (isRealBrowserDocumentNavigation(req)) {
      return NextResponse.redirect(`${baseUrl}/track`);
    }
    return NextResponse.json(
      {
        ok: true,
        received: true,
        matched: false,
        customerReference,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (existing.payment_status !== "paid") {
    const signatureHash = getQueryParam(searchParams, [
      "signatureHash",
      "SignatureHash",
    ]);
    const statusParam =
      getQueryParam(searchParams, ["status", "Status"]) || "";
    const easykashRefParam = getQueryParam(searchParams, [
      "easykashRef",
      "EasykashRef",
    ]);
    const providerRefNum = getQueryParam(searchParams, [
      "providerRefNum",
      "ProviderRefNum",
    ]);
    const productCode = getQueryParam(searchParams, [
      "ProductCode",
      "productCode",
    ]);
    const amountParam = getQueryParam(searchParams, ["Amount", "amount"]);
    const productType = getQueryParam(searchParams, [
      "ProductType",
      "productType",
    ]);
    const paymentMethodParam = getQueryParam(searchParams, [
      "PaymentMethod",
      "paymentMethod",
    ]);
    const voucherParam = getQueryParam(searchParams, ["voucher", "Voucher"]);

    let verifiedPaid = false;
    let paidAmount: number | undefined;
    let easykashRef: string | undefined = easykashRefParam ?? providerRefNum;
    let paymentMethod = paymentMethodParam || "EasyKash DirectPayV1";
    let voucher = voucherParam;

    if (signatureHash) {
      const payload: EasyKashCallbackPayload = {
        ProductCode: productCode,
        Amount: amountParam,
        ProductType: productType,
        PaymentMethod: paymentMethodParam,
        status: statusParam,
        easykashRef: easykashRefParam ?? providerRefNum,
        customerReference,
        signatureHash,
      };
      const check = verifyEasyKashWebhook(payload);
      const statusUpper = statusParam.toUpperCase();
      if (check.valid && PAID_STATUSES.has(statusUpper)) {
        verifiedPaid = true;
        if (amountParam !== undefined && Number.isFinite(Number(amountParam))) {
          paidAmount = Number(amountParam);
        }
      }
    }

    // If GET params weren't signed, verify directly with EasyKash server API (never trust raw query params)
    if (!verifiedPaid && isEasyKashLiveConfigured()) {
      const inquiry = await inquireEasyKashPayment(existing.customer_reference);
      if (inquiry.ok && inquiry.isPaid) {
        verifiedPaid = true;
        paidAmount = inquiry.paidAmount;
        easykashRef = inquiry.easykashRef || easykashRef;
        paymentMethod = inquiry.paymentMethod || paymentMethod;
        voucher = inquiry.voucher || voucher;
      }
    }

    if (verifiedPaid) {
      existing =
        (await markCampaignPaidAndStart({
          customerReference: existing.customer_reference,
          easykashRef,
          productCode,
          paymentMethod,
          voucher,
          paidAmount,
        })) || existing;
    }
  }

  if (isRealBrowserDocumentNavigation(req)) {
    return NextResponse.redirect(
      `${baseUrl}/track/${encodeURIComponent(existing.tracking_token)}`
    );
  }

  return NextResponse.json(
    {
      ok: true,
      success: true,
      received: true,
      matched: true,
      trackingToken: existing.tracking_token,
      customerReference: existing.customer_reference,
      paymentStatus: existing.payment_status,
      campaignStatus: existing.campaign_status,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const trimmedBody = rawBody.trim();

    if (!trimmedBody) {
      return NextResponse.json(
        {
          ok: true,
          status: "ready",
          service: "asra3-easykash-callback",
          methods: ["GET", "POST"],
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    let payload: EasyKashCallbackPayload;
    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const entries = Object.fromEntries(
        new URLSearchParams(trimmedBody).entries()
      );
      if (Object.keys(entries).length === 0) {
        return NextResponse.json(
          { error: "Invalid callback payload" },
          { status: 400 }
        );
      }
      payload = entries as unknown as EasyKashCallbackPayload;
    } else {
      try {
        payload = JSON.parse(trimmedBody) as EasyKashCallbackPayload;
      } catch {
        if (
          trimmedBody.includes("=") &&
          !trimmedBody.startsWith("{") &&
          !trimmedBody.startsWith("[")
        ) {
          const entries = Object.fromEntries(
            new URLSearchParams(trimmedBody).entries()
          );
          payload = entries as unknown as EasyKashCallbackPayload;
        } else {
          return NextResponse.json(
            { error: "Invalid callback payload" },
            { status: 400 }
          );
        }
      }
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const customerReference = String(payload.customerReference ?? "").trim();
    if (!customerReference) {
      return NextResponse.json(
        {
          ok: true,
          status: "ready",
          received: true,
          matched: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const existing = await getCampaignByToken(customerReference);
    if (!existing) {
      if (
        isEasyKashHmacConfigured() &&
        !verifyEasyKashWebhook(payload).valid
      ) {
        return NextResponse.json(
          { error: "Invalid EasyKash signature" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          ok: true,
          received: true,
          matched: false,
          customerReference,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const verification = verifyEasyKashWebhook(payload);
    let statusUpper = String(payload.status || "").toUpperCase();
    let easykashRef = payload.easykashRef
      ? String(payload.easykashRef)
      : undefined;
    let paymentMethod = payload.PaymentMethod
      ? String(payload.PaymentMethod)
      : "EasyKash DirectPayV1";
    let voucher = payload.voucher ? String(payload.voucher) : undefined;
    let paidAmount =
      payload.Amount !== undefined && Number.isFinite(Number(payload.Amount))
        ? Number(payload.Amount)
        : undefined;

    if (verification.valid) {
      if (!PAID_STATUSES.has(statusUpper)) {
        return NextResponse.json({
          ok: true,
          received: true,
          status: statusUpper,
          message: "Payment not in PAID state yet",
        });
      }
    } else if (!isEasyKashHmacConfigured() && isEasyKashLiveConfigured()) {
      const inquiry = await inquireEasyKashPayment(existing.customer_reference);
      if (!inquiry.ok || !inquiry.isPaid) {
        return NextResponse.json(
          {
            error: "Payment not verified via EasyKash API",
            reason: verification.reason,
          },
          { status: 403 }
        );
      }
      statusUpper = inquiry.statusUpper;
      paidAmount = inquiry.paidAmount;
      easykashRef = inquiry.easykashRef || easykashRef;
      paymentMethod = inquiry.paymentMethod || paymentMethod;
      voucher = inquiry.voucher || voucher;
    } else {
      return NextResponse.json(
        { error: "Invalid EasyKash signature", reason: verification.reason },
        { status: 403 }
      );
    }

    const updated = await markCampaignPaidAndStart({
      customerReference: existing.customer_reference,
      easykashRef,
      productCode: payload.ProductCode
        ? String(payload.ProductCode)
        : undefined,
      paymentMethod,
      voucher,
      paidAmount,
    });

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "Campaign order not found or paid amount did not match expected order total",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      success: true,
      trackingToken: updated.tracking_token,
      customerReference: updated.customer_reference,
      paymentStatus: updated.payment_status,
      campaignStatus: updated.campaign_status,
    });
  } catch (error) {
    console.error("EasyKash webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
