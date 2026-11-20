// ==============================================================================
// ASRA3.COM — Selectable OG / Facebook Job Card Templates Catalog (Isomorphic)
// ==============================================================================

export type OgJobTemplateId =
  | "obsidian-classic"
  | "gold-split-editorial"
  | "royal-ivory-light"
  | "gcc-hiring-banner";

export interface OgJobTemplateMeta {
  id: OgJobTemplateId;
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  badge_en: string;
  badge_ar: string;
  bgSwatch: string;
  accentSwatch: string;
}

export const DEFAULT_OG_JOB_TEMPLATE: OgJobTemplateId = "gold-split-editorial";

export const OG_JOB_TEMPLATES: OgJobTemplateMeta[] = [
  {
    id: "obsidian-classic",
    name_en: "Obsidian Classic (Upgraded)",
    name_ar: "الكلاسيكي الداكن (مُحدَّث بالعربية)",
    tagline_en:
      "Your original black & gold executive card, now upgraded with Arabic + English job titles & Asra3 logo.",
    tagline_ar:
      "التصميم الكلاسيكي الأسود والذهبي الأصلي بعد تطويره بإضافة المسمى الوظيفي بالعربية وشعار أسرع.",
    badge_en: "CLASSIC",
    badge_ar: "كلاسيكي",
    bgSwatch: "#09090B",
    accentSwatch: "#D4AF37",
  },
  {
    id: "gold-split-editorial",
    name_en: "Gold Split Editorial",
    name_ar: "التقسيم الذهبي الفاخر",
    tagline_en:
      "High-contrast 2-column Facebook poster with bold metallic gold QR sidebar and oversized Arabic headline.",
    tagline_ar:
      "تصميم عمودين عالي التباين لفيسبوك بشريط جانبي ذهبي لكود QR وعنوان وظيفي عربي بارز.",
    badge_en: "RECOMMENDED",
    badge_ar: "الأفضل لفيسبوك",
    bgSwatch: "#0B0B0E",
    accentSwatch: "#E5C158",
  },
  {
    id: "royal-ivory-light",
    name_en: "Royal Ivory Editorial",
    name_ar: "العاجي الملكي (تباين عالٍ)",
    tagline_en:
      "Warm ivory canvas with carbon-black header & gold stripe — stands out sharply in Facebook Dark Mode.",
    tagline_ar:
      "خلفية عاجية أنيقة برأس أسود وشريط ذهبي — تبرز بقوة وسط الوضع الليلي لفيسبوك.",
    badge_en: "LIGHT MODE",
    badge_ar: "فاتح وجذاب",
    bgSwatch: "#F9F7F2",
    accentSwatch: "#09090B",
  },
  {
    id: "gcc-hiring-banner",
    name_en: "GCC Now Hiring Flyer",
    name_ar: "إعلان التوظيف الفوري (Now Hiring)",
    tagline_en:
      "Bold recruitment flyer with top gold hiring ribbon, highlighted salary/city strip, and 1st-comment CTA.",
    tagline_ar:
      "تصميم إعلان توظيف قوي بشريط ذهبي علوي (فرصة عمل جديدة) وشريط راتب ومدينة بارز.",
    badge_en: "HIGH CTR",
    badge_ar: "تفاعل عالٍ",
    bgSwatch: "#0A0C10",
    accentSwatch: "#D4AF37",
  },
];

const VALID_IDS = new Set<string>(OG_JOB_TEMPLATES.map((t) => t.id));

export function isValidOgJobTemplateId(val: unknown): val is OgJobTemplateId {
  return typeof val === "string" && VALID_IDS.has(val);
}
