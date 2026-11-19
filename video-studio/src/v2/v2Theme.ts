import type { CaptionSegment } from "../theme";

export const V2_TOTAL_FRAMES = 720; // 24.00s @ 30fps (22.05s VO + 1.95s hold)

/**
 * Exact frame windows aligned to measured pauses in v2-ats.wav (22.440s @ 24kHz):
 * - Act 01 Hook (Laser Reject): 0   -> 132 (0.00s -> 4.40s)  [VO: 0.25s..4.10s]
 * - Act 02 Auto-Filter X-Ray:   132 -> 264 (4.40s -> 8.80s)  [VO: 4.65s..8.40s]
 * - Act 03 ATS Free Rescue:     264 -> 414 (8.80s -> 13.80s) [VO: 9.10s..13.55s]
 * - Act 04 AI Letter & 3x:      414 -> 576 (13.80s -> 19.20s) [VO: 13.80s..18.95s]
 * - Act 05 Free Scan EndCard:   576 -> 720 (19.20s -> 24.00s) [VO: 19.50s..22.05s + Hold]
 */
export const V2_ACTS = {
  rejectHook: { from: 0, duration: 132 },
  xrayFilter: { from: 132, duration: 132 },
  atsRescue: { from: 264, duration: 150 },
  coverAndBoost: { from: 414, duration: 162 },
  endCard: { from: 576, duration: 144 },
} as const;

export const V2_CAPTION_SEGMENTS: ReadonlyArray<CaptionSegment> = [
  {
    startMs: 220,
    endMs: 4160,
    words: [
      { text: "تعرف", startMs: 220, endMs: 650 },
      { text: "ليش", startMs: 650, endMs: 1020 },
      { text: "سيرتك", startMs: 1020, endMs: 1500 },
      { text: "الذاتية", startMs: 1500, endMs: 2050 },
      { text: "تنرفض", startMs: 2050, endMs: 2650, isAccent: true },
      { text: "قبل", startMs: 2650, endMs: 3000 },
      { text: "ما", startMs: 3000, endMs: 3200 },
      { text: "أي", startMs: 3200, endMs: 3420 },
      { text: "مسؤول", startMs: 3420, endMs: 3780 },
      { text: "يقرأها؟", startMs: 3780, endMs: 4160, isAccent: true },
    ],
  },
  {
    startMs: 4600,
    endMs: 8480,
    words: [
      { text: "أنظمة", startMs: 4600, endMs: 5150 },
      { text: "الفرز", startMs: 5150, endMs: 5680, isAccent: true },
      { text: "الآلي", startMs: 5680, endMs: 6180, isAccent: true },
      { text: "تستبعد", startMs: 6180, endMs: 6780 },
      { text: "نص", startMs: 6780, endMs: 7180 },
      { text: "الملفات", startMs: 7180, endMs: 7680 },
      { text: "من", startMs: 7680, endMs: 7900 },
      { text: "أول", startMs: 7900, endMs: 8160 },
      { text: "ثانية", startMs: 8160, endMs: 8480, isAccent: true },
    ],
  },
  {
    startMs: 9050,
    endMs: 10820,
    words: [
      { text: "على", startMs: 9050, endMs: 9380 },
      { text: "منصة", startMs: 9380, endMs: 9850 },
      {
        text: "Asra3.com",
        startMs: 9850,
        endMs: 10820,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 11200,
    endMs: 13770,
    words: [
      { text: "افحص", startMs: 11200, endMs: 11680, isAccent: true },
      { text: "سيرتك", startMs: 11680, endMs: 12180 },
      { text: "مجاناً", startMs: 12180, endMs: 12680, isAccent: true },
      { text: "لأنظمة", startMs: 12680, endMs: 13150 },
      { text: "ATS", startMs: 13150, endMs: 13770, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 13780,
    endMs: 17040,
    words: [
      { text: "وخلّي", startMs: 13780, endMs: 14250 },
      { text: "الذكاء", startMs: 14250, endMs: 14750, isAccent: true },
      { text: "الاصطناعي", startMs: 14750, endMs: 15380 },
      { text: "يجهّز", startMs: 15380, endMs: 15850 },
      { text: "خطاب", startMs: 15850, endMs: 16250, isAccent: true },
      { text: "تقديم", startMs: 16250, endMs: 16600 },
      { text: "احترافي", startMs: 16600, endMs: 17040, isAccent: true },
    ],
  },
  {
    startMs: 17050,
    endMs: 19050,
    words: [
      { text: "يضاعف", startMs: 17050, endMs: 17650, isAccent: true },
      { text: "فرصك", startMs: 17650, endMs: 18250 },
      { text: "3×", startMs: 18250, endMs: 19050, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 19450,
    endMs: 22150,
    words: [
      { text: "ابدأ", startMs: 19450, endMs: 19900 },
      { text: "الفحص", startMs: 19900, endMs: 20450, isAccent: true },
      { text: "المجاني", startMs: 20450, endMs: 20980, isAccent: true },
      { text: "الآن", startMs: 20980, endMs: 21350 },
      {
        text: "Asra3.com",
        startMs: 21350,
        endMs: 22150,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
];

export const getV2MusicDuckGain = (timeMs: number): number => {
  for (const seg of V2_CAPTION_SEGMENTS) {
    if (timeMs >= seg.startMs - 140 && timeMs <= seg.endMs + 160) {
      return 0.14;
    }
  }
  if (timeMs >= 22150) {
    return 0.4;
  }
  return 0.32;
};
