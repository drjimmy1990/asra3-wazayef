import { NextRequest, NextResponse } from "next/server";
import { bulkImportCompanies } from "@/lib/store";
import { CountryCode } from "@/lib/types";

/**
 * Automated Company Harvester Ingestion Webhook (called by n8n every 24h)
 * Verifies DNS MX records, auto-classifies industry & city, deduplicates,
 * and inserts new active GCC companies into Supabase.
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    const providedSecret =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (
      webhookSecret &&
      !webhookSecret.startsWith("your-") &&
      providedSecret !== webhookSecret
    ) {
      return NextResponse.json(
        { error: "Unauthorized webhook signature" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawList = Array.isArray(body.companies) ? body.companies : [];

    if (rawList.length === 0) {
      return NextResponse.json(
        { error: "No companies provided in payload" },
        { status: 400 }
      );
    }

    const normalized = rawList.map((item: Record<string, unknown>) => {
      const rawCountry = String(item.country_code || "AE")
        .toUpperCase()
        .trim();
      const country_code: CountryCode = ["AE", "SA", "QA", "KW"].includes(
        rawCountry
      )
        ? (rawCountry as CountryCode)
        : "AE";

      return {
        company_name: String(item.company_name || ""),
        hr_email: String(item.hr_email || ""),
        country_code,
        city_id: item.city_id ? String(item.city_id) : undefined,
        city_name_en: item.city_name_en
          ? String(item.city_name_en)
          : item.city
          ? String(item.city)
          : undefined,
        city_name_ar: item.city_name_ar ? String(item.city_name_ar) : undefined,
        industry_id: item.industry_id ? String(item.industry_id) : undefined,
        sub_specialty: item.sub_specialty
          ? String(item.sub_specialty)
          : "Active GCC Employer",
        company_size: item.company_size
          ? String(item.company_size)
          : "100-500",
      };
    });

    const result = await bulkImportCompanies(normalized, {
      checkMx: body.checkMx !== false,
      allowPersonalWebmail: Boolean(body.allowPersonalWebmail),
    });

    return NextResponse.json({
      ok: true,
      source: body.source || "n8n_harvester",
      ...result,
    });
  } catch (error) {
    console.error("Automated company ingest error:", error);
    return NextResponse.json(
      { error: "Failed to ingest discovered companies" },
      { status: 500 }
    );
  }
}
