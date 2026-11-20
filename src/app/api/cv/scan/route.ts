import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  doesCompanyHireInIndustry,
  getActiveJobIndustriesByCompany,
  getCatalogData,
  listCompanies,
} from "@/lib/store";
import {
  analyzeExtractedCvText,
  extractTextFromCvBuffer,
  storeUploadedCvBuffer,
} from "@/lib/cv-parser";
import { CountryCode, CvScanResult } from "@/lib/types";

const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".txt"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("cv")) as File | null;
    const countryCode = ((formData.get("countryCode") as string) ||
      "AE") as CountryCode;
    const manualIndustry = (formData.get("industryId") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Please select a CV file (.pdf, .doc, or .docx)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_CV_BYTES) {
      return NextResponse.json(
        { error: "CV file exceeds the 10 MB maximum size limit." },
        { status: 400 }
      );
    }

    const fileName = file.name || "Candidate_CV.pdf";
    const ext = path.extname(fileName).toLowerCase();
    if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or Word (.docx)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const appBaseUrl =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin;

    const [{ countries, industries }, storedCv, extractedText] =
      await Promise.all([
        getCatalogData(),
        storeUploadedCvBuffer({
          buffer,
          originalName: fileName,
          mimeType: file.type,
          appBaseUrl,
        }),
        extractTextFromCvBuffer(buffer, fileName),
      ]);

    const country =
      countries.find((c) => c.code === countryCode) || countries[0];

    const parsed = analyzeExtractedCvText({
      text: extractedText,
      fileName,
      industries,
      manualIndustryId: manualIndustry,
      defaultPhonePrefix: country.phone_prefix,
    });

    let detectedIndustry = parsed.detected_industry;
    let candidateName = parsed.candidate_name;
    let candidateEmail = parsed.candidate_email;
    let candidatePhone = parsed.candidate_phone;
    let jobTitle = parsed.job_title;
    let yearsExperience = parsed.years_experience;
    let detectedSkills = parsed.detected_skills;
    let atsScore = parsed.ats_score;
    let aiSummaryAr = "";
    let aiSummaryEn = "";
    let aiParsed = false;

    // External n8n AI CV Parser & ATS Analyzer (Gemini 2.5 Flash Lite on n8n.asra3.com)
    const n8nScanWebhook = (
      process.env.N8N_CV_SCAN_WEBHOOK ||
      process.env.N8N_CV_ANALYZE_WEBHOOK ||
      ""
    ).trim();
    if (
      n8nScanWebhook &&
      !n8nScanWebhook.includes("your-") &&
      !n8nScanWebhook.includes("asra3.com/webhook/wazayef-cv-scan")
    ) {
      try {
        const res = await fetch(n8nScanWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret":
              process.env.N8N_WEBHOOK_SECRET ||
              process.env.ADMIN_PASSCODE ||
              "",
          },
          body: JSON.stringify({
            file_name: fileName,
            country_code: countryCode,
            country_name_ar: country.name_ar,
            country_name_en: country.name_en,
            manual_industry_id: manualIndustry,
            has_text_layer: parsed.hasRealTextLayer,
            extracted_text: extractedText.slice(0, 16000),
            industries: industries.map((i) => ({
              id: i.id,
              name_en: i.name_en,
              name_ar: i.name_ar,
            })),
            fallback: {
              candidate_name: parsed.candidate_name,
              candidate_email: parsed.candidate_email,
              candidate_phone: parsed.candidate_phone,
              detected_industry_id: parsed.detected_industry.id,
              job_title: parsed.job_title,
              years_experience: parsed.years_experience,
              detected_skills: parsed.detected_skills,
              ats_score: parsed.ats_score,
            },
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const ext = await res.json().catch(() => null);
          if (ext && typeof ext === "object" && ext.ok !== false) {
            aiParsed = Boolean(ext.ai_parsed !== false);

            if (!manualIndustry && typeof ext.detected_industry_id === "string") {
              const found = industries.find(
                (i) => i.id === ext.detected_industry_id.trim()
              );
              if (found) detectedIndustry = found;
            }
            if (typeof ext.candidate_name === "string" && ext.candidate_name.trim().length >= 2) {
              candidateName = ext.candidate_name.trim().slice(0, 90);
            }
            if (
              typeof ext.candidate_email === "string" &&
              /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ext.candidate_email.trim())
            ) {
              candidateEmail = ext.candidate_email.trim().toLowerCase();
            }
            if (
              typeof ext.candidate_phone === "string" &&
              ext.candidate_phone.replace(/[^\d]/g, "").length >= 8
            ) {
              candidatePhone = ext.candidate_phone.trim().slice(0, 40);
            }
            if (typeof ext.job_title === "string" && ext.job_title.trim().length >= 2) {
              jobTitle = ext.job_title.trim().slice(0, 110);
            }
            if (
              typeof ext.years_experience === "number" &&
              Number.isFinite(ext.years_experience)
            ) {
              yearsExperience = Math.max(0, Math.min(40, Math.round(ext.years_experience)));
            }
            if (Array.isArray(ext.detected_skills)) {
              const cleanSkills = ext.detected_skills
                .map((s: unknown) => (typeof s === "string" ? s.trim() : ""))
                .filter((s: string) => s.length >= 2)
                .slice(0, 10);
              if (cleanSkills.length >= 2) {
                detectedSkills = cleanSkills;
              }
            }
            if (typeof ext.ats_score === "number" && Number.isFinite(ext.ats_score)) {
              atsScore = Math.max(35, Math.min(98, Math.round(ext.ats_score)));
            }
            if (typeof ext.summary_ar === "string" && ext.summary_ar.trim().length >= 15) {
              aiSummaryAr = ext.summary_ar.trim().slice(0, 450);
            }
            if (typeof ext.summary_en === "string" && ext.summary_en.trim().length >= 15) {
              aiSummaryEn = ext.summary_en.trim().slice(0, 450);
            }
          }
        }
      } catch (err) {
        console.warn("n8n AI CV parser fallback notice:", err);
      }
    }

    const [companiesInCountry, jobCategoryMap] = await Promise.all([
      listCompanies({ country_code: countryCode }),
      getActiveJobIndustriesByCompany(),
    ]);
    const exactIndustryCompanies = companiesInCountry.filter(
      (c) =>
        c.is_active !== false &&
        doesCompanyHireInIndustry(c, detectedIndustry.id, jobCategoryMap)
    );
    const hrMultiSectorCompanies = companiesInCountry.filter(
      (c) => c.industry_id === "hr-admin" && c.is_active !== false
    );
    const GENERIC_WEBMAIL_NAMES = new Set([
      "gmail",
      "googlemail",
      "outlook",
      "hotmail",
      "yahoo",
      "live",
      "icloud",
      "msn",
      "protonmail",
    ]);
    const rawSamplePool =
      exactIndustryCompanies.length >= 4
        ? exactIndustryCompanies
        : [...exactIndustryCompanies, ...hrMultiSectorCompanies, ...companiesInCountry];

    const seenSampleNames = new Set<string>();
    const samplePool = rawSamplePool.filter((c) => {
      const norm = (c.company_name || "").trim().toLowerCase();
      if (!norm || GENERIC_WEBMAIL_NAMES.has(norm) || seenSampleNames.has(norm)) {
        return false;
      }
      seenSampleNames.add(norm);
      return true;
    });

    const realReachablePool = Math.max(
      exactIndustryCompanies.length + hrMultiSectorCompanies.length,
      Math.round(country.display_companies_count * 0.24)
    );

    const summaryAr =
      aiSummaryAr ||
      (parsed.hasRealTextLayer
        ? `تمت قراءة وتحليل ملف (${fileName}) بنجاح! طابق محرك «أسرع» خبراتك مع ${realReachablePool} جهة توظيف نشطة في ${country.name_ar} ضمن قطاع (${detectedIndustry.name_ar}).`
        : `تم حفظ ملف (${fileName})، لكن يبدو أنه ملف ممسوح ضوئياً كصورة (بدون طبقة نصية مقروءة لـ ATS). ننصح باختيار باقة Asra3 Hyper لتوليد ملف ATS نصي محسّن!`);

    const summaryEn =
      aiSummaryEn ||
      (parsed.hasRealTextLayer
        ? `Parsed (${fileName}) successfully! Asra3 matched your profile with ${realReachablePool} active employers in ${country.name_en} across ${detectedIndustry.name_en}.`
        : `Saved (${fileName}), Note: Your PDF appears to be a scanned image with minimal selectable text (which hurts ATS parsing). Consider Asra3 Hyper for an AI ATS-readable profile!`);

    const result: CvScanResult & { ai_parsed?: boolean } = {
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      candidate_phone: candidatePhone,
      detected_industry_id: detectedIndustry.id,
      job_title: jobTitle,
      years_experience: yearsExperience,
      detected_skills: detectedSkills,
      ats_score: atsScore,
      matched_companies_count: realReachablePool,
      stored_cv_url: storedCv.storedCvUrl,
      has_text_layer: parsed.hasRealTextLayer,
      sample_matched_companies: samplePool.slice(0, 4).map((c) => ({
        company_name: c.company_name,
        city_ar: c.city_name_ar,
        city_en: c.city_name_en,
        sub_specialty: c.sub_specialty,
      })),
      summary_ar: summaryAr,
      summary_en: summaryEn,
      ai_parsed: aiParsed,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("CV Scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan CV file" },
      { status: 500 }
    );
  }
}
