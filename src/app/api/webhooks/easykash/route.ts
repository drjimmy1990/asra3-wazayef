import { NextRequest, NextResponse } from "next/server";
import {
  inquireEasyKashPayment,
  isEasyKashLiveConfigured,
  verifyEasyKashWebhook,
} from "@/lib/easykash";
import { getCampaignByToken, markCampaignPaidAndStart } from "@/lib/store";
import { EasyKashCallbackPayload } from "@/lib/types";

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

/**
 * EasyKash DirectPayV1 Callback / Webhook Endpoint (POST + GET Redirect Fallback)
 * Verifies HMAC-SHA512 signatureHash across:
 * [ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference]
 * or performs authoritative server-to-server Cash API inquiry on GET redirects.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerReference = (searchParams.get("customerReference") || "").trim();
  const baseUrl = resolvePublicBaseUrl(req);

  if (!customerReference) {
    return NextResponse.redirect(`${baseUrl}/track`);
  }

  let existing = await getCampaignByToken(customerReference);

  if (existing && existing.payment_status !== "paid") {
    const signatureHash = searchParams.get("signatureHash") || undefined;
    const statusParam = searchParams.get("status") || "";
    const providerRefNum =
      searchParams.get("providerRefNum") ||
      searchParams.get("easykashRef") ||
      undefined;

    let verifiedPaid = false;
    let paidAmount: number | undefined;
    let easykashRef: string | undefined = providerRefNum;
    let paymentMethod = searchParams.get("PaymentMethod") || "EasyKash DirectPayV1";
    const productCode = searchParams.get("ProductCode") || undefined;
    let voucher = searchParams.get("voucher") || undefined;

    if (signatureHash) {
      const payload: EasyKashCallbackPayload = {
        ProductCode: productCode,
        Amount: searchParams.get("Amount") || undefined,
        ProductType: searchParams.get("ProductType") || undefined,
        PaymentMethod: searchParams.get("PaymentMethod") || undefined,
        status: statusParam,
        easykashRef: providerRefNum,
        customerReference,
        signatureHash,
      };
      const check = verifyEasyKashWebhook(payload);
      const statusUpper = statusParam.toUpperCase();
      if (
        check.valid &&
        (statusUpper === "PAID" ||
          statusUpper === "SUCCESS" ||
          statusUpper === "DELIVERED")
      ) {
        verifiedPaid = true;
        if (payload.Amount !== undefined && Number.isFinite(Number(payload.Amount))) {
          paidAmount = Number(payload.Amount);
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

  const dest = existing
    ? `${baseUrl}/track/${encodeURIComponent(existing.tracking_token)}`
    : `${baseUrl}/track`;
  return NextResponse.redirect(dest);
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as EasyKashCallbackPayload;

    const verification = verifyEasyKashWebhook(payload);
    if (!verification.valid) {
      return NextResponse.json(
        { error: "Invalid EasyKash signature", reason: verification.reason },
        { status: 403 }
      );
    }

    const statusUpper = String(payload.status || "").toUpperCase();
    const isSuccess =
      statusUpper === "PAID" ||
      statusUpper === "SUCCESS" ||
      statusUpper === "DELIVERED";

    if (!isSuccess) {
      return NextResponse.json({
        received: true,
        status: statusUpper,
        message: "Payment not in PAID state yet",
      });
    }

    const parsedAmount =
      payload.Amount !== undefined ? Number(payload.Amount) : undefined;

    const updated = await markCampaignPaidAndStart({
      customerReference: payload.customerReference
        ? String(payload.customerReference)
        : undefined,
      easykashRef: payload.easykashRef
        ? String(payload.easykashRef)
        : undefined,
      productCode: payload.ProductCode
        ? String(payload.ProductCode)
        : undefined,
      paymentMethod: payload.PaymentMethod
        ? String(payload.PaymentMethod)
        : "EasyKash DirectPayV1",
      voucher: payload.voucher ? String(payload.voucher) : undefined,
      paidAmount: parsedAmount,
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
