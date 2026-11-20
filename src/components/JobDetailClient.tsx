"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ScrollProgressRail } from "@/components/MotionPrimitives";
import { useApp } from "@/context/AppContext";
import { trackGaEvent } from "@/components/GoogleAnalytics";
import { JobPostingRecord } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface JobDetailClientProps {
  job: JobPostingRecord;
  isExpired: boolean;
  similarJobs: JobPostingRecord[];
  qrDataUri?: string;
  jobUrl?: string;
  ogTemplate?: string;
}

export function JobDetailClient({
  job,
  isExpired,
  similarJobs,
  qrDataUri,
  jobUrl,
  ogTemplate,
}: JobDetailClientProps) {
  const { lang, countries, industries } = useApp();

  const [revealedApply, setRevealedApply] = useState<{
    apply_email: string | null;
    apply_url: string | null;
    apply_whatsapp: string | null;
  } | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedJobLink, setCopiedJobLink] = useState(false);

  useEffect(() => {
    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: job.slug, action: "view" }),
    }).catch(() => {});
  }, [job.slug]);

  const handleRevealDirectApply = async () => {
    setUnlocking(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: job.slug, action: "apply" }),
      });
      if (res.ok) {
        const data = await res.json();
        trackGaEvent("job_direct_apply", {
          job_slug: job.slug,
          country: job.country_code,
          industry: job.industry_id,
        });
        setRevealedApply({
          apply_email: data.apply_email || null,
          apply_url: data.apply_url || null,
          apply_whatsapp: data.apply_whatsapp || null,
        });
      }
    } finally {
      setUnlocking(false);
    }
  };

  const countryObj =
    countries.find((c) => c.code === job.country_code) || countries[0];
  const industryObj =
    industries.find((i) => i.id === job.industry_id) || industries[0];

  const title = lang === "ar" ? job.title_ar : job.title_en;
  const summary = lang === "ar" ? job.summary_ar : job.summary_en;
  const requirements =
    lang === "ar" ? job.requirements_ar : job.requirements_en;
  const city = lang === "ar" ? job.city_name_ar : job.city_name_en;
  const countryName = lang === "ar" ? countryObj.name_ar : countryObj.name_en;
  const industryName =
    lang === "ar" ? industryObj.name_ar : industryObj.name_en;

  const wizardUrl = `/?country=${job.country_code}&city=${job.city_id}&industry=${job.industry_id}&role=${encodeURIComponent(job.title_en)}#wizard-section`;

  const mailtoSubject = encodeURIComponent(
    `Application for ${job.title_en} — ${job.city_name_en}`
  );

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors"
    >
      <ScrollProgressRail />
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          <Link href="/" className="hover:text-zinc-950 dark:hover:text-white">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link
            href="/jobs"
            className="hover:text-zinc-950 dark:hover:text-white"
          >
            {lang === "ar" ? "وظائف الخليج" : "GCC Jobs"}
          </Link>
          <span>/</span>
          <Link
            href={`/${job.country_code.toLowerCase()}/jobs`}
            className="hover:text-zinc-950 dark:hover:text-white"
          >
            {countryName}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-xs">
            {title}
          </span>
        </nav>

        {/* Smart Expiry Zero-404 Notice */}
        {isExpired && (
          <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#09090B] p-6 text-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm sm:text-base text-white">
                  {lang === "ar"
                    ? "اكتمل استقبال الطلبات المباشرة لهذا الإعلان الوظيفي"
                    : "Direct applications for this specific listing have closed"}
                </p>
                <p className="text-xs text-zinc-300 mt-1">
                  {lang === "ar"
                    ? `يمكنك إرسال سيرتك الذاتية فوراً إلى أكثر من 300 شركة موثقة توظف في قطاع (${industryName}) داخل ${countryName}، أو تصفح الشواغر النشطة المماثلة بالأسفل.`
                    : `You can still distribute your ATS-optimized CV directly to 300+ active ${industryName} employers in ${countryName}, or explore live open roles below.`}
                </p>
              </div>
            </div>
            <Link
              href={wizardUrl}
              className="btn-gold shrink-0 rounded-xl px-5 py-3 text-xs font-extrabold text-center"
            >
              {lang === "ar"
                ? "أرسل سيرتك لـ 300 شركة مماثلة ←"
                : "Send CV to 300 Similar HR →"}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Primary Job Specification Column (8 cols) */}
          <article className="lg:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 sm:p-9 space-y-7 shadow-sm">
            <header className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  dir="ltr"
                  className="rounded-md bg-[#09090B] px-2.5 py-1 font-mono text-xs font-extrabold text-[#D4AF37]"
                >
                  {job.country_code} • {job.city_name_en.toUpperCase()}
                </span>

                {job.is_mx_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-900 dark:text-[#D4AF37]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                    {lang === "ar"
                      ? "نطاق بريد HR مفحوص وموثق (DNS MX)"
                      : "DNS MX-Verified Corporate HR"}
                  </span>
                )}

                <Link
                  href={`/${job.country_code.toLowerCase()}/jobs/${job.industry_id}`}
                  className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline"
                >
                  {industryName}
                </Link>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                <span className="inline-flex items-center gap-1.5 text-zinc-950 dark:text-white font-bold">
                  <Building2 className="h-4 w-4 text-[#D4AF37]" />
                  {job.company_name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  {city}، {countryName}
                </span>
                <span dir="ltr" className="text-zinc-500">
                  {job.experience_level}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {job.salary_min && job.salary_max ? (
                  <span
                    dir="ltr"
                    className="rounded-lg bg-[#09090B] px-3.5 py-1.5 font-mono text-sm font-extrabold text-[#D4AF37]"
                  >
                    {job.salary_min.toLocaleString()} –{" "}
                    {job.salary_max.toLocaleString()} {job.salary_currency} / mo
                  </span>
                ) : (
                  <span className="rounded-lg bg-zinc-100 dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {lang === "ar"
                      ? "الراتب والمزايا تحدد حسب الخبرة"
                      : "Competitive Tax-Free GCC Package"}
                  </span>
                )}
                <span className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {job.employment_type.replace("_", " ")}
                </span>
              </div>
            </header>

            {/* Overview */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar" ? "ملخص الدور الوظيفي" : "Role Overview"}
              </h2>
              <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {summary}
              </p>
            </section>

            {/* Key Requirements */}
            {requirements.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "المتطلبات والمؤهلات الأساسية"
                    : "Key Qualifications & Requirements"}
                </h2>
                <ul className="space-y-2.5">
                  {requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                    >
                      <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ATS Target Keywords / Skills */}
            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "الكلمات المفتاحية ومهارات الـ ATS المطلوبة"
                  : "Target ATS Skills & Keywords"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((sk) => (
                  <span
                    key={sk}
                    dir="ltr"
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </section>

            {/* Direct HR Application Box */}
            {!isExpired && (
              <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                    {lang === "ar"
                      ? "التقديم المباشر لقسم الموارد البشرية (HR)"
                      : "Direct Corporate HR Application"}
                  </h3>
                  {job.masked_apply_email && !revealedApply && (
                    <span
                      dir="ltr"
                      className="font-mono text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {job.masked_apply_email}
                    </span>
                  )}
                </div>

                {!revealedApply ? (
                  <button
                    type="button"
                    disabled={unlocking}
                    onClick={handleRevealDirectApply}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-[#D4AF37] dark:text-[#09090B] px-6 py-3.5 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    <Mail className="h-4 w-4 text-[#D4AF37] dark:text-[#09090B]" />
                    <span>
                      {unlocking
                        ? lang === "ar"
                          ? "جارٍ فتح بيانات التواصل..."
                          : "Unlocking HR Contact..."
                        : lang === "ar"
                        ? "إظهار بريد الـ HR والتقديم المباشر مجاناً"
                        : "Reveal Verified HR Email & Apply Free"}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {revealedApply.apply_email && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4AF37]/50 bg-white dark:bg-[#141418] p-4">
                        <div>
                          <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                            {lang === "ar"
                              ? "البريد الرسمي لاستقبال السير الذاتية:"
                              : "Verified Corporate HR Inbox:"}
                          </p>
                          <p
                            dir="ltr"
                            className="font-mono text-sm font-extrabold text-zinc-950 dark:text-[#D4AF37] mt-0.5"
                          >
                            {revealedApply.apply_email}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                revealedApply.apply_email || ""
                              );
                              setCopiedEmail(true);
                              setTimeout(() => setCopiedEmail(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-bold cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>
                              {copiedEmail
                                ? lang === "ar"
                                  ? "تم النسخ ✓"
                                  : "Copied ✓"
                                : lang === "ar"
                                ? "نسخ البريد"
                                : "Copy Email"}
                            </span>
                          </button>

                          <a
                            href={`mailto:${revealedApply.apply_email}?subject=${mailtoSubject}`}
                            className="btn-gold inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>
                              {lang === "ar"
                                ? "إرسال بريد الآن"
                                : "Open Mail Client"}
                            </span>
                          </a>
                        </div>
                      </div>
                    )}

                    {revealedApply.apply_url && (
                      <a
                        href={revealedApply.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold"
                      >
                        <span>
                          {lang === "ar"
                            ? "التقديم عبر بوابة الشركة الرسمية"
                            : "Apply on Official Employer Portal"}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}
          </article>

          {/* Right Conversion Flywheel Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#09090B] p-6 text-zinc-50 space-y-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-extrabold text-[#09090B]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {lang === "ar"
                    ? "ضاعف فرص قبولك 3.4×"
                    : "MULTIPLY YOUR INTERVIEW ODDS 3.4×"}
                </span>
              </div>

              <h2 className="text-lg font-extrabold leading-snug">
                {lang === "ar"
                  ? `أرسل سيرتك الذاتية لـ ${countryObj.display_companies_count.toLocaleString()}+ شركة موثقة في ${countryName}`
                  : `Reach ${countryObj.display_companies_count.toLocaleString()}+ Verified Employers in ${countryName}`}
              </h2>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {lang === "ar"
                  ? `هل تبحث عن دور مماثل لـ (${title})؟ دع محرك أسرع يحسّن سيرتك الذاتية لمعايير ATS ويودعها مع خطاب تقديم تنفيذي في صناديق بريد شركات (${industryName}) في ${city} و${countryName}.`
                  : `Targeting roles like ${job.title_en}? Asra3 audits your CV against GCC ATS filters, crafts an executive cover letter, and delivers it directly to ${industryName} HR managers in ${city}.`}
              </p>

              <ul className="space-y-2 text-xs text-zinc-200 border-t border-zinc-800 pt-3.5">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  <span>
                    {lang === "ar"
                      ? "فحص توافق ATS مجاني خلال 10 ثوانٍ"
                      : "Free instant PDF/DOCX ATS compatibility scan"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  <span>
                    {lang === "ar"
                      ? "درع سرية يحجب شركتك الحالية 100%"
                      : "100% Current-Employer Confidentiality Shield"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  <span>
                    {lang === "ar"
                      ? "ردود الـ HR تصل لبريدك الشخصي مباشرة"
                      : "Direct HR replies straight to your inbox"}
                  </span>
                </li>
              </ul>

              <Link
                href={wizardUrl}
                className="btn-gold w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-extrabold"
              >
                <span>
                  {lang === "ar"
                    ? "افحص سيرتك ووزّعها للشركات المماثلة"
                    : "Scan My CV for Similar Roles →"}
                </span>
              </Link>
            </div>

            {/* Employer Callout */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 space-y-2.5">
              <h3 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "هل لديك شاغر وظيفي في شركتك؟"
                  : "Hiring for Your Team?"}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {lang === "ar"
                  ? "انشر إعلانك الوظيفي مجاناً عبر بريد شركتك الرسمي ليظهر فوراً في محرك البحث وصفحتنا الرسمية."
                  : "Submit open roles using your corporate HR domain for instant DNS MX verification and automatic social syndication."}
              </p>
              <Link
                href="/employers"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-zinc-950 dark:text-[#D4AF37] hover:underline"
              >
                <span>
                  {lang === "ar" ? "انشر وظيفة مجاناً" : "Post a Vacancy Free"}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Branded Asra3 QR & Social Share Card */}
            {qrDataUri && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090B] text-[#D4AF37]">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-zinc-950 dark:text-zinc-50">
                        {lang === "ar"
                          ? "بطاقة الوظيفة وكود QR"
                          : "Branded Asra3 Job QR Card"}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {lang === "ar"
                          ? "امسح الكود أو شارك بطاقة الوظيفة"
                          : "Scan directly or share this job card"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-[#09090B] border border-zinc-800 p-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUri}
                    alt={`Asra3 QR for ${job.title_en}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 shrink-0 rounded-lg border-2 border-[#D4AF37] bg-white"
                  />
                  <div className="min-w-0 space-y-1.5 text-zinc-200">
                    <p
                      dir="ltr"
                      className="font-mono text-[10px] font-extrabold text-[#D4AF37] tracking-wider"
                    >
                      ASRA3.COM • VERIFIED QR
                    </p>
                    <p className="text-[11px] leading-relaxed text-zinc-300">
                      {lang === "ar"
                        ? "امسح الكود للوصول المباشر لصفحة التقديم أو حمّل البطاقة لمشاركتها مع الباحثين عن عمل."
                        : "Scan for instant direct application or download the branded QR card to share."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <a
                    href={
                      ogTemplate
                        ? `/api/og/job/${job.slug}?t=${encodeURIComponent(ogTemplate)}`
                        : `/api/og/job/${job.slug}`
                    }
                    download={`asra3-${job.slug}.png`}
                    className="btn-gold inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>
                      {lang === "ar"
                        ? "تحميل بطاقة الوظيفة (PNG مع QR)"
                        : "Download Job Card (PNG + QR)"}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const targetLink =
                        jobUrl ||
                        (typeof window !== "undefined"
                          ? window.location.href
                          : `https://asra3.com/jobs/${job.slug}`);
                      navigator.clipboard?.writeText(targetLink);
                      setCopiedJobLink(true);
                      setTimeout(() => setCopiedJobLink(false), 2000);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {copiedJobLink ? (
                      <Check className="h-3.5 w-3.5 text-[#D4AF37]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {copiedJobLink
                        ? lang === "ar"
                          ? "نُسخ رابط الوظيفة ✓"
                          : "Job Link Copied ✓"
                        : lang === "ar"
                        ? "نسخ رابط الوظيفة"
                        : "Copy Job Link"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Similar Active Jobs Internal Mesh */}
        {similarJobs.length > 0 && (
          <section className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "شواغر موثقة مشابهة قد تهمك"
                  : "Similar Verified GCC Opportunities"}
              </h2>
              <Link
                href={`/${job.country_code.toLowerCase()}/jobs`}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:underline"
              >
                <span>{lang === "ar" ? "عرض الكل" : "View All"}</span>
                {lang === "ar" ? (
                  <ArrowLeft className="h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {similarJobs.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/jobs/${sim.slug}`}
                  className="exec-card-interactive rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 space-y-2 hover:border-[#D4AF37] transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      dir="ltr"
                      className="rounded bg-[#09090B] px-2 py-0.5 font-mono font-extrabold text-[#D4AF37]"
                    >
                      {sim.country_code}
                    </span>
                    <span className="text-zinc-500">
                      {lang === "ar" ? sim.city_name_ar : sim.city_name_en}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50 line-clamp-2">
                    {lang === "ar" ? sim.title_ar : sim.title_en}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                    {sim.company_name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
