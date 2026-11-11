import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeLandingClient } from "@/components/HomeLandingClient";
import { CountryCode } from "@/lib/types";

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
  bannerTitleAr: string;
  bannerTitleEn: string;
  bannerSubtitleAr: string;
  bannerSubtitleEn: string;
}

const COUNTRY_SEO_PROFILES: Record<string, CountrySeoProfile> = {
  ae: {
    code: "AE",
    slug: "ae",
    countryNameAr: "الإمارات العربية المتحدة",
    countryNameEn: "United Arab Emirates",
    currency: "AED",
    lowPrice: "149",
    highPrice: "399",
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
    bannerTitleAr: "AE · بوابة الإمارات التنفيذية — Asra3 UAE",
    bannerTitleEn: "AE · Official UAE Hub — Asra3.com/ae",
    bannerSubtitleAr:
      "توزيع فوري ومباشر لأقسام الموارد البشرية في دبي، أبوظبي، الشارقة، عجمان، ورأس الخيمة بالدرهم الإماراتي (AED).",
    bannerSubtitleEn:
      "Direct HR inbox distribution across Dubai, Abu Dhabi, Sharjah, Ajman & RAK priced in AED.",
  },
  sa: {
    code: "SA",
    slug: "sa",
    countryNameAr: "المملكة العربية السعودية",
    countryNameEn: "Saudi Arabia",
    currency: "SAR",
    lowPrice: "149",
    highPrice: "399",
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
    bannerTitleAr: "SA · بوابة السعودية التنفيذية — Asra3 KSA",
    bannerTitleEn: "SA · Official Saudi Hub — Asra3.com/sa",
    bannerSubtitleAr:
      "استهدف كبرى الشركات ومشاريع رؤية 2030 في الرياض، جدة، المنطقة الشرقية، ونيوم بالريال السعودي (SAR).",
    bannerSubtitleEn:
      "Direct HR outreach across Riyadh, Jeddah, Dammam/Khobar & Vision 2030 employers priced in SAR.",
  },
  qa: {
    code: "QA",
    slug: "qa",
    countryNameAr: "دولة قطر",
    countryNameEn: "Qatar",
    currency: "QAR",
    lowPrice: "149",
    highPrice: "399",
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
    bannerTitleAr: "QA · بوابة قطر التنفيذية — Asra3 Qatar",
    bannerTitleEn: "QA · Official Qatar Hub — Asra3.com/qa",
    bannerSubtitleAr:
      "وصول مباشر لصناديق بريد التوظيف في الدوحة، لوسيل، الوكرة، والخور بالريال القطري (QAR).",
    bannerSubtitleEn:
      "Direct HR inbox outreach across Doha, Lusail, Al Wakrah & Al Khor priced in QAR.",
  },
  kw: {
    code: "KW",
    slug: "kw",
    countryNameAr: "دولة الكويت",
    countryNameEn: "Kuwait",
    currency: "KWD",
    lowPrice: "12",
    highPrice: "32",
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
    bannerTitleAr: "KW · بوابة الكويت التنفيذية — Asra3 Kuwait",
    bannerTitleEn: "KW · Official Kuwait Hub — Asra3.com/kw",
    bannerSubtitleAr:
      "توزيع ذكي ومباشر لكبرى المجموعات والشركات في مدينة الكويت، حولي، السالمية، والفروانية بالدينار الكويتي (KWD).",
    bannerSubtitleEn:
      "Direct HR inbox outreach across Kuwait City, Hawalli, Salmiya & Farwaniya priced in KWD.",
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ country: "ae" }, { country: "sa" }, { country: "qa" }, { country: "kw" }];
}

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
        en: `${canonicalPath}?lang=en`,
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
          lowPrice: profile.lowPrice,
          highPrice: profile.highPrice,
          offerCount: "3",
        },
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
        countryHubBanner={{
          titleAr: profile.bannerTitleAr,
          titleEn: profile.bannerTitleEn,
          subtitleAr: profile.bannerSubtitleAr,
          subtitleEn: profile.bannerSubtitleEn,
        }}
      />
    </>
  );
}
