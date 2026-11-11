import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  bulkImportCompanies,
  deleteCompanyRecord,
  listCompanies,
  toggleCompanyActiveStatus,
} from "@/lib/store";
import { CountryCode } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") as CountryCode | null;
  const industry = searchParams.get("industry") || undefined;
  const search = searchParams.get("search") || undefined;
  const statusFilter = searchParams.get("status") || "all";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    200,
    Math.max(10, Number(searchParams.get("limit")) || 50)
  );

  let companies = await listCompanies({
    country_code: country || undefined,
    industry_id: industry,
    search,
  });

  if (statusFilter === "active") {
    companies = companies.filter((c) => c.is_active !== false);
  } else if (statusFilter === "bounced") {
    companies = companies.filter((c) => c.is_active === false);
  }

  const total = companies.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const paged = companies.slice(offset, offset + pageSize);

  return NextResponse.json({
    companies: paged,
    total,
    page: safePage,
    pageSize,
    totalPages,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json();
    const rows = Array.isArray(body.companies) ? body.companies : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No company rows provided for import" },
        { status: 400 }
      );
    }

    const result = await bulkImportCompanies(rows);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Bulk company import error:", error);
    return NextResponse.json(
      { error: "Failed to import companies" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json();
    const id = String(body.id || "");
    const isActive = Boolean(body.is_active);
    if (!id) {
      return NextResponse.json({ error: "Missing company id" }, { status: 400 });
    }
    await toggleCompanyActiveStatus(id, isActive);
    return NextResponse.json({ ok: true, id, is_active: isActive });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle company status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Missing company id" }, { status: 400 });
  }

  await deleteCompanyRecord(id);
  return NextResponse.json({ ok: true, deletedId: id });
}
