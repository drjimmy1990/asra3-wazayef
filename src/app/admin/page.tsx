"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AdminJobsManagerTab } from "@/components/AdminJobsManagerTab";
import { AdminOgTemplatesPanel } from "@/components/AdminOgTemplatesPanel";
import { AdminLeadsTab } from "@/components/AdminLeadsTab";
import { AdminOverviewSection } from "@/components/admin/AdminOverviewSection";
import { AdminCampaignsSection } from "@/components/admin/AdminCampaignsSection";
import { AdminCompaniesSection } from "@/components/admin/AdminCompaniesSection";
import { AdminSmtpSection } from "@/components/admin/AdminSmtpSection";
import { AdminPricingSection } from "@/components/admin/AdminPricingSection";
import { AdminSystemSection } from "@/components/admin/AdminSystemSection";
import {
  AdminSectionId,
  AdminStats,
  AdminSystemHealth,
  SmtpSummary,
} from "@/components/admin/admin-types";
import {
  DEFAULT_OG_JOB_TEMPLATE,
  isValidOgJobTemplateId,
  OgJobTemplateId,
} from "@/lib/og-template-catalog";
import {
  LiveSignalEqualizer,
  ScrollProgressRail,
} from "@/components/MotionPrimitives";
import { useApp } from "@/context/AppContext";
import {
  CampaignRecord,
  CompanyRecord,
  CouponRecord,
  OfferSettings,
  PackageTier,
  SmtpAccountConfig,
} from "@/lib/types";
import {
  BriefcaseBusiness,
  Building2,
  Headphones,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

interface NavItemConfig {
  id: AdminSectionId;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroupConfig {
  titleAr: string;
  titleEn: string;
  items: NavItemConfig[];
}

export default function AdminDashboardPage() {
  const { lang, countries, industries } = useApp();

  // Server-verified HttpOnly session state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeSection, setActiveSection] =
    useState<AdminSectionId>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [offerSettingsState, setOfferSettingsState] = useState<
    OfferSettings | undefined
  >(undefined);
  const [couponsState, setCouponsState] = useState<CouponRecord[] | undefined>(
    undefined
  );
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [syncingNow, setSyncingNow] = useState(false);

  // Multi-SMTP Pool state
  const [smtpAccounts, setSmtpAccounts] = useState<SmtpAccountConfig[]>([]);
  const [smtpSummary, setSmtpSummary] = useState<SmtpSummary>({
    totalAccounts: 0,
    activeCount: 0,
    totalDailyCapacity: 0,
    sentTodayTotal: 0,
  });

  // Paginated Companies state
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

  // Campaigns, Packages, OG Template & Health state
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [packages, setPackages] = useState<PackageTier[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalCampaigns: 0,
    paidCampaigns: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalEmailsSent: 0,
    inventoryByCountry: {},
    inventoryByIndustry: {},
    revenueByCurrency: {},
  });
  const [ogTemplate, setOgTemplate] = useState<OgJobTemplateId>(
    DEFAULT_OG_JOB_TEMPLATE
  );
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth>({
    easykashLive: false,
    hmacConfigured: false,
    currencyOverride: null,
    smtpActiveCount: 0,
    customAdminPasscode: false,
    storageMode: "local_docker_volume",
    appUrl: "https://asra3.com",
  });

  // Verify HttpOnly session on mount
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

  // Close mobile sidebar on Escape
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

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

  const loadAdminOverview = useCallback(
    async (options?: { preserveSettingsDraft?: boolean }) => {
      if (!isUnlocked) return;
      const res = await fetch("/api/admin/campaigns", { cache: "no-store" });
      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        if (data.stats) setStats((prev) => ({ ...prev, ...data.stats }));
        if (!options?.preserveSettingsDraft) {
          if (data.packages) setPackages(data.packages);
          if (data.offerSettings) setOfferSettingsState(data.offerSettings);
        }
        if (isValidOgJobTemplateId(data.ogTemplate)) {
          setOgTemplate(data.ogTemplate);
        }
        if (Array.isArray(data.coupons)) setCouponsState(data.coupons);
        if (typeof data.newSupportLeadsCount === "number") {
          setNewLeadsCount(data.newSupportLeadsCount);
        }
        if (data.systemHealth) {
          setSystemHealth((prev) => ({ ...prev, ...data.systemHealth }));
        }
        setLastSyncedAt(
          new Date().toLocaleTimeString("en-GB", { hour12: false })
        );
      }
    },
    [isUnlocked]
  );

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

  const handleManualSync = useCallback(async () => {
    if (!isUnlocked) return;
    setSyncingNow(true);
    try {
      await Promise.all([
        loadAdminOverview(),
        loadSmtpAccounts(),
        loadCompanies(),
      ]);
    } finally {
      setSyncingNow(false);
    }
  }, [isUnlocked, loadAdminOverview, loadSmtpAccounts, loadCompanies]);

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

  useEffect(() => {
    if (!isUnlocked || !autoRefresh) return;
    const poll = window.setInterval(() => {
      void loadAdminOverview({ preserveSettingsDraft: true });
      void loadSmtpAccounts();
    }, 15000);
    return () => window.clearInterval(poll);
  }, [isUnlocked, autoRefresh, loadAdminOverview, loadSmtpAccounts]);

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
    setMobileSidebarOpen(false);
  };

  const navGroups: NavGroupConfig[] = [
    {
      titleAr: "العمليات الرئيسية",
      titleEn: "Operations",
      items: [
        {
          id: "overview",
          labelAr: "نظرة عامة",
          labelEn: "Overview",
          descAr: "ملخص الأداء المباشر، صحة النظام، وأحدث الحملات",
          descEn: "Live metrics summary, system pulse & recent customer activity",
          icon: LayoutDashboard,
        },
        {
          id: "campaigns",
          labelAr: "حملات العملاء",
          labelEn: "Campaigns",
          descAr: "متابعة الطلبات، مدفوعات EasyKash، وتقدم الإرسال",
          descEn: "Customer orders, EasyKash transactions & dispatch progress",
          icon: Users,
          badge: `${stats.paidCampaigns}/${stats.totalCampaigns}`,
        },
        {
          id: "leads",
          labelAr: "الدعم والتواصل",
          labelEn: "Support Leads",
          descAr: "استفسارات الزوار وتذاكر المتابعة من نافذة الدعم",
          descEn: "Incoming candidate inquiries and support lead tickets",
          icon: Headphones,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
        },
      ],
    },
    {
      titleAr: "الشركات والوظائف",
      titleEn: "Employer & Jobs",
      items: [
        {
          id: "companies",
          labelAr: "الشركات و CSV",
          labelEn: "Companies & CSV",
          descAr: "استيراد ملفات CSV، حصاد تليجرام، وفحص خوادم MX",
          descEn: "Bulk CSV uploader, Telegram harvester & DNS MX hygiene",
          icon: Building2,
          badge: (stats.activeCompanies || stats.totalCompanies).toLocaleString(),
        },
        {
          id: "jobs",
          labelAr: "الوظائف وقوالب النشر",
          labelEn: "Jobs & Social Art",
          descAr: "إدارة إعلانات الوظائف، طلبات الشركات، وقوالب الـ OG",
          descEn: "Job board moderation, employer posts & social OG templates",
          icon: BriefcaseBusiness,
        },
      ],
    },
    {
      titleAr: "الأسعار والعروض",
      titleEn: "Revenue",
      items: [
        {
          id: "pricing",
          labelAr: "الباقات والكوبونات",
          labelEn: "Pricing & Promos",
          descAr: "أسعار العملات الخليجية، مؤقت العرض، وأكواد الخصم",
          descEn: "GCC currency pricing tiers, offer timer & discount coupons",
          icon: Settings,
        },
      ],
    },
    {
      titleAr: "البنية التحتية",
      titleEn: "Infrastructure",
      items: [
        {
          id: "smtp",
          labelAr: "خوادم البريد (SMTP)",
          labelEn: "SMTP Pool",
          descAr: "تدوير حسابات الإرسال المباشر واختبار صندوق الوارد",
          descEn: "Multi-SMTP rotation pool, daily quotas & live inbox test",
          icon: Mail,
          badge: smtpSummary.activeCount,
        },
        {
          id: "system",
          labelAr: "النظام و Webhooks",
          labelEn: "System & Webhooks",
          descAr: "تشخيص متغيرات البيئة وروابط الربط مع EasyKash و n8n",
          descEn: "Environment readiness diagnostics & production webhooks",
          icon: ShieldCheck,
          badge: systemHealth.easykashLive ? "LIVE" : "TEST",
        },
      ],
    },
  ];

  const flatNavItems = navGroups.flatMap((g) => g.items);
  const currentSectionMeta =
    flatNavItems.find((i) => i.id === activeSection) || flatNavItems[0];

  const handleSelectSection = (id: AdminSectionId) => {
    setActiveSection(id);
    setMobileSidebarOpen(false);
  };

  const renderSidebarNavigation = () => (
    <div className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.titleEn} className="space-y-1.5">
          <p className="px-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
            {lang === "ar" ? group.titleAr : group.titleEn}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSection(item.id)}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition cursor-pointer touch-manipulation ${
                    active
                      ? "bg-[#D4AF37] text-[#09090B]"
                      : "bg-transparent text-zinc-300 hover:bg-[#16161A] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-[#09090B]" : "text-[#D4AF37]"
                      }`}
                    />
                    <span className="truncate">
                      {lang === "ar" ? item.labelAr : item.labelEn}
                    </span>
                  </span>

                  {item.badge !== undefined && (
                    <span
                      dir="ltr"
                      className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-extrabold ${
                        active
                          ? "bg-[#09090B] text-[#D4AF37]"
                          : "bg-[#18181B] border border-zinc-700 text-zinc-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleLockAdmin}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#18181B] border border-red-900/60 px-3.5 py-2 text-xs font-extrabold text-red-400 hover:border-red-500 transition cursor-pointer touch-manipulation"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{lang === "ar" ? "تسجيل خروج" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

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
              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-950 dark:text-[#D4AF37]">
                ASRA3 EXECUTIVE OPERATIONS
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {lang === "ar"
                  ? "بوابة إدارة أسرع (Asra3.com)"
                  : "Asra3.com Protected Admin Center"}
              </h1>
            </div>

            <div className="p-6 sm:p-8">
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
                    className="exec-input w-full min-h-[48px] rounded-xl px-4 py-3 text-center text-base sm:text-sm font-bold tracking-[0.25em]"
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
                  className="btn-gold flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold cursor-pointer disabled:opacity-60 touch-manipulation"
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

  return (
    <div className="min-h-screen flex flex-col bg-arch-grid bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <ScrollProgressRail />
      <Navbar />

      <main
        id="main-content"
        className="mx-auto max-w-[1440px] w-full px-4 py-5 sm:py-7 sm:px-6 lg:px-8 space-y-5"
      >
        {/* Mobile Section Switcher & Live Sync Bar (< lg) */}
        <div className="lg:hidden rounded-2xl bg-[#09090B] border border-zinc-800 border-t-[3px] border-t-[#D4AF37] p-4 text-zinc-50 space-y-3 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D4AF37]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                ASRA3 OPERATIONS DESK
              </span>
              <h1 className="text-base font-extrabold text-white truncate">
                {lang === "ar"
                  ? currentSectionMeta.labelAr
                  : currentSectionMeta.labelEn}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              aria-expanded={mobileSidebarOpen}
              className="btn-gold inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold cursor-pointer touch-manipulation"
            >
              {mobileSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span>{lang === "ar" ? "الأقسام" : "Sections"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                autoRefresh
                  ? "bg-[#121215] border-[#D4AF37]/50 text-[#D4AF37]"
                  : "bg-[#121215] border-zinc-800 text-zinc-400"
              }`}
            >
              {autoRefresh && <span className="gold-beacon" />}
              <span>
                {autoRefresh
                  ? `LIVE 15s${lastSyncedAt ? ` · ${lastSyncedAt}` : ""}`
                  : `PAUSED${lastSyncedAt ? ` · ${lastSyncedAt}` : ""}`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncingNow}
              className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-zinc-800 bg-[#121215] px-3 py-1 text-[10px] font-bold text-zinc-300 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${syncingNow ? "animate-spin" : ""}`}
              />
              <span>{lang === "ar" ? "تحديث" : "Sync"}</span>
            </button>
          </div>

          {mobileSidebarOpen && (
            <div className="pt-3 border-t border-zinc-800">
              {renderSidebarNavigation()}
            </div>
          )}
        </div>

        {/* Desktop Modular Sidebar + Workspace Shell */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Sticky Categorized Sidebar (Desktop lg+) */}
          <aside className="hidden lg:block w-64 shrink-0 lg:sticky lg:top-20 rounded-2xl bg-[#09090B] border border-zinc-800 border-t-[3px] border-t-[#D4AF37] p-4 text-zinc-50 shadow-lg">
            <div className="pb-4 mb-4 border-b border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>ASRA3 OPERATIONS</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-extrabold ${
                    systemHealth.easykashLive
                      ? "bg-[#D4AF37] text-[#09090B]"
                      : "bg-[#18181B] border border-zinc-700 text-zinc-300"
                  }`}
                >
                  {systemHealth.easykashLive ? "EK: LIVE" : "EK: TEST"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded bg-[#121215] border border-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-[#D4AF37]">
                  {systemHealth.smtpActiveCount > 0 && <LiveSignalEqualizer />}
                  <span>SMTP:{systemHealth.smtpActiveCount}</span>
                </span>
              </div>
            </div>

            {renderSidebarNavigation()}
          </aside>

          {/* Main Active Section Workspace */}
          <div className="min-w-0 flex-1 w-full space-y-6">
            {/* Desktop Active Section Header & Sync Controls */}
            <div className="hidden lg:flex rounded-2xl bg-[#09090B] px-6 py-4 text-zinc-50 border border-zinc-800 items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  {lang === "ar"
                    ? currentSectionMeta.labelAr
                    : currentSectionMeta.labelEn}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {lang === "ar"
                    ? currentSectionMeta.descAr
                    : currentSectionMeta.descEn}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAutoRefresh((prev) => !prev)}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    autoRefresh
                      ? "bg-[#121215] border-[#D4AF37]/50 text-[#D4AF37]"
                      : "bg-[#121215] border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={
                    lang === "ar"
                      ? "تبديل التحديث التلقائي كل 15 ثانية"
                      : "Toggle 15s live auto-sync"
                  }
                >
                  {autoRefresh && <span className="gold-beacon" />}
                  <span>
                    {autoRefresh
                      ? `LIVE 15s${lastSyncedAt ? ` · ${lastSyncedAt}` : ""}`
                      : `PAUSED${lastSyncedAt ? ` · ${lastSyncedAt}` : ""}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={syncingNow}
                  aria-label={lang === "ar" ? "تحديث البيانات" : "Refresh data"}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#121215] px-3 py-1.5 text-xs font-bold text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${syncingNow ? "animate-spin" : ""}`}
                  />
                  <span>{lang === "ar" ? "تحديث" : "Sync"}</span>
                </button>
              </div>
            </div>

            {activeSection === "overview" && (
              <AdminOverviewSection
                lang={lang}
                countries={countries}
                industries={industries}
                stats={stats}
                campaigns={campaigns}
                systemHealth={systemHealth}
                smtpSummary={smtpSummary}
                newLeadsCount={newLeadsCount}
                onNavigate={setActiveSection}
              />
            )}

            {activeSection === "campaigns" && (
              <AdminCampaignsSection lang={lang} campaigns={campaigns} />
            )}

            {activeSection === "leads" && (
              <AdminLeadsTab onNewCountChange={setNewLeadsCount} />
            )}

            {activeSection === "companies" && (
              <AdminCompaniesSection
                lang={lang}
                countries={countries}
                industries={industries}
                stats={stats}
                companies={companies}
                totalMatchingCompanies={totalMatchingCompanies}
                companyPage={companyPage}
                companyTotalPages={companyTotalPages}
                filterCountry={filterCountry}
                filterIndustry={filterIndustry}
                filterStatus={filterStatus}
                searchInput={searchInput}
                loadingCompanies={loadingCompanies}
                onPageChange={setCompanyPage}
                onFilterCountryChange={setFilterCountry}
                onFilterIndustryChange={setFilterIndustry}
                onFilterStatusChange={setFilterStatus}
                onSearchInputChange={setSearchInput}
                onRefreshAll={() => {
                  loadCompanies();
                  loadAdminOverview();
                }}
              />
            )}

            {activeSection === "jobs" && (
              <div className="animate-panel-enter space-y-6">
                <AdminJobsManagerTab appUrl={systemHealth.appUrl} />
                <AdminOgTemplatesPanel
                  lang={lang}
                  activeTemplate={ogTemplate}
                  onTemplateUpdated={(next) => setOgTemplate(next)}
                />
              </div>
            )}

            {activeSection === "pricing" && (
              <AdminPricingSection
                lang={lang}
                offerSettings={offerSettingsState}
                coupons={couponsState}
                packages={packages}
                onPackagesChange={setPackages}
                onOverviewReload={loadAdminOverview}
              />
            )}

            {activeSection === "smtp" && (
              <AdminSmtpSection
                lang={lang}
                smtpAccounts={smtpAccounts}
                smtpSummary={smtpSummary}
                onRefreshSmtp={loadSmtpAccounts}
              />
            )}

            {activeSection === "system" && (
              <AdminSystemSection lang={lang} systemHealth={systemHealth} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
