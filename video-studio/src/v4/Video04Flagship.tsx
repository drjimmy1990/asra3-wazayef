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
import { Scene07EndCard } from "../scenes/Scene07EndCard";
import { THEME } from "../theme";
import {
  V4Scene01BrokenPortals,
  V4Scene02GccRadar,
  V4Scene03AiEngine,
} from "./V4ScenesPart1";
import {
  V4Scene04ShieldLock,
  V4Scene05DispatchAndTrack,
  V4Scene06PricingOneTime,
} from "./V4ScenesPart2";
import {
  getV4MusicDuckGain,
  V4_ACTS,
  V4_CAPTION_SEGMENTS,
  V4_TOTAL_FRAMES,
} from "./v4Theme";

export const Video04FlagshipSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Video04FlagshipProps = z.infer<typeof Video04FlagshipSchema>;

interface SfxCue {
  readonly frame: number;
  readonly duration: number;
  readonly file: string;
  readonly volume: number;
}

// 15 Beat-Synced Sound Design Cues Across All 7 Acts
const V4_SFX_CUES: ReadonlyArray<SfxCue> = [
  { frame: 182, duration: 20, file: "audio/sfx-click.wav", volume: 0.42 }, // Zero replies stamp
  { frame: 231, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Act 02 GCC Hub
  { frame: 419, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // AE hub click
  { frame: 441, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // SA hub click
  { frame: 463, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // QA hub click
  { frame: 485, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // KW hub click
  { frame: 571, duration: 20, file: "audio/sfx-pop.wav", volume: 0.36 }, // Specialty selected
  { frame: 654, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Act 03 AI Engine
  { frame: 874, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 }, // 96% ATS gauge
  { frame: 994, duration: 24, file: "audio/sfx-pop.wav", volume: 0.4 }, // 3x Cover Letter
  { frame: 1056, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Act 04 Shield
  { frame: 1108, duration: 18, file: "audio/sfx-click.wav", volume: 0.38 }, // Shield toggle ON
  { frame: 1220, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 }, // 100% Blocked stamp
  { frame: 1296, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Act 05 Dispatch & Track
  { frame: 1592, duration: 20, file: "audio/sfx-pop.wav", volume: 0.38 }, // Verified CSV highlight
  { frame: 1656, duration: 30, file: "audio/sfx-chime.wav", volume: 0.42 }, // Personal Inbox Interview card
  { frame: 1758, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 }, // Act 06 Pricing Tiers
  { frame: 1873, duration: 20, file: "audio/sfx-pop.wav", volume: 0.36 }, // Apple Pay trust strip
  { frame: 2001, duration: 32, file: "audio/sfx-chime.wav", volume: 0.44 }, // Act 07 Flagship Finale
];

export const DuckingV4MusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;
  const fadeOut = interpolate(frame, [2200, V4_TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const computedVolume = Math.max(
    0,
    getV4MusicDuckGain(timeMs) * baseGain * fadeOut
  );

  return (
    <Audio
      src={staticFile("audio/ambient-pulse.wav")}
      loop
      durationInFrames={V4_TOTAL_FRAMES}
      volume={computedVolume}
    />
  );
};

export const Video04Flagship: React.FC<Video04FlagshipProps> = ({
  format,
  showCaptions,
  musicGain,
  ctaLabel,
  ctaUrl,
  priceNote,
}) => {
  const fontsLoaded = useAsra3Fonts();
  const isReels = format === "reels-9x16";

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.carbonBlack,
        overflow: "hidden",
      }}
    >
      {/* Extended 72.80s voiceover + crisp CTA hold to 75.00s */}
      <Sequence durationInFrames={V4_TOTAL_FRAMES} layout="none">
        <Audio
          src={staticFile("audio/v4-flagship.wav")}
          durationInFrames={V4_TOTAL_FRAMES}
          volume={1}
        />
      </Sequence>

      <DuckingV4MusicBed baseGain={musicGain} />

      {V4_SFX_CUES.map((cue) => (
        <Sequence
          key={`${cue.file}-${cue.frame}`}
          from={cue.frame}
          durationInFrames={cue.duration}
          layout="none"
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}

      <Sequence
        from={V4_ACTS.brokenPortals.from}
        durationInFrames={V4_ACTS.brokenPortals.duration}
      >
        <V4Scene01BrokenPortals isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.gccHub.from}
        durationInFrames={V4_ACTS.gccHub.duration}
      >
        <V4Scene02GccRadar isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.aiEngine.from}
        durationInFrames={V4_ACTS.aiEngine.duration}
      >
        <V4Scene03AiEngine isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.privacyShield.from}
        durationInFrames={V4_ACTS.privacyShield.duration}
      >
        <V4Scene04ShieldLock isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.dispatchTrack.from}
        durationInFrames={V4_ACTS.dispatchTrack.duration}
      >
        <V4Scene05DispatchAndTrack isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.pricingTiers.from}
        durationInFrames={V4_ACTS.pricingTiers.duration}
      >
        <V4Scene06PricingOneTime isReels={isReels} />
      </Sequence>

      <Sequence
        from={V4_ACTS.endCard.from}
        durationInFrames={V4_ACTS.endCard.duration}
      >
        <Scene07EndCard
          isReels={isReels}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          priceNote={priceNote}
        />
      </Sequence>

      {showCaptions ? (
        <ArabicCaptions isReels={isReels} segments={V4_CAPTION_SEGMENTS} />
      ) : null}
    </AbsoluteFill>
  );
};
