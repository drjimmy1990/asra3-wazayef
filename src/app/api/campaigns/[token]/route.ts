import { NextRequest, NextResponse } from "next/server";
import {
  advanceCampaignProgress,
  getCampaignByToken,
} from "@/lib/store";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const campaign = await getCampaignByToken(token);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const body = await req.json().catch(() => ({}));

  // Payment confirmation is strictly restricted to HMAC-verified `/api/webhooks/easykash`
  if (body.action === "confirm_payment") {
    return NextResponse.json(
      {
        error:
          "Forbidden: Payment confirmation requires cryptographic EasyKash HMAC webhook verification.",
      },
      { status: 403 }
    );
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
