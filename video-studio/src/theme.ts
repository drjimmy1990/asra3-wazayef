export const THEME = {
  carbonBlack: "#09090B",
  carbonSurface: "#121215",
  carbonElevated: "#18181B",
  carbonBorder: "#27272A",
  carbonBorderStrong: "#3F3F46",

  platinumCanvas: "#EEF0F4",
  pureWhite: "#FFFFFF",
  alabaster: "#FAFAFA",
  mutedSurface: "#F4F5F8",
  lightBorder: "#DCDFE6",

  goldSolid: "#D4AF37",
  goldMutedInk: "#9A7B1C",

  textDarkPrimary: "#09090B",
  textDarkSecondary: "#52525B",
  textLightPrimary: "#FAFAFA",
  textLightSecondary: "#A1A1AA",
  alertCrimson: "#DC2626",

  fontArabic: '"IBM Plex Sans Arabic", "Plus Jakarta Sans", sans-serif',
  fontLatin: '"Plus Jakarta Sans", "IBM Plex Sans Arabic", sans-serif',
  fontEditorial: '"Cormorant Garamond", Georgia, serif',
  fontMono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as const;

export const FPS = 30;
export const TOTAL_DURATION_FRAMES = 1080; // 36.0s exact (34.32s VO + 1.68s end CTA hold)

/**
 * Scene frame windows calibrated directly from the measured Google AI Studio WAV
 * silence boundaries (in frames at 30 fps):
 * - Act 01 Hook:      0 -> 141  (0.00s -> 4.70s)  [VO pause at 4.20s..4.95s]
 * - Act 02 Arrival: 141 -> 336  (4.70s -> 11.20s) [VO pause at 10.85s..11.45s]
 * - Act 03 ATS:     336 -> 540  (11.20s -> 18.00s) [VO pause at 17.65s..18.25s]
 * - Act 04 Markets: 540 -> 681  (18.00s -> 22.70s) [VO pause at 22.30s..23.00s]
 * - Act 05 Shield:  681 -> 807  (22.70s -> 26.90s) [VO pause at 26.50s..27.15s]
 * - Act 06 Ledger:  807 -> 915  (26.90s -> 30.50s) [VO pause at 30.10s..30.85s]
 * - Act 07 EndCard: 915 -> 1080 (30.50s -> 36.00s) [Hold 34.00s..36.00s]
 */
export const ACTS = {
  hook: { from: 0, duration: 141 },
  arrival: { from: 141, duration: 195 },
  ats: { from: 336, duration: 204 },
  markets: { from: 540, duration: 141 },
  shield: { from: 681, duration: 126 },
  ledger: { from: 807, duration: 108 },
  endCard: { from: 915, duration: 165 },
} as const;

export type CaptionSegment = {
  readonly startMs: number;
  readonly endMs: number;
  readonly words: ReadonlyArray<{
    readonly text: string;
    readonly startMs: number;
    readonly endMs: number;
    readonly isAccent?: boolean;
    readonly isLtr?: boolean;
  }>;
};

/**
 * Exact RTL Arabic captions synced to the 12 acoustic segments measured from voiceover.wav.
 */
export const CAPTION_SEGMENTS: ReadonlyArray<CaptionSegment> = [
  {
    startMs: 180,
    endMs: 1680,
    words: [
      { text: "سيرتك", startMs: 180, endMs: 650 },
      { text: "الذاتية", startMs: 650, endMs: 1120 },
      { text: "قوية...", startMs: 1120, endMs: 1680, isAccent: true },
    ],
  },
  {
    startMs: 1850,
    endMs: 4300,
    words: [
      { text: "بس", startMs: 1850, endMs: 2150 },
      { text: "بتضيع", startMs: 2150, endMs: 2620 },
      { text: "وسط", startMs: 2620, endMs: 3000 },
      { text: "زحمة", startMs: 3000, endMs: 3420, isAccent: true },
      { text: "مواقع", startMs: 3420, endMs: 3840 },
      { text: "التوظيف؟", startMs: 3840, endMs: 4300 },
    ],
  },
  {
    startMs: 4900,
    endMs: 6680,
    words: [
      { text: "مع", startMs: 4900, endMs: 5220 },
      { text: "منصة", startMs: 5220, endMs: 5620 },
      {
        text: "Asra3.com",
        startMs: 5620,
        endMs: 6680,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 6860,
    endMs: 10950,
    words: [
      { text: "ملفك", startMs: 6860, endMs: 7400 },
      { text: "بيوصل", startMs: 7400, endMs: 7920 },
      { text: "لمديري", startMs: 7920, endMs: 8450 },
      { text: "التوظيف", startMs: 8450, endMs: 9020, isAccent: true },
      { text: "مباشرة", startMs: 9020, endMs: 9650 },
      { text: "في", startMs: 9650, endMs: 9920 },
      { text: "3 دقائق", startMs: 9920, endMs: 10950, isAccent: true },
    ],
  },
  {
    startMs: 11400,
    endMs: 14820,
    words: [
      { text: "ارفع", startMs: 11400, endMs: 11850 },
      { text: "سيرتك", startMs: 11850, endMs: 12350 },
      { text: "الآن،", startMs: 12350, endMs: 12800 },
      { text: "والنظام", startMs: 12800, endMs: 13350 },
      { text: "يرفع", startMs: 13350, endMs: 13750 },
      { text: "توافق", startMs: 13750, endMs: 14180 },
      { text: "ATS", startMs: 14180, endMs: 14820, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 15000,
    endMs: 17750,
    words: [
      { text: "ويصيغ", startMs: 15000, endMs: 15550 },
      { text: "لك", startMs: 15550, endMs: 15820 },
      { text: "خطاب", startMs: 15820, endMs: 16280, isAccent: true },
      { text: "تقديم", startMs: 16280, endMs: 16720 },
      { text: "تنفيذي", startMs: 16720, endMs: 17220 },
      { text: "مخصص", startMs: 17220, endMs: 17750, isAccent: true },
    ],
  },
  {
    startMs: 18200,
    endMs: 22400,
    words: [
      { text: "اختر", startMs: 18200, endMs: 18650 },
      { text: "دولتك", startMs: 18650, endMs: 19150 },
      { text: "ومدنك", startMs: 19150, endMs: 19650 },
      { text: "عبر", startMs: 19650, endMs: 19950 },
      { text: "الإمارات،", startMs: 19950, endMs: 20550, isAccent: true },
      { text: "السعودية،", startMs: 20550, endMs: 21150, isAccent: true },
      { text: "قطر،", startMs: 21150, endMs: 21700, isAccent: true },
      { text: "والكويت", startMs: 21700, endMs: 22400, isAccent: true },
    ],
  },
  {
    startMs: 22950,
    endMs: 24100,
    words: [
      { text: "وبسرية", startMs: 22950, endMs: 23550, isAccent: true },
      { text: "تامة...", startMs: 23550, endMs: 24100 },
    ],
  },
  {
    startMs: 24300,
    endMs: 26600,
    words: [
      { text: "احجب", startMs: 24300, endMs: 24800, isAccent: true },
      { text: "شركتك", startMs: 24800, endMs: 25300 },
      { text: "الحالية", startMs: 25300, endMs: 25800 },
      { text: "بنقرة", startMs: 25800, endMs: 26200 },
      { text: "واحدة", startMs: 26200, endMs: 26600, isAccent: true },
    ],
  },
  {
    startMs: 27100,
    endMs: 30200,
    words: [
      { text: "وتابع", startMs: 27100, endMs: 27620 },
      { text: "كل", startMs: 27620, endMs: 27900 },
      { text: "شركة", startMs: 27900, endMs: 28400 },
      { text: "فتحت", startMs: 28400, endMs: 28900, isAccent: true },
      { text: "ملفك", startMs: 28900, endMs: 29400 },
      { text: "لحظة", startMs: 29400, endMs: 29800 },
      { text: "بلحظة", startMs: 29800, endMs: 30200, isAccent: true },
    ],
  },
  {
    startMs: 30800,
    endMs: 32720,
    words: [
      { text: "ابدأ", startMs: 30800, endMs: 31250 },
      { text: "الآن", startMs: 31250, endMs: 31680 },
      { text: "على", startMs: 31680, endMs: 31950 },
      {
        text: "Asra3.com",
        startMs: 31950,
        endMs: 32720,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 32950,
    endMs: 34250,
    words: [
      { text: "وتوظَّف", startMs: 32950, endMs: 33550, isAccent: true },
      { text: "أسرع", startMs: 33550, endMs: 34250, isAccent: true },
    ],
  },
];

/**
 * Returns smoothed ambient music volume multiplier for a given millisecond:
 * ducks smoothly to 0.14 under speech, lifts to 0.34 in gaps and 0.42 in final hold.
 */
export const getMusicDuckGain = (timeMs: number): number => {
  for (const seg of CAPTION_SEGMENTS) {
    if (timeMs >= seg.startMs - 140 && timeMs <= seg.endMs + 160) {
      return 0.14;
    }
  }
  if (timeMs >= 34100) {
    return 0.42;
  }
  return 0.32;
};
