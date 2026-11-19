import { getV4MusicDuckGain, V4_CAPTION_SEGMENTS } from "../v4/v4Theme";

export const V5_TOTAL_FRAMES = 2250; // 75.00s @ 30fps exact match to v4-flagship.wav
export const V5_TRANSITION_FRAMES = 18; // 0.60s seamless transition overlap per cut

/**
 * TransitionSeries sequence lengths adjusted for 6 × 18f overlaps (-108f total)
 * so every act still peaks directly inside its spoken pause window:
 * Sum = 240 + 441 + 420 + 258 + 480 + 261 + 258 - 108 = 2250 exact!
 */
export const V5_SEQUENCE_DURATIONS = {
  act01Funnel: 240, // Global start: 0    (0.00s -> 8.00s, overlaps 222..240)
  act02Network: 441, // Global start: 222  (7.40s -> 22.10s, overlaps 645..663)
  act03AiScan: 420, // Global start: 645  (21.50s -> 35.50s, overlaps 1047..1065)
  act04Shield: 258, // Global start: 1047 (34.90s -> 43.50s, overlaps 1287..1305)
  act05Rockets: 480, // Global start: 1287 (42.90s -> 58.90s, overlaps 1749..1767)
  act06Stage: 261, // Global start: 1749 (58.30s -> 67.00s, overlaps 1992..2010)
  act07Finale: 258, // Global start: 1992 (66.40s -> 75.00s)
} as const;

export const V5_CAPTION_SEGMENTS = V4_CAPTION_SEGMENTS;
export const getV5MusicDuckGain = getV4MusicDuckGain;
