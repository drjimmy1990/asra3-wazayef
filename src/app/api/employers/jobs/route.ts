import { NextRequest, NextResponse } from "next/server";
import { submitEmployerJobRequest } from "@/lib/jobs-store";
import { CountryCode, EmploymentType } from "@/lib/types";

// Lightweight in-memory IP rate limiter (max 6 submissions per hour per IP)
const ipSubmissionWindow = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hourAgo = now - 3600 * 1000;
  const recent = (ipSubmissionWindow.get(ip) || []).filter((t) => t > hourAgo);
  if (recent.length >= 6) {
    ipSubmissionWindow.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipSubmissionWindow.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many job submissions from this network. Please wait before submitting another role.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Anti-bot honeypot trap
    if (body.company_fax_trap && String(body.company_fax_trap).trim().length > 0) {
      return NextResponse.json({ ok: true, autoPublished: false });
    }

    const companyName = String(body.company_name || "").trim();
    const hrEmail = String(body.hr_email || "").trim().toLowerCase();
    const titleEn = String(body.title_en || "").trim();
    const titleAr = String(body.title_ar || "").trim();
    const description = String(body.description || "").trim();

    if (companyName.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid company name." },
        { status: 400 }
      );
    }
    if (!hrEmail.includes("@") || !hrEmail.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid HR or recruitment email address." },
        { status: 400 }
      );
    }
    if (!titleEn && !titleAr) {
      return NextResponse.json(
        { error: "Please provide the job title (Arabic or English)." },
        { status: 400 }
      );
    }
    if (description.length < 25) {
      return NextResponse.json(
        {
          error:
            "Please include at least a brief description and key requirements (25+ characters).",
        },
        { status: 400 }
      );
    }

    const rawCountry = String(body.country_code || "AE").toUpperCase().trim();
    const country_code: CountryCode = ["AE", "SA", "QA", "KW"].includes(
      rawCountry
    )
      ? (rawCountry as CountryCode)
      : "AE";

    const rawEmpType = String(body.employment_type || "FULL_TIME")
      .toUpperCase()
      .trim();
    const employment_type: EmploymentType = [
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "REMOTE",
    ].includes(rawEmpType)
      ? (rawEmpType as EmploymentType)
      : "FULL_TIME";

    const salaryMinNum = body.salary_min ? Number(body.salary_min) : null;
    const salaryMaxNum = body.salary_max ? Number(body.salary_max) : null;

    const skills = Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => String(s).trim()).filter(Boolean)
      : String(body.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const submission = await submitEmployerJobRequest({
      company_name: companyName,
      company_website: body.company_website
        ? String(body.company_website).trim()
        : undefined,
      hr_email: hrEmail,
      apply_url: body.apply_url ? String(body.apply_url).trim() : undefined,
      apply_whatsapp: body.apply_whatsapp
        ? String(body.apply_whatsapp).trim()
        : undefined,
      country_code,
      city_id: String(body.city_id || "").trim(),
      industry_id: String(body.industry_id || "engineering").trim(),
      employment_type,
      experience_level: String(
        body.experience_level || "Mid-Senior (3-7 Years)"
      ).trim(),
      title_ar: titleAr || titleEn,
      title_en: titleEn || titleAr,
      salary_min:
        salaryMinNum && Number.isFinite(salaryMinNum) && salaryMinNum > 0
          ? Math.round(salaryMinNum)
          : null,
      salary_max:
        salaryMaxNum && Number.isFinite(salaryMaxNum) && salaryMaxNum > 0
          ? Math.round(salaryMaxNum)
          : null,
      description,
      skills,
    });

    if (!submission.ok) {
      const reasonMessages: Record<string, string> = {
        no_mx_records_found:
          "We could not verify active DNS MX mail servers on this email domain. Please use an active corporate email address.",
        blocked_noreply_or_trap_prefix:
          "Please provide a monitored HR/careers inbox rather than a no-reply address.",
        invalid_syntax: "Invalid email format.",
      };
      return NextResponse.json(
        {
          error:
            reasonMessages[submission.errorReason || ""] ||
            "Unable to verify recruitment email domain.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      autoPublished: submission.autoPublished,
      job: submission.job
        ? {
            id: submission.job.id,
            slug: submission.job.slug,
            status: submission.job.status,
            is_mx_verified: submission.job.is_mx_verified,
          }
        : null,
    });
  } catch (err) {
    console.error("Employer job submission error:", err);
    return NextResponse.json(
      { error: "Failed to process job submission." },
      { status: 500 }
    );
  }
}
