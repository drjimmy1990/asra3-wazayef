# Asra3.com (أسرع) — Multi-Platform Video & Social Marketing Plan

> **For Campaign Execution:** Combines **Content Strategy (`agency-content-creator`)**, **Programmatic Video (`remotion-dev/skills`)**, and **Storyboard Choreography (`kaventro/motion-designer`)** across **Facebook Feed (`4:5`)**, **TikTok / Instagram Reels (`9:16`)**, **LinkedIn (`16:9` / Carousels)**, and **X**.
>
> **Goal:** Drive high-intent GCC job seekers (`AE / SA / QA / KW`) to scan their CV free at `https://asra3.com/#wizard-section` and preview live HR delivery proof at `/track/demo-uae-campaign-2026`.
>
> **Architecture:** Isolate all creative assets inside `video-studio/` (`100%` detached from production Next.js Docker deploys), pair every video batch with Google AI Studio Arabic voiceovers + self-hosted `IBM Plex Sans Arabic` / `Plus Jakarta Sans` typography, and reuse Remotion `<BrowserFrame>`, `<BrandLockup>`, and `<ArabicCaptions>` modules.

---

## 1. Platform Safe-Zone & Format Specifications (Updated)

| Platform Placement | Remotion ID | Canvas Size | Caption Offset (`ArabicCaptions`) | Stage Clearance Padding | Export Settings |
|---|---|---|---|---|---|
| **TikTok / IG Reels / FB Reels / YouTube Shorts** | `Asra3-Reels-9x16` | `1080 × 1920` (`9:16`) | `bottom: 500px`, `left: 96px`, `right: 96px` *(centered)*, `fontSize: 44px` | `padding: 125px 70px 615px` *(clears top nav `~125px`, centered bottom caption + TikTok CTA `~500px`)* | `H.264`, `yuv420p`, `30fps`, `crf 18`, `48kHz AAC` |
| **Facebook / Instagram Feed** | `Asra3-Feed-4x5` | `1080 × 1350` (`4:5`) | `bottom: 54px`, `insetInline: 48px`, `maxWidth: 940px` | `padding: 48px 52px 175px` | `H.264`, `yuv420p`, `30fps`, `crf 18`, `48kHz AAC` |
| **LinkedIn / Carousel Slides (`<Still>`)** | `Asra3-Carousel-*` | `1080 × 1350` (`PNG`) | N/A (Clean Headline + UI Card) | Carbon `#09090B` + Gold `#D4AF37` + Platinum `#EEF0F4` | Multi-slide high-DPI `.png` |

---

## 2. Four Core Messaging Pillars (Grounded in Real Asra3 Features)

1. **ATS Keyword Rejection Fix:** Most candidates never reach a human recruiter due to poor ATS formatting (`58% → 96%` real CV text parse & upgrade + bespoke Executive AI Cover Letter).
2. **Confidentiality / Stealth Career Switch:** Active GCC professionals can exclude their current employer domain `100%` before checkout so they explore upgrades confidentially.
3. **Hyper-Localized GCC HR Directory:** `5,010+` verified Gulf HR contacts segmented cleanly by country and city (`AE 1,450+`, `SA 2,100+`, `QA 820+`, `KW 640+`) with local billing (`AED`, `SAR`, `QAR`, `KWD`, `USD`, `EGP`).
4. **radical Transparency & Direct `Reply-To`:** Live tracking ledger (`/track` & `ASR-` tracking codes) showing every company dispatched + HR opens, while replies go straight to the candidate's personal inbox, backed by transparent one-time fees starting from `129 AED / SAR / QAR` (`11 KWD`) via EasyKash DirectPayV1.

---

## 3. Multi-Video Series Roadmap & Ready-to-Record AI Studio Scripts

> **Google AI Studio Voice Settings for Videos #2–#5:**
> - **Voice:** Same voice chosen for Video #1 (**Orus** or **Charon**) for consistent brand recall across all paid ads.
> - **Style Instructions:** `"Confident, warm, and authoritative commercial narrator speaking clean Gulf-friendly Arabic. Crisp pronunciation, modern executive advertisement tone, steady pace with natural pauses where marked."`

### Video #2 — *"The ATS Black Hole"* (`24–26s` · Cold-Traffic Scroll-Stopper)
- **Angle / Hook:** Addresses why strong Gulf candidates hear nothing back (`"ليش الـ CV القوي يترافض قبل ما حد يقرأه؟"`).
- **Placements:** TikTok Spark Ad + Reels + Facebook Feed.
- **Visual Remotion Storyboard (`video-studio/src/Video02AtsPain.tsx`):**
  - `0.0s–5.0s`: Dark red-bordered `"ATS Auto-Rejected: 49%"` scanner laser sweeps across a generic multi-column CV -> shatters cleanly with Gold Dart wipe.
  - `5.0s–13.5s`: Real `asra3.com` Step-2 parser extracts clean skills, `RadialProgressGauge` leaps `49% → 96% ATS`, and `"خطاب تقديم تنفيذي مخصص ✓"` attaches automatically.
  - `13.5s–20.5s`: Fast horizontal burst across verified HR mailboxes (`Reply-To: candidate@email.com` + `3× أسرع للمقابلات`).
  - `20.5s–25.0s`: `Asra3Logo` End Card — Free ATS Scan CTA.
- **Copy-Paste Script for Google AI Studio:**
```text
تعرف ليش سيرتك الذاتية تنرفض قبل ما أي مسؤول توظيف يقرأها؟ <short pause>
أنظمة الفرز الآلي ترفض نص الملفات من أول ثانية. <short pause>
على منصة أَسْرَعْ دُوتْ كُومْ، <short pause> افحص سيرتك مجاناً لأنظمة الإيه تي إس، <short pause> وخلي الذكاء الاصطناعي يجهّز خطاب تقديم احترافي يرفع فرصك لثلاثة أضعاف. <short pause>
ابدأ الفحص المجاني الآن على أَسْرَعْ دُوتْ كُومْ.
```

---

### Video #3 — *"Stealth Career Upgrade / Employer Exclusion Shield"* (`25s` · Retargeting & Senior Candidates)
- **Angle / Hook:** Solves the #1 objection among currently employed senior engineers, managers, and finance leads.
- **Placements:** LinkedIn Video Ad + Facebook Retargeting (`4:5`) + TikTok (`9:16`).
- **Visual Remotion Storyboard (`video-studio/src/Video03StealthShield.tsx`):**
  - `0.0s–5.5s`: Executive looking at office clock badge (`تعمل حالياً في الخليج وتبحث عن فرصة أكبر؟`) -> warning modal (`خايف إيميلك يوصل لقسم الـ HR في شركتك؟`).
  - `5.5s–16.0s`: Zoom cleanly into `Step 4: درع استثناء جهة العمل الحالية` inside `BrowserWindow`: typing `@my-employer.ae` -> Cursor flips Gold Lock toggle ON (`100% Blocked`) -> 299 competitors receive CV while current employer sits greyed-out `BLOCKED`.
  - `16.0s–25.0s`: Tracking Ledger shows interview notification card + `asra3.com` CTA.
- **Copy-Paste Script for Google AI Studio:**
```text
شغّال حالياً وتبغى تنتقل لفرصة أفضل في الخليج... <short pause> بس خايف سيرتك توصل لمديرك؟ <short pause>
مع درع الخصوصية في أَسْرَعْ دُوتْ كُومْ، <short pause> اكتب نطاق شركتك الحالية فقط... <short pause> والنظام يحجبها تماماً بنسبة مئة بالمئة، <short pause> ويوصل ملفك لباقي الشركات الموثقة بسرية تامة. <short pause>
قدّم بثقة وخصوصية على أَسْرَعْ دُوتْ كُومْ.
```

---

### Video #4A — *"UAE Market Sniper (Dubai & Abu Dhabi)"* (`20s` · Localized UAE Ad Set)
- **Angle / Hook:** Dedicated geo-ad for candidates inside UAE or relocating to Dubai (`DIFC` / `Business Bay`) and Abu Dhabi (`ADGM`). Shows `1,450+` UAE employers and starting `129 د.إ` one-time pricing.
- **Copy-Paste Script for Google AI Studio:**
```text
تبحث عن وظيفة في دبي أو أبوظبي أو الشارقة؟ <short pause>
بدل شهور الانتظار... <short pause> أوصل سيرتك مباشرة إلى أكثر من ألف وأربعمئة وخمسين شركة موثقة في الإمارات، <short pause> بدفعة واحدة تبدأ من مئة وتسعة وعشرين درهم، بدون أي اشتراكات. <short pause>
ابدأ حملتك الآن على أَسْرَعْ دُوتْ كُومْ.
```

---

### Video #4B — *"Saudi Vision 2030 Market Sniper (Riyadh, Jeddah & NEOM)"* (`20s` · Localized KSA Ad Set)
- **Angle / Hook:** Dedicated geo-ad targeting professionals aiming at Riyadh (`KAFD`), Jeddah, Dammam/Khobar, and NEOM (`2,100+` verified companies, starting `129 ر.س` via Visa/Mada/Apple Pay).
- **Copy-Paste Script for Google AI Studio:**
```text
مستهدف وظائف الرياض أو جدة أو الدمام ومشاريع رؤية عشرين ثلاثين؟ <short pause>
منصة أَسْرَعْ دُوتْ كُومْ توصل سيرتك وخطاب تقديمك مباشرة لأقسام الموارد البشرية في أكثر من ألفين ومئة شركة سعودية موثقة، <short pause> بدفعة واحدة عبر مدى وأبل باي والبطاقات البنكية. <short pause>
توظَّف أسرع اليوم عبر أَسْرَعْ دُوتْ كُومْ.
```

---

### Video #5 — *"No Ghosting / Live Tracking Ledger Walkthrough"* (`22s` · Bottom-of-Funnel Conversion Ad)
- **Angle / Hook:** Directly showcases `/track/demo-uae-campaign-2026` (the interactive demo page!) to convert skeptical visitors into paid orders.
- **Copy-Paste Script for Google AI Studio:**
```text
لما تقدم في المواقع التقليدية، <short pause> ما تدري إذا أحد فتح ملفك أصلاً. <short pause>
في أَسْرَعْ دُوتْ كُومْ، عندك لوحة تتبع حية خاصة برمز سري... <short pause> تشوف فيها كل شركة استلمت سيرتك، ومتى مسؤول التوظيف فتحها، <short pause> وكل الردود تجيك مباشرة على إيميلك الشخصي. <short pause>
جرّب المعاينة الحية الآن على أَسْرَعْ دُوتْ كُومْ.
```

---

## 4. Two-Week Marketing Posts Calendar & Ready Copy

| Day | Channel | Asset Format | Messaging Pillar | CTA Destination |
|---|---|---|---|---|
| **Day 1** | Facebook Feed + TikTok | **Video #1 (`4:5` Feed & `9:16` TikTok)** *(Rendered!)* | Full Platform Launch Overview | `https://asra3.com/#wizard-section` |
| **Day 2** | LinkedIn + Instagram | **Carousel #1 (`5` Remotion `<Still>` Slides, `1080×1350`)** — *"5 أسباب تخفي سيرتك عن مدير الـ HR في الخليج"* | ATS Pain & Quick Fix | Free CV Scan |
| **Day 3** | Facebook Community Groups (UAE/KSA Expats) | **Native Value Text Post + Screenshot of ATS Gauge** | ATS + Cover Letter | `https://asra3.com/ae` or `/sa` |
| **Day 5** | TikTok + IG Reels | **Video #2 (ATS Black Hole Hook, `9:16`)** | ATS Keyword Rejection | `https://asra3.com/#wizard-section` |
| **Day 7** | Facebook Page + X | **Graphic Poll / Comparison Post** — *"بوابات التوظيف التقليدية مقابل الإيداع المباشر عبر أسرع"* | Direct HR Inbox vs Job Boards | `/track/demo-uae-campaign-2026` |
| **Day 9** | LinkedIn + Facebook Feed | **Video #3 (Stealth Confidentiality Shield, `4:5` & `9:16`)** | Current-Employer Exclusion Shield | `https://asra3.com/#wizard-section` |
| **Day 11** | Instagram + LinkedIn | **Carousel #2 (`5` Slides)** — *"خريطة أقوى المدن والقطاعات الخليجية في 2026 (دبي، الرياض، الدوحة، الكويت)"* | Hyper-Localized GCC Hubs | `/ae` · `/sa` · `/qa` · `/kw` |
| **Day 12** | Geo Ads (Meta Ads Manager) | **Videos #4A (UAE) & #4B (KSA)** (`9:16` & `4:5`) | Geo-Localized Pricing (`129 د.إ / ر.س`) | Dedicated `/ae` & `/sa` hubs |
| **Day 14** | Retargeting (Warm Visitors 7d) | **Video #5 (Live Tracking Proof) + Testimonial Graphic Card** | Radical Transparency + `EasyKash` Trust | `/track/demo-uae-campaign-2026` |

### Ready-to-Publish Carousel Copy Template (`Carousel #1` — *"5 Reasons Your CV Is Ignored in the GCC"*)
- **Slide 1 (Cover):** `ليش سيرتك الذاتية القوية ما بتجيب مقابلات في الخليج؟ (5 أخطاء صامتة)`
- **Slide 2:** `1️⃣ التقديم وسط 1,000+ متقدم في إعلان عام — ملفك يدفن في آخر القائمة.`
- **Slide 3:** `2️⃣ عدم توافق الكلمات المفتاحية مع أنظمة الفرز الآلي (ATS) — يتم استبعادك آلياً.`
- **Slide 4:** `3️⃣ إرسال نفس الإيميل العام بدون خطاب تقديم (Cover Letter) تنفيذي مخصص للمسمى.`
- **Slide 5 (Solution + CTA):** `الحل في 3 دقائق: فحص ATS مجاني + خطاب ذكي + إيداع مباشر لصناديق بريد الـ HR في 5,010+ شركة خليجية — عبر Asra3.com`

---

## 5. Atomic Implementation Checklist (`video-studio/` Next Batch)

- [x] **Step 1 — Fix TikTok `9:16` Safe Zone & Captions (`DONE`):** Raised `ArabicCaptions` on `isReels` (`bottom: 430px`) and adjusted safe container padding (`140px 72px 560px`) across all 7 acts.
- [ ] **Step 2 — Generate AI Studio Voiceovers for Videos #2–#5:** Paste each script above into Google AI Studio (`Orus`/`Charon`) and save as `public/audio/v2-ats.wav`, `v3-stealth.wav`, `v4a-uae.wav`, `v4b-ksa.wav`, `v5-ledger.wav`.
- [ ] **Step 3 — Add Carousel `<Still>` Suite (`src/carousels/CarouselAts.tsx`):** Register 5 `1080×1350` `<Still>` slides in `Root.tsx` using existing `BrowserWindow` + `BrandMark` tokens and export clean `.png` slides.
- [ ] **Step 4 — Measure Waveform Beats & Scaffold Videos #2–#5:** Run our Python RMS speech segmenter on each `.wav`, register `Video02AtsPain`, `Video03StealthShield`, `Video04MarketSniper`, `Video05LedgerProof` in `Root.tsx` (`4:5` + `9:16`), and attach synced `ArabicCaptions` + ducking `ambient-pulse.wav`.
- [ ] **Step 5 — Visual QA (`remotion still`) + H.264 Batch Render:** Inspect stills at phone scale (`dir="rtl"` ligature + safe-zone check) and render final Facebook/TikTok MP4 packs into `video-studio/out/`.
