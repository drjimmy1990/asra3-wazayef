import type { CaptionSegment } from "../theme";

export const V4_TOTAL_FRAMES = 2250; // 75.00s @ 30fps (72.40s VO + 2.60s CTA hold)

/**
 * Exact frame windows aligned to measured acoustic pauses in v4-flagship.wav (72.800s @ 24kHz):
 * - Act 01 Broken Portals:    0    -> 231  (0.00s  -> 7.70s)   [VO: 0.25s..7.40s, pause 7.40s..7.95s]
 * - Act 02 GCC 4-Market Hub:  231  -> 654  (7.70s  -> 21.80s)  [VO: 7.95s..21.60s, pause 21.60s..22.15s]
 * - Act 03 AI ATS + Letter:   654  -> 1056 (21.80s -> 35.20s)  [VO: 22.15s..34.90s, pause 34.90s..35.50s]
 * - Act 04 Privacy Shield:    1056 -> 1296 (35.20s -> 43.20s)  [VO: 35.50s..43.15s, pause 43.15s..43.60s]
 * - Act 05 Dispatch & Track:  1296 -> 1758 (43.20s -> 58.60s)  [VO: 43.60s..58.25s, pause 58.25s..58.90s]
 * - Act 06 One-Time Tiers:    1758 -> 2001 (58.60s -> 66.70s)  [VO: 58.90s..66.30s, pause 66.30s..66.85s]
 * - Act 07 Executive EndCard: 2001 -> 2250 (66.70s -> 75.00s)  [VO: 66.85s..72.40s + 2.60s Hold]
 */
export const V4_ACTS = {
  brokenPortals: { from: 0, duration: 231 },
  gccHub: { from: 231, duration: 423 },
  aiEngine: { from: 654, duration: 402 },
  privacyShield: { from: 1056, duration: 240 },
  dispatchTrack: { from: 1296, duration: 462 },
  pricingTiers: { from: 1758, duration: 243 },
  endCard: { from: 2001, duration: 249 },
} as const;

export const V4_CAPTION_SEGMENTS: ReadonlyArray<CaptionSegment> = [
  {
    startMs: 220,
    endMs: 3420,
    words: [
      { text: "تعبت", startMs: 220, endMs: 680, isAccent: true },
      { text: "من", startMs: 680, endMs: 920 },
      { text: "التقديم", startMs: 920, endMs: 1460 },
      { text: "العشوائي", startMs: 1460, endMs: 2080, isAccent: true },
      { text: "في", startMs: 2080, endMs: 2280 },
      { text: "مواقع", startMs: 2280, endMs: 2740 },
      { text: "التوظيف", startMs: 2740, endMs: 3420 },
    ],
  },
  {
    startMs: 3421,
    endMs: 6020,
    words: [
      { text: "اللي", startMs: 3421, endMs: 3820 },
      { text: "يضيع", startMs: 3820, endMs: 4320, isAccent: true },
      { text: "فيها", startMs: 4320, endMs: 4680 },
      { text: "ملفك", startMs: 4680, endMs: 5140 },
      { text: "بين", startMs: 5140, endMs: 5460 },
      { text: "آلاف", startMs: 5460, endMs: 5760, isAccent: true },
      { text: "السير،", startMs: 5760, endMs: 6020 },
    ],
  },
  {
    startMs: 6350,
    endMs: 7480,
    words: [
      { text: "وما", startMs: 6350, endMs: 6680 },
      { text: "يجيك", startMs: 6680, endMs: 7060 },
      { text: "أي رد؟", startMs: 7060, endMs: 7480, isAccent: true },
    ],
  },
  {
    startMs: 7900,
    endMs: 9460,
    words: [
      { text: "على", startMs: 7900, endMs: 8220 },
      { text: "منصة", startMs: 8220, endMs: 8680 },
      {
        text: "Asra3.com",
        startMs: 8680,
        endMs: 9460,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 9520,
    endMs: 13800,
    words: [
      { text: "رحلتك", startMs: 9520, endMs: 10180 },
      { text: "تبدأ", startMs: 10180, endMs: 10720 },
      { text: "باختيار", startMs: 10720, endMs: 11380, isAccent: true },
      { text: "دولتك", startMs: 11380, endMs: 12000 },
      { text: "ومدنك", startMs: 12000, endMs: 12600 },
      { text: "عبر", startMs: 12600, endMs: 12960 },
      { text: "4 أسواق", startMs: 12960, endMs: 13800, isAccent: true },
    ],
  },
  {
    startMs: 14100,
    endMs: 16980,
    words: [
      { text: "الإمارات،", startMs: 14100, endMs: 14820, isAccent: true },
      { text: "السعودية،", startMs: 14820, endMs: 15540, isAccent: true },
      { text: "قطر،", startMs: 15540, endMs: 16180, isAccent: true },
      { text: "والكويت", startMs: 16180, endMs: 16980, isAccent: true },
    ],
  },
  {
    startMs: 17250,
    endMs: 21700,
    words: [
      { text: "في", startMs: 17250, endMs: 17560 },
      { text: "أكثر من", startMs: 17560, endMs: 18160 },
      {
        text: "5,100+",
        startMs: 18160,
        endMs: 19220,
        isAccent: true,
        isLtr: true,
      },
      { text: "شركة", startMs: 19220, endMs: 19780 },
      { text: "موثقة", startMs: 19780, endMs: 20400, isAccent: true },
      { text: "حسب", startMs: 20400, endMs: 20880 },
      { text: "تخصصك", startMs: 20880, endMs: 21700 },
    ],
  },
  {
    startMs: 22100,
    endMs: 23740,
    words: [
      { text: "ارفع", startMs: 22100, endMs: 22540, isAccent: true },
      { text: "سيرتك", startMs: 22540, endMs: 23060 },
      { text: "مجاناً", startMs: 23060, endMs: 23740, isAccent: true },
    ],
  },
  {
    startMs: 23860,
    endMs: 27140,
    words: [
      { text: "والذكاء", startMs: 23860, endMs: 24500, isAccent: true },
      { text: "الاصطناعي", startMs: 24500, endMs: 25180 },
      { text: "يستخرج", startMs: 25180, endMs: 25820 },
      { text: "خبراتك", startMs: 25820, endMs: 26480, isAccent: true },
      { text: "فوراً", startMs: 26480, endMs: 27140 },
    ],
  },
  {
    startMs: 27360,
    endMs: 29640,
    words: [
      { text: "ويرفع", startMs: 27360, endMs: 27920 },
      { text: "توافقها", startMs: 27920, endMs: 28560, isAccent: true },
      { text: "مع أنظمة", startMs: 28560, endMs: 29120 },
      { text: "ATS", startMs: 29120, endMs: 29640, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 29850,
    endMs: 32400,
    words: [
      { text: "ويصيغ", startMs: 29850, endMs: 30420 },
      { text: "لك", startMs: 30420, endMs: 30700 },
      { text: "خطاب", startMs: 30700, endMs: 31220, isAccent: true },
      { text: "تقديم", startMs: 31220, endMs: 31760 },
      { text: "مخصص", startMs: 31760, endMs: 32400, isAccent: true },
    ],
  },
  {
    startMs: 32401,
    endMs: 34980,
    words: [
      { text: "يضاعف", startMs: 32401, endMs: 33080, isAccent: true },
      { text: "فرص", startMs: 33080, endMs: 33560 },
      { text: "مقابلاتك", startMs: 33560, endMs: 34240 },
      { text: "3×", startMs: 34240, endMs: 34980, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 35450,
    endMs: 36620,
    words: [
      { text: "ولو", startMs: 35450, endMs: 35800 },
      { text: "شغّال", startMs: 35800, endMs: 36220, isAccent: true },
      { text: "حالياً", startMs: 36220, endMs: 36620 },
    ],
  },
  {
    startMs: 36700,
    endMs: 37940,
    words: [
      { text: "فعّل", startMs: 36700, endMs: 37100 },
      { text: "درع", startMs: 37100, endMs: 37440, isAccent: true },
      { text: "الخصوصية", startMs: 37440, endMs: 37940, isAccent: true },
    ],
  },
  {
    startMs: 38000,
    endMs: 41540,
    words: [
      { text: "واكتب", startMs: 38000, endMs: 38560 },
      { text: "نطاق", startMs: 38560, endMs: 39080 },
      { text: "شركتك", startMs: 39080, endMs: 39720 },
      { text: "لحجبها", startMs: 39720, endMs: 40420, isAccent: true },
      {
        text: "100%",
        startMs: 40420,
        endMs: 41540,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
  {
    startMs: 41800,
    endMs: 43240,
    words: [
      { text: "قبل", startMs: 41800, endMs: 42180 },
      { text: "ما يبدأ", startMs: 42180, endMs: 42700 },
      { text: "أي إرسال", startMs: 42700, endMs: 43240, isAccent: true },
    ],
  },
  {
    startMs: 43550,
    endMs: 45700,
    words: [
      { text: "وخلال", startMs: 43550, endMs: 44120 },
      { text: "دقائق...", startMs: 44120, endMs: 44760, isAccent: true },
      { text: "ينطلق", startMs: 44760, endMs: 45260 },
      { text: "ملفك", startMs: 45260, endMs: 45700 },
    ],
  },
  {
    startMs: 45701,
    endMs: 48340,
    words: [
      { text: "مباشرة", startMs: 45701, endMs: 46320, isAccent: true },
      { text: "لصناديق", startMs: 46320, endMs: 46960 },
      { text: "بريد", startMs: 46960, endMs: 47400 },
      { text: "HR", startMs: 47400, endMs: 48340, isAccent: true, isLtr: true },
    ],
  },
  {
    startMs: 48600,
    endMs: 51140,
    words: [
      { text: "ومعك", startMs: 48600, endMs: 49100 },
      { text: "لوحة", startMs: 49100, endMs: 49660, isAccent: true },
      { text: "تتبع", startMs: 49660, endMs: 50240, isAccent: true },
      { text: "لحظة بلحظة", startMs: 50240, endMs: 51140 },
    ],
  },
  {
    startMs: 51250,
    endMs: 53120,
    words: [
      { text: "تشوف", startMs: 51250, endMs: 51720 },
      { text: "فيها", startMs: 51720, endMs: 52080 },
      { text: "كل شركة", startMs: 52080, endMs: 52640, isAccent: true },
      { text: "فتحتها", startMs: 52640, endMs: 53120 },
    ],
  },
  {
    startMs: 53200,
    endMs: 54940,
    words: [
      { text: "مع", startMs: 53200, endMs: 53540 },
      { text: "تقرير", startMs: 53540, endMs: 54020 },
      { text: "CSV", startMs: 54020, endMs: 54500, isAccent: true, isLtr: true },
      { text: "موثق", startMs: 54500, endMs: 54940, isAccent: true },
    ],
  },
  {
    startMs: 55250,
    endMs: 58340,
    words: [
      { text: "وكل ردود", startMs: 55250, endMs: 56040 },
      { text: "المقابلات", startMs: 56040, endMs: 56840, isAccent: true },
      { text: "على", startMs: 56840, endMs: 57280 },
      { text: "إيميلك", startMs: 57280, endMs: 57820, isAccent: true },
      { text: "الشخصي", startMs: 57820, endMs: 58340 },
    ],
  },
  {
    startMs: 58850,
    endMs: 60500,
    words: [
      { text: "وبدون", startMs: 58850, endMs: 59350 },
      { text: "أي", startMs: 59350, endMs: 59620 },
      { text: "اشتراكات", startMs: 59620, endMs: 60120, isAccent: true },
      { text: "شهرية", startMs: 60120, endMs: 60500 },
    ],
  },
  {
    startMs: 60600,
    endMs: 63400,
    words: [
      { text: "باقات", startMs: 60600, endMs: 61180 },
      { text: "تبدأ من", startMs: 61180, endMs: 61780 },
      { text: "129", startMs: 61780, endMs: 62520, isAccent: true, isLtr: true },
      { text: "درهم / ريال", startMs: 62520, endMs: 63400, isAccent: true },
    ],
  },
  {
    startMs: 63401,
    endMs: 66400,
    words: [
      { text: "دفعة واحدة", startMs: 63401, endMs: 64320, isAccent: true },
      { text: "عبر", startMs: 64320, endMs: 64680 },
      {
        text: "Apple Pay",
        startMs: 64680,
        endMs: 65480,
        isAccent: true,
        isLtr: true,
      },
      { text: "والبطاقات", startMs: 65480, endMs: 66400 },
    ],
  },
  {
    startMs: 66800,
    endMs: 67980,
    words: [
      { text: "لا تنتظر", startMs: 66800, endMs: 67420 },
      { text: "الفرصة", startMs: 67420, endMs: 67980, isAccent: true },
    ],
  },
  {
    startMs: 68200,
    endMs: 69750,
    words: [
      { text: "أوصل لها", startMs: 68200, endMs: 68840, isAccent: true },
      { text: "بنفسك", startMs: 68840, endMs: 69300 },
      { text: "اليوم", startMs: 69300, endMs: 69750, isAccent: true },
    ],
  },
  {
    startMs: 70000,
    endMs: 72480,
    words: [
      { text: "ابدأ", startMs: 70000, endMs: 70480 },
      { text: "الفحص المجاني", startMs: 70480, endMs: 71340, isAccent: true },
      { text: "الآن", startMs: 71340, endMs: 71720 },
      {
        text: "Asra3.com",
        startMs: 71720,
        endMs: 72480,
        isAccent: true,
        isLtr: true,
      },
    ],
  },
];

export const getV4MusicDuckGain = (timeMs: number): number => {
  for (const seg of V4_CAPTION_SEGMENTS) {
    if (timeMs >= seg.startMs - 140 && timeMs <= seg.endMs + 160) {
      return 0.14;
    }
  }
  if (timeMs >= 72480) {
    return 0.42;
  }
  return 0.32;
};
