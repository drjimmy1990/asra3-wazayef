import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  getCatalogData,
  isSupabaseConfigured,
  listAllCampaigns,
  listCompanies,
  listCoupons,
  listSupportLeads,
  updateOfferSettings,
  updatePackagePricing,
} from "@/lib/store";
import {
  isEasyKashHmacConfigured,
  isEasyKashLiveConfigured,
} from "@/lib/easykash";
import { listSmtpAccounts } from "@/lib/smtp-mailer";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  const [campaigns, companies, catalog, coupons] = await Promise.all([
    listAllCampaigns(),
    listCompanies(),
    getCatalogData(),
    listCoupons(),
  ]);
  const supportLeads = listSupportLeads();
  const newSupportLeadsCount = supportLeads.filter(
    (l) => l.status === "new"
  ).length;

  const paidCampaigns = campaigns.filter((c) => c.payment_status === "paid");
  const totalEmailsSent = campaigns.reduce(
    (sum, c) => sum + (c.emails_sent_count || 0),
    0
  );

  const inventoryByCountry: Record<string, number> = {};
  const inventoryByIndustry: Record<string, number> = {};
  for (const comp of companies) {
    if (comp.is_active === false) continue;
    inventoryByCountry[comp.country_code] =
      (inventoryByCountry[comp.country_code] || 0) + 1;
    inventoryByIndustry[comp.industry_id] =
      (inventoryByIndustry[comp.industry_id] || 0) + 1;
  }

  const revenueByCurrency: Record<string, number> = {};
  for (const camp of paidCampaigns) {
    revenueByCurrency[camp.currency] =
      (revenueByCurrency[camp.currency] || 0) + (camp.amount_paid || 0);
  }

  const smtpAccounts = listSmtpAccounts(true);
  const smtpActiveCount = smtpAccounts.filter((a) => a.is_active).length;

  return NextResponse.json({
    campaigns,
    stats: {
      totalCampaigns: campaigns.length,
      paidCampaigns: paidCampaigns.length,
      totalCompanies: companies.length,
      activeCompanies: companies.filter((c) => c.is_active !== false).length,
      totalEmailsSent,
      inventoryByCountry,
      inventoryByIndustry,
      revenueByCurrency,
    },
    systemHealth: {
      easykashLive: isEasyKashLiveConfigured(),
      hmacConfigured: isEasyKashHmacConfigured(),
      currencyOverride:
        process.env.EASYKASH_CURRENCY_OVERRIDE?.trim().toUpperCase() || null,
      smtpActiveCount,
      customAdminPasscode: Boolean(
        process.env.ADMIN_PASSCODE &&
          process.env.ADMIN_PASSCODE.trim() !== "asra3@2026" &&
          !process.env.ADMIN_PASSCODE.startsWith("your-")
      ),
      storageMode: isSupabaseConfigured() ? "supabase" : "local_docker_volume",
      appUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://asra3.com").replace(
        /\/+$/,
        ""
      ),
    },
    packages: catalog.packages,
    offerSettings: catalog.offerSettings,
    coupons,
    newSupportLeadsCount,
    countries: catalog.countries,
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json();
    if (body.offerSettings && typeof body.offerSettings === "object") {
      const offerSettings = updateOfferSettings(body.offerSettings);
      return NextResponse.json({ ok: true, offerSettings });
    }
    if (body.packageId && body.pricesByCurrency) {
      const updatedPackages = await updatePackagePricing(
        body.packageId,
        body.pricesByCurrency,
        body.addonPricesByCurrency,
        body.originalPricesByCurrency
      );
      return NextResponse.json({ ok: true, packages: updatedPackages });
    }
    return NextResponse.json(
      { error: "Invalid update payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
