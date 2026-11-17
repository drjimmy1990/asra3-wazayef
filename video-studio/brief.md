# ASRA3.COM (أسرع): DIRECT TO HR

Promotional social launch film for **Asra3.com (أسرع)** — the AI-powered ATS CV Optimization and Direct Verified HR Email Distribution platform across the UAE, Saudi Arabia, Qatar, and Kuwait. Built declaratively in **Remotion** using real brand tokens, real UI layouts, self-hosted fonts, and audio-synced Arabic typography, with zero paid templates or stock footage.

---

<inputs>
Uses:
- Brand mark & vector geometry from `src/components/Asra3Logo.tsx` (Matte Carbon `#09090B` + Flat Sovereign Gold `#D4AF37` Velocity Dart emblem)
- Official self-hosted fonts from `public/fonts/` & `src/app/fonts.css`: `IBM Plex Sans Arabic`, `Plus Jakarta Sans`, `Cormorant Garamond`
- Verified copy, markets, and metrics from `src/lib/i18n.ts` and `src/lib/seed-data.ts` (`AE 1,450+`, `SA 2,100+`, `QA 820+`, `KW 640+` verified employers; `Starter 129`, `Pro 229`, `Hyper 349` AED/SAR/QAR)
- Recreated UI flows inside clean desktop/mobile device frames: Hero Dispatch Console, `DistributionWizard` Step 1 (GCC Market/City matrix), Step 2 (CV PDF Upload + `RadialProgressGauge` ATS score + AI Cover Letter), Step 4 (Confidentiality Exclusion Shield), and `/track` Live HR Delivery Ledger
- **Waiting on User Audio:** Arabic Gulf Commercial Voiceover (`.wav` / `.mp3` generated in Google AI Studio from the script below), placed at `video-studio/public/audio/voiceover.mp3` (or `.wav`)
- **Procedural Audio (`SFX`):** Synthesized `.wav` UI ticks, ATS radar sweep, shield lock click, delivery chime, mixed beneath the voiceover with automatic ducking
</inputs>

---

<direction>
**Visual Style:** *Brand-Native Sovereign Carbon & Alabaster* — fusing Asra3.com's Platinum light workspace (`#EEF0F4`, `#FFFFFF`), Pure Carbon terminal surfaces (`#09090B`, `#121215`, `#18181B`), and Solid Flat Sovereign Gold (`#D4AF37`). Zero gradients (avoiding H.264 color banding), zero decorative blur, zero glowing glassmorphism, and zero isolated Arabic letters.

**Typography & RTL Discipline:** Base direction `dir="rtl"` `lang="ar"` with word-level spring reveals (`arabic-text.md`). Mixed Latin identifiers (`Asra3.com`, `ATS`, `HR`, `AE / SA / QA / KW`, `%`) stay wrapped in explicit `dir="ltr"` mono badges so Chrome bidi ordering stays intact.

**Motion & Camera:** Driven strictly from `useCurrentFrame()` and `interpolate()` + `Easing.spring({ damping: 200 })` / `Easing.bezier(0.22, 1, 0.36, 1)`. Zero CSS transitions or Tailwind animation classes. Scenes link continuously: a cramped applicant card morphs cleanly into the crisp Asra3 Carbon terminal, which slides through Wizard Steps → Shield Lock → Live Ledger → Final Wordmark End Card.

**Pacing:** Designed first for mobile Facebook Feed (`4:5` / `1080×1350`) with generous 24–32 px card typography, ~33–36 seconds total runtime synced directly to the Google AI Studio voiceover sentence timestamps (`~0.8s–1.2s` breathing gaps between lines).
</direction>

---

<structure>
1. **Act 1 — The Hook (0.0s – 4.5s):** Light Alabaster canvas with subtle dot grid. A stacked job-portal card reads `1,000+ متقدم على نفس الإعلان`. The Gold Velocity Dart cuts vertically across to clear the queue and anchor **أسرع | Asra3.com**.
2. **Act 2 — Market Arrival & Direct HR Promise (4.5s – 9.8s):** Framed macOS-style browser window reveals Asra3's live Gulf coverage badges (`AE 1,450+`, `SA 2,100+`, `QA 820+`, `KW 640+`) totaling **5,010+ جهة توظيف موثقة**.
3. **Act 3 — Real ATS Audit & AI Cover Letter (9.8s – 15.0s):** Wizard Step 2 card animates PDF drop (`Senior_Engineer_CV.pdf`), `RadialProgressGauge` sweeps smoothly from `58%` to `96%`, and the tailored Executive Cover Letter card locks in.
4. **Act 4 — Gulf Country & City Precision Targeting (15.0s – 19.6s):** Country/city pill selector highlights Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, and Kuwait City with live verified employer counts updating deterministically.
5. **Act 5 — Current-Employer Confidentiality Shield (19.6s – 24.0s):** Confidentiality input types `current-employer.ae` and toggles the Sovereign Gold protection badge: `100% Blocked — السرية التامة`.
6. **Act 6 — Live HR Open Tracking Ledger (24.0s – 28.2s):** Carbon dispatch console streams verified HR delivery cards flipping to `Opened by HR ✓` (`Reply-To: candidate@email.com`).
7. **Act 7 — Executive End Card & CTA (28.2s – 33.5s):** Pulls back cleanly to Carbon `#09090B` + `Asra3Logo`, one-time payment note (`دفعة واحدة • بدون اشتراكات` + `EasyKash Verified`), and high-contrast Gold CTA button: **`افحص سيرتك مجاناً • asra3.com`**.
</structure>

---

<build>
- **Workspace Isolation:** Standalone Remotion project inside `d:\WAZAYEF\video-studio\` (never modifying root Next.js `package.json`, `next.config.ts`, or production Docker container builds).
- **Primary Composition:** `Asra3PromoFeed4x5` — `1080 × 1350` (Facebook Feed optimal 4:5), `30 fps`, Studio-editable props via Zod (`remotion-interactivity`).
- **Secondary Composition:** `Asra3PromoReels9x16` — `1080 × 1920` (Facebook/Instagram Reels 9:16), sharing the exact same scenes & responsive layout proportions.
- **Captions:** Bilingual / Arabic RTL synchronized bottom safe-zone word-by-word captions rendered using `Caption` JSON timing derived directly from the final AI Studio voiceover audio (`@remotion/captions` pattern).
- **Verification:** Open Remotion Studio preview, render key transition stills (`npx remotion still`) to inspect Arabic ligatures/ligature safety & legibility at phone size, then export final `H.264` (`yuv420p` + AAC stereo) MP4 when approved.
</build>

---

## Target Voiceover Beat Map (Before AI Studio Timing Lock)

| Beat | Window | Arabic Voiceover Line (VO) | On-Screen UI Action |
|---|---|---|---|
| `01` | `0.4s – 3.5s` | سيرتك قوية… <short pause> بس بتضيع وسط زحمة المواقع؟ | Queue counter `1,000+ Applicants` → Gold Dart clears screen |
| `02` | `5.0s – 9.0s` | مع أَسْرَعْ دُوتْ كُومْ، <short pause> توصل لمديري التوظيف مباشرة في ثلاث دقائق. | Asra3 Carbon Console opens; `5,010+` verified companies count up |
| `03` | `10.2s – 14.3s` | ارفع ملفك… <short pause> والنظام يرفع توافق الإيه تي إس، ويصيغ خطابك. | Step 2 CV drop → Gauge climbs `58% → 96%` → Cover letter chip |
| `04` | `15.5s – 19.0s` | اختر دولتك ومدنك عبر الإمارات، السعودية، قطر، والكويت. | Country switcher & city chips (`AE / SA / QA / KW`) tick in |
| `05` | `20.2s – 23.5s` | وبسرية تامة، <short pause> احجب شركتك الحالية بنقرة واحدة. | Current-Employer Exclusion Shield locks domain (`100% Blocked`) |
| `06` | `24.5s – 27.6s` | وتابع كل شركة فتحت ملفك لحظة بلحظة. | Live Tracking Ledger row flips to `Opened by HR ✓` |
| `07` | `28.8s – 32.5s` | ابدأ الآن على أَسْرَعْ دُوتْ كُومْ… <short pause> وتوظَّف أسرع. | End card lockup: `Asra3Logo` + `asra3.com` Gold CTA |

---

## Status
- **Current Step:** Production Render & Verification (`task-2415`) — Exporting H.264 `yuv420p` Facebook Feed (`4:5`) & Reels (`9:16`) MP4s + Poster still.
- **Done:** Isolated `video-studio/` from Next.js (`tsconfig.json`, `eslint.config.mjs`, `.dockerignore`, `.gitignore`), analyzed exact 12 speech segments from `voiceover.wav` (`34.32s`), synthesized procedural UI SFX & ducking beat bed (`ambient-pulse.wav`), loaded self-hosted `IBM Plex Sans Arabic` / `Plus Jakarta Sans` / `Cormorant Garamond`, built all 7 acts + word-synced RTL captions + Zod props, visually inspected rendered QA PNGs across all scenes, and wrote `README.md` & `out/facebook-ad-post.txt`.
- **Next:** Confirm final MP4 renders & file sizes and start Remotion Studio for optional live customization.
- **Open:** User review of `out/asra3-facebook-feed-4x5.mp4`, `out/asra3-facebook-reels-9x16.mp4`, and `out/facebook-ad-post.txt`.
