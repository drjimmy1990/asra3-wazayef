"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { CampaignRecord } from "@/lib/types";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Link2,
  Loader2,
  MailCheck,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

const PAGE_SIZE = 25;

export default function CampaignTrackingDashboard() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const isDemoCampaign = token.toLowerCase().startsWith("demo-");
  const { lang } = useApp();

  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedTrackingLink, setCopiedTrackingLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [reinitiatingPayment, setReinitiatingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);

  const fetchCampaign = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        const recToken = String(data.campaign?.tracking_token || "");
        if (
          recToken &&
          !recToken.startsWith("demo-") &&
          typeof window !== "undefined"
        ) {
          localStorage.setItem("asra3_last_token", recToken);
          localStorage.setItem("wazayef_last_token", recToken);
        }
      }
    } catch (e) {
      console.error("Failed to fetch campaign:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const campaignId = campaign?.id;
  const campaignPayStatus = campaign?.payment_status;
  const campaignStatus = campaign?.campaign_status;
  const campaignTrackingToken = campaign?.tracking_token;

  // 1. Pending Payment Callback Polling (stable dependencies so attempts counter never resets)
  useEffect(() => {
    if (
      !campaignId ||
      !campaignTrackingToken ||
      campaignPayStatus === "paid" ||
      isDemoCampaign
    ) {
      return;
    }

    let attempts = 0;
    const pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > 20) {
        clearInterval(pollTimer);
        return;
      }
      try {
        const res = await fetch(
          `/api/campaigns/${encodeURIComponent(campaignTrackingToken)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.campaign) {
            setCampaign(data.campaign);
          }
        }
      } catch {
        // Ignore transient network hiccup
      }
    }, 3500);

    return () => clearInterval(pollTimer);
  }, [campaignId, campaignPayStatus, campaignTrackingToken, isDemoCampaign]);

  // 2. Live Drip Progress Sync
  useEffect(() => {
    if (
      !campaignId ||
      !campaignTrackingToken ||
      campaignPayStatus !== "paid" ||
      campaignStatus === "completed"
    ) {
      return;
    }

    if (isDemoCampaign) {
      const demoTimer = setInterval(() => {
        setCampaign((prev) => {
          if (!prev || prev.emails_sent_count >= prev.total_target_companies) {
            return prev;
          }
          const nextSent = Math.min(
            prev.total_target_companies,
            prev.emails_sent_count + 8
          );
          return {
            ...prev,
            emails_sent_count: nextSent,
            campaign_status:
              nextSent >= prev.total_target_companies
                ? "completed"
                : "distributing",
          };
        });
      }, 4500);
      return () => clearInterval(demoTimer);
    }

    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${encodeURIComponent(campaignTrackingToken)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "advance_batch" }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.campaign) {
            setCampaign(data.campaign);
          }
        }
      } catch {
        // Silent retry on next tick
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [
    campaignId,
    campaignPayStatus,
    campaignStatus,
    campaignTrackingToken,
    isDemoCampaign,
  ]);

  const handleResumePayment = async () => {
    if (!campaign) return;
    setReinitiatingPayment(true);
    setPaymentNotice(null);
    try {
      const res = await fetch(
        `/api/campaigns/${encodeURIComponent(campaign.tracking_token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reinitiate_payment" }),
        }
      );
      const data = await res.json();
      if (data.alreadyPaid) {
        await fetchCampaign();
        return;
      }
      if (!res.ok || !data.redirectUrl) {
        setPaymentNotice(
          data.error ||
            (lang === "ar"
              ? "تعذر فتح جلسة الدفع حالياً. حاول مرة أخرى."
              : "Could not initialize payment session. Please retry.")
        );
        setReinitiatingPayment(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setPaymentNotice(
        lang === "ar"
          ? "تعذر الاتصال ببوابة الدفع."
          : "Network error while connecting to EasyKash."
      );
      setReinitiatingPayment(false);
    }
  };

  const handleVerifyPaymentNow = async () => {
    if (!campaign) return;
    setVerifyingPayment(true);
    setPaymentNotice(null);
    try {
      const res = await fetch(
        `/api/campaigns/${encodeURIComponent(campaign.tracking_token)}?verify=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.campaign) {
          setCampaign(data.campaign);
          if (data.campaign.payment_status !== "paid") {
            setPaymentNotice(
              lang === "ar"
                ? "لم يصل تأكيد السداد من EasyKash بعد. إذا أكملت الدفع للتو انتظر ثوانٍ أو أعد فتح صفحة السداد."
                : "Payment is still awaiting confirmation from EasyKash. If you just paid, retry in a few seconds."
            );
          }
        }
      }
    } finally {
      setVerifyingPayment(false);
    }
  };

  const filteredRecipients = useMemo(() => {
    const list = campaign?.recipients || [];
    if (!logSearch.trim()) return list;
    const q = logSearch.trim().toLowerCase();
    return list.filter(
      (r) =>
        r.company_name.toLowerCase().includes(q) ||
        r.city_name_en.toLowerCase().includes(q) ||
        r.city_name_ar.includes(q) ||
        r.country_code.toLowerCase().includes(q)
    );
  }, [campaign?.recipients, logSearch]);

  const totalLogPages = Math.max(
    1,
    Math.ceil(filteredRecipients.length / PAGE_SIZE)
  );
  const safeLogPage = Math.min(logPage, totalLogPages);
  const pagedRecipients = filteredRecipients.slice(
    (safeLogPage - 1) * PAGE_SIZE,
    safeLogPage * PAGE_SIZE
  );

  const copyTrackingUrl = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/track/${
      campaign?.tracking_token || token
    }`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedTrackingLink(true);
    setTimeout(() => setCopiedTrackingLink(false), 2500);
  };

  const downloadOptimizedCv = () => {
    if (!campaign?.optimized_cv_text) return;
    const blob = new Blob(["\uFEFF" + campaign.optimized_cv_text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Asra3_ATS_Profile_${campaign.candidate_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDeliveryReportCsv = () => {
    if (!campaign?.recipients) return;
    const escapeCsv = (val: string) =>
      `"${String(val || "").replace(/"/g, '""')}"`;
    const rows = [
      "Company Name,Country,City,HR Email (Masked),Status,Sent Timestamp",
      ...campaign.recipients.map(
        (r) =>
          `${escapeCsv(r.company_name)},${r.country_code},${escapeCsv(
            r.city_name_en
          )},${escapeCsv(r.masked_hr_email)},${r.status},${escapeCsv(
            r.sent_at || "Queued"
          )}`
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Asra3_Delivery_Report_${campaign.customer_reference}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="exec-card exec-card-gold-top rounded-2xl p-8 sm:p-10">
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "لم يتم العثور على الحملة"
                : "Campaign Dossier Not Found"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "تأكد من إدخال رمز التتبع الصحيح (مثال: ASR-123456-789)."
                : "Please double-check your Asra3 Tracking Code (e.g. ASR-123456-789)."}
            </p>
            <Link
              href="/track"
              className="btn-carbon mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold"
            >
              {lang === "ar" ? "العودة لصفحة التتبع" : "Back to Lookup"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = campaign.payment_status === "paid";
  const progressPercent = Math.min(
    100,
    Math.round(
      (campaign.emails_sent_count /
        Math.max(1, campaign.total_target_companies)) *
        100
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF0F4] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:py-10 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {isDemoCampaign && (
          <div className="exec-card flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
              <span>
                {lang === "ar"
                  ? "نموذج حي تفاعلي لسجل التتبع التنفيذي في «أسرع» (Asra3.com). أطلق حملتك الفعلية خلال 3 دقائق."
                  : "Interactive Live Preview of the Asra3.com Executive Ledger. Launch your private GCC campaign in 3 minutes."}
              </span>
            </div>
            <Link
              href="/#wizard-section"
              className="btn-gold rounded-lg px-4 py-2 text-xs font-extrabold"
            >
              {lang === "ar"
                ? "توظَّف أسرع — ابدأ حملتي"
                : "Launch My Dossier →"}
            </Link>
          </div>
        )}

        {/* Executive Dispatch Dossier Header & Progress Card (Balanced Architectural Light/Dark) */}
        <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden">
          {/* Sleek Obsidian Top Identity Bar */}
          <div className="bg-[#09090B] px-6 py-5 sm:px-8 sm:py-6 text-zinc-50 border-b border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border ${
                    isPaid
                      ? "bg-[#121215] text-[#D4AF37] border-[#D4AF37]"
                      : "bg-[#121215] text-zinc-300 border-zinc-700"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  ) : (
                    <Clock className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse text-[#D4AF37]" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                        isPaid
                          ? "bg-[#D4AF37] text-[#09090B] border-[#D4AF37]"
                          : "bg-[#18181B] text-[#D4AF37] border-zinc-700"
                      }`}
                    >
                      {isPaid
                        ? lang === "ar"
                          ? "تم تأكيد السداد وتفعيل الإيداع ✓"
                          : "Payment Verified & Dispatch Active ✓"
                        : lang === "ar"
                        ? "بانتظار تأكيد الدفع"
                        : "Awaiting Payment Confirmation"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          campaign.customer_reference
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#121215] border border-zinc-800 px-3 py-0.5 text-xs font-mono font-bold text-[#D4AF37] hover:border-[#D4AF37] transition cursor-pointer"
                      title={
                        lang === "ar"
                          ? "اضغط لنسخ رمز التتبع"
                          : "Click to copy Tracking Code"
                      }
                    >
                      <span>
                        {lang === "ar" ? "رمز أسرع:" : "Code:"}{" "}
                        {campaign.customer_reference}
                      </span>
                      <Copy className="h-3 w-3" />
                      {copiedCode && (
                        <span className="text-[10px] font-sans text-zinc-100">
                          {lang === "ar" ? "تم النسخ!" : "Copied!"}
                        </span>
                      )}
                    </button>
                  </div>
                  <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-50 tracking-tight">
                    {lang === "ar"
                      ? `${campaign.candidate_name} — سجل التوزيع التنفيذي`
                      : `${campaign.candidate_name}'s Private Dispatch Ledger`}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                    {lang === "ar"
                      ? `إيداع مباشر لإدارات الموارد البشرية في (${campaign.primary_country_code}) • Reply-To: ${campaign.candidate_email}`
                      : `Direct HR inbox placement (${campaign.primary_country_code}) • Reply-To: ${campaign.candidate_email}`}
                  </p>
                </div>
              </div>

              {/* Customer Action Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {isPaid && campaign.campaign_status !== "completed" && (
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#121215] px-3.5 py-2 text-xs font-bold text-[#D4AF37]">
                    <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span>
                      {lang === "ar"
                        ? "الإرسال التلقائي نشط بالخادم"
                        : "Server Smart-Drip Active"}
                    </span>
                  </div>
                )}

                {!isPaid && !isDemoCampaign && (
                  <>
                    <button
                      type="button"
                      disabled={reinitiatingPayment}
                      onClick={handleResumePayment}
                      className="btn-gold inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold cursor-pointer disabled:opacity-60"
                    >
                      {reinitiatingPayment ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {lang === "ar"
                          ? "إتمام السداد الآن"
                          : "Complete Payment"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={verifyingPayment}
                      onClick={handleVerifyPaymentNow}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#18181B] px-3.5 py-2 text-xs font-bold text-zinc-200 hover:border-[#D4AF37] transition cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-[#D4AF37] ${
                          verifyingPayment ? "animate-spin" : ""
                        }`}
                      />
                      <span>
                        {lang === "ar" ? "تحقق من السداد" : "Verify Payment"}
                      </span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={copyTrackingUrl}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#121215] px-3.5 py-2 text-xs font-bold text-zinc-100 hover:border-[#D4AF37] transition cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    {copiedTrackingLink
                      ? lang === "ar"
                        ? "✓ تم نسخ الرابط"
                        : "✓ Link Copied"
                      : lang === "ar"
                      ? "نسخ رابط السجل"
                      : "Copy Ledger Link"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={exportDeliveryReportCsv}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#18181B] px-3.5 py-2 text-xs font-bold text-zinc-200 hover:border-[#D4AF37] transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    {lang === "ar" ? "تصدير التقرير (CSV)" : "Export CSV"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Crisp Light / Dark Progress & KPI Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {paymentNotice && (
              <div className="exec-well rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#9A7B1C] dark:text-[#D4AF37]" />
                <span>{paymentNotice}</span>
              </div>
            )}

            <div className="exec-well rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-3">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {!isPaid
                    ? lang === "ar"
                      ? "بانتظار تأكيد بوابة الدفع EasyKash لبدء الإيداع الفوري..."
                      : "Awaiting EasyKash payment confirmation to initiate dispatch..."
                    : campaign.campaign_status === "completed"
                    ? lang === "ar"
                      ? "اكتمل إيداع ملفك بنجاح لدى جميع جهات التوظيف المستهدفة (100%)"
                      : "Dossier Placement 100% Completed Across All Target Employers"
                    : lang === "ar"
                    ? "يودع خادم «أسرع» سيرتك الذاتية على دفعات متزنة لضمان وصولها لصندوق الوارد الرئيسي..."
                    : "Asra3 servers are placing your dossier in calibrated batches (continues even if you close this tab)..."}
                </span>
                <span className="font-bold text-[#9A7B1C] dark:text-[#D4AF37] tabular-nums">
                  {campaign.emails_sent_count} /{" "}
                  {campaign.total_target_companies}{" "}
                  {lang === "ar" ? "شركة" : "Companies"} ({progressPercent}%)
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-[#09090B] border border-zinc-300 dark:border-zinc-800">
                <div
                  className="h-full rounded-full bg-[#D4AF37] transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="exec-well rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar" ? "الشركات المستهدفة" : "Target Companies"}
                </p>
                <p className="mt-1 font-editorial text-3xl font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {campaign.total_target_companies}
                </p>
              </div>
              <div className="exec-well rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar" ? "الرسائل المودعة" : "Dispatched"}
                </p>
                <p className="mt-1 font-editorial text-3xl font-bold text-[#9A7B1C] dark:text-[#D4AF37] tabular-nums">
                  {campaign.emails_sent_count}
                </p>
              </div>
              <div className="exec-well rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar" ? "فتح ومراجعة الـ HR" : "Confirmed HR Opens"}
                </p>
                <p className="mt-1 font-editorial text-3xl font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {campaign.emails_opened_count}
                </p>
              </div>
              <div className="exec-well rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {lang === "ar" ? "مرجع المعاملة" : "Reference"}
                </p>
                <p
                  dir="ltr"
                  className="mt-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate font-mono"
                >
                  {campaign.easykash_ref || campaign.customer_reference}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Paginated Company Delivery Log + AI Assets */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="exec-card exec-card-carbon-top lg:col-span-2 rounded-2xl overflow-hidden flex flex-col">
            <div className="exec-card-header px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? `سجل جهات التوظيف المستهدفة (${filteredRecipients.length})`
                    : `Verified HR Delivery Ledger (${filteredRecipients.length})`}
                </h2>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => {
                    setLogSearch(e.target.value);
                    setLogPage(1);
                  }}
                  placeholder={
                    lang === "ar"
                      ? "ابحث باسم الشركة أو المدينة..."
                      : "Filter company or city..."
                  }
                  className="exec-input rounded-xl ps-8 pe-3 py-2 text-xs font-medium placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="p-6 flex-1">
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-start text-sm">
                  <thead className="exec-table-head text-[11px] font-bold tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "اسم الشركة" : "Company Name"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "المدينة / السوق" : "City / Market"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "صندوق الموارد البشرية" : "HR Inbox"}
                      </th>
                      <th className="px-4 py-3 text-start">
                        {lang === "ar" ? "الحالة" : "Status"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#121215]">
                    {pagedRecipients.map((rec) => (
                      <tr
                        key={rec.id}
                        className="even:bg-[#F8F9FB] dark:even:bg-transparent hover:bg-[#ECEEF3] dark:hover:bg-[#18181B] transition-colors"
                      >
                        <td className="px-4 py-3.5 font-bold text-zinc-950 dark:text-zinc-50">
                          {rec.company_name}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {lang === "ar" ? rec.city_name_ar : rec.city_name_en} (
                          {rec.country_code})
                        </td>
                        <td
                          dir="ltr"
                          className="px-4 py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          {rec.masked_hr_email}
                        </td>
                        <td className="px-4 py-3.5">
                          {rec.status === "opened" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#D4AF37] bg-[#09090B] px-2.5 py-0.5 text-xs font-bold text-[#D4AF37]">
                              <MailCheck className="h-3.5 w-3.5" />
                              {lang === "ar"
                                ? "تم الفتح من HR"
                                : "Opened by HR"}
                            </span>
                          ) : rec.status === "sent" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-950 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-50">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                              {lang === "ar" ? "تم الإيداع" : "Delivered"}
                            </span>
                          ) : rec.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {lang === "ar"
                                ? "تعذر التسليم"
                                : "Skipped (Bounce)"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-400">
                              <Clock className="h-3.5 w-3.5" />
                              {lang === "ar" ? "مجدول" : "Queued"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalLogPages > 1 && (
                <div className="mt-5 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <span>
                    {lang === "ar"
                      ? `صفحة ${safeLogPage} من ${totalLogPages}`
                      : `Page ${safeLogPage} of ${totalLogPages}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeLogPage <= 1}
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition-colors"
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
                      disabled={safeLogPage >= totalLogPages}
                      onClick={() =>
                        setLogPage((p) => Math.min(totalLogPages, p + 1))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer transition-colors"
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
              )}
            </div>
          </div>

          {/* Right Column: AI Cover Letter & Optimized ATS CV */}
          <div className="space-y-6">
            <div className="exec-card rounded-2xl overflow-hidden">
              <div className="exec-card-header px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "خطاب التقديم التنفيذي (Asra3)"
                      : "Executive Cover Letter"}
                  </h3>
                </div>
                {campaign.generated_cover_letter && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        campaign.generated_cover_letter || ""
                      );
                      setCopiedCover(true);
                      setTimeout(() => setCopiedCover(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
                    <span>
                      {copiedCover
                        ? lang === "ar"
                          ? "تم النسخ!"
                          : "Copied!"
                        : lang === "ar"
                        ? "نسخ"
                        : "Copy"}
                    </span>
                  </button>
                )}
              </div>

              <div className="p-5">
                {campaign.generated_cover_letter ? (
                  <pre
                    dir="auto"
                    className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-xs leading-relaxed text-zinc-200 font-sans"
                  >
                    {campaign.generated_cover_letter}
                  </pre>
                ) : (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {lang === "ar"
                      ? "متاح ضمن مسار Asra3 Turbo و Asra3 Hyper."
                      : "Included with Asra3 Turbo & Asra3 Hyper plans."}
                  </p>
                )}
              </div>
            </div>

            <div className="exec-card rounded-2xl overflow-hidden">
              <div className="exec-card-header px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "ملف السيرة الذاتية المحسن (ATS)"
                      : "ATS-Optimized Profile"}
                  </h3>
                </div>
                {campaign.optimized_cv_text && (
                  <button
                    type="button"
                    onClick={downloadOptimizedCv}
                    className="btn-carbon inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>{lang === "ar" ? "تحميل" : "Download"}</span>
                  </button>
                )}
              </div>

              <div className="p-5">
                {campaign.optimized_cv_text ? (
                  <pre
                    dir="ltr"
                    className="exec-well max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl p-4 text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-300 font-mono"
                  >
                    {campaign.optimized_cv_text}
                  </pre>
                ) : (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {lang === "ar"
                      ? `الملف المرفق بالحملة: ${campaign.cv_file_name}`
                      : `Attached CV file: ${campaign.cv_file_name}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
