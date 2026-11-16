"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { CampaignRecord } from "@/lib/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  SearchCheck,
  Send,
  Sparkles,
} from "lucide-react";

export default function TrackLookupPage() {
  const { lang } = useApp();
  const router = useRouter();

  const [codeInput, setCodeInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [showRecovery, setShowRecovery] = useState(false);
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
      setShowRecovery(true);
      setRecoveryEmail(trimmed);
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
            ? "رمز التتبع غير صحيح. تأكد من كتابة الرمز كما ظهر لك بعد الدفع (مثال: ASR-123456-789) أو اطلب إرساله لبريدك بالأسفل."
            : "Invalid Tracking Code. Please check your code (e.g. ASR-123456-789) or request it via email below."
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

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <div className="mx-auto max-w-3xl w-full px-4 py-14 sm:py-20">
        <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden">
          <div className="exec-card-header px-6 py-6 sm:px-10 sm:py-7 flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <SearchCheck className="h-6 w-6" />
            </div>
            <div>
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
                  ? "أدخل رمز التتبع الخاص بك (مثال: ASR-955675-938) لعرض سجل الشركات وحالة الإيداع المباشر."
                  : "Enter your private Tracking Code (e.g. ASR-955675-938) to inspect your live HR delivery ledger."}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
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
                  className="exec-input w-full rounded-xl pl-10 pr-4 py-3.5 font-mono text-sm font-bold uppercase tracking-wider placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-extrabold cursor-pointer disabled:opacity-60"
              >
                {searching && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {lang === "ar" ? "فتح سجل التتبع" : "Open Private Ledger"}
                </span>
              </button>
            </form>

            {lookupError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{lookupError}</span>
              </div>
            )}

            <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-5">
              <button
                type="button"
                aria-expanded={showRecovery}
                onClick={() => {
                  setShowRecovery((prev) => !prev);
                  setRecoverySuccessMsg(null);
                  setRecoveryError(null);
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-[#D4AF37] cursor-pointer transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
                <span className="underline underline-offset-4">
                  {lang === "ar"
                    ? "نسيت رمز التتبع؟ أرسله إلى بريدك الإلكتروني المسجل"
                    : "Forgot your Tracking Code? Send it to your registered email"}
                </span>
              </button>

              {showRecovery && (
                <div className="exec-well mt-4 rounded-xl p-4 sm:p-5 space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
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
                      value={recoveryEmail}
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        setRecoveryError(null);
                      }}
                      placeholder="you@email.com"
                      className="exec-input flex-1 rounded-xl px-4 py-2.5 text-sm font-medium placeholder:text-zinc-400"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingRecovery}
                      className="btn-carbon inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-60"
                    >
                      {sendingRecovery ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5 text-[#D4AF37]" />
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

            {savedCampaign && (
              <div className="mt-7 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-[#9A7B1C] dark:text-[#D4AF37]" />
                  <span>
                    {lang === "ar"
                      ? "حملتك النشطة المحفوظة على هذا الجهاز:"
                      : "Your Active Dossier on This Device:"}
                  </span>
                </p>
                <Link
                  href={`/track/${savedCampaign.tracking_token}`}
                  className="exec-well flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4 text-sm hover:border-[#D4AF37] transition-colors"
                >
                  <div>
                    <span className="font-bold text-zinc-950 dark:text-zinc-50 text-base">
                      {savedCampaign.candidate_name}
                    </span>
                    <p className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {lang === "ar" ? "رمز التتبع:" : "Tracking Code:"}{" "}
                      {savedCampaign.customer_reference} (
                      {savedCampaign.primary_country_code})
                    </p>
                  </div>
                  <span className="btn-carbon inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold">
                    <span>
                      {savedCampaign.emails_sent_count}/
                      {savedCampaign.total_target_companies}{" "}
                      {lang === "ar" ? "شركة" : "Sent"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 text-[#D4AF37]" />
                  </span>
                </Link>
              </div>
            )}

            {!savedCampaign && (
              <div className="mt-7 rounded-xl bg-[#09090B] p-6 text-center border border-zinc-800">
                <div className="mx-auto mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#18181B] border border-zinc-800 text-[#D4AF37]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-zinc-100">
                  {lang === "ar"
                    ? "توظَّف أسرع — لم تطلق حملتك التنفيذية بعد؟ ابدأ في أقل من 3 دقائق"
                    : "Haven't launched your private GCC dossier yet? Start in under 3 minutes."}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/#wizard-section"
                    className="btn-gold inline-block rounded-xl px-5 py-2.5 text-xs font-extrabold"
                  >
                    {lang === "ar"
                      ? "توظَّف أسرع — ابدأ الآن"
                      : "Launch Executive Dossier"}
                  </Link>
                  <Link
                    href="/track/demo-uae-campaign-2026"
                    className="inline-block rounded-xl border border-zinc-700 bg-[#18181B] px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-[#D4AF37] transition-colors"
                  >
                    {lang === "ar"
                      ? "استعراض نموذج تتبع حي"
                      : "Inspect Live Demo Ledger"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
