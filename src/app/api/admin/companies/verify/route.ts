import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import { verifyCompaniesBatch } from "@/lib/store";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(250, Math.max(10, Number(body.limit) || 60));

    const result = await verifyCompaniesBatch(limit);
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Company MX verification batch failed:", error);
    return NextResponse.json(
      { error: "Failed to run DNS MX verification batch" },
      { status: 500 }
    );
  }
}
