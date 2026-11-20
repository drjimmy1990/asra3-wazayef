import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeLandingClient } from "@/components/HomeLandingClient";
import {
  SeoGeoKnowledgeSection,
  SeoSectionVariant,
} from "@/components/SeoGeoKnowledgeSection";
import { COUNTRY_HUB_BANNERS } from "@/lib/country-hubs";
import { searchAndRankJobs } from "@/lib/jobs-store";
import { getCatalogData } from "@/lib/store";
import { CountryCode, CurrencyCode } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

interface CountrySeoProfile {
  code: CountryCode;
  slug: string;
  countryNameAr: string;
  countryNameEn: string;
  currency: string;
  lowPrice: string;
  highPrice: string;
  titleAr: string;
  descriptionAr: string;
  keywords: string[];
}

const COUNTRY_SEO_PROFILES: Record<string, CountrySeoProfile> = {
  ae: {
    code: "AE",
    slug: "ae",
    countryNameAr: "الإمارات العربية المتحدة",
    countryNameEn: "United Arab Emirates",
    currency: "AED",
    lowPrice: "129",
    highPrice: "349",
    titleAr:
      "توزيع السيرة الذاتية لشركات الإمارات ودبي وأبوظبي — توظَّف أسرع",
    descriptionAr:
      "توظَّف أسرع في الإمارات: أرسل سيرتك الذاتية المحسنة بنظام ATS وخطاب التقديم الذكي مباشرة إلى أكثر من 2,480 شركة معتمدة وأقسام HR في دبي، أبوظبي، الشارقة، وعجمان عبر منصة أسرع (Asra3.com).",
    keywords: [
      "توزيع السيرة الذاتية في الإمارات",
      "إرسال السي في لشركات دبي",
      "وظائف دبي وأبوظبي",
      "ايميلات شركات الإمارات HR",
      "CV distribution UAE",
      "Send CV to Dubai companies",
      "Asra3 UAE",
    ],
  },
  sa: {
    code: "SA",
    slug: "sa",
    countryNameAr: "المملكة العربية السعودية",
    countryNameEn: "Saudi Arabia",
    currency: "SAR",
    lowPrice: "129",
    highPrice: "349",
    titleAr:
      "توزيع السيرة الذاتية لشركات السعودية والرياض وجدة — توظَّف أسرع",
    descriptionAr:
      "توظَّف أسرع في السعودية: وصِّل سيرتك الذاتية المحسنة بنظام ATS وخطاب التقديم الذكي مباشرة إلى صناديق بريد مسؤولي التوظيف (HR) في الرياض، جدة، الدمام، الخبر، ومشاريع رؤية 2030 عبر Asra3.com.",
    keywords: [
      "توزيع السيرة الذاتية في السعودية",
      "إرسال السيرة الذاتية لشركات الرياض",
      "وظائف الرياض وجدة والدمام",
      "ايميلات شركات السعودية للتوظيف",
      "CV distribution Saudi Arabia",
      "Send CV to Riyadh HR",
      "Asra3 KSA",
    ],
  },
  qa: {
    code: "QA",
    slug: "qa",
    countryNameAr: "دولة قطر",
    countryNameEn: "Qatar",
    currency: "QAR",
    lowPrice: "129",
    highPrice: "349",
    titleAr: "توزيع السيرة الذاتية لشركات قطر والدوحة ولوسيل — توظَّف أسرع",
    descriptionAr:
      "توظَّف أسرع في قطر: أرسل سيرتك الذاتية المحسنة بـ ATS مباشرة إلى مديري الموارد البشرية في شركات الدوحة، لوسيل، الوكرة، والخور مع لوحة تتبع حية عبر منصة أسرع (Asra3.com).",
    keywords: [
      "توزيع السيرة الذاتية في قطر",
      "وظائف الدوحة ولوسيل",
      "إرسال CV لشركات قطر",
      "CV distribution Qatar",
      "Doha HR email outreach",
      "Asra3 Qatar",
    ],
  },
  kw: {
    code: "KW",
    slug: "kw",
    countryNameAr: "دولة الكويت",
    countryNameEn: "Kuwait",
    currency: "KWD",
    lowPrice: "11",
    highPrice: "29",
    titleAr: "توزيع السيرة الذاتية لشركات الكويت — توظَّف أسرع",
    descriptionAr:
      "توظَّف أسرع في الكويت: وصِّل سيرتك الذاتية المحسنة بنظام ATS وخطاب التقديم الذكي مباشرة إلى أقسام الموارد البشرية في مدينة الكويت، حولي، السالمية، والفروانية عبر Asra3.com.",
    keywords: [
      "توزيع السيرة الذاتية في الكويت",
      "وظائف الكويت",
      "إرسال السيرة الذاتية لشركات الكويت",
      "CV distribution Kuwait",
      "Kuwait HR email distribution",
      "Asra3 Kuwait",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const profile = COUNTRY_SEO_PROFILES[country.toLowerCase()];
  if (!profile) {
    return {};
  }

  const canonicalPath = `/${profile.slug}`;
  return {
    title: profile.titleAr,
    description: profile.descriptionAr,
    keywords: profile.keywords,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ar: canonicalPath,
        en: "/en",
        "x-default": canonicalPath,
      },
    },
    openGraph: {
      title: `${profile.titleAr} | أسرع Asra3.com`,
      description: profile.descriptionAr,
      url: canonicalPath,
      siteName: "أسرع | Asra3.com",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.titleAr} | Asra3.com`,
      description: profile.descriptionAr,
    },
  };
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const profile = COUNTRY_SEO_PROFILES[country.toLowerCase()];

  if (!profile) {
    notFound();
  }

  const [jobsResult, catalog] = await Promise.all([
    searchAndRankJobs({ limit: 12 }),
    getCatalogData(),
  ]);

  const curr = profile.currency as CurrencyCode;
  const lowPriceLive = String(
    catalog.packages.find((p) => p.id === "starter")?.prices_by_currency[curr] ??
      profile.lowPrice
  );
  const midPriceLive = String(
    catalog.packages.find((p) => p.id === "pro")?.prices_by_currency[curr] ??
      (curr === "KWD" ? "19" : "229")
  );
  const highPriceLive = String(
    catalog.packages.find((p) => p.id === "ultimate")?.prices_by_currency[
      curr
    ] ?? profile.highPrice
  );

  const countryFaqs =
    profile.slug === "ae"
      ? [
          {
            q: "كم شركة في الإمارات تستلم سيرتي الذاتية عبر أسرع؟",
            a: `يمكنك استهداف 100 شركة (${lowPriceLive} درهم) أو 300 شركة مع خطاب تقديم ذكي (${midPriceLive} درهم) أو 500+ شركة مع إعادة صياغة ATS كاملة (${highPriceLive} درهم).`,
          },
          {
            q: "هل يشمل التوزيع دبي وأبوظبي والشارقة أم مدناً محددة فقط؟",
            a: "يمكنك استهداف كافة الإمارات أو تحديد دبي وأبوظبي فقط أو الشارقة وعجمان خلال خطوات إطلاق الحملة.",
          },
          {
            q: "كيف أضمن ألا تصل سيرتي الذاتية لشركتي الحالية في الإمارات؟",
            a: "أدخل نطاق بريد شركتك الحالية في الخطوة الرابعة لحجب كافة عناوينها تلقائياً بنسبة 100%.",
          },
        ]
      : profile.slug === "sa"
      ? [
          {
            q: "هل تصل السيرة الذاتية لشركات الرياض وجدة ومشاريع رؤية 2030؟",
            a: "نعم، يعطي المحرك الأولوية للشركات السعودية المطابقة لتخصصك والمدن التي تحددها في الرياض وجدة والمنطقة الشرقية ومشاريع رؤية 2030.",
          },
          {
            q: "ما أسعار باقات أسرع في السعودية بالريال السعودي؟",
            a: `تبدأ من ${lowPriceLive} ريال (100 شركة) و${midPriceLive} ريال (300 شركة + خطاب تقديم) و${highPriceLive} ريال (500+ شركة + إعادة صياغة ATS) لمرة واحدة فقط.`,
          },
          {
            q: "هل أستطيع إضافة الإمارات أو قطر مع السعودية في نفس الحملة؟",
            a: "نعم، في الخطوة الثالثة يمكنك إضافة أي دولة خليجية إضافية لتوسيع التوزيع في حملة واحدة.",
          },
        ]
      : profile.slug === "qa"
      ? [
          {
            q: "ما القطاعات الأكثر استجابة في دولة قطر عبر أسرع؟",
            a: "تشهد قطاعات الهندسة والنفط والغاز والبنوك والضيافة في الدوحة ولوسيل والوكرة أعلى نسب فتح ومطالعة من مديري التوظيف.",
          },
          {
            q: "كم تكلفة توزيع السيرة الذاتية لشركات قطر؟",
            a: `تبدأ الباقات من ${lowPriceLive} ريال قطري لـ 100 شركة، و${midPriceLive} ريال لـ 300 شركة، و${highPriceLive} ريال لـ 500+ شركة تدفع مرة واحدة.`,
          },
          {
            q: "كيف تصلني ردود شركات التوظيف في الدوحة؟",
            a: "بريد الرد المباشر (Reply-To) مضبوط لبريدك الشخصي مع توضيح رقم هاتفك في خطاب التقديم.",
          },
        ]
      : [
          {
            q: "ما هي أسعار باقات التوزيع في دولة الكويت بالدينار الكويتي؟",
            a: `${lowPriceLive} دينار كويتي لباقة انطلاقة (100 شركة)، ${midPriceLive} دينار لباقة تيربو (300 شركة)، و${highPriceLive} دينار لباقة هايبر (500+ شركة) لمرة واحدة فقط.`,
          },
          {
            q: "هل يتم إرفاق سيرتي الذاتية الأصلية للشركات في الكويت؟",
            a: "نعم، تُرسل السيرة الذاتية المرفوعة (PDF أو DOCX) مع خطاب تقديم تنفيذي مباشر لإدارات الموارد البشرية في مدينة الكويت وحولي والسالمية والأحمدي.",
          },
          {
            q: "كيف أتابع الشركات التي فتحت سيرتي الذاتية في الكويت؟",
            a: "من خلال لوحة التتبع الحية (/track) فور إتمام الدفع لمعرفة حالة الإرسال وفتح الرسائل وتصدير تقرير CSV.",
          },
        ];

  const countryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "أسرع | Asra3.com",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: profile.countryNameAr,
            item: `${SITE_URL}/${profile.slug}`,
          },
        ],
      },
      {
        "@type": "Service",
        name: `${profile.titleAr} — Asra3.com`,
        description: profile.descriptionAr,
        provider: {
          "@id": `${SITE_URL}/#organization`,
        },
        areaServed: {
          "@type": "Country",
          name: profile.countryNameEn,
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: profile.currency,
          lowPrice: lowPriceLive,
          highPrice: highPriceLive,
          offerCount: "3",
        },
      },
      {
        "@type": "HowTo",
        name: `خطوات إرسال سيرتك الذاتية إلى شركات ${profile.countryNameAr} عبر أسرع`,
        description: profile.descriptionAr,
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "تحليل السيرة الذاتية بنظام ATS",
            text: "ارفع ملف السيرة الذاتية للحصول على تقييم التوافق والمهارات المستخلصة فوراً.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: `تحديد مدن وقطاعات ${profile.countryNameAr}`,
            text: `اختر المدن والتخصص الوظيفي المناسب داخل ${profile.countryNameAr}.`,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "تفعيل درع استثناء جهة العمل الحالية والدفع",
            text: "اختر الباقة وأضف نطاق شركتك الحالية لحمايتها ثم أتمم الدفع لمرة واحدة عبر EasyKash.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: countryFaqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countryJsonLd) }}
      />
      <HomeLandingClient
        initialCountryCode={profile.code}
        countryHubBanner={COUNTRY_HUB_BANNERS[profile.code]}
        initialJobs={jobsResult.jobs}
        totalActiveJobs={jobsResult.totalActiveJobs}
        seoSection={
          <SeoGeoKnowledgeSection variant={profile.slug as SeoSectionVariant} />
        }
      />
    </>
  );
}
