# Asra3.com (أسرع) — Full Go-Live Setup & End-to-End QA Testing Guide

This guide covers:
1. **Remaining External Setup Steps** (VPS Deployment, Google Search Console, GA4 Verification, Optional Google Indexing API, Facebook Page + n8n 3-Hour Autopilot).
2. **Full Real-World End-to-End QA Test Plan** across every role (**Company / Employer**, **Admin**, **Candidate + Real EasyKash Payment with Temporarily Lowered Price**, **HR Inbox Recipient opening the email & replying**, and **n8n → Facebook Autopilot**) — using **QA Safe Test Mode** so **zero real GCC companies** are ever emailed during testing.
3. **Mandatory Post-Test Cleanup & Production Cutover** (restoring original package prices, removing QA env flags, and removing test records).

---

## Part 1 — Remaining External Setup Steps (One-Time)

### 1.1 Deploy the Latest Build to Your VPS

SSH into your Ubuntu VPS (or open **aaPanel → Terminal**) and run:

```bash
cd /www/wwwroot/asra3-wazayef
git pull origin main
docker compose up -d --build
curl -s http://127.0.0.1:3645/api/health
```

Confirm the response shows `"status":"ok"` and `"qa_test_mode":false`.

Verify the dynamic OG job image and a live job page respond `200 OK`:
```bash
# Replace <SLUG> with any published slug shown in /admin -> Jobs Board
curl -I https://asra3.com/jobs
curl -I https://asra3.com/sitemap.xml
curl -I https://asra3.com/jobs/rss.xml
```

---

### 1.2 Google Search Console & Google for Jobs SEO

1. Open [Google Search Console](https://search.google.com/search-console) and select your `https://asra3.com` property (verify via DNS `TXT` record if not yet verified).
2. Go to **Indexing → Sitemaps** and submit BOTH feeds:
   - `https://asra3.com/sitemap.xml`
   - `https://asra3.com/jobs/rss.xml`
3. Open [Google Rich Results Test](https://search.google.com/test/rich-results) and paste any live job URL (`https://asra3.com/jobs/<slug>`):
   - Confirm **`JobPosting`** structured data is detected with **0 critical errors**.
   - Check that `title`, `description`, `datePosted`, `validThrough`, `employmentType`, `hiringOrganization`, and `jobLocation` appear cleanly.
4. *(Optional — Instant Google Jobs Indexing API)*:
   - Every time Asra3 harvests or publishes a job, [`src/lib/seo-indexer.ts`](src/lib/seo-indexer.ts) automatically pings **IndexNow** (Bing/Yandex) and, if configured, **Google Indexing API v3** (`https://indexing.googleapis.com/v3/urlNotifications:publish`).
   - To enable instant Google Indexing pings:
     1. In **Google Cloud Console**, enable the **Web Search Indexing API**.
     2. Create a Service Account, download its JSON key, and add the Service Account email as an **Owner** inside Google Search Console for `asra3.com`.
     3. Generate/refresh a short-lived OAuth2 access token (`scope: https://www.googleapis.com/auth/indexing`) or configure an n8n/cron refresher to populate `GOOGLE_INDEXING_ACCESS_TOKEN` in `/www/wwwroot/asra3-wazayef/.env`.
     4. Optional: also set `INDEXNOW_KEY=<your-32-char-hex-key>` in `.env` and place `<key>.txt` at `public/<key>.txt`.

---

### 1.3 Google Analytics 4 (`G-M6784VRK96`) Verification

GA4 is already embedded in [`src/components/GoogleAnalytics.tsx`](src/components/GoogleAnalytics.tsx) with Measurement ID **`G-M6784VRK96`**.

1. Open [Google Analytics](https://analytics.google.com) → **Reports → Realtime**.
2. Open `https://asra3.com` in an Incognito tab (disable ad blockers) and browse `/ae`, `/sa`, `/jobs`, and `/employers`.
3. Confirm active user & SPA `page_view` hits appear in Realtime within 30 seconds.
4. Confirm custom events fire as you run the QA tests in Part 2:
   - `cv_scan_complete` — after uploading a CV in the distribution wizard
   - `begin_checkout` — when clicking Pay / Continue to EasyKash
   - `job_direct_apply` — when revealing/applying to a job on `/jobs/[slug]`
5. In GA4 → **Admin → Events**, mark `begin_checkout` and `job_direct_apply` as **Key Events (Conversions)** once they appear.

---

### 1.4 Facebook Page + n8n 3-Hour Autopilot Workflow

Your live n8n workflow is already created and validated:
- **Workflow Name:** `Asra3.com — Automated 3h GCC Jobs Harvester, Website & Facebook Autopilot`
- **Workflow ID:** `Xp6A0sq7yAh0pdJb`
- **Backup Template in Repo:** `n8n-workflows/asra3-jobs-facebook-autopilot.json`

#### Step A: Get Your Facebook Page ID & Long-Lived Page Access Token
1. Go to [Meta for Developers](https://developers.facebook.com) → Create or open a **Business** app.
2. Add the **Facebook Login for Business** / **Pages** product and open **Tools → Graph API Explorer**.
3. Select your app, choose **Get Page Access Token**, pick your Asra3 Facebook Page, and grant permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement` *(required for auto-posting the apply URL as the 1st comment)*
4. Open **Tools → Access Token Debugger**, paste the token, and click **Extend Access Token** to convert it into a **Never-Expiring Page Access Token** (exchange short-lived user token → long-lived user token → fetch `/me/accounts` to get the permanent Page Access Token).
5. Note your numeric **Facebook Page ID** (visible in Facebook Page → **About → Page transparency** or in `/me/accounts`).

#### Step B: Configure `configCredentials` Inside n8n
1. Open your n8n instance and open workflow **`Xp6A0sq7yAh0pdJb`**.
2. Double-click the **`configCredentials`** node and set:
   - `asra3BaseUrl`: `https://asra3.com`
   - `webhookSecret`: your exact `N8N_WEBHOOK_SECRET` (or `ADMIN_PASSCODE`) from `/www/wwwroot/asra3-wazayef/.env`
   - `facebookPageId`: your numeric Page ID
   - `facebookPageAccessToken`: your long-lived Page Access Token
   - *(Optional Telegram Channel)*: fill `telegramBotToken` and `telegramChatId` (`@yourchannel`), then right-click **`optionalTelegramChannel`** → **Enable**.
3. **Save** the workflow (leave **Inactive** until Test E below passes!).

### 1.5 AI Support Chatbot Backend (on `https://n8n.asra3.com`)

Import both ready-to-use n8n workflows into your **`https://n8n.asra3.com`** instance (**Workflows → Import from File**):
- **Jobs + Facebook Autopilot:** `n8n-workflows/asra3-jobs-facebook-autopilot.json`
- **AI Support Chatbot & Lead Capture:** `n8n-workflows/asra3-support-chatbot.json`
  1. Open the `geminiLiteModel` node and select your Gemini API credential (`models/gemini-3.1-flash-lite` or `models/gemini-2.5-flash-lite`).
  2. Save and switch the workflow **Active**.
  3. Production Webhook URL: `https://n8n.asra3.com/webhook/asra3-support-chat`

To connect your live site to this `n8n.asra3.com` AI backend, add this line to `/www/wwwroot/asra3-wazayef/.env`:
```env
N8N_SUPPORT_CHAT_WEBHOOK=https://n8n.asra3.com/webhook/asra3-support-chat
```
*(Even if this variable is omitted or n8n is momentarily paused, `/api/chat` falls back seamlessly to a built-in bilingual pricing/FAQ responder so the floating widget never breaks.)*

---

## Part 2 — Full End-to-End Real-World QA Test Plan (Safe Live Testing)

This test plan lets you test **every single feature on live `https://asra3.com`** — including **real EasyKash payment**, **real SMTP delivery**, **real HR inbox open-tracking pixel**, **employer job submission**, **admin moderation**, and **Facebook autopilot** — **without emailing a single real GCC company**.

### Step 0 — Activate QA Safe Test Mode (Mandatory Before Testing Campaigns!)

Prepare **two real email addresses you own** (for example: one personal email acting as the **Candidate**, and one or two separate email addresses acting as **HR / Company Recipients**).

1. Edit `/www/wwwroot/asra3-wazayef/.env` on the VPS:
   ```bash
   nano /www/wwwroot/asra3-wazayef/.env
   ```
   Add these two lines at the bottom (replace with **your own** test emails):
   ```env
   QA_TEST_CANDIDATE_EMAILS=your-candidate-email@gmail.com
   QA_TEST_HR_EMAILS=your-hr-inbox-1@yourdomain.com,your-hr-inbox-2@gmail.com
   ```
   > **How QA Safe Test Mode works (`src/lib/store.ts`):** Whenever a campaign is placed using an email listed in `QA_TEST_CANDIDATE_EMAILS`, Asra3 automatically overrides recipient selection and **ONLY** selects companies whose `hr_email` is in `QA_TEST_HR_EMAILS`. Real candidates are unaffected, and your test campaign can **never** leak to real GCC HR emails.

2. Recreate the container so `.env` reloads (fast — no rebuild needed):
   ```bash
   cd /www/wwwroot/asra3-wazayef
   docker compose up -d
   curl -s http://127.0.0.1:3645/api/health
   ```
   **Verify:** `/api/health` MUST return `"qa_test_mode": true` before you proceed!

3. Open `https://asra3.com/admin` and log in with your `ADMIN_PASSCODE`.
4. **Verify SMTP Delivery First** (`/admin` → **SMTP & Email** tab):
   - Confirm at least **1 Active SMTP account** is configured.
   - Enter your own email in **Send Test Email** and click Send.
   - Confirm the test email arrives in your Inbox (not Spam).
5. **Add Your Test HR Company to the Directory** (`/admin` → **Companies** tab):
   - Use the **Bulk CSV / Manual Import** box and import your test HR company (matching the country/city/industry you will test, e.g., `AE`, `dubai`, `it-software`):
     ```text
     QA Test Tech LLC, your-hr-inbox-1@yourdomain.com, AE, dubai, it-software, Full Stack Engineering
     ```
     *(Tip: If your HR test email is on a corporate domain, it imports directly. If it's a Gmail/Outlook address, make sure personal webmail is allowed or use a corporate alias on your domain so DNS MX passes!)*
   - Confirm `QA Test Tech LLC` appears in the Companies table as **Active**.
6. **Temporarily Lower the Starter Package Price** (`/admin` → **Pricing & Go-Live** tab):
   - Note the **original Starter (`Asra3 Launch — 100 Companies`) prices** before changing them:
     - `AED`: **129** | `SAR`: **129** | `QAR`: **129** | `KWD`: **11** | `EGP`: **1690** | `USD`: **35**
   - Change the Starter price for the currency your EasyKash account settles in (check `EASYKASH_CURRENCY_OVERRIDE` in `.env` — if set to `EGP`, edit `EGP`; if blank and testing UAE, edit `AED`):
     - Set it to EasyKash's minimum testable charge (typically **5 AED** / **5 SAR** / **10 EGP** / **1 USD** — check your EasyKash minimum transaction limit, usually ≥ 5–10 EGP or ≥ 1–5 AED).
   - Click **Save Prices** and confirm the saved toast appears.
   - Check the **Production Readiness Checklist** on the same tab:
     - `EasyKash Live Gateway` → **LIVE**
     - `EasyKash HMAC-SHA512` → **ACTIVE**
     - `Multi-SMTP Rotation Pool` → **≥ 1 Active Mailer**

---

### Test A — Company / Employer Portal Flow (`/employers`)

Test both corporate auto-publishing (with multi-role + multi-category) and free-webmail moderation:

1. **Test A1 — Corporate MX Employer + Multi-Role + Multi-Category (Auto-Publish):**
   - Go to `https://asra3.com/employers`.
   - Enter a real company name (e.g. `QA Horizon Systems`), a corporate HR email with valid MX (e.g. `hr@yourdomain.com`), Country `AE`, City `Dubai`, Primary Industry `IT, Software, Cloud & AI`.
   - Select **1–2 Secondary Industries** (e.g., `Engineering` + `Sales & Marketing`).
   - Click **+ Add Another Role** to add a second vacancy in a different category (e.g. `Accountant` in `Finance & Accounting`).
   - Fill description + requirements and submit.
   - **Expected Results:**
     - Instant green confirmation: **Published Immediately (DNS MX Verified)** showing **2 jobs published**.
     - Visit `https://asra3.com/jobs` and search `QA Horizon Systems` → both roles appear immediately.
     - Click into one job (`/jobs/<slug>`):
       - Page loads `200 OK` with full title, salary, skills, and requirements.
       - Open `https://asra3.com/api/og/job/<slug>` in a new tab → crisp `1200×630` PNG card renders cleanly (test with an Arabic job title too!).
       - View Page Source (`Ctrl+U`) and search `JobPosting` → valid JSON-LD block is present.
     - Check `/admin` → **Companies** tab → search `hr@yourdomain.com` → automatically added/enriched in the verified HR directory!

2. **Test A2 — Free Webmail Employer (Admin Moderation Queue):**
   - On `https://asra3.com/employers`, submit a test job using a `@gmail.com` email.
   - **Expected Results:**
     - Confirmation says **Submitted for Admin Review** (NOT auto-published).
     - Job does **NOT** appear publicly on `/jobs` yet.
     - Job **DOES** appear in `/admin` → **Jobs Board** tab with status **Pending Review**.

3. **Test A3 — Invalid / Dead Domain Rejection:**
   - Try submitting with `hr@nonexistent-invalid-domain-99999.invalid`.
   - **Expected Result:** Clean inline error rejecting the fake domain (never saved).

---

### Test B — Admin Dashboard Flow (`/admin`)

Open `https://asra3.com/admin`:

1. **Jobs Board Tab:**
   - Find the pending `@gmail.com` job from Test A2 → click **Approve** → verify it immediately appears on `/jobs`.
   - Click **Feature / Pin** on one of your test jobs → open `https://asra3.com/jobs` → verify it ranks **#1 at the top** with the Featured badge.
   - Click **Harvest Live GCC Jobs Now** → confirm summary banner reports scanned posts, newly published jobs, and newly verified companies (remember: `0 verified companies added` simply means the harvested HR emails already exist in your directory — and existing companies still have their multi-category sectors enriched!).
2. **Country Hubs & SEO Check:**
   - Switch between `AE`, `SA`, `QA`, `KW` in the top navigation bar:
     - Confirm URL updates (`/ae`, `/sa`, `/qa`, `/kw`) and the Saudi Vision 2030 banner ONLY appears on `/sa`.
   - Visit `/ae/jobs`, `/sa/jobs`, `/qa/jobs`, `/kw/jobs` and filter by sector & keyword.

---

### Test C — Candidate Journey + Real EasyKash Payment Flow

Use an **Incognito browser window** (so GA4 Realtime also tracks you cleanly):

1. **Discover & Apply on Jobs Board:**
   - Open `https://asra3.com/jobs` → open your test job from Test A1.
   - Click **Reveal HR Email / Direct Apply** → confirm email unlocks and GA4 fires `job_direct_apply`.
   - Click **"Send CV to 300 Similar HR"** CTA button → confirm it routes to the Distribution Wizard with the job's country & industry pre-selected.

2. **Upload CV & Run ATS Analysis:**
   - Upload a real PDF or DOCX resume (under 10 MB).
   - Confirm ATS Score, extracted title, skills, and strengths render cleanly (GA4 fires `cv_scan_complete`).

3. **Configure Campaign with QA Candidate Email & Exclusion Shield:**
   - Enter **Candidate Email:** the exact email you placed in `QA_TEST_CANDIDATE_EMAILS` (e.g. `your-candidate-email@gmail.com`).
   - Select Country `AE`, City `Dubai`, Industry `IT, Software, Cloud & AI` (matching the test HR company you added in Step 0.5).
   - Select the **Starter (`Asra3 Launch`)** package — verify it shows your **temporarily lowered test price**.
   - *(Optional Exclusion Shield test)*: If you added 2 test HR emails (`your-hr-inbox-1` and `your-hr-inbox-2`), type `your-hr-inbox-2`'s domain or company name in **Exclude Current Employer** to verify only `your-hr-inbox-1` receives the CV.

4. **Complete Real EasyKash Payment:**
   - Click **Pay & Launch Campaign** (GA4 fires `begin_checkout`).
   - You are redirected to the live **EasyKash DirectPay** checkout page showing the lowered test amount.
   - Complete the real payment using Card / Apple Pay / Wallet / Meeza.
   - **Expected Results after Payment:**
     - EasyKash sends an HMAC-SHA512 signed webhook to `https://asra3.com/api/webhooks/easykash`.
     - You are redirected back to your live campaign tracking page: `https://asra3.com/track/<token>`.
     - Campaign status updates from `pending_payment` → **`paid` → `sending` → `completed`**.
     - Check the recipient table on `/track/<token>`: **ONLY** your test HR email(s) appear (0 real companies!).
     - Check your **Candidate inbox** (`your-candidate-email@gmail.com`): confirm you received the Asra3 payment/launch confirmation email with your `/track/<token>` link.
     - Check `/admin` → **Campaigns** tab: confirm the campaign shows **Paid**, exact paid amount, EasyKash reference, and delivery count.

---

### Test D — HR Recipient Experience (Inbox, Attachment, Open Pixel & Reply-To)

Now switch to your **Test HR Inbox** (`your-hr-inbox-1@yourdomain.com`):

1. **Check Deliverability & Presentation:**
   - Confirm the email landed in **Inbox** (check SPF/DKIM/DMARC headers via *Show Original* if using Gmail).
   - Confirm the **Subject line** is personalized and professional.
   - Confirm the **PDF/DOCX CV is attached** and opens cleanly without corruption.
   - Confirm the **Email Body** shows the candidate's executive summary / cover letter cleanly in Arabic or English.

2. **Test the Live Open-Tracking Pixel (`/api/track/open`):**
   - Open the email and click **Display Images** (if your email client blocks external images by default).
   - Refresh the candidate's live tracking page (`https://asra3.com/track/<token>`).
   - **Expected Result:** The **Opened** counter increments (`0 → 1`) and the recipient row updates to **Opened**!

3. **Test Direct HR Reply (`Reply-To` Header):**
   - Click **Reply** inside your HR inbox.
   - **Expected Result:** The `To:` address automatically fills with the **Candidate's personal email** (`your-candidate-email@gmail.com`), NOT the platform SMTP sender (`dispatch@asra3.com`). Send a test reply and confirm the candidate receives it directly.

4. **Test CSV Delivery Report Download:**
   - On `/track/<token>`, download the **Transparent CSV Delivery Report** and confirm your test HR company, timestamp, and delivery/open status are recorded accurately.

---

### Test E — n8n → Website → Facebook Page Autopilot Test

1. Make sure at least 1 real (or test) published job on `asra3.com` has **not yet been posted to Facebook** (`fb_posted_at` is empty — visible in `/admin` → **Jobs Board**).
2. Open n8n workflow **`Xp6A0sq7yAh0pdJb`** (`Asra3.com — Automated 3h GCC Jobs Harvester, Website & Facebook Autopilot`).
3. Click **Execute Workflow** (manual 1-time run).
4. Inspect each node's output in order:
   - `harvestJobsWebsite` → `200 OK` (returns `scannedPosts`, `insertedCount`)
   - `fetchSocialQueue` → returns up to 2 unposted jobs with `og_image_url`, `facebook_photo_caption`, `facebook_first_comment`
   - `publishFacebookPhoto` → returns Facebook `post_id` / `id`
   - `postFirstCommentLink` → posts direct apply link with `?utm_source=facebook&utm_medium=social&utm_campaign=gcc_jobs_autopilot`
   - `markJobPosted` → `200 OK` (`{ "ok": true, "updated": true }`)
5. **Verify on Your Live Facebook Page:**
   - The branded `1200×630` Asra3 job card photo is published with clean bilingual caption.
   - The **1st Comment** contains the clickable `https://asra3.com/jobs/<slug>?utm_source=facebook...` link.
   - Click the link from Facebook → confirm it opens the job page cleanly and appears in GA4 Realtime with `utm_source=facebook`.
6. **Verify Anti-Duplicate Lock:**
   - Open `/admin` → **Jobs Board** → confirm the posted job now shows **`FB Posted ✓`**.
   - Run `fetchSocialQueue` again → confirm that same job is **no longer returned**.
7. **Activate Autopilot:**
   - Toggle the workflow switch in n8n to **Active** so it harvests & publishes automatically every **3 hours**.

---

### Test F — Coupons, Limited-Time Offers, Branded QR Job Cards & Support Chatbot

1. **Test F1 — Limited-Time Offers & Discount Coupons (`/admin` → Pricing, Offers & Coupons):**
   - Confirm the **Offer Countdown Banner** is active on the homepage pricing section and Step 3 of the wizard, showing crossed-out anchor prices + `SAVE XX%` badges.
   - Create a custom test coupon in `/admin` (e.g., `QATEST50`, `50% OFF`, `Max Uses: 2`).
   - Enter `QATEST50` in Step 4 of the Distribution Wizard → verify live validation cuts the checkout total in half immediately and EasyKash bills the exact discounted amount.
   - Toggle `QATEST50` to **Paused** (or delete it after testing) and verify the wizard immediately rejects it.
2. **Test F2 — Branded Asra3 QR Code on Job Cards & Job Pages:**
   - Open any live job (`/jobs/<slug>`):
     - Confirm the sidebar **"Branded Asra3 Job QR Card"** renders a crisp QR code with the centered gold **`A3`** emblem.
     - Scan the QR code with your phone camera → confirm it opens `https://asra3.com/jobs/<slug>` directly.
     - Click **Download Facebook Card (PNG + QR)** → open the downloaded `1200×630` PNG and confirm the QR code + `"Scan QR or Tap 1st Comment • Apply Free on Asra3.com"` footer render crisply.
     - Click **1st Comment** → verify a ready-to-paste comment with tracked URL copies to your clipboard.
3. **Test F3 — Floating Support Chatbot & Lead Capture:**
   - Open `https://asra3.com` (make sure you're NOT on `/admin`) → click the floating **`دعم أسرع • اسألنا` / `Asra3 Support`** button in the bottom corner.
   - Ask about prices in Arabic or English → confirm the bot quotes your exact live prices and active offer from `/api/catalog`.
   - Click **Contact / تواصل معنا** inside the widget (or type your phone/email in chat) and submit a test inquiry.
   - Open `/admin` → **Support Leads** tab → confirm the lead appears with 1-click **WhatsApp** & **Email** buttons; test marking it **Contacted → Resolved**, then delete your test lead.

---

## Part 3 — Mandatory Post-Test Cleanup & Production Cutover

Do **every single item** below immediately after your tests pass:

- [ ] **1. Restore Original Starter Package Prices (`/admin` → Pricing & Go-Live):**
  - `AED`: **`129`**
  - `SAR`: **`129`**
  - `QAR`: **`129`**
  - `KWD`: **`11`**
  - `EGP`: **`1690`**
  - `USD`: **`35`**
  - Click **Save Prices** and reload the homepage (`https://asra3.com`) to confirm the real public prices are displayed!

- [ ] **2. Disable QA Safe Test Mode on the VPS:**
  ```bash
  nano /www/wwwroot/asra3-wazayef/.env
  ```
  Delete (or leave empty) both `QA_TEST_CANDIDATE_EMAILS` and `QA_TEST_HR_EMAILS`, then restart Docker:
  ```bash
  cd /www/wwwroot/asra3-wazayef
  docker compose up -d
  curl -s http://127.0.0.1:3645/api/health
  ```
  **Confirm output shows:** `"qa_test_mode": false`.

- [ ] **3. Remove QA Test Records from `/admin`:**
  - In `/admin` → **Jobs Board**: **Delete** your `QA Horizon Systems` and Gmail test jobs (so Google doesn't index test vacancies).
  - In `/admin` → **Companies**: **Delete** `QA Test Tech LLC` / your personal HR test email(s) so real candidates don't email your personal QA inbox.
  - Delete any QA test post from your Facebook Page if it posted a test job instead of a real GCC job.

- [ ] **4. Take a Fresh Production Backup:**
  ```bash
  tar -czf /root/asra3-data-backup-$(date +%F).tar.gz -C /www/wwwroot/asra3-wazayef .data .env
  ```

You are now **100% live, verified, and production-ready**.
