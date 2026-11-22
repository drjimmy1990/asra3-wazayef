"use client";

import React from "react";
import Link from "next/link";
import { AnimatedCounter, LiveSignalEqualizer } from "@/components/MotionPrimitives";
import {
  CampaignRecord,
  CountryConfig,
  Industry,
  Language,
} from "@/lib/types";
import {
  AdminSectionId,
  AdminStats,
  AdminSystemHealth,
  SmtpSummary,
} from "./admin-types";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Headphones,
  Mail,
  Server,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

interface AdminOverviewSectionProps {
  lang: Language;
  countries: CountryConfig[];
  industries: Industry[];
  stats: AdminStats;
  campaigns: CampaignRecord[];
  systemHealth: AdminSystemHealth;
  smtpSummary: SmtpSummary;
  newLeadsCount: number;
  onNavigate: (section: AdminSectionId) => void;
}

export function AdminOverviewSection({
  lang,
  countries,
  industries,
  stats,
  campaigns,
  systemHealth,
  smtpSummary,
  newLeadsCount,
  onNavigate,
}: AdminOverviewSectionProps) {
  const revenueSummary = Object.entries(stats.revenueByCurrency || {})
    .map(([curr, val]) => `${val.toLocaleString()} ${curr}`)
    .join(" • ");

  const countrySegmentClasses = [
    "bg-[#D4AF37]",
    "bg-[#09090B] dark:bg-zinc-100",
    "bg-zinc-500",
    "bg-zinc-300 dark:bg-zinc-700",
  ];

  const totalCountryInventory = Math.max(
    1,
    countries.reduce(
      (sum, c) => sum + (stats.inventoryByCountry?.[c.code] || 0),
      0
    )
  );

  const smtpQuotaPct = Math.min(
    100,
    Math.round(
      (smtpSummary.sentTodayTotal /
        Math.max(1, smtpSummary.totalDailyCapacity)) *
        100
    )
  );

  const recentCampaigns = campaigns.slice(0, 6);

  const topIndustries = [...industries]
    .sort(
      (a, b) =>
        (stats.inventoryByIndustry?.[b.id] || 0) -
        (stats.inventoryByIndustry?.[a.id] || 0)
    )
    .slice(0, 5);

  return (
    <div className="animate-panel-enter space-y-6">
      {/* 4-Card KPI Bento Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="exec-card exec-card-gold-top exec-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
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
              <AnimatedCounter
                value={stats.activeCompanies || stats.totalCompanies}
              />
            </p>
            <div
              aria-hidden="true"
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 flex gap-0.5"
            >
              {countries.map((c, idx) => {
                const pct = Math.max(
                  4,
                  Math.round(
                    ((stats.inventoryByCountry?.[c.code] || 0) /
                      totalCountryInventory) *
                      100
                  )
                );
                return (
                  <span
                    key={c.code}
                    className={`h-full transition-all duration-500 ${
                      countrySegmentClasses[idx % countrySegmentClasses.length]
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>
          <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 truncate">
            {countries
              .map(
                (c) => `${c.code}:${stats.inventoryByCountry?.[c.code] || 0}`
              )
              .join(" · ")}
          </div>
        </div>

        <div className="exec-card exec-card-carbon-top exec-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {lang === "ar" ? "إجمالي الطلبات" : "Total Campaigns"}
              </p>
              <span className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                02
              </span>
            </div>
            <p className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
              <AnimatedCounter value={stats.totalCampaigns} />
            </p>
          </div>
          <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            {lang === "ar"
              ? "تشمل المسودات والمدفوعة"
              : "Includes Paid & Pending Checkout"}
          </div>
        </div>

        <div className="exec-card exec-card-gold-top exec-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
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
              <AnimatedCounter value={stats.paidCampaigns} />
            </p>
          </div>
          <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-mono font-bold text-zinc-800 dark:text-zinc-300 truncate">
            {revenueSummary || "0 AED"}
          </div>
        </div>

        <div className="exec-card exec-card-carbon-top exec-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
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
              <AnimatedCounter value={stats.totalEmailsSent} />
            </p>
          </div>
          <div className="exec-card-header border-t border-zinc-200 dark:border-zinc-800 border-b-0 px-5 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            {lang === "ar"
              ? "متصل بمحرك Reply-To المباشر"
              : "Direct Reply-To Candidate Inbox"}
          </div>
        </div>
      </div>

      {/* Live System Health Summary Strip */}
      <div className="rounded-2xl bg-[#09090B] border border-zinc-800 p-4 sm:p-5 text-zinc-100">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 items-center">
          <div className="rounded-xl bg-[#121215] border border-zinc-800 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "بوابة EasyKash" : "EasyKash Gateway"}
              </p>
              <p className="mt-0.5 text-xs font-extrabold text-white">
                {systemHealth.easykashLive ? "LIVE PRODUCTION" : "SANDBOX MODE"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold ${
                systemHealth.easykashLive
                  ? "bg-[#D4AF37] text-[#09090B]"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {systemHealth.easykashLive ? "LIVE" : "TEST"}
            </span>
          </div>

          <div className="rounded-xl bg-[#121215] border border-zinc-800 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "أمان Webhook HMAC" : "Webhook HMAC-SHA512"}
              </p>
              <p className="mt-0.5 text-xs font-extrabold text-white">
                {systemHealth.hmacConfigured
                  ? lang === "ar"
                    ? "توقيع مشفر مفعل"
                    : "Signature Verified"
                  : lang === "ar"
                  ? "بانتظار المفتاح"
                  : "Secret Pending"}
              </p>
            </div>
            <ShieldCheck
              className={`h-4 w-4 shrink-0 ${
                systemHealth.hmacConfigured
                  ? "text-[#D4AF37]"
                  : "text-zinc-500"
              }`}
            />
          </div>

          <div className="rounded-xl bg-[#121215] border border-zinc-800 px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                {smtpSummary.activeCount > 0 && <LiveSignalEqualizer />}
                <span>
                  {lang === "ar"
                    ? `SMTP نشط (${smtpSummary.activeCount})`
                    : `Active SMTP (${smtpSummary.activeCount})`}
                </span>
              </span>
              <span className="font-mono text-[#D4AF37] tabular-nums">
                {smtpSummary.sentTodayTotal}/{smtpSummary.totalDailyCapacity}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${smtpQuotaPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("leads")}
            className="rounded-xl bg-[#121215] border border-zinc-800 hover:border-[#D4AF37] px-4 py-3 flex items-center justify-between gap-3 text-start transition cursor-pointer touch-manipulation"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lang === "ar" ? "تذاكر وطلبات الدعم" : "New Support Leads"}
              </p>
              <p className="mt-0.5 text-xs font-extrabold text-[#D4AF37] tabular-nums">
                {newLeadsCount}{" "}
                {lang === "ar" ? "طلب جديد بانتظار المراجعة" : "pending review"}
              </p>
            </div>
            <Headphones className="h-4 w-4 shrink-0 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Operational Cards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Card 1: Recent Customer Campaigns */}
        <div className="exec-card exec-card-gold-top xl:col-span-7 rounded-2xl overflow-hidden flex flex-col">
          <div className="exec-card-header px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "أحدث حملات وطلبات العملاء"
                  : "Recent Customer Campaigns"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("campaigns")}
              className="btn-carbon inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer touch-manipulation"
            >
              <span>
                {lang === "ar" ? "عرض كل الحملات" : "View All Campaigns"}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#D4AF37]" />
            </button>
          </div>

          <div className="p-5 flex-1">
            {recentCampaigns.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {lang === "ar"
                  ? "لا توجد حملات مسجلة بعد."
                  : "No campaigns recorded yet."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentCampaigns.map((camp) => {
                  const pct = Math.min(
                    100,
                    Math.round(
                      (camp.emails_sent_count /
                        Math.max(1, camp.total_target_companies)) *
                        100
                    )
                  );
                  return (
                    <div
                      key={camp.id}
                      className="exec-well rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            dir="auto"
                            className="font-bold text-sm text-zinc-950 dark:text-zinc-50 truncate"
                          >
                            {camp.candidate_name}
                          </span>
                          <span
                            dir="ltr"
                            className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400"
                          >
                            {camp.customer_reference}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              camp.payment_status === "paid"
                                ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {camp.payment_status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="font-semibold">
                            {camp.primary_country_code} • {camp.amount_paid}{" "}
                            {camp.currency}
                          </span>
                          <div className="flex-1 max-w-[140px] h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-full bg-[#D4AF37]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/track/${camp.tracking_token}`}
                        className="btn-carbon inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shrink-0 touch-manipulation"
                      >
                        <span>{lang === "ar" ? "السجل" : "Portal"}</span>
                        <ExternalLink className="h-3 w-3 text-[#D4AF37]" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: GCC Employer Inventory & Quick Actions */}
        <div className="exec-card exec-card-carbon-top xl:col-span-5 rounded-2xl overflow-hidden flex flex-col">
          <div className="exec-card-header px-5 py-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "توزيع الشركات وإجراءات سريعة"
                : "GCC Inventory & Quick Actions"}
            </h2>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Country Progress Bars */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {lang === "ar" ? "تغطية الأسواق الخليجية" : "GCC Market Coverage"}
              </p>
              {countries.map((c) => {
                const count = stats.inventoryByCountry?.[c.code] || 0;
                const pct = Math.min(
                  100,
                  Math.round((count / totalCountryInventory) * 100)
                );
                return (
                  <div key={c.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                      </span>
                      <span className="font-mono text-[#9A7B1C] dark:text-[#D4AF37] tabular-nums">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full bg-[#D4AF37]"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Industries Chips */}
            <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {lang === "ar" ? "أعلى القطاعات المسجلة" : "Top Employer Sectors"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topIndustries.map((ind) => (
                  <span
                    key={ind.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    {lang === "ar"
                      ? ind.name_ar.split(" ")[0]
                      : ind.name_en.split(",")[0]}{" "}
                    <span className="font-mono text-[#9A7B1C] dark:text-[#D4AF37]">
                      ({stats.inventoryByIndustry?.[ind.id] || 0})
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* 1-Click Quick Navigation */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onNavigate("companies")}
                className="exec-well flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer touch-manipulation"
              >
                <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{lang === "ar" ? "الشركات و CSV" : "Companies"}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("jobs")}
                className="exec-well flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer touch-manipulation"
              >
                <BriefcaseBusiness className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{lang === "ar" ? "الوظائف" : "Jobs"}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("smtp")}
                className="exec-well flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer touch-manipulation"
              >
                <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{lang === "ar" ? "خوادم SMTP" : "SMTP Pool"}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("pricing")}
                className="exec-well flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer touch-manipulation"
              >
                <Settings className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{lang === "ar" ? "الأسعار" : "Pricing"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Quick Status Footer */}
      <div className="exec-card rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2 font-mono">
          <Server className="h-3.5 w-3.5 text-[#D4AF37]" />
          {systemHealth.appUrl} • {systemHealth.storageMode}
        </span>
        <button
          type="button"
          onClick={() => onNavigate("system")}
          className="font-bold text-[#9A7B1C] dark:text-[#D4AF37] hover:underline cursor-pointer"
        >
          {lang === "ar"
            ? "فتح فحص البيئة وروابط Webhook ←"
            : "Open System & Webhooks →"}
        </button>
      </div>
    </div>
  );
}
