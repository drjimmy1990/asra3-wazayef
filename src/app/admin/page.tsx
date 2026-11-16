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
  SmtpAccountConfig,
} from "@/lib/types";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Pencil,
  PlusCircle,
  Power,
  Save,
  Send,
  Server,
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
    "companies" | "campaigns" | "smtp" | "settings"
  >("companies");

  // Multi-SMTP Pool & Test Dispatch state
  const [smtpAccounts, setSmtpAccounts] = useState<SmtpAccountConfig[]>([]);
  const [smtpSummary, setSmtpSummary] = useState<{
    totalAccounts: number;
    activeCount: number;
    totalDailyCapacity: number;
    sentTodayTotal: number;
  }>({
    totalAccounts: 0,
    activeCount: 0,
    totalDailyCapacity: 0,
    sentTodayTotal: 0,
  });
  const [smtpForm, setSmtpForm] = useState<{
    id: string;
    label: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from_email: string;
    from_name: string;
    daily_limit: number;
  }>({
    id: "",
    label: "",
    host: "",
    port: 465,
    secure: true,
    user: "",
    pass: "",
    from_email: "",
    from_name: "Asra3 Executive Talent Desk",
    daily_limit: 350,
  });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [testToEmail, setTestToEmail] = useState("");
  const [testAccountId, setTestAccountId] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

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
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<{
    easykashLive: boolean;
    hmacConfigured: boolean;
    currencyOverride: string | null;
    smtpActiveCount: number;
    customAdminPasscode: boolean;
    storageMode: string;
    appUrl: string;
  }>({
    easykashLive: false,
    hmacConfigured: false,
    currencyOverride: null,
    smtpActiveCount: 0,
    customAdminPasscode: false,
    storageMode: "local_docker_volume",
    appUrl: "https://asra3.com",
  });

  const copyWebhookText = (id: string, text: string) => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopiedWebhookId(id);
    setTimeout(() => setCopiedWebhookId(null), 2000);
  };

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
      if (data.systemHealth) {
        setSystemHealth((prev) => ({ ...prev, ...data.systemHealth }));
      }
    }
  }, [isUnlocked]);

  const loadSmtpAccounts = useCallback(async () => {
    if (!isUnlocked) return;
    try {
      const res = await fetch("/api/admin/smtp");
      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSmtpAccounts(data.accounts || []);
        if (data.summary) setSmtpSummary(data.summary);
      }
    } catch {
      // Ignore transient network errors
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
      loadSmtpAccounts();
    }
  }, [isUnlocked, loadAdminOverview, loadSmtpAccounts]);

  const applySmtpPreset = (preset: {
    label: string;
    host: string;
    port: number;
    secure: boolean;
    daily_limit: number;
  }) => {
    setSmtpFeedback(null);
    setSmtpForm((prev) => ({
      ...prev,
      id: "",
      label: preset.label,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      daily_limit: preset.daily_limit,
    }));
  };

  const resetSmtpForm = () => {
    setSmtpForm({
      id: "",
      label: "",
      host: "",
      port: 465,
      secure: true,
      user: "",
      pass: "",
      from_email: "",
      from_name: "Asra3 Executive Talent Desk",
      daily_limit: 350,
    });
  };

  const handleSaveSmtpAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpFeedback({
          ok: true,
          text:
            lang === "ar"
              ? "✓ تم حفظ حساب SMTP وتفعيله في محرك الإرسال التلقائي."
              : "✓ SMTP account saved and added to the active rotation pool.",
        });
        resetSmtpForm();
        await loadSmtpAccounts();
      } else {
        setSmtpFeedback({
          ok: false,
          text: data.error || "Failed to save SMTP account.",
        });
      }
    } catch {
      setSmtpFeedback({
        ok: false,
        text: "Network error while saving SMTP settings.",
      });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleEditSmtpAccount = (acc: SmtpAccountConfig) => {
    setSmtpFeedback(null);
    setSmtpForm({
      id: acc.id,
      label: acc.label,
      host: acc.host,
      port: acc.port,
      secure: acc.secure,
      user: acc.user,
      pass: "",
      from_email: acc.from_email,
      from_name: acc.from_name,
      daily_limit: acc.daily_limit,
    });
  };

  const handleToggleSmtpAccount = async (acc: SmtpAccountConfig) => {
    await fetch("/api/admin/smtp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: acc.id, is_active: !acc.is_active }),
    });
    loadSmtpAccounts();
  };

  const handleDeleteSmtpAccount = async (acc: SmtpAccountConfig) => {
    await fetch(`/api/admin/smtp?id=${encodeURIComponent(acc.id)}`, {
      method: "DELETE",
    });
    if (smtpForm.id === acc.id) resetSmtpForm();
    loadSmtpAccounts();
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testToEmail.trim()) return;
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          accountId: testAccountId || undefined,
          toEmail: testToEmail.trim(),
        }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        text: data.message || data.error || "Unknown SMTP response.",
      });
      if (data.ok) {
        loadSmtpAccounts();
      }
    } catch {
      setTestResult({
        ok: false,
        text: "Network error while testing SMTP connection.",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

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
      <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="exec-card exec-card-gold-top w-full max-w-md rounded-2xl overflow-hidden">
            <div className="exec-card-header px-8 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <Lock className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9A7B1C] dark:text-[#D4AF37]">
                ASRA3 EXECUTIVE OPERATIONS
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {lang === "ar"
                  ? "بوابة إدارة أسرع (Asra3.com)"
                  : "Asra3.com Protected Admin Center"}
              </h1>
            </div>

            <div className="p-8">
              <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {lang === "ar"
                  ? "محمية بجلسة خادم مشفرة (HttpOnly). أدخل رمز المرور الإداري للمتابعة."
                  : "Protected by server-side HttpOnly session authentication."}
              </p>

              <form onSubmit={handleUnlockSubmit} className="mt-5 space-y-4">
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
                    className="exec-input w-full rounded-xl px-4 py-3.5 text-center text-sm font-bold tracking-[0.25em]"
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
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-7">
        {/* Compact Executive Command Bar */}
        <div className="rounded-2xl bg-[#09090B] px-6 py-5 sm:px-8 sm:py-6 text-zinc-50 border border-zinc-800 border-t-[3px] border-t-[#D4AF37] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121215] px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-[#D4AF37]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  ASRA3.COM — Operations Desk
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                    systemHealth.easykashLive
                      ? "bg-[#D4AF37] border-[#D4AF37] text-[#09090B]"
                      : "bg-[#121215] border-zinc-700 text-zinc-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      systemHealth.easykashLive ? "bg-[#09090B]" : "bg-[#D4AF37]"
                    }`}
                  />
                  {systemHealth.easykashLive
                    ? "EasyKash: LIVE"
                    : "EasyKash: SANDBOX"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                    systemHealth.smtpActiveCount > 0
                      ? "bg-[#121215] border-[#D4AF37]/60 text-[#D4AF37]"
                      : "bg-[#121215] border-zinc-700 text-zinc-400"
                  }`}
                >
                  SMTP: {systemHealth.smtpActiveCount} ACTIVE
                </span>
              </div>
              <h1 className="mt-2.5 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-50">
                {lang === "ar"
                  ? "لوحة إدارة قاعدة الشركات، الحملات، وبوابة الدفع"
                  : "GCC Employer Database, Campaigns & Production Control"}
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
                  id: "smtp",
                  label:
                    lang === "ar"
                      ? "البريد والإرسال (SMTP)"
                      : "SMTP & Email",
                  icon: Mail,
                },
                {
                  id: "settings",
                  label:
                    lang === "ar"
                      ? "الأسعار وبوابة الإنتاج"
                      : "Pricing & Go-Live",
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
                        tItem.id as
                          | "companies"
                          | "campaigns"
                          | "smtp"
                          | "settings"
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
        </div>

        {/* Crisp Light/Dark 4-Column KPI Bento Row (Separated from Dark Nav Bar) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar"
                    ? "الشركات النشطة"
                    : "Active Verified Companies"}
                </p>
                <span className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                  01
                </span>
              </div>
              <p className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-[#9A7B1C] dark:text-[#D4AF37] tabular-nums">
                {(stats.activeCompanies || stats.totalCompanies).toLocaleString()}
              </p>
            </div>
            <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 truncate">
              {countries
                .map(
                  (c) => `${c.code}:${stats.inventoryByCountry?.[c.code] || 0}`
                )
                .join(" · ")}
            </div>
          </div>

          <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar" ? "إجمالي الطلبات" : "Total Campaigns"}
                </p>
                <span className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                  02
                </span>
              </div>
              <p className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                {stats.totalCampaigns}
              </p>
            </div>
            <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "تشمل المسودات والمدفوعة"
                : "Includes Paid & Pending Checkout"}
            </div>
          </div>

          <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar"
                    ? "الإيرادات المحصلة"
                    : "Paid Orders & Revenue"}
                </p>
                <span className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                  03
                </span>
              </div>
              <p className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-[#9A7B1C] dark:text-[#D4AF37] tabular-nums">
                {stats.paidCampaigns}
              </p>
            </div>
            <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-mono font-bold text-zinc-800 dark:text-zinc-300 truncate">
              {revenueSummary || "0 AED"}
            </div>
          </div>

          <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar"
                    ? "السير الذاتية المرسلة"
                    : "Total HR Emails Dispatched"}
                </p>
                <span className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                  04
                </span>
              </div>
              <p className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                {stats.totalEmailsSent.toLocaleString()}
              </p>
            </div>
            <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "متصل بمحرك Reply-To المباشر"
                : "Direct Reply-To Candidate Inbox"}
            </div>
          </div>
        </div>

        {/* ================= TAB 1: COMPANIES & CSV BULK IMPORTER ================= */}
        {activeTab === "companies" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col">
              <div className="exec-card-header px-6 py-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "رفع واستيراد الشركات (CSV)"
                      : "Bulk CSV Company Importer"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
                  <span>{lang === "ar" ? "نموذج CSV" : "Sample CSV"}</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
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
                      className="exec-input w-full rounded-xl px-3 py-2 text-xs font-bold"
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
                      className="exec-input w-full rounded-xl px-3 py-2 text-xs font-bold"
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
                    className="exec-input w-full rounded-xl p-3 font-mono text-xs placeholder:text-zinc-400"
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
                    className="exec-input w-full rounded-xl px-3 py-2 text-xs font-mono placeholder:text-zinc-400"
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] py-2.5 px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer disabled:opacity-50"
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

            {/* Right Column: Paginated Company Directory + Inventory Pills */}
            <div className="exec-card exec-card-carbon-top lg:col-span-2 rounded-2xl overflow-hidden flex flex-col">
              <div className="exec-card-header px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <Filter className="h-4 w-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
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
                    className="exec-input rounded-xl px-3 py-2 text-xs font-bold"
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
                    className="exec-input rounded-xl px-3 py-2 text-xs font-bold"
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
                    className="exec-input rounded-xl px-3 py-2 text-xs placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="p-6 space-y-5 flex-1">
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
                          setFilterIndustry(active ? "" : ind.id);
                          setCompanyPage(1);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
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
                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
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
                              <td className="px-4 py-3 font-bold text-zinc-950 dark:text-zinc-50">
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
                          onClick={() =>
                            setCompanyPage((p) => Math.max(1, p - 1))
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition"
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
        )}

        {/* ================= TAB 2: CUSTOMER CAMPAIGNS & ORDERS ================= */}
        {activeTab === "campaigns" && (
          <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden">
            <div className="exec-card-header px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "سجل طلبات العملاء وحملات التوزيع"
                    : "Customer Campaigns & EasyKash Transactions"}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                {(["all", "paid", "pending"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCampaignFilter(st)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase cursor-pointer border transition ${
                      campaignFilter === st
                        ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                        : "bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-800 hover:border-[#D4AF37]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {filteredCampaigns.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {lang === "ar"
                    ? "لا توجد حملات مطابقة للفلتر المحدد."
                    : "No campaigns match the selected filter."}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-start text-xs sm:text-sm">
                    <thead className="exec-table-head text-[11px] font-bold tracking-wider uppercase">
                      <tr>
                        <th className="px-4 py-3 text-start">Code</th>
                        <th className="px-4 py-3 text-start">
                          {lang === "ar" ? "المرشح" : "Candidate"}
                        </th>
                        <th className="px-4 py-3 text-start">
                          {lang === "ar" ? "الدولة والمسار" : "Country & Plan"}
                        </th>
                        <th className="px-4 py-3 text-start">
                          {lang === "ar" ? "المبلغ" : "Amount"}
                        </th>
                        <th className="px-4 py-3 text-start">
                          {lang === "ar" ? "التوزيع" : "Progress"}
                        </th>
                        <th className="px-4 py-3 text-end">
                          {lang === "ar" ? "الملف واللوحة" : "CV & Portal"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#121215]">
                      {filteredCampaigns.map((camp) => {
                        const pct = Math.min(
                          100,
                          Math.round(
                            (camp.emails_sent_count /
                              Math.max(1, camp.total_target_companies)) *
                              100
                          )
                        );
                        return (
                          <tr
                            key={camp.id}
                            className="even:bg-[#F8F9FB] dark:even:bg-transparent hover:bg-[#ECEEF3] dark:hover:bg-[#18181B] transition-colors"
                          >
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                              {camp.customer_reference}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-zinc-950 dark:text-zinc-50">
                                {camp.candidate_name}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {camp.candidate_email}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-zinc-950 dark:text-zinc-100">
                                {camp.primary_country_code}
                              </span>{" "}
                              •{" "}
                              <span className="inline-block rounded bg-[#09090B] border border-zinc-800 px-2 py-0.5 uppercase text-[10px] font-extrabold text-[#D4AF37]">
                                {camp.package_id}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-zinc-950 dark:text-zinc-50">
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
                            <td className="px-4 py-3.5">
                              <div className="min-w-[120px] space-y-1">
                                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 tabular-nums">
                                  {camp.emails_sent_count}/
                                  {camp.total_target_companies} ({pct}%)
                                </span>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                  <div
                                    className="h-full bg-[#D4AF37]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-end">
                              <div className="inline-flex items-center gap-2">
                                {camp.original_cv_url && (
                                  <a
                                    href={camp.original_cv_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-2.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition"
                                  >
                                    <FileText className="h-3 w-3 text-[#9A7B1C] dark:text-[#D4AF37]" />
                                    <span>CV</span>
                                  </a>
                                )}
                                <Link
                                  href={`/track/${camp.tracking_token}`}
                                  className="btn-carbon inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold"
                                >
                                  <span>
                                    {lang === "ar" ? "فتح" : "Portal"}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-[#D4AF37]" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: MULTI-SMTP POOL & DIRECT HR DISPATCH ================= */}
        {activeTab === "smtp" && (
          <div className="space-y-6">
            {/* Top Status & Architecture Strip */}
            <div className="exec-card exec-card-gold-top rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        smtpSummary.activeCount > 0
                          ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                          : "bg-zinc-100 dark:bg-[#09090B] border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      <Server className="h-3 w-3" />
                      {smtpSummary.activeCount > 0
                        ? lang === "ar"
                          ? `محرك SMTP المباشر مفعل (${smtpSummary.activeCount} حساب نشط)`
                          : `Live Multi-SMTP Dispatch Active (${smtpSummary.activeCount} Active)`
                        : lang === "ar"
                        ? "وضع المحاكاة (أضف حساب SMTP لتفعيل الإرسال الفعلي)"
                        : "Sandbox Mode (Add an SMTP Server to Go Live)"}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "إدارة خوادم البريد (Multi-SMTP Rotation) وإرفاق السيرة الذاتية تلقائياً"
                      : "Built-In Multi-SMTP Rotation Pool & Direct CV Attachment Engine"}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                    {lang === "ar"
                      ? "يعمل الإرسال مباشرة من داخل حاوية Docker دون الحاجة لأي خدمات خارجية: يتم إرفاق ملف PDF/DOCX الأصلي للمرشح، وتوجيه ردود الـ HR مباشرة لبريد المرشح (Reply-To)، مع التبديل التلقائي (Round-Robin) بين جميع حسابات SMTP المضافة لحماية سمعة النطاق."
                      : "Emails dispatch natively inside your Docker container: attaches the candidate's uploaded PDF/DOCX CV, sets Reply-To directly to the candidate's personal inbox, tracks opens via 1x1 pixel, and round-robins across all active SMTP accounts with automatic daily quota limits."}
                  </p>
                </div>

                <div className="rounded-xl bg-[#09090B] border border-zinc-800 px-5 py-3.5 text-end">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {lang === "ar"
                      ? "السعة اليومية المستخدمة"
                      : "Daily Pool Quota Used"}
                  </p>
                  <p className="mt-1 font-editorial text-2xl font-bold text-[#D4AF37] tabular-nums">
                    {smtpSummary.sentTodayTotal.toLocaleString()} /{" "}
                    {smtpSummary.totalDailyCapacity.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Add / Edit SMTP Account Form + 1-Click Presets */}
              <div className="exec-card exec-card-carbon-top lg:col-span-5 rounded-2xl overflow-hidden flex flex-col">
                <div className="exec-card-header px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                      {smtpForm.id
                        ? lang === "ar"
                          ? "تعديل بيانات خادم SMTP"
                          : "Edit SMTP Mailer"
                        : lang === "ar"
                        ? "إضافة حساب SMTP جديد"
                        : "Add SMTP Server to Pool"}
                    </h3>
                  </div>
                  {smtpForm.id && (
                    <button
                      type="button"
                      onClick={resetSmtpForm}
                      className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] cursor-pointer"
                    >
                      {lang === "ar" ? "إلغاء التعديل" : "Cancel Edit"}
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* 1-Click Provider Presets */}
                  <div className="exec-well rounded-xl p-3.5">
                    <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                      {lang === "ar"
                        ? "قوالب إعداد سريع بنقرة واحدة:"
                        : "1-Click Provider Presets:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        {
                          name: "Hostinger",
                          label: "Hostinger Business Mail",
                          host: "smtp.hostinger.com",
                          port: 465,
                          secure: true,
                          daily_limit: 400,
                        },
                        {
                          name: "Brevo SMTP",
                          label: "Brevo Transactional Relay",
                          host: "smtp-relay.brevo.com",
                          port: 587,
                          secure: false,
                          daily_limit: 2500,
                        },
                        {
                          name: "Amazon SES",
                          label: "Amazon SES (ME-Central)",
                          host: "email-smtp.me-central-1.amazonaws.com",
                          port: 587,
                          secure: false,
                          daily_limit: 5000,
                        },
                        {
                          name: "Google Workspace",
                          label: "Google Workspace / Gmail App",
                          host: "smtp.gmail.com",
                          port: 465,
                          secure: true,
                          daily_limit: 450,
                        },
                        {
                          name: "Zoho Mail",
                          label: "Zoho Workplace Mail",
                          host: "smtp.zoho.com",
                          port: 465,
                          secure: true,
                          daily_limit: 350,
                        },
                        {
                          name: "aaPanel Mail",
                          label: "aaPanel Postfix Mail Server",
                          host: "mail.asra3.com",
                          port: 465,
                          secure: true,
                          daily_limit: 500,
                        },
                      ].map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => applySmtpPreset(p)}
                          className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121215] px-2.5 py-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] transition cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSaveSmtpAccount} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        {lang === "ar"
                          ? "اسم تعريفي للحساب"
                          : "Account Label"}
                      </label>
                      <input
                        type="text"
                        value={smtpForm.label}
                        onChange={(e) =>
                          setSmtpForm((f) => ({ ...f, label: e.target.value }))
                        }
                        placeholder="Primary Dispatch #1 (talent@asra3.com)"
                        className="exec-input w-full rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          SMTP Host *
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          required
                          value={smtpForm.host}
                          onChange={(e) =>
                            setSmtpForm((f) => ({ ...f, host: e.target.value }))
                          }
                          placeholder="smtp.hostinger.com"
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Port *
                        </label>
                        <input
                          type="number"
                          dir="ltr"
                          required
                          value={smtpForm.port}
                          onChange={(e) => {
                            const nextPort = Number(e.target.value);
                            setSmtpForm((f) => ({
                              ...f,
                              port: nextPort,
                              secure: nextPort === 465 ? true : f.secure,
                            }));
                          }}
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="exec-well flex items-center justify-between rounded-xl px-3.5 py-2.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {lang === "ar"
                          ? "وضع التشفير (SSL 465 / STARTTLS 587)"
                          : "Encryption Mode"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSmtpForm((f) => ({ ...f, secure: true, port: 465 }))
                          }
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border cursor-pointer transition ${
                            smtpForm.secure
                              ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                              : "bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          SSL (465)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSmtpForm((f) => ({
                              ...f,
                              secure: false,
                              port: f.port === 465 ? 587 : f.port,
                            }))
                          }
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border cursor-pointer transition ${
                            !smtpForm.secure
                              ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                              : "bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          STARTTLS (587)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          {lang === "ar"
                            ? "اسم المستخدم / الإيميل *"
                            : "SMTP Username *"}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          required
                          value={smtpForm.user}
                          onChange={(e) =>
                            setSmtpForm((f) => ({ ...f, user: e.target.value }))
                          }
                          placeholder="talent@asra3.com"
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          {smtpForm.id
                            ? lang === "ar"
                              ? "كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)"
                              : "Password (blank = keep current)"
                            : lang === "ar"
                            ? "كلمة المرور / App Key *"
                            : "SMTP Password / App Key *"}
                        </label>
                        <input
                          type="password"
                          dir="ltr"
                          required={!smtpForm.id}
                          value={smtpForm.pass}
                          onChange={(e) =>
                            setSmtpForm((f) => ({ ...f, pass: e.target.value }))
                          }
                          placeholder="••••••••••••"
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          {lang === "ar"
                            ? "بريد المرسل (From Email)"
                            : "From Email (Sender)"}
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={smtpForm.from_email}
                          onChange={(e) =>
                            setSmtpForm((f) => ({
                              ...f,
                              from_email: e.target.value,
                            }))
                          }
                          placeholder="talent@asra3.com"
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          {lang === "ar"
                            ? "الحد اليومي الآمن للرسائل"
                            : "Safe Daily Limit"}
                        </label>
                        <input
                          type="number"
                          dir="ltr"
                          min={10}
                          max={50000}
                          value={smtpForm.daily_limit}
                          onChange={(e) =>
                            setSmtpForm((f) => ({
                              ...f,
                              daily_limit: Number(e.target.value),
                            }))
                          }
                          className="exec-input w-full rounded-xl px-3 py-2 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        {lang === "ar"
                          ? "اسم المرسل الظاهر لدى مسؤول التوظيف (From Name)"
                          : "Sender Display Name (From Name)"}
                      </label>
                      <input
                        type="text"
                        value={smtpForm.from_name}
                        onChange={(e) =>
                          setSmtpForm((f) => ({
                            ...f,
                            from_name: e.target.value,
                          }))
                        }
                        placeholder="Asra3 Executive Talent Desk"
                        className="exec-input w-full rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {smtpFeedback && (
                      <div
                        className={`rounded-xl border p-3 text-xs font-bold ${
                          smtpFeedback.ok
                            ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {smtpFeedback.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={savingSmtp}
                      className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold cursor-pointer disabled:opacity-50"
                    >
                      {savingSmtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="h-4 w-4" />
                      )}
                      <span>
                        {smtpForm.id
                          ? lang === "ar"
                            ? "تحديث بيانات خادم SMTP"
                            : "Update SMTP Account"
                          : lang === "ar"
                          ? "حفظ وإضافة لأسطول الإرسال"
                          : "Save & Activate SMTP Mailer"}
                      </span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Live Test Dispatch + Active SMTP Accounts Pool */}
              <div className="lg:col-span-7 space-y-6">
                {/* Live Test Email Card */}
                <div className="exec-card rounded-2xl overflow-hidden">
                  <div className="exec-card-header px-6 py-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                        {lang === "ar"
                          ? "فحص الاتصال وإرسال رسالة تجريبية فورية"
                          : "Verify SMTP Connection & Send Live Test Email"}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {lang === "ar"
                          ? "تأكد من وصول الرسائل لصندوق الوارد (Inbox) قبل إطلاق الحملات."
                          : "Tests authentication (SMTP AUTH) and delivers a real verification email to your inbox."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <form
                      onSubmit={handleSendTestEmail}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5"
                    >
                      <select
                        value={testAccountId}
                        onChange={(e) => setTestAccountId(e.target.value)}
                        className="exec-input sm:col-span-4 rounded-xl px-3 py-2.5 text-xs font-bold"
                      >
                        <option value="">
                          {lang === "ar"
                            ? "تلقائي (أول حساب نشط)"
                            : "Auto (First Active Mailer)"}
                        </option>
                        {smtpAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="email"
                        dir="ltr"
                        required
                        value={testToEmail}
                        onChange={(e) => setTestToEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="exec-input sm:col-span-5 rounded-xl px-3.5 py-2.5 font-mono text-xs"
                      />

                      <button
                        type="submit"
                        disabled={testingSmtp || smtpAccounts.length === 0}
                        className="btn-gold sm:col-span-3 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-50"
                      >
                        {testingSmtp ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {lang === "ar" ? "إرسال تجريبي" : "Send Test"}
                        </span>
                      </button>
                    </form>

                    {testResult && (
                      <div
                        dir="ltr"
                        className={`rounded-xl border p-3.5 font-mono text-xs ${
                          testResult.ok
                            ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {testResult.text}
                      </div>
                    )}
                  </div>
                </div>

                {/* Configured SMTP Pool List */}
                <div className="exec-card rounded-2xl overflow-hidden">
                  <div className="exec-card-header px-6 py-4 flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                      {lang === "ar"
                        ? `خوادم SMTP المربوطة (${smtpAccounts.length})`
                        : `Configured SMTP Rotation Pool (${smtpAccounts.length})`}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                      .data/smtp-accounts.json
                    </span>
                  </div>

                  <div className="p-6">
                    {smtpAccounts.length === 0 ? (
                      <div className="exec-well rounded-xl border-dashed p-8 text-center space-y-2">
                        <Mail className="mx-auto h-7 w-7 text-[#9A7B1C] dark:text-[#D4AF37]" />
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {lang === "ar"
                            ? "لم تتم إضافة أي خادم SMTP بعد"
                            : "No SMTP Mailers Added Yet"}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                          {lang === "ar"
                            ? "اختر قالباً جاهزاً من النموذج الجانبي (Hostinger أو Brevo أو SES أو Gmail App Password) أو أضف متغيرات SMTP_HOST في ملف .env على الخادم."
                            : "Select a 1-click provider preset on the left (Hostinger, Brevo, SES, Google Workspace, or aaPanel Mail) or define SMTP_HOST in your VPS .env file."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {smtpAccounts.map((acc) => {
                          const pct = Math.min(
                            100,
                            Math.round(
                              ((acc.sent_today || 0) /
                                Math.max(1, acc.daily_limit)) *
                                100
                            )
                          );
                          return (
                            <div
                              key={acc.id}
                              className="exec-well rounded-xl p-4 space-y-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                                      {acc.label}
                                    </span>
                                    <span
                                      className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                        acc.is_active
                                          ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                                          : "bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                      }`}
                                    >
                                      {acc.is_active
                                        ? lang === "ar"
                                          ? "نشط"
                                          : "Active"
                                        : lang === "ar"
                                        ? "متوقف"
                                        : "Paused"}
                                    </span>
                                  </div>
                                  <p
                                    dir="ltr"
                                    className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                                  >
                                    {acc.host}:{acc.port} (
                                    {acc.secure ? "SSL" : "STARTTLS"}) • From:{" "}
                                    {acc.from_name} &lt;{acc.from_email}&gt;
                                  </p>
                                </div>

                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    title="Edit SMTP account"
                                    onClick={() => handleEditSmtpAccount(acc)}
                                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] cursor-pointer transition"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title={
                                      acc.is_active
                                        ? "Pause mailer"
                                        : "Enable mailer"
                                    }
                                    onClick={() => handleToggleSmtpAccount(acc)}
                                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer transition"
                                  >
                                    <Power className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete mailer"
                                    onClick={() => handleDeleteSmtpAccount(acc)}
                                    className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#121215] p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Flat solid gold daily quota bar (zero gradients) */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                                  <span>
                                    {lang === "ar"
                                      ? "الإرسال اليومي (تصفير تلقائي UTC)"
                                      : "Sent Today (Auto-resets 00:00 UTC)"}
                                  </span>
                                  <span className="font-mono text-zinc-900 dark:text-zinc-200 tabular-nums">
                                    {acc.sent_today} / {acc.daily_limit} ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                  <div
                                    className="h-full bg-[#D4AF37] transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PRICING, GATEWAY & PRODUCTION GO-LIVE ================= */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col">
              <div className="exec-card-header px-6 py-4">
                <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "تعديل أسعار باقات أسرع والدول الإضافية"
                    : "Asra3 Plan & Add-on Pricing per Currency"}
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {packages.map((pkg, pkgIdx) => (
                  <div
                    key={pkg.id}
                    className="exec-well rounded-xl p-4 space-y-3"
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
                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
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
                              className="exec-input w-full rounded-lg px-2 py-1.5 text-xs font-bold"
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
                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
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
                              className="exec-input w-full rounded-lg px-2 py-1.5 text-xs font-bold"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Production Go-Live Readiness Checklist + Copyable Webhooks */}
            <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden flex flex-col">
              <div className="exec-card-header px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "جاهزية الإطلاق الفعلي (EasyKash & Webhooks)"
                      : "Production Go-Live Readiness & EasyKash"}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Live Server Diagnostics Matrix */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {lang === "ar"
                      ? "فحص جاهزية البيئة الحالية بالخادم:"
                      : "Live Server Environment Diagnostics:"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        label: lang === "ar" ? "بوابة EasyKash API Key" : "EasyKash DirectPayV1 API Key",
                        ready: systemHealth.easykashLive,
                        readyText: "LIVE",
                        pendingText: "SANDBOX (.env needed)",
                      },
                      {
                        label: lang === "ar" ? "توقيع EasyKash HMAC-SHA512" : "EasyKash HMAC-SHA512 Verification",
                        ready: systemHealth.hmacConfigured,
                        readyText: "ACTIVE",
                        pendingText: "SET EASYKASH_HMAC_SECRET",
                      },
                      {
                        label: lang === "ar" ? "خوادم إرسال البريد (Multi-SMTP)" : "Built-In Multi-SMTP Dispatch Pool",
                        ready: systemHealth.smtpActiveCount > 0,
                        readyText: `${systemHealth.smtpActiveCount} ACTIVE`,
                        pendingText: "ADD IN SMTP TAB",
                      },
                      {
                        label: lang === "ar" ? "كلمة مرور الإدارة" : "Custom Production Admin Passcode",
                        ready: systemHealth.customAdminPasscode,
                        readyText: "HARDENED",
                        pendingText: "USING DEFAULT (change in .env)",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="exec-well flex items-center justify-between rounded-xl px-4 py-2.5 text-xs"
                      >
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {item.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase ${
                            item.ready
                              ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                              : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {item.ready ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {item.ready ? item.readyText : item.pendingText}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    Currency Mode:{" "}
                    {systemHealth.currencyOverride ||
                      "Dynamic GCC (AED / SAR / QAR / KWD)"}{" "}
                    • Storage: {systemHealth.storageMode}
                  </p>
                </div>

                {/* Copyable Production Webhook Endpoints */}
                <div className="space-y-3 text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {lang === "ar"
                      ? `روابط الربط الرسمية لوضعها في لوحة EasyKash:`
                      : `Endpoints Configured for ${systemHealth.appUrl}:`}
                  </p>

                  {[
                    {
                      id: "ek-callback",
                      title: "1. EasyKash Callback / Webhook URL (HMAC-SHA512):",
                      url: `${systemHealth.appUrl}/api/webhooks/easykash`,
                      copyable: true,
                    },
                    {
                      id: "ek-api",
                      title: "2. EasyKash Payment API (Outbound):",
                      url: "https://back.easykash.net/api/directpayv1/pay",
                      copyable: false,
                    },
                    {
                      id: "n8n-ingest",
                      title: "3. Company Harvester Ingest (POST Webhook):",
                      url: `${systemHealth.appUrl}/api/webhooks/companies-ingest`,
                      copyable: true,
                    },
                    {
                      id: "n8n-health",
                      title: "4. Bounce & Email Hygiene (POST Webhook):",
                      url: `${systemHealth.appUrl}/api/webhooks/email-health`,
                      copyable: true,
                    },
                  ].map((ep) => (
                    <div
                      key={ep.id}
                      className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[#D4AF37] font-bold mb-1 font-sans text-xs">
                          {ep.title}
                        </p>
                        <p dir="ltr" className="truncate">
                          {ep.url}
                        </p>
                      </div>
                      {ep.copyable && (
                        <button
                          type="button"
                          onClick={() => copyWebhookText(ep.id, ep.url)}
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#18181B] border border-zinc-700 px-2.5 py-1.5 text-[11px] font-sans font-bold text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition"
                        >
                          {copiedWebhookId === ep.id ? (
                            <Check className="h-3.5 w-3.5 text-[#D4AF37]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[#D4AF37]" />
                          )}
                          <span>
                            {copiedWebhookId === ep.id
                              ? lang === "ar"
                                ? "نُسخ"
                                : "Copied"
                              : lang === "ar"
                              ? "نسخ"
                              : "Copy"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
