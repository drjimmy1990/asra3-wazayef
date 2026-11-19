import { NextResponse } from "next/server";
import { isQaTestModeEnabled } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "asra3-platform",
      // true = campaigns from QA candidate emails only reach QA test inboxes
      qa_test_mode: isQaTestModeEnabled(),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
