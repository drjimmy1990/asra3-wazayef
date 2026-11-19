// ==============================================================================
// ASRA3.COM — Automated GCC Jobs Store, Ranking Engine & Employer Intake
// Dual Persistence: Supabase PostgreSQL (`jobs` table) + `.data/jobs.json`
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  CountryCode,
  CurrencyCode,
  EmploymentType,
  JobPostingRecord,
  JobPostingStatus,
  JobSearchParams,
  JobSearchResponse,
  JobSourceType,
} from "@/lib/types";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES, maskEmail } from "@/lib/seed-data";
import {
  classifyCompanyIndustry,
  verifyCompanyEmail,
} from "@/lib/company-verifier";
import { bulkImportCompanies, isSupabaseConfigured } from "@/lib/store";
import { notifySearchEnginesForUrls } from "@/lib/seo-indexer";

const DATA_DIR = path.join(process.cwd(), ".data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

function getSupabaseJobsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function slugifyJobSegment(input: string): string {
  const ascii = input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return ascii || "gcc-executive-role";
}

export function computeJobDedupeHash(params: {
  titleEn: string;
  titleAr?: string;
  companyDomain?: string;
  companyName: string;
  countryCode: CountryCode;
  cityId: string;
}): string {
  const titleKey = (params.titleEn || params.titleAr || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .trim();
  const orgKey = (params.companyDomain || params.companyName || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF.]+/g, "")
    .trim();
  const raw = `${titleKey}|${orgKey}|${params.countryCode}|${params.cityId}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

function buildSeedJobs(): JobPostingRecord[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const rawSeeds: Array<{
    id: string;
    title_ar: string;
    title_en: string;
    company_name: string;
    company_domain: string;
    apply_email: string;
    country_code: CountryCode;
    city_id: string;
    city_name_ar: string;
    city_name_en: string;
    industry_id: string;
    employment_type: EmploymentType;
    experience_level: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: CurrencyCode;
    summary_ar: string;
    summary_en: string;
    requirements_ar: string[];
    requirements_en: string[];
    skills: string[];
    is_featured?: boolean;
    hoursAgo: number;
  }> = [
    {
      id: "seed-job-ae-01",
      title_ar: "مدير مشاريع أول (الأنظمة الكهروميكانيكية MEP)",
      title_en: "Senior MEP Project Manager",
      company_name: "Sobha Realty & Construction",
      company_domain: "sobha-realty.com",
      apply_email: "careers@sobha-realty.com",
      country_code: "AE",
      city_id: "dubai",
      city_name_ar: "دبي",
      city_name_en: "Dubai",
      industry_id: "engineering",
      employment_type: "FULL_TIME",
      experience_level: "Senior (7-12 Years)",
      salary_min: 28000,
      salary_max: 38000,
      salary_currency: "AED",
      summary_ar:
        "قيادة تنفيذ وتسليم أعمال الأنظمة الكهروميكانيكية (HVAC, Firefighting, Electrical) للأبراج السكنية الفاخرة في دبي مع إدارة الجداول الزمنية والمقاولين الفرعيين.",
      summary_en:
        "Lead end-to-end MEP execution, authority approvals (DEWA/DCD), and commercial delivery across high-rise luxury developments in Dubai.",
      requirements_ar: [
        "خبرة لا تقل عن 8 سنوات في مشاريع الأبراج والمباني الكبرى في الإمارات أو الخليج",
        "اعتماد PMP أو عضوية جمعية المهندسين مع إلمام كامل باشتراطات DEWA والدفاع المدني",
        "إجادة إدارة العقود (FIDIC) ومراقبة التكاليف والجودة الميدانية",
      ],
      requirements_en: [
        "8+ years leading large-scale high-rise MEP packages across the UAE or GCC",
        "Strong command of DEWA, Dubai Civil Defense, and Municipality approvals",
        "PMP certification and FIDIC commercial contract administration experience",
      ],
      skills: ["MEP Management", "HVAC", "DEWA Approvals", "FIDIC", "Primavera P6", "PMP"],
      is_featured: true,
      hoursAgo: 2,
    },
    {
      id: "seed-job-sa-01",
      title_ar: "معماري حلول سحابية وأمن سيبراني أول",
      title_en: "Principal Cloud & Cybersecurity Architect",
      company_name: "Elm Digital Solutions",
      company_domain: "elm.sa",
      apply_email: "talent@elm.sa",
      country_code: "SA",
      city_id: "riyadh",
      city_name_ar: "الرياض",
      city_name_en: "Riyadh",
      industry_id: "it-software",
      employment_type: "FULL_TIME",
      experience_level: "Lead / Principal (6-10 Years)",
      salary_min: 32000,
      salary_max: 45000,
      salary_currency: "SAR",
      summary_ar:
        "تصميم البنية السحابية السيادية ومنظومات الأمن السيبراني المتوافقة مع ضوابط الهيئة الوطنية للأمن السيبراني (NCA ECC) لمشاريع التحول الرقمي الكبرى في الرياض.",
      summary_en:
        "Design resilient hybrid-cloud architectures and zero-trust security frameworks aligned with Saudi NCA ECC controls for flagship digital platforms in Riyadh.",
      requirements_ar: [
        "خبرة عملية عميقة في Kubernetes و AWS/Azure وهندسة الخدمات المصغرة",
        "معرفة تطبيقية بمعايير الامتثال السعودية (NCA ECC / SAMA / PDPL)",
        "إجادة اللغتين العربية والإنجليزية في إعداد الوثائق المعمارية التنفيذية",
      ],
      requirements_en: [
        "6+ years architecting enterprise Kubernetes, AWS/Azure, and zero-trust infrastructure",
        "Direct experience with Saudi NCA ECC, SAMA, or PDPL regulatory compliance",
        "Bilingual executive communication in Arabic and English preferred",
      ],
      skills: ["Cloud Architecture", "Kubernetes", "NCA ECC", "Zero Trust", "AWS", "DevSecOps"],
      is_featured: true,
      hoursAgo: 4,
    },
    {
      id: "seed-job-qa-01",
      title_ar: "مراقب مالي أول وتقارير دولية (IFRS)",
      title_en: "Senior Financial Controller (IFRS)",
      company_name: "Mannai Corporation QPSC",
      company_domain: "mannai.com.qa",
      apply_email: "careers@mannai.com.qa",
      country_code: "QA",
      city_id: "doha",
      city_name_ar: "الدوحة",
      city_name_en: "Doha",
      industry_id: "finance-accounting",
      employment_type: "FULL_TIME",
      experience_level: "Senior (6-10 Years)",
      salary_min: 24000,
      salary_max: 33000,
      salary_currency: "QAR",
      summary_ar:
        "الإشراف على الإقفال المالي الشهري، القوائم المالية الموحدة وفق معايير IFRS، وإدارة التدفقات النقدية والتدقيق الخارجي للمجموعة في الدوحة.",
      summary_en:
        "Oversee multi-entity financial consolidation, IFRS statutory reporting, budgeting, and executive treasury analytics in Doha.",
      requirements_ar: [
        "زمالة مهنية معتمدة (CPA أو ACCA أو CMA) مع خبرة 6 سنوات على الأقل",
        "إتقان أنظمة ERP المؤسسية (Oracle Fusion أو SAP S/4HANA)",
        "خبرة سابقة في شركات المساهمة أو مكاتب المراجعة الكبرى (Big 4)",
      ],
      requirements_en: [
        "CPA, ACCA, or CMA qualification with 6+ years of progressive financial control experience",
        "Hands-on mastery of SAP S/4HANA or Oracle Fusion Financials",
        "Prior GCC conglomerate or Big 4 audit background strongly preferred",
      ],
      skills: ["IFRS", "CPA", "SAP S/4HANA", "Financial Consolidation", "FP&A", "Audit"],
      is_featured: true,
      hoursAgo: 6,
    },
    {
      id: "seed-job-kw-01",
      title_ar: "مدير إقليمي للعمليات وتطوير العلامات التجارية",
      title_en: "Regional Retail & Brand Operations Manager",
      company_name: "Alshaya Enterprises Group",
      company_domain: "alshaya.com",
      apply_email: "recruitment@alshaya.com",
      country_code: "KW",
      city_id: "kuwaitcity",
      city_name_ar: "مدينة الكويت",
      city_name_en: "Kuwait City",
      industry_id: "hospitality-retail",
      employment_type: "FULL_TIME",
      experience_level: "Manager (5-9 Years)",
      salary_min: 1850,
      salary_max: 2600,
      salary_currency: "KWD",
      summary_ar:
        "قيادة الأداء التشغيلي والتجاري لسلسلة فروع العلامات العالمية في مدينة الكويت والسالمية، وتحقيق مستهدفات المبيعات وتجربة العملاء.",
      summary_en:
        "Drive multi-store P&L growth, visual merchandising standards, and operational excellence across flagship retail destinations in Kuwait.",
      requirements_ar: [
        "خبرة 5 سنوات فأكثر في إدارة التجزئة متعددة الفروع أو الضيافة في الخليج",
        "قدرة مثبتة على إدارة حسابات الأرباح والخسائر (P&L) وقيادة فرق تزيد عن 50 موظفاً",
        "مهارات تفاوض وتحليل مخزون ومؤشرات أداء بيعية عالية",
      ],
      requirements_en: [
        "5+ years managing multi-unit retail, F&B, or franchise operations in the GCC",
        "Proven P&L ownership and leadership of 50+ store operations staff",
        "Strong KPI analytics, inventory turnover, and merchandising execution",
      ],
      skills: ["Retail Operations", "P&L Management", "Franchise Growth", "Merchandising", "Team Leadership"],
      is_featured: false,
      hoursAgo: 9,
    },
    {
      id: "seed-job-ae-02",
      title_ar: "مهندس برمجيات متكامل أول (Next.js / Node.js / AI)",
      title_en: "Senior Full-Stack AI Product Engineer",
      company_name: "Careem Technologies",
      company_domain: "careem.com",
      apply_email: "talent.acquisition@careem.com",
      country_code: "AE",
      city_id: "dubai",
      city_name_ar: "دبي",
      city_name_en: "Dubai",
      industry_id: "it-software",
      employment_type: "FULL_TIME",
      experience_level: "Senior (5-8 Years)",
      salary_min: 25000,
      salary_max: 35000,
      salary_currency: "AED",
      summary_ar:
        "بناء وتوسيع تطبيقات ومنتجات رقمية عالية الاعتمادية مدعومة بالذكاء الاصطناعي لخدمة ملايين المستخدمين في الشرق الأوسط انطلاقاً من دبي.",
      summary_en:
        "Architect high-throughput TypeScript, Next.js, and LLM-powered customer experiences serving millions of users across the MENAP region from Dubai.",
      requirements_ar: [
        "إتقان TypeScript و React/Next.js وبناء واجهات برمجية موزعة عالية الأداء",
        "خبرة عملية في دمج نماذج الذكاء الاصطناعي التوليدي وقواعد البيانات المتجهة",
        "شغف بجودة الكود والاختبارات الآلية وتحسين زمن الاستجابة",
      ],
      requirements_en: [
        "5+ years shipping production TypeScript, React/Next.js, and distributed Node/Go microservices",
        "Practical experience with LLM orchestration, RAG pipelines, and PostgreSQL",
        "Track record owning high-scale consumer or FinTech systems",
      ],
      skills: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "LLM Integration", "System Design"],
      hoursAgo: 11,
    },
    {
      id: "seed-job-sa-02",
      title_ar: "مدير عقود ومشتريات هندسية (مشاريع رؤية 2030)",
      title_en: "Contracts & Procurement Manager — Giga Projects",
      company_name: "Nesma & Partners Contracting",
      company_domain: "nesma-partners.com",
      apply_email: "careers@nesma-partners.com",
      country_code: "SA",
      city_id: "neom",
      city_name_ar: "نيوم وتبوك",
      city_name_en: "NEOM & Tabuk",
      industry_id: "logistics-supply",
      employment_type: "FULL_TIME",
      experience_level: "Manager (7-12 Years)",
      salary_min: 29000,
      salary_max: 40000,
      salary_currency: "SAR",
      summary_ar:
        "إدارة استراتيجيات التوريد الاستراتيجي والمناقصات وعقود المقاولين لمشاريع البنية التحتية الكبرى في نيوم والرياض.",
      summary_en:
        "Lead strategic sourcing, EPC tender evaluation, and FIDIC subcontract administration for flagship giga-project packages in NEOM and Riyadh.",
      requirements_ar: [
        "خبرة 7 سنوات في إدارة العقود والمشتريات الهندسية في مشاريع البنية التحتية",
        "شهادة MCIPS أو PMP مع خبرة تفاوض مع الموردين الدوليين والمحليين",
        "إلمام بنظام المنافسات والمشتريات ومتطلبات المحتوى المحلي في السعودية",
      ],
      requirements_en: [
        "7+ years in EPC procurement, strategic sourcing, and subcontract management",
        "MCIPS or PMP credential with strong vendor negotiation track record",
        "Familiarity with Saudi Local Content (iktva) and giga-project governance",
      ],
      skills: ["Strategic Sourcing", "EPC Procurement", "FIDIC Contracts", "SAP Ariba", "Supply Chain"],
      hoursAgo: 15,
    },
    {
      id: "seed-job-ae-03",
      title_ar: "أخصائي أول استقطاب كفاءات وموارد بشرية",
      title_en: "Senior Talent Acquisition & HR Business Partner",
      company_name: "Al-Futtaim Group",
      company_domain: "alfuttaim.com",
      apply_email: "hr.careers@alfuttaim.com",
      country_code: "AE",
      city_id: "abudhabi",
      city_name_ar: "أبوظبي",
      city_name_en: "Abu Dhabi",
      industry_id: "hr-admin",
      employment_type: "FULL_TIME",
      experience_level: "Mid-Senior (4-7 Years)",
      salary_min: 18000,
      salary_max: 24000,
      salary_currency: "AED",
      summary_ar:
        "إدارة دورة الاستقطاب والتوظيف التنفيذي وبرامج التوطين وتطوير الأداء لوحدات الأعمال في أبوظبي ودبي.",
      summary_en:
        "Partner with business leaders in Abu Dhabi and Dubai to execute executive hiring, Emiratisation initiatives, and workforce planning.",
      requirements_ar: [
        "خبرة 4 سنوات على الأقل في التوظيف المؤسسي وشراكة أعمال الموارد البشرية في الإمارات",
        "معرفة دقيقة بقانون العمل الإماراتي وأنظمة ATS الحديثة مثل Workday أو SuccessFactors",
        "مهارات تواصل وتقييم كفاءات احترافية باللغتين العربية والإنجليزية",
      ],
      requirements_en: [
        "4+ years in corporate talent acquisition and HRBP roles within the UAE",
        "Proficiency with SAP SuccessFactors or Workday ATS and UAE Labour Law",
        "Fluent Arabic and English communication skills",
      ],
      skills: ["Talent Acquisition", "HRBP", "UAE Labour Law", "SAP SuccessFactors", "Workforce Planning"],
      hoursAgo: 18,
    },
    {
      id: "seed-job-sa-03",
      title_ar: "طبيب أخصائي / مدير جودة طبية معتمد (SCFHS)",
      title_en: "Healthcare Quality & Clinical Operations Lead (SCFHS)",
      company_name: "Dr. Sulaiman Al Habib Medical Group",
      company_domain: "drsulaimanalhabib.com",
      apply_email: "medical.recruitment@drsulaimanalhabib.com",
      country_code: "SA",
      city_id: "jeddah",
      city_name_ar: "جدة",
      city_name_en: "Jeddah",
      industry_id: "healthcare",
      employment_type: "FULL_TIME",
      experience_level: "Senior (5-9 Years)",
      salary_min: 22000,
      salary_max: 32000,
      salary_currency: "SAR",
      summary_ar:
        "قيادة برامج الاعتماد الصحي (CBAHI / JCI) وسلامة المرضى وتحسين العمليات السريرية في المجمع الطبي بمدينة جدة.",
      summary_en:
        "Lead JCI/CBAHI hospital accreditation, clinical governance, and patient safety excellence across specialty medical facilities in Jeddah.",
      requirements_ar: [
        "تصنيف ساري أو قابلية التسجيل في الهيئة السعودية للتخصصات الصحية (SCFHS)",
        "خبرة عملية في معايير CBAHI و JCI ومؤشرات الأداء الإكلينيكي",
        "شهادة CPHQ مفضلة بشدة مع خبرة قيادية في المستشفيات الكبرى",
      ],
      requirements_en: [
        "Eligible or active Saudi Commission for Health Specialties (SCFHS) registration",
        "5+ years leading CBAHI and JCI hospital quality accreditation programs",
        "CPHQ certification and multidisciplinary clinical leadership",
      ],
      skills: ["CBAHI", "JCI Accreditation", "CPHQ", "Patient Safety", "SCFHS", "Clinical Governance"],
      hoursAgo: 22,
    },
    {
      id: "seed-job-ae-04",
      title_ar: "مستشار استثمار وتطوير مبيعات عقارية دولية",
      title_en: "Senior Luxury Property Investment Advisor",
      company_name: "Aldar Properties PJSC",
      company_domain: "aldar.com",
      apply_email: "careers@aldar.com",
      country_code: "AE",
      city_id: "abudhabi",
      city_name_ar: "أبوظبي",
      city_name_en: "Abu Dhabi",
      industry_id: "real-estate",
      employment_type: "FULL_TIME",
      experience_level: "Mid-Senior (3-6 Years)",
      salary_min: 16000,
      salary_max: 30000,
      salary_currency: "AED",
      summary_ar:
        "إدارة محفظة كبار المستثمرين وتقديم الاستشارات العقارية للمشاريع الساحلية والسكنية الفاخرة في جزيرة السعديات وياس بأبوظبي.",
      summary_en:
        "Advise HNW regional and international investors on prime waterfront and master-planned developments across Saadiyat and Yas Island in Abu Dhabi.",
      requirements_ar: [
        "سجل مبيعات موثق في القطاع العقاري الفاخر أو إدارة الثروات في الإمارات",
        "مهارات عرض وتفاوض عالية وبناء علاقات طويلة الأمد مع المستثمرين",
        "إجادة العربية والإنجليزية والعمل على أنظمة Salesforce CRM",
      ],
      requirements_en: [
        "Proven sales track record in UAE off-plan luxury real estate or private wealth advisory",
        "Strong investor portfolio management and Salesforce CRM discipline",
        "Bilingual fluency in Arabic and English (additional languages a plus)",
      ],
      skills: ["Luxury Real Estate", "HNW Advisory", "Property Sales", "Salesforce CRM", "Negotiation"],
      hoursAgo: 27,
    },
    {
      id: "seed-job-qa-02",
      title_ar: "مهندس تخطيط ومشاريع طاقة وغاز مسال (LNG)",
      title_en: "Senior Project Planning Engineer — Energy & LNG",
      company_name: "Nakilat Maritime & Energy",
      company_domain: "nakilat.com",
      apply_email: "recruitment@nakilat.com",
      country_code: "QA",
      city_id: "lusail",
      city_name_ar: "لوسيل",
      city_name_en: "Lusail",
      industry_id: "engineering",
      employment_type: "FULL_TIME",
      experience_level: "Senior (7-11 Years)",
      salary_min: 26000,
      salary_max: 36000,
      salary_currency: "QAR",
      summary_ar:
        "تطوير ومراقبة الجداول الزمنية المتكاملة وتحليل المسار الحرج والمخاطر لمشاريع الطاقة والبنية البحرية في لوسيل وراس لفان.",
      summary_en:
        "Develop integrated EPC master schedules, earned-value analytics, and schedule risk models for strategic LNG and marine infrastructure in Qatar.",
      requirements_ar: [
        "بكالوريوس هندسة مع خبرة 7 سنوات في مشاريع النفط والغاز والطاقة (EPC)",
        "إتقان تام لبرنامج Primavera P6 وتحليل القيمة المكتسبة (EVM)",
        "خبرة في إعداد التقارير التنفيذية للإدارة العليا باللغة الإنجليزية",
      ],
      requirements_en: [
        "Engineering degree with 7+ years in Oil, Gas, LNG, or marine EPC project controls",
        "Expert command of Primavera P6, Earned Value Management, and delay analysis",
        "Strong executive reporting and stakeholder alignment skills",
      ],
      skills: ["Primavera P6", "Project Controls", "LNG / Oil & Gas", "Earned Value", "EPC Scheduling"],
      hoursAgo: 31,
    },
    {
      id: "seed-job-sa-04",
      title_ar: "مدير تسويق رقمي ونمو الأداء (Performance Growth)",
      title_en: "Head of Digital Performance & Growth Marketing",
      company_name: "Jarir Marketing Company",
      company_domain: "jarir.com",
      apply_email: "careers@jarir.com",
      country_code: "SA",
      city_id: "riyadh",
      city_name_ar: "الرياض",
      city_name_en: "Riyadh",
      industry_id: "sales-marketing",
      employment_type: "FULL_TIME",
      experience_level: "Manager (5-8 Years)",
      salary_min: 20000,
      salary_max: 28000,
      salary_currency: "SAR",
      summary_ar:
        "قيادة حملات الاستحواذ الرقمي، تحسين محركات البحث (SEO)، ومضاعفة العائد الإعلاني (ROAS) لمنصات التجارة الإلكترونية في السوق السعودي والخليجي.",
      summary_en:
        "Scale omnichannel customer acquisition, programmatic SEO, paid search/social ROAS, and conversion rate optimization across Saudi Arabia and the GCC.",
      requirements_ar: [
        "خبرة 5 سنوات في قيادة التسويق الرقمي للتجارة الإلكترونية بميزانيات مليونية",
        "إتقان Google Ads و Meta Ads و GA4 وتحليل قمع التحويل (CRO)",
        "فهم عميق لسلوك المستهلك الخليجي والمواسم البيعية في السعودية",
      ],
      requirements_en: [
        "5+ years leading high-budget e-commerce growth marketing in KSA/GCC",
        "Deep analytical command of GA4, Google Ads, Meta/TikTok Ads, and technical SEO",
        "Bilingual Arabic/English creative and analytical mindset",
      ],
      skills: ["Performance Marketing", "Technical SEO", "GA4", "ROAS Optimization", "E-Commerce Growth"],
      hoursAgo: 36,
    },
    {
      id: "seed-job-kw-02",
      title_ar: "مدقق داخلي أول ومخاطر مصرفية",
      title_en: "Senior Internal Auditor — Corporate Banking",
      company_name: "Gulf Bank Kuwait",
      company_domain: "e-gulfbank.com",
      apply_email: "careers@e-gulfbank.com",
      country_code: "KW",
      city_id: "kuwaitcity",
      city_name_ar: "مدينة الكويت",
      city_name_en: "Kuwait City",
      industry_id: "finance-accounting",
      employment_type: "FULL_TIME",
      experience_level: "Senior (5-8 Years)",
      salary_min: 1650,
      salary_max: 2300,
      salary_currency: "KWD",
      summary_ar:
        "تنفيذ مهام التدقيق الداخلي وتقييم الضوابط الرقابية ومخاطر الائتمان والامتثال لتعليمات بنك الكويت المركزي.",
      summary_en:
        "Execute risk-based internal audits across corporate credit, treasury, and AML compliance in alignment with Central Bank of Kuwait standards.",
      requirements_ar: [
        "شهادة CIA أو CPA أو ACCA مع خبرة مصرفية لا تقل عن 5 سنوات",
        "إلمام بالمعايير الرقابية المصرفية في دول الخليج ومكافحة غسل الأموال",
        "قدرة عالية على صياغة تقارير لجان التدقيق باللغتين العربية والإنجليزية",
      ],
      requirements_en: [
        "CIA, CPA, or ACCA certification with 5+ years in banking audit or risk advisory",
        "Strong command of GCC central bank governance, credit risk, and AML controls",
        "Clear executive report writing in English and Arabic",
      ],
      skills: ["Internal Audit", "CIA", "Banking Risk", "AML Compliance", "Credit Controls"],
      hoursAgo: 42,
    },
  ];

  return rawSeeds.map((item) => {
    const publishedMs = now - item.hoursAgo * 3600 * 1000;
    const publishedIso = new Date(publishedMs).toISOString();
    const expiresIso = new Date(publishedMs + 35 * dayMs).toISOString();
    const dedupe_hash = computeJobDedupeHash({
      titleEn: item.title_en,
      titleAr: item.title_ar,
      companyDomain: item.company_domain,
      companyName: item.company_name,
      countryCode: item.country_code,
      cityId: item.city_id,
    });
    const slug = `${slugifyJobSegment(item.title_en)}-${item.city_id}-${item.country_code.toLowerCase()}-${dedupe_hash.slice(0, 6)}`;

    return {
      id: item.id,
      slug,
      dedupe_hash,
      title_ar: item.title_ar,
      title_en: item.title_en,
      company_name: item.company_name,
      company_domain: item.company_domain,
      company_website: `https://${item.company_domain}`,
      apply_email: item.apply_email,
      masked_apply_email: maskEmail(item.apply_email),
      apply_url: null,
      apply_whatsapp: null,
      country_code: item.country_code,
      city_id: item.city_id,
      city_name_ar: item.city_name_ar,
      city_name_en: item.city_name_en,
      industry_id: item.industry_id,
      employment_type: item.employment_type,
      experience_level: item.experience_level,
      salary_min: item.salary_min,
      salary_max: item.salary_max,
      salary_currency: item.salary_currency,
      summary_ar: item.summary_ar,
      summary_en: item.summary_en,
      requirements_ar: item.requirements_ar,
      requirements_en: item.requirements_en,
      skills: item.skills,
      source_type: "verified_harvester",
      source_channel: "asra3_verified_seed",
      is_mx_verified: true,
      is_featured: Boolean(item.is_featured),
      quality_score: 92,
      views_count: 40 + (item.hoursAgo % 17) * 9,
      apply_clicks_count: 8 + (item.hoursAgo % 11) * 3,
      status: "published",
      fb_post_id: null,
      fb_posted_at: null,
      tg_message_id: null,
      tg_posted_at: null,
      published_at: publishedIso,
      expires_at: expiresIso,
      created_at: publishedIso,
    };
  });
}

export const INITIAL_GCC_JOBS: JobPostingRecord[] = buildSeedJobs();

function readLocalJobs(): JobPostingRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(JOBS_FILE)) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify(INITIAL_GCC_JOBS, null, 2), "utf8");
      return INITIAL_GCC_JOBS;
    }
    const raw = fs.readFileSync(JOBS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify(INITIAL_GCC_JOBS, null, 2), "utf8");
      return INITIAL_GCC_JOBS;
    }
    return parsed as JobPostingRecord[];
  } catch {
    return INITIAL_GCC_JOBS;
  }
}

function writeLocalJobs(jobs: JobPostingRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf8");
  } catch (err) {
    console.error("Failed writing .data/jobs.json:", err);
  }
}

function normalizeJobRow(row: JobPostingRecord): JobPostingRecord {
  const nowMs = Date.now();
  const expMs = new Date(row.expires_at).getTime();
  const autoStatus: JobPostingStatus =
    row.status === "published" && Number.isFinite(expMs) && expMs < nowMs
      ? "expired"
      : row.status;

  return {
    ...row,
    status: autoStatus,
    masked_apply_email: row.apply_email ? maskEmail(row.apply_email) : null,
    requirements_ar: Array.isArray(row.requirements_ar) ? row.requirements_ar : [],
    requirements_en: Array.isArray(row.requirements_en) ? row.requirements_en : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
  };
}

export async function getAllJobsRaw(): Promise<JobPostingRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseJobsClient();
      const { data, error } = await sb
        .from("jobs")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(1000);
      if (!error && Array.isArray(data) && data.length > 0) {
        return (data as JobPostingRecord[]).map(normalizeJobRow);
      }
    } catch {
      // Fallback cleanly to local volume store if `jobs` table is not created yet
    }
  }

  return readLocalJobs().map(normalizeJobRow);
}

/**
 * Multi-Signal Search & Relevance Ranking Scorer (0 - 135 scale)
 * RankScore = (0.35 * TextMatch) + (0.25 * FreshnessDecay) + (0.20 * TrustTier)
 *           + (0.10 * CompletenessScore) + (0.10 * EngagementBoost) + FeaturedBoost
 */
export function scoreJobForQuery(
  job: JobPostingRecord,
  rawQuery?: string
): number {
  const q = (rawQuery || "").trim().toLowerCase();
  let textMatch = 70; // Baseline relevance when browsing without keyword query

  if (q) {
    const terms = q.split(/\s+/).filter((t) => t.length >= 2);
    const titleHaystack = `${job.title_en} ${job.title_ar}`.toLowerCase();
    const skillHaystack = job.skills.join(" ").toLowerCase();
    const companyHaystack = `${job.company_name} ${job.city_name_en} ${job.city_name_ar}`.toLowerCase();
    const bodyHaystack = `${job.summary_en} ${job.summary_ar} ${job.requirements_en.join(" ")} ${job.requirements_ar.join(" ")}`.toLowerCase();

    if (terms.length === 0) {
      textMatch = titleHaystack.includes(q) ? 100 : bodyHaystack.includes(q) ? 65 : 0;
    } else {
      let matchedTerms = 0;
      let weightedHits = 0;
      for (const term of terms) {
        let hit = false;
        if (titleHaystack.includes(term)) {
          weightedHits += 45;
          hit = true;
        }
        if (skillHaystack.includes(term)) {
          weightedHits += 30;
          hit = true;
        }
        if (companyHaystack.includes(term)) {
          weightedHits += 20;
          hit = true;
        }
        if (bodyHaystack.includes(term)) {
          weightedHits += 12;
          hit = true;
        }
        if (hit) matchedTerms++;
      }
      if (matchedTerms === 0) return -1; // Exclude non-matching jobs when query is present
      const coverageRatio = matchedTerms / terms.length;
      textMatch = Math.min(100, Math.round(weightedHits / terms.length) * coverageRatio + 25);
    }
  }

  // Freshness decay (14-day half-life)
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(job.published_at).getTime()) / (1000 * 3600)
  );
  const freshnessDecay = Math.round(100 * Math.pow(0.5, ageHours / (14 * 24)));

  // Trust tier (Direct MX-verified employer > MX-verified harvester > unverified)
  const trustTier =
    job.source_type === "employer_direct" && job.is_mx_verified
      ? 100
      : job.is_mx_verified
      ? 88
      : 50;

  // Detail & salary transparency completeness
  let completeness = 50;
  if (job.salary_min && job.salary_max) completeness += 25;
  if (job.skills.length >= 4) completeness += 15;
  if (job.requirements_en.length >= 2 || job.requirements_ar.length >= 2) {
    completeness += 10;
  }

  // Engagement velocity boost
  const engagement = Math.min(
    100,
    25 + job.apply_clicks_count * 4 + Math.round(job.views_count * 0.4)
  );

  const featuredBoost = job.is_featured ? 35 : 0;

  const composite =
    0.35 * textMatch +
    0.25 * freshnessDecay +
    0.2 * trustTier +
    0.1 * Math.min(100, completeness) +
    0.1 * engagement +
    featuredBoost;

  return Math.round(composite * 10) / 10;
}

export async function searchAndRankJobs(
  params: JobSearchParams = {},
  options?: { includeSensitiveApplyEmail?: boolean }
): Promise<JobSearchResponse> {
  const all = await getAllJobsRaw();
  const activePool = all.filter((j) =>
    params.includePending
      ? j.status === "published" || j.status === "pending_review"
      : j.status === "published"
  );

  const countsByCountry: Record<CountryCode, number> = {
    AE: 0,
    SA: 0,
    QA: 0,
    KW: 0,
  };
  const countsByIndustry: Record<string, number> = {};

  for (const j of all) {
    if (j.status !== "published") continue;
    if (countsByCountry[j.country_code] !== undefined) {
      countsByCountry[j.country_code]++;
    }
    countsByIndustry[j.industry_id] = (countsByIndustry[j.industry_id] || 0) + 1;
  }

  const scored: JobPostingRecord[] = [];

  for (const job of activePool) {
    if (params.country && job.country_code !== params.country) continue;
    if (params.city && job.city_id !== params.city) continue;
    if (params.industry && job.industry_id !== params.industry) continue;
    if (params.employmentType && job.employment_type !== params.employmentType) {
      continue;
    }
    if (params.verifiedOnly && !job.is_mx_verified) continue;

    const score = scoreJobForQuery(job, params.q);
    if (score < 0) continue;

    scored.push({
      ...job,
      apply_email: options?.includeSensitiveApplyEmail ? job.apply_email : null,
      rank_score: score,
    });
  }

  const sortMode = params.sort || "rank";
  scored.sort((a, b) => {
    if (sortMode === "newest") {
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }
    if (sortMode === "salary") {
      const aSal = a.salary_max || a.salary_min || 0;
      const bSal = b.salary_max || b.salary_min || 0;
      if (bSal !== aSal) return bSal - aSal;
    }
    if (sortMode === "verified") {
      if (a.is_mx_verified !== b.is_mx_verified) {
        return a.is_mx_verified ? -1 : 1;
      }
    }
    return (b.rank_score || 0) - (a.rank_score || 0);
  });

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 12));
  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;

  return {
    jobs: scored.slice(offset, offset + limit),
    total,
    page,
    totalPages,
    totalActiveJobs:
      countsByCountry.AE +
      countsByCountry.SA +
      countsByCountry.QA +
      countsByCountry.KW,
    countsByCountry,
    countsByIndustry,
  };
}

export async function getJobBySlug(slug: string): Promise<{
  job: JobPostingRecord | null;
  isExpired: boolean;
  similarJobs: JobPostingRecord[];
}> {
  const cleanSlug = decodeURIComponent(slug || "").trim().toLowerCase();
  const all = await getAllJobsRaw();
  const found = all.find((j) => j.slug.toLowerCase() === cleanSlug) || null;

  if (!found || found.status === "rejected" || found.status === "pending_review") {
    return { job: null, isExpired: false, similarJobs: [] };
  }

  const isExpired = found.status === "expired";

  const similarJobs = all
    .filter(
      (j) =>
        j.status === "published" &&
        j.id !== found.id &&
        (j.country_code === found.country_code ||
          j.industry_id === found.industry_id)
    )
    .sort((a, b) => {
      const aMatch =
        (a.country_code === found.country_code ? 2 : 0) +
        (a.industry_id === found.industry_id ? 3 : 0);
      const bMatch =
        (b.country_code === found.country_code ? 2 : 0) +
        (b.industry_id === found.industry_id ? 3 : 0);
      if (bMatch !== aMatch) return bMatch - aMatch;
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    })
    .slice(0, 6)
    .map((j) => ({ ...j, apply_email: null }));

  return { job: found, isExpired, similarJobs };
}

export interface NewJobInput {
  title_ar: string;
  title_en: string;
  company_name: string;
  company_domain?: string;
  company_website?: string | null;
  apply_email?: string | null;
  apply_url?: string | null;
  apply_whatsapp?: string | null;
  country_code: CountryCode;
  city_id?: string;
  industry_id?: string;
  employment_type?: EmploymentType;
  experience_level?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: CurrencyCode;
  summary_ar: string;
  summary_en: string;
  requirements_ar?: string[];
  requirements_en?: string[];
  skills?: string[];
  source_type?: JobSourceType;
  source_channel?: string | null;
  is_mx_verified?: boolean;
  is_featured?: boolean;
  status?: JobPostingStatus;
}

export async function upsertJobPostings(
  inputs: NewJobInput[]
): Promise<{
  inserted: JobPostingRecord[];
  skippedDuplicates: number;
}> {
  if (inputs.length === 0) {
    return { inserted: [], skippedDuplicates: 0 };
  }

  const existing = readLocalJobs();
  const seenHashes = new Set(existing.map((j) => j.dedupe_hash));
  const seenSlugs = new Set(existing.map((j) => j.slug));

  const inserted: JobPostingRecord[] = [];
  let skippedDuplicates = 0;
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString();

  for (const item of inputs) {
    const countryObj =
      INITIAL_COUNTRIES.find((c) => c.code === item.country_code) ||
      INITIAL_COUNTRIES[0];
    const cityObj =
      countryObj.cities.find((c) => c.id === item.city_id) ||
      countryObj.cities[0];

    const emailDomain = item.apply_email?.includes("@")
      ? item.apply_email.split("@")[1].toLowerCase().trim()
      : "";
    const domain = (item.company_domain || emailDomain || "").toLowerCase();

    const industryId =
      item.industry_id &&
      INITIAL_INDUSTRIES.some((ind) => ind.id === item.industry_id)
        ? item.industry_id
        : classifyCompanyIndustry({
            rawIndustry: `${item.summary_en} ${item.summary_ar}`,
            companyName: item.company_name,
            subSpecialty: `${item.title_en} ${item.title_ar}`,
            domain,
            email: item.apply_email || "",
          });

    const dedupe_hash = computeJobDedupeHash({
      titleEn: item.title_en,
      titleAr: item.title_ar,
      companyDomain: domain,
      companyName: item.company_name,
      countryCode: countryObj.code,
      cityId: cityObj.id,
    });

    if (seenHashes.has(dedupe_hash)) {
      skippedDuplicates++;
      continue;
    }

    let slug = `${slugifyJobSegment(item.title_en || item.title_ar)}-${cityObj.id}-${countryObj.code.toLowerCase()}-${dedupe_hash.slice(0, 6)}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${Date.now().toString(36).slice(-3)}`;
    }

    const qualityScore = Math.min(
      99,
      65 +
        (item.is_mx_verified !== false ? 15 : 0) +
        (item.salary_min || item.salary_max ? 8 : 0) +
        ((item.skills?.length || 0) >= 3 ? 7 : 0) +
        ((item.requirements_en?.length || 0) >= 2 ? 4 : 0)
    );

    const record: JobPostingRecord = {
      id: `job-${countryObj.code.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      slug,
      dedupe_hash,
      title_ar: item.title_ar.trim(),
      title_en: item.title_en.trim(),
      company_name: item.company_name.trim(),
      company_domain: domain,
      company_website:
        item.company_website || (domain ? `https://${domain}` : null),
      apply_email: item.apply_email ? item.apply_email.trim().toLowerCase() : null,
      masked_apply_email: item.apply_email ? maskEmail(item.apply_email) : null,
      apply_url: item.apply_url || null,
      apply_whatsapp: item.apply_whatsapp || null,
      country_code: countryObj.code,
      city_id: cityObj.id,
      city_name_ar: cityObj.name_ar,
      city_name_en: cityObj.name_en,
      industry_id: industryId,
      employment_type: item.employment_type || "FULL_TIME",
      experience_level: item.experience_level || "Mid-Senior (3-7 Years)",
      salary_min: item.salary_min ?? null,
      salary_max: item.salary_max ?? null,
      salary_currency: item.salary_currency || countryObj.currency_code,
      summary_ar: item.summary_ar.trim(),
      summary_en: item.summary_en.trim(),
      requirements_ar: item.requirements_ar?.length
        ? item.requirements_ar
        : [
            `خبرة عملية موثقة في مجال ${item.title_ar} داخل ${countryObj.name_ar} أو دول الخليج`,
            "إجادة مهارات التواصل المهني والعمل ضمن فرق متعددة التخصصات",
          ],
      requirements_en: item.requirements_en?.length
        ? item.requirements_en
        : [
            `Proven hands-on GCC or international experience in ${item.title_en}`,
            "Strong professional communication and execution skills",
          ],
      skills: item.skills?.length ? item.skills.slice(0, 8) : ["GCC Experience", "ATS Ready"],
      source_type: item.source_type || "verified_harvester",
      source_channel: item.source_channel || null,
      is_mx_verified: item.is_mx_verified !== false,
      is_featured: Boolean(item.is_featured),
      quality_score: qualityScore,
      views_count: 1,
      apply_clicks_count: 0,
      status: item.status || "published",
      fb_post_id: null,
      fb_posted_at: null,
      tg_message_id: null,
      tg_posted_at: null,
      published_at: nowIso,
      expires_at: expiresIso,
      created_at: nowIso,
    };

    seenHashes.add(dedupe_hash);
    seenSlugs.add(slug);
    inserted.push(record);
  }

  if (inserted.length > 0) {
    const merged = [...inserted, ...existing].slice(0, 1500);
    writeLocalJobs(merged);

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseJobsClient();
        const dbRows = inserted.map((r) => {
          const copy = { ...r };
          delete copy.masked_apply_email;
          delete copy.rank_score;
          return copy;
        });
        await sb.from("jobs").upsert(dbRows, { onConflict: "dedupe_hash" });
      } catch {
        // Non-blocking if Supabase migration 002 hasn't been executed yet
      }
    }

    const publishedUrls = inserted
      .filter((j) => j.status === "published")
      .flatMap((j) => [
        `/jobs/${j.slug}`,
        `/jobs`,
        `/${j.country_code.toLowerCase()}/jobs`,
        `/${j.country_code.toLowerCase()}/jobs/${j.industry_id}`,
      ]);

    if (publishedUrls.length > 0) {
      notifySearchEnginesForUrls(publishedUrls, "URL_UPDATED").catch(() => {});
    }
  }

  return { inserted, skippedDuplicates };
}

/**
 * Handles Direct Employer Job Submissions (/employers):
 * - Corporate domain passing live DNS MX -> auto-published immediately + enriches HR directory!
 * - Free webmail (@gmail.com, @outlook.com) with valid MX -> held in `pending_review` for /admin!
 * - Dead/invalid email -> rejected cleanly with clear error code.
 */
export async function submitEmployerJobRequest(payload: {
  company_name: string;
  company_website?: string;
  hr_email: string;
  apply_url?: string;
  apply_whatsapp?: string;
  country_code: CountryCode;
  city_id: string;
  industry_id: string;
  employment_type: EmploymentType;
  experience_level: string;
  title_ar?: string;
  title_en?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  description: string;
  skills?: string[];
}): Promise<{
  ok: boolean;
  autoPublished: boolean;
  job?: JobPostingRecord;
  errorReason?: string;
}> {
  const cleanEmail = (payload.hr_email || "").trim().toLowerCase();

  // Step 1: Test strict corporate domain + DNS MX
  const corporateCheck = await verifyCompanyEmail(cleanEmail, {
    checkMx: true,
    allowPersonalWebmail: false,
  });

  let isCorporateMxVerified = false;
  let targetStatus: JobPostingStatus = "pending_review";

  if (corporateCheck.valid) {
    isCorporateMxVerified = true;
    targetStatus = "published";
  } else if (corporateCheck.reason === "personal_webmail_blocked") {
    // Allow free webmail into Admin Moderation Queue if syntax & MX are valid
    const webmailCheck = await verifyCompanyEmail(cleanEmail, {
      checkMx: true,
      allowPersonalWebmail: true,
    });
    if (!webmailCheck.valid) {
      return {
        ok: false,
        autoPublished: false,
        errorReason: webmailCheck.reason || "invalid_email",
      };
    }
    isCorporateMxVerified = false;
    targetStatus = "pending_review";
  } else {
    return {
      ok: false,
      autoPublished: false,
      errorReason: corporateCheck.reason || "invalid_corporate_email",
    };
  }

  const titleEn = (payload.title_en || payload.title_ar || "").trim();
  const titleAr = (payload.title_ar || payload.title_en || "").trim();
  const rawDesc = payload.description.trim();
  const bulletLines = rawDesc
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter((l) => l.length >= 6)
    .slice(0, 6);

  const { inserted } = await upsertJobPostings([
    {
      title_ar: titleAr,
      title_en: titleEn,
      company_name: payload.company_name,
      company_domain: isCorporateMxVerified ? corporateCheck.domain : "",
      company_website: payload.company_website || null,
      apply_email: cleanEmail,
      apply_url: payload.apply_url || null,
      apply_whatsapp: payload.apply_whatsapp || null,
      country_code: payload.country_code,
      city_id: payload.city_id,
      industry_id: payload.industry_id,
      employment_type: payload.employment_type,
      experience_level: payload.experience_level,
      salary_min: payload.salary_min ?? null,
      salary_max: payload.salary_max ?? null,
      summary_ar: rawDesc.slice(0, 420),
      summary_en: rawDesc.slice(0, 420),
      requirements_ar: bulletLines,
      requirements_en: bulletLines,
      skills: payload.skills?.length ? payload.skills : ["Direct Employer Hiring"],
      source_type: "employer_direct",
      source_channel: "employer_portal",
      is_mx_verified: isCorporateMxVerified,
      status: targetStatus,
    },
  ]);

  // Automatically enrich the verified GCC Company HR directory when corporate MX passes!
  if (isCorporateMxVerified) {
    bulkImportCompanies(
      [
        {
          company_name: payload.company_name,
          hr_email: cleanEmail,
          country_code: payload.country_code,
          city_id: payload.city_id,
          industry_id: payload.industry_id,
          sub_specialty: titleEn.slice(0, 65),
        },
      ],
      { checkMx: false, allowPersonalWebmail: false }
    ).catch(() => {});
  }

  return {
    ok: true,
    autoPublished: targetStatus === "published",
    job: inserted[0],
  };
}

export async function getUnpostedSocialJobs(
  limit = 2
): Promise<JobPostingRecord[]> {
  const all = await getAllJobsRaw();
  return all
    .filter(
      (j) =>
        j.status === "published" &&
        j.is_mx_verified &&
        !j.fb_posted_at
    )
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (b.quality_score !== a.quality_score) {
        return b.quality_score - a.quality_score;
      }
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    })
    .slice(0, Math.min(20, Math.max(1, limit)));
}

export async function markJobPostedToSocial(
  idOrSlug: string,
  meta: { fb_post_id?: string; tg_message_id?: string }
): Promise<boolean> {
  const jobs = readLocalJobs();
  const idx = jobs.findIndex(
    (j) => j.id === idOrSlug || j.slug === idOrSlug
  );
  const nowIso = new Date().toISOString();

  if (idx !== -1) {
    if (meta.fb_post_id) {
      jobs[idx].fb_post_id = meta.fb_post_id;
      jobs[idx].fb_posted_at = nowIso;
    }
    if (meta.tg_message_id) {
      jobs[idx].tg_message_id = meta.tg_message_id;
      jobs[idx].tg_posted_at = nowIso;
    }
    writeLocalJobs(jobs);
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseJobsClient();
      const patch: Record<string, string> = {};
      if (meta.fb_post_id) {
        patch.fb_post_id = meta.fb_post_id;
        patch.fb_posted_at = nowIso;
      }
      if (meta.tg_message_id) {
        patch.tg_message_id = meta.tg_message_id;
        patch.tg_posted_at = nowIso;
      }
      await sb.from("jobs").update(patch).or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    } catch {
      // Ignore
    }
  }

  return idx !== -1;
}

export async function performAdminJobAction(
  id: string,
  action:
    | "approve"
    | "reject"
    | "toggle_featured"
    | "expire"
    | "reset_social"
    | "delete"
): Promise<{ ok: boolean; job?: JobPostingRecord }> {
  const jobs = readLocalJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return { ok: false };

  const target = { ...jobs[idx] };

  if (action === "delete") {
    jobs.splice(idx, 1);
    writeLocalJobs(jobs);
    if (isSupabaseConfigured()) {
      try {
        await getSupabaseJobsClient().from("jobs").delete().eq("id", id);
      } catch {}
    }
    notifySearchEnginesForUrls([`/jobs/${target.slug}`], "URL_DELETED").catch(
      () => {}
    );
    return { ok: true };
  }

  if (action === "approve") {
    target.status = "published";
    target.published_at = new Date().toISOString();
    notifySearchEnginesForUrls([`/jobs/${target.slug}`, `/jobs`], "URL_UPDATED").catch(
      () => {}
    );
  } else if (action === "reject") {
    target.status = "rejected";
  } else if (action === "toggle_featured") {
    target.is_featured = !target.is_featured;
  } else if (action === "expire") {
    target.status = "expired";
    target.expires_at = new Date(Date.now() - 1000).toISOString();
  } else if (action === "reset_social") {
    target.fb_post_id = null;
    target.fb_posted_at = null;
  }

  jobs[idx] = target;
  writeLocalJobs(jobs);

  if (isSupabaseConfigured()) {
    try {
      await getSupabaseJobsClient()
        .from("jobs")
        .update({
          status: target.status,
          published_at: target.published_at,
          expires_at: target.expires_at,
          is_featured: target.is_featured,
          fb_post_id: target.fb_post_id,
          fb_posted_at: target.fb_posted_at,
        })
        .eq("id", id);
    } catch {}
  }

  return { ok: true, job: normalizeJobRow(target) };
}

export async function incrementJobEngagement(
  slug: string,
  metric: "view" | "apply"
): Promise<void> {
  const jobs = readLocalJobs();
  const idx = jobs.findIndex((j) => j.slug === slug);
  if (idx !== -1) {
    if (metric === "view") jobs[idx].views_count = (jobs[idx].views_count || 0) + 1;
    if (metric === "apply") {
      jobs[idx].apply_clicks_count = (jobs[idx].apply_clicks_count || 0) + 1;
    }
    writeLocalJobs(jobs);
  }
}
