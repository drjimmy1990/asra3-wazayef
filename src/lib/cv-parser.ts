// ==============================================================================
// ASRA3.COM — Real PDF/DOCX CV Text Extractor, Storage & ATS Scoring Engine
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Industry } from "@/lib/types";
import { signCvAccessKey } from "@/lib/admin-auth";

const CV_UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const SUPABASE_CV_BUCKET = "candidate-cvs";

const SKILL_DICTIONARY: Array<{ label: string; pattern: RegExp; sector?: string }> = [
  // Engineering & Construction
  { label: "AutoCAD", pattern: /\bautocad\b/i, sector: "engineering" },
  { label: "Revit BIM", pattern: /\brevit\b|\bbim\b/i, sector: "engineering" },
  { label: "Primavera P6", pattern: /\bprimavera\b|\bp6\b/i, sector: "engineering" },
  { label: "PMP Project Management", pattern: /\bpmp\b|project management professional/i, sector: "engineering" },
  { label: "FIDIC Contracts", pattern: /\bfidic\b/i, sector: "engineering" },
  { label: "QA/QC Inspection", pattern: /\bqa\s*\/\s*qc\b|\bquality control\b/i, sector: "engineering" },
  { label: "MEP Systems", pattern: /\bmep\b|\bhvac\b/i, sector: "engineering" },
  { label: "Civil & Structural Design", pattern: /\bcivil engineer|\bstructural\b|\betabs\b|\bsap2000\b/i, sector: "engineering" },
  // IT, Software & AI
  { label: "JavaScript / TypeScript", pattern: /\btypescript\b|\bjavascript\b/i, sector: "it-software" },
  { label: "React & Next.js", pattern: /\breact(?:\.js|js)?\b|\bnext(?:\.js|js)?\b/i, sector: "it-software" },
  { label: "Node.js", pattern: /\bnode(?:\.js|js)?\b|\bnestjs\b|\bexpress\b/i, sector: "it-software" },
  { label: "Python & AI/ML", pattern: /\bpython\b|\bmachine learning\b|\bpytorch\b|\btensorflow\b/i, sector: "it-software" },
  { label: "AWS / Azure Cloud", pattern: /\baws\b|\bazure\b|\bgcp\b|\bkubernetes\b|\bdocker\b/i, sector: "it-software" },
  { label: "SQL & PostgreSQL", pattern: /\bpostgresql\b|\bmysql\b|\bsql server\b|\bmongodb\b/i, sector: "it-software" },
  { label: "Cybersecurity & DevSecOps", pattern: /\bcybersecurity\b|\bsoc\b|\bcissp\b|\bceh\b|\bdevops\b/i, sector: "it-software" },
  // Finance & Accounting
  { label: "IFRS Financial Reporting", pattern: /\bifrs\b|\bgaap\b/i, sector: "finance-accounting" },
  { label: "CPA / ACCA / CMA", pattern: /\bcpa\b|\bacca\b|\bcma\b|\bcfa\b/i, sector: "finance-accounting" },
  { label: "SAP / Oracle ERP", pattern: /\bsap\b|\boracle erp\b|\bnetsuite\b|\bodoo\b|\btally\b/i, sector: "finance-accounting" },
  { label: "GCC VAT & Corporate Tax", pattern: /\bvat\b|\bcorporate tax\b|\bzatca\b|\bfta\b/i, sector: "finance-accounting" },
  { label: "Financial Modeling & FP&A", pattern: /\bfinancial model|\bfp&a\b|\bbudgeting\b|\baudit/i, sector: "finance-accounting" },
  // Sales & Marketing
  { label: "Performance Marketing (Meta/Google)", pattern: /\bgoogle ads\b|\bmeta ads\b|\bppc\b|\bsem\b|\bperformance marketing\b/i, sector: "sales-marketing" },
  { label: "SEO & Content Growth", pattern: /\bseo\b|\bsearch engine optimization\b|\bgoogle analytics\b/i, sector: "sales-marketing" },
  { label: "CRM (Salesforce / HubSpot)", pattern: /\bsalesforce\b|\bhubspot\b|\bzoho\b|\bcrm\b/i, sector: "sales-marketing" },
  { label: "B2B Business Development", pattern: /\bb2b\b|\bbusiness development\b|\bkey account\b|\blead generation\b/i, sector: "sales-marketing" },
  // Healthcare
  { label: "DHA / MOH / SCFHS Licensed", pattern: /\bdha\b|\bmoh\b|\bhaad\b|\bdoh\b|\bscfhs\b|\bqchp\b/i, sector: "healthcare" },
  { label: "Clinical Patient Care", pattern: /\bpatient care\b|\bclinical\b|\bicu\b|\btriage\b|\bnursing\b/i, sector: "healthcare" },
  { label: "JCI Hospital Standards", pattern: /\bjci\b|\binfection control\b|\bemr\b|\bpharmacy\b/i, sector: "healthcare" },
  // HR & Admin
  { label: "Full-Cycle Talent Acquisition", pattern: /\btalent acquisition\b|\brecruitment\b|\bsourcing\b|\bonboarding\b/i, sector: "hr-admin" },
  { label: "GCC Labor Law & WPS", pattern: /\blabor law\b|\blabour law\b|\bwps\b|\bmohre\b|\bqiwa\b|\bmudad\b/i, sector: "hr-admin" },
  { label: "CIPD / SHRM Certified", pattern: /\bcipd\b|\bshrm\b|\bhris\b|\bpayroll\b/i, sector: "hr-admin" },
  // Logistics & Supply Chain
  { label: "Supply Chain & Procurement", pattern: /\bsupply chain\b|\bprocurement\b|\bpurchasing\b|\bcips\b/i, sector: "logistics-supply" },
  { label: "Customs & Freight Forwarding", pattern: /\bfreight\b|\bcustoms clearance\b|\b3pl\b|\bwarehouse\b|\bincoterms\b/i, sector: "logistics-supply" },
  // Hospitality & Retail
  { label: "5-Star Hospitality Operations", pattern: /\bhospitality\b|\bfront office\b|\bf&b\b|\bhotel\b|\bopera pms\b/i, sector: "hospitality-retail" },
  { label: "Retail & Merchandising", pattern: /\bretail management\b|\bvisual merchandising\b|\bpos\b|\bguest relations\b/i, sector: "hospitality-retail" },
  // Real Estate
  { label: "RERA / Off-Plan Brokerage", pattern: /\brera\b|\boff-plan\b|\breal estate\b|\bproperty consultant\b|\bleasing\b/i, sector: "real-estate" },
  // Legal
  { label: "Contract Drafting & Compliance", pattern: /\bcontract drafting\b|\barbitration\b|\bcorporate law\b|\blegal counsel\b|\bllb\b/i, sector: "legal" },
  // Education
  { label: "Curriculum Design & Teaching", pattern: /\bcurriculum\b|\bteaching\b|\bpedagogy\b|\bielts\b|\bcelta\b|\bclassroom\b/i, sector: "education" },
  // Design & Media
  { label: "Figma & UI/UX Systems", pattern: /\bfigma\b|\bui\s*\/\s*ux\b|\buser experience\b|\bprototyping\b/i, sector: "design-media" },
  { label: "Adobe Creative Cloud", pattern: /\bphotoshop\b|\billustrator\b|\bafter effects\b|\bpremiere\b|\bindesign\b/i, sector: "design-media" },
];

const FALLBACK_INDUSTRY_PROFILES: Record<
  string,
  { titleEn: string; titleAr: string; defaultSkills: string[] }
> = {
  engineering: {
    titleEn: "Senior Project / Civil Engineer",
    titleAr: "مهندس مشاريع / مهندس مدني",
    defaultSkills: ["AutoCAD & Revit BIM", "PMP Project Management", "FIDIC Contracts", "Site Supervision & QA/QC"],
  },
  "it-software": {
    titleEn: "Full-Stack Software & Cloud Engineer",
    titleAr: "مهندس برمجيات ونظم سحابية",
    defaultSkills: ["TypeScript & Next.js", "Node.js & APIs", "AWS / Cloud", "PostgreSQL & System Design"],
  },
  "sales-marketing": {
    titleEn: "Digital Marketing & Growth Specialist",
    titleAr: "أخصائي تسويق رقمي وتطوير أعمال",
    defaultSkills: ["Performance Marketing", "B2B Lead Generation", "CRM & HubSpot", "GCC Market Strategy"],
  },
  "finance-accounting": {
    titleEn: "Senior Financial Accountant & Auditor",
    titleAr: "محاسب مالي أول ومراقب حسابات",
    defaultSkills: ["IFRS Financial Reporting", "GCC VAT & Corporate Tax", "SAP / ERP", "Financial Modeling"],
  },
  healthcare: {
    titleEn: "Healthcare Specialist / Medical Practitioner",
    titleAr: "أخصائي رعاية صحية / ممارس طبي",
    defaultSkills: ["DHA / MOH / SCFHS Licensed", "Clinical Patient Care", "JCI Quality Standards", "EMR Systems"],
  },
  "hospitality-retail": {
    titleEn: "Hospitality & Retail Operations Manager",
    titleAr: "مدير عمليات الضيافة والتجزئة",
    defaultSkills: ["5-Star Guest Experience", "F&B & Retail Operations", "Team Leadership", "Revenue Optimization"],
  },
  "hr-admin": {
    titleEn: "HR & Talent Acquisition Specialist",
    titleAr: "أخصائي موارد بشرية واستقطاب كفاءات",
    defaultSkills: ["Full-Cycle Talent Acquisition", "GCC Labor Law Compliance", "HRIS & Payroll", "Employee Relations"],
  },
  "logistics-supply": {
    titleEn: "Supply Chain & Logistics Specialist",
    titleAr: "أخصائي سلاسل الإمداد واللوجستيات",
    defaultSkills: ["Supply Chain & Procurement", "GCC Customs & Freight", "Warehouse ERP", "Inventory Forecasting"],
  },
  "real-estate": {
    titleEn: "Real Estate & Property Consultant",
    titleAr: "مستشار عقاري وإدارة أملاك",
    defaultSkills: ["Off-Plan & Secondary Sales", "RERA Brokerage", "Client Portfolio Advisory", "Property Leasing"],
  },
  education: {
    titleEn: "Academic Instructor & Corporate Trainer",
    titleAr: "معلم أكاديمي ومدرب معتمد",
    defaultSkills: ["Curriculum Design", "Interactive E-Learning", "Student Assessment", "Bilingual Communication"],
  },
  legal: {
    titleEn: "Corporate Legal Counsel",
    titleAr: "مستشار قانوني وصياغة عقود",
    defaultSkills: ["GCC Commercial Law", "Contract Drafting", "Regulatory Compliance", "Dispute Resolution"],
  },
  "design-media": {
    titleEn: "Senior Creative / UI-UX Designer",
    titleAr: "مصمم جرافيك وواجهات رقمية",
    defaultSkills: ["Figma & Design Systems", "Adobe Creative Cloud", "Brand Identity", "Motion & Visual Production"],
  },
};

export async function extractTextFromCvBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  try {
    if (ext === ".pdf") {
      const { extractText } = await import("unpdf");
      const { text } = await extractText(new Uint8Array(buffer), {
        mergePages: true,
      });
      if (text && text.trim().length > 10) {
        return text;
      }
    } else if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const res = await mammoth.extractRawText({ buffer });
      if (res.value && res.value.trim().length > 10) {
        return res.value;
      }
    } else if (ext === ".txt" || ext === ".md") {
      return buffer.toString("utf8");
    }
  } catch (err) {
    console.warn("Primary CV parser fallback notice:", err);
  }

  // Fallback printable UTF-8/ASCII token extraction (e.g. legacy .doc)
  const raw = buffer.toString("utf8");
  const printable = raw
    .replace(/[^\x20-\x7E\u0600-\u06FF\r\n\t]/g, " ")
    .replace(/\s{3,}/g, " ")
    .trim();
  return printable.slice(0, 30000);
}

export async function storeUploadedCvBuffer(params: {
  buffer: Buffer;
  originalName: string;
  mimeType?: string;
  appBaseUrl: string;
}): Promise<{ storedCvUrl: string; storedFileKey: string }> {
  const safeBase = params.originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-80);
  const dateFolder = new Date().toISOString().slice(0, 10);
  const fileName = `${crypto.randomUUID().slice(0, 12)}-${safeBase || "CV.pdf"}`;
  const relativeKey = `${dateFolder}/${fileName}`;

  // 1. Local persistent store (.data/uploads/...)
  try {
    const targetDir = path.join(CV_UPLOAD_DIR, dateFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, fileName), params.buffer);
  } catch {
    // Ignore on read-only serverless fs when Supabase Storage succeeds
  }

  // 2. Supabase Storage private bucket (`candidate-cvs`) if Service Role is configured
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    sbUrl &&
    sbServiceKey &&
    !sbUrl.includes("your-project-id") &&
    !sbServiceKey.startsWith("your-")
  ) {
    try {
      const sb = createClient(sbUrl, sbServiceKey, {
        auth: { persistSession: false },
      });

      await sb.storage
        .createBucket(SUPABASE_CV_BUCKET, {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
        })
        .catch(() => {});

      const { error: uploadErr } = await sb.storage
        .from(SUPABASE_CV_BUCKET)
        .upload(relativeKey, params.buffer, {
          contentType: params.mimeType || "application/pdf",
          upsert: true,
        });

      if (!uploadErr) {
        const { data: signed } = await sb.storage
          .from(SUPABASE_CV_BUCKET)
          .createSignedUrl(relativeKey, 60 * 60 * 24 * 30); // 30 days for n8n/HR dispatch
        if (signed?.signedUrl) {
          return {
            storedCvUrl: signed.signedUrl,
            storedFileKey: relativeKey,
          };
        }
      }
    } catch (e) {
      console.warn("Supabase Storage CV upload fallback:", e);
    }
  }

  // 3. HMAC-signed local download route URL for n8n & Admin
  const sig = signCvAccessKey(relativeKey);
  const signedLocalUrl = `${params.appBaseUrl}/api/cv/file?key=${encodeURIComponent(
    relativeKey
  )}&sig=${sig}`;

  return {
    storedCvUrl: signedLocalUrl,
    storedFileKey: relativeKey,
  };
}

export function resolveLocalCvPath(relativeKey: string): string | null {
  const normalized = path.normalize(relativeKey).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(CV_UPLOAD_DIR, normalized);
  if (!fullPath.startsWith(CV_UPLOAD_DIR)) return null;
  return fs.existsSync(fullPath) ? fullPath : null;
}

export function analyzeExtractedCvText(params: {
  text: string;
  fileName: string;
  industries: Industry[];
  manualIndustryId?: string;
  defaultPhonePrefix: string;
}) {
  const text = params.text || "";
  const lowerText = text.toLowerCase();
  const hasRealTextLayer = text.replace(/\s+/g, "").length >= 60;

  // 1. Extract Email
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}/
  );
  const extractedEmail = emailMatch ? emailMatch[0].toLowerCase() : "";

  // 2. Extract Phone Number
  const phoneMatch =
    text.match(
      /(?:\+|00)\s*(?:971|966|974|965|20|962|961|973|968|44|1)[\s\-().0-9]{7,15}/
    ) || text.match(/\b0(?:5\d|1\d)[\s\-0-9]{7,10}\b/);
  const extractedPhone = phoneMatch
    ? phoneMatch[0].replace(/\s{2,}/g, " ").trim()
    : `${params.defaultPhonePrefix} `;

  // 3. Extract Candidate Name from top 8 lines
  let extractedName = "";
  if (hasRealTextLayer) {
    const topLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 3 && l.length <= 55)
      .slice(0, 10);

    for (const line of topLines) {
      if (
        /@|http|www\.|\d{4}|curriculum|vitae|resume|السيرة|الذاتية|page\s*\d/i.test(
          line
        )
      ) {
        continue;
      }
      const words = line.split(/\s+/);
      if (
        words.length >= 2 &&
        words.length <= 5 &&
        /^[A-Za-z\u0600-\u06FF\s.'-]+$/.test(line)
      ) {
        extractedName = words
          .map((w) =>
            /^[a-zA-Z]/.test(w)
              ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
              : w
          )
          .join(" ");
        break;
      }
    }
  }

  // Fallback name from filename if e.g. "Omar_AlHashemi_CV.pdf"
  if (!extractedName) {
    const cleanFileBase = path
      .basename(params.fileName, path.extname(params.fileName))
      .replace(/\b(cv|resume|ats|updated|final|202\d|ar|en)\b/gi, " ")
      .replace(/[_\-.]+/g, " ")
      .replace(/\d+/g, " ")
      .trim();
    const parts = cleanFileBase.split(/\s+/).filter((p) => p.length >= 2);
    if (parts.length >= 2 && parts.length <= 4) {
      extractedName = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // 4. Score Industries from CV body + filename
  let bestIndustry =
    params.industries.find((i) => i.id === params.manualIndustryId) ||
    params.industries[0];
  let bestScore = -1;

  const combinedCorpus = `${params.fileName.toLowerCase()}\n${lowerText}`;
  for (const ind of params.industries) {
    let score = 0;
    for (const kw of ind.keywords) {
      const kwLower = kw.toLowerCase();
      const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = combinedCorpus.match(new RegExp(`\\b${escaped}`, "gi"));
      if (matches) score += matches.length * 2;
    }
    for (const sk of SKILL_DICTIONARY) {
      if (sk.sector === ind.id && sk.pattern.test(combinedCorpus)) {
        score += 4;
      }
    }
    if (score > bestScore && score > 0) {
      bestScore = score;
      bestIndustry = ind;
    }
  }

  // 5. Extract Matched Skills
  const matchedSkills: string[] = [];
  for (const item of SKILL_DICTIONARY) {
    if (item.pattern.test(combinedCorpus) && !matchedSkills.includes(item.label)) {
      matchedSkills.push(item.label);
    }
  }
  const fallbackProfile =
    FALLBACK_INDUSTRY_PROFILES[bestIndustry.id] ||
    FALLBACK_INDUSTRY_PROFILES.engineering;

  const finalSkills =
    matchedSkills.length >= 3
      ? matchedSkills.slice(0, 8)
      : Array.from(
          new Set([...matchedSkills, ...fallbackProfile.defaultSkills])
        ).slice(0, 6);

  // 6. Detect Years of Experience
  let yearsExp = 4;
  const expExplicit =
    text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i) ||
    text.match(/خبرة\s*(?:أكثر من\s*)?(\d{1,2})\s*سن/);
  if (expExplicit) {
    const parsed = Number(expExplicit[1]);
    if (parsed >= 1 && parsed <= 35) yearsExp = parsed;
  } else if (hasRealTextLayer) {
    const yearMatches = Array.from(text.matchAll(/\b(200\d|201\d|202[0-6])\b/g)).map(
      (m) => Number(m[1])
    );
    if (yearMatches.length >= 2) {
      const minYear = Math.min(...yearMatches);
      const currentYear = new Date().getFullYear();
      const span = Math.min(25, Math.max(1, currentYear - minYear - 1));
      if (span >= 1 && span <= 25) yearsExp = span;
    }
  }

  // 7. Extract Target Job Title
  let detectedTitle = fallbackProfile.titleEn;
  if (hasRealTextLayer) {
    const roleRegex =
      /\b((?:Senior|Lead|Chief|Principal|Junior|Executive|Regional|Assistant|Head of)?\s*(?:Civil|Mechanical|Electrical|Project|Site|Software|Full[- ]Stack|Frontend|Backend|Cloud|Data|DevOps|QA|Financial|Chartered|Digital Marketing|Marketing|Sales|Business Development|Account|HR|Talent Acquisition|Human Resources|Supply Chain|Logistics|Procurement|Operations|Hospitality|Hotel|Property|Real Estate|Legal|Graphic|UI\/UX|Product|Medical|Clinical)\s+(?:Engineer|Developer|Architect|Manager|Specialist|Accountant|Auditor|Analyst|Consultant|Coordinator|Officer|Director|Designer|Supervisor|Executive|Counsel|Practitioner))\b/i;
    const m = text.slice(0, 1800).match(roleRegex);
    if (m && m[1]) {
      detectedTitle = m[1].replace(/\s+/g, " ").trim();
    }
  }

  // 8. Calculate Genuine ATS Readiness Score (52 - 94)
  let atsScore = 52;
  if (hasRealTextLayer) {
    atsScore += 10; // Machine-readable text layer
    if (extractedEmail) atsScore += 6;
    if (phoneMatch) atsScore += 5;
    if (/linkedin\.com/i.test(text)) atsScore += 4;
    if (/\b(experience|employment|work history|الخبرات)\b/i.test(text))
      atsScore += 6;
    if (/\b(education|university|bachelor|بكالوريوس|التعليم)\b/i.test(text))
      atsScore += 5;
    if (/\b(skills|competencies|certifications|المهارات)\b/i.test(text))
      atsScore += 5;
    if (/\d+\s*%|\$\s*\d+|\b(?:AED|SAR|QAR|KWD)\b/i.test(text)) atsScore += 6; // Quantified metrics
    atsScore += Math.min(8, matchedSkills.length * 2);
  } else {
    atsScore = 54; // Scanned image PDF warning score
  }
  atsScore = Math.min(94, Math.max(52, atsScore));

  return {
    hasRealTextLayer,
    candidate_name: extractedName,
    candidate_email: extractedEmail,
    candidate_phone: extractedPhone,
    detected_industry: bestIndustry,
    job_title: detectedTitle,
    years_experience: yearsExp,
    detected_skills: finalSkills,
    ats_score: atsScore,
  };
}
