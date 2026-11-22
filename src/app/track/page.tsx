"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ScrollProgressRail } from "@/components/MotionPrimitives";
import { useApp } from "@/context/AppContext";
import { CampaignRecord } from "@/lib/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  KeyRound,
  Loader2,
  Mail,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function TrackLookupPage() {
  const { lang } = useApp();
  const router = useRouter();

  const [lookupMode, setLookupMode] = useState<"code" | "recovery">("code");
  const [codeInput, setCodeInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(
    null
  );
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const [savedCampaign, setSavedCampaign] = useState<CampaignRecord | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedToken =
      localStorage.getItem("asra3_last_token") ||
      localStorage.getItem("wazayef_last_token");
    if (!savedToken || savedToken.startsWith("demo-")) return;

    fetch(`/api/campaigns/${encodeURIComponent(savedToken)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          data?.campaign &&
          !String(data.campaign.tracking_token).startsWith("demo-")
        ) {
          setSavedCampaign(data.campaign);
        }
      })
      .catch(() => {});
  }, []);

  const handleCodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codeInput.trim();
    if (!trimmed) return;

    if (trimmed.includes("@")) {
      setLookupMode("recovery");
      setRecoveryEmail(trimmed);
      setRecoveryError(null);
      setLookupError(
        lang === "ar"
          ? "لحماية خصوصيتك، يتم الدخول عبر رمز التتبع فقط (مثال: ASR-123456-789). إذا نسيت الرمز، اضغط زر الإرسال بالأسفل ليصلك على بريدك فوراً."
          : "For your privacy, lookup requires your Tracking Code (e.g. ASR-123456-789). If you forgot your code, click Send below to receive it via email."
      );
      return;
    }

    setSearching(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setLookupError(
          lang === "ar"
            ? "رمز التتبع غير صحيح. تأكد من كتابة الرمز كما ظهر لك بعد الدفع (مثال: ASR-123456-789) أو اطلب إرساله لبريدك."
            : "Invalid Tracking Code. Please check your code (e.g. ASR-123456-789) or recover it via email."
        );
        setSearching(false);
        return;
      }
      const data = await res.json();
      const targetToken = data?.campaign?.tracking_token || trimmed;
      router.push(`/track/${encodeURIComponent(targetToken)}`);
    } catch {
      setLookupError(
        lang === "ar"
          ? "حدث خطأ أثناء التحقق من الرمز. يرجى المحاولة مرة أخرى."
          : "An error occurred while verifying your code. Please try again."
      );
      setSearching(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = recoveryEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setRecoveryError(
        lang === "ar"
          ? "يرجى إدخال البريد الإلكتروني الصحيح الذي استخدمته عند التسجيل."
          : "Please enter the valid email address you used during registration."
      );
      return;
    }

    setSendingRecovery(true);
    setRecoveryError(null);
    setRecoverySuccessMsg(null);

    try {
      const res = await fetch("/api/campaigns/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryError(
          data?.error ||
            (lang === "ar"
              ? "تعذر إرسال رمز التتبع حالياً."
              : "Could not send recovery email right now.")
        );
      } else {
        setRecoverySuccessMsg(data.message);
      }
    } catch {
      setRecoveryError(
        lang === "ar"
          ? "حدث خطأ في الاتصال بالخادم."
          : "Network error while requesting recovery email."
      );
    } finally {
      setSendingRecovery(false);
    }
  };

  const savedProgressPct = savedCampaign
    ? Math.min(
        100,
        Math.round(
          (savedCampaign.emails_sent_count /
            Math.max(1, savedCampaign.total_target_companies)) *
            100
        )
      )
    : 0;
  const savedIsPaid = savedCampaign?.payment_status === "paid";

  return (
    <div className="min-h-screen flex flex-col bg-arch-grid bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <ScrollProgressRail />
      <Navbar />

      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-4xl w-full px-4 pt-8 pb-20 sm:py-14 space-y-6">
          {/* Top Priority Quick-Resume Card (Visible immediately when a local session token exists) */}
          {savedCampaign && (
            <div className="animate-panel-enter rounded-2xl bg-[#09090B] border-2 border-[#D4AF37] p-5 sm:p-6 text-zinc-50 shadow-lg space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-extrabold text-[#09090B]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {savedIsPaid
                        ? lang === "ar"
                          ? "حملتك النشطة على هذا الجهاز"
                          : "Active Campaign on This Device"
                        : lang === "ar"
                        ? "مسودة محفوظة على هذا الجهاز"
                        : "Saved Draft on This Device"}
                    </span>
                    <span
                      dir="ltr"
                      className="rounded-md border border-zinc-700 bg-[#121215] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#D4AF37]"
                    >
                      {savedCampaign.primary_country_code} •{" "}
                      {savedCampaign.customer_reference}
                    </span>
                  </div>
                  <h2
                    dir="auto"
                    className="text-lg sm:text-xl font-extrabold text-white truncate"
                  >
                    {savedCampaign.candidate_name}
                  </h2>
                </div>

                <Link
                  href={`/track/${savedCampaign.tracking_token}`}
                  className="btn-gold inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-extrabold touch-manipulation"
                >
                  <span>
                    {lang === "ar" ? "فتح سجل التوزيع" : "Open Live Ledger"}
                  </span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 tabular-nums">
                  <span>
                    {lang === "ar"
                      ? "تقدم الإيداع لدى الشركات"
                      : "Verified HR Placement Progress"}
                  </span>
                  <span className="text-[#D4AF37]">
                    {savedCampaign.emails_sent_count} /{" "}
                    {savedCampaign.total_target_companies} ({savedProgressPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                    style={{ width: `${savedProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary 2-Tab Lookup / Email Recovery Card */}
          <div className="exec-card exec-card-gold-top animate-panel-enter rounded-2xl overflow-hidden">
            <div className="exec-card-header px-5 py-5 sm:px-8 sm:py-6 flex items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <SearchCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#09090B] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] border border-zinc-800 mb-1.5">
                  ASRA3 LIVE LEDGER
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {lang === "ar"
                    ? "سجل التتبع التنفيذي — أسرع (Asra3)"
                    : "Access Your Private Asra3 Ledger"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {lang === "ar"
                    ? "أدخل رمز التتبع الخاص بك (مثال: ASR-955675-938) أو استرجعه عبر البريد الإلكتروني المسجل."
                    : "Enter your private Tracking Code (e.g. ASR-955675-938) or recover it via your registered email."}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-5">
              {/* Segmented 2-Tab Mode Switcher */}
              <div
                role="tablist"
                aria-label={lang === "ar" ? "طريقة الدخول للسجل" : "Ledger access mode"}
                className="grid grid-cols-2 gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#09090B] p-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={lookupMode === "code"}
                  onClick={() => {
                    setLookupMode("code");
                    setLookupError(null);
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer touch-manipulation ${
                    lookupMode === "code"
                      ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <KeyRound className="h-4 w-4 shrink-0" />
                  <span>
                    {lang === "ar" ? "إدخال رمز التتبع" : "Enter Tracking Code"}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={lookupMode === "recovery"}
                  onClick={() => {
                    setLookupMode("recovery");
                    setLookupError(null);
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer touch-manipulation ${
                    lookupMode === "recovery"
                      ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>
                    {lang === "ar" ? "استرجاع بالبريد" : "Recover via Email"}
                  </span>
                </button>
              </div>

              {lookupError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-800 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupMode === "code" ? (
                <form
                  onSubmit={handleCodeSearch}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      dir="ltr"
                      aria-label="Tracking Code"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        if (lookupError) setLookupError(null);
                      }}
                      placeholder="ASR-XXXXXX-XXX"
                      className="exec-input w-full min-h-[48px] rounded-xl pl-10 pr-4 py-3 font-mono text-base sm:text-sm font-bold uppercase tracking-wider placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching}
                    className="btn-gold inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold cursor-pointer disabled:opacity-60 touch-manipulation"
                  >
                    {searching && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {lang === "ar"
                        ? "فتح سجل التتبع"
                        : "Open Private Ledger"}
                    </span>
                  </button>
                </form>
              ) : (
                <div className="exec-well rounded-xl p-4 sm:p-5 space-y-3.5">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    {lang === "ar"
                      ? "أدخل البريد الإلكتروني الذي استخدمته أثناء إطلاق الحملة، وسنرسل لك رمز التتبع (ASR-...) ورابط الدخول المباشر فوراً:"
                      : "Enter the email address used when creating your campaign, and we will send your Tracking Code (ASR-...) directly to your inbox:"}
                  </p>

                  <form
                    onSubmit={handleRecoverySubmit}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="email"
                      dir="ltr"
                      aria-label="Registered Email"
                      value={recoveryEmail}
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        setRecoveryError(null);
                      }}
                      placeholder="you@email.com"
                      className="exec-input flex-1 min-h-[46px] rounded-xl px-4 py-2.5 text-base sm:text-sm font-medium placeholder:text-zinc-400"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingRecovery}
                      className="btn-carbon inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60 touch-manipulation"
                    >
                      {sendingRecovery ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 text-[#D4AF37]" />
                      )}
                      <span>
                        {lang === "ar"
                          ? "إرسال الرمز لبريدي"
                          : "Send Code to Email"}
                      </span>
                    </button>
                  </form>

                  {recoveryError && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      {recoveryError}
                    </p>
                  )}

                  {recoverySuccessMsg && (
                    <div className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-[#09090B] p-3.5 text-xs font-bold text-zinc-100">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#D4AF37]" />
                      <span>{recoverySuccessMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3-Column Feature Proof Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="exec-card rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "إثبات الإيداع للـ HR"
                    : "Live HR Delivery Proof"}
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === "ar"
                    ? "شاهد كل شركة استلمت ملفك مع المدينة وبريد الموارد البشرية."
                    : "Verify every employer inbox that received your CV dossier."}
                </p>
              </div>
            </div>

            <div className="exec-card rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "رصد فتح الرسائل مباشرة"
                    : "HR Open Telemetry"}
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === "ar"
                    ? "تحديث فوري فور فتح مسؤول التوظيف لرسالتك أو مراجعتها."
                    : "Instant indicator updates whenever a recruiter opens your email."}
                </p>
              </div>
            </div>

            <div className="exec-card rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "خطاب التقديم وتقرير CSV"
                    : "AI Cover Letter & CSV Report"}
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === "ar"
                    ? "انسخ خطاب التقديم المعدّل وحمّل تقرير التسليم الكامل بضغطة."
                    : "Copy your tailored cover letter and download your full CSV report."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions Card */}
          <div className="rounded-2xl bg-[#09090B] p-6 text-center border border-zinc-800 space-y-4">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#18181B] border border-zinc-800 text-[#D4AF37]">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm sm:text-base font-extrabold text-zinc-100">
              {lang === "ar"
                ? "لم تطلق حملة توزيع لسيرتك في الخليج بعد؟ ابدأ في أقل من 3 دقائق"
                : "Ready to launch a private GCC HR distribution campaign in under 3 minutes?"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#wizard-section"
                className="btn-gold inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 py-2.5 text-xs font-extrabold touch-manipulation"
              >
                {lang === "ar"
                  ? "توظَّف أسرع — ابدأ الآن"
                  : "Launch Distribution Wizard"}
              </Link>
              <Link
                href="/#pricing-section"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-700 bg-[#18181B] px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-[#D4AF37] transition-colors touch-manipulation"
              >
                {lang === "ar" ? "عرض الباقات والأسعار" : "View Plans & Pricing"}
              </Link>
              <Link
                href="/track/demo-uae-campaign-2026"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-700 bg-[#121215] px-4 py-2.5 text-xs font-bold text-[#D4AF37] hover:border-[#D4AF37] transition-colors touch-manipulation"
              >
                {lang === "ar"
                  ? "استعراض نموذج تتبع حي"
                  : "Inspect Live Demo Ledger"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
