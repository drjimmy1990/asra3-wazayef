"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ScrollProgressRail } from "@/components/MotionPrimitives";
import { useApp } from "@/context/AppContext";
import {
  CountryCode,
  EmploymentType,
  JobPostingRecord,
  JobSearchResponse,
  JobSortOption,
} from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Globe2,
  Loader2,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface JobsBoardClientProps {
  initialData: JobSearchResponse;
  lockedCountry?: CountryCode;
  lockedIndustry?: string;
  heroHeadingAr?: string;
  heroHeadingEn?: string;
  heroSubheadingAr?: string;
  heroSubheadingEn?: string;
}

function formatRelativeAge(isoDate: string, lang: "ar" | "en"): string {
  const diffMs = Math.max(0, Date.now() - new Date(isoDate).getTime());
  const hours = Math.floor(diffMs / (1000 * 3600));
  if (hours < 1) return lang === "ar" ? "الآن" : "Just now";
  if (hours < 24) {
    return lang === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return lang === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
}

export function JobsBoardClient({
  initialData,
  lockedCountry,
  lockedIndustry,
  heroHeadingAr,
  heroHeadingEn,
  heroSubheadingAr,
  heroSubheadingEn,
}: JobsBoardClientProps) {
  const { lang, countries, industries } = useApp();

  const [data, setData] = useState<JobSearchResponse>(initialData);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<CountryCode | "">(
    lockedCountry || ""
  );
  const [cityFilter, setCityFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>(
    lockedIndustry || ""
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<JobSortOption>("rank");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    if (lockedCountry !== undefined) {
      setCountryFilter(lockedCountry);
      setCityFilter("");
    }
  }, [lockedCountry]);

  useEffect(() => {
    if (lockedIndustry !== undefined) {
      setIndustryFilter(lockedIndustry);
    }
  }, [lockedIndustry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== debouncedQuery) {
        setHasInteracted(true);
        setDebouncedQuery(searchInput.trim());
        setPage(1);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedQuery]);

  const fetchFilteredJobs = useCallback(async () => {
    if (!hasInteracted) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (countryFilter) params.set("country", countryFilter);
      if (cityFilter) params.set("city", cityFilter);
      if (industryFilter) params.set("industry", industryFilter);
      if (employmentType) params.set("type", employmentType);
      if (verifiedOnly) params.set("verified", "1");
      params.set("sort", sortBy);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const json: JobSearchResponse = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [
    hasInteracted,
    debouncedQuery,
    countryFilter,
    cityFilter,
    industryFilter,
    employmentType,
    verifiedOnly,
    sortBy,
    page,
  ]);

  useEffect(() => {
    fetchFilteredJobs();
  }, [fetchFilteredJobs]);

  const activeCountryObj = countryFilter
    ? countries.find((c) => c.code === countryFilter)
    : null;

  const getIndustryName = (id: string) => {
    const ind = industries.find((i) => i.id === id);
    if (!ind) return id;
    return lang === "ar" ? ind.name_ar : ind.name_en;
  };

  const getEmploymentLabel = (t: EmploymentType) => {
    if (lang === "ar") {
      if (t === "REMOTE") return "عن بُعد";
      if (t === "PART_TIME") return "دوام جزئي";
      if (t === "CONTRACT") return "عقد مشروع";
      return "دوام كامل";
    }
    return t.replace("_", " ");
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors"
    >
      <ScrollProgressRail />
      <Navbar />

      {/* Employer Direct Hiring Top Strip */}
      <div className="bg-[#09090B] dark:bg-[#121215] border-b border-zinc-800 px-4 py-2.5 text-xs text-zinc-200">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
            <span>
              {lang === "ar"
                ? "هل تمثل شركة توظف في الخليج؟ انشر شاغرك مجاناً بتوثيق فوري عبر سجلات DNS MX"
                : "Hiring in the GCC? Post your corporate vacancy free with instant DNS MX verification"}
            </span>
          </div>
          <Link
            href="/employers"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#D4AF37] px-3 py-1 text-[11px] font-extrabold text-[#09090B] hover:bg-[#C59F27] transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>
              {lang === "ar" ? "أضف وظيفة شركتك ←" : "Post a Job Free →"}
            </span>
          </Link>
        </div>
      </div>

      {/* Hero & Search Ranking Control Header */}
      <section className="bg-arch-grid bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-zinc-800 pt-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                <span className="gold-beacon" />
                <span>
                  {lang === "ar"
                    ? `محرك الوظائف الخليجية الموثقة • ${data.totalActiveJobs}+ شاغر نشط`
                    : `Live MX-Verified GCC Job Board • ${data.totalActiveJobs}+ Active Roles`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
                {lang === "ar"
                  ? heroHeadingAr ||
                    "الوظائف الموثقة في الإمارات والسعودية وقطر والكويت"
                  : heroHeadingEn ||
                    "Verified Corporate HR Jobs Across the GCC"}
              </h1>

              <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {lang === "ar"
                  ? heroSubheadingAr ||
                    "تُحدَّث تلقائياً على مدار الساعة وتُرتَّب خوارزمياً حسب توثيق النطاق المؤسسي (DNS MX)، حداثة النشر، وشفافية الراتب — مع تقديم مباشر لقسم الـ HR."
                  : heroSubheadingEn ||
                    "Updated automatically every few hours and ranked by corporate DNS MX trust, freshness, and salary transparency—apply directly to HR or distribute your CV to 300+ peer companies."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/employers"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#141418] px-4 py-3 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition-colors"
              >
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
                <span>
                  {lang === "ar" ? "بوابة الشركات (نشر وظيفة)" : "Employer Job Portal"}
                </span>
              </Link>
              <Link
                href={
                  countryFilter
                    ? `/?country=${countryFilter}${industryFilter ? `&industry=${industryFilter}` : ""}#wizard-section`
                    : "/#wizard-section"
                }
                className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold"
              >
                <Sparkles className="h-4 w-4 text-[#09090B]" />
                <span>
                  {lang === "ar"
                    ? "وزّع سيرتك لـ 500 شركة فوراً"
                    : "Distribute CV to 500+ HR"}
                </span>
              </Link>
            </div>
          </div>

          {/* Search & Ranking Bar */}
          <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              {/* Keyword Search */}
              <div className="lg:col-span-6 relative">
                <Search className="h-4 w-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "ابحث بالمسمى الوظيفي، المهارة، الشركة، أو المدينة (مثال: مهندس MEP، محاسب، الرياض)..."
                      : "Search job title, skill, company, or city (e.g. MEP Engineer, IFRS, Riyadh, Dubai)..."
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] ps-10 pe-4 py-3 text-xs sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Industry Selector */}
              <div className="lg:col-span-3">
                <select
                  aria-label="Filter by Industry"
                  value={industryFilter}
                  onChange={(e) => {
                    setHasInteracted(true);
                    setIndustryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] px-3.5 py-3 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">
                    {lang === "ar" ? "كل التخصصات والقطاعات" : "All Industries & Sectors"}
                  </option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {lang === "ar" ? ind.name_ar : ind.name_en} (
                      {data.countsByIndustry[ind.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Algorithmic Ranking Sort */}
              <div className="lg:col-span-3">
                <select
                  aria-label="Sort Jobs"
                  value={sortBy}
                  onChange={(e) => {
                    setHasInteracted(true);
                    setSortBy(e.target.value as JobSortOption);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] px-3.5 py-3 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="rank">
                    {lang === "ar"
                      ? "⚡ الترتيب الذكي (الأعلى موثوقية وتطابقاً)"
                      : "⚡ Smart Rank (Trust + Match + Freshness)"}
                  </option>
                  <option value="newest">
                    {lang === "ar" ? "🕒 الأحدث نشراً أولاً" : "🕒 Newest Published First"}
                  </option>
                  <option value="salary">
                    {lang === "ar" ? "💰 الأعلى راتباً" : "💰 Highest Salary Package"}
                  </option>
                  <option value="verified">
                    {lang === "ar" ? "🛡️ الموثقة بسجل MX أولاً" : "🛡️ Corporate MX-Verified First"}
                  </option>
                </select>
              </div>
            </div>

            {/* Country Filter Pills + Employment Type + MX Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setHasInteracted(true);
                    setCountryFilter("");
                    setCityFilter("");
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                    countryFilter === ""
                      ? "bg-[#09090B] text-[#D4AF37] border-[#09090B] dark:bg-[#D4AF37] dark:text-[#09090B] dark:border-[#D4AF37]"
                      : "bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {lang === "ar"
                    ? `كل الخليج (${data.totalActiveJobs})`
                    : `All GCC (${data.totalActiveJobs})`}
                </button>

                {countries.map((c) => {
                  const active = countryFilter === c.code;
                  const count = data.countsByCountry[c.code] || 0;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setHasInteracted(true);
                        setCountryFilter(c.code);
                        setCityFilter("");
                        setPage(1);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? "bg-[#09090B] text-[#D4AF37] border-[#09090B] dark:bg-[#D4AF37] dark:text-[#09090B] dark:border-[#D4AF37]"
                          : "bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      <span dir="ltr" className="font-mono text-[11px] font-extrabold">
                        {c.code}
                      </span>
                      <span>{lang === "ar" ? c.name_ar : c.name_en}</span>
                      <span className="opacity-75 font-mono text-[11px]">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasInteracted(true);
                    setVerifiedOnly((v) => !v);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                    verifiedOnly
                      ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                      : "bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    {lang === "ar" ? "شركات MX موثقة فقط" : "MX-Verified Corporate Only"}
                  </span>
                </button>

                {(["FULL_TIME", "REMOTE", "CONTRACT"] as EmploymentType[]).map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setHasInteracted(true);
                        setEmploymentType((prev) => (prev === t ? "" : t));
                        setPage(1);
                      }}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                        employmentType === t
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900"
                          : "bg-white dark:bg-[#09090B] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {getEmploymentLabel(t)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* City Sub-Filters when a Country is Selected */}
            {activeCountryObj && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 me-1 inline-flex items-center gap-1">
                  <Filter className="h-3 w-3 text-[#D4AF37]" />
                  {lang === "ar" ? "المدينة:" : "City:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHasInteracted(true);
                    setCityFilter("");
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                    cityFilter === ""
                      ? "bg-[#D4AF37] text-[#09090B]"
                      : "bg-white dark:bg-[#09090B] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {lang === "ar" ? "كل المدن" : "All Cities"}
                </button>
                {activeCountryObj.cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      setHasInteracted(true);
                      setCityFilter(city.id);
                      setPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                      cityFilter === city.id
                        ? "bg-[#D4AF37] text-[#09090B]"
                        : "bg-white dark:bg-[#09090B] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {lang === "ar" ? city.name_ar : city.name_en}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Ranked Jobs Feed */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="font-semibold">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                {lang === "ar"
                  ? "جارٍ تحديث وترتيب الوظائف..."
                  : "Ranking matching vacancies..."}
              </span>
            ) : lang === "ar" ? (
              `عرض ${data.jobs.length} من أصل ${data.total} وظيفة مطابقة`
            ) : (
              `Showing ${data.jobs.length} of ${data.total} ranked opportunities`
            )}
          </p>

          <Link
            href="/jobs/rss.xml"
            target="_blank"
            className="font-mono text-[11px] font-bold text-zinc-500 hover:text-[#D4AF37] transition-colors"
          >
            RSS 2.0 Feed ↗
          </Link>
        </div>

        {data.jobs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-12 text-center space-y-4">
            <Briefcase className="h-10 w-10 text-[#D4AF37] mx-auto" />
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "لا توجد شواغر مطابقة تماماً لفلتر البحث الحالي"
                : "No open roles match this exact filter combination"}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
              {lang === "ar"
                ? "أغلب الشركات في الخليج توظف عبر الفرز الداخلي المباشر قبل نشر الإعلانات. أرسل سيرتك الذاتية مباشرة إلى صناديق بريد الـ HR في تخصصك الآن."
                : "Over 70% of GCC roles are filled directly from HR inboxes before public job postings go live. Send your ATS-optimized CV directly to verified HR managers now."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedQuery("");
                  setCountryFilter(lockedCountry || "");
                  setCityFilter("");
                  setIndustryFilter(lockedIndustry || "");
                  setEmploymentType("");
                  setVerifiedOnly(false);
                }}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                {lang === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </button>
              <Link
                href="/#wizard-section"
                className="btn-gold rounded-xl px-5 py-2.5 text-xs font-extrabold"
              >
                {lang === "ar"
                  ? "أطلق حملة إرسال مباشر للـ HR ←"
                  : "Launch Direct HR Campaign →"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {data.jobs.map((job: JobPostingRecord) => {
              const title = lang === "ar" ? job.title_ar : job.title_en;
              const summary = lang === "ar" ? job.summary_ar : job.summary_en;
              const city = lang === "ar" ? job.city_name_ar : job.city_name_en;
              const wizardHref = `/?country=${job.country_code}&city=${job.city_id}&industry=${job.industry_id}&role=${encodeURIComponent(job.title_en)}#wizard-section`;

              return (
                <article
                  key={job.id}
                  className={`exec-card-interactive flex flex-col justify-between rounded-2xl border p-6 transition-colors ${
                    job.is_featured
                      ? "border-2 border-[#D4AF37] bg-white dark:bg-[#141418]"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          dir="ltr"
                          className="rounded-md bg-[#09090B] px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#D4AF37]"
                        >
                          {job.country_code}
                        </span>

                        {job.is_featured && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#D4AF37] px-2 py-0.5 text-[10px] font-extrabold text-[#09090B]">
                            <Flame className="h-3 w-3" />
                            {lang === "ar" ? "مميز" : "FEATURED"}
                          </span>
                        )}

                        {job.is_mx_verified && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-800 dark:text-[#D4AF37]">
                            <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" />
                            {lang === "ar" ? "HR موثق MX" : "MX-Verified HR"}
                          </span>
                        )}

                        {job.source_type === "employer_direct" && (
                          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {lang === "ar" ? "شركة مباشرة" : "Direct Employer"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {job.rank_score !== undefined && sortBy === "rank" && (
                          <span
                            dir="ltr"
                            className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                            title="Asra3 Relevance & Trust Rank"
                          >
                            <TrendingUp className="h-3 w-3 text-[#D4AF37]" />
                            {Math.min(99, Math.round(job.rank_score))}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#D4AF37]" />
                          {formatRelativeAge(job.published_at, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Title & Company */}
                    <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-snug">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] transition-colors"
                      >
                        {title}
                      </Link>
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold">
                        <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                        {job.company_name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                        {city}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {getIndustryName(job.industry_id)}
                      </span>
                    </div>

                    {/* Salary & Experience Strip */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {job.salary_min && job.salary_max ? (
                        <span
                          dir="ltr"
                          className="rounded-md bg-[#09090B] dark:bg-zinc-900 border border-zinc-800 px-2.5 py-1 font-mono text-xs font-extrabold text-[#D4AF37]"
                        >
                          {job.salary_min.toLocaleString()} –{" "}
                          {job.salary_max.toLocaleString()} {job.salary_currency}
                        </span>
                      ) : (
                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          {lang === "ar"
                            ? "الراتب يحدد حسب الخبرة"
                            : "Competitive GCC Package"}
                        </span>
                      )}
                      <span className="rounded-md border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        {getEmploymentLabel(job.employment_type)}
                      </span>
                      <span
                        dir="ltr"
                        className="rounded-md border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                      >
                        {job.experience_level}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="mt-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {summary}
                    </p>

                    {/* Skills */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 5).map((sk) => (
                        <span
                          key={sk}
                          dir="ltr"
                          className="rounded-md bg-zinc-100 dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dual CTA Footer: Direct Apply + 300 Similar HR Upsell */}
                  <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-[#D4AF37] dark:text-[#09090B] dark:hover:bg-[#C59F27] px-4 py-2.5 text-xs font-extrabold transition-colors"
                    >
                      <span>
                        {lang === "ar"
                          ? "التفاصيل والتقديم المباشر"
                          : "View & Apply Direct"}
                      </span>
                      {lang === "ar" ? (
                        <ArrowLeft className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                    </Link>

                    <Link
                      href={wizardHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:underline"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>
                        {lang === "ar"
                          ? "أرسل لـ 300 شركة مماثلة"
                          : "Send CV to 300 Similar HR"}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setHasInteracted(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-4 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              {lang === "ar" ? "السابق" : "Previous"}
            </button>
            <span className="text-xs font-bold px-3">
              {page} / {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => {
                setHasInteracted(true);
                setPage((p) => Math.min(data.totalPages, p + 1));
              }}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-4 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              {lang === "ar" ? "التالي" : "Next"}
            </button>
          </div>
        )}

        {/* Conversion Flywheel Banner */}
        <section className="rounded-2xl border-2 border-[#D4AF37] bg-[#09090B] p-7 sm:p-10 text-zinc-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-extrabold text-[#09090B]">
                3.4× FASTER INTERVIEWS
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                {lang === "ar"
                  ? "لا تكتفِ بالتقديم على إعلان واحد — أوصل سيرتك الذاتية إلى 500+ مدير توظيف في تخصصك"
                  : "Don't Wait on Single Listings — Place Your CV Inside 500+ Verified GCC HR Inboxes"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {lang === "ar"
                  ? "يقوم محرك أسرع بفحص سيرتك الذاتية بنظام ATS، كتابة خطاب تقديم تنفيذي مخصص، وإيداعها مباشرة في صناديق بريد الموارد البشرية مع حجب جهة عملك الحالية بنسبة 100%."
                  : "Asra3 audits your CV for ATS compliance, writes an executive cover letter, shields your current employer, and dispatches directly to verified HR decision-makers."}
              </p>
            </div>
            <Link
              href={
                countryFilter
                  ? `/?country=${countryFilter}${industryFilter ? `&industry=${industryFilter}` : ""}#wizard-section`
                  : "/#wizard-section"
              }
              className="btn-gold shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-extrabold"
            >
              <span>
                {lang === "ar"
                  ? "افحص سيرتك الذاتية مجاناً الآن"
                  : "Scan My CV & Start Campaign →"}
              </span>
            </Link>
          </div>
        </section>

        {/* Programmatic SEO Regional & Sector Directory Links */}
        <nav
          aria-label="GCC Regional & Sector Job Directories"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-800 dark:text-[#D4AF37]">
            <Globe2 className="h-4 w-4 text-[#D4AF37]" />
            <span>
              {lang === "ar"
                ? "أدلة الوظائف المتخصصة حسب الدولة والقطاع"
                : "Browse Verified GCC Jobs by Market & Sector"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              { href: "/ae/jobs", ar: "وظائف الإمارات", en: "UAE Jobs" },
              { href: "/sa/jobs", ar: "وظائف السعودية", en: "Saudi Arabia Jobs" },
              { href: "/qa/jobs", ar: "وظائف قطر", en: "Qatar Jobs" },
              { href: "/kw/jobs", ar: "وظائف الكويت", en: "Kuwait Jobs" },
              {
                href: "/ae/jobs/engineering",
                ar: "وظائف هندسة في الإمارات",
                en: "Engineering Jobs UAE",
              },
              {
                href: "/sa/jobs/engineering",
                ar: "وظائف هندسة في السعودية",
                en: "Engineering Jobs KSA",
              },
              {
                href: "/sa/jobs/it-software",
                ar: "وظائف تقنية وأمن سيبراني بالسعودية",
                en: "IT & Cyber Jobs KSA",
              },
              {
                href: "/ae/jobs/it-software",
                ar: "وظائف برمجة وذكاء اصطناعي بدبي",
                en: "Software & AI Jobs Dubai",
              },
              {
                href: "/qa/jobs/finance-accounting",
                ar: "وظائف محاسبة ومالية في قطر",
                en: "Finance Jobs Qatar",
              },
              {
                href: "/kw/jobs/finance-accounting",
                ar: "وظائف بنوك ومحاسبة بالكويت",
                en: "Banking & Finance Kuwait",
              },
              {
                href: "/sa/jobs/healthcare",
                ar: "وظائف طبية وتمريض بالسعودية",
                en: "Healthcare Jobs KSA",
              },
              {
                href: "/ae/jobs/real-estate",
                ar: "وظائف عقارات ومبيعات بالإمارات",
                en: "Real Estate Jobs UAE",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] transition-colors"
              >
                {lang === "ar" ? item.ar : item.en}
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
