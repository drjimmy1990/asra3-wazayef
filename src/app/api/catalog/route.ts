import { NextResponse } from "next/server";
import { getCatalogData } from "@/lib/store";

export async function GET() {
  try {
    const data = await getCatalogData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load catalog:", error);
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}
