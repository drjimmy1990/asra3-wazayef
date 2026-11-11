import { NextRequest, NextResponse } from "next/server";
import { verifyEasyKashWebhook } from "@/lib/easykash";
import { markCampaignPaidAndStart } from "@/lib/store";
import { EasyKashCallbackPayload } from "@/lib/types";

/**
 * EasyKash DirectPayV1 Callback / Webhook Endpoint
 * Verifies HMAC-SHA512 signatureHash across:
 * [ProductCode, Amount, ProductType, PaymentMethod, status, easykashRef, customerReference]
 */
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
