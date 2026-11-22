"use client";

import React, { useState } from "react";
import {
  CompanyRecord,
  CountryCode,
  CountryConfig,
  Industry,
  Language,
} from "@/lib/types";
import { AdminStats } from "./admin-types";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  PlusCircle,
  Power,
  Trash2,
  Upload,
} from "lucide-react";

interface AdminCompaniesSectionProps {
  lang: Language;
  countries: CountryConfig[];
  industries: Industry[];
  stats: AdminStats;
  companies: CompanyRecord[];
  totalMatchingCompanies: number;
  companyPage: number;
  companyTotalPages: number;
  filterCountry: string;
  filterIndustry: string;
  filterStatus: string;
  searchInput: string;
  loadingCompanies: boolean;
  onPageChange: (nextPage: number) => void;
  onFilterCountryChange: (val: string) => void;
  onFilterIndustryChange: (val: string) => void;
  onFilterStatusChange: (val: string) => void;
  onSearchInputChange: (val: string) => void;
  onRefreshAll: () => void;
}

export function AdminCompaniesSection({
  lang,
  countries,
  industries,
  stats,
  companies,
  totalMatchingCompanies,
  companyPage,
  companyTotalPages,
  filterCountry,
  filterIndustry,
  filterStatus,
  searchInput,
  loadingCompanies,
  onPageChange,
  onFilterCountryChange,
  onFilterIndustryChange,
  onFilterStatusChange,
  onSearchInputChange,
  onRefreshAll,
}: AdminCompaniesSectionProps) {
  const [defaultImportCountry, setDefaultImportCountry] =
    useState<CountryCode>("AE");
  const [defaultImportIndustry, setDefaultImportIndustry] =
    useState<string>("engineering");
  const [csvText, setCsvText] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [seedingPack, setSeedingPack] = useState(false);
  const [verifyingMx, setVerifyingMx] = useState(false);
  const [customTgChannel, setCustomTgChannel] = useState("");

  const handleToggleCompany = async (comp: CompanyRecord) => {
    const nextActive = comp.is_active === false;
    await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comp.id, is_active: nextActive }),
    });
    onRefreshAll();
  };

  const handleDeleteCompany = async (comp: CompanyRecord) => {
    await fetch(`/api/admin/companies?id=${encodeURIComponent(comp.id)}`, {
      method: "DELETE",
    });
    onRefreshAll();
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || "");
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const sample = [
      "company_name,hr_email,country_code,city,industry_id,sub_specialty",
      "Al Futtaim Engineering Group,careers@alfuttaim-eng.ae,AE,Dubai,engineering,MEP & Civil Projects",
      "Riyadh Digital Cloud Co,hr@riyadhcloud.sa,SA,Riyadh,it-software,Cloud & DevOps",
      "Doha Lusail Contracting,talent@lusailbuild.qa,QA,Lusail,engineering,Infrastructure",
      "Kuwait Financial House Advisory,jobs@kfh-advisory.kw,KW,Kuwait City,finance-accounting,Islamic Finance",
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + sample], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asra3_companies_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkImportSubmit = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    setImportFeedback(null);

    try {
      const cleanContent = csvText.replace(/^\uFEFF/, "");
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentVal = "";
      let insideQuotes = false;

      for (let i = 0; i < cleanContent.length; i++) {
        const char = cleanContent[i];
        const nextChar = cleanContent[i + 1];

        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            currentVal += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === "," && !insideQuotes) {
          currentRow.push(currentVal.trim());
          currentVal = "";
        } else if ((char === "\r" || char === "\n") && !insideQuotes) {
          if (char === "\r" && nextChar === "\n") i++;
          currentRow.push(currentVal.trim());
          if (currentRow.some((c) => c.length > 0)) rows.push(currentRow);
          currentRow = [];
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        if (currentRow.some((c) => c.length > 0)) rows.push(currentRow);
      }

      if (rows.length === 0) return;

      const rawHeaders = rows[0] || [];
      const headers = rawHeaders.map((h) =>
        h.toLowerCase().replace(/[_\-\s]+/g, " ").trim()
      );

      let colEmail = -1;
      let colCompany = -1;
      let colCountry = -1;
      let colCity = -1;
      let colIndustry = -1;
      let colSpecialty = -1;

      for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        if (colEmail === -1 && /email|e-mail|mail|بريد/i.test(h)) colEmail = i;
        else if (
          colCompany === -1 &&
          /company|organization|employer|agency|client|اسم الشركة|الشركة/i.test(
            h
          )
        )
          colCompany = i;
        else if (colCountry === -1 && /country|nation|دولة|بلد/i.test(h))
          colCountry = i;
        else if (colCity === -1 && /city|location|emirate|مدينة/i.test(h))
          colCity = i;
        else if (
          colIndustry === -1 &&
          /industry|sector|category|vertical|قطاع|مجال/i.test(h)
        )
          colIndustry = i;
        else if (
          colSpecialty === -1 &&
          /specialty|role|title|position|job|vacancy|مسمى|وظيفة/i.test(h)
        )
          colSpecialty = i;
      }

      const hasHeader =
        colEmail !== -1 ||
        rawHeaders.some((h) =>
          /company|email|country|industry|name|role/i.test(h)
        );

      const startIndex = hasHeader ? 1 : 0;
      if (colEmail === -1) {
        const sample = rows[startIndex] || rows[0] || [];
        colEmail = sample.findIndex((c) => c.includes("@"));
        if (colEmail === -1) colEmail = 1;
      }
      if (colCompany === -1) {
        colCompany = colEmail === 0 ? 1 : 0;
      }

      const detectCountry = (val?: string): CountryCode => {
        if (!val) return defaultImportCountry;
        const cleaned = val.trim().toUpperCase();
        if (["AE", "SA", "QA", "KW"].includes(cleaned)) {
          return cleaned as CountryCode;
        }
        if (/uae|emirates|dubai|abu\s*dhabi|sharjah|الإمارات|دبي/i.test(val))
          return "AE";
        if (/saudi|ksa|riyadh|jeddah|السعودية|الرياض/i.test(val)) return "SA";
        if (/qatar|doha|قطر|الدوحة/i.test(val)) return "QA";
        if (/kuwait|الكويت/i.test(val)) return "KW";
        return defaultImportCountry;
      };

      const parsedRows: Array<{
        company_name: string;
        hr_email: string;
        country_code: CountryCode;
        city_name_en?: string;
        industry_id: string;
        sub_specialty?: string;
      }> = [];

      for (let i = startIndex; i < rows.length; i++) {
        const cols = rows[i];
        const email = (cols[colEmail] || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;

        const rawCompany = colCompany !== -1 ? cols[colCompany] : "";
        const company_name =
          rawCompany?.trim() && rawCompany.trim().toLowerCase() !== "unknown"
            ? rawCompany.trim()
            : email.split("@")[1].split(".")[0].toUpperCase() + " Group";

        const country_code = detectCountry(
          colCountry !== -1 ? cols[colCountry] : undefined
        );
        const city = colCity !== -1 ? cols[colCity]?.trim() : undefined;
        const industry_id =
          (colIndustry !== -1 ? cols[colIndustry]?.trim() : "") ||
          defaultImportIndustry;
        const sub_specialty =
          (colSpecialty !== -1 ? cols[colSpecialty]?.trim() : "") ||
          "Direct HR Recruitment";

        parsedRows.push({
          company_name,
          hr_email: email,
          country_code,
          city_name_en: city || undefined,
          industry_id,
          sub_specialty,
        });
      }

      const CHUNK_SIZE = 250;
      let totalImported = 0;
      let totalSkipped = 0;
      let latestTotal = 0;

      for (let cIdx = 0; cIdx < parsedRows.length; cIdx += CHUNK_SIZE) {
        const chunk = parsedRows.slice(cIdx, cIdx + CHUNK_SIZE);
        const res = await fetch("/api/admin/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companies: chunk }),
        });
        const data = await res.json();
        if (res.ok) {
          totalImported += data.imported || 0;
          totalSkipped += data.skippedDuplicates || 0;
          latestTotal = data.total || latestTotal;
        }
      }

      setImportFeedback(
        lang === "ar"
          ? `✓ تم استيراد ${totalImported} شركة جديدة بنجاح (تم تخطي ${totalSkipped} مكرر/غير صالح). إجمالي الشركات الآن: ${latestTotal}`
          : `✓ Imported ${totalImported} new companies (${totalSkipped} duplicates/invalid skipped). Total database size: ${latestTotal}`
      );
      setCsvText("");
      onRefreshAll();
    } finally {
      setImporting(false);
    }
  };

  const handleSeedGccExpansionPack = async () => {
    setSeedingPack(true);
    setImportFeedback(null);
    try {
      const res = await fetch("/api/admin/companies/seed-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extraChannel: customTgChannel.trim(),
          extraCountry: defaultImportCountry,
          pagesPerChannel: 6,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportFeedback(
          lang === "ar"
            ? `✓ تم فحص ${data.postsScanned} إعلان وظيفي عبر ${data.channelsScraped} قناة تليجرام: أُضيفت ${data.imported} شركة جديدة. الإجمالي: ${data.total}`
            : `✓ Scanned ${data.postsScanned} job posts across ${data.channelsScraped} Telegram channels: Added ${data.imported} new companies. Total: ${data.total}`
        );
        setCustomTgChannel("");
        onRefreshAll();
      }
    } finally {
      setSeedingPack(false);
    }
  };

  const handleRunMxVerification = async () => {
    setVerifyingMx(true);
    setImportFeedback(null);
    try {
      const res = await fetch("/api/admin/companies/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 80 }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportFeedback(
          lang === "ar"
            ? `✓ فحص DNS MX لـ ${data.checked} شركة: (${data.validCount} نشطة، ${data.disabledCount} تم تعطيلها)`
            : `✓ DNS MX checked ${data.checked} companies: ${data.validCount} active, ${data.disabledCount} disabled.`
        );
        onRefreshAll();
      }
    } finally {
      setVerifyingMx(false);
    }
  };

  return (
    <div className="animate-panel-enter grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Left Column: Bulk CSV Importer & Harvester */}
      <div className="exec-card exec-card-carbon-top xl:col-span-4 rounded-2xl overflow-hidden flex flex-col">
        <div className="exec-card-header px-5 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-zinc-50 truncate">
              {lang === "ar"
                ? "رفع واستيراد الشركات (CSV)"
                : "Bulk CSV Company Importer"}
            </h2>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
            <span>{lang === "ar" ? "نموذج CSV" : "Sample CSV"}</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "الدولة الافتراضية" : "Default Country"}
              </label>
              <select
                value={defaultImportCountry}
                onChange={(e) =>
                  setDefaultImportCountry(e.target.value as CountryCode)
                }
                className="exec-input w-full rounded-xl px-3 py-2 text-base sm:text-xs font-bold"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "التخصص الافتراضي" : "Default Industry"}
              </label>
              <select
                value={defaultImportIndustry}
                onChange={(e) => setDefaultImportIndustry(e.target.value)}
                className="exec-input w-full rounded-xl px-3 py-2 text-base sm:text-xs font-bold"
              >
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {lang === "ar" ? ind.name_ar : ind.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="exec-well flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-center hover:border-[#D4AF37] transition cursor-pointer">
            <Upload className="h-6 w-6 text-[#9A7B1C] dark:text-[#D4AF37] mb-1.5" />
            <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
              {lang === "ar"
                ? "اختر ملف .CSV من جهازك"
                : "Click to upload .CSV file"}
            </span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleCsvFileUpload}
              className="sr-only"
            />
          </label>

          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              {lang === "ar"
                ? "أو الصق بيانات الشركات مباشرة:"
                : "Or paste CSV rows directly:"}
            </label>
            <textarea
              rows={5}
              dir="ltr"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Emaar Contracting,hr@emaar.ae,AE,Dubai,engineering\nRiyadh Tech Solutions,jobs@riyadhtech.sa,SA,Riyadh,it-software`}
              className="exec-input w-full rounded-xl p-3 font-mono text-base sm:text-xs placeholder:text-zinc-400"
            />
          </div>

          {importFeedback && (
            <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-3 text-xs font-bold text-[#D4AF37]">
              {importFeedback}
            </div>
          )}

          <button
            type="button"
            disabled={importing || !csvText.trim()}
            onClick={handleBulkImportSubmit}
            className="btn-gold flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-50 touch-manipulation"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            <span>
              {lang === "ar"
                ? "استيراد وحفظ الشركات"
                : "Import & Deduplicate Companies"}
            </span>
          </button>

          <div className="exec-well rounded-xl p-4 space-y-2.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "السحب المباشر من قنوات تليجرام وفحص MX:"
                : "Live Telegram Harvester & MX Hygiene:"}
            </p>

            <input
              type="text"
              dir="ltr"
              value={customTgChannel}
              onChange={(e) => setCustomTgChannel(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "اختياري: @dubaijobsdaily"
                  : "Optional: @dubaijobsdaily"
              }
              className="exec-input w-full rounded-xl px-3 py-2 text-base sm:text-xs font-mono placeholder:text-zinc-400"
            />

            <button
              type="button"
              disabled={seedingPack}
              onClick={handleSeedGccExpansionPack}
              className="btn-carbon flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-extrabold cursor-pointer disabled:opacity-50 touch-manipulation"
            >
              {seedingPack ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
              )}
              <span>
                {lang === "ar"
                  ? "سحب وتحديث الشركات من تليجرام"
                  : "Harvest Live Telegram Channels Now"}
              </span>
            </button>

            <button
              type="button"
              disabled={verifyingMx}
              onClick={handleRunMxVerification}
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] py-2 px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer disabled:opacity-50 touch-manipulation"
            >
              {verifyingMx ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#9A7B1C] dark:text-[#D4AF37]" />
              )}
              <span>
                {lang === "ar"
                  ? "فحص خوادم البريد (Live DNS MX)"
                  : "Run Live DNS MX Verification Batch"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Paginated Employer Directory */}
      <div className="exec-card exec-card-carbon-top xl:col-span-8 rounded-2xl overflow-hidden flex flex-col">
        <div className="exec-card-header px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <Filter className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? `دليل الشركات (${totalMatchingCompanies.toLocaleString()})`
                : `Employer Directory (${totalMatchingCompanies.toLocaleString()})`}
            </h2>
          </div>

          <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
            <select
              value={filterCountry}
              onChange={(e) => {
                onFilterCountryChange(e.target.value);
                onPageChange(1);
              }}
              className="exec-input rounded-xl px-3 py-2 text-base sm:text-xs font-bold"
            >
              <option value="">
                {lang === "ar" ? "كل الدول (GCC)" : "All Countries"}
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({stats.inventoryByCountry?.[c.code] || 0})
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                onFilterStatusChange(e.target.value);
                onPageChange(1);
              }}
              className="exec-input rounded-xl px-3 py-2 text-base sm:text-xs font-bold"
            >
              <option value="all">
                {lang === "ar" ? "كل الحالات" : "All Status"}
              </option>
              <option value="active">
                {lang === "ar" ? "نشطة (MX ✓)" : "Active (MX ✓)"}
              </option>
              <option value="bounced">
                {lang === "ar" ? "معطلة / Bounced" : "Disabled / Bounced"}
              </option>
            </select>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "بحث عن شركة أو إيميل..."
                  : "Search company or email..."
              }
              className="exec-input flex-1 sm:flex-initial rounded-xl px-3 py-2 text-base sm:text-xs placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 flex-1">
          {/* Industry Coverage Strip */}
          <div className="exec-well rounded-xl p-3 flex flex-wrap gap-1.5">
            {industries.map((ind) => {
              const count = stats.inventoryByIndustry?.[ind.id] || 0;
              const active = filterIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => {
                    onFilterIndustryChange(active ? "" : ind.id);
                    onPageChange(1);
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer border touch-manipulation ${
                    active
                      ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                      : "bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-[#D4AF37]"
                  }`}
                >
                  {lang === "ar"
                    ? ind.name_ar.split(" ")[0]
                    : ind.name_en.split(",")[0]}{" "}
                  ({count})
                </button>
              );
            })}
          </div>

          {loadingCompanies ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : (
            <>
              {/* Mobile Stacked Cards (< md) */}
              <div className="md:hidden space-y-2.5">
                {companies.map((c) => (
                  <div
                    key={c.id}
                    className="exec-well rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          dir="auto"
                          className="font-bold text-sm text-zinc-950 dark:text-zinc-50 leading-snug text-start"
                        >
                          {c.company_name}
                        </p>
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          {c.country_code} •{" "}
                          {lang === "ar" ? c.city_name_ar : c.city_name_en} •{" "}
                          {c.industry_id}
                        </p>
                      </div>
                      {c.is_active !== false ? (
                        <span className="shrink-0 rounded-md bg-[#09090B] border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                          MX ✓
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span
                        dir="ltr"
                        className="font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate"
                      >
                        {c.hr_email}
                      </span>
                      <div className="inline-flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCompany(c)}
                          aria-label="Toggle active status"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(c)}
                          aria-label="Delete company"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#09090B] text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-start text-xs">
                  <thead className="exec-table-head text-[11px] font-bold tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "الشركة" : "Company"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "الموقع" : "Location"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "بريد الـ HR" : "HR Email"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "القطاع / الحالة" : "Sector"}
                      </th>
                      <th className="px-4 py-3 text-end">
                        {lang === "ar" ? "إجراء" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#121215]">
                    {companies.map((c) => (
                      <tr
                        key={c.id}
                        className="even:bg-[#F8F9FB] dark:even:bg-transparent hover:bg-[#ECEEF3] dark:hover:bg-[#18181B] transition-colors"
                      >
                        <td
                          dir="auto"
                          className="px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50 text-start"
                        >
                          {c.company_name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                          {c.country_code} •{" "}
                          {lang === "ar" ? c.city_name_ar : c.city_name_en}
                        </td>
                        <td
                          dir="ltr"
                          className="px-4 py-3 font-mono font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          {c.hr_email}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="truncate max-w-[130px]">
                              {c.industry_id}
                            </span>
                            {c.is_active !== false ? (
                              <span className="rounded-md bg-[#09090B] border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                                MX ✓
                              </span>
                            ) : (
                              <span className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                                Disabled
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              title={
                                c.is_active !== false
                                  ? "Disable company"
                                  : "Re-enable company"
                              }
                              onClick={() => handleToggleCompany(c)}
                              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] p-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer transition"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete company"
                              onClick={() => handleDeleteCompany(c)}
                              className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#09090B] p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span>
                  {lang === "ar"
                    ? `صفحة ${companyPage} من ${companyTotalPages} (50 شركة / صفحة)`
                    : `Page ${companyPage} of ${companyTotalPages} (50 / page)`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={companyPage <= 1}
                    onClick={() => onPageChange(Math.max(1, companyPage - 1))}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3.5 py-2 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition touch-manipulation"
                  >
                    {lang === "ar" ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                    <span>{lang === "ar" ? "السابق" : "Prev"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={companyPage >= companyTotalPages}
                    onClick={() =>
                      onPageChange(Math.min(companyTotalPages, companyPage + 1))
                    }
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3.5 py-2 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition touch-manipulation"
                  >
                    <span>{lang === "ar" ? "التالي" : "Next"}</span>
                    {lang === "ar" ? (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
