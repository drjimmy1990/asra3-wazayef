# Asra3.com Promotional Video Studio (`video-studio`)

Code-driven motion graphics studio built with **Remotion 4 (`4.0.544`)**, combining official **`remotion-dev/skills`** (`remotion-best-practices`, `remotion-markup`, `remotion-captions`, `remotion-interactivity`, `remotion-render`) and **`kaventro/motion-designer`** beat-first storyboard architecture.

---

## Compositions Registered

| ID | Dimensions | FPS | Duration | Target Placement |
|---|---|---|---|---|
| `Asra3-Feed-4x5` | `1080 × 1350` | `30` | `1080 frames` (`36.0s`) | **Facebook Feed (Optimal Mobile 4:5)** |
| `Asra3-Reels-9x16` | `1080 × 1920` | `30` | `1080 frames` (`36.0s`) | **Facebook & Instagram Reels / Stories** |
| `Asra3-Poster-4x5` | `1080 × 1350` | `Still` | `1 frame` | **Video Cover Thumbnail** |

---

## Measured Audio Beat Map (`voiceover.wav` — 34.32s @ 24kHz)

| Act | Frames (`30fps`) | Time Window | Action & Narration Sync |
|---|---|---|---|
| `01-Hook` | `0 → 141` | `0.00s → 4.70s` | Overcrowded portal stack (`1,248+ متقدم`) → Carbon/Gold Velocity Dart wipe |
| `02-Arrival` | `141 → 336` | `4.70s → 11.20s` | Framed `asra3.com` Hero Console, `5,010+` verified companies, `"خلال 3 دقائق"` badge |
| `03-ATS-Audit` | `336 → 540` | `11.20s → 18.00s` | PDF CV drop → Circular Gauge sweeps `58% → 96%` → Tailored AI Cover Letter reveal |
| `04-GCC-Markets` | `540 → 681` | `18.00s → 22.70s` | Country & city selector checks `AE`, `SA`, `QA`, `KW` aligned to spoken country names |
| `05-Privacy-Shield` | `681 → 807` | `22.70s → 26.90s` | Domain `@my-current-company.ae` + pointer click locks `100% Blocked` shield |
| `06-Live-Ledger` | `807 → 915` | `26.90s → 30.50s` | Live HR Delivery Ledger (`300/300` placed, rows flip to `فُتح من مسؤول التوظيف ✓`) |
| `07-EndCard` | `915 → 1080` | `30.50s → 36.00s` | `Asra3Logo` lockup, starting tier badge, `EasyKash DirectPayV1 Verified`, `asra3.com` CTA |

---

## Audio & Font Sources (`rights.md` Disclosure)

- **Voiceover (`public/audio/voiceover.wav`):** Supplied by user from Google AI Studio (`34.320s`, `-0.9 dBFS` peak). Commercial usage governed by Google AI Studio terms for your account.
- **Music Bed & UI SFX (`public/audio/ambient-pulse.wav`, `sfx-swoosh.wav`, `sfx-click.wav`, `sfx-pop.wav`, `sfx-chime.wav`):** Procedurally synthesized offline via Python PCM waveform math (original zero-copyright assets, no external stock tracks or CDNs).
- **Fonts (`public/fonts/*.woff2`):** Self-hosted `IBM Plex Sans Arabic`, `Plus Jakarta Sans`, and `Cormorant Garamond` copied cleanly from the main Asra3 web app.

---

## Commands

```bash
cd video-studio

# 1. Interactive timeline & prop editing in Remotion Studio
npm run dev

# 2. Typecheck & Remotion ESLint verification
npm run lint

# 3. Re-render Facebook Feed (4:5) & Reels (9:16) MP4 exports
npx remotion render Asra3-Feed-4x5 out/asra3-facebook-feed-4x5.mp4 --codec=h264 --pixel-format=yuv420p --crf=18
npx remotion render Asra3-Reels-9x16 out/asra3-facebook-reels-9x16.mp4 --codec=h264 --pixel-format=yuv420p --crf=18
npx remotion still Asra3-Poster-4x5 out/asra3-poster-4x5.png
```
