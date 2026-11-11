import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import { seedGccExpansionPack } from "@/lib/store";
import { DEFAULT_TELEGRAM_CHANNELS } from "@/lib/telegram-harvester";
import { CountryCode } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const result = await seedGccExpansionPack({ pagesPerChannel: 5 });
    return NextResponse.json({
      ok: true,
      monitoredChannels: DEFAULT_TELEGRAM_CHANNELS,
      ...result,
    });
  } catch (error) {
    console.error("Failed to harvest live Telegram GCC companies:", error);
    return NextResponse.json(
      { error: "Failed to run live Telegram company harvester" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawExtraChannel = String(body.extraChannel || "")
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/t\.me\/(s\/)?/i, "");
    const extraCountry = (body.extraCountry || "AE") as CountryCode;

    const customChannels = rawExtraChannel
      ? [
          {
            username: rawExtraChannel,
            defaultCountry: extraCountry,
          },
          ...DEFAULT_TELEGRAM_CHANNELS,
        ]
      : undefined;

    // Security: Destructive `refreshExisting` table wipe is disabled over HTTP
    const result = await seedGccExpansionPack({
      customChannels,
      pagesPerChannel: Math.min(15, Math.max(1, Number(body.pagesPerChannel) || 6)),
      refreshExisting: false,
    });

    return NextResponse.json({
      ok: true,
      monitoredChannels: customChannels || DEFAULT_TELEGRAM_CHANNELS,
      ...result,
    });
  } catch (error) {
    console.error("Failed to harvest live Telegram GCC companies:", error);
    return NextResponse.json(
      { error: "Failed to run live Telegram company harvester" },
      { status: 500 }
    );
  }
}
