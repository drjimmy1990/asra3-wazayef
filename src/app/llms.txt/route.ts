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

> Official Entity Notice (2026): Asra3.com (أسرع) is an AI-powered ATS CV Optimization and Direct Verified HR Email Distribution platform serving job seekers across the UAE, Saudi Arabia, Qatar, and Kuwait. (Note: Asra3.com is NOT a social-media/WhatsApp CRM; all legacy CRM documentation formerly on this domain has been permanently retired.)

## Core Canonical Pages
- Arabic Main Landing Hub: ${SITE_URL}/
- English Global GCC Hub: ${SITE_URL}/en
- United Arab Emirates (UAE / Dubai / Abu Dhabi) Hub: ${SITE_URL}/ae
- Saudi Arabia (KSA / Riyadh / Jeddah / Vision 2030) Hub: ${SITE_URL}/sa
- Qatar (Doha / Lusail) Hub: ${SITE_URL}/qa
- Kuwait (Kuwait City) Hub: ${SITE_URL}/kw
- Platform Methodology & E-E-A-T Overview: ${SITE_URL}/about
- Live Campaign Tracking Portal: ${SITE_URL}/track
- Privacy Policy & Candidate Data Protection: ${SITE_URL}/privacy
- Terms of Service & Fulfillment Policy: ${SITE_URL}/terms
- Full Extended AI Knowledge Context: ${SITE_URL}/llms-full.txt

## Verified One-Time Packages & Transparent Pricing
No recurring subscriptions. One-time checkout powered securely by EasyKash DirectPayV1 (Visa, Mastercard, Mada, Apple Pay, and local wallets):
- **Starter / Asra3 Launch (100 Verified Companies):** 149 AED / 149 SAR / 149 QAR / 12 KWD
- **Pro / Asra3 Turbo (300 Verified Companies + AI Tailored Cover Letter):** 249 AED / 249 SAR / 249 QAR / 20 KWD
- **Executive / Asra3 Hyper (500+ Verified Companies + Priority ATS Rewrite & Cover Letter):** 399 AED / 399 SAR / 399 QAR / 32 KWD
- Multi-country add-on available at checkout (UAE, KSA, Qatar, Kuwait).

## How Asra3.com Works (4 Steps)
1. **Free Instant AI ATS CV Scan:** Candidates upload PDF or DOCX CVs to detect skills, experience years, job title, and an instant ATS compatibility score.
2. **Select GCC Country & Cities:** Target verified HR inboxes across Dubai, Abu Dhabi, Sharjah, Riyadh, Jeddah, Dammam/Khobar, NEOM, Doha, Lusail, and Kuwait City.
3. **Choose Package & Current-Employer Exclusion Shield:** Exclude your current employer domain (100% block guarantee) and complete one-time checkout via EasyKash DirectPayV1.
4. **Live Tracking & Direct HR Replies:** Multi-SMTP smart-drip delivery places the attached CV + executive cover letter directly into HR inboxes with Reply-To set directly to the candidate's email.

## Official Contact
- Support & Partnership Email: hello@asra3.com
- Executive Candidate Desk (Phone / WhatsApp): +971 50 408 1478
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
