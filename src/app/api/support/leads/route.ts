import { NextRequest, NextResponse } from "next/server";
import { createSupportLead } from "@/lib/store";
import { SupportLeadTopic } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Silent honeypot drop for spam bots
    if (body.website_trap && String(body.website_trap).trim().length > 0) {
      return NextResponse.json({ ok: true, id: "accepted" });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Please provide your name." },
        { status: 400 }
      );
    }

    const hasValidEmail =
      email.length > 4 &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const hasValidPhone = phone.replace(/[^0-9+]/g, "").length >= 7;

    if (!hasValidEmail && !hasValidPhone) {
      return NextResponse.json(
        { error: "Please provide a valid email or WhatsApp/phone number." },
        { status: 400 }
      );
    }

    if (message.length < 3) {
      return NextResponse.json(
        { error: "Please write a brief message so our team can assist you." },
        { status: 400 }
      );
    }

    const lead = createSupportLead({
      session_id: String(body.session_id || "web"),
      name,
      email: hasValidEmail ? email : "",
      phone: hasValidPhone ? phone : "",
      country_code: String(body.country_code || "AE"),
      topic: (body.topic || "general") as SupportLeadTopic,
      message,
      page_url: String(body.page_url || "/"),
    });

    // Optional non-blocking n8n lead webhook forward
    const leadWebhook = (process.env.N8N_SUPPORT_LEAD_WEBHOOK || "").trim();
    if (
      leadWebhook &&
      leadWebhook.startsWith("http") &&
      !leadWebhook.includes("your-")
    ) {
      fetch(leadWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret":
            process.env.N8N_WEBHOOK_SECRET ||
            process.env.ADMIN_PASSCODE ||
            "asra3@2026",
        },
        body: JSON.stringify({ event: "support_lead_created", lead }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("Support lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to save contact request" },
      { status: 500 }
    );
  }
}
