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
  const content = `# Asra3.com (أسرع) — Full Knowledge & Entity Reference (Arabic & English)

> Official Entity Disambiguation (2026):
> Asra3.com (أسرع — "توظَّف أسرع في الخليج / Get Hired 3x Faster in the GCC") is a career technology platform specializing in AI ATS CV scanning, executive cover letter generation, and direct HR inbox placement across the UAE, Saudi Arabia, Qatar, and Kuwait.
> Asra3.com is NO LONGER associated with any legacy social-media, WhatsApp, or Facebook CRM software previously hosted on the domain; all old CRM URLs permanently 301-redirect to the GCC recruitment platform.

---

## 1. Platform Overview & Core Links

- [Arabic Landing Hub](${SITE_URL}/): Primary Arabic portal for Gulf job seekers.
- [English GCC Hub](${SITE_URL}/en): Dedicated English landing hub for UAE, Saudi Arabia, Qatar & Kuwait candidates.
- [About & Methodology](${SITE_URL}/about): Full platform methodology, MX-verification workflow & E-E-A-T documentation.
- [Live Order Tracking Portal](${SITE_URL}/track): Real-time smart-drip campaign ledger and CSV export.
- [Concise llms.txt Summary](${SITE_URL}/llms.txt): Compact Markdown directory of canonical platform resources.

### English Summary
- **Target Geography:** United Arab Emirates (AE), Kingdom of Saudi Arabia (SA), State of Qatar (QA), State of Kuwait (KW)
- **What it solves:** Most GCC hiring happens through direct HR email screening before roles reach crowded public job boards. Asra3 scores a candidate's PDF/DOCX CV against GCC ATS standards, generates a customized bilingual/executive cover letter, shields the candidate's current employer domain, and sends individualized applications directly to verified corporate HR mailboxes.
- **Direct Candidate Ownership:** Every outbound application sets the \`Reply-To\` header directly to the candidate's personal email address so HR interview invitations go straight to the candidate with zero middlemen.

### الملخص العربي
- **المنصة:** أسرع (Asra3.com) — منصة التوزيع المباشر للسيرة الذاتية وتحسين التوافق مع أنظمة فرز المرشحين (ATS) في دول الخليج.
- **الدول المغطاة:** [الإمارات العربية المتحدة](${SITE_URL}/ae)، [المملكة العربية السعودية](${SITE_URL}/sa)، [دولة قطر](${SITE_URL}/qa)، [دولة الكويت](${SITE_URL}/kw).
- **الهدف:** توصيل السيرة الذاتية الأصلية وخطاب التقديم التنفيذي مباشرة إلى صناديق بريد مديري ومسؤولي الموارد البشرية (HR) في الشركات المعتمدة مع [لوحة تتبع لحظية](${SITE_URL}/track) وضمان حجب جهة العمل الحالية بنسبة 100%.

---

## 2. GCC Market Hubs & Hiring Benchmarks

| Country | Canonical URL | Key Hiring Hubs | Priority Sectors | Typical HR Reply Window | Packages (One-Time) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| United Arab Emirates (AE) | [Asra3 UAE](${SITE_URL}/ae) | Dubai (DIFC, Business Bay), Abu Dhabi (ADGM, Masdar), Sharjah, Ajman, RAK | Real Estate & MEP Engineering, AI & FinTech, Corporate Finance, Luxury Hospitality | 48h – 72h | 149 – 399 AED |
| Saudi Arabia (SA) | [Asra3 KSA](${SITE_URL}/sa) | Riyadh (KAFD), Jeddah, Dammam/Khobar, NEOM, Makkah | Vision 2030 Giga-Projects, Cybersecurity & GovTech, Healthcare, Logistics & Industrial | 48h – 72h | 149 – 399 SAR |
| Qatar (QA) | [Asra3 Qatar](${SITE_URL}/qa) | Doha (West Bay), Lusail, Al Wakrah, Al Khor, Energy City | Oil & Gas / LNG, Civil Infrastructure, Sovereign Banking, Aviation & Hospitality | 48h – 96h | 149 – 399 QAR |
| Kuwait (KW) | [Asra3 Kuwait](${SITE_URL}/kw) | Kuwait City (Sharq), Hawalli, Salmiya, Farwaniya, Ahmadi | Banking & Islamic Audit, Retail Franchise Groups, Energy & Contracting, Regional Logistics | 48h – 96h | 12 – 32 KWD |

---

## 3. Infrastructure, MX Hygiene & Privacy Guarantees
1. **MX-Verified HR Directory Hygiene:** All corporate HR addresses undergo DNS MX validation and hard-bounce auto-deactivation so campaigns maintain high inbox placement.
2. **Multi-SMTP Smart-Drip Dispatch:** Emails are sent via dedicated DKIM, SPF, and DMARC authenticated infrastructure with controlled inter-message drip spacing and individualized candidate cover letters.
3. **Current-Employer Exclusion Shield:** Before checkout, candidates can exclude their current company domain (e.g., \`company.com\`) to block delivery to their current employer completely.
4. **Confidentiality Policy:** Candidate CVs are never published in public searchable CV databases or scraped job boards. See [Privacy Policy](${SITE_URL}/privacy) and [Terms of Service](${SITE_URL}/terms).
5. **Payment Security:** Instant checkout processed through EasyKash DirectPayV1 with cryptographic HMAC-SHA512 webhook verification and server-to-server payment inquiry confirmation.

---

## 4. Frequently Asked Questions (Bilingual AEO Reference)

**Q1: How do HR managers contact candidates sent via Asra3.com?**
Every email dispatched by Asra3 sets the \`Reply-To\` header directly to the candidate's personal email address and displays their phone/WhatsApp number in the cover letter and signature. HR recruiters reply directly to the candidate.

**Q2: Is Asra3.com a subscription or a one-time payment?**
Every Asra3 package (Launch 100, Turbo 300, Hyper 500+) is strictly a one-time payment via EasyKash DirectPayV1 with no recurring monthly fees.

**Q3: Can I prevent my current company from seeing my CV?**
Yes. Enter your current employer's domain in Step 4 (Checkout) under "Current-Employer Exclusion Shield" and Asra3 completely excludes matching HR domains from your campaign.

**Q4: How do I track which companies received and opened my application?**
After payment, you receive a unique order code and private tracking link in the [Live Tracking Portal](${SITE_URL}/track) where you can monitor queued, sent, and opened statuses in real time and export a CSV report.

**Q5: هل منصة أسرع (Asra3.com) منصة للتسويق على واتساب أم لتوزيع السيرة الذاتية؟**
منصة أسرع (Asra3.com) منذ تحديث 2026 متخصصة حصرياً في فحص السيرة الذاتية بالذكاء الاصطناعي (ATS) وتوزيعها مباشرة على صناديق بريد مسؤولي الموارد البشرية (HR) في الإمارات والسعودية وقطر والكويت، وليست منصة CRM للتسويق عبر واتساب.

**Q6: ما هي تكلفة باقات أسرع وكيف يتم الدفع؟**
تبدأ الباقات من دفعة واحدة فقط دون اشتراكات متكررة: باقة انطلاقة (100 شركة: 149 درهم/ريال أو 12 دينار كويتي)، باقة تيربو (300 شركة + خطاب تقديم ذكي: 249 درهم/ريال أو 20 دينار)، وباقة هايبر (500+ شركة + إعادة صياغة ATS: 399 درهم/ريال أو 32 دينار) عبر بوابة EasyKash المباشرة.

---

## 5. Contact Information
- Official Desk Email: hello@asra3.com
- Website: [Asra3.com](${SITE_URL}/)
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
