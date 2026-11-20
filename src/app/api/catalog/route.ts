import { NextResponse } from "next/server";
import { getCatalogData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCatalogData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "private, no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to load catalog:", error);
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}
