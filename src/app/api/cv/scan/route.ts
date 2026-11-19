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

    // Optional external n8n AI CV analyzer webhook enrichment
    const n8nScanWebhook =
      process.env.N8N_CV_SCAN_WEBHOOK || process.env.N8N_CV_ANALYZE_WEBHOOK;
    if (
      n8nScanWebhook &&
      !n8nScanWebhook.includes("your-") &&
      !n8nScanWebhook.includes("asra3.com/webhook/wazayef-cv-scan")
    ) {
      try {
        const res = await fetch(n8nScanWebhook, {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(4500),
        });
        if (res.ok) {
          const externalData = await res.json();
          if (externalData?.detected_industry_id) {
            const found = industries.find(
              (i) => i.id === externalData.detected_industry_id
            );
            if (found) detectedIndustry = found;
          }
        }
      } catch {
        // Fallback to built-in text analyzer
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
    const samplePool =
      exactIndustryCompanies.length >= 4
        ? exactIndustryCompanies
        : [...exactIndustryCompanies, ...hrMultiSectorCompanies, ...companiesInCountry];

    const realReachablePool = Math.max(
      exactIndustryCompanies.length + hrMultiSectorCompanies.length,
      Math.round(country.display_companies_count * 0.24)
    );

    const summaryAr = parsed.hasRealTextLayer
      ? `تمت قراءة وتحليل ملف (${fileName}) بنجاح! طابق محرك «أسرع» خبراتك مع ${realReachablePool} جهة توظيف نشطة في ${country.name_ar} ضمن قطاع (${detectedIndustry.name_ar}).`
      : `تم حفظ ملف (${fileName})، لكن يبدو أنه ملف ممسوح ضوئياً كصورة (بدون طبقة نصية مقروءة لـ ATS). ننصح باختيار باقة Asra3 Hyper لتوليد ملف ATS نصي محسّن!`;

    const summaryEn = parsed.hasRealTextLayer
      ? `Parsed (${fileName}) successfully! Asra3 matched your profile with ${realReachablePool} active employers in ${country.name_en} across ${detectedIndustry.name_en}.`
      : `Saved (${fileName}), Note: Your PDF appears to be a scanned image with minimal selectable text (which hurts ATS parsing). Consider Asra3 Hyper for an AI ATS-readable profile!`;

    const result: CvScanResult = {
      candidate_name: parsed.candidate_name,
      candidate_email: parsed.candidate_email,
      candidate_phone: parsed.candidate_phone,
      detected_industry_id: detectedIndustry.id,
      job_title: parsed.job_title,
      years_experience: parsed.years_experience,
      detected_skills: parsed.detected_skills,
      ats_score: parsed.ats_score,
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
