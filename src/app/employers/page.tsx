"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ScrollProgressRail } from "@/components/MotionPrimitives";
import { useApp } from "@/context/AppContext";
import { trackGaEvent } from "@/components/GoogleAnalytics";
import { CountryCode, EmploymentType } from "@/lib/types";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

export default function EmployerPostJobPage() {
  const { lang, countries, industries, selectedCountryCode } = useApp();

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [applyWhatsapp, setApplyWhatsapp] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>(
    selectedCountryCode || "AE"
  );
  const [cityId, setCityId] = useState("dubai");
  const [industryId, setIndustryId] = useState("engineering");
  const [secondaryIndustries, setSecondaryIndustries] = useState<string[]>([]);
  const [additionalRoles, setAdditionalRoles] = useState<
    Array<{
      title_ar: string;
      title_en: string;
      industry_id: string;
    }>
  >([]);
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState(
    "Mid-Senior (3-7 Years)"
  );
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    autoPublished: boolean;
    slug?: string;
    publishedCount?: number;
    isMxVerified?: boolean;
  } | null>(null);

  const activeCountry =
    countries.find((c) => c.code === countryCode) || countries[0];

  useEffect(() => {
    if (
      activeCountry &&
      !activeCountry.cities.some((c) => c.id === cityId)
    ) {
      setCityId(activeCountry.cities[0].id);
    }
  }, [activeCountry, cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/employers/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_website: companyWebsite,
          hr_email: hrEmail,
          apply_url: applyUrl,
          apply_whatsapp: applyWhatsapp,
          country_code: countryCode,
          city_id: cityId,
          industry_id: industryId,
          secondary_industries: secondaryIndustries,
          additional_roles: additionalRoles,
          employment_type: employmentType,
          experience_level: experienceLevel,
          title_ar: titleAr,
          title_en: titleEn,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          skills: skillsInput,
          description,
          company_fax_trap: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error ||
            (lang === "ar"
              ? "تعذر إرسال طلب الوظيفة. يرجى التحقق من البيانات والمحاولة مجدداً."
              : "Failed to submit job request. Please check your details.")
        );
        return;
      }

      trackGaEvent("employer_job_submit", {
        country: countryCode,
        industry: industryId,
        auto_published: Boolean(data.autoPublished),
      });

      setResult({
        autoPublished: Boolean(data.autoPublished),
        slug: data.job?.slug,
        publishedCount: Number(data.publishedCount) || 1,
        isMxVerified: Boolean(data.job?.is_mx_verified),
      });
    } catch {
      setErrorMsg(
        lang === "ar"
          ? "حدث خطأ في الاتصال بالخادم."
          : "Network error while submitting vacancy."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors"
    >
      <ScrollProgressRail />
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-4 py-1.5 text-xs font-bold text-zinc-900 dark:text-[#D4AF37]">
            <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>
              {lang === "ar"
                ? "بوابة الشركات وأقسام الموارد البشرية في الخليج"
                : "GCC Corporate Employers & Talent Acquisition Desk"}
            </span>
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {lang === "ar"
              ? "أعلن عن وظيفتك الشاغرة مجاناً — بتوثيق DNS MX فوري"
              : "Post Your GCC Vacancy Free — With Instant DNS MX Verification"}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {lang === "ar"
              ? "عند استخدام البريد الرسمي لنطاق شركتك (مثال: hr@yourcompany.ae أو @company.sa)، يتحقق النظام تلقائياً من سجلات MX وينشر شاغرك فوراً على الموقع، محرك وظائف Google، وصفحاتنا الاجتماعية."
              : "Submit with your official corporate email (@company.ae, @company.sa, etc.) for instant DNS MX verification, automatic publishing on Asra3.com/jobs, Google Jobs indexing, and Facebook Page syndication."}
          </p>
        </header>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              titleAr: "نشر فوري للنطاقات المؤسسية",
              titleEn: "Instant Corporate Auto-Publish",
              descAr:
                "نطاقات الشركات الموثقة بسجلات DNS MX تُنشر تلقائياً خلال ثوانٍ بوسم (MX-Verified HR).",
              descEn:
                "Verified corporate domains bypass manual queues and earn the gold MX-Verified HR badge immediately.",
            },
            {
              icon: Globe2,
              titleAr: "ظهور في Google Jobs وفيسبوك",
              titleEn: "Google Jobs + Facebook Reach",
              descAr:
                "يُفهرس إعلانك تلقائياً ببيانات JobPosting القياسية ويُنشر ببطاقة احترافية على صفحتنا الرسمية.",
              descEn:
                "Structured Schema.org JobPosting markup plus automated branded social card syndication.",
            },
            {
              icon: Sparkles,
              titleAr: "سير ذاتية مفحوصة بنظام ATS",
              titleEn: "ATS-Ready GCC Candidates",
              descAr:
                "استقبل المتقدمين مباشرة على بريد شركتك أو رابط التوظيف الخاص بكم دون وسطاء.",
              descEn:
                "Receive applications directly into your HR inbox or external ATS link with zero agency fees.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 space-y-2"
              >
                <Icon className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-sm font-extrabold">
                  {lang === "ar" ? item.titleAr : item.titleEn}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === "ar" ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Submission Success Card */}
        {result ? (
          <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#09090B] p-8 sm:p-10 text-zinc-50 text-center space-y-5">
            {result.autoPublished ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-[#D4AF37] mx-auto" />
                <h2 className="text-2xl font-extrabold">
                  {lang === "ar"
                    ? `تم التحقق من نطاق شركتك ونشر (${result.publishedCount || 1}) وظيفة فوراً! ✓`
                    : `Corporate Domain Verified — ${result.publishedCount || 1} Role(s) Live! ✓`}
                </h2>
                <p className="text-sm text-zinc-300 max-w-xl mx-auto">
                  {lang === "ar"
                    ? "اجتاز بريد شركتكم فحص سجلات DNS MX بنجاح، وتم إدراج الإعلان في محرك الوظائف الموثقة وجدولة نشره التلقائي على صفحتنا."
                    : "Your corporate domain passed live DNS MX verification. Your role is now live on Asra3.com/jobs and queued for automated Facebook Page syndication."}
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  {result.slug && (
                    <Link
                      href={`/jobs/${result.slug}`}
                      className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-extrabold"
                    >
                      <span>
                        {lang === "ar"
                          ? "معاينة صفحة الوظيفة المنشورة"
                          : "View Live Job Listing"}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setTitleAr("");
                      setTitleEn("");
                      setDescription("");
                    }}
                    className="rounded-xl border border-zinc-700 px-5 py-3.5 text-xs font-bold text-zinc-200 hover:border-zinc-500 cursor-pointer"
                  >
                    {lang === "ar" ? "نشر وظيفة أخرى" : "Post Another Role"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-12 w-12 text-[#D4AF37] mx-auto" />
                <h2 className="text-2xl font-extrabold">
                  {lang === "ar"
                    ? "تم استلام طلب الوظيفة وجارٍ مراجعته من الإدارة"
                    : "Vacancy Received — Pending Quick Admin Review"}
                </h2>
                <p className="text-sm text-zinc-300 max-w-xl mx-auto">
                  {lang === "ar"
                    ? "نظراً لاستخدام بريد شخصي عام (مثل Gmail/Outlook)، تم وضع الإعلان في قائمة المراجعة السريعة لضمان جودة وموثوقية الوظائف المنشورة. للنشر الفوري في المرات القادمة استخدم بريد نطاق شركتك الرسمي."
                    : "Because a personal webmail domain was used, our team will quickly verify and publish your listing. Tip: use your @company domain next time for instant auto-publishing."}
                </p>
                <Link
                  href="/jobs"
                  className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-extrabold"
                >
                  {lang === "ar" ? "العودة لصفحة الوظائف" : "Back to Jobs Board"}
                </Link>
              </>
            )}
          </div>
        ) : (
          /* Employer Job Submission Form */
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 sm:p-10 space-y-6 shadow-sm"
          >
            {/* Hidden Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />

            {errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar" ? "اسم الشركة / المؤسسة *" : "Company Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: مجموعة الفطيم الهندسية"
                      : "e.g. Al-Futtaim Engineering"
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? "بريد الموارد البشرية الرسمي (للنشر الفوري MX) *"
                    : "Official Corporate HR Email (Instant MX Verify) *"}
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  placeholder="careers@yourcompany.ae"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? "المسمى الوظيفي (بالعربية) *"
                    : "Job Title (Arabic — optional if English filled)"}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: مهندس مشاريع ميكانيكا أول"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? "المسمى الوظيفي (بالإنجليزية) *"
                    : "Job Title (English) *"}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required={!titleAr.trim()}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Senior Mechanical Project Engineer"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar" ? "الدولة *" : "Country *"}
                </label>
                <select
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(e.target.value as CountryCode)
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {lang === "ar" ? c.name_ar : c.name_en} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar" ? "المدينة *" : "City *"}
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                >
                  {activeCountry.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {lang === "ar" ? city.name_ar : city.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar" ? "القطاع الوظيفي *" : "Industry Sector *"}
                </label>
                <select
                  value={industryId}
                  onChange={(e) => setIndustryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {lang === "ar" ? ind.name_ar : ind.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar" ? "نوع الدوام والخبرة" : "Employment Type & Experience"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(e.target.value as EmploymentType)
                    }
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-3 text-xs font-bold"
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="REMOTE">Remote</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part-Time</option>
                  </select>
                  <input
                    type="text"
                    dir="ltr"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    placeholder="3-6 Years"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? `نطاق الراتب الشهري الاختياري (${activeCountry.currency_code}) — يرفع ترتيب الوظيفة`
                    : `Optional Monthly Salary (${activeCountry.currency_code}) — Boosts Search Rank`}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    dir="ltr"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min (e.g. 12000)"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3.5 py-3 text-sm font-mono"
                  />
                  <input
                    type="number"
                    min={0}
                    dir="ltr"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max (e.g. 18000)"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3.5 py-3 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? "الموقع الإلكتروني للشركة أو رابط التقديم الخارجي (اختياري)"
                    : "Company Website or External ATS Apply Link (Optional)"}
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={companyWebsite || applyUrl}
                  onChange={(e) => {
                    setCompanyWebsite(e.target.value);
                    setApplyUrl(e.target.value);
                  }}
                  placeholder="https://yourcompany.ae/careers"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {lang === "ar"
                    ? "رقم واتساب التوظيف الاختياري (للتواصل السريع)"
                    : "Optional Recruitment WhatsApp Number"}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={applyWhatsapp}
                  onChange={(e) => setApplyWhatsapp(e.target.value)}
                  placeholder={`${activeCountry.phone_prefix} 50 000 0000`}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {lang === "ar"
                  ? "تخصصات إضافية ذات صلة بهذه الوظيفة (اختياري — إذا كانت الوظيفة مشتركة بين أكثر من قطاع)"
                  : "Additional Related Categories (Optional — for cross-functional roles)"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {industries
                  .filter((ind) => ind.id !== industryId)
                  .map((ind) => {
                    const checked = secondaryIndustries.includes(ind.id);
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() =>
                          setSecondaryIndustries((prev) =>
                            checked
                              ? prev.filter((x) => x !== ind.id)
                              : [...prev, ind.id]
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                          checked
                            ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                            : "bg-zinc-50 dark:bg-[#09090B] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {checked ? "✓ " : "+ "}
                        {lang === "ar" ? ind.name_ar : ind.name_en}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Multi-Vacancy / Multi-Category Batch Repeater */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold">
                    {lang === "ar"
                      ? "هل تطلب شركتكم شواغر أخرى في تخصصات مختلفة في نفس الوقت؟"
                      : "Hiring across multiple departments or categories simultaneously?"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {lang === "ar"
                      ? "أضف شواغر إضافية (مثل: محاسب + مهندس + موارد بشرية) ليُنشر كل شاغر في قسمه المخصص."
                      : "Add extra open roles below—each publishes as its own ranked listing in its exact category."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdditionalRoles((prev) => [
                      ...prev,
                      {
                        title_ar: "",
                        title_en: "",
                        industry_id:
                          industries.find((i) => i.id !== industryId)?.id ||
                          "finance-accounting",
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-1.5 text-xs font-bold hover:border-[#D4AF37] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    {lang === "ar"
                      ? "إضافة وظيفة بتخصص آخر"
                      : "Add Another Role / Category"}
                  </span>
                </button>
              </div>

              {additionalRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-2 border-t border-zinc-200 dark:border-zinc-800"
                >
                  <input
                    type="text"
                    value={role.title_ar}
                    onChange={(e) =>
                      setAdditionalRoles((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, title_ar: e.target.value } : r
                        )
                      )
                    }
                    placeholder={
                      lang === "ar"
                        ? "المسمى بالعربية (مثال: محاسب أول)"
                        : "Arabic Title (optional)"
                    }
                    className="sm:col-span-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={role.title_en}
                    onChange={(e) =>
                      setAdditionalRoles((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, title_en: e.target.value } : r
                        )
                      )
                    }
                    placeholder="English Title (e.g. Senior Accountant)"
                    className="sm:col-span-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3 py-2 text-xs"
                  />
                  <select
                    value={role.industry_id}
                    onChange={(e) =>
                      setAdditionalRoles((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, industry_id: e.target.value } : r
                        )
                      )
                    }
                    className="sm:col-span-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-2.5 py-2 text-xs font-bold"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {lang === "ar" ? ind.name_ar : ind.name_en}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setAdditionalRoles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="sm:col-span-1 flex items-center justify-center rounded-lg border border-red-500/30 p-2 text-red-500 cursor-pointer"
                    aria-label="Remove role"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {lang === "ar"
                  ? "المهارات الأساسية (مفصولة بفاصلة)"
                  : "Key Skills (comma-separated)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="AutoCAD, PMP, FIDIC, Bilingual Arabic/English"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                {lang === "ar"
                  ? "وصف الوظيفة والمتطلبات الأساسية *"
                  : "Role Description & Key Requirements *"}
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اكتب مهام الوظيفة والمؤهلات المطلوبة (سطر لكل متطلب لظهورها بشكل منظم في Google Jobs)..."
                    : "Outline responsibilities and key requirements (one requirement per line for clean Google Jobs formatting)..."
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-extrabold cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {lang === "ar"
                      ? "جارٍ فحص DNS MX ونشر الوظيفة..."
                      : "Verifying DNS MX & Publishing..."}
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>
                    {lang === "ar"
                      ? "فحص النطاق ونشر الوظيفة مجاناً"
                      : "Verify Domain & Publish Job Free"}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
