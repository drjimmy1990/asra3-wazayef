import { CountryCode } from "@/lib/types";

export interface CountryHubBannerContent {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

export const COUNTRY_HUB_BANNERS: Record<CountryCode, CountryHubBannerContent> =
  {
    AE: {
      titleAr: "AE · بوابة الإمارات التنفيذية — Asra3 UAE",
      titleEn: "AE · Official UAE Hub — Asra3.com/ae",
      subtitleAr:
        "توزيع فوري ومباشر لأقسام الموارد البشرية في دبي، أبوظبي، الشارقة، عجمان، ورأس الخيمة بالدرهم الإماراتي (AED).",
      subtitleEn:
        "Direct HR inbox distribution across Dubai, Abu Dhabi, Sharjah, Ajman & RAK priced in AED.",
    },
    SA: {
      titleAr: "SA · بوابة السعودية التنفيذية — Asra3 KSA",
      titleEn: "SA · Official Saudi Hub — Asra3.com/sa",
      subtitleAr:
        "استهدف كبرى الشركات ومشاريع رؤية 2030 في الرياض، جدة، المنطقة الشرقية، ونيوم بالريال السعودي (SAR).",
      subtitleEn:
        "Direct HR outreach across Riyadh, Jeddah, Dammam/Khobar & Vision 2030 employers priced in SAR.",
    },
    QA: {
      titleAr: "QA · بوابة قطر التنفيذية — Asra3 Qatar",
      titleEn: "QA · Official Qatar Hub — Asra3.com/qa",
      subtitleAr:
        "وصول مباشر لصناديق بريد التوظيف في الدوحة، لوسيل، الوكرة، والخور بالريال القطري (QAR).",
      subtitleEn:
        "Direct HR inbox outreach across Doha, Lusail, Al Wakrah & Al Khor priced in QAR.",
    },
    KW: {
      titleAr: "KW · بوابة الكويت التنفيذية — Asra3 Kuwait",
      titleEn: "KW · Official Kuwait Hub — Asra3.com/kw",
      subtitleAr:
        "توزيع ذكي ومباشر لكبرى المجموعات والشركات في مدينة الكويت، حولي، السالمية، والفروانية بالدينار الكويتي (KWD).",
      subtitleEn:
        "Direct HR inbox outreach across Kuwait City, Hawalli, Salmiya & Farwaniya priced in KWD.",
    },
  };

export function getCountryCodeFromPathname(
  pathname: string | null | undefined
): CountryCode | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/(ae|sa|qa|kw)(?:\/|$)/i);
  if (!match) return null;
  return match[1].toUpperCase() as CountryCode;
}
