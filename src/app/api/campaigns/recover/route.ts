import { NextRequest, NextResponse } from "next/server";
import { findCampaignsByEmail } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const lang = body.lang === "en" ? "en" : "ar";

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        {
          error:
            lang === "ar"
              ? "يرجى إدخال بريد إلكتروني صحيح."
              : "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const matches = await findCampaignsByEmail(email);

    if (matches.length > 0) {
      const latest = matches[0];
      const appBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const trackingUrl = `${appBaseUrl}/track/${latest.tracking_token}`;

      // Trigger n8n email webhook to dispatch the tracking code to the candidate's inbox
      const n8nWebhook =
        process.env.N8N_RECOVER_CODE_WEBHOOK ||
        process.env.N8N_CAMPAIGN_START_WEBHOOK;

      if (n8nWebhook && !n8nWebhook.includes("your-")) {
        fetch(n8nWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET || "",
          },
          body: JSON.stringify({
            event: "recover_tracking_code",
            candidateName: latest.candidate_name,
            candidateEmail: latest.candidate_email,
            customerReference: latest.customer_reference,
            trackingToken: latest.tracking_token,
            trackingUrl,
            preferredLang: lang,
            allCampaignCodes: matches.map((m) => ({
              reference: m.customer_reference,
              token: m.tracking_token,
              country: m.primary_country_code,
              createdAt: m.created_at,
            })),
          }),
        }).catch((err) =>
          console.warn("n8n recovery email webhook notice:", err)
        );
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[DEV Tracking Recovery] Email: ${email} -> Code: ${latest.customer_reference} | Token: ${latest.tracking_token}`
        );
      }
    }

    // Always return generic success so attackers cannot enumerate registered emails
    return NextResponse.json({
      ok: true,
      message:
        lang === "ar"
          ? "إذا كان هذا البريد الإلكتروني مرتبطاً بحملة نشطة، فقد تم إرسال رمز التتبع ورابط اللوحة المباشر إلى صندوق الوارد الخاص بك."
          : "If an active campaign is linked to this email address, we have sent your Tracking Code and portal link to your inbox.",
    });
  } catch (error) {
    console.error("Recover tracking code error:", error);
    return NextResponse.json(
      { error: "Failed to process recovery request" },
      { status: 500 }
    );
  }
}
