#!/usr/bin/env node
// ==============================================================================
// WAZAYEF GCC — Direct Apollo.io REST API Harvester (`npm run import:apollo`)
// Fetches verified HR & Talent Acquisition decision-makers across UAE, KSA, Qatar,
// & Kuwait directly via Apollo API, verifies DNS MX, auto-classifies, and saves to Supabase.
// ==============================================================================

import fs from "fs";
import path from "path";

// Load .env.local if present
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  }
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

let apiKey = process.env.APOLLO_API_KEY || "";
let maxPages = 5;
let defaultCountry = "AE";
let checkMx = true;
let customTitle = "";
let customCountry = "";

for (const arg of args) {
  if (arg.startsWith("--key=") || arg.startsWith("--token=")) {
    apiKey = arg.split("=")[1].trim();
  } else if (arg.startsWith("--pages=")) {
    maxPages = Number(arg.split("=")[1]) || 5;
  } else if (arg.startsWith("--country=")) {
    customCountry = arg.split("=")[1].trim().toUpperCase();
  } else if (arg.startsWith("--title=")) {
    customTitle = arg.split("=")[1].trim();
  } else if (arg === "--no-mx") {
    checkMx = false;
  }
}

if (!apiKey) {
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Apollo.io Direct API Harvester");
  console.log("==============================================================");
  console.log("Usage:");
  console.log("  npm run import:apollo --key=YOUR_APOLLO_API_KEY");
  console.log("  npm run import:apollo --key=YOUR_KEY --pages=10 --country=SA");
  console.log("  npm run import:apollo --key=YOUR_KEY --title='Talent Acquisition'");
  console.log("");
  console.log("Or add to your .env.local:");
  console.log("  APOLLO_API_KEY=your_apollo_api_key_here");
  console.log("");
  console.log("💡 Tip: Don't have an Apollo API key? You can simply export a CSV");
  console.log("from your Apollo.io search and run:");
  console.log("  npm run import:csv path/to/apollo-export.csv");
  console.log("==============================================================");
  process.exit(1);
}

function detectCountryCode(loc, fallback) {
  const str = String(loc || "").toLowerCase();
  if (str.includes("saudi") || str.includes("riyadh") || str.includes("jeddah") || str.includes("dammam")) return "SA";
  if (str.includes("qatar") || str.includes("doha") || str.includes("lusail")) return "QA";
  if (str.includes("kuwait")) return "KW";
  if (str.includes("emirates") || str.includes("dubai") || str.includes("abu dhabi") || str.includes("sharjah") || str.includes("uae")) return "AE";
  return fallback;
}

const TARGET_TITLES = customTitle
  ? [customTitle]
  : [
      "Head of Human Resources",
      "Talent Acquisition Manager",
      "Human Resources Director",
      "Recruitment Specialist",
      "HR Manager",
      "People and Culture Manager",
      "Talent Acquisition Specialist",
      "Recruitment Manager",
    ];

const TARGET_LOCATIONS = customCountry === "SA"
  ? ["Saudi Arabia"]
  : customCountry === "QA"
  ? ["Qatar"]
  : customCountry === "KW"
  ? ["Kuwait"]
  : customCountry === "AE"
  ? ["United Arab Emirates"]
  : ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait"];

async function main() {
  const appUrl = await resolveAppUrl();
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Querying Apollo.io for GCC HR Contacts...");
  console.log("==============================================================");
  console.log(`📍 Locations : ${TARGET_LOCATIONS.join(", ")}`);
  console.log(`💼 Titles    : ${TARGET_TITLES.slice(0, 3).join(", ")} (+${Math.max(0, TARGET_TITLES.length - 3)} more)`);
  console.log(`📄 Max Pages : ${maxPages} (up to ${maxPages * 100} contacts)`);

  const gathered = [];

  for (let page = 1; page <= maxPages; page++) {
    console.log(`⏳ Fetching Apollo page ${page}/${maxPages}...`);
    try {
      const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: apiKey,
          person_titles: TARGET_TITLES,
          person_locations: TARGET_LOCATIONS,
          page,
          per_page: 100,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("❌ Apollo API Error:", res.status, res.statusText, err);
        break;
      }

      const data = await res.json();
      const people = data.people || [];
      if (people.length === 0) {
        console.log("ℹ️ No more records returned by Apollo.");
        break;
      }

      for (const p of people) {
        const email = (p.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;

        const org = p.organization || {};
        const company_name =
          org.name?.trim() ||
          p.headline ||
          email.split("@")[1].split(".")[0].toUpperCase() + " Group";

        const locStr = `${p.country || ""} ${p.state || ""} ${p.city || ""} ${org.country || ""} ${org.city || ""}`;
        const country_code = detectCountryCode(locStr, defaultCountry);

        gathered.push({
          company_name,
          hr_email: email,
          country_code,
          city_name_en: p.city || org.city || undefined,
          industry_id: org.industry || undefined,
          sub_specialty: p.title || "Direct HR Recruitment",
          company_size: org.estimated_num_employees
            ? `${org.estimated_num_employees}`
            : "100-500",
        });
      }

      console.log(`✓ Page ${page}: Gathered ${people.length} contacts (${gathered.length} valid with emails).`);
      if (people.length < 100) break;
    } catch (err) {
      console.error("❌ Failed fetching Apollo page:", err);
      break;
    }
  }

  if (gathered.length === 0) {
    console.log("⚠️ No contacts with verified emails were retrieved from Apollo.");
    process.exit(0);
  }

  console.log(`🚀 Ingesting ${gathered.length} contacts into Supabase...`);

  try {
    const res = await fetch(`${appUrl}/api/webhooks/companies-ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companies: gathered,
        checkMx,
        source: "apollo_api",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Ingestion failed:", data.error || res.statusText);
      process.exit(1);
    }

    console.log("==============================================================");
    console.log("🎉 Apollo Import Completed Successfully!");
    console.log("==============================================================");
    console.log(`✨ New Companies Added : ${data.imported}`);
    console.log(`🔁 Duplicates Skipped  : ${data.skippedDuplicates}`);
    console.log(`🚫 Invalid/No-MX       : ${data.rejectedInvalid}`);
    console.log(`🏢 Total in Supabase   : ${data.total}`);
    console.log("==============================================================");
  } catch (err) {
    console.error("❌ Could not connect to WAZAYEF server:", err);
    process.exit(1);
  }
}

main();
