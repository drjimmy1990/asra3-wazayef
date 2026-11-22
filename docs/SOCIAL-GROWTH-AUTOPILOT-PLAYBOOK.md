# Asra3.com (أسرع) — Social Growth & Reels Autopilot Playbook (Facebook + Instagram)

> **Evergreen Master Runbook (`0 → 10K+ Followers` & Paid Conversions)**  
> Covers your live **Facebook Page (`Asra3`)** + **Instagram Business (`@asra3_jobs`)** automation architecture, daily/weekly content mix (Reels, Carousels, Hero Promos, Stories), free native Comment-to-DM funnel, warmup guardrails, and copy-paste prompts to trigger updates anytime.
>
> **Security Rule:** Never place raw tokens or secrets in this document or any Git-tracked file. All credentials live strictly in `.env.local` (local dev), `/www/wwwroot/asra3-wazayef/.env` (production VPS), and `n8n` workflow variables (`configCredentials`).

---

## 1. Current Live System & Account Inventory

| Channel / Component | Identifier / Endpoint | Live Status | What It Does Right Now |
|---|---|---|---|
| **Facebook Page (`Asra3`)** | Page ID `1617561988096136` | **LIVE — 4h Reels Autopilot + 3 Foundation Posts** | Every `4h` (`5–6` Reels/day), `n8n` harvests verified GCC jobs, renders a custom 10s Motion-Graphics Reel on `asra3.com`, publishes it natively to Facebook Reels, waits 15s, posts the clickable ATS/Apply link in the **1st comment**, and marks the job posted. **Static image posts are deactivated** (`publishFacebookPhoto` `disabled: true`). All 3 Foundation Pins (Video #7 + 1st comment, 7-Slide Obsidian-Gold Guide Album + 1st comment, Video #8 `ASRA3VIP` Reel + 1st comment) are LIVE. |
| **Instagram (`@asra3_jobs`)** | IG Business ID `17841466030342647` | **LIVE — 3 Foundation Pins + Automated Peak-Hour Reels (`≤ 3/day`)** | Token verified with `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `ads_management`, `ads_read`. Top-row 3 Foundation Pins (`Pin #1` Welcome Reel `DgBuboYgjSi`, `Pin #2` 7-Slide Obsidian-Gold Carousel `DgBuY85j2WW`, `Pin #3` `ASRA3VIP` Shield Reel `DgBuOo7DvoB`) + 1 verified live automated Job Reel (`DgBuE0nAoi5`) are LIVE. Automated IG Job Reels wired into `n8n` with peak Gulf windows (`07–10`, `11–15`, `19–22` GST), `3.5h` min spacing, and daily warmup cap (`instagramDailyCap=3`). |
| **VPS Reel Render Engine** | `GET /api/reel/job/[slug]` & `?prepare=1` | **LIVE (`200 OK`, MP4)** | Zero-Chrome Satori (`next/og`) + Alpine `ffmpeg 8.1.3` inside `asra3-web` renders 7 crisp Arabic/English RTL layers over a 10s Dubai twilight skyline Ken Burns loop + Cinema SFX bed (`1080×1920`, `30 FPS`, H.264 + AAC `48kHz`, ~29–39s cold / <15ms cached). |
| **Hosted Social Media Route** | `GET/HEAD /api/social-media/[filename]` | **LIVE (`200 OK`, Range `206`)** | Serves `.data/social-media/` Carousel JPEGs (`1080×1350`) and 48kHz Hero MP4s over HTTPS with strict filename allowlist & traversal protection for Meta Graph API ingestion. |
| **SEO / Link-Preview Cards** | `GET /api/og/job/[slug]` | **LIVE (SEO Only)** | Serves OpenGraph link previews on WhatsApp/X/LinkedIn/Search when job links are shared; no longer posted as static Facebook feed images. |
| **n8n Autopilot Workflow** | `dNPNQ2IwS6LdzoXX` on `n8n.asra3.com` | **Active (`errorCount: 0`, `4h` cadence)** | Orchestrates harvest → queue → render → Facebook 3-phase Reels + 1st comment → Gulf peak-slot & daily-cap gate → Instagram Reels create + bounded status poll (up to 140s) + publish → DB callback (`fb_post_id` + `ig_post_id`). Repo template tracked at `n8n-workflows/asra3-jobs-facebook-autopilot.json`. |

### Environment Variables Reference
- Local: `d:\WAZAYEF\.env.local` (git-ignored)
- Production VPS: `/www/wwwroot/asra3-wazayef/.env` (`contabo-root`)
- Keys:
  - `N8N_WEBHOOK_SECRET`
  - `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_SOCIAL_MODE=reels`
  - `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_USERNAME`, `INSTAGRAM_ACCESS_TOKEN`

---

## 2. Full Technical Flow & Graph API Runbook

```
[2h / 4h Schedule in n8n]
        │
        ▼
POST https://asra3.com/api/webhooks/jobs-harvest
        │   (scrapes GCC openings & runs DNS MX HR email checks)
        ▼
GET  https://asra3.com/api/webhooks/jobs-social?limit=1
        │   Returns: reel_prepare_url, reel_video_url, comment_keyword,
        │            facebook_reel_caption, facebook_first_comment, canonical_url
        ▼
GET  https://asra3.com/api/reel/job/{slug}?prepare=1   [header: x-webhook-secret]
        │   Renders 1080×1920 10s MP4 via src/lib/job-reel-renderer.ts
        │   Caches atomically in /app/.data/reels/ (24h TTL, serial queue)
        ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │ BRANCH A — FACEBOOK REELS (LIVE NOW)                                │
  │ 1. POST /v21.0/{FACEBOOK_PAGE_ID}/video_reels {upload_phase:"start"}│
  │ 2. POST {upload_url} (rupload) Headers:                             │
  │    Authorization: OAuth {TOKEN}, file_url: {reel_url}               │
  │ 3. POST /v21.0/{FACEBOOK_PAGE_ID}/video_reels                       │
  │    {upload_phase:"finish", video_state:"PUBLISHED", description:...}│
  │ 4. Wait 15s (processing)                                            │
  │ 5. POST /v21.0/{FACEBOOK_PAGE_ID}_{post_id}/comments  (1st comment!)│
  └─────────────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────────────┐
  │ BRANCH B — INSTAGRAM REELS (READY TO WIRE IN PHASE 2)               │
  │ 1. POST /v21.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media                │
  │    {media_type:"REELS", video_url, caption, share_to_feed:true}     │
  │ 2. Wait 20s → GET /v21.0/{creation_id}?fields=status_code until     │
  │    status_code === "FINISHED"                                       │
  │ 3. POST /v21.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish        │
  │    {creation_id}                                                    │
  └─────────────────────────────────────────────────────────────────────┘
        │
        ▼
POST https://asra3.com/api/webhooks/jobs-social
     { id: job.id, fb_post_id: "{page_id}_{post_id}" }
```

### Additional Meta Graph API Flows Supported by Your Granted Permissions

#### A. Instagram Carousel (`1080×1350` Obsidian-Gold Slides — Highest Saves)
1. For each slide PNG/JPG URL (`2..10` slides):
   `POST https://graph.facebook.com/v21.0/{IG_ID}/media` with `{ image_url, is_carousel_item: true, access_token }` → collect `child_id[]`.
2. Create parent container:
   `POST https://graph.facebook.com/v21.0/{IG_ID}/media` with `{ media_type: "CAROUSEL", children: child_id.join(","), caption, access_token }`.
3. Publish:
   `POST https://graph.facebook.com/v21.0/{IG_ID}/media_publish` with `{ creation_id, access_token }`.

#### B. Instagram Stories (`9:16` Vertical — Daily Urgency & Poll Stickers)
1. Image Story: `POST /v21.0/{IG_ID}/media` `{ media_type: "STORIES", image_url, access_token }` → `/media_publish`.
2. Video Story (e.g., clipping our 10s Reel): `POST /v21.0/{IG_ID}/media` `{ media_type: "STORIES", video_url, access_token }` → poll `FINISHED` → `/media_publish`.
3. *Note:* Interactive Link Stickers & Poll Stickers are best added manually via Meta Business Suite / Instagram App in ~30 seconds/day so click tracking and notifications behave natively.

#### C. Free Native Comment-to-DM Funnel (`n8n` — Replaces Paid ManyChat)
Because your Instagram token already has `instagram_manage_comments` + `instagram_manage_messages`:
1. Trigger on Instagram/Facebook webhook (or poll recent media comments every 5 minutes in `n8n`).
2. When a user comments a city/offer keyword (`دبي`, `الرياض`, `الدوحة`, `الكويت`, `VIP`, `ATS`, `CV`):
   - **Public Reply** (`POST /{comment_id}/replies`): `"أرسلنا لك رابط التقديم وفحص الـ ATS مجاناً في الرسائل الخاصة 📩"` (keeps algorithm momentum high!).
   - **Private DM** (`POST /{IG_ID}/messages` with `{ recipient: { comment_id }, message: { text } }`): sends the direct apply link + free ATS scan link (`https://asra3.com/jobs/...?utm_source=instagram&utm_medium=dm&utm_campaign=comment_trigger`) + mentions `ASRA3VIP` (`20% OFF`).
   - *Rule:* Instagram Private Replies must fire within **24 hours** (ideally < 60 seconds) of the comment, using `{ comment_id }` as recipient so no prior DM opt-in is required!

---

## 3. Why Reels + Carousels + Stories Together Win (And How You Grow From 0)

Posting **only** job openings turns any page into a dry bulletin board. Growth comes from balancing **Reach (Reels)** + **Saves/Shares (Carousels)** + **Trust & Conversion (Cinema Ads + Stories)**:

| Pillar | Share of Feed | Primary Role in Funnel | Why Meta Rewards It |
|---|---|---|---|
| **1. Automated 10s Job Reels** | **50%** | **Reach & Comments** | Short 10s runtime drives >90% watch-completion + rewatch loops while people read skills & QR code + city keyword comments trigger algorithmic push. |
| **2. Educational GCC Career Carousels (`4:5` `1080×1350`)** | **25%** | **Saves & Follows** | Saves are the #1 follower-growth signal on Instagram & Facebook feed. Viewers follow because you teach *how* to beat ATS & reach real Gulf HR inboxes, not just list jobs. |
| **3. Cinema Hero Promo Reels (`video-studio`)** | **15%** | **Paid Conversions (`Launch 129`, `Turbo 229`, `Hyper 349`, `ASRA3VIP`) + B2B (`/employers`)** | Showcases the real iPhone UI, AI cover letter, 100% Employer Exclusion Shield, and direct HR inbox delivery with original Google Lyria music & cinema SFX. |
| **4. Social Proof, Polls & Daily Stories** | **10% + Daily Stories** | **Trust & DM Closing** | ATS score transformations (`49% → 96%`), hiring breakdowns by country (`AE 1,450+ / SA 2,100+ / QA 820+ / KW 640+`), and clickable Link Stickers convert lurkers. |

### 10 High-Save Carousel Topics Ready to Render (Obsidian-Gold `1080×1350`)
1. **5 أسباب تخلي سيرتك الذاتية تترفض قبل ما يقرأها الـ HR في الخليج** *(5 ATS mistakes + Slide 7 CTA: Free scan on Asra3)*
2. **حقيقة رواتب المالية والمحاسبة في دبي والرياض 2026 بالأرقام** *(Real salary ranges in AED/SAR)*
3. **الفرق بين التقديم العشوائي وإرسال السيرة مباشرة لبريد HR مفحوص DNS MX** *(Visual proof of inbox delivery vs black-hole job portals)*
4. **كيف تقدّم لوظائف الخليج بدون ما يعرف مديرك الحالي نهائياً** *(100% Current-Employer Exclusion Shield explainer)*
5. **أكثر 7 كلمات مفتاحية يبحث عنها مدراء التوظيف في الإمارات والسعودية هذا الشهر** *(Keyword checklist for ATS 90%+)*
6. **دليل المقابلة وخطاب التقديم الذكي: لماذا 3 أضعاف الردود؟** *(Cover letter template + Asra3 AI sample)*
7. **تريد التقديم على 500+ شركة في الرياض أو دبي في 3 دقائق؟ شاهد الخطة** *(Step-by-step wizard breakdown: Launch / Turbo / Hyper)*
8. **لأصحاب الشركات و HR في الخليج: انشر شواغرك مجاناً على Google Jobs وفيسبوك في 60 ثانية** *(B2B acquisition for `/employers`)*
9. **أين تتوظف أسرع في الخليج؟ مقارنة دبي vs الرياض vs الدوحة vs الكويت** *(Saveable GCC sector & demand map)*
10. **عرض الإطلاق الخاص: خصم 20% بكود `ASRA3VIP` — مقارنة الباقات والأرقام** *(Clean breakdown of 129 / 229 / 349 before discount)*

---

## 4. Stable Weekly Operating Schedule (Peak Gulf Time — GST / UTC+4)

> **Critical Facebook Timing Fix:** Right now `n8n` triggers every `2h` (up to 12 Reels/day). Once queue depth grows, **change `scheduleEvery3h` interval from `2h` to `4h` (5–6 automated Job Reels/day during waking hours `08:00–22:00 GST`)** so each Reel gets breathing room to accumulate watch time and comments instead of cannibalizing its own reach.
>
> **Critical Instagram Warmup Rule:** `@asra3_jobs` starts at **`0` followers and `0` posts**. Do **NOT** blast 12 automated Reels/day on Day 1. Follow the Week 1–2 warmup cadence below, then settle into this steady rhythm:

| Day | Morning (`09:30 GST`) | Afternoon (`13:30 GST`) | Prime Evening (`20:00 GST`) | Stories (3–4 Frames Across Day) |
|---|---|---|---|---|
| **Mon** | Auto Job Reel — **UAE / Dubai** | **Carousel #1** (ATS Mistakes / Saves) | Auto Job Reel — **Saudi / Riyadh** | Poll: *"كم رسالة رد HR وصلتك آخر شهر؟"* + Job Link Sticker |
| **Tue** | Auto Job Reel — **Finance / Tech** | **Hero Promo Reel (`Video #7` Live Jobs)** | Auto Job Reel — **Qatar / Doha** | Behind-the-scenes ATS `49% → 96%` screen + Link |
| **Wed** | Auto Job Reel — **Engineering / PM** | **Carousel #2** (2026 GCC Salary Guide) | Auto Job Reel — **Kuwait / Sales** | Quick Quiz: *"أهم خانة في السيرة؟"* + Job Drop Sticker |
| **Thu** | Auto Job Reel — **Saudi / Jeddah** | **Hero Promo Reel (`Video #8` ASRA3VIP 20% OFF)** | Auto Job Reel — **UAE / Abu Dhabi** | **Flash Offer `ASRA3VIP` Countdown Sticker** + Proof |
| **Fri** | *(Light Morning)* Jumu'ah / Career Mindset Story | **Carousel #3** (Weekly Top Verified Companies) | Auto Job Reel — **Top High-Salary Role** | *"شواغر الأسبوع الموثقة 🔥"* Digest + Direct Links |
| **Sat** | Auto Job Reel — **Remote / Hybrid** | **Hero Promo Reel (`B2B /employers`)** or Shield Ad | Auto Job Reel — **GCC Executive Role** | Employer CTA (`انشر وظيفتك مجاناً`) + Poll |
| **Sun** | Auto Job Reel — **High-Demand UAE/KSA** | **Carousel #4** (Direct HR Email Formula) | Auto Job Reel — **Fresh Harvested Vacancy** | Sunday Career Reset checklist + Free CV Scan link |

### Steady-State Cadence Targets (After Week 2 Warmup)
- **Facebook Page (`Asra3`):** `5–6` automated 10s Job Reels/day (`4h` interval) + `3–4` Carousels/week + `2` Cinema Hero Reels/week.
- **Instagram (`@asra3_jobs`):**
  - *Week 1 (Manual Warmup):* Publish **3 Pinned Posts first** (see checklist below), then `2 Reels/day` + `1 Carousel every 2 days`.
  - *Week 2:* Enable automated IG Job Reels capped at `2–3/day` alongside `3 Carousels/week`.
  - *Week 3+:* Steady `3–4 Reels/day` + `4 Carousels/week` + daily 3–4 Stories + automated Comment-to-DM.

---

## 5. `@asra3_jobs` 0 → 10K Launch Checklist & Rules

### Profile Setup (Do Before Turning On Automated IG Posting)
1. **Profile Name (Searchable SEO):** `Asra3 أسرع | وظائف الخليج 🇦🇪🇸🇦🇶🇦🇰🇼`
2. **Bio (4 Crisp Lines):**
   - `⚡ وظائف حقيقية في الإمارات والسعودية وقطر والكويت`
   - `🛡️ بريد HR مفحوص DNS MX — بدون وسطاء أو إعلانات وهمية`
   - `🤖 افحص الـ ATS ووزّع سيرتك على 5,000+ شركة مباشرة`
   - `👇 شواغر اليوم الموثقة + فحص السيرة مجاناً:`
3. **Bio Link:** `https://asra3.com/jobs?utm_source=instagram&utm_medium=bio&utm_campaign=profile`
4. **4 Branded Obsidian-Gold Story Highlights:**
   - `وظائف اليوم` (Best Job Reels)
   - `فحص ATS` (CV Score transformations & tips)
   - `النتائج` (Verified delivery reports / employer shield)
   - `للشركات` (`/employers` 100% free posting)
5. **The 3 Pinned Foundation Posts (Top Row Always Visible):**
   - **Pin 1 (Middle/Left Hero Reel):** *"أهلاً بك في أسرع — كيف تتوظف أسرع في الخليج بدون إعلانات وهمية"* (`Video #7` + clear CTA to comment `أسرع` or `دبي`).
   - **Pin 2 (Carousel):** *"كيف تفحص سيرتك مجاناً وترسلها لـ 5,000+ شركة موثقة بالخليج (Launch / Turbo / Hyper)"*.
   - **Pin 3 (Offer / Trust Reel):** **Exclusion Shield + Flash Offer `ASRA3VIP` (20% OFF)** explaining why your current boss never sees your CV.

### Copy, Hashtag & Algorithm Rules
- **NEVER put an external URL inside Facebook or Instagram main captions.** Always direct viewers either to **comment the city keyword** (`دبي`, `الرياض`, `الدوحة`, `الكويت`) or check the **first comment (Facebook)** / **bio link & DM (Instagram)**.
- **Keep hashtags hyper-relevant (4–6 max on IG, 5–8 on FB):** mix Arabic + English market tags (`#وظائف_دبي`, `#وظائف_السعودية`, `#وظائف_الخليج`, `#DubaiJobs`, `#SaudiJobs`, `#Asra3`), zero banned/spammy `#fyp #viral` bloat.
- **First 15 Minutes Engagement Rule:** Reply to every comment (`شكراً لك! تم إرسال الرابط في الرسائل 📩`) — double comments in the first 15 minutes signal Meta to push the Reel to non-followers.
- **Keep Job Reels Short (`10s`):** Viewers naturally replay while scanning the QR code & salary badge, driving >100% average watch time.

---

## 6. Weekly KPI Scorecard

| Metric | Week 1–2 Baseline | Healthy Target (Day 30+) | Where to Check |
|---|---|---|---|
| **Reel Avg Watch Time / Completion** | `≥ 75%` of `10s` | **`> 95%` (replays)** | Meta Business Suite Insights |
| **Carousel Save Rate** | `≥ 2%` of reach | **`5%+` saves per impression** | Instagram Professional Dashboard |
| **Comment Keyword Rate** | `3–5` comments / Reel | **`15+` triggered comments / day** | Page / IG Inbox & Comments |
| **Job Page Traffic (`utm_source=facebook/instagram`)** | `50–150` visits/wk | **`500–1,500+` visits/wk** | GA4 (`G-M6784VRK96`) |
| **Free ATS CV Scans** | `10+ / week` | **`50+ / week`** | `/admin` Overview / `asra3.com` |
| **Paid Package Orders (`Launch / Turbo / Hyper`)** | First organic sales | **Repeatable daily ROAS + DM closes** | `/admin` Campaigns & EasyKash |

---

## 7. 30-Day Execution Roadmap & Reusable Prompts

| Phase | Timeline | Exact Actions |
|---|---|---|
| **Week 1 — Foundation & Cadence Tune** | Days 1–7 | 1) Set up `@asra3_jobs` bio, highlights, and publish 3 Pinned Posts. 2) Change `dNPNQ2IwS6LdzoXX` schedule on `n8n` from `2h` → `4h` so Facebook gets 5–6 high-reach Reels/day instead of 12. 3) Keep automated Reel + 1st comment running and inspect top-performing GCC cities. |
| **Week 2 — Wire Instagram Reels Autopilot + Carousels** | Days 8–14 | 1) Update `jobs-social` + `n8n` to publish `2–3` automated Job Reels/day to `@asra3_jobs` during peak hours (`09:30`, `14:00`, `20:00 GST`) using `INSTAGRAM_BUSINESS_ACCOUNT_ID`. 2) Render & publish 3 Obsidian-Gold `1080×1350` educational Carousels (`satori` engine). |
| **Week 3 — Free Native Comment-to-DM Funnel** | Days 15–21 | 1) Build the free `n8n` Comment-to-DM workflow listening to FB + IG keyword comments (`دبي`, `الرياض`, `الدوحة`, `الكويت`, `VIP`). 2) Auto-reply publicly + DM direct apply URL + `ASRA3VIP` (`20% OFF`). |
| **Week 4 — Paid Retargeting & Scale (`ads_management`)** | Days 22–30 | 1) Promote top-performing Hero Promo Reel (`Video #8 ASRA3VIP` & `Video #7`) with custom **Google Lyria** music tracks. 2) Retarget Reel viewers (50%+ watch), IG profile engagers, and `/jobs` visitors in AE/SA/QA/KW via Meta Ads Manager. |

### Ready-to-Use Prompts (Copy & Send Anytime)
- **Activate Instagram Reels Autopilot:**  
  `"Follow docs/SOCIAL-GROWTH-AUTOPILOT-PLAYBOOK.md and wire automated Instagram Job Reels (using INSTAGRAM_BUSINESS_ACCOUNT_ID & INSTAGRAM_ACCESS_TOKEN, capped at 2-3/day during warmup) into our n8n workflow and jobs-social endpoint, then run one live test on @asra3_jobs."`
- **Build & Publish This Week's Carousels (`1080×1350`):**  
  `"Build the first 3 Obsidian-Gold 1080x1350 Carousel posts from Section 3 of docs/SOCIAL-GROWTH-AUTOPILOT-PLAYBOOK.md using Satori (zero Chrome), preview all slides via QA, and publish Pin #2 to @asra3_jobs + Facebook Page."`
- **Activate Free Comment-to-DM Bot:**  
  `"Build the n8n Comment-to-DM workflow from docs/SOCIAL-GROWTH-AUTOPILOT-PLAYBOOK.md Section 2C using our Facebook & Instagram tokens so anyone commenting دبي / الرياض / الدوحة / الكويت / VIP automatically gets a public reply and DM with the apply link + ASRA3VIP offer."`
- **Tune Facebook Posting Cadence (`2h → 4h`):**  
  `"Update n8n workflow dNPNQ2IwS6LdzoXX schedule trigger from every 2 hours to every 4 hours (and add a waking-hours check if helpful) per docs/SOCIAL-GROWTH-AUTOPILOT-PLAYBOOK.md."`
