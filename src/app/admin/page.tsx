"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import {
  CampaignRecord,
  CompanyRecord,
  CountryCode,
  PackageTier,
} from "@/lib/types";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Lock,
  LogOut,
  PlusCircle,
  Power,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { lang, countries, industries } = useApp();

  // Server-verified HttpOnly session state (never exposes passcode in client bundle)
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "companies" | "campaigns" | "settings"
  >("companies");

  // Companies state (Paginated + Debounced)
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [totalMatchingCompanies, setTotalMatchingCompanies] = useState(0);
  const [companyPage, setCompanyPage] = useState(1);
  const [companyTotalPages, setCompanyTotalPages] = useState(1);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // CSV Importer state
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

  // Campaigns & Stats state
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<"all" | "paid" | "pending">("all");
  const [packages, setPackages] = useState<PackageTier[]>([]);
  const [stats, setStats] = useState<{
    totalCampaigns: number;
    paidCampaigns: number;
    totalCompanies: number;
    activeCompanies: number;
    totalEmailsSent: number;
    inventoryByCountry: Record<string, number>;
    inventoryByIndustry: Record<string, number>;
    revenueByCurrency: Record<string, number>;
  }>({
    totalCampaigns: 0,
    paidCampaigns: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalEmailsSent: 0,
    inventoryByCountry: {},
    inventoryByIndustry: {},
    revenueByCurrency: {},
  });
  const [savingPkgId, setSavingPkgId] = useState<string | null>(null);
  const [savedToastPkgId, setSavedToastPkgId] = useState<string | null>(null);

  // Check server session cookie on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        setIsUnlocked(Boolean(data?.authenticated));
      })
      .catch(() => setIsUnlocked(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  // Debounce company search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCompanyPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCompanies = useCallback(async () => {
    if (!isUnlocked) return;
    setLoadingCompanies(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(companyPage));
      params.set("limit", "50");
      if (filterCountry) params.set("country", filterCountry);
      if (filterIndustry) params.set("industry", filterIndustry);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/companies?${params.toString()}`);
      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setTotalMatchingCompanies(data.total || 0);
        setCompanyTotalPages(data.totalPages || 1);
      }
    } finally {
      setLoadingCompanies(false);
    }
  }, [
    isUnlocked,
    companyPage,
    filterCountry,
    filterIndustry,
    filterStatus,
    debouncedSearch,
  ]);

  const loadAdminOverview = useCallback(async () => {
    if (!isUnlocked) return;
    const res = await fetch("/api/admin/campaigns");
    if (res.status === 401) {
      setIsUnlocked(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      if (data.stats) setStats((prev) => ({ ...prev, ...data.stats }));
      if (data.packages) setPackages(data.packages);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      loadCompanies();
    }
  }, [isUnlocked, loadCompanies]);

  useEffect(() => {
    if (isUnlocked) {
      loadAdminOverview();
    }
  }, [isUnlocked, loadAdminOverview]);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setLoggingIn(true);
    setPinError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: pinInput.trim() }),
      });
      if (res.ok) {
        setIsUnlocked(true);
        setPinInput("");
      } else {
        setPinError(
          lang === "ar"
            ? "رمز المرور الإداري غير صحيح."
            : "Invalid administrator passcode."
        );
      }
    } catch {
      setPinError("Network error while verifying passcode.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLockAdmin = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    setIsUnlocked(false);
    setPinInput("");
  };

  const handleToggleCompany = async (comp: CompanyRecord) => {
    const nextActive = comp.is_active === false;
    await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comp.id, is_active: nextActive }),
    });
    loadCompanies();
    loadAdminOverview();
  };

  const handleDeleteCompany = async (comp: CompanyRecord) => {
    await fetch(`/api/admin/companies?id=${encodeURIComponent(comp.id)}`, {
      method: "DELETE",
    });
    loadCompanies();
    loadAdminOverview();
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
          /company|organization|employer|agency|client|اسم الشركة|الشركة/i.test(h)
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
      loadCompanies();
      loadAdminOverview();
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
        loadCompanies();
        loadAdminOverview();
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
        loadCompanies();
        loadAdminOverview();
      }
    } finally {
      setVerifyingMx(false);
    }
  };

  const handleSavePackagePrices = async (pkg: PackageTier) => {
    setSavingPkgId(pkg.id);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          pricesByCurrency: pkg.prices_by_currency,
          addonPricesByCurrency: pkg.addon_country_price_by_currency,
        }),
      });
      if (res.ok) {
        setSavedToastPkgId(pkg.id);
        setTimeout(() => setSavedToastPkgId(null), 2500);
      }
    } finally {
      setSavingPkgId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <Lock className="h-6 w-6" />
            </div>
            <p className="mt-4 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 dark:text-[#D4AF37]">
              ASRA3 EXECUTIVE OPERATIONS
            </p>
            <h1 className="mt-1.5 text-center text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {lang === "ar"
                ? "بوابة إدارة أسرع (Asra3.com)"
                : "Asra3.com Protected Admin Center"}
            </h1>
            <p className="mt-1.5 text-center text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lang === "ar"
                ? "محمية بجلسة خادم مشفرة (HttpOnly). أدخل رمز المرور الإداري للمتابعة."
                : "Protected by server-side HttpOnly session authentication."}
            </p>

            <form onSubmit={handleUnlockSubmit} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  dir="ltr"
                  aria-label="Administrator Passcode"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="•••••••••••"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-4 py-3.5 text-center text-sm font-bold tracking-[0.25em] text-zinc-950 dark:text-zinc-50 focus:border-[#D4AF37] focus:bg-white dark:focus:bg-[#09090B] focus:outline-none transition"
                  autoFocus
                />
                {pinError && (
                  <p className="mt-2 text-center text-xs font-bold text-red-600 dark:text-red-400">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold cursor-pointer disabled:opacity-60"
              >
                {loggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {lang === "ar"
                    ? "تسجيل دخول الإدارة"
                    : "Unlock Admin Center"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (campaignFilter === "paid") return c.payment_status === "paid";
    if (campaignFilter === "pending") return c.payment_status !== "paid";
    return true;
  });

  const revenueSummary = Object.entries(stats.revenueByCurrency || {})
    .map(([curr, val]) => `${val.toLocaleString()} ${curr}`)
    .join(" • ");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Top Header & KPI Cards */}
        <div className="rounded-2xl bg-[#09090B] p-6 sm:p-8 text-zinc-50 border border-zinc-800 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121215] px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-[#D4AF37]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                ASRA3.COM — Operations & Revenue Desk
              </span>
              <h1 className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
                {lang === "ar"
                  ? "لوحة إدارة قاعدة الشركات، الحملات، والأسعار"
                  : "GCC Employer Database, Campaigns & Pricing Manager"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: "companies",
                  label:
                    lang === "ar"
                      ? "قاعدة الشركات والاستيراد"
                      : "Companies & Importer",
                  icon: Building2,
                },
                {
                  id: "campaigns",
                  label:
                    lang === "ar"
                      ? "طلبات العملاء والحملات"
                      : "Customer Campaigns",
                  icon: Users,
                },
                {
                  id: "settings",
                  label:
                    lang === "ar"
                      ? "الأسعار والربط التقني"
                      : "Pricing & Webhooks",
                  icon: Settings,
                },
              ].map((tItem) => {
                const Icon = tItem.icon;
                const active = activeTab === tItem.id;
                return (
                  <button
                    key={tItem.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tItem.id as "companies" | "campaigns" | "settings"
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                      active
                        ? "btn-gold"
                        : "bg-[#121215] border border-zinc-800 text-zinc-300 hover:text-zinc-50 hover:border-[#D4AF37]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tItem.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLockAdmin}
                className="flex items-center gap-1.5 rounded-xl bg-[#18181B] border border-red-900/60 px-3.5 py-2.5 text-xs font-extrabold text-red-400 hover:border-red-500 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{lang === "ar" ? "تسجيل خروج" : "Sign Out"}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-[#121215] p-4 border border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "الشركات النشطة" : "Active Verified Companies"}
              </p>
              <p className="mt-1 font-editorial text-3xl font-bold text-[#D4AF37] tabular-nums">
                {(stats.activeCompanies || stats.totalCompanies).toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                {countries
                  .map(
                    (c) =>
                      `${c.code}: ${stats.inventoryByCountry?.[c.code] || 0}`
                  )
                  .join(" • ")}
              </p>
            </div>

            <div className="rounded-xl bg-[#121215] p-4 border border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "إجمالي الطلبات" : "Total Campaigns"}
              </p>
              <p className="mt-1 font-editorial text-3xl font-bold text-zinc-50 tabular-nums">
                {stats.totalCampaigns}
              </p>
            </div>

            <div className="rounded-xl bg-[#121215] p-4 border border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "الإيرادات المحصلة" : "Paid Orders & Revenue"}
              </p>
              <p className="mt-1 font-editorial text-3xl font-bold text-[#D4AF37] tabular-nums">
                {stats.paidCampaigns}
              </p>
              <p className="mt-1 text-[11px] text-zinc-300 truncate">
                {revenueSummary || "0 AED"}
              </p>
            </div>

            <div className="rounded-xl bg-[#121215] p-4 border border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {lang === "ar"
                  ? "السير الذاتية المرسلة"
                  : "Total HR Emails Dispatched"}
              </p>
              <p className="mt-1 font-editorial text-3xl font-bold text-zinc-50 tabular-nums">
                {stats.totalEmailsSent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: COMPANIES & CSV BULK IMPORTER ================= */}
        {activeTab === "companies" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "رفع واستيراد الشركات (CSV)"
                      : "Bulk CSV Company Importer"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{lang === "ar" ? "نموذج CSV" : "Sample CSV"}</span>
                </button>
              </div>

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
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs font-bold text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
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
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs font-bold text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {lang === "ar" ? ind.name_ar : ind.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] p-5 text-center hover:border-[#D4AF37] transition cursor-pointer">
                <Upload className="h-6 w-6 text-[#D4AF37] mb-1.5" />
                <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                  {lang === "ar"
                    ? "اختر ملف .CSV من جهازك"
                    : "Click to upload .CSV file"}
                </span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="hidden"
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
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] p-3 font-mono text-xs text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#D4AF37] focus:bg-white dark:focus:bg-[#09090B] focus:outline-none"
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
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold cursor-pointer disabled:opacity-50"
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

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs font-mono text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#D4AF37] focus:outline-none"
                />

                <button
                  type="button"
                  disabled={seedingPack}
                  onClick={handleSeedGccExpansionPack}
                  className="btn-carbon flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-extrabold cursor-pointer disabled:opacity-50"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#09090B] py-2.5 px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer disabled:opacity-50"
                >
                  {verifyingMx ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                  )}
                  <span>
                    {lang === "ar"
                      ? "فحص خوادم البريد (Live DNS MX)"
                      : "Run Live DNS MX Verification Batch"}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Paginated Company Directory + Inventory Pills */}
            <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 space-y-5">
              {/* Industry Coverage Strip */}
              <div className="flex flex-wrap gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                {industries.map((ind) => {
                  const count = stats.inventoryByIndustry?.[ind.id] || 0;
                  const active = filterIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => {
                        setFilterIndustry(active ? "" : ind.id);
                        setCompanyPage(1);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                        active
                          ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                          : "bg-zinc-50 dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-[#D4AF37]"
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

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <Filter className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? `دليل الشركات (${totalMatchingCompanies.toLocaleString()})`
                      : `Employer Directory (${totalMatchingCompanies.toLocaleString()})`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterCountry}
                    onChange={(e) => {
                      setFilterCountry(e.target.value);
                      setCompanyPage(1);
                    }}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs font-bold text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
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
                      setFilterStatus(e.target.value);
                      setCompanyPage(1);
                    }}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs font-bold text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
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
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "بحث عن شركة أو إيميل..."
                        : "Search company or email..."
                    }
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#D4AF37] focus:bg-white dark:focus:bg-[#09090B] focus:outline-none"
                  />
                </div>
              </div>

              {loadingCompanies ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] tracking-wider uppercase">
                        <tr>
                          <th className="py-3 text-start">
                            {lang === "ar" ? "الشركة" : "Company"}
                          </th>
                          <th className="py-3 text-start">
                            {lang === "ar" ? "الموقع" : "Location"}
                          </th>
                          <th className="py-3 text-start">
                            {lang === "ar" ? "بريد الـ HR" : "HR Email"}
                          </th>
                          <th className="py-3 text-start">
                            {lang === "ar" ? "القطاع / الحالة" : "Sector"}
                          </th>
                          <th className="py-3 text-end">
                            {lang === "ar" ? "إجراء" : "Actions"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {companies.map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-zinc-50 dark:hover:bg-[#18181B] transition-colors"
                          >
                            <td className="py-3 font-bold text-zinc-950 dark:text-zinc-50">
                              {c.company_name}
                            </td>
                            <td className="py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                              {c.country_code} •{" "}
                              {lang === "ar" ? c.city_name_ar : c.city_name_en}
                            </td>
                            <td
                              dir="ltr"
                              className="py-3 font-mono font-medium text-zinc-700 dark:text-zinc-300"
                            >
                              {c.hr_email}
                            </td>
                            <td className="py-3 text-zinc-600 dark:text-zinc-400">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="truncate max-w-[130px]">
                                  {c.industry_id}
                                </span>
                                {c.is_active !== false ? (
                                  <span className="rounded-md bg-[#09090B] border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                                    MX ✓
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-red-950/20 border border-red-800/40 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                                    Disabled
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="py-3 text-end">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  title={
                                    c.is_active !== false
                                      ? "Disable company"
                                      : "Re-enable company"
                                  }
                                  onClick={() => handleToggleCompany(c)}
                                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-1.5 text-zinc-600 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer transition"
                                >
                                  <Power className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Delete company"
                                  onClick={() => handleDeleteCompany(c)}
                                  className="rounded-lg border border-red-300 dark:border-red-900/50 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition"
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
                        onClick={() =>
                          setCompanyPage((p) => Math.max(1, p - 1))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition"
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
                          setCompanyPage((p) =>
                            Math.min(companyTotalPages, p + 1)
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition"
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
        )}

        {/* ================= TAB 2: CUSTOMER CAMPAIGNS & ORDERS ================= */}
        {activeTab === "campaigns" && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "سجل طلبات العملاء وحملات التوزيع"
                  : "Customer Campaigns & EasyKash Transactions"}
              </h2>

              <div className="flex items-center gap-1.5">
                {(["all", "paid", "pending"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCampaignFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase cursor-pointer border transition ${
                      campaignFilter === st
                        ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                        : "bg-zinc-50 dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-[#D4AF37]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredCampaigns.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {lang === "ar"
                  ? "لا توجد حملات مطابقة للفلتر المحدد."
                  : "No campaigns match the selected filter."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                      <th className="pb-3 text-start">Code</th>
                      <th className="pb-3 text-start">
                        {lang === "ar" ? "المرشح" : "Candidate"}
                      </th>
                      <th className="pb-3 text-start">
                        {lang === "ar" ? "الدولة والمسار" : "Country & Plan"}
                      </th>
                      <th className="pb-3 text-start">
                        {lang === "ar" ? "المبلغ" : "Amount"}
                      </th>
                      <th className="pb-3 text-start">
                        {lang === "ar" ? "التوزيع" : "Progress"}
                      </th>
                      <th className="pb-3 text-start">
                        {lang === "ar" ? "الملف واللوحة" : "CV & Portal"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredCampaigns.map((camp) => (
                      <tr
                        key={camp.id}
                        className="hover:bg-zinc-50 dark:hover:bg-[#18181B] transition-colors"
                      >
                        <td className="py-3.5 font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          {camp.customer_reference}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-zinc-950 dark:text-zinc-50">
                            {camp.candidate_name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {camp.candidate_email}
                          </p>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-zinc-950 dark:text-zinc-100">
                            {camp.primary_country_code}
                          </span>{" "}
                          •{" "}
                          <span className="inline-block rounded bg-[#09090B] border border-zinc-800 px-2 py-0.5 uppercase text-[10px] font-extrabold text-[#D4AF37]">
                            {camp.package_id}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-zinc-950 dark:text-zinc-50">
                          {camp.amount_paid} {camp.currency}
                          <span
                            className={`ms-1.5 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${
                              camp.payment_status === "paid"
                                ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {camp.payment_status}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                          {camp.emails_sent_count}/{camp.total_target_companies}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            {camp.original_cv_url && (
                              <a
                                href={camp.original_cv_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-2.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition"
                              >
                                <FileText className="h-3 w-3 text-[#D4AF37]" />
                                <span>CV</span>
                              </a>
                            )}
                            <Link
                              href={`/track/${camp.tracking_token}`}
                              className="btn-carbon inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold"
                            >
                              <span>{lang === "ar" ? "فتح" : "Portal"}</span>
                              <ExternalLink className="h-3 w-3 text-[#D4AF37]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PRICING & ASRA3.COM WEBHOOKS ================= */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 space-y-5">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "تعديل أسعار باقات أسرع والدول الإضافية"
                  : "Asra3 Plan & Add-on Pricing per Currency"}
              </h2>

              {packages.map((pkg, pkgIdx) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm">
                      {lang === "ar" ? pkg.name_ar : pkg.name_en} (
                      {pkg.company_limit})
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSavePackagePrices(pkg)}
                      className="btn-gold inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-extrabold cursor-pointer"
                    >
                      {savingPkgId === pkg.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {savedToastPkgId === pkg.id
                          ? lang === "ar"
                            ? "✓ تم الحفظ"
                            : "✓ Saved"
                          : lang === "ar"
                          ? "حفظ"
                          : "Save"}
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    {lang === "ar" ? "سعر الباقة الأساسي:" : "Base Plan Price:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {(["AED", "SAR", "QAR", "KWD", "EGP", "USD"] as const).map(
                      (curr) => (
                        <div key={curr}>
                          <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                            {curr}
                          </label>
                          <input
                            type="number"
                            value={pkg.prices_by_currency[curr] || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPackages((prev) =>
                                prev.map((item, idx) =>
                                  idx === pkgIdx
                                    ? {
                                        ...item,
                                        prices_by_currency: {
                                          ...item.prices_by_currency,
                                          [curr]: val,
                                        },
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-2 py-1.5 text-xs font-bold text-zinc-950 dark:text-zinc-50 focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 pt-1">
                    {lang === "ar"
                      ? "سعر إضافة دولة خليجية إضافية:"
                      : "Extra Country Add-on Price:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {(["AED", "SAR", "QAR", "KWD", "EGP", "USD"] as const).map(
                      (curr) => (
                        <div key={`addon-${curr}`}>
                          <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                            +{curr}
                          </label>
                          <input
                            type="number"
                            value={
                              pkg.addon_country_price_by_currency[curr] || 0
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPackages((prev) =>
                                prev.map((item, idx) =>
                                  idx === pkgIdx
                                    ? {
                                        ...item,
                                        addon_country_price_by_currency: {
                                          ...item.addon_country_price_by_currency,
                                          [curr]: val,
                                        },
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-2 py-1.5 text-xs font-bold text-zinc-950 dark:text-zinc-50 focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                Asra3.com Production Webhooks (EasyKash & n8n)
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? "روابط الربط الرسمية الجاهزة للنطاق https://asra3.com:"
                  : "Production webhook endpoints configured for https://asra3.com:"}
              </p>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono">
                  <p className="text-[#D4AF37] font-bold mb-1">
                    1. EasyKash Payment API (Outbound):
                  </p>
                  <p>POST https://back.easykash.net/api/directpayv1/pay</p>
                </div>

                <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono">
                  <p className="text-[#D4AF37] font-bold mb-1">
                    2. EasyKash Callback Webhook URL (HMAC-SHA512):
                  </p>
                  <p>https://asra3.com/api/webhooks/easykash</p>
                </div>

                <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono">
                  <p className="text-[#D4AF37] font-bold mb-1">
                    3. Automated 12h Company Harvester Ingest (n8n):
                  </p>
                  <p>POST https://asra3.com/api/webhooks/companies-ingest</p>
                </div>

                <div className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono">
                  <p className="text-[#D4AF37] font-bold mb-1">
                    4. Self-Healing Bounce & Open Hygiene Webhook:
                  </p>
                  <p>POST https://asra3.com/api/webhooks/email-health</p>
                </div>

                <div className="rounded-xl bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 p-4 text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2 font-extrabold mb-1">
                    <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                    <span>
                      Timing-Safe HMAC-SHA512 + Amount Verification Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Verifies signatureHash + order total match + HttpOnly admin
                    cookies across all sensitive operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
