# ⚡ أسرع | Asra3.com — توظَّف أسرع في الخليج (Get Hired 3x Faster Across the GCC)

An enterprise-grade, multi-country AI CV optimization and direct HR inbox distribution SaaS built for **UAE 🇦🇪, Saudi Arabia 🇸🇦, Qatar 🇶🇦, and Kuwait 🇰🇼** using **Next.js 15 (App Router)**, **Supabase (PostgreSQL + Storage)**, **EasyKash DirectPayV1**, and **n8n**.

---

## ✨ Key Features

1. **Dedicated GCC Country Hubs & Local Currency Mode (`/ae`, `/sa`, `/qa`, `/kw`):**
   - Crawlable SSR SEO landing hubs plus instant local-mode switching across cities, verified HR inventories, and currencies (`AED`, `SAR`, `QAR`, `KWD`).
2. **4-Step Asra3 Velocity Wizard:**
   - **Step 1:** Choose Target Country & Cities.
   - **Step 2:** Drag-and-drop PDF/DOCX CV for real text extraction (`unpdf` + `mammoth`), ATS scoring, skill/contact auto-fill, and signed CV binary storage.
   - **Step 3:** Choose from 3 tiers (**Asra3 Launch 100**, **Asra3 Turbo 300**, **Asra3 Hyper 500+**) + **Multi-Country 50% Off Order Bump**.
   - **Step 4:** Promo code validation (`ASRA3VIP`, `GCC20`, `FAST15`), Confidentiality Employer Domain Exclusion, and **EasyKash DirectPayV1** Checkout.
3. **Hardened Security & Payment Architecture:**
   - Timing-safe `HttpOnly` HMAC-SHA256 Admin Session Cookie (`asra3_admin_session`) protecting all `/api/admin/*` routes.
   - EasyKash `HMAC-SHA512` webhook signature + exact paid-amount verification at `/api/webhooks/easykash`.
   - Signed CV file access at `/api/cv/file`.
4. **Candidate Live Tracking Portal (`/track/[token]`):**
   - Real-time smart-drip progress bar, KPI cards, paginated Masked HR Delivery Log (`25/page`), UTF-8 CSV export, bilingual AI Cover Letter copy tool, and CV download.
5. **Scalable Admin Operations Center (`/admin`):**
   - Server-paginated (`50/page`) & `300ms` debounced directory for `2,700+` verified GCC companies, Country × Industry inventory pills, row toggle/delete controls, MX/anti-bounce bulk CSV importer, and multi-currency revenue breakdown.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```
