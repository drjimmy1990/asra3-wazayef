import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from "@/lib/store";
import { CouponDiscountType, PackageId } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  try {
    const body = await req.json();
    const coupon = createCoupon({
      code: String(body.code || ""),
      discount_type: (body.discount_type === "fixed"
        ? "fixed"
        : "percent") as CouponDiscountType,
      discount_value: Number(body.discount_value),
      applicable_packages:
        Array.isArray(body.applicable_packages) &&
        body.applicable_packages.length > 0
          ? (body.applicable_packages as PackageId[])
          : "all",
      max_uses:
        body.max_uses === null || body.max_uses === "" || body.max_uses === undefined
          ? null
          : Number(body.max_uses),
      expires_at: body.expires_at ? String(body.expires_at) : null,
      is_active: body.is_active !== false,
      note: body.note ? String(body.note) : "",
    });
    const coupons = await listCoupons();
    return NextResponse.json({ ok: true, coupon, coupons });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create coupon",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Coupon id required" }, { status: 400 });
    }
    const updated = updateCoupon(id, {
      is_active:
        typeof body.is_active === "boolean" ? body.is_active : undefined,
      discount_type: body.discount_type,
      discount_value:
        body.discount_value !== undefined
          ? Number(body.discount_value)
          : undefined,
      max_uses: body.max_uses,
      expires_at: body.expires_at,
      applicable_packages: body.applicable_packages,
      note: body.note,
    });
    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    const coupons = await listCoupons();
    return NextResponse.json({ ok: true, coupon: updated, coupons });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update coupon",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Coupon id required" }, { status: 400 });
  }
  const deleted = deleteCoupon(id);
  if (!deleted) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }
  const coupons = await listCoupons();
  return NextResponse.json({ ok: true, coupons });
}
