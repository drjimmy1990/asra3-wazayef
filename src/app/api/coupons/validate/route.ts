import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/store";
import { PackageId } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim();
    const packageId = (["starter", "pro", "ultimate"].includes(body.packageId)
      ? body.packageId
      : "pro") as PackageId;
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          code: "",
          discountAmount: 0,
          finalTotal: Math.max(1, subtotal),
          errorReason: "empty",
        },
        { status: 400 }
      );
    }

    const result = await validateCouponCode({ code, packageId, subtotal });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
