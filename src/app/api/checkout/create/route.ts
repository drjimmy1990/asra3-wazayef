import { NextRequest, NextResponse } from "next/server";
import { createCampaignOrder } from "@/lib/store";
import { initiateEasyKashPayment } from "@/lib/easykash";
import { CountryCode, PackageId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      candidate_name,
      candidate_email,
      candidate_phone,
      preferred_lang = "ar",
      primary_country_code = "AE",
      extra_country_codes = [],
      selected_cities = [],
      industry_id = "engineering",
      job_title = "Specialist",
      years_experience = 4,
      cv_file_name = "Candidate_CV.pdf",
      original_cv_url = null,
      detected_skills = [],
      ats_score = 80,
      package_id = "pro",
      promo_code = "",
      excluded_domain = "",
    } = body;

    const cleanName = String(candidate_name || "").trim();
    const cleanEmail = String(candidate_email || "").trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        { error: "Valid candidate full name and email address are required." },
        { status: 400 }
      );
    }

    const campaign = await createCampaignOrder({
      candidate_name: cleanName,
      candidate_email: cleanEmail,
      candidate_phone: String(candidate_phone || "").trim(),
      preferred_lang: preferred_lang === "en" ? "en" : "ar",
      primary_country_code: primary_country_code as CountryCode,
      extra_country_codes: Array.isArray(extra_country_codes)
        ? (extra_country_codes as CountryCode[])
        : [],
      selected_cities: Array.isArray(selected_cities) ? selected_cities : [],
      industry_id: String(industry_id),
      job_title: String(job_title),
      years_experience: Number(years_experience) || 3,
      cv_file_name: String(cv_file_name),
      original_cv_url: original_cv_url ? String(original_cv_url) : null,
      detected_skills: Array.isArray(detected_skills) ? detected_skills : [],
      ats_score: Number(ats_score) || 80,
      package_id: package_id as PackageId,
      promo_code: promo_code ? String(promo_code) : undefined,
      excluded_domain: excluded_domain ? String(excluded_domain) : undefined,
    });

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "https://asra3.com";

    const paymentSession = await initiateEasyKashPayment({
      amount: campaign.amount_paid,
      currency: campaign.currency,
      name: campaign.candidate_name,
      email: campaign.candidate_email,
      mobile: campaign.candidate_phone,
      customerReference: campaign.customer_reference,
      trackingToken: campaign.tracking_token,
      appBaseUrl: origin,
    });

    return NextResponse.json({
      redirectUrl: paymentSession.redirectUrl,
      isLiveGateway: paymentSession.isLiveGateway,
      trackingToken: campaign.tracking_token,
      customerReference: campaign.customer_reference,
      amountPaid: campaign.amount_paid,
      currency: campaign.currency,
    });
  } catch (error) {
    console.error("Checkout initiation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate EasyKash payment",
      },
      { status: 500 }
    );
  }
}
