import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import type { ReactElement } from "react";
import { getJobBySlug } from "@/lib/jobs-store";
import { buildBrandedQrDataUri } from "@/lib/qr-code";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";

const size = {
  width: 1200,
  height: 630,
};

/**
 * The bundled OG renderer cannot shape Arabic/other complex scripts (it throws
 * "lookupType: 5 - substFormat: 3 is not yet supported" mid-stream, which used to
 * crash the whole Node process). Keep only Latin-range characters and fall back
 * to a safe label when nothing readable remains.
 */
function latinSafe(text: string | null | undefined, fallback: string): string {
  const cleaned = String(text || "")
    .replace(/[^\u0020-\u024F\u2013\u2014\u2022\u00B7]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—•·]+|[\s\-–—•·]+$/g, "")
    .trim();
  return /[A-Za-z0-9]/.test(cleaned) ? cleaned : fallback;
}

function companyFromDomain(domain: string | null | undefined): string {
  const base = String(domain || "")
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co)\.(ae|sa|qa|kw)$/, "")
    .replace(/\.(com|net|org|gov|edu|co|io|ae|sa|qa|kw)$/, "")
    .split(".")
    .pop();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

// Render fully into memory so any renderer failure is catchable (never a
// half-streamed response that takes the server down).
async function renderToPng(element: ReactElement): Promise<Response> {
  const img = new ImageResponse(element, { ...size });
  const buf = await img.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);

  const titleEn = latinSafe(
    job?.title_en,
    "Verified Executive Opportunity in the GCC"
  );
  const companyName = latinSafe(
    job?.company_name,
    latinSafe(companyFromDomain(job?.company_domain), "MX-Verified GCC Employer")
  );
  const countryCode = job?.country_code || "AE";
  const countryObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) ||
    INITIAL_COUNTRIES[0];
  const cityEn = latinSafe(job?.city_name_en, countryObj.cities[0].name_en);
  const industryObj =
    INITIAL_INDUSTRIES.find((i) => i.id === job?.industry_id) ||
    INITIAL_INDUSTRIES[0];

  const salaryText =
    job?.salary_min && job?.salary_max
      ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
      : `${countryCode} • ${job?.employment_type?.replace("_", " ") || "FULL TIME"}`;

  const skills = (job?.skills || ["ATS Ready", "Direct HR Inbox"])
    .map((s) => latinSafe(s, ""))
    .filter(Boolean)
    .slice(0, 4);

  const siteUrl = getCanonicalSiteUrl();
  const jobUrl = `${siteUrl}/jobs/${encodeURIComponent(job?.slug || slug)}`;
  let qrDataUri = "";
  try {
    qrDataUri = buildBrandedQrDataUri(jobUrl, 160);
  } catch {
    qrDataUri = "";
  }

  try {
    return await renderToPng(
      buildJobCard({
        titleEn,
        companyName,
        countryCode,
        cityEn,
        industryObj,
        salaryText,
        skills,
        qrDataUri,
      })
    );
  } catch (err) {
    console.error(`[og] job card render failed for ${slug}:`, err);
    // Last-resort: the static site-wide card always renders
    return Response.redirect(new URL("/opengraph-image", req.url), 302);
  }
}

function buildJobCard({
  titleEn,
  companyName,
  countryCode,
  cityEn,
  industryObj,
  salaryText,
  skills,
  qrDataUri,
}: {
  titleEn: string;
  companyName: string;
  countryCode: string;
  cityEn: string;
  industryObj: { name_en: string };
  salaryText: string;
  skills: string[];
  qrDataUri: string;
}): ReactElement {
  return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 68px",
          backgroundColor: "#09090B",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
          border: "2px solid #27272A",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "10px 22px",
              borderRadius: "10px",
              backgroundColor: "#141417",
              border: "1.5px solid #27272A",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#FAFAFA",
                letterSpacing: "3px",
              }}
            >
              ASRA
              <span style={{ color: "#D4AF37" }}>3</span>
              .COM/JOBS
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                backgroundColor: "#D4AF37",
                color: "#09090B",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              {`${countryCode} • ${cityEn.toUpperCase()}`}
            </div>
            <div
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                backgroundColor: "#141417",
                border: "1px solid #3F3F46",
                color: "#D4AF37",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              DNS MX VERIFIED HR
            </div>
          </div>
        </div>

        {/* Center Job Role & Company + Branded QR Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "36px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
              maxWidth: qrDataUri ? "820px" : "1040px",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#D4AF37",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {industryObj.name_en}
            </div>

            <div
              style={{
                fontSize: titleEn.length > 42 ? 44 : 52,
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-1px",
                color: "#FAFAFA",
              }}
            >
              {titleEn}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                fontSize: 24,
                color: "#D4D4D8",
                fontWeight: 600,
              }}
            >
              <span>{companyName}</span>
              <span style={{ color: "#D4AF37" }}>•</span>
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                {salaryText}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "6px",
              }}
            >
              {skills.map((sk) => (
                <div
                  key={sk}
                  style={{
                    padding: "7px 15px",
                    borderRadius: "8px",
                    backgroundColor: "#18181B",
                    border: "1px solid #27272A",
                    color: "#E4E4E7",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {sk}
                </div>
              ))}
            </div>
          </div>

          {qrDataUri ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                padding: "14px",
                borderRadius: "16px",
                backgroundColor: "#141417",
                border: "2px solid #D4AF37",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUri}
                alt="QR"
                width={158}
                height={158}
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#D4AF37",
                  letterSpacing: "1.4px",
                }}
              >
                SCAN TO APPLY
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#A1A1AA",
                  letterSpacing: "0.6px",
                }}
              >
                ASRA3.COM
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "22px",
            borderTop: "1px solid #27272A",
          }}
        >
          <div
            style={{
              fontSize: 19,
              color: "#A1A1AA",
              fontWeight: 600,
            }}
          >
            Scan QR or Tap Link in 1st Comment • Apply Free on Asra3.com
          </div>

          <div
            style={{
              padding: "12px 26px",
              borderRadius: "10px",
              backgroundColor: "#D4AF37",
              color: "#09090B",
              fontSize: 19,
              fontWeight: 800,
            }}
          >
            Apply Direct →
          </div>
        </div>
      </div>
  );
}
