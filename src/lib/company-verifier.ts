// ==============================================================================
// WAZAYEF GCC — Real-Time DNS MX Verifier, Anti-Bounce & Industry Classifier
// ==============================================================================

import dns from "dns";
import { INITIAL_INDUSTRIES } from "@/lib/seed-data";

const PERSONAL_WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "yandex.com",
  "mail.ru",
  "zoho.com",
  "gmx.com",
]);

const BLOCKED_ROLE_PREFIXES = [
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
  "mailer-daemon",
  "postmaster",
  "abuse",
  "billing",
  "invoices",
  "security",
  "spam",
  "unsubscribe",
];

// In-memory cache for domain MX lookups to accelerate bulk verification
const domainMxCache = new Map<string, { valid: boolean; checkedAt: number }>();
const MX_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export interface EmailVerificationResult {
  email: string;
  domain: string;
  valid: boolean;
  mxValid: boolean;
  reason?: string;
}

/**
 * Checks whether a domain has valid DNS MX (or A) records within a timeout.
 */
export async function verifyDomainMx(domain: string): Promise<boolean> {
  const cleanDomain = domain.trim().toLowerCase();
  if (!cleanDomain || !cleanDomain.includes(".")) return false;

  const cached = domainMxCache.get(cleanDomain);
  if (cached && Date.now() - cached.checkedAt < MX_CACHE_TTL_MS) {
    return cached.valid;
  }

  const checkPromise = (async () => {
    try {
      const mxRecords = await dns.promises.resolveMx(cleanDomain);
      if (Array.isArray(mxRecords) && mxRecords.length > 0) {
        return true;
      }
    } catch {
      // Fallback: some corporate domains route mail directly via A record (RFC 5321)
      try {
        const aRecords = await dns.promises.resolve4(cleanDomain);
        if (Array.isArray(aRecords) && aRecords.length > 0) {
          return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  })();

  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), 2800); // Fail-open on slow DNS resolver timeout
  });

  const valid = await Promise.race([checkPromise, timeoutPromise]);
  domainMxCache.set(cleanDomain, { valid, checkedAt: Date.now() });
  return valid;
}

/**
 * Validates an HR email address for syntax, corporate domain policy, role traps,
 * and optional live DNS MX server existence.
 */
export async function verifyCompanyEmail(
  rawEmail: string,
  options?: { checkMx?: boolean; allowPersonalWebmail?: boolean }
): Promise<EmailVerificationResult> {
  const email = (rawEmail || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(email)) {
    return {
      email,
      domain: "",
      valid: false,
      mxValid: false,
      reason: "invalid_syntax",
    };
  }

  const [localPart, domain] = email.split("@");

  if (!options?.allowPersonalWebmail && PERSONAL_WEBMAIL_DOMAINS.has(domain)) {
    return {
      email,
      domain,
      valid: false,
      mxValid: false,
      reason: "personal_webmail_blocked",
    };
  }

  if (
    BLOCKED_ROLE_PREFIXES.some(
      (prefix) =>
        localPart === prefix ||
        localPart.startsWith(`${prefix}.`) ||
        localPart.startsWith(`${prefix}_`)
    )
  ) {
    return {
      email,
      domain,
      valid: false,
      mxValid: false,
      reason: "blocked_noreply_or_trap_prefix",
    };
  }

  if (options?.checkMx) {
    const mxOk = await verifyDomainMx(domain);
    if (!mxOk) {
      return {
        email,
        domain,
        valid: false,
        mxValid: false,
        reason: "no_mx_records_found",
      };
    }
  }

  return {
    email,
    domain,
    valid: true,
    mxValid: true,
  };
}

const INDUSTRY_SCORING_RULES: Array<{
  id: string;
  patterns: RegExp[];
  domainFragment?: RegExp;
}> = [
  {
    id: "healthcare",
    patterns: [
      /\b(healthcare|medical|hospital|clinic|clinics|pharma|pharmacy|pharmacist|pharmaceutical|nurse|nursing|doctor|physician|dentist|dental|dermatolog|orthoped|pediatric|radiolog|lab\s+tech|biomedical|optometrist|physiotherap|patient\s+care|veterinar|vet\b|dha\b|haad\b|moh\s+license|nhra|qchp|scfhs)\b/i,
      /(?:طبي|طبية|مستشفى|عيادة|عيادات|صيدلي|صيدلية|تمريض|ممرض|أطباء|طبيب|رعاية\s+صحية|بيطري)/,
    ],
    domainFragment: /(med|health|clinic|hosp|pharma|dental|care|vet|paws)/i,
  },
  {
    id: "finance-accounting",
    patterns: [
      /\b(accountant|accounting|finance|financial|auditor|auditing|audit\s+officer|internal\s+audit|tax\s+consultant|tax\s+accountant|taxation|vat\b|treasury|bookkeeper|bookkeeping|receivable|payable|cpa\b|acca\b|cma\b|cfa\b|banking|bank\b|islamic\s+bank|investment|actuarial|insurance|underwriter|credit\s+control|payroll|cost\s+control|chief\s+financial|cfo\b)\b/i,
      /(?:محاسب|محاسبة|مالي|مالية|تدقيق|مراجع\s+حسابات|بنك|تمويل|ضرائب|تأمين)/,
    ],
    domainFragment: /(bank|fin|capital|invest|insur|audit|account|takaful)/i,
  },
  {
    id: "it-software",
    patterns: [
      /\b(software|developer|programmer|frontend|front-end|backend|back-end|fullstack|full-stack|devops|cloud\s+engineer|cloud\s+architect|cybersecurity|cyber\s+security|data\s+scientist|data\s+engineer|data\s+analyst|machine\s+learning|artificial\s+intelligence|react\b|angular\b|vue\b|node\.?js|python|java\b|dotnet|asp\.net|vb\.net|c#|golang|laravel|php\b|ios\s+dev|android\s+dev|flutter|qa\s+engineer|software\s+tester|scrum\s+master|product\s+manager|erp\b|sap\b|oracle|salesforce|sysadmin|system\s+administrator|system\s+engineer|network\s+engineer|it\s+support|it\s+specialist|it\s+manager|it\s+officer|it\s+engineer|helpdesk|information\s+technology|telecom|telecommunications)\b/i,
      /(?:برمجة|مبرمج|تقنية\s+المعلومات|أمن\s+سيبراني|مطور\s+برمجيات|شبكات|حاسب\s+آلي|تطبيقات)/,
    ],
    domainFragment: /(soft|cyber|digital|cloud|data|sys|telecom|it\b)/i,
  },
  {
    id: "real-estate",
    patterns: [
      /\b(real\s+estate|realty|property\s+consultant|property\s+advisor|property\s+management|properties|leasing|broker|brokerage|rera\b|off-plan|offplan|holiday\s+homes|community\s+manager|facilities\s+management|facility\s+management|valuation)\b/i,
      /(?:عقارات|عقاري|عقارية|تطوير\s+عقاري|وسيط\s+عقاري|إدارة\s+أملاك)/,
    ],
    domainFragment: /(realty|propert|estate|emaar|damac|nakheel|aldar|sobha|mabanee)/i,
  },
  {
    id: "hospitality-retail",
    patterns: [
      /\b(hotel|hotels|resort|resorts|hospitality|restaurant|catering|f&b|food\s+and\s+beverage|chef\b|cook\b|commis|sous\s+chef|pastry|barista|bartender|waiter|waitress|steward|housekeeping|front\s+office|guest\s+relations|concierge|bellboy|lifeguard|spa\s+therapist|salon|beautician|hairdresser|retail|store\s+manager|cashier|merchandiser|supermarket|hypermarket|mall\b|fashion|luxury\s+retail|travel\s+consultant|tourism|ticketing)\b/i,
      /(?:فندق|فنادق|ضيافة|مطعم|مطاعم|تجزئة|كاشير|شيف|طاهي|سياحة|كافيه|باريستا)/,
    ],
    domainFragment: /(hotel|resort|hospitality|food|flavor|cafe|restaur|retail|mall|salon|spa|beauty|marriott|rotana|jumeirah)/i,
  },
  {
    id: "logistics-supply",
    patterns: [
      /\b(logistics|supply\s+chain|procurement|purchasing|purchaser|buyer|warehouse|storekeeper|store\s+keeper|inventory|freight|shipping|customs\s+clearance|import|export|fleet|dispatch|dispatcher|driver|delivery|courier|aviation|airline|airport|cargo|maritime|port\b|last\s+mile|fmcg)\b/i,
      /(?:لوجستيات|سلاسل\s+الإمداد|مشتريات|مستودعات|مستودع|أمين\s+مستودع|شحن|توصيل|سائق|طيران|تموين)/,
    ],
    domainFragment: /(logist|cargo|freight|ship|marine|port|supply|fleet|trans|aviation)/i,
  },
  {
    id: "sales-marketing",
    patterns: [
      /\b(sales|outdoor\s+sales|indoor\s+sales|telesales|telecaller|business\s+development|bdm\b|account\s+manager|key\s+account|commercial\s+manager|marketing|digital\s+marketing|seo\b|sem\b|paid\s+ads|media\s+buyer|social\s+media|brand\s+manager|public\s+relations|crm\b|lead\s+generation|client\s+relations|customer\s+service|call\s+center|promoters?)\b/i,
      /(?:مبيعات|مندوب\s+مبيعات|أخصائي\s+مبيعات|تسويق|تطوير\s+أعمال|خدمة\s+عملاء|علاقات\s+عامة)/,
    ],
    domainFragment: /(market|media|promo|brand|advert|comm)/i,
  },
  {
    id: "design-media",
    patterns: [
      /\b(graphic\s+designer|ui\/ux|ux\s+designer|ui\s+designer|3d\s+visualizer|visualizer|interior\s+designer|interior\s+architect|animator|motion\s+graphics|video\s+editor|videographer|photographer|creative\s+director|art\s+director|copywriter|content\s+creator|content\s+writer|journalist|broadcast|multimedia)\b/i,
      /(?:مصمم|تصميم\s+جرافيك|موشن\s+جرافيك|مونتاج|تصوير|إعلام|تصميم\s+داخلي)/,
    ],
    domainFragment: /(design|studio|creative|art|photo|visual)/i,
  },
  {
    id: "education",
    patterns: [
      /\b(teacher|teaching|school|academy|university|college|lecturer|professor|instructor|trainer|tutor|curriculum|principal|academic|nursery|kindergarten|early\s+years|shadow\s+teacher|sen\s+teacher|ielts|esl\b)\b/i,
      /(?:معلم|معلمة|مدرس|مدرسة|أكاديمية|جامعة|تعليم|تدريب|محاضر)/,
    ],
    domainFragment: /(edu|school|acad|univ|college|learn|train|amity)/i,
  },
  {
    id: "legal",
    patterns: [
      /\b(lawyer|legal\s+counsel|legal\s+advisor|legal\s+associate|attorney|advocate|paralegal|corporate\s+law|litigation|arbitration|compliance\s+officer|governance|contract\s+specialist|law\s+firm)\b/i,
      /(?:محامي|محاماة|مستشار\s+قانوني|قانوني|قانونية|تحكيم|الالتزام)/,
    ],
    domainFragment: /(law|legal|tamimi|advocat)/i,
  },
  {
    id: "engineering",
    patterns: [
      /\b(engineer|engineering|civil|mechanical|electrical|mep\b|project\s+manager|site\s+engineer|structural|chemical|petroleum|planning\s+engineer|estimation|estimator|qa\/qc|qc\b|welding|inspector|hse\b|safety\s+officer|safety\s+engineer|quantity\s+surveyor|land\s+surveyor|architect|architectural|draftsman|draughtsman|foreman|technician|hvac\b|plumbing|fire\s+fighting|fit-out|fitout|joinery|construction|contracting|oil\s+and\s+gas|oil\s*&\s*gas|rig\b|offshore|petrochemical|industrial|manufacturing|plant\b|bim\b)\b/i,
      /(?:مهندس|هندسة|مقاولات|إنشاءات|مدني|ميكانيكا|كهرباء|معماري|سلامة|فني|صيانة|نفط|غاز|مشاريع)/,
    ],
    domainFragment: /(construct|contract|eng|mep|build|energy|petro|metal|steel|ind|serv|tech)/i,
  },
  {
    id: "hr-admin",
    patterns: [
      /\b(human\s+resources|hr\s+manager|hr\s+executive|hr\s+specialist|hr\s+officer|hr\s+coordinator|hr\s+generalist|talent\s+acquisition|recruiter|recruitment|staffing|manpower|admin\s+assistant|administrative|office\s+manager|receptionist|front\s+desk|secretary|executive\s+assistant|personal\s+assistant|document\s+controller|pro\b|public\s+relations\s+officer|government\s+relations|data\s+entry|operations\s+manager)\b/i,
      /(?:موارد\s+بشرية|توظيف|إداري|إدارة|سكرتير|استقبال|معقب|علاقات\s+حكومية|مدخل\s+بيانات)/,
    ],
    domainFragment: /(talent|people|staff|recruit|hr\b|hays|brunel|dulsco|manpower)/i,
  },
];

/**
 * Automatically maps free-text industry names, company names, or specialties
 * into one of the 12 canonical WAZAYEF industry slugs using word-boundary scoring.
 */
export function classifyCompanyIndustry(params: {
  rawIndustry?: string;
  companyName?: string;
  subSpecialty?: string;
  domain?: string;
  email?: string;
}): string {
  const direct = (params.rawIndustry || "").trim().toLowerCase();
  const exactMatch = INITIAL_INDUSTRIES.find((ind) => ind.id === direct);
  if (exactMatch) return exactMatch.id;

  const roleAndCompanyText = `${params.subSpecialty || ""} ${params.companyName || ""} ${params.email || ""}`;
  const domainBase = (params.domain || "")
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co|me|io|ae|sa|qa|kw)+$/g, "");
  const postText = params.rawIndustry || "";

  let bestId = "";
  let bestScore = 0;

  for (const rule of INDUSTRY_SCORING_RULES) {
    let score = 0;
    for (const regex of rule.patterns) {
      if (regex.test(roleAndCompanyText)) {
        score += 5;
      }
      if (regex.test(postText)) {
        score += 1;
      }
    }
    if (rule.domainFragment && rule.domainFragment.test(domainBase)) {
      score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = rule.id;
    }
  }

  if (bestId && bestScore > 0) {
    return bestId;
  }

  return "hr-admin";
}
