import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getJobBySlug } from "@/lib/jobs-store";
import { INITIAL_COUNTRIES, INITIAL_INDUSTRIES } from "@/lib/seed-data";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);

  const titleEn = job?.title_en || "Verified Executive Opportunity in the GCC";
  const companyName = job?.company_name || "MX-Verified Corporate Employer";
  const countryCode = job?.country_code || "AE";
  const countryObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) ||
    INITIAL_COUNTRIES[0];
  const cityEn = job?.city_name_en || countryObj.cities[0].name_en;
  const industryObj =
    INITIAL_INDUSTRIES.find((i) => i.id === job?.industry_id) ||
    INITIAL_INDUSTRIES[0];

  const salaryText =
    job?.salary_min && job?.salary_max
      ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
      : `${countryCode} • ${job?.employment_type?.replace("_", " ") || "FULL TIME"}`;

  const skills = (job?.skills || ["ATS Ready", "Direct HR Inbox"]).slice(0, 4);

  return new ImageResponse(
    (
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

        {/* Center Job Role & Company */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "1040px",
          }}
        >
          <div
            style={{
              fontSize: 21,
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
              fontSize: titleEn.length > 42 ? 48 : 56,
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
              gap: "18px",
              fontSize: 26,
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
                  padding: "7px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#18181B",
                  border: "1px solid #27272A",
                  color: "#E4E4E7",
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {sk}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid #27272A",
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#A1A1AA",
              fontWeight: 500,
            }}
          >
            Direct HR Apply + Free AI ATS CV Match Audit on Asra3.com
          </div>

          <div
            style={{
              padding: "12px 26px",
              borderRadius: "10px",
              backgroundColor: "#D4AF37",
              color: "#09090B",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            Apply Direct →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
