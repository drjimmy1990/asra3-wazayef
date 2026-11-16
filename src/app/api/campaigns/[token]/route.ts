import { NextRequest, NextResponse } from "next/server";
import {
  advanceCampaignProgress,
  getCampaignByToken,
  markCampaignPaidAndStart,
} from "@/lib/store";
import {
  initiateEasyKashPayment,
  inquireEasyKashPayment,
  isEasyKashLiveConfigured,
} from "@/lib/easykash";

// Throttles automatic live EasyKash inquiry checks per campaign ID (8 seconds cooldown)
const lastInquireAtMs = new Map<string, number>();

function resolveRequestOrigin(req: NextRequest): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (configured && !configured.includes("your-")) {
    return configured;
  }
  return (
    req.headers.get("origin") ||
    req.nextUrl.origin ||
    "https://asra3.com"
  ).replace(/\/+$/, "");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  let campaign = await getCampaignByToken(token);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const forceVerify = req.nextUrl.searchParams.get("verify") === "1";

  if (
    campaign.payment_status !== "paid" &&
    !campaign.tracking_token.startsWith("demo-") &&
    isEasyKashLiveConfigured()
  ) {
    const now = Date.now();
    const prevCheck = lastInquireAtMs.get(campaign.id) || 0;
    if (forceVerify || now - prevCheck >= 8000) {
      lastInquireAtMs.set(campaign.id, now);
      const inquiry = await inquireEasyKashPayment(campaign.customer_reference);
      if (inquiry.ok && inquiry.isPaid) {
        const updated = await markCampaignPaidAndStart({
          customerReference: campaign.customer_reference,
          trackingToken: campaign.tracking_token,
          easykashRef: inquiry.easykashRef,
          paymentMethod: inquiry.paymentMethod || "EasyKash DirectPayV1",
          voucher: inquiry.voucher,
          paidAmount: inquiry.paidAmount,
        });
        if (updated) {
          campaign = updated;
        }
      }
    }
  }

  return NextResponse.json({ campaign });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const body = await req.json().catch(() => ({}));

  // Payment confirmation is strictly restricted to HMAC-verified `/api/webhooks/easykash` or live Cash API inquiry
  if (body.action === "confirm_payment") {
    return NextResponse.json(
      {
        error:
          "Forbidden: Payment confirmation requires cryptographic EasyKash HMAC webhook verification.",
      },
      { status: 403 }
    );
  }

  if (body.action === "reinitiate_payment") {
    const campaign = await getCampaignByToken(token);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    if (campaign.payment_status === "paid") {
      return NextResponse.json({
        alreadyPaid: true,
        redirectUrl: `/track/${campaign.tracking_token}`,
      });
    }

    const paymentSession = await initiateEasyKashPayment({
      amount: campaign.amount_paid,
      currency: campaign.currency,
      name: campaign.candidate_name,
      email: campaign.candidate_email,
      mobile: campaign.candidate_phone,
      customerReference: campaign.customer_reference,
      trackingToken: campaign.tracking_token,
      appBaseUrl: resolveRequestOrigin(req),
    });

    return NextResponse.json({
      redirectUrl: paymentSession.redirectUrl,
      isLiveGateway: paymentSession.isLiveGateway,
    });
  }

  if (body.action === "advance_batch") {
    const updated = await advanceCampaignProgress(token);
    if (!updated) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ campaign: updated });
  }

  if (body.action) {
    return NextResponse.json(
      { error: `Unsupported campaign action: ${String(body.action)}` },
      { status: 400 }
    );
  }

  const campaign = await getCampaignByToken(token);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}
