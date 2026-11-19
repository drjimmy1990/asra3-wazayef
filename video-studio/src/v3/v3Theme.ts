import type { CaptionSegment } from "../theme";

export const V3_TOTAL_FRAMES = 750; // 25.00s @ 30fps (23.30s VO + 1.70s CTA hold)

/**
 * Exact frame windows aligned to measured acoustic silences in v3-shield.wav (23.640s @ 24kHz):
 * - Act 01 Office Fear:       0   -> 186 (0.00s -> 6.20s)  [VO: 0.20s..5.70s, pause 5.70s..6.55s]
 * - Act 02 Domain Input:      186 -> 351 (6.20s -> 11.70s) [VO: 6.55s..11.40s, pause 11.40s..11.90s]
 * - Act 03 100% Blocked Lock: 351 -> 462 (11.70s -> 15.40s) [VO: 11.90s..15.05s, pause 15.05s..15.60s]
 * - Act 04 Stealth Dispatch:  462 -> 600 (15.40s -> 20.00s) [VO: 15.60s..19.50s, pause 19.50s..20.25s]
 * - Act 05 Executive EndCard: 600 -> 750 (20.00s -> 25.00s) [VO: 20.25s..23.30s + 1.70s Hold]
 */
export const V3_ACTS = {
  officeFear: { from: 0, duration: 186 },
  domainInput: { from: 186, duration: 165 },
  blockedLockout: { from: 351, duration: 111 },
  stealthDispatch: { from: 462, duration: 138 },
  endCard: { from: 600, duration: 150 },
} as const;

export const V3_CAPTION_SEGMENTS: ReadonlyArray<CaptionSegment> = [
  {
    startMs: 180,
    endMs: 3580,
    words: [
      { text: "شغّال", startMs: 180, endMs: 720, isAccent: true },
      { text: "حالياً", startMs: 720, endMs: 1260 },
      { text: "وتبغى", startMs: 1260, endMs: 1760 },
      { text: "تنتقل", startMs: 1760, endMs: 2260 },
      { text: "لفرصة", startMs: 2260, endMs: 2720, isAccent: true },
      { text: "أفضل", startMs: 2720, endMs: 3080, isAccent: true },
      { text: "في الخليج", startMs: 3080, endMs: 3580 },
    ],
  },
  {
    startMs: 3920,
    endMs: 5800,
    words: [
      { text: "بس", startMs: 3920, endMs: 4240 },
      { text: "خايف", startMs: 4240, endMs: 4640, isAccent: true },
      { text: "سيرتك", startMs: 4640, endMs: 5060 },
      { text: "توصل", startMs: 5060, endMs: 5400 },
      { text: "لمديرك؟", startMs: 5400, endMs: 5800, isAccent: true },
    ],
  },
  {
    startMs: 6500,
    endMs: 8850,
    words: [
      { text: "مع", startMs: 6500, endMs: 6820 },
      { text: "درع", startMs: 6820, endMs: 7240, isAccent: true },
      { text: "الخصوصية", startMs: 7240, endMs: 7820, isAccent: true },
      { text: "في", startMs: 7820, endMs: 8060 },
      {
        text: "Asra3.com",
        startMs: 8060,
        endMs: 8850,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 9260,
    endMs: 11480,
    words: [
      { text: "اكتب", startMs: 9260, endMs: 9720, isAccent: true },
      { text: "نطاق", startMs: 9720, endMs: 10160 },
      { text: "شركتك", startMs: 10160, endMs: 10640 },
      { text: "الحالية", startMs: 10640, endMs: 11100, isAccent: true },
      { text: "فقط", startMs: 11100, endMs: 11480 },
    ],
  },
  {
    startMs: 11860,
    endMs: 15120,
    words: [
      { text: "والنظام", startMs: 11860, endMs: 12500 },
      { text: "يحجبها", startMs: 12500, endMs: 13140, isAccent: true },
      { text: "تماماً", startMs: 13140, endMs: 13720 },
      { text: "بنسبة", startMs: 13720, endMs: 14220 },
      {
        text: "100%",
        startMs: 14220,
        endMs: 15120,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 15560,
    endMs: 18060,
    words: [
      { text: "ويوصل", startMs: 15560, endMs: 16060 },
      { text: "ملفك", startMs: 16060, endMs: 16540 },
      { text: "لباقي", startMs: 16540, endMs: 17020 },
      { text: "الشركات", startMs: 17020, endMs: 17560, isAccent: true },
      { text: "الموثقة", startMs: 17560, endMs: 18060, isAccent: true },
    ],
  },
  {
    startMs: 18420,
    endMs: 19600,
    words: [
      { text: "بسرية", startMs: 18420, endMs: 19040, isAccent: true },
      { text: "تامة", startMs: 19040, endMs: 19600, isAccent: true },
    ],
  },
  {
    startMs: 20200,
    endMs: 22150,
    words: [
      { text: "قدّم", startMs: 20200, endMs: 20680 },
      { text: "بثقة", startMs: 20680, endMs: 21180, isAccent: true },
      { text: "وخصوصية", startMs: 21180, endMs: 22150, isAccent: true },
    ],
  },
  {
    startMs: 22160,
    endMs: 23420,
    words: [
      { text: "على", startMs: 22160, endMs: 22540 },
      {
        text: "Asra3.com",
        startMs: 22540,
        endMs: 23420,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
];

export const getV3MusicDuckGain = (timeMs: number): number => {
  for (const seg of V3_CAPTION_SEGMENTS) {
    if (timeMs >= seg.startMs - 140 && timeMs <= seg.endMs + 160) {
      return 0.14;
    }
  }
  if (timeMs >= 23420) {
    return 0.4;
  }
  return 0.32;
};
