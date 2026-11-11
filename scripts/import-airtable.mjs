#!/usr/bin/env node
// ==============================================================================
// WAZAYEF GCC — Direct Airtable REST API Importer CLI (`npm run import:airtable`)
// Connects directly to Airtable via Personal Access Token (PAT), fetches all records,
// auto-detects fields, verifies DNS MX, deduplicates, and inserts into Supabase.
// ==============================================================================

import fs from "fs";
import path from "path";

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

const args = process.argv.slice(2);

let apiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT || "";
let baseId = process.env.AIRTABLE_BASE_ID || "";
let tableName = process.env.AIRTABLE_TABLE_NAME || "Companies";
let defaultCountry = "AE";
let checkMx = true;

for (const arg of args) {
  if (arg.startsWith("--token=") || arg.startsWith("--key=")) {
    apiKey = arg.split("=")[1].trim();
  } else if (arg.startsWith("--base=")) {
    baseId = arg.split("=")[1].trim();
  } else if (arg.startsWith("--table=")) {
    tableName = arg.split("=")[1].trim();
  } else if (arg.startsWith("--country=")) {
    defaultCountry = arg.split("=")[1].trim().toUpperCase();
  } else if (arg === "--no-mx") {
    checkMx = false;
  }
}

if (!apiKey || !baseId) {
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Airtable Direct API Importer");
  console.log("==============================================================");
  console.log("Usage via CLI Arguments:");
  console.log("  npm run import:airtable --token=pat... --base=app... --table=Companies");
  console.log("");
  console.log("Or add these to your .env.local file:");
  console.log("  AIRTABLE_API_KEY=patXXXXXXXXXXXXXX");
  console.log("  AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX");
  console.log("  AIRTABLE_TABLE_NAME=Companies");
  console.log("");
  console.log("Options:");
  console.log("  --country=AE|SA|QA|KW   Default country fallback (default: AE)");
  console.log("  --no-mx                 Skip DNS MX email verification");
  console.log("==============================================================");
  process.exit(1);
}

function detectCountryCode(val, fallback) {
  if (!val) return fallback;
  const str = String(val).trim();
  const cleaned = str.toUpperCase();
  if (["AE", "SA", "QA", "KW"].includes(cleaned)) return cleaned;
  if (/uae|emirates|dubai|abu\s*dhabi|sharjah|الإمارات|دبي/i.test(str)) return "AE";
  if (/saudi|ksa|riyadh|jeddah|السعودية|الرياض/i.test(str)) return "SA";
  if (/qatar|doha|قطر|الدوحة/i.test(str)) return "QA";
  if (/kuwait|الكويت/i.test(str)) return "KW";
  return fallback;
}

function findFieldValue(fields, patterns) {
  for (const [key, val] of Object.entries(fields)) {
    for (const pat of patterns) {
      if (pat.test(key) && val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          return val.map(String).join(", ");
        }
        return String(val).trim();
      }
    }
  }
  return "";
}

async function main() {
  const appUrl = await resolveAppUrl();
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Connecting to Airtable...");
  console.log("==============================================================");
  console.log(`🔑 Base ID: ${baseId} | Table: ${tableName}`);

  const allRecords = [];
  let offset = "";
  let page = 1;

  while (true) {
    const encodedTable = encodeURIComponent(tableName);
    let url = `https://api.airtable.com/v0/${baseId}/${encodedTable}?pageSize=100`;
    if (offset) url += `&offset=${encodeURIComponent(offset)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(
        "❌ Airtable API request failed:",
        res.status,
        res.statusText,
        err
      );
      process.exit(1);
    }

    const data = await res.json();
    const records = data.records || [];
    allRecords.push(...records);
    console.log(`📄 Page ${page}: Loaded ${records.length} records...`);

    if (data.offset) {
      offset = data.offset;
      page++;
    } else {
      break;
    }
  }

  console.log(`📦 Total Records retrieved from Airtable: ${allRecords.length}`);

  const candidates = [];
  for (const rec of allRecords) {
    const fields = rec.fields || {};

    const rawEmail = findFieldValue(fields, [
      /email/i,
      /e-mail/i,
      /mail/i,
      /بريد/i,
    ]);
    if (!rawEmail || !rawEmail.includes("@")) continue;

    const email = rawEmail.toLowerCase().replace(/[;,>]+$/, "");

    const company_name =
      findFieldValue(fields, [
        /company\s*name/i,
        /company/i,
        /organization/i,
        /employer/i,
        /اسم الشركة/i,
        /الشركة/i,
        /name/i,
      ]) || email.split("@")[1].split(".")[0].toUpperCase() + " Group";

    const rawCountry = findFieldValue(fields, [
      /country/i,
      /nation/i,
      /دولة/i,
      /region/i,
    ]);
    const country_code = detectCountryCode(rawCountry, defaultCountry);

    const city = findFieldValue(fields, [
      /city/i,
      /location/i,
      /emirate/i,
      /مدينة/i,
    ]);

    const industry_id = findFieldValue(fields, [
      /industry/i,
      /sector/i,
      /category/i,
      /vertical/i,
      /قطاع/i,
      /مجال/i,
    ]);

    const sub_specialty = findFieldValue(fields, [
      /specialty/i,
      /role/i,
      /job\s*title/i,
      /title/i,
      /position/i,
      /مسمى/i,
      /وظيفة/i,
    ]);

    candidates.push({
      company_name,
      hr_email: email,
      country_code,
      city_name_en: city || undefined,
      industry_id: industry_id || undefined,
      sub_specialty: sub_specialty || undefined,
      company_size: "100-500",
    });
  }

  console.log(`🔍 Extracted ${candidates.length} valid email records.`);
  console.log("🚀 Verifying against DNS MX and inserting into Supabase...");

  try {
    const res = await fetch(`${appUrl}/api/webhooks/companies-ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companies: candidates,
        checkMx,
        source: `airtable_api:${baseId}/${tableName}`,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("❌ Ingestion failed:", result.error || res.statusText);
      process.exit(1);
    }

    console.log("==============================================================");
    console.log("🎉 Airtable Direct Import Completed!");
    console.log("==============================================================");
    console.log(`✨ New Companies Added : ${result.imported}`);
    console.log(`🔁 Duplicates Skipped  : ${result.skippedDuplicates}`);
    console.log(`🚫 Invalid/No-MX       : ${result.rejectedInvalid}`);
    console.log(`🏢 Total in Supabase   : ${result.total}`);
    console.log("==============================================================");
  } catch (err) {
    console.error(
      "❌ Could not reach WAZAYEF server at",
      appUrl,
      "- Make sure `npm run dev` is running."
    );
    console.error(err);
    process.exit(1);
  }
}

main();
