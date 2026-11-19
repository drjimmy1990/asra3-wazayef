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
  V2Scene01RejectHook,
  V2Scene02XrayFilter,
  V2Scene03AtsRescue,
  V2Scene04CoverAndBoost,
} from "./V2Scenes";
import {
  getV2MusicDuckGain,
  V2_ACTS,
  V2_CAPTION_SEGMENTS,
  V2_TOTAL_FRAMES,
} from "./v2Theme";

export const Video02AtsSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Video02AtsProps = z.infer<typeof Video02AtsSchema>;

interface SfxCue {
  readonly frame: number;
  readonly duration: number;
  readonly file: string;
  readonly volume: number;
}

const V2_SFX_CUES: ReadonlyArray<SfxCue> = [
  { frame: 52, duration: 20, file: "audio/sfx-click.wav", volume: 0.42 },
  { frame: 132, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.34 },
  { frame: 244, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 },
  { frame: 388, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 },
  { frame: 510, duration: 24, file: "audio/sfx-pop.wav", volume: 0.4 },
  { frame: 576, duration: 32, file: "audio/sfx-chime.wav", volume: 0.42 },
];

export const DuckingV2MusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;
  const fadeOut = interpolate(frame, [680, V2_TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const computedVolume = Math.max(
    0,
    getV2MusicDuckGain(timeMs) * baseGain * fadeOut,
  );

  return (
    <Audio
      src={staticFile("audio/ambient-pulse.wav")}
      loop
      durationInFrames={V2_TOTAL_FRAMES}
      volume={computedVolume}
    />
  );
};

export const Video02AtsPain: React.FC<Video02AtsProps> = ({
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
      {/* Voiceover track measured cleanly to 22.44s + end-card CTA hold to 24.00s */}
      <Sequence durationInFrames={V2_TOTAL_FRAMES} layout="none">
        <Audio
          src={staticFile("audio/v2-ats.wav")}
          durationInFrames={V2_TOTAL_FRAMES}
          volume={1}
        />
      </Sequence>

      <DuckingV2MusicBed baseGain={musicGain} />

      {V2_SFX_CUES.map((cue) => (
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
        from={V2_ACTS.rejectHook.from}
        durationInFrames={V2_ACTS.rejectHook.duration}
      >
        <V2Scene01RejectHook isReels={isReels} />
      </Sequence>

      <Sequence
        from={V2_ACTS.xrayFilter.from}
        durationInFrames={V2_ACTS.xrayFilter.duration}
      >
        <V2Scene02XrayFilter isReels={isReels} />
      </Sequence>

      <Sequence
        from={V2_ACTS.atsRescue.from}
        durationInFrames={V2_ACTS.atsRescue.duration}
      >
        <V2Scene03AtsRescue isReels={isReels} />
      </Sequence>

      <Sequence
        from={V2_ACTS.coverAndBoost.from}
        durationInFrames={V2_ACTS.coverAndBoost.duration}
      >
        <V2Scene04CoverAndBoost isReels={isReels} />
      </Sequence>

      <Sequence
        from={V2_ACTS.endCard.from}
        durationInFrames={V2_ACTS.endCard.duration}
      >
        <Scene07EndCard
          isReels={isReels}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          priceNote={priceNote}
        />
      </Sequence>

      {showCaptions ? (
        <ArabicCaptions isReels={isReels} segments={V2_CAPTION_SEGMENTS} />
      ) : null}
    </AbsoluteFill>
  );
};
