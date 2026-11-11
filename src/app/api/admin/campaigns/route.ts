import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  getCatalogData,
  listAllCampaigns,
  listCompanies,
  updatePackagePricing,
} from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  const [campaigns, companies, catalog] = await Promise.all([
    listAllCampaigns(),
    listCompanies(),
    getCatalogData(),
  ]);

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
    packages: catalog.packages,
    countries: catalog.countries,
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json();
    if (body.packageId && body.pricesByCurrency) {
      const updatedPackages = await updatePackagePricing(
        body.packageId,
        body.pricesByCurrency,
        body.addonPricesByCurrency
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
