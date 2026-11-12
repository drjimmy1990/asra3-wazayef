import { NextRequest, NextResponse } from "next/server";
import { markCampaignRecipientOpened } from "@/lib/store";

// 43-byte 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = (searchParams.get("cid") || "").trim();
  const recipientId = (searchParams.get("rid") || "").trim();

  if (campaignId && recipientId) {
    await markCampaignRecipientOpened(campaignId, recipientId).catch(() => {});
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
