#!/usr/bin/env node
// ==============================================================================
// WAZAYEF GCC — Airtable & General CSV Importer CLI (`npm run import:csv`)
// Parses Airtable CSV exports, auto-maps columns, verifies DNS MX, auto-classifies
// industries, deduplicates, and inserts verified companies into Supabase.
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
const args = process.argv.slice(2);

let filePath = "";
let defaultCountry = "AE";
let checkMx = true;
let allowPersonalWebmail = false;

for (const arg of args) {
  if (arg.startsWith("--file=")) {
    filePath = arg.split("=")[1].trim();
  } else if (arg.startsWith("--country=")) {
    defaultCountry = arg.split("=")[1].trim().toUpperCase();
  } else if (arg === "--no-mx") {
    checkMx = false;
  } else if (arg === "--allow-webmail" || arg === "--include-webmail") {
    allowPersonalWebmail = true;
  } else if (!arg.startsWith("--") && !filePath) {
    filePath = arg.trim();
  }
}

if (!filePath) {
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Airtable & CSV Company Importer");
  console.log("==============================================================");
  console.log("Usage:");
  console.log("  npm run import:csv <path-to-airtable-export.csv>");
  console.log("  npm run import:csv --file=airtable.csv --country=AE");
  console.log("  npm run import:csv airtable.csv --no-mx");
  console.log("  npm run import:csv airtable.csv --allow-webmail");
  console.log("");
  console.log("Supported Airtable Column Headers (Auto-Detected):");
  console.log("  • Company Name : Company, Company Name, Name, Employer, اسم الشركة");
  console.log("  • HR Email     : Email, HR Email, Email Address, Contact, البريد الإلكتروني");
  console.log("  • Country      : Country, Country Code, الدولة, Region (AE, SA, QA, KW)");
  console.log("  • Phone        : Phone, Mobile, Contact Number, هاتف (Dial codes auto-detect GCC country)");
  console.log("  • City         : City, City Name, المدينة");
  console.log("  • Industry     : Industry, Category, Sector, القطاع, مجال العمل");
  console.log("  • Job Title    : Job Title, Role, Position, Specialty, المسمى الوظيفي");
  console.log("==============================================================");
  process.exit(1);
}

const resolvedPath = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ File not found at: ${resolvedPath}`);
  process.exit(1);
}

// RFC-4180 Compliant CSV parser (handles quotes, commas inside quotes, multi-line)
function parseCsv(rawContent) {
  const content = rawContent.replace(/^\uFEFF/, ""); // Strip UTF-8 BOM
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function normalizeHeader(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[_\-\s]+/g, " ")
    .trim();
}

function detectCountryCode(val, fallback) {
  if (!val) return fallback;
  const cleaned = val.trim().toUpperCase();
  if (["AE", "SA", "QA", "KW"].includes(cleaned)) return cleaned;
  if (/uae|emirates|dubai|abu\s*dhabi|sharjah|الإمارات|دبي/i.test(val)) return "AE";
  if (/saudi|ksa|riyadh|jeddah|السعودية|الرياض/i.test(val)) return "SA";
  if (/qatar|doha|قطر|الدوحة/i.test(val)) return "QA";
  if (/kuwait|الكويت/i.test(val)) return "KW";
  return fallback;
}

const CATEGORY_MAP = {
  "it & technology": "it-software",
  "it & software": "it-software",
  "sales & marketing": "sales-marketing",
  "marketing & sales": "sales-marketing",
  marketing: "sales-marketing",
  "business development": "sales-marketing",
  "customer service": "sales-marketing",
  "public relations": "sales-marketing",
  engineering: "engineering",
  manufacturing: "engineering",
  "human resources (hr)": "hr-admin",
  hr: "hr-admin",
  "admin & operations": "hr-admin",
  "admin & & operations": "hr-admin",
  "data entry & admin": "hr-admin",
  "business support": "hr-admin",
  management: "hr-admin",
  legal: "legal",
  "medical & healthcare": "healthcare",
  "education & training": "education",
  "finance & accounting": "finance-accounting",
  "creative & design": "design-media",
  "real estate": "real-estate",
  "hospitality & tourism": "hospitality-retail",
  hotel: "hospitality-retail",
  logistics: "logistics-supply",
  "transport & driving": "logistics-supply",
  security: "hr-admin",
};

function formatDomainAsCompanyName(domain) {
  const stripped = domain
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co|me|io|biz|info)\.(ae|sa|qa|kw|bh|om)$/i, "")
    .replace(/\.(com|net|org|gov|edu|co|me|io|biz|info|ae|sa|qa|kw|bh|om)$/i, "");
  const spaced = stripped
    .replace(/[-_.]+/g, " ")
    .replace(
      /([a-z]{3,})(medical|healthcare|clinic|hospital|pharma|pharmacy|hotels|hotel|resorts|resort|realty|properties|property|group|holding|holdings|contracting|construction|engineering|technologies|technology|tech|systems|solutions|logistics|shipping|trading|motors|capital|finance|consulting|consultancy|media|design|studio|academy|school|aviation|energy|petro|marine|global|international|dubai|uae|ksa|saudi|qatar|doha|kuwait)\b/gi,
      "$1 $2"
    );
  const parts = spaced.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GCC Corporate Employer";
  return parts
    .map((p) => (p.length <= 3 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

function detectCountry(countryVal, phoneVal, domain, fallback) {
  if (countryVal) {
    const direct = detectCountryCode(countryVal, "");
    if (direct) return direct;
  }
  const cleanPhone = String(phoneVal || "").replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("971") || cleanPhone.startsWith("05")) return "AE";
  if (cleanPhone.startsWith("966")) return "SA";
  if (cleanPhone.startsWith("974")) return "QA";
  if (cleanPhone.startsWith("965")) return "KW";

  const lowerDomain = (domain || "").toLowerCase();
  if (lowerDomain.endsWith(".ae")) return "AE";
  if (lowerDomain.endsWith(".sa")) return "SA";
  if (lowerDomain.endsWith(".qa")) return "QA";
  if (lowerDomain.endsWith(".kw")) return "KW";

  return fallback;
}

async function main() {
  const appUrl = await resolveAppUrl();
  console.log("==============================================================");
  console.log("⚡ WAZAYEF GCC — Airtable CSV Importer");
  console.log("==============================================================");
  console.log(`📄 Reading: ${path.basename(resolvedPath)}`);

  const rawCsv = fs.readFileSync(resolvedPath, "utf8");
  const parsedRows = parseCsv(rawCsv);

  if (parsedRows.length < 2) {
    console.error("❌ CSV file is empty or missing data rows.");
    process.exit(1);
  }

  const rawHeaders = parsedRows[0];
  const headers = rawHeaders.map(normalizeHeader);

  // Column mapping indexes
  let colEmail = -1;
  let colCompany = -1;
  let colCountry = -1;
  let colPhone = -1;
  let colCity = -1;
  let colIndustry = -1;
  let colSpecialty = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (colEmail === -1 && /email|e-mail|mail|بريد/i.test(h)) {
      colEmail = i;
    } else if (
      colCompany === -1 &&
      /company|organization|employer|agency|client|اسم الشركة|الشركة/i.test(h)
    ) {
      colCompany = i;
    } else if (colCountry === -1 && /country|nation|دولة|بلد/i.test(h)) {
      colCountry = i;
    } else if (colPhone === -1 && /phone|mobile|tel|هاتف|جوال/i.test(h)) {
      colPhone = i;
    } else if (colCity === -1 && /city|location|emirate|مدينة|المدينة/i.test(h)) {
      colCity = i;
    } else if (
      colIndustry === -1 &&
      /industry|sector|category|vertical|قطاع|مجال/i.test(h)
    ) {
      colIndustry = i;
    } else if (
      colSpecialty === -1 &&
      /specialty|role|title|position|job|vacancy|مسمى|وظيفة/i.test(h)
    ) {
      colSpecialty = i;
    }
  }

  // Fallbacks if not matched by name: check first row content for @
  if (colEmail === -1) {
    const sampleRow = parsedRows[1] || [];
    colEmail = sampleRow.findIndex((c) => typeof c === "string" && c.includes("@"));
  }
  if (colCompany === -1) {
    colCompany = colEmail === 0 ? 1 : 0;
  }

  if (colEmail === -1) {
    console.error("❌ Could not identify an Email column in your CSV header:");
    console.log("Headers found:", rawHeaders);
    process.exit(1);
  }

  console.log("🔍 Detected Column Mapping:");
  console.log(`  • Company Name : [${colCompany !== -1 ? rawHeaders[colCompany] : "Auto-formatted from domain"}]`);
  console.log(`  • HR Email     : [${rawHeaders[colEmail]}]`);
  console.log(`  • Category     : [${colIndustry !== -1 ? rawHeaders[colIndustry] : "Auto-classified"}]`);
  console.log(`  • Phone/Country: [${colPhone !== -1 ? rawHeaders[colPhone] : colCountry !== -1 ? rawHeaders[colCountry] : `Default: ${defaultCountry}`}]`);
  console.log(`  • Live DNS MX  : ${checkMx ? "Enabled" : "Disabled"}`);
  console.log(`  • Personal Mail: ${allowPersonalWebmail ? "Allowed (Gmail/Yahoo)" : "Filtered (Corporate Only)"}`);
  console.log("--------------------------------------------------------------");

  const candidates = [];
  for (let r = 1; r < parsedRows.length; r++) {
    const row = parsedRows[r];
    const rawEmail = (row[colEmail] || "").trim();
    if (!rawEmail || !rawEmail.includes("@")) continue;

    const email = rawEmail.toLowerCase().replace(/[;,>]+$/, "");
    const parts = email.split("@");
    if (parts.length !== 2) continue;
    const domain = parts[1];

    let rawCompany = colCompany !== -1 ? (row[colCompany] || "").trim() : "";
    if (!rawCompany || rawCompany.toLowerCase() === "unknown") {
      rawCompany = formatDomainAsCompanyName(domain);
    }

    const rawCategory =
      colIndustry !== -1 ? (row[colIndustry] || "").trim().toLowerCase() : "";
    const mappedCategory =
      CATEGORY_MAP[rawCategory] ||
      (rawCategory && rawCategory !== "other" ? rawCategory : undefined);

    const rawPhone = colPhone !== -1 ? row[colPhone] : "";
    const country_code = detectCountry(
      colCountry !== -1 ? row[colCountry] : "",
      rawPhone,
      domain,
      defaultCountry
    );

    const city = colCity !== -1 ? (row[colCity] || "").trim() : undefined;
    const sub_specialty =
      colSpecialty !== -1 ? (row[colSpecialty] || "").trim() : undefined;

    candidates.push({
      company_name: rawCompany,
      hr_email: email,
      country_code,
      city_name_en: city,
      industry_id: mappedCategory,
      sub_specialty,
      company_size: "100-500",
    });
  }

  console.log(`📦 Found ${candidates.length} valid email rows in CSV.`);
  console.log("🚀 Ingesting and verifying against Supabase database...");

  try {
    const res = await fetch(`${appUrl}/api/webhooks/companies-ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companies: candidates,
        checkMx,
        allowPersonalWebmail,
        source: `airtable_csv:${path.basename(resolvedPath)}`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Ingestion failed:", data.error || res.statusText);
      process.exit(1);
    }

    console.log("==============================================================");
    console.log("🎉 Airtable Import Completed Successfully!");
    console.log("==============================================================");
    console.log(`✨ New Companies Added : ${data.imported}`);
    console.log(`🔁 Duplicates Skipped  : ${data.skippedDuplicates}`);
    console.log(`🚫 Invalid/No-MX       : ${data.rejectedInvalid}`);
    console.log(`🏢 Total in Supabase   : ${data.total}`);
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
