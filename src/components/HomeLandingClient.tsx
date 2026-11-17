"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Asra3Logo } from "@/components/Asra3Logo";
import { DistributionWizard } from "@/components/DistributionWizard";
import { useApp } from "@/context/AppContext";
import { getTranslation } from "@/lib/i18n";
import { CountryCode, Language, PackageId } from "@/lib/types";
import {
  AnimatedCounter,
  EnterpriseTickerStrip,
  LiveSignalEqualizer,
  RevealOnScroll,
  ScrollProgressRail,
} from "@/components/MotionPrimitives";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronDown,
  Clock,
  FileCheck2,
  Globe2,
  MailCheck,
  MapPin,
  Minus,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const HERO_ROLE_SPOTLIGHTS = [
  {
    code: "AE",
    roleAr: "مهندس مشاريع أول · دبي (DIFC)",
    roleEn: "Senior Project Manager · Dubai DIFC",
    before: 62,
    after: 95,
  },
  {
    code: "SA",
    roleAr: "معماري أمن سحابي · الرياض (KAFD)",
    roleEn: "Principal Cloud & Security Architect · Riyadh KAFD",
    before: 58,
    after: 96,
  },
  {
    code: "QA",
    roleAr: "مراقب مالي أول (IFRS) · الدوحة",
    roleEn: "Senior Financial Controller (IFRS) · Doha West Bay",
    before: 64,
    after: 94,
  },
  {
    code: "KW",
    roleAr: "مدير عمليات وتجزئة إقليمي · الكويت",
    roleEn: "Regional Retail & Ops Lead · Kuwait City",
    before: 61,
    after: 95,
  },
];

const LIVE_DISPATCH_FEED = [
  {
    idx: "01",
    code: "AE",
    roleAr: "مهندس مشاريع مدني أول (PMP)",
    roleEn: "Senior Civil Project Manager",
    company: "Emaar Properties PJSC",
    cityAr: "دبي • الإمارات",
    cityEn: "Dubai • UAE",
    statusAr: "فُتِح من مدير التوظيف",
    statusEn: "Opened by HR Director",
    timeAr: "الآن",
    timeEn: "Just now",
    highlight: true,
  },
  {
    idx: "02",
    code: "SA",
    roleAr: "مهندس معماري سحابي ونظم",
    roleEn: "Principal Cloud & AI Architect",
    company: "ROSHN Group & Elm Digital",
    cityAr: "الرياض • السعودية",
    cityEn: "Riyadh • KSA",
    statusAr: "تم الإيداع + خطاب تنفيذي",
    statusEn: "Placed + Executive Letter",
    timeAr: "قبل 18 ث",
    timeEn: "18s ago",
    highlight: false,
  },
  {
    idx: "03",
    code: "QA",
    roleAr: "مراقب مالي أول (IFRS / CPA)",
    roleEn: "Senior Financial Controller",
    company: "Qatar National Bank (QNB)",
    cityAr: "الدوحة • قطر",
    cityEn: "Doha • Qatar",
    statusAr: "وصل لصندوق استقطاب الكفاءات",
    statusEn: "Delivered to Talent Desk",
    timeAr: "قبل 42 ث",
    timeEn: "42s ago",
    highlight: false,
  },
  {
    idx: "04",
    code: "KW",
    roleAr: "مدير تطوير العلامات التجارية",
    roleEn: "Regional Brand & Growth Lead",
    company: "M.H. Alshaya Group",
    cityAr: "مدينة الكويت • الكويت",
    cityEn: "Kuwait City • KW",
    statusAr: "قيد المراجعة لدى الـ HR",
    statusEn: "Reviewed by Talent Lead",
    timeAr: "قبل دقيقة",
    timeEn: "1m ago",
    highlight: true,
  },
  {
    idx: "05",
    code: "AE",
    roleAr: "مدير سلسلة الإمداد والموانئ",
    roleEn: "Supply Chain & Logistics Lead",
    company: "DP World & Jebel Ali Free Zone",
    cityAr: "دبي • الإمارات",
    cityEn: "Jebel Ali • UAE",
    statusAr: "فُتِح من مدير الموارد البشرية",
    statusEn: "Opened by HR Lead",
    timeAr: "قبل 2 د",
    timeEn: "2m ago",
    highlight: true,
  },
  {
    idx: "06",
    code: "SA",
    roleAr: "استشاري تحول رقمي وأمن سيبراني",
    roleEn: "Cybersecurity & GovTech Lead",
    company: "stc Group & Aramco Digital",
    cityAr: "الرياض والظهران • السعودية",
    cityEn: "Riyadh & Dhahran • KSA",
    statusAr: "تم تسليم الملف + Reply-To مباشر",
    statusEn: "Dossier Delivered + Direct Reply-To",
    timeAr: "قبل 3 د",
    timeEn: "3m ago",
    highlight: false,
  },
  {
    idx: "07",
    code: "QA",
    roleAr: "مهندس ميكانيكا أول (LNG / MEP)",
    roleEn: "Lead Mechanical & LNG Engineer",
    company: "QatarEnergy Industrial Hub",
    cityAr: "لوسيل وراس لفان • قطر",
    cityEn: "Lusail & Ras Laffan • QA",
    statusAr: "قيد المراجعة الفنية للـ HR",
    statusEn: "Reviewed by Talent Screening",
    timeAr: "قبل 4 د",
    timeEn: "4m ago",
    highlight: true,
  },
  {
    idx: "08",
    code: "KW",
    roleAr: "مدير تدقيق ومخاطر مصرفية",
    roleEn: "Senior Banking Risk & Audit Lead",
    company: "National Bank of Kuwait (NBK)",
    cityAr: "شرق • مدينة الكويت",
    cityEn: "Sharq • Kuwait City",
    statusAr: "تم الإيداع المباشر بالـ HR",
    statusEn: "Placed Direct in HR Inbox",
    timeAr: "قبل 5 د",
    timeEn: "5m ago",
    highlight: false,
  },
];

const COUNTRY_HIGHLIGHTS: Record<
  string,
  {
    hubsAr: string;
    hubsEn: string;
    sectorsAr: string[];
    sectorsEn: string[];
    responseRate: string;
  }
> = {
  AE: {
    hubsAr: "دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة",
    hubsEn: "Dubai, Abu Dhabi, Sharjah, Ajman & RAK",
    sectorsAr: [
      "التطوير العقاري والهندسة",
      "الذكاء الاصطناعي والتقنية المالية",
      "الضيافة الفاخرة والتجزئة",
      "الاستشارات والخدمات المالية",
    ],
    sectorsEn: [
      "Real Estate & MEP Engineering",
      "AI, Cloud & FinTech",
      "Luxury Hospitality & Retail",
      "Investment & Corporate Finance",
    ],
    responseRate: "48h – 72h",
  },
  SA: {
    hubsAr: "الرياض، جدة، الدمام والخبر، نيوم، مكة",
    hubsEn: "Riyadh, Jeddah, Dammam/Khobar, NEOM & Makkah",
    sectorsAr: [
      "مشاريع رؤية 2030 الكبرى",
      "الأمن السيبراني والحكومة الرقمية",
      "المجموعات الطبية والرعاية",
      "سلاسل الإمداد والصناعة",
    ],
    sectorsEn: [
      "Vision 2030 Giga-Projects",
      "Cybersecurity & GovTech",
      "Healthcare & Medical Groups",
      "Industrial & Supply Chain",
    ],
    responseRate: "24h – 72h",
  },
  QA: {
    hubsAr: "الدوحة، لوسيل، الوكرة، الخور",
    hubsEn: "Doha, Lusail, Al Wakrah & Al Khor",
    sectorsAr: [
      "الطاقة والبنية التحتية",
      "المصارف وإدارة الأصول",
      "الضيافة والفنادق ذات الـ 5 نجوم",
      "الاتصالات والتحول الرقمي",
    ],
    sectorsEn: [
      "Energy & Civil Infrastructure",
      "Private Banking & Advisory",
      "5-Star Hospitality Groups",
      "Telecom & Digital Systems",
    ],
    responseRate: "48h – 96h",
  },
  KW: {
    hubsAr: "مدينة الكويت، حولي، السالمية، الفروانية",
    hubsEn: "Kuwait City, Hawalli, Salmiya & Farwaniya",
    sectorsAr: [
      "مجموعات التجزئة والوكالات العالمية",
      "القطاع المصرفي والتدقيق",
      "الهندسة والنفط والمقاولات",
      "الخدمات اللوجستية الإقليمية",
    ],
    sectorsEn: [
      "Global Retail & Franchise Groups",
      "Banking & Financial Audit",
      "Oil, Gas & Contracting",
      "Regional Logistics",
    ],
    responseRate: "48h – 96h",
  },
};

export interface HomeLandingClientProps {
  initialCountryCode?: CountryCode;
  initialLang?: Language;
  countryHubBanner?: {
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
  };
  seoSection?: React.ReactNode;
}

export function HomeLandingClient({
  initialCountryCode,
  initialLang,
  countryHubBanner,
  seoSection,
}: HomeLandingClientProps) {
  const {
    lang: ctxLang,
    setLang,
    t: ctxT,
    countries,
    packages,
    selectedCountryCode,
    setSelectedCountryCode,
    selectedCountry,
  } = useApp();

  const [hasMounted, setHasMounted] = useState(false);
  const initializedLangRef = React.useRef(false);

  const lang: Language = !hasMounted && initialLang ? initialLang : ctxLang;
  const t = !hasMounted && initialLang ? getTranslation(initialLang) : ctxT;

  const [wizardExternalPkg, setWizardExternalPkg] =
    useState<PackageId | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [roleSpotlightIdx, setRoleSpotlightIdx] = useState(0);
  const [feedOffset, setFeedOffset] = useState(0);
  const [liveTodayCount, setLiveTodayCount] = useState(1284);
  const [feedPaused, setFeedPaused] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (initialLang && !initializedLangRef.current) {
      initializedLangRef.current = true;
      setLang(initialLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLang]);

  useEffect(() => {
    if (initialCountryCode) {
      setSelectedCountryCode(initialCountryCode);
    }
  }, [initialCountryCode, setSelectedCountryCode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem("asra3_last_token") ||
          localStorage.getItem("wazayef_last_token");
        if (saved) setLastToken(saved);
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const spotlightTimer = window.setInterval(() => {
      setRoleSpotlightIdx((prev) => (prev + 1) % HERO_ROLE_SPOTLIGHTS.length);
    }, 2800);
    return () => window.clearInterval(spotlightTimer);
  }, []);

  useEffect(() => {
    if (
      feedPaused ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const feedTimer = window.setInterval(() => {
      setFeedOffset((prev) => (prev + 1) % LIVE_DISPATCH_FEED.length);
      setLiveTodayCount((prev) => prev + 1);
    }, 3200);
    return () => window.clearInterval(feedTimer);
  }, [feedPaused]);

  const orderedFeed = [
    ...LIVE_DISPATCH_FEED.filter((item) => item.code === selectedCountryCode),
    ...LIVE_DISPATCH_FEED.filter((item) => item.code !== selectedCountryCode),
  ];
  const visibleFeed = Array.from(
    { length: 4 },
    (_, i) => orderedFeed[(feedOffset + i) % orderedFeed.length]
  );
  const activeSpotlight = HERO_ROLE_SPOTLIGHTS[roleSpotlightIdx];

  const currency = selectedCountry.currency_code;
  const currencySymbol =
    lang === "ar"
      ? selectedCountry.currency_symbol_ar
      : selectedCountry.currency_symbol_en;

  const faqs =
    lang === "ar"
      ? [
          {
            q: "كيف تصل ردود الشركات ومسؤولي التوظيف إليّ عبر منصة أسرع (Asra3.com)؟",
            a: "عند إرسال سيرتك الذاتية إلى أقسام الـ HR، نقوم بضبط عنوان الرد المباشر (Reply-To) ليكون بريدك الإلكتروني الشخصي، مع إرفاق رقم هاتفك والواتساب في السيرة الذاتية وخطاب التقديم. أي مسؤول توظيف يضغط على (رد / Reply) يتواصل معك شخصياً دون أي وسيط.",
          },
          {
            q: "هل يمكنني استهداف أكثر من دولة خليجية في نفس الحملة؟",
            a: "نعم! يمكنك اختيار دولتك الأساسية (مثل الإمارات أو السعودية) في الخطوة الأولى، ثم تفعيل دول خليجية إضافية في الخطوة الثالثة بخصم فوري 50% لمضاعفة وصولك في حملة واحدة.",
          },
          {
            q: "أعمل حالياً في شركة داخل نفس الدولة، كيف أضمن عدم وصول سيرتي الذاتية لشركتي الحالية؟",
            a: "وفرنا في الخطوة الرابعة (الدفع والتأكيد) حقل (استثناء جهة عملك الحالية للسرية التامة). بمجرد كتابة نطاق شركتك الحالية (مثال: mycompany.ae)، يحظر محرك أسرع إرسال أي بريد مطابق لهذا النطاق بنسبة 100%.",
          },
          {
            q: "ما هي طرق الدفع المتاحة عبر بوابة EasyKash؟",
            a: "ندعم الدفع الفوري والآمن لمرة واحدة (بدون أي اشتراك شهري متكرر) عبر بوابة EasyKash DirectPayV1 المؤمنة بتشفير HMAC-SHA512، باستخدام البطاقات البنكية (Visa / Mastercard / Mada)، المحافظ الإلكترونية، Apple Pay، وقنوات الدفع المعتمدة.",
          },
          {
            q: "كيف أتابع الشركات التي استلمت سيرتي الذاتية بعد الدفع؟",
            a: "فور إتمام الدفع، تحصل على رمز تتبع خاص يبدأ بـ (ASR-) وتنتقل تلقائياً إلى لوحة التتبع الحية (/track) لمشاهدة شريط الإرسال التدريجي، وجدول الشركات المستلمة، ونسخة خطاب التقديم بالذكاء الاصطناعي وملف سيرتك الذاتية.",
          },
        ]
      : [
          {
            q: "How do HR managers and recruiters reply to me on Asra3.com?",
            a: "Every outreach email is dispatched with the Reply-To header set directly to your personal email address, alongside your phone/WhatsApp on your CV and cover letter. When an HR manager clicks Reply, it lands straight in your personal inbox.",
          },
          {
            q: "Can I target multiple GCC countries in a single campaign?",
            a: "Yes! Select your primary market in Step 1 (e.g., UAE or Saudi Arabia), and in Step 3 you can add extra GCC countries at 50% off so your CV reaches verified employers across multiple Gulf hubs simultaneously.",
          },
          {
            q: "I am currently employed. Can I exclude my current company from receiving my CV?",
            a: "Absolutely. In Step 4 (Checkout & Confirmation) of the wizard, enter your current employer's domain in the 'Confidentiality Exclusion' field and Asra3's dispatch engine strictly blocks any HR contact matching that domain.",
          },
          {
            q: "What payment methods are supported via EasyKash?",
            a: "We process one-time transparent payments (zero recurring subscriptions) via EasyKash DirectPayV1 secured with HMAC-SHA512 verification, supporting Visa, Mastercard, Mada, Apple Pay, Mobile Wallets, Meeza, and Cash Voucher channels.",
          },
          {
            q: "How can I verify which companies received my CV?",
            a: "Immediately after checkout, you receive your unique ASR- tracking code and instant access to your Live Tracking Portal (/track) showing real-time smart-drip progress, every contacted company, your AI Cover Letter, and your CV file.",
          },
        ];

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors"
    >
      <ScrollProgressRail />
      <Navbar />

      <main id="main-content" className="flex-1 flex flex-col">

      {/* Returning Candidate Active Campaign Strip */}
      {lastToken && (
        <div className="bg-[#09090B] dark:bg-[#141417] border-b border-zinc-800 px-4 py-2.5 text-center text-xs text-zinc-200">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Radio className="h-3.5 w-3.5 text-[#D4AF37]" />
              {lang === "ar"
                ? "لديك حملة توزيع نشطة حالياً على منصة أسرع"
                : "You have an active Asra3 outreach campaign in progress"}
            </span>
            <Link
              href={`/track/${lastToken}`}
              className="btn-gold rounded-md px-3 py-1 text-[11px] font-extrabold"
            >
              {lang === "ar" ? "فتح سجل التتبع ←" : "Open Live Ledger →"}
            </Link>
          </div>
        </div>
      )}

      {/* Optional Country Hub Dedicated Context Strip */}
      {countryHubBanner && (
        <div className="bg-zinc-100 dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-center text-xs text-zinc-700 dark:text-zinc-300">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded bg-[#09090B] px-2.5 py-0.5 font-bold text-[#D4AF37]">
              {lang === "ar"
                ? countryHubBanner.titleAr
                : countryHubBanner.titleEn}
            </span>
            <span>
              {lang === "ar"
                ? countryHubBanner.subtitleAr
                : countryHubBanner.subtitleEn}
            </span>
          </div>
        </div>
      )}

      {/* ================= HERO SECTION (LIGHT & DARK NATIVE, ZERO GRADIENTS) ================= */}
      <section className="bg-arch-grid bg-white dark:bg-[#09090B] pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Primary Editorial Column (7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-start">
              {/* Top Kicker Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-1.5 mb-6">
                <span className="gold-beacon" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {lang === "ar"
                    ? selectedCountry.hero_badge_ar
                    : selectedCountry.hero_badge_en}
                </span>
              </div>

              {/* Main Display Headline — Crisp Black/White + Pure Black/Gold Country Highlight */}
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.18] text-zinc-950 dark:text-zinc-50">
                {t.heroTitlePart1}{" "}
                <span className="inline-block rounded-xl bg-[#09090B] dark:bg-[#16161A] dark:border dark:border-zinc-700 px-3.5 py-0.5 text-[#D4AF37]">
                  {lang === "ar"
                    ? selectedCountry.name_ar
                    : selectedCountry.name_en}
                </span>
              </h1>

              {/* Live Executive Role ATS Uplift Spotlight Pill */}
              <div
                key={roleSpotlightIdx}
                className="animate-panel-enter mt-4 inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-2 text-xs shadow-sm"
              >
                <span
                  dir="ltr"
                  className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#D4AF37]"
                >
                  {activeSpotlight.code}
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {lang === "ar"
                    ? activeSpotlight.roleAr
                    : activeSpotlight.roleEn}
                </span>
                <span
                  dir="ltr"
                  className="font-mono text-[11px] font-extrabold text-[#9A7B1C] dark:text-[#D4AF37]"
                >
                  ATS {activeSpotlight.before}% → {activeSpotlight.after}%
                </span>
              </div>

              <p className="mt-5 max-w-2xl mx-auto lg:mx-0 text-base sm:text-[17px] text-zinc-600 dark:text-zinc-400 leading-[1.75]">
                {t.heroSubtitle}
              </p>

              {/* Inline Market Switcher Pills */}
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {countries.map((c) => {
                  const active = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountryCode(c.code)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? "border-[#09090B] bg-[#09090B] text-white dark:border-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span
                        dir="ltr"
                        className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          active
                            ? "bg-[#D4AF37] text-[#09090B] dark:bg-[#09090B] dark:text-[#D4AF37]"
                            : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-[#D4AF37]"
                        }`}
                      >
                        {c.code}
                      </span>
                      <span>{lang === "ar" ? c.name_ar : c.name_en}</span>
                    </button>
                  );
                })}
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <a
                  href="#wizard-section"
                  className="btn-gold inline-flex items-center gap-3 rounded-xl px-7 py-4 text-sm sm:text-base font-extrabold"
                >
                  <span>{t.heroCtaPrimary}</span>
                  {lang === "ar" ? (
                    <ArrowLeft className="h-5 w-5 text-[#09090B]" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-[#09090B]" />
                  )}
                </a>

                <Link
                  href="/track/demo-uae-campaign-2026"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121215] px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:border-zinc-900 dark:hover:border-[#D4AF37] transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span>
                    {lang === "ar"
                      ? "معاينة لوحة التتبع الحية"
                      : "Preview Live Tracking Ledger"}
                  </span>
                </Link>
              </div>

              {/* Clean 3-Point Feature Strip */}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#D4AF37]" />
                  {lang === "ar"
                    ? "إعداد كامل خلال 3 دقائق"
                    : "3-Minute Setup"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#D4AF37]" />
                  {lang === "ar"
                    ? "فحص ATS حقيقي + خطاب تقديم"
                    : "Real ATS Audit + Cover Letter"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#D4AF37]" />
                  {lang === "ar"
                    ? "ردود الـ HR لبريدك مباشرة"
                    : "Direct HR Replies to Your Inbox"}
                </span>
              </div>
            </div>

            {/* Right Column: Kinetic Obsidian Executive Dispatch Terminal (5 cols) */}
            <div className="lg:col-span-5">
              <div
                onMouseEnter={() => setFeedPaused(true)}
                onMouseLeave={() => setFeedPaused(false)}
                className="rounded-2xl border border-zinc-800 bg-[#09090B] dark:bg-[#121215] p-6 text-zinc-50 shadow-[0_24px_60px_rgba(9,9,11,0.14)] dark:shadow-none"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="gold-beacon" />
                    <LiveSignalEqualizer />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-200">
                      {lang === "ar"
                        ? "سجل الإيداع المباشر"
                        : "LIVE DISPATCH // HR"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      dir="ltr"
                      className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300"
                    >
                      <AnimatedCounter
                        value={liveTodayCount}
                        suffix={lang === "ar" ? " اليوم" : " TODAY"}
                      />
                    </span>
                    <span
                      dir="ltr"
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#D4AF37]"
                    >
                      MX VERIFIED
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {visibleFeed.map((item, idx) => (
                    <div
                      key={`${item.idx}-${feedOffset}`}
                      className={`relative overflow-hidden rounded-xl border px-3.5 py-3 transition-colors ${
                        idx === 0
                          ? "animate-panel-enter border-[#D4AF37]/60 bg-[#141418] dark:bg-[#0D0D10]"
                          : "border-zinc-800/90 bg-[#121215] dark:bg-[#09090B]"
                      }`}
                    >
                      {idx === 0 && !feedPaused && (
                        <span
                          aria-hidden="true"
                          className="absolute top-0 inset-x-0 h-[2px] bg-[#D4AF37] animate-sweep-bar"
                        />
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            dir="ltr"
                            className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-[#D4AF37] shrink-0"
                          >
                            {item.code}
                          </span>
                          <span className="text-xs font-bold text-zinc-100 truncate">
                            {lang === "ar" ? item.roleAr : item.roleEn}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold border ${
                            item.highlight
                              ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                              : "border-zinc-700 bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          {lang === "ar" ? item.statusAr : item.statusEn}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="font-medium text-zinc-300 truncate">
                          {item.company}
                        </span>
                        <span className="shrink-0 flex items-center gap-2">
                          <span>
                            {lang === "ar" ? item.cityAr : item.cityEn}
                          </span>
                          <span className="font-mono text-[10px] text-[#D4AF37]">
                            {idx === 0
                              ? lang === "ar"
                                ? "الآن"
                                : "Now"
                              : lang === "ar"
                              ? item.timeAr
                              : item.timeEn}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Cities Breakdown inside Terminal */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedCountry.cities.slice(0, 4).map((city) => (
                      <span
                        key={city.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300"
                      >
                        <span>
                          {lang === "ar" ? city.name_ar : city.name_en}
                        </span>
                        <span className="font-mono font-bold text-[#D4AF37]">
                          {city.companies_count}
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-center text-xs text-zinc-200 font-semibold">
                    <span className="text-[#D4AF37] font-bold">
                      <AnimatedCounter
                        value={selectedCountry.display_companies_count}
                        suffix="+"
                      />
                    </span>{" "}
                    {lang === "ar"
                      ? `شركة مفحوصة ونشطة حالياً في ${selectedCountry.name_ar}`
                      : `verified active employers in ${selectedCountry.name_en}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Architectural Metrics Bento Grid */}
          <div className="mt-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-zinc-200 dark:divide-zinc-800">
              {[
                {
                  idx: "01",
                  numValue: selectedCountry.display_companies_count,
                  decimals: 0,
                  prefix: "",
                  suffix: "+",
                  label: t.statVerifiedCompanies,
                },
                {
                  idx: "02",
                  numValue: 18400,
                  decimals: 0,
                  prefix: "",
                  suffix: "+",
                  label: t.statCvsDistributed,
                },
                {
                  idx: "03",
                  numValue: 4,
                  decimals: 0,
                  prefix: "0",
                  suffix: " GCC",
                  label: t.statGCCCountries,
                },
                {
                  idx: "04",
                  numValue: 3.4,
                  decimals: 1,
                  prefix: "",
                  suffix: "×",
                  label: t.statAvgInterviewRate,
                },
              ].map((stat) => (
                <div
                  key={stat.idx}
                  className="exec-card-interactive p-6 text-center sm:text-start"
                >
                  <div className="flex items-center justify-center sm:justify-between mb-2">
                    <span
                      dir="ltr"
                      className="rounded bg-[#09090B] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]"
                    >
                      {stat.idx}
                    </span>
                  </div>
                  <div
                    dir="ltr"
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 tabular-nums"
                  >
                    <AnimatedCounter
                      value={stat.numValue}
                      decimals={stat.decimals}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EnterpriseTickerStrip lang={lang} />

      {/* ================= 4-STEP CAMPAIGN WIZARD SECTION ================= */}
      <section
        id="wizard-section"
        className="bg-[#F4F4F5] dark:bg-[#0D0D10] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
      >
        <div className="mx-auto max-w-5xl text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-md bg-[#09090B] px-3.5 py-1 text-xs font-bold text-[#D4AF37]">
            <Sparkles className="h-3.5 w-3.5" />
            {t.wizardBadge}
          </span>
          <h2 className="mt-3.5 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {t.wizardTitle}
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t.wizardSubtitle}
          </p>
        </div>

        <DistributionWizard externalPackageId={wizardExternalPkg} />
      </section>

      {/* ================= GCC MARKET HUBS SECTION ================= */}
      <section
        id="countries-section"
        className="bg-white dark:bg-[#09090B] py-20 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-3.5 py-1 text-xs font-bold text-zinc-900 dark:text-[#D4AF37]">
              <Globe2 className="h-3.5 w-3.5 text-[#D4AF37]" />
              {lang === "ar"
                ? "بوابات مخصصة لكل سوق خليجي"
                : "Dedicated GCC Market Hubs"}
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "أدلة شركات مفصولة ومحدّثة لكل عاصمة اقتصادية"
                : "Curated Employer Directories Across Four Gulf Economies"}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "اضغط على أي سوق لتفعيل عملته المحلية واستعراض أبرز القطاعات النشطة في استقطاب الكفاءات."
                : "Select any Gulf jurisdiction to preview hiring velocity, active cities, and local currency billing."}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {countries.map((c, countryIdx) => {
              const info = COUNTRY_HIGHLIGHTS[c.code] || COUNTRY_HIGHLIGHTS.AE;
              const isSelected = c.code === selectedCountryCode;
              const sectors = lang === "ar" ? info.sectorsAr : info.sectorsEn;
              const countryPath = `/${c.code.toLowerCase()}`;

              return (
                <RevealOnScroll
                  key={c.code}
                  delayMs={countryIdx * 70}
                  className="flex"
                >
                  <div
                    onClick={() => setSelectedCountryCode(c.code)}
                    className={`exec-card-interactive w-full flex flex-col justify-between rounded-2xl border p-6 cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#09090B] dark:border-[#D4AF37] bg-zinc-50 dark:bg-[#141418]"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <span
                        dir="ltr"
                        className="inline-flex h-10 w-12 items-center justify-center rounded-lg bg-[#09090B] font-mono text-base font-extrabold text-[#D4AF37]"
                      >
                        {c.code}
                      </span>
                      <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-200">
                        {c.display_companies_count.toLocaleString()}+ HR
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-zinc-950 dark:text-zinc-50">
                      <Link
                        href={countryPath}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {lang === "ar" ? c.name_ar : c.name_en}
                      </Link>
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                      <span>{lang === "ar" ? info.hubsAr : info.hubsEn}</span>
                    </p>

                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                        {lang === "ar"
                          ? "القطاعات الأعلى طلباً:"
                          : "Key Hiring Sectors:"}
                      </p>
                      <ul className="space-y-2">
                        {sectors.map((sec, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                            <span>{sec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {info.responseRate}
                    </span>
                    <Link
                      href={countryPath}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-bold text-zinc-950 dark:text-[#D4AF37] hover:underline"
                    >
                      <span>
                        {lang === "ar" ? "بوابة الدولة" : "Explore Hub"}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= METHODOLOGY & COMPARISON SECTION ================= */}
      <section
        id="how-it-works"
        className="bg-[#FAFAFA] dark:bg-[#0D0D10] py-20 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-md bg-[#09090B] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
              {lang === "ar" ? "منهجية أسرع التنفيذية" : "THE ASRA3 METHOD"}
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.howItWorksTitle}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                icon: Globe2,
                title: t.howItWorksStep1Title,
                desc: t.howItWorksStep1Desc,
                badge: "AE · SA · QA · KW",
              },
              {
                num: "02",
                icon: FileCheck2,
                title: t.howItWorksStep2Title,
                desc: t.howItWorksStep2Desc,
                badge: "ATS Audit + Cover Letter",
              },
              {
                num: "03",
                icon: MailCheck,
                title: t.howItWorksStep3Title,
                desc: t.howItWorksStep3Desc,
                badge: "ASR- Live Ledger",
              },
            ].map((item, stepIdx) => {
              const Icon = item.icon;
              return (
                <RevealOnScroll
                  key={item.num}
                  delayMs={stepIdx * 80}
                  className="flex"
                >
                  <div className="exec-card-interactive w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-7">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5">
                      <span
                        dir="ltr"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#09090B] font-mono text-sm font-extrabold text-[#D4AF37]"
                      >
                        {item.num}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                          {item.badge}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-[#D4AF37]">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-zinc-950 dark:text-zinc-50">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* Contrast Comparison: Crowded Portals vs. Asra3 Direct HR Placement */}
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevealOnScroll delayMs={0} className="flex">
              <div className="exec-card-interactive w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {lang === "ar"
                      ? "التقديم التقليدي عبر منصات التوظيف المزدحمة"
                      : "Conventional Public Job Boards"}
                  </span>
                  <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {lang === "ar" ? "تكدس مرتفع" : "Low Visibility"}
                  </span>
                </div>
                <ul className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <Minus className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "أكثر من 2,500 متقدم يتنافسون على نفس الإعلان الوظيفي العام."
                        : "Over 2,500+ applicants queued behind a single public vacancy listing."}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Minus className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "فلاتر آلية تستبعد أغلب السير الذاتية قبل وصولها لصانع القرار."
                        : "Rigid keyword filters discard 85% of resumes prior to human review."}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Minus className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "أسابيع من الانتظار وتعبئة النماذج المتكررة دون أي إشعار بالوصول."
                        : "Weeks lost repeating forms with zero delivery transparency."}
                    </span>
                  </li>
                </ul>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delayMs={90} className="flex">
              <div className="exec-card-interactive w-full rounded-2xl border border-zinc-800 dark:border-[#D4AF37]/50 bg-[#09090B] dark:bg-[#141418] p-8 text-zinc-50">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <span className="font-bold text-lg text-white">
                    {lang === "ar"
                      ? "التوزيع المباشر عبر أسرع (Asra3.com)"
                      : "Asra3.com Direct HR Inbox Placement"}
                  </span>
                  <span className="rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#09090B]">
                    3.4× Faster
                  </span>
                </div>
                <ul className="mt-6 space-y-4 text-sm text-zinc-300">
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "إيداع مباشر في صناديق بريد مسؤولي التوظيف (HR) للوصول إلى سوق الوظائف غير المعلنة."
                        : "Direct placement inside verified HR inboxes—unlocking the unadvertised Gulf job market."}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "قراءة نصية حقيقية لملف الـ CV مع صياغة خطاب تقديم تنفيذي يضاعف معدل الاستجابة."
                        : "Real PDF/DOCX ATS parsing paired with a bespoke executive cover letter."}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-1" />
                    <span>
                      {lang === "ar"
                        ? "سجل تتبع خاص برمز (ASR-) يوثق كل شركة مستلمة لحظة بلحظة."
                        : "Private ASR- tracking ledger documenting every verified employer contacted."}
                    </span>
                  </li>
                </ul>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ================= PRICING TIERS SECTION ================= */}
      <section
        id="pricing-section"
        className="bg-white dark:bg-[#09090B] py-20 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-3.5 py-1 text-xs font-bold text-zinc-900 dark:text-[#D4AF37]">
              {lang === "ar"
                ? `باقات شفافة بعملة ${selectedCountry.name_ar} (${currencySymbol})`
                : `Transparent Tiers in ${selectedCountry.name_en} (${currencySymbol})`}
            </span>
            <h2 className="mt-3.5 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.choosePackageTitle}
            </h2>
            <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              {lang === "ar"
                ? "دفعة واحدة شفافة بدون أي اشتراكات شهرية متكررة — عبر بوابة EasyKash المعتمدة."
                : "Single transparent one-time fee via EasyKash — zero recurring retainers."}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-7 lg:grid-cols-3 items-stretch">
            {packages.map((pkg, pkgIdx) => {
              const price =
                pkg.prices_by_currency[currency] ?? pkg.prices_by_currency.AED;
              const features =
                lang === "ar" ? pkg.features_ar : pkg.features_en;
              const isFeatured = Boolean(pkg.is_featured);

              return (
                <RevealOnScroll
                  key={pkg.id}
                  delayMs={pkgIdx * 80}
                  className="flex"
                >
                  <div
                    className={`exec-card-interactive relative w-full flex flex-col justify-between rounded-2xl p-8 ${
                      isFeatured
                        ? "bg-[#09090B] dark:bg-[#141418] text-zinc-50 border-2 border-[#D4AF37] lg:-translate-y-2"
                        : "bg-zinc-50 dark:bg-[#121215] text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                  {isFeatured && (
                    <span className="btn-gold absolute -top-3.5 end-6 rounded-md px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider">
                      {lang === "ar"
                        ? "الأكثر اختياراً في الخليج"
                        : "MOST POPULAR"}
                    </span>
                  )}

                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        isFeatured
                          ? "text-white"
                          : "text-zinc-950 dark:text-zinc-50"
                      }`}
                    >
                      {lang === "ar" ? pkg.name_ar : pkg.name_en}
                    </h3>
                    <p
                      className={`mt-1.5 text-xs ${
                        isFeatured
                          ? "text-zinc-400"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {lang === "ar" ? pkg.tagline_ar : pkg.tagline_en}
                    </p>

                    <div className="mt-6 flex items-baseline gap-2">
                      <span
                        dir="ltr"
                        className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${
                          isFeatured
                            ? "text-[#D4AF37]"
                            : "text-zinc-950 dark:text-zinc-50"
                        }`}
                      >
                        {price}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isFeatured
                            ? "text-zinc-200"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {currencySymbol}
                      </span>
                      <span
                        className={`text-xs ${
                          isFeatured
                            ? "text-zinc-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        / {pkg.company_limit}{" "}
                        {lang === "ar" ? "شركة" : "Companies"}
                      </span>
                    </div>

                    <ul
                      className={`mt-6 space-y-3.5 border-t pt-6 ${
                        isFeatured
                          ? "border-zinc-800"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {features.map((f, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                            isFeatured
                              ? "text-zinc-200"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <Check
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isFeatured
                                ? "text-[#D4AF37]"
                                : "text-zinc-950 dark:text-[#D4AF37]"
                            }`}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#wizard-section"
                    onClick={() => setWizardExternalPkg(pkg.id)}
                    className={`mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-extrabold transition-colors ${
                      isFeatured
                        ? "btn-gold"
                        : "bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {lang === "ar"
                      ? `اختر ${pkg.name_ar.split("(")[0]} وابدأ`
                      : `Select ${pkg.name_en} →`}
                  </a>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CANDIDATE SUCCESS STORIES ================= */}
      <section className="bg-[#FAFAFA] dark:bg-[#0D0D10] py-20 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#09090B] px-3.5 py-1 text-xs font-bold text-[#D4AF37]">
              <Award className="h-3.5 w-3.5" />
              {lang === "ar"
                ? "نتائج موثقة عبر أسرع (Asra3.com)"
                : "Verified Client Outcomes"}
            </span>
            <h2 className="mt-3.5 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {lang === "ar"
                ? "كوادر تنفيذية حصلت على مقابلات عمل خلال أيام"
                : "Professionals Who Secured Gulf Interviews in Days"}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                nameAr: "م. طارق الشامسي",
                nameEn: "Eng. Tarek Al-Shamsi",
                roleAr: "مهندس ميكانيكا أول (MEP) • دبي، الإمارات",
                roleEn: "Senior MEP Engineer • Dubai, UAE",
                quoteAr:
                  "كنت أقدم يدوياً لشهرين دون رد. بعد استخدام باقة أسرع هايبر (500 شركة) في دبي وأبوظبي، تواصلت معي 4 شركات مقاولات كبرى خلال 5 أيام.",
                quoteEn:
                  "After two months of cold applying with zero replies, Asra3 Hyper placed my CV across 500 UAE contractors. I booked 4 interviews in 5 days.",
              },
              {
                nameAr: "أ. ريم القحطاني",
                nameEn: "Reem Al-Qahtani",
                roleAr: "أخصائية استقطاب كفاءات • الرياض، السعودية",
                roleEn: "Talent Acquisition Lead • Riyadh, KSA",
                quoteAr:
                  "شفافية سجل التتبع في Asra3.com استثنائية؛ تابعت بنفسي الشركات التي فتحت الملف في الرياض وجدة، ووصلتني دعوة لمقابلة رسمية في اليوم الثالث.",
                quoteEn:
                  "The Asra3 live tracking ledger gave me complete peace of mind. Seeing HR teams in Riyadh open my dossier led to an interview invitation on day three.",
              },
              {
                nameAr: "أ. محمود عبد العزيز",
                nameEn: "Mahmoud Abdelaziz, CPA",
                roleAr: "مراقب مالي أول • الدوحة والكويت",
                roleEn: "Senior Financial Controller • Doha & Kuwait",
                quoteAr:
                  "اخترت باقة أسرع تيربو في قطر مع إضافة سوق الكويت بخصم 50%. صياغة خطاب التقديم التنفيذي كانت رفيعة المستوى واختصرت أسابيع من المراسلات.",
                quoteEn:
                  "I combined Asra3 Turbo in Qatar with the Kuwait market add-on. The bespoke executive cover letter was impeccable and saved weeks of manual outreach.",
              },
            ].map((item, idx) => (
              <RevealOnScroll
                key={idx}
                delayMs={idx * 80}
                className="flex"
              >
                <div className="exec-card-interactive w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[#D4AF37] mb-4">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {lang === "ar" ? item.quoteAr : item.quoteEn}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <p className="font-bold text-zinc-950 dark:text-zinc-50 text-sm">
                      {lang === "ar" ? item.nameAr : item.nameEn}
                    </p>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {lang === "ar" ? item.roleAr : item.roleEn}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE FAQ SECTION ================= */}
      <section
        id="faq-section"
        className="bg-white dark:bg-[#09090B] py-20 sm:py-24 transition-colors"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              const panelId = `faq-panel-${idx}`;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-colors overflow-hidden ${
                    isOpen
                      ? "border-zinc-900 dark:border-[#D4AF37] bg-zinc-50 dark:bg-[#121215]"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-4.5 text-start font-bold text-zinc-950 dark:text-zinc-50 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-zinc-500 dark:text-[#D4AF37] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={panelId}
                      className="px-6 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-3.5"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {seoSection}
      </main>

      {/* ================= PURE CARBON BLACK EXECUTIVE FOOTER ================= */}
      <footer className="mt-auto bg-[#09090B] pt-16 pb-24 sm:pb-14 text-zinc-400 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">
            {lang === "ar"
              ? "تذييل الموقع والروابط السريعة"
              : "Site Footer & Quick Links"}
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 pb-12 border-b border-zinc-800">
            <div className="md:col-span-5 space-y-4">
              <Link
                href="/"
                aria-label="Asra3.com Home"
                className="inline-block"
              >
                <Asra3Logo
                  variant="dark"
                  size="md"
                  lang={lang}
                  showTagline
                  tagline={t.brandTagline}
                />
              </Link>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                {lang === "ar"
                  ? "منصة أسرع (Asra3.com) — خدمة التوزيع التنفيذي الرائدة في الخليج لإيداع السير الذاتية المحسنة بنظام ATS وخطابات التقديم المخصصة مباشرة في صناديق بريد مسؤولي الموارد البشرية (HR) في الإمارات، السعودية، قطر، والكويت."
                  : "Asra3.com — Executive GCC career placement platform delivering ATS-optimized CVs and bespoke cover letters directly into verified HR decision-maker inboxes across the UAE, Saudi Arabia, Qatar, and Kuwait."}
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] mb-3.5">
                {lang === "ar" ? "أسواق الخليج" : "GCC Markets"}
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/ae" className="hover:text-white transition-colors">
                    {lang === "ar"
                      ? "الإمارات العربية المتحدة"
                      : "United Arab Emirates"}
                  </Link>
                </li>
                <li>
                  <Link href="/sa" className="hover:text-white transition-colors">
                    {lang === "ar"
                      ? "المملكة العربية السعودية"
                      : "Saudi Arabia"}
                  </Link>
                </li>
                <li>
                  <Link href="/qa" className="hover:text-white transition-colors">
                    {lang === "ar" ? "دولة قطر" : "State of Qatar"}
                  </Link>
                </li>
                <li>
                  <Link href="/kw" className="hover:text-white transition-colors">
                    {lang === "ar" ? "دولة الكويت" : "State of Kuwait"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] mb-3.5">
                {lang === "ar" ? "روابط المنصة" : "Platform"}
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href="#wizard-section"
                    className="hover:text-white transition-colors"
                  >
                    {lang === "ar" ? "إطلاق حملة جديدة" : "Start Campaign"}
                  </a>
                </li>
                <li>
                  <Link
                    href="/track"
                    className="hover:text-white transition-colors"
                  >
                    {t.navTrackOrder}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    {lang === "ar" ? "عن المنصة والمنهجية" : "About & Methodology"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={lang === "ar" ? "/en" : "/"}
                    className="hover:text-white transition-colors"
                  >
                    {lang === "ar" ? "النسخة الإنجليزية (/en)" : "Arabic Version (/)"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    {lang === "ar" ? "الشروط والأحكام" : "Terms of Service"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] mb-3.5">
                {lang === "ar" ? "مكتب دعم المرشحين" : "Support Desk"}
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  {hasMounted ? (
                    <a
                      href="mailto:hello@asra3.com"
                      className="text-zinc-200 hover:text-[#D4AF37] transition-colors"
                    >
                      hello@asra3.com
                    </a>
                  ) : (
                    <span dir="ltr" className="text-zinc-200">
                      hello [at] asra3.com
                    </span>
                  )}
                </li>
                <li dir="ltr" className="text-zinc-300">
                  +971 50 408 1478
                </li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#121215] px-3 py-1 text-[11px] text-zinc-200 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                    EasyKash DirectPayV1 Verified
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>{t.footerRights}</p>
            <div
              dir="ltr"
              className="flex items-center gap-3 font-mono text-[11px] tracking-widest text-zinc-400"
            >
              <span>UAE</span>
              <span className="text-[#D4AF37]">·</span>
              <span>KSA</span>
              <span className="text-[#D4AF37]">·</span>
              <span>QATAR</span>
              <span className="text-[#D4AF37]">·</span>
              <span>KUWAIT</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MOBILE STICKY ACTION BAR ================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#09090B]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? `توظَّف أسرع في ${selectedCountry.name_ar}`
                : `Get Hired Faster in ${selectedCountry.name_en}`}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {lang === "ar"
                ? "فحص ATS مجاني + إيداع مباشر للـ HR"
                : "Free ATS Audit + Direct HR Placement"}
            </p>
          </div>
          <a
            href="#wizard-section"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#09090B] text-white dark:bg-[#D4AF37] dark:text-[#09090B] px-4 py-2.5 text-xs font-extrabold"
          >
            <span>{lang === "ar" ? "ابدأ الآن" : "Scan CV"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#D4AF37] dark:text-[#09090B]" />
          </a>
        </div>
      </div>
    </div>
  );
}
