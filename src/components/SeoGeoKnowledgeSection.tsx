import React from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Globe2, ShieldCheck } from "lucide-react";

export type SeoSectionVariant = "gcc-ar" | "gcc-en" | "ae" | "sa" | "qa" | "kw";

interface MarketBenchmarkRow {
  market: string;
  hubs: string;
  sectors: string;
  responseWindow: string;
  priceRange: string;
}

interface QaItem {
  q: string;
  a: string;
}

interface VariantContent {
  isEnglish: boolean;
  eyebrow: string;
  title: string;
  summary: string;
  tableHeading: string;
  tableCols: [string, string, string, string, string];
  rows: MarketBenchmarkRow[];
  qaHeading: string;
  qas: QaItem[];
}

const CONTENT_BY_VARIANT: Record<SeoSectionVariant, VariantContent> = {
  "gcc-ar": {
    isEnglish: false,
    eyebrow: "الدليل التنفيذي للتوظيف المباشر في الخليج — GEO & AEO",
    title: "كيف توصل منصة أسرع (Asra3.com) سيرتك الذاتية مباشرة إلى صناديق بريد الـ HR في الخليج؟",
    summary:
      "تعتمد كبرى الشركات في الإمارات والسعودية وقطر والكويت على الفرز الداخلي المباشر للسير الذاتية قبل الإعلان على بوابات التوظيف العامة. تقوم منصة أسرع بفحص السيرة الذاتية بتقنية ATS، وصياغة خطاب تقديم تنفيذي، ثم إيداعها مباشرة في صناديق بريد مديري الموارد البشرية (HR) مع ضبط عنوان الرد المباشر (Reply-To) لبريد المرشح الشخصي وحجب جهة العمل الحالية بنسبة 100%.",
    tableHeading: "مؤشرات أسواق التوظيف الخليجية والباقات الفردية (دفعة واحدة)",
    tableCols: ["السوق", "أبرز مدن التوظيف", "القطاعات الأكثر طلباً", "متوسط رد الـ HR", "نطاق الباقات"],
    rows: [
      {
        market: "الإمارات (UAE)",
        hubs: "دبي (DIFC, Business Bay)، أبوظبي (ADGM)، الشارقة، عجمان",
        sectors: "العقارات والهندسة، الذكاء الاصطناعي والتقنية المالية، الضيافة الفاخرة",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 د.إ",
      },
      {
        market: "السعودية (KSA)",
        hubs: "الرياض (KAFD)، جدة، الدمام والخبر، نيوم، مكة المكرمة",
        sectors: "مشاريع رؤية 2030 الكبرى، الأمن السيبراني، الرعاية الصحية، اللوجستيات",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 ر.س",
      },
      {
        market: "قطر (Qatar)",
        hubs: "الدوحة (West Bay)، لوسيل، مدينة الطاقة، الوكرة، الخور",
        sectors: "النفط والغاز الطبيعي، البنية التحتية، البنوك السيادية، الطيران",
        responseWindow: "48 – 96 ساعة",
        priceRange: "149 – 399 ر.ق",
      },
      {
        market: "الكويت (Kuwait)",
        hubs: "مدينة الكويت (شرق)، حولي، السالمية، الفروانية، الأحمدي",
        sectors: "التجزئة والامتياز التجاري، البنوك والتدقيق، الطاقة والمقاولات",
        responseWindow: "48 – 96 ساعة",
        priceRange: "12 – 32 د.ك",
      },
    ],
    qaHeading: "إجابات مباشرة حول التوزيع المباشر للسيرة الذاتية في الخليج",
    qas: [
      {
        q: "ما هو نطاق عمل منصة أسرع (Asra3.com) حالياً؟",
        a: "منصة أسرع متخصصة حصرياً في تحسين السير الذاتية لأنظمة التوظيف الذكية (ATS) وتوزيعها عبر البريد الإلكتروني المباشر على أقسام الموارد البشرية في الإمارات والسعودية وقطر والكويت، بدفعة واحدة بدون اشتراكات شهرية.",
      },
      {
        q: "لماذا يتفوق الإرسال المباشر لصندوق بريد الـ HR على التقديم التقليدي في بوابات الوظائف؟",
        a: "يتلقى الإعلان العام الواحد على بوابات التوظيف مئات الطلبات المتشابهة، بينما يصل التقديم عبر أسرع مباشرة إلى بريد مدير التوظيف مع ملف PDF الأصلي وخطاب تقديم مخصص وزر رد مباشر على بريدك الشخصي.",
      },
      {
        q: "هل تبقى سيرتي الذاتية سرية وآمنة من شركتي الحالية؟",
        a: "نعم. لا ننشر ملفك في أي قاعدة بيانات عامة، ويمكنك حجب نطاق بريد جهة عملك الحالية عند الإطلاق لضمان عدم إرسال أي رسالة إليها إطلاقاً.",
      },
    ],
  },
  "gcc-en": {
    isEnglish: true,
    eyebrow: "GCC Executive Placement Overview — Verified HR Outreach",
    title: "How Asra3.com Optimizes Your CV for ATS & Places It Directly Into GCC HR Inboxes",
    summary:
      "Across the UAE, Saudi Arabia, Qatar, and Kuwait, senior and specialist roles are frequently shortlisted from direct HR inbox referrals before public job-board postings close. Asra3.com audits your PDF or DOCX CV against GCC ATS standards, generates a tailored cover letter, shields your current employer domain, and dispatches applications individually into MX-verified corporate HR inboxes with your personal email as Reply-To.",
    tableHeading: "GCC Hiring Benchmarks & One-Time Campaign Pricing",
    tableCols: ["GCC Market", "Primary Hiring Hubs", "Top Demand Sectors", "Typical HR Reply", "One-Time Tier Range"],
    rows: [
      {
        market: "United Arab Emirates",
        hubs: "Dubai (DIFC, Business Bay), Abu Dhabi (ADGM), Sharjah, Ajman, RAK",
        sectors: "Real Estate & MEP Engineering, AI & FinTech, Corporate Finance, Hospitality",
        responseWindow: "48h – 72h",
        priceRange: "149 – 399 AED",
      },
      {
        market: "Saudi Arabia",
        hubs: "Riyadh (KAFD), Jeddah, Dammam / Khobar, NEOM, Makkah",
        sectors: "Vision 2030 Giga-Projects, Cybersecurity & GovTech, Healthcare, Supply Chain",
        responseWindow: "48h – 72h",
        priceRange: "149 – 399 SAR",
      },
      {
        market: "Qatar",
        hubs: "Doha (West Bay), Lusail, Energy City, Al Wakrah, Al Khor",
        sectors: "Oil & Gas / LNG, Civil Infrastructure, Sovereign Banking, Aviation",
        responseWindow: "48h – 96h",
        priceRange: "149 – 399 QAR",
      },
      {
        market: "Kuwait",
        hubs: "Kuwait City (Sharq), Hawalli, Salmiya, Farwaniya, Ahmadi",
        sectors: "Retail & Franchise Groups, Banking & Audit, Energy Contracting, Logistics",
        responseWindow: "48h – 96h",
        priceRange: "12 – 32 KWD",
      },
    ],
    qaHeading: "Direct Answers for GCC Candidates Using Asra3.com",
    qas: [
      {
        q: "How do GCC hiring teams reply to my application?",
        a: "Every campaign email sets Reply-To directly to your personal email address and includes your direct phone and WhatsApp details in the cover letter, so HR interview invitations come straight to your inbox.",
      },
      {
        q: "What makes Asra3 different from public job boards or CV scraping databases?",
        a: "Asra3 never exposes your CV in public searchable directories. Instead, your attached CV and executive cover letter are sent via smart-drip Multi-SMTP infrastructure to MX-verified HR contacts matching your country, city, and sector.",
      },
      {
        q: "Is pricing one-time or a recurring subscription?",
        a: "All Asra3 campaigns (100, 300, or 500+ target employers) are strictly one-time payments settled securely via EasyKash DirectPayV1, with live delivery tracking included at /track.",
      },
    ],
  },
  ae: {
    isEnglish: false,
    eyebrow: "دليل التوظيف التنفيذي في الإمارات — Asra3 UAE",
    title: "إرسال السيرة الذاتية لشركات دبي وأبوظبي والشارقة مباشرة لصندوق بريد الـ HR",
    summary:
      "يربط محرك أسرع الإمارات (Asra3.com/ae) الباحثين عن عمل والمديرين مباشرة بصناديق بريد مسؤولي استقطاب الكفاءات في دبي (DIFC، الخليج التجاري، مدينة دبي للإنترنت) وأبوظبي (ADGM، مصدر) والشارقة وعجمان ورأس الخيمة، بتسعير بالدرهم الإماراتي (AED) وبضمان إرفاق السيرة الذاتية المحسنة بنظام ATS وخطاب تقديم احترافي.",
    tableHeading: "مؤشرات سوق التوظيف في دولة الإمارات العربية المتحدة",
    tableCols: ["الإمارة / المركز", "المناطق التجارية", "القطاعات النشطة", "متوسط التجاوب", "تكلفة الباقات"],
    rows: [
      {
        market: "دبي",
        hubs: "مركز دبي المالي العالمي (DIFC)، الخليج التجاري، جبل علي",
        sectors: "التطوير العقاري، الهندسة، التقنية المالية، السياحة والضيافة",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 د.إ",
      },
      {
        market: "أبوظبي والعين",
        hubs: "سوق أبوظبي العالمي (ADGM)، مدينة مصدر، مصفح",
        sectors: "الطاقة، البنية التحتية، الاستشارات الحكومية، الرعاية الصحية",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 د.إ",
      },
      {
        market: "الشارقة والإمارات الشمالية",
        hubs: "الشارقة، عجمان، رأس الخيمة",
        sectors: "التصنيع، الخدمات اللوجستية، التعليم، التجزئة",
        responseWindow: "72 ساعة",
        priceRange: "149 – 399 د.إ",
      },
    ],
    qaHeading: "أسئلة شائعة حول توزيع السيرة الذاتية في الإمارات",
    qas: [
      {
        q: "كم شركة في الإمارات تستلم سيرتي الذاتية؟",
        a: "يمكنك استهداف 100 شركة (انطلاقة: 149 درهم) أو 300 شركة مع خطاب تقديم ذكي (تيربو: 249 درهم) أو 500+ شركة مع إعادة صياغة ATS كاملة (هايبر: 399 درهم) في دفعة واحدة.",
      },
      {
        q: "هل يشمل التوزيع إمارات محددة مثل دبي وأبوظبي فقط أم كل الإمارات؟",
        a: "خلال خطوات إطلاق الحملة يمكنك تحديد مدن معينة (مثل دبي وأبوظبي فقط) أو توزيع السيرة الذاتية على كافة الإمارات المعتمدة.",
      },
      {
        q: "كيف أضمن ألا تصل سيرتي الذاتية إلى شركتي الحالية في دبي أو أبوظبي؟",
        a: "أدخل نطاق بريد شركتك الحالية في الخطوة الرابعة (درع استثناء جهة العمل)، وسيتم استبعاد جميع عناوين ذلك النطاق من الحملة تلقائياً.",
      },
    ],
  },
  sa: {
    isEnglish: false,
    eyebrow: "دليل التوظيف المباشر في السعودية ورؤية 2030 — Asra3 KSA",
    title: "توزيع السيرة الذاتية لشركات الرياض وجدة والدمام ومشاريع رؤية 2030",
    summary:
      "صُممت بوابة أسرع السعودية (Asra3.com/sa) لإيصال السيرة الذاتية وخطاب التقديم التنفيذي مباشرة إلى إدارات التوطين واستقطاب الكفاءات في الرياض (مركز الملك عبدالله المالي KAFD) وجدة والمنطقة الشرقية (الدمام، الخبر، الجبيل) ومشاريع نيوم، مع مطابقة معايير ATS والفرز المهني بتسعير بالريال السعودي (SAR).",
    tableHeading: "مؤشرات سوق التوظيف في المملكة العربية السعودية",
    tableCols: ["المنطقة", "المراكز والمشاريع", "القطاعات الأكثر طلباً", "متوسط التجاوب", "تكلفة الباقات"],
    rows: [
      {
        market: "الرياض",
        hubs: "مركز الملك عبدالله المالي (KAFD)، الواجهة، المشاريع الكبرى",
        sectors: "إدارة المشاريع، التحول الرقمي والأمن السيبراني، المالية",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 ر.س",
      },
      {
        market: "جدة ومكة ونيوم",
        hubs: "جدة، مشاريع البحر الأحمر، نيوم، المدينة المنورة",
        sectors: "الإنشاءات الضخمة، الضيافة والسياحة، سلاسل الإمداد والموانئ",
        responseWindow: "48 – 72 ساعة",
        priceRange: "149 – 399 ر.س",
      },
      {
        market: "المنطقة الشرقية",
        hubs: "الدمام، الخبر، الظهران، الجبيل الصناعية",
        sectors: "الطاقة والبتروكيماويات، الهندسة الميكانيكية والصناعية",
        responseWindow: "48 – 96 ساعة",
        priceRange: "149 – 399 ر.س",
      },
    ],
    qaHeading: "أسئلة شائعة حول توزيع السيرة الذاتية في السعودية",
    qas: [
      {
        q: "هل تصل السيرة الذاتية لشركات رؤية 2030 في الرياض والمنطقة الشرقية؟",
        a: "نعم، يرتّب محرك أسرع الشركات بحسب تخصصك الوظيفي وأولوية المدن التي تختارها في الرياض أو جدة أو الدمام/الخبر قبل البدء بالإرسال المتدرج.",
      },
      {
        q: "ما أسعار باقات أسرع في السعودية؟",
        a: "باقة انطلاقة (100 شركة) بـ 149 ريال، تيربو (300 شركة + خطاب تقديم ذكي) بـ 249 ريال، وهايبر (500+ شركة + إعادة صياغة ATS) بـ 399 ريال سعودي لمرة واحدة.",
      },
      {
        q: "هل يمكنني استهداف السعودية والإمارات معاً في حملة واحدة؟",
        a: "نعم، يمكنك اختيار السعودية كدولة أساسية وإضافة الإمارات أو قطر أو الكويت في الخطوة الثالثة لزيادة تغطية الشركات المستهدفة.",
      },
    ],
  },
  qa: {
    isEnglish: false,
    eyebrow: "دليل التوظيف المباشر في دولة قطر — Asra3 Qatar",
    title: "إرسال السيرة الذاتية إلى شركات الدوحة ولوسيل والوكرة مباشرة للـ HR",
    summary:
      "تساعد منصة أسرع قطر (Asra3.com/qa) الكفاءات الهندسية والمالية والتقنية والإدارية على الوصول المباشر لصناديق بريد الموارد البشرية في الدوحة (الخليج الغربي West Bay) ولوسيل ومدينة الطاقة والوكرة والخور، مع فحص ATS مجاني وخطاب تقديم مخصص وتقارير تتبع فورية.",
    tableHeading: "مؤشرات سوق التوظيف في دولة قطر",
    tableCols: ["المدينة / النطاق", "المناطق الحيوية", "القطاعات النشطة", "متوسط التجاوب", "تكلفة الباقات"],
    rows: [
      {
        market: "الدوحة والخليج الغربي",
        hubs: "West Bay، مشيرب، المنطقة الدبلوماسية، مطار حمد",
        sectors: "المصارف والتمويل، الطيران، التطوير العقاري، الضيافة",
        responseWindow: "48 – 96 ساعة",
        priceRange: "149 – 399 ر.ق",
      },
      {
        market: "لوسيل ومدينة الطاقة",
        hubs: "مدينة لوسيل، راس لفان، مسيعيد، الوكرة، الخور",
        sectors: "النفط والغاز الطبيعي المسال، الهندسة المدنية والكهربائية، المقاولات",
        responseWindow: "48 – 96 ساعة",
        priceRange: "149 – 399 ر.ق",
      },
    ],
    qaHeading: "أسئلة شائعة حول التقديم للشركات في قطر",
    qas: [
      {
        q: "ما القطاعات الأكثر استجابة في دولة قطر عبر أسرع؟",
        a: "تشهد قطاعات الهندسة والبنية التحتية والطاقة والمصارف والضيافة في الدوحة ولوسيل أعلى نسب فتح وقراءة من مسؤولي التوظيف.",
      },
      {
        q: "كيف أتابع الشركات التي استلمت وفتحت سيرتي الذاتية في قطر؟",
        a: "تتيح لك لوحة التتبع في (/track) مشاهدة أسماء الشركات وحالة الإرسال والفتح أولاً بأول مع إمكانية تصدير تقرير CSV.",
      },
      {
        q: "هل أستطيع الدفع بالريال القطري؟",
        a: "نعم، تظهر الباقات بالريال القطري (149 / 249 / 399 QAR) وبإمكانك الدفع بأمان عبر بوابة EasyKash بالبطاقات البنكية أو المحافظ المعتمدة.",
      },
    ],
  },
  kw: {
    isEnglish: false,
    eyebrow: "دليل التوظيف المباشر في دولة الكويت — Asra3 Kuwait",
    title: "توزيع السيرة الذاتية لشركات مدينة الكويت وحولي والسالمية والفروانية",
    summary:
      "توفّر بوابة أسرع الكويت (Asra3.com/kw) وصولاً مباشراً لملفك المهني وخطاب التقديم التنفيذي إلى إدارات الموارد البشرية في المجموعات التجارية والبنوك وشركات المقاولات والطاقة في مدينة الكويت (شرق) وحولي والسالمية والفروانية والأحمدي بتسعير واضح بالدينار الكويتي (KWD).",
    tableHeading: "مؤشرات سوق التوظيف في دولة الكويت",
    tableCols: ["المحافظة / النطاق", "المراكز التجارية", "القطاعات النشطة", "متوسط التجاوب", "تكلفة الباقات"],
    rows: [
      {
        market: "مدينة الكويت (العاصمة)",
        hubs: "شرق، المرقاب، القبلة، أبراج المال",
        sectors: "المصارف الإسلامية والتجارية، التدقيق المالي، المجموعات القابضة",
        responseWindow: "48 – 96 ساعة",
        priceRange: "12 – 32 د.ك",
      },
      {
        market: "حولي والسالمية والفروانية والأحمدي",
        hubs: "السالمية، حولي، المنطقة الحرة، الأحمدي، الشويخ الصناعية",
        sectors: "التجزئة والامتياز التجاري، اللوجستيات، النفط والمقاولات الهندسية",
        responseWindow: "48 – 96 ساعة",
        priceRange: "12 – 32 د.ك",
      },
    ],
    qaHeading: "أسئلة شائعة حول توزيع السيرة الذاتية في الكويت",
    qas: [
      {
        q: "ما هي أسعار باقات التوزيع في دولة الكويت؟",
        a: "تبدأ باقات التوزيع من 12 دينار كويتي لباقة انطلاقة (100 شركة)، و20 دينار لباقة تيربو (300 شركة + خطاب تقديم ذكي)، و32 دينار لباقة هايبر (500+ شركة + إعادة صياغة ATS).",
      },
      {
        q: "هل يتم إرسال ملف PDF الخاص بي مباشرة بدون تعديل غير مرغوب فيه؟",
        a: "نعم، يُرفق ملف السيرة الذاتية الأصلي الذي رفعته (PDF أو DOCX) مع خطاب تقديم منسّق باللغتين أو بالإنجليزية حسب اختيارك.",
      },
      {
        q: "كيف يتواصل معي مسؤولو التوظيف في الكويت؟",
        a: "بريد الرد المباشر (Reply-To) مضبوط على بريدك الشخصي، مع ذكر رقم هاتفك وواتساب في التوقيع ليتواصل معك مسؤول التوظيف فوراً.",
      },
    ],
  },
};

export function SeoGeoKnowledgeSection({
  variant,
}: {
  variant: SeoSectionVariant;
}) {
  const c = CONTENT_BY_VARIANT[variant];

  return (
    <section
      dir={c.isEnglish ? "ltr" : "rtl"}
      aria-label={c.title}
      className="border-t border-zinc-200 dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#0D0D10] py-16 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* AEO Direct Answer Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 sm:p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#09090B] px-3 py-1 text-[11px] font-bold text-[#D4AF37]">
            <Globe2 className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>{c.eyebrow}</span>
          </div>

          <h2 className="mt-4 text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
            {c.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-4xl">
            {c.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
              {c.isEnglish
                ? "Direct Candidate Reply-To Header"
                : "ردود الـ HR تصل لبريدك الشخصي مباشرة (Reply-To)"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
              {c.isEnglish
                ? "100% Current-Employer Domain Shield"
                : "حجب 100% لنطاق جهة عملك الحالية"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
              {c.isEnglish
                ? "MX-Verified GCC Corporate HR Mailboxes"
                : "قاعدة شركات خليجية مفحوصة بسجلات DNS MX"}
            </span>
          </div>
        </div>

        {/* Structured Hiring Benchmark Table (Crawlable Semantic HTML) */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] overflow-hidden shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-[#FAFAFA] dark:bg-[#09090B]">
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {c.tableHeading}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300">
                  {c.tableCols.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-5 py-3.5 font-extrabold text-start whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                {c.rows.map((row) => (
                  <tr key={row.market} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-3.5 font-bold text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                      {row.market}
                    </td>
                    <td className="px-5 py-3.5">{row.hubs}</td>
                    <td className="px-5 py-3.5">{row.sectors}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-[#9A7B1C] dark:text-[#D4AF37]">
                      {row.responseWindow}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold tabular-nums">
                      {row.priceRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country-Specific AEO Q&A List */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 mb-5">
            {c.qaHeading}
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {c.qas.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] p-4 space-y-2"
              >
                <dt className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50 leading-snug">
                  {item.q}
                </dt>
                <dd className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Clean Cross-Link Architecture Across GCC Hubs */}
        <nav
          aria-label={c.isEnglish ? "Asra3 GCC Regional Hubs" : "بوابات أسرع الإقليمية في الخليج"}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-5 py-4 text-xs font-bold"
        >
          <span className="text-zinc-500 dark:text-zinc-400">
            {c.isEnglish ? "Explore Regional Hubs & Verification:" : "تصفح بوابات الدول الخليجية والتوثيق:"}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-zinc-900 dark:text-zinc-100">
            <Link href="/" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "العربية (الرئيسية)" : "الرئيسية (الخليج)"}
            </Link>
            <Link href="/en" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              English Hub
            </Link>
            <Link href="/ae" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "UAE (/ae)" : "الإمارات (/ae)"}
            </Link>
            <Link href="/sa" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "Saudi Arabia (/sa)" : "السعودية (/sa)"}
            </Link>
            <Link href="/qa" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "Qatar (/qa)" : "قطر (/qa)"}
            </Link>
            <Link href="/kw" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "Kuwait (/kw)" : "الكويت (/kw)"}
            </Link>
            <Link href="/about" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "Methodology & About" : "المنهجية والتوثيق (/about)"}
            </Link>
            <Link href="/track" className="hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] underline-offset-4 hover:underline">
              {c.isEnglish ? "Track Order" : "تتبع الحملة (/track)"}
            </Link>
          </div>
        </nav>
      </div>
    </section>
  );
}
