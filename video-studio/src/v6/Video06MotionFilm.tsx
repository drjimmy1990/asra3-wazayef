import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ArabicCaptions } from "../components/ArabicCaptions";
import { useAsra3Fonts } from "../fonts";
import { THEME } from "../theme";
import { getV4MusicDuckGain, V4_CAPTION_SEGMENTS } from "../v4/v4Theme";
import { Asra3PhoneScreens } from "./Asra3PhoneScreens";
import { IPhoneFrame } from "./IPhoneFrame";
import {
  camAt,
  cameraAt,
  CamShot,
  clamp,
  E,
  FULL_RECT,
  ICON_RECT,
  MaskedLine,
  mixRect,
  mSpring,
  prog,
  V6_TOTAL_FRAMES,
} from "./motionCore";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Video06MotionFilmSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Video06MotionFilmProps = z.infer<typeof Video06MotionFilmSchema>;

interface SfxCue {
  readonly frame: number;
  readonly duration: number;
  readonly file: string;
  readonly volume: number;
}

const V6_SFX_CUES: ReadonlyArray<SfxCue> = [
  { frame: 190, duration: 20, file: "audio/sfx-click.wav", volume: 0.36 }, // 0 replies impact
  { frame: 230, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Brand Dot -> iPhone morph
  { frame: 425, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // Tap UAE
  { frame: 446, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // Tap KSA
  { frame: 467, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // Tap Qatar
  { frame: 488, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // Tap Kuwait
  { frame: 570, duration: 18, file: "audio/sfx-pop.wav", volume: 0.34 }, // Specialty tap
  { frame: 642, duration: 20, file: "audio/sfx-click.wav", volume: 0.36 }, // Continue CTA tap
  { frame: 868, duration: 28, file: "audio/sfx-chime.wav", volume: 0.38 }, // 96% ATS roller lands
  { frame: 984, duration: 22, file: "audio/sfx-pop.wav", volume: 0.38 }, // 3x badge pop
  { frame: 1106, duration: 18, file: "audio/sfx-click.wav", volume: 0.38 }, // iOS Shield switch tap
  { frame: 1200, duration: 28, file: "audio/sfx-chime.wav", volume: 0.36 }, // 100% Blocked lock
  { frame: 1286, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Push nav -> Live Tracking
  { frame: 1599, duration: 20, file: "audio/sfx-pop.wav", volume: 0.36 }, // CSV Verified tap
  { frame: 1653, duration: 30, file: "audio/sfx-chime.wav", volume: 0.44 }, // Dynamic Island Mail Drop!
  { frame: 1760, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Pricing sheet rise
  { frame: 1882, duration: 18, file: "audio/sfx-click.wav", volume: 0.36 }, // Tap 129 Launch
  { frame: 1947, duration: 30, file: "audio/sfx-chime.wav", volume: 0.42 }, // Apple Pay Face ID Confirmed ✓
  { frame: 2004, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // Close onto App Icon
];

const DuckingV6MusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;
  const fadeOut = interpolate(frame, [2200, V6_TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vol = Math.max(0, getV4MusicDuckGain(timeMs) * baseGain * fadeOut);

  return (
    <Audio
      src={staticFile("audio/ambient-pulse.wav")}
      loop
      durationInFrames={V6_TOTAL_FRAMES}
      volume={vol}
    />
  );
};

/**
 * Video #6 — True kaventro/motion-designer + Remotion 4 Film:
 * - Warm Platinum / Brand-Native Stage (#EFEFF3)
 * - Opening Paper & Ink Editorial Kinetic Typography (0.0s -> 7.5s)
 * - Signature Relay Move: Brand Mark rect-morphs into a Titanium iPhone 16 Pro (7.5s -> 8.7s)
 * - ONE continuous camera gliding & drifting across real mobile UI flows (8.7s -> 66.8s)
 * - Dynamic Island Mail notification drop (55.1s) + Authentic Apple Pay Face ID sheet (63.15s)
 * - Signature Closing Move: iPhone retracts & morphs back into the crisp Asra3 App Icon + Editorial CTA (66.8s -> 75.0s)
 */
export const Video06MotionFilm: React.FC<Video06MotionFilmProps> = ({
  format,
  showCaptions,
  musicGain,
  ctaLabel,
  ctaUrl,
  priceNote,
}) => {
  const fontsLoaded = useAsra3Fonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const isReels = format === "reels-9x16";

  if (!fontsLoaded) {
    return null;
  }

  // Stage vertical framing center keeping all hero action safely above ArabicCaptions
  const safeTop = isReels ? 118 : 66;
  const safeMidY = isReels ? 690 : 540;

  // Continuous One-Camera Shot Plan (every move E.smooth 0.85s..1.1s, gentle drift on holds)
  const shots: ReadonlyArray<CamShot> = isReels
    ? [
        // 0: Opening icon -> whole iPhone reveal centered nicely above TikTok captions
        { t0: 0, d: 0.9, cam: camAt(width, 1.32, 0, safeTop), rest: 8.6 },
        // 1: Zoom in onto Step 1 GCC Country cards (keeps both titanium edges in frame!)
        { t0: 10.2, d: 0.95, cam: camAt(width, 1.72, 22, safeTop) },
        // 2: Smooth glide to frame Step 2 ATS Scan & Cover Letter
        { t0: 22.0, d: 0.95, cam: camAt(width, 1.78, 12, safeTop) },
        // 3: Close-up focus on Step 3 Employer Shield toggle & domain input
        { t0: 35.4, d: 0.9, cam: camAt(width, 1.84, 8, safeTop) },
        // 4: Live /track dashboard + rollers
        { t0: 43.6, d: 0.95, cam: camAt(width, 1.72, 10, safeTop) },
        // 5: Shift subtly up to frame Dynamic Island Mail Notification drop!
        { t0: 54.7, d: 0.7, cam: camAt(width, 1.76, -18, safeTop) },
        // 6A: Frame upper Pricing Sheet cleanly
        { t0: 58.7, d: 0.85, cam: camAt(width, 1.62, 10, safeTop) },
        // 6B: Glide smoothly down to frame the Apple Pay Face ID bottom sheet cleanly above captions
        { t0: 62.9, d: 0.8, cam: camAt(width, 1.56, 230, safeTop) },
        // 7: Final pullback as iPhone morphs smoothly back into centered App Icon!
        { t0: 66.7, d: 0.95, cam: camAt(width, 1.35, 195, safeTop + 20) },
      ]
    : [
        // 4:5 Feed framing (1080 x 1350)
        { t0: 0, d: 0.9, cam: camAt(width, 1.15, 0, safeTop), rest: 8.6 },
        { t0: 10.2, d: 0.95, cam: camAt(width, 1.54, 18, safeTop) },
        { t0: 22.0, d: 0.95, cam: camAt(width, 1.58, 10, safeTop) },
        { t0: 35.4, d: 0.9, cam: camAt(width, 1.62, 8, safeTop) },
        { t0: 43.6, d: 0.95, cam: camAt(width, 1.54, 10, safeTop) },
        { t0: 54.7, d: 0.7, cam: camAt(width, 1.58, -14, safeTop) },
        { t0: 58.7, d: 0.85, cam: camAt(width, 1.44, 12, safeTop) },
        { t0: 62.9, d: 0.8, cam: camAt(width, 1.38, 220, safeTop) },
        { t0: 66.7, d: 0.95, cam: camAt(width, 1.24, 215, safeTop + 10) },
      ];

  const cam = cameraAt(shots, t, width, safeMidY);

  // Signature Relay Morph: Brand Dot -> Full iPhone Screen (7.55s..8.45s) -> Back to App Icon (66.75s..67.65s)
  const openP = prog(t, 7.55, 0.85, E.inOut);
  const closeP = prog(t, 66.75, 0.85, E.inOut);

  const activeRect =
    t < 40
      ? mixRect(ICON_RECT, FULL_RECT, openP)
      : mixRect(FULL_RECT, ICON_RECT, closeP);

  // Bezel & side hardware grow right after screen expands, retract cleanly before closing
  const edge = clamp(
    prog(t, 8.1, 0.45, E.out) - prog(t, 66.45, 0.4, E.in),
    0,
    1
  );
  const buttons = clamp(
    prog(t, 8.35, 0.38, E.out) - prog(t, 66.35, 0.32, E.in),
    0,
    1
  );

  // Opening Editorial Hook Stage visibility (0.0s -> 7.65s)
  const showOpeningHook = t < 7.75;
  const zeroStampScale = clamp(mSpring(t, 6.2, 0.36, 0.72), 0.01, 1.08);
  const zeroStampExit = prog(t, 7.25, 0.28, E.in);

  // Device appears right as Opening Hook exits (t >= 7.50s)
  const showDevice = t >= 7.45;
  const deviceFadeIn = prog(t, 7.45, 0.22, E.out);

  // Editorial Closing Lockup below the morphed App Icon (t >= 67.35s)
  const showEndingText = t >= 67.3;
  const ctaButtonScale = clamp(mSpring(t, 69.8, 0.42, 0.76), 0.01, 1.05);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F1F2F6",
        overflow: "hidden",
      }}
    >
      {/* Voiceover + Ducking Music + Tactile UI SFX */}
      <Sequence durationInFrames={V6_TOTAL_FRAMES} layout="none">
        <Audio
          src={staticFile("audio/v4-flagship.wav")}
          durationInFrames={V6_TOTAL_FRAMES}
          volume={1}
        />
      </Sequence>

      <DuckingV6MusicBed baseGain={musicGain} />

      {V6_SFX_CUES.map((cue) => (
        <Sequence
          key={`${cue.file}-${cue.frame}`}
          from={cue.frame}
          durationInFrames={cue.duration}
          layout="none"
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* Subtle architectural hairline border framing stage cleanly (no flashy glow/particles) */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: 28,
          border: "1px solid rgba(9, 9, 11, 0.07)",
          pointerEvents: "none",
        }}
      />

      {/* ================= ACT 0: PAPER & INK EDITORIAL OPENING HOOK (0.0s -> 7.6s) ================= */}
      {showOpeningHook ? (
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: "absolute",
            inset: 0,
            padding: isReels ? "140px 76px 610px" : "60px 64px 190px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: THEME.fontArabic,
            gap: 18,
          }}
        >
          <MaskedLine t={t} enterAt={0.18} exitAt={7.2}>
            <span
              dir="ltr"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 9999,
                backgroundColor: THEME.carbonBlack,
                color: THEME.goldSolid,
                padding: "8px 18px",
                fontFamily: THEME.fontMono,
                fontSize: 13.5,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              ASRA3.COM · GCC DIRECT HR
            </span>
          </MaskedLine>

          <MaskedLine t={t} enterAt={0.35} exitAt={7.22}>
            <div
              style={{
                fontSize: isReels ? 76 : 66,
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: THEME.carbonBlack,
              }}
            >
              تعبت من التقديم العشوائي؟
            </div>
          </MaskedLine>

          <MaskedLine t={t} enterAt={2.4} exitAt={7.25}>
            <div
              style={{
                fontSize: isReels ? 46 : 40,
                fontWeight: 800,
                lineHeight: 1.3,
                color: "#52525B",
              }}
            >
              ملفك القوي يضيع بين{" "}
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontLatin,
                  color: THEME.carbonBlack,
                  fontWeight: 900,
                }}
              >
                1,482
              </span>{" "}
              سيرة على البوابات
            </div>
          </MaskedLine>

          {t >= 6.18 ? (
            <div
              style={{
                marginTop: 8,
                scale: `${(zeroStampScale * (1 - zeroStampExit * 0.25)).toFixed(
                  4
                )}`,
                opacity: clamp(1 - zeroStampExit, 0, 1),
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 18,
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                padding: "16px 32px",
                fontSize: isReels ? 36 : 32,
                fontWeight: 900,
                boxShadow: "0 18px 40px rgba(220, 38, 38, 0.26)",
              }}
            >
              <span>0 ردود من مسؤولي التوظيف</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ================= CONTINUOUS TITANIUM IPHONE 16 PRO WORLD (7.5s -> 75.0s) ================= */}
      {showDevice ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: deviceFadeIn,
          }}
        >
          <IPhoneFrame
            t={t}
            cam={cam}
            rect={activeRect}
            edge={edge}
            buttons={buttons}
            darkStatusBar={t >= 43.2 && t < 58.65}
            mailBannerAt={55.1}
            mailBannerHideAt={58.6}
          >
            <Asra3PhoneScreens t={t} />
          </IPhoneFrame>
        </div>
      ) : null}

      {/* ================= CLOSING EDITORIAL LOCKUP UNDER MORPHED APP ICON (67.3s -> 75.0s) ================= */}
      {showEndingText ? (
        <div
          dir="rtl"
          lang="ar"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: isReels ? 580 : 480,
            padding: "0 64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: THEME.fontArabic,
            gap: 18,
          }}
        >
          <MaskedLine t={t} enterAt={67.45}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontSize: isReels ? 52 : 46,
                  fontWeight: 900,
                  color: THEME.carbonBlack,
                }}
              >
                أسرع
              </span>
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 19,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  color: THEME.goldSolid,
                  backgroundColor: THEME.carbonBlack,
                  borderRadius: 10,
                  padding: "6px 14px",
                }}
              >
                ASRA3.COM
              </span>
            </div>
          </MaskedLine>

          <MaskedLine t={t} enterAt={68.0}>
            <div
              style={{
                fontSize: isReels ? 58 : 50,
                fontWeight: 900,
                lineHeight: 1.2,
                color: THEME.carbonBlack,
              }}
            >
              لا تنتظر الفرصة..{" "}
              <span style={{ color: THEME.goldMutedInk }}>
                أوصل لها بنفسك اليوم
              </span>
            </div>
          </MaskedLine>

          <MaskedLine t={t} enterAt={68.7}>
            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: "#52525B",
              }}
            >
              {priceNote}
            </div>
          </MaskedLine>

          {t >= 69.75 ? (
            <div
              style={{
                marginTop: 8,
                scale: `${ctaButtonScale.toFixed(4)}`,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 20,
                backgroundColor: THEME.carbonBlack,
                border: `2.5px solid ${THEME.goldSolid}`,
                color: THEME.goldSolid,
                padding: "18px 36px",
                fontSize: isReels ? 30 : 27,
                fontWeight: 900,
                boxShadow: "0 20px 44px rgba(9, 9, 11, 0.22)",
              }}
            >
              <span>{ctaLabel}</span>
              <ArrowLeft size={26} strokeWidth={2.75} />
            </div>
          ) : null}

          {t >= 70.1 ? (
            <div
              dir="ltr"
              style={{
                opacity: prog(t, 70.1, 0.35, E.out),
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: THEME.fontMono,
                fontSize: 15,
                fontWeight: 800,
                color: "#52525B",
              }}
            >
              <ShieldCheck size={16} color={THEME.goldMutedInk} />
              <span>{ctaUrl}</span>
              <span>•</span>
              <span>EasyKash Verified</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Dead-Centered High-Contrast Arabic Captions (Safely below phone viewport) */}
      {showCaptions ? (
        <ArabicCaptions isReels={isReels} segments={V4_CAPTION_SEGMENTS} />
      ) : null}
    </AbsoluteFill>
  );
};
