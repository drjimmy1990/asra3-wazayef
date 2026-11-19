import { NextResponse } from "next/server";

const SITE_URL =
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://asra3.com")
  ).replace(/\/+$/, "");

export async function GET() {
  const content = `# Asra3.com (أسرع) — GCC AI ATS CV Optimization & Direct HR Distribution Platform

> Official Entity Notice (2026): Asra3.com (أسرع) is an AI-powered ATS CV Optimization and Direct Verified HR Email Distribution platform serving job seekers across the UAE, Saudi Arabia, Qatar, and Kuwait. Asra3.com is NOT a social-media/WhatsApp CRM; all legacy CRM documentation formerly on this domain permanently 301-redirects here.

Asra3.com scans candidate PDF/DOCX CVs against GCC Applicant Tracking Systems (ATS), generates tailored cover letters, shields current employer domains, and dispatches individualized applications directly into MX-verified corporate HR mailboxes with Reply-To set straight to the candidate.

## Core Platform Hubs

- [Asra3.com Main Arabic Hub](${SITE_URL}/): Primary Arabic platform for UAE, Saudi Arabia, Qatar & Kuwait CV optimization and direct HR outreach.
- [Asra3.com English GCC Hub](${SITE_URL}/en): Full English experience for GCC AI ATS CV scanning and direct HR inbox placement.
- [Live Verified GCC Jobs Board](${SITE_URL}/jobs): Continuously updated, DNS MX-verified corporate HR job vacancies across Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, and Kuwait City.
- [Employer Direct Job Portal](${SITE_URL}/employers): Free corporate job posting portal with instant DNS MX verification and Google Jobs schema.
- [Live Jobs RSS 2.0 Feed](${SITE_URL}/jobs/rss.xml): Machine-readable feed of verified Gulf job vacancies.
- [Platform Methodology & About](${SITE_URL}/about): Entity identity, DNS MX verification workflow, ATS evaluation criteria, and confidential distribution standards.
- [Live Campaign Tracking Ledger](${SITE_URL}/track): Real-time company placement progress, open tracking metrics, and CSV export portal.

## GCC Regional Country Portals

- [United Arab Emirates HR Distribution (AED)](${SITE_URL}/ae): Direct CV outreach to verified employers in Dubai (DIFC, Business Bay), Abu Dhabi (ADGM), Sharjah, Ajman & RAK.
- [Saudi Arabia & Vision 2030 Hub (SAR)](${SITE_URL}/sa): Targeted corporate HR placement in Riyadh (KAFD), Jeddah, Dammam/Khobar, and NEOM.
- [Qatar HR Distribution Hub (QAR)](${SITE_URL}/qa): Direct HR outreach across Doha (West Bay), Lusail, Energy City, Al Wakrah & Al Khor.
- [Kuwait HR Distribution Hub (KWD)](${SITE_URL}/kw): Corporate talent placement across Kuwait City (Sharq), Hawalli, Salmiya, Farwaniya & Ahmadi.

## Documentation & Policies

- [Extended Knowledge Reference (llms-full.txt)](${SITE_URL}/llms-full.txt): Complete bilingual GCC benchmarks, hiring tables, and detailed AEO Q&A reference.
- [Privacy Policy & Confidentiality](${SITE_URL}/privacy): Candidate CV protection standards and Current-Employer Exclusion Shield guarantees.
- [Terms of Service & Fulfillment Policy](${SITE_URL}/terms): Transparent one-time EasyKash checkout terms and campaign fulfillment scope.
- [XML Sitemap](${SITE_URL}/sitemap.xml): Canonical crawlable index of Asra3.com pages and hreflang alternates.

## Verified One-Time Packages & Pricing

- **Starter / Asra3 Launch (100 Verified Companies):** 149 AED / 149 SAR / 149 QAR / 12 KWD (one-time payment)
- **Pro / Asra3 Turbo (300 Verified Companies + AI Cover Letter):** 249 AED / 249 SAR / 249 QAR / 20 KWD (one-time payment)
- **Executive / Asra3 Hyper (500+ Verified Companies + ATS Rewrite):** 399 AED / 399 SAR / 399 QAR / 32 KWD (one-time payment)

## Official Contact

- Support Desk Email: hello@asra3.com
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
