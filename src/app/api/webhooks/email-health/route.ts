import { NextRequest, NextResponse } from "next/server";
import { isWebhookAuthorized } from "@/lib/admin-auth";
import { recordEmailHealthEvent } from "@/lib/store";
import { CountryCode } from "@/lib/types";

/**
 * Self-Healing Database Hygiene Webhook:
 * Called by n8n or SMTP provider when an email bounces ("hard_bounce")
 * or succeeds ("delivered" / "opened"). Protected by X-Webhook-Secret.
 */
export async function POST(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized webhook signature" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const hr_email = String(body.hr_email || body.email || "").trim();
    const rawEvent = String(body.event || "delivered").toLowerCase();

    const validEvents = [
      "hard_bounce",
      "soft_bounce",
      "delivered",
      "opened",
      "complained",
    ] as const;

    const event = validEvents.includes(rawEvent as (typeof validEvents)[number])
      ? (rawEvent as (typeof validEvents)[number])
      : "delivered";

    const country_code = body.country_code
      ? (String(body.country_code).toUpperCase() as CountryCode)
      : undefined;

    const result = await recordEmailHealthEvent({
      hr_email,
      event,
      country_code,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Email health webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process email health event" },
      { status: 500 }
    );
  }
}
