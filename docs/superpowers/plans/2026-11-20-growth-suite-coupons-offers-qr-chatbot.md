# Asra3.com Growth & Conversion Suite (Coupons, Limited-Time Offers, Branded QR Job Cards & n8n Support Chatbot) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four coordinated conversion and automation capabilities to Asra3.com: (1) Admin-managed dynamic discount coupons, (2) Limited-time offer pricing with crossed-out anchor prices and live countdown timer, (3) Branded Asra3 QR codes on Facebook/OG job cards and job pages, and (4) A floating bilingual AI Support & Lead-Capture Chatbot backed by a live n8n workflow and an `/admin` Support Leads inbox.

**Architecture:** All persistent configuration (`coupons`, `offerSettings`, `supportLeads`) extends `LocalStoreData` in `src/lib/store.ts` (backed by `.data/store.json` with safe backward-compatible hydration and zero breaking schema migrations). Reusable UI modules (`OfferCountdownBanner.tsx`, `AdminPromosPanel.tsx`, `AdminLeadsTab.tsx`, `SupportChatWidget.tsx`, `src/lib/qr-code.ts`) keep `src/app/admin/page.tsx` and `DistributionWizard.tsx` clean and modular. The chatbot proxies through Next.js `/api/chat` to the live n8n webhook (`https://n8n.asra3.com/webhook/asra3-support-chat`) with live pricing/offer context injected on every turn and a built-in deterministic fallback so the widget never breaks offline.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Tailwind CSS v4, `qrcode` (SVG/Data-URI generation for Satori + client UI), `next/og` (Satori), `lucide-react`, n8n (`https://n8n.asra3.com` with existing `OpenAI account` credential `Arwid7CTslrXwpfL` / `Google Gemini` `f5qzhIMAaSz2uchi`).

---

## File Structure Map

### New Files
- `src/lib/qr-code.ts` — Generates high-ECC (`H`) vector SVG QR codes with centered `A3` Asra3 gold-on-black emblem (both raw SVG for React UI and Base64 `data:image/svg+xml` URI for Satori OG cards).
- `src/app/api/coupons/validate/route.ts` — Public endpoint validating a promo code against active coupons, package scope, expiry, and max uses, returning exact computed discount.
- `src/app/api/admin/coupons/route.ts` — Admin CRUD (`GET`, `POST`, `PATCH`, `DELETE`) for dynamic coupons.
- `src/app/api/chat/route.ts` — Support Chatbot backend proxy injecting live Asra3 pricing/offer/FAQ context into the n8n webhook, saving captured leads, with resilient bilingual fallback.
- `src/app/api/support/leads/route.ts` — Public lead-capture endpoint (with honeypot + validation) storing customer inquiries and optionally notifying n8n/SMTP.
- `src/app/api/admin/leads/route.ts` — Admin CRUD (`GET`, `PATCH`, `DELETE`) to review and resolve incoming customer support/sales leads.
- `src/components/OfferCountdownBanner.tsx` — Hydration-safe live countdown bar supporting fixed `ends_at` deadlines or auto-renewing `evergreen_hours` cycles + clickable featured coupon copy pill.
- `src/components/AdminPromosPanel.tsx` — Admin UI panel inside `/admin → Pricing & Go-Live` for configuring Limited-Time Offer settings and managing Discount Coupons.
- `src/components/AdminLeadsTab.tsx` — Admin tab (`Support Leads`) showing captured customer contact requests with status badges, 1-click WhatsApp/Email links, and resolution controls.
- `src/components/SupportChatWidget.tsx` — Floating bottom-corner bilingual (AR/EN) Support & Lead-Capture chat widget mounted globally (hidden on `/admin`).
- `n8n-workflows/asra3-support-chatbot.json` — Exported n8n Support Chatbot workflow mirrored with the live workflow created on `https://n8n.asra3.com`.

### Modified Files
- `package.json` — Add `qrcode` and `@types/qrcode`.
- `src/lib/types.ts` — Add `CouponDiscountType`, `CouponRecord`, `OfferSettings`, `SupportLeadTopic`, `SupportLeadStatus`, `SupportLeadRecord`; extend `PackageTier` with `original_prices_by_currency`.
- `src/lib/seed-data.ts` — Add `INITIAL_COUPONS`, `INITIAL_OFFER_SETTINGS`, and default `original_prices_by_currency` on `INITIAL_PACKAGES`.
- `src/lib/store.ts` — Extend `LocalStoreData`, implement `validateAndComputeCoupon()`, coupon CRUD, `updateOfferSettings()`, `updatePackagePricing()` (supporting `original_prices_by_currency`), `createSupportLead()` / `listSupportLeads()` / `updateSupportLeadStatus()` / `deleteSupportLead()`, update `createCampaignOrder()` to enforce dynamic coupons, and increment `coupon.used_count` on paid conversion in `markCampaignPaidAndStart()`.
- `src/app/api/admin/campaigns/route.ts` — Return `offerSettings`, `coupons`, and `supportLeadsCount` in `GET`; handle `offerSettings` updates and `originalPricesByCurrency` in `PATCH`.
- `src/context/AppContext.tsx` — Expose `offerSettings` from `/api/catalog`.
- `src/components/HomeLandingClient.tsx` — Show `<OfferCountdownBanner />`, crossed-out original prices, and `Save XX%` badges on pricing cards.
- `src/components/DistributionWizard.tsx` — Replace hardcoded promo check with live `POST /api/coupons/validate`, show `<OfferCountdownBanner />` + crossed-out prices on Step 3 & Step 4, and recalculate discounts when package/countries change.
- `src/app/api/og/job/[slug]/route.tsx` — Embed Asra3-branded QR code (`148×148`) pointing to `https://asra3.com/jobs/${slug}` + `"Scan QR or Tap 1st Comment • asra3.com"` footer.
- `src/components/JobDetailClient.tsx` — Add sidebar **"Share & QR Job Card"** widget with live QR preview, 1-click Copy Link, Copy 1st-Comment Text, and Download Branded Facebook PNG Card.
- `src/app/admin/page.tsx` — Add editable `Original (Crossed-Out) Price` row per package, embed `<AdminPromosPanel />` in `settings` tab, and add `leads` tab rendering `<AdminLeadsTab />`.
- `src/app/layout.tsx` — Mount `<SupportChatWidget />` inside `<AppProvider>`.
- `.env.example` & `TESTING-AND-GOLIVE-GUIDE.md` — Document `N8N_SUPPORT_CHAT_WEBHOOK`, `N8N_SUPPORT_LEAD_WEBHOOK`, and add QA test steps for Coupons, Offers, QR Cards, and Support Chatbot.

---

## Pre-Implementation Checklist (GitNexus Safety)

Before editing any existing symbol (`createCampaignOrder`, `markCampaignPaidAndStart`, `updatePackagePricing`, `getCatalogData`, `GET` in OG route), run `gitnexus-stdio` `impact({ target: "<symbol>", direction: "upstream", repo: "asra3-wazayef" })` and confirm blast radius.

---

### Task 1: Install QR Dependency & Extend Core Domain Models + Seed Data

**Files:**
- Modify: `package.json`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/seed-data.ts`

- [ ] **Step 1: Install `qrcode` and `@types/qrcode`**
  Run: `npm install qrcode; npm install -D @types/qrcode`
  Expected: Installs cleanly into `package.json` with 0 peer dependency conflicts.

- [ ] **Step 2: Extend `src/lib/types.ts` with Coupon, OfferSettings, and SupportLead types**
  - Add optional `original_prices_by_currency?: Record<CurrencyCode, number>;` to `PackageTier`.
  - Add:
    ```ts
    export type CouponDiscountType = "percent" | "fixed";

    export interface CouponRecord {
      id: string;
      code: string;
      discount_type: CouponDiscountType;
      discount_value: number;
      applicable_packages: PackageId[] | "all";
      max_uses: number | null;
      used_count: number;
      expires_at: string | null;
      is_active: boolean;
      note?: string;
      created_at: string;
    }

    export interface OfferSettings {
      enabled: boolean;
      badge_ar: string;
      badge_en: string;
      headline_ar: string;
      headline_en: string;
      ends_at: string | null;
      evergreen_hours: number;
      highlight_coupon_code?: string | null;
    }

    export type SupportLeadTopic =
      | "pricing"
      | "campaign_help"
      | "employer_hr"
      | "payment"
      | "general";

    export type SupportLeadStatus = "new" | "contacted" | "resolved";

    export interface SupportLeadRecord {
      id: string;
      session_id: string;
      name: string;
      email: string;
      phone: string;
      country_code: string;
      topic: SupportLeadTopic;
      message: string;
      page_url: string;
      status: SupportLeadStatus;
      created_at: string;
    }
    ```

- [ ] **Step 3: Add `original_prices_by_currency`, `INITIAL_COUPONS`, and `INITIAL_OFFER_SETTINGS` in `src/lib/seed-data.ts`**
  - Starter (`starter`): `original_prices_by_currency: { AED: 249, SAR: 249, QAR: 249, KWD: 21, EGP: 3200, USD: 69 }` (saves ~48%).
  - Pro (`pro`): `original_prices_by_currency: { AED: 449, SAR: 449, QAR: 449, KWD: 37, EGP: 5800, USD: 119 }` (saves ~49%).
  - Ultimate (`ultimate`): `original_prices_by_currency: { AED: 699, SAR: 699, QAR: 699, KWD: 58, EGP: 8900, USD: 189 }` (saves ~50%).
  - `INITIAL_COUPONS`: default editable coupons `ASRA3VIP` (20% off), `GCC20` (20% off), `FAST15` (15% off).
  - `INITIAL_OFFER_SETTINGS`: `enabled: true`, bilingual launch-offer badge & headline, `ends_at: null`, `evergreen_hours: 48`, `highlight_coupon_code: "ASRA3VIP"`.

- [ ] **Step 4: Run `npm run typecheck`**
  Expected: `tsc --noEmit` exits 0.

---

### Task 2: Dynamic Coupons, Offer Settings & Support Leads Repository (`src/lib/store.ts`)

**Files:**
- Modify: `src/lib/store.ts`

- [ ] **Step 1: Run GitNexus impact analysis on `getCatalogData`, `updatePackagePricing`, `createCampaignOrder`, and `markCampaignPaidAndStart`**
  Expected: Verify callers and risk before editing.

- [ ] **Step 2: Extend `LocalStoreData` and safe backward-compatible hydration in `readLocalStore()`**
  - Add `coupons: CouponRecord[]`, `offerSettings: OfferSettings`, `supportLeads: SupportLeadRecord[]` to `LocalStoreData`.
  - Ensure legacy `.data/store.json` files seamlessly hydrate defaults (`INITIAL_COUPONS`, `INITIAL_OFFER_SETTINGS`, `[]`, and default `original_prices_by_currency` if missing on existing packages).

- [ ] **Step 3: Implement pure coupon engine `validateAndComputeCoupon()`**
  - Normalizes `code` to uppercase trimmed string.
  - Checks: exists, `is_active === true`, not expired (`expires_at && new Date(expires_at).getTime() < Date.now()`), usage cap (`max_uses !== null && used_count >= max_uses`), package applicability (`applicable_packages === "all" || applicable_packages.includes(packageId)`).
  - Computes `discountAmount`:
    - `"percent"`: `Math.round((subtotal * Math.min(100, Math.max(0, coupon.discount_value))) / 100)`
    - `"fixed"`: `Math.min(subtotal, Math.max(0, Math.round(coupon.discount_value)))`
  - Computes `finalTotal = Math.max(1, subtotal - discountAmount)` (keeps EasyKash minimum valid payable amount ≥ 1).

- [ ] **Step 4: Add repository functions for Coupons, OfferSettings, and SupportLeads**
  - `listCoupons()`, `validateCouponCode({ code, packageId, subtotal })`, `createCoupon(input)`, `updateCoupon(id, patch)`, `deleteCoupon(id)`.
  - `getOfferSettings()`, `updateOfferSettings(patch)`.
  - Extend `updatePackagePricing(packageId, pricesByCurrency, addonPricesByCurrency, originalPricesByCurrency)` to persist crossed-out anchor prices.
  - Extend `getCatalogData()` to return `{ countries, industries, packages, offerSettings }`.
  - `listSupportLeads()`, `createSupportLead(input)`, `updateSupportLeadStatus(id, status)`, `deleteSupportLead(id)`.

- [ ] **Step 5: Wire `createCampaignOrder()` and `markCampaignPaidAndStart()` to dynamic coupons**
  - Replace hardcoded `ASRA3VIP`/`GCC20`/`FAST15` block in `createCampaignOrder()` with `validateAndComputeCoupon()`.
  - Inside `markCampaignPaidAndStart()`, when transitioning a campaign from `payment_status !== "paid"` to `"paid"` and `campaign.promo_code` is set, atomically increment `used_count` on that coupon in the local store.

- [ ] **Step 6: Run `npm run typecheck`**
  Expected: 0 errors.

---

### Task 3: Coupon, Offer, and Support Lead API Routes

**Files:**
- Create: `src/app/api/coupons/validate/route.ts`
- Create: `src/app/api/admin/coupons/route.ts`
- Create: `src/app/api/support/leads/route.ts`
- Create: `src/app/api/admin/leads/route.ts`
- Modify: `src/app/api/admin/campaigns/route.ts`

- [ ] **Step 1: Create `POST /api/coupons/validate`**
  - Parses `{ code, packageId, subtotal }`, calls `validateCouponCode()`, returns `{ valid, code, discount_type, discount_value, discountAmount, finalTotal, errorReason }`.
- [ ] **Step 2: Create `/api/admin/coupons` (`GET`, `POST`, `PATCH`, `DELETE`)**
  - All handlers gated by `isAdminAuthorized(req)`.
  - Validates uniqueness of uppercase coupon code on `POST`, percent bounds (1–99%), fixed > 0, optional expiry & max uses.
- [ ] **Step 3: Update `/api/admin/campaigns`**
  - `GET`: Include `offerSettings`, `coupons`, `supportLeadsCount` (count of `"new"` leads).
  - `PATCH`: Support `originalPricesByCurrency` alongside `pricesByCurrency`, AND support `body.offerSettings` update returning `{ ok: true, offerSettings }`.
- [ ] **Step 4: Create `POST /api/support/leads` and `/api/admin/leads` (`GET`, `PATCH`, `DELETE`)**
  - `POST /api/support/leads`: Silently drops bots via `website_trap` honeypot; validates name + (email or phone) + message; persists via `createSupportLead()`; optionally notifies `process.env.N8N_SUPPORT_LEAD_WEBHOOK` asynchronously (non-blocking).
  - `/api/admin/leads`: Admin-gated list, status toggle (`new` / `contacted` / `resolved`), and delete.

- [ ] **Step 5: Run `npm run typecheck && npm run lint`**
  Expected: 0 errors, 0 warnings.

---

### Task 4: Limited-Time Offer Banner & Live Coupon Checkout UI

**Files:**
- Modify: `src/context/AppContext.tsx`
- Create: `src/components/OfferCountdownBanner.tsx`
- Modify: `src/components/HomeLandingClient.tsx`
- Modify: `src/components/DistributionWizard.tsx`

- [ ] **Step 1: Expose `offerSettings` in `AppContext.tsx`**
  - Initialize with `INITIAL_OFFER_SETTINGS`, hydrate from `GET /api/catalog` (`data.offerSettings`).
- [ ] **Step 2: Build `src/components/OfferCountdownBanner.tsx`**
  - Hydration-safe (`mounted` state) live 1-second timer showing `HH:MM:SS` (or `DDd HH:MM:SS` when > 24h left).
  - If `offerSettings.ends_at` is set: counts down to `ends_at`; returns `null` cleanly once expired.
  - If `offerSettings.ends_at` is null: computes a deterministic rolling window of `offerSettings.evergreen_hours` (e.g. 48h) so all users see a consistent, realistic countdown without ever hitting 00:00:00.
  - If `offerSettings.highlight_coupon_code` is set: displays a 1-click copyable gold code pill (`CODE: ASRA3VIP`).
- [ ] **Step 3: Upgrade Pricing Cards in `HomeLandingClient.tsx` and Step 3 of `DistributionWizard.tsx`**
  - Render `<OfferCountdownBanner />` cleanly above the 3 pricing tiers.
  - When `offerSettings.enabled` is true and `originalPrice > price`: display crossed-out `originalPrice` (`line-through`), bold offer `price`, and crisp **`Save XX%` / `وفر XX%`** badge.
- [ ] **Step 4: Wire live coupon validation in `DistributionWizard.tsx`**
  - Replace hardcoded `handleApplyPromo` with async `POST /api/coupons/validate`.
  - Support both `%` and fixed discounts in Step 4 Order Summary, and auto-recompute/re-validate if the user switches package or adds extra countries!
- [ ] **Step 5: Run `npm run typecheck && npm run lint`**
  Expected: 0 errors, 0 warnings.

---

### Task 5: Branded Asra3 QR Code Engine, OG Job Card & Job Page Share Widget

**Files:**
- Create: `src/lib/qr-code.ts`
- Modify: `src/app/api/og/job/[slug]/route.tsx`
- Modify: `src/components/JobDetailClient.tsx`

- [ ] **Step 1: Build `src/lib/qr-code.ts`**
  - Uses `QRCode.create(url, { errorCorrectionLevel: "H" })` to build a clean geometric `<svg>` path (single `<path>` of dark squares on crisp white rounded background with quiet zone = 3 modules).
  - Places a centered high-contrast **`A3`** rounded-square emblem (`#09090B` background + `#D4AF37` gold border & bold `A3` vector/text) occupying ~20% width (safely under the 30% Level-H error correction budget so every phone camera scans it instantaneously!).
  - Exports:
    - `buildBrandedQrSvg(url: string, pixelSize?: number): string`
    - `buildBrandedQrDataUri(url: string, pixelSize?: number): string` (Base64 `data:image/svg+xml;base64,...` ready for Satori `<img src={...} />`).
- [ ] **Step 2: Upgrade `src/app/api/og/job/[slug]/route.tsx`**
  - Compute canonical job URL `${SITE_URL}/jobs/${slug}` and generate `qrDataUri = buildBrandedQrDataUri(jobUrl, 152)`.
  - Place the center content on the left (`maxWidth: "840px"`) and the crisp white-framed QR card (`164×164` + `SCAN TO APPLY` gold micro-label + `asra3.com`) on the right.
  - Update footer tagline to: `"Scan QR or Tap 1st Comment to Apply Free • asra3.com"`.
  - Keep `latinSafe()`, `renderToPng()` memory buffering, and 302 fallback intact!
- [ ] **Step 3: Add "Share & QR Job Card" Widget to `src/components/JobDetailClient.tsx`**
  - Render the branded QR code in the right sidebar below the Employer Callout.
  - Include 3 practical action buttons:
    1. **Download Facebook Card (PNG)** (`href="/api/og/job/${job.slug}"` with `download="asra3-${job.slug}.png"`).
    2. **Copy Job Link** (`https://asra3.com/jobs/${job.slug}`).
    3. **Copy 1st-Comment Text** (copies ready-to-paste bilingual 1st comment with link for manual sharing).
- [ ] **Step 4: Run `npm run typecheck && npm run lint`**
  Expected: 0 errors, 0 warnings.

---

### Task 6: Floating Bilingual AI Support Chatbot + Live n8n Backend

**Files:**
- Create: `src/app/api/chat/route.ts`
- Create: `src/components/SupportChatWidget.tsx`
- Modify: `src/app/layout.tsx`
- Create: `n8n-workflows/asra3-support-chatbot.json`
- Live n8n: Create & validate workflow via `n8n-mcp` on `https://n8n.asra3.com`

- [ ] **Step 1: Build `POST /api/chat` (`src/app/api/chat/route.ts`)**
  - Accepts `{ sessionId, message, history, lang, countryCode, pageUrl }`.
  - Pulls live catalog (`getCatalogData()`) + published jobs count (`searchAndRankJobs({ limit: 1 })`) to build a compact `siteContext` with exact live prices in AED/SAR/QAR/KWD/EGP/USD, active offer details, featured public coupon (if any), and core FAQs.
  - Sends payload to `process.env.N8N_SUPPORT_CHAT_WEBHOOK` (with `x-webhook-secret` header and 18s timeout).
  - If n8n returns `{ reply, showLeadForm?, suggestedActions?, capturedLead? }`:
    - If `capturedLead` contains email or phone, saves it via `createSupportLead()` automatically.
    - Returns structured response to the widget.
  - **Smart Built-In Fallback:** If `N8N_SUPPORT_CHAT_WEBHOOK` is unconfigured or returns non-200/timeout, answers accurately in Arabic or English using live `siteContext` (pricing breakdown, offer details, EasyKash payment methods, ATS scan, Confidentiality Shield, employer job posting, campaign tracking) and sets `showLeadForm: true` when the user asks to contact support, talk to a human, or leave their phone/email.
- [ ] **Step 2: Build `src/components/SupportChatWidget.tsx`**
  - Automatically returns `null` when `pathname.startsWith("/admin")`.
  - Floating carbon-black + gold button (`bottom-5 end-5`, `z-50`) with unread gold pulse dot and crisp bilingual label.
  - Responsive chat window (`w-[360px] sm:w-[390px]`, max height `78vh`, RTL/LTR + Light/Dark aware):
    - Header with Asra3 Support badge, online dot, quick **"Leave Contact Info"** toggle button, and close button.
    - Starter welcome message + 4 one-tap quick-question chips (Pricing & Offers, How Asra3 Works, Post a Company Job, Talk to Human Support).
    - Message bubbles with typing indicator and inline suggested follow-up chips.
    - Embedded **Contact / Callback Form** (Name, Email, WhatsApp/Phone, Topic, Message) posting directly to `POST /api/support/leads` with instant confirmation banner.
- [ ] **Step 3: Mount `<SupportChatWidget />` in `src/app/layout.tsx`**
  - Render inside `<AppProvider>` right after `{children}`.
- [ ] **Step 4: Build & validate live n8n Support Chatbot workflow on `https://n8n.asra3.com`**
  - Create workflow **`Asra3.com — AI Support Chatbot & Lead Capture Backend`** via `n8n_create_workflow`:
    - `chatWebhook` (`n8n-nodes-base.webhook`, `POST`, path `asra3-support-chat`, `responseMode: "responseNode"`)
    - `buildSupportPrompt` (`n8n-nodes-base.code`: checks optional `x-webhook-secret`, builds strict bilingual Asra3 system prompt with injected live `siteContext`, instructs model to answer concisely about Asra3/prices/offers/jobs and detect when to collect customer contact details in strict JSON)
    - `openaiChatReply` (`@n8n/n8n-nodes-langchain.openAi` or `n8n-nodes-base.httpRequest` — wait: inspect exact OpenAI node schema via `n8n-mcp` `get_node` first so credential `Arwid7CTslrXwpfL` wires cleanly with zero validation errors!)
    - `formatWidgetReply` (`n8n-nodes-base.code`: safely parses JSON `{ reply, showLeadForm, suggestedActions, capturedLead }` with fallback)
    - `respondToWidget` (`n8n-nodes-base.respondToWebhook` returning JSON `200 OK`)
  - Validate with `n8n_validate_workflow` (`errorCount: 0`) and export matching template to `n8n-workflows/asra3-support-chatbot.json`.

---

### Task 7: Admin Panel Upgrades (Promos, Offer Pricing, Coupons & Support Leads)

**Files:**
- Create: `src/components/AdminPromosPanel.tsx`
- Create: `src/components/AdminLeadsTab.tsx`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Build `src/components/AdminPromosPanel.tsx`**
  - **Section A — Limited-Time Offer Configurator:** Toggle Enabled, AR/EN Badge & Headline, Fixed End Date/Time picker (or clear for Auto-Renew 48h Evergreen Window), Evergreen Hours input, Featured Public Coupon Code selector, Save button (`PATCH /api/admin/campaigns`).
  - **Section B — Discount Coupons Manager:** Create Coupon form (`code`, `percent`/`fixed`, `discount_value`, `max_uses`, `expires_at`, `applicable_packages`, `note`) + live Coupons table showing status, uses (`used_count / max_uses`), toggle Active/Paused, and Delete (`GET/POST/PATCH/DELETE /api/admin/coupons`).
- [ ] **Step 2: Build `src/components/AdminLeadsTab.tsx`**
  - Lists all captured chatbot & support form leads (`GET /api/admin/leads`) with filter (`all` / `new` / `contacted` / `resolved`), direct `mailto:` and `https://wa.me/` quick-reply buttons, status dropdown, and delete button.
- [ ] **Step 3: Integrate into `src/app/admin/page.tsx`**
  - Add editable **Original (Crossed-Out) Price** row per currency inside each package card (saved alongside Base & Add-on prices).
  - Render `<AdminPromosPanel />` cleanly in the `settings` (`Pricing & Go-Live`) tab.
  - Add `Support Leads` tab button (with gold badge showing count of `"new"` leads) rendering `<AdminLeadsTab />`.
  - Show `Support Chatbot Webhook` URL in the Production Endpoints list.

---

### Task 8: Docs Update, Full Isolated Build, Extended E2E Verification & Push

**Files:**
- Modify: `.env.example`
- Modify: `TESTING-AND-GOLIVE-GUIDE.md`

- [ ] **Step 1: Document `N8N_SUPPORT_CHAT_WEBHOOK` and `N8N_SUPPORT_LEAD_WEBHOOK` in `.env.example` and update `TESTING-AND-GOLIVE-GUIDE.md`** with test checklists for Coupons, Offers, QR Job Cards, and the Support Chatbot + Leads inbox.
- [ ] **Step 2: Run full static verification**
  - `npm run typecheck` (0 errors)
  - `npm run lint` (0 errors, 0 warnings)
  - Isolated `npm run build` (0 errors)
- [ ] **Step 3: Extend and run isolated E2E smoke test covering ALL new features**
  - Coupon CRUD + public validation (% off, fixed off, expired, max uses reached, package mismatch) + checkout enforces exact coupon price + paid webhook increments `used_count`.
  - OfferSettings update + `/api/catalog` reflects live offer & crossed-out prices.
  - `/api/og/job/[slug]` returns valid `image/png` with embedded branded QR code (including Arabic company/title inputs, 0 crashes).
  - `/api/chat` answers live pricing/offer questions in AR & EN; `/api/support/leads` saves lead (and drops honeypot bots); `/api/admin/leads` lists & resolves lead.
- [ ] **Step 4: Clean local test data, run GitNexus `analyze` + `detect_changes`, commit & push via `smart_commit.sh`**
  - Provide exact VPS deploy commands from `DEPLOYMENT-VPS.md` plus the one line to add to VPS `.env` (`N8N_SUPPORT_CHAT_WEBHOOK=https://n8n.asra3.com/webhook/asra3-support-chat`).
