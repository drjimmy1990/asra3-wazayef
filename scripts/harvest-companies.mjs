#!/usr/bin/env node
// ==============================================================================
// WAZAYEF GCC — Standalone CLI Harvester (`npm run harvest`)
// Scrapes live public Telegram job channels (https://t.me/s/...), verifies
// live DNS MX records, deduplicates against Supabase, and inserts new companies.
// ==============================================================================

import fs from "fs";
import path from "path";

function resolveAdminSecret() {
  for (const envFile of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), envFile);
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
      for (const l of lines) {
        const m = l.match(/^(?:ADMIN_PASSCODE|N8N_WEBHOOK_SECRET)=(.+)$/);
        if (m && m[1].trim() && !m[1].trim().startsWith("your-")) {
          return m[1].trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
  return process.env.ADMIN_PASSCODE || "asra3@2026";
}

async function resolveAppUrl() {
  const candidates = [
    process.env.PORT ? `http://localhost:${process.env.PORT}` : null,
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://localhost:3002",
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/api/catalog`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.countries) || (json.catalog && Array.isArray(json.catalog.countries))) {
          return url;
        }
      }
    } catch {
      // try next
    }
  }
  return "http://localhost:3001";
}

const args = process.argv.slice(2);

let extraChannel = "";
let extraCountry = "AE";
let pagesPerChannel = 6;
let refreshExisting = false;

for (const arg of args) {
  if (arg.startsWith("--channel=")) {
    extraChannel = arg.split("=")[1].trim();
  } else if (arg.startsWith("--country=")) {
    extraCountry = arg.split("=")[1].trim().toUpperCase();
  } else if (arg.startsWith("--pages=")) {
    pagesPerChannel = Number(arg.split("=")[1]) || 6;
  } else if (arg === "--refresh") {
    refreshExisting = true;
  }
}

async function main() {
  const appUrl = await resolveAppUrl();
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Live Telegram & Corporate MX Harvester");
  console.log("==============================================================");
  if (extraChannel) {
    console.log(`📌 Custom Channel Added: ${extraChannel} (${extraCountry})`);
  }
  if (refreshExisting) {
    console.log("🔄 Refresh Mode: Re-classifying all companies in Supabase...");
  }

  try {
    const res = await fetch(`${appUrl}/api/admin/companies/seed-pack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": resolveAdminSecret(),
      },
      body: JSON.stringify({
        extraChannel,
        extraCountry,
        pagesPerChannel,
        refreshExisting,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Harvester failed:", data.error || res.statusText);
      process.exit(1);
    }

    console.log(`✅ Channels Scraped    : ${data.channelsScraped}`);
    console.log(`📄 Job Posts Scanned   : ${data.postsScanned}`);
    console.log(`✨ New Companies Added : ${data.imported}`);
    console.log(`🔁 Duplicates Skipped  : ${data.skippedDuplicates}`);
    console.log(`🚫 Invalid/No-MX       : ${data.rejectedInvalid}`);
    console.log(`🏢 Total in Supabase   : ${data.total}`);
    console.log("==============================================================");
  } catch (err) {
    console.error(
      "❌ Could not reach WAZAYEF server at",
      appUrl,
      "- Make sure `npm run dev` or `npm start` is running."
    );
    console.error(err);
    process.exit(1);
  }
}

main();
