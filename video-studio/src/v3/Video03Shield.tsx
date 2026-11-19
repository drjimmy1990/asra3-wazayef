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
  V3Scene01OfficeFear,
  V3Scene02ShieldDomain,
  V3Scene03EmployerBlocked,
  V3Scene04StealthDispatch,
} from "./V3Scenes";
import {
  getV3MusicDuckGain,
  V3_ACTS,
  V3_CAPTION_SEGMENTS,
  V3_TOTAL_FRAMES,
} from "./v3Theme";

export const Video03ShieldSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Video03ShieldProps = z.infer<typeof Video03ShieldSchema>;

interface SfxCue {
  readonly frame: number;
  readonly duration: number;
  readonly file: string;
  readonly volume: number;
}

const V3_SFX_CUES: ReadonlyArray<SfxCue> = [
  { frame: 114, duration: 20, file: "audio/sfx-click.wav", volume: 0.36 },
  { frame: 186, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 },
  { frame: 351, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 },
  { frame: 373, duration: 20, file: "audio/sfx-click.wav", volume: 0.42 },
  { frame: 392, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 },
  { frame: 462, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 },
  { frame: 538, duration: 24, file: "audio/sfx-pop.wav", volume: 0.4 },
  { frame: 600, duration: 32, file: "audio/sfx-chime.wav", volume: 0.42 },
];

export const DuckingV3MusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;
  const fadeOut = interpolate(frame, [710, V3_TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const computedVolume = Math.max(
    0,
    getV3MusicDuckGain(timeMs) * baseGain * fadeOut
  );

  return (
    <Audio
      src={staticFile("audio/ambient-pulse.wav")}
      loop
      durationInFrames={V3_TOTAL_FRAMES}
      volume={computedVolume}
    />
  );
};

export const Video03Shield: React.FC<Video03ShieldProps> = ({
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
      {/* Voiceover track measured at 23.64s + crisp CTA hold to 25.00s */}
      <Sequence durationInFrames={V3_TOTAL_FRAMES} layout="none">
        <Audio
          src={staticFile("audio/v3-shield.wav")}
          durationInFrames={V3_TOTAL_FRAMES}
          volume={1}
        />
      </Sequence>

      <DuckingV3MusicBed baseGain={musicGain} />

      {V3_SFX_CUES.map((cue) => (
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
        from={V3_ACTS.officeFear.from}
        durationInFrames={V3_ACTS.officeFear.duration}
      >
        <V3Scene01OfficeFear isReels={isReels} />
      </Sequence>

      <Sequence
        from={V3_ACTS.domainInput.from}
        durationInFrames={V3_ACTS.domainInput.duration}
      >
        <V3Scene02ShieldDomain isReels={isReels} />
      </Sequence>

      <Sequence
        from={V3_ACTS.blockedLockout.from}
        durationInFrames={V3_ACTS.blockedLockout.duration}
      >
        <V3Scene03EmployerBlocked isReels={isReels} />
      </Sequence>

      <Sequence
        from={V3_ACTS.stealthDispatch.from}
        durationInFrames={V3_ACTS.stealthDispatch.duration}
      >
        <V3Scene04StealthDispatch isReels={isReels} />
      </Sequence>

      <Sequence
        from={V3_ACTS.endCard.from}
        durationInFrames={V3_ACTS.endCard.duration}
      >
        <Scene07EndCard
          isReels={isReels}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          priceNote={priceNote}
        />
      </Sequence>

      {showCaptions ? (
        <ArabicCaptions isReels={isReels} segments={V3_CAPTION_SEGMENTS} />
      ) : null}
    </AbsoluteFill>
  );
};
