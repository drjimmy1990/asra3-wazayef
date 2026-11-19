import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
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
import {
  V5Scene01KineticFunnel,
  V5Scene02GccNetwork,
  V5Scene03AiScanAndWrite,
} from "./V5ScenesPart1";
import {
  V5Scene04ArmorShield,
  V5Scene05RocketTelemetry,
  V5Scene06ThreeDStage,
  V5Scene07OrbitFinale,
} from "./V5ScenesPart2";
import {
  getV5MusicDuckGain,
  V5_CAPTION_SEGMENTS,
  V5_SEQUENCE_DURATIONS,
  V5_TOTAL_FRAMES,
  V5_TRANSITION_FRAMES,
} from "./v5Theme";

export const Video05CinematicSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Video05CinematicProps = z.infer<typeof Video05CinematicSchema>;

interface SfxCue {
  readonly frame: number;
  readonly duration: number;
  readonly file: string;
  readonly volume: number;
}

const V5_SFX_CUES: ReadonlyArray<SfxCue> = [
  { frame: 178, duration: 20, file: "audio/sfx-click.wav", volume: 0.42 }, // Zero replies slam
  { frame: 222, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // Wipe transition -> Act 02
  { frame: 418, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // AE hub
  { frame: 440, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // SA hub
  { frame: 462, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // QA hub
  { frame: 484, duration: 16, file: "audio/sfx-click.wav", volume: 0.3 }, // KW hub
  { frame: 560, duration: 20, file: "audio/sfx-pop.wav", volume: 0.36 }, // Specialty pop
  { frame: 645, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // Iris transition -> Act 03
  { frame: 874, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 }, // 96% ATS gauge
  { frame: 985, duration: 24, file: "audio/sfx-pop.wav", volume: 0.42 }, // 3x burst
  { frame: 1047, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // 3D Flip transition -> Act 04
  { frame: 1103, duration: 18, file: "audio/sfx-click.wav", volume: 0.38 }, // Shield toggle ON
  { frame: 1209, duration: 30, file: "audio/sfx-chime.wav", volume: 0.38 }, // 100% Blocked shield lock
  { frame: 1287, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // Slide-up transition -> Act 05
  { frame: 1593, duration: 20, file: "audio/sfx-pop.wav", volume: 0.38 }, // CSV report highlight
  { frame: 1655, duration: 30, file: "audio/sfx-chime.wav", volume: 0.42 }, // Personal Gmail bell toast
  { frame: 1749, duration: 24, file: "audio/sfx-swoosh.wav", volume: 0.36 }, // ClockWipe transition -> Act 06
  { frame: 1887, duration: 20, file: "audio/sfx-pop.wav", volume: 0.36 }, // Apple Pay dock
  { frame: 1992, duration: 32, file: "audio/sfx-chime.wav", volume: 0.44 }, // Iris transition -> Act 07 Finale
];

export const DuckingV5MusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timeMs = (frame / fps) * 1000;
  const fadeOut = interpolate(frame, [2200, V5_TOTAL_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const computedVolume = Math.max(
    0,
    getV5MusicDuckGain(timeMs) * baseGain * fadeOut
  );

  return (
    <Audio
      src={staticFile("audio/ambient-pulse.wav")}
      loop
      durationInFrames={V5_TOTAL_FRAMES}
      volume={computedVolume}
    />
  );
};

export const Video05Cinematic: React.FC<Video05CinematicProps> = ({
  format,
  showCaptions,
  musicGain,
  ctaLabel,
  ctaUrl,
  priceNote,
}) => {
  const fontsLoaded = useAsra3Fonts();
  const { width, height } = useVideoConfig();
  const isReels = format === "reels-9x16";

  if (!fontsLoaded) {
    return null;
  }

  const transitionTiming = springTiming({
    config: { damping: 200 },
    durationInFrames: V5_TRANSITION_FRAMES,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.carbonBlack,
        overflow: "hidden",
      }}
    >
      {/* Shared voiceover track measured cleanly to 72.80s + hold to 75.00s */}
      <Sequence durationInFrames={V5_TOTAL_FRAMES} layout="none">
        <Audio
          src={staticFile("audio/v4-flagship.wav")}
          durationInFrames={V5_TOTAL_FRAMES}
          volume={1}
        />
      </Sequence>

      <DuckingV5MusicBed baseGain={musicGain} />

      {V5_SFX_CUES.map((cue) => (
        <Sequence
          key={`${cue.file}-${cue.frame}`}
          from={cue.frame}
          durationInFrames={cue.duration}
          layout="none"
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* Real Overlapping Transitions via @remotion/transitions */}
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="Act 01 — Portal Queue Trap"
          durationInFrames={V5_SEQUENCE_DURATIONS.act01Funnel}
        >
          <V5Scene01KineticFunnel isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-top-right" })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 02 — GCC Hub Constellation"
          durationInFrames={V5_SEQUENCE_DURATIONS.act02Network}
        >
          <V5Scene02GccNetwork isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width, height })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 03 — AI Scan & 3x Cover Letter"
          durationInFrames={V5_SEQUENCE_DURATIONS.act03AiScan}
        >
          <V5Scene03AiScanAndWrite isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={flip({ direction: "from-right", perspective: 1400 })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 04 — Armor Exclusion Shield"
          durationInFrames={V5_SEQUENCE_DURATIONS.act04Shield}
        >
          <V5Scene04ArmorShield isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 05 — Rocket Dispatch & Live Graph"
          durationInFrames={V5_SEQUENCE_DURATIONS.act05Rockets}
        >
          <V5Scene05RocketTelemetry isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clockWipe({ width, height })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 06 — 3D Package Stage & Sheen"
          durationInFrames={V5_SEQUENCE_DURATIONS.act06Stage}
        >
          <V5Scene06ThreeDStage isReels={isReels} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width, height })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence
          name="Act 07 — Orbiting Dart Finale"
          durationInFrames={V5_SEQUENCE_DURATIONS.act07Finale}
        >
          <V5Scene07OrbitFinale
            isReels={isReels}
            ctaLabel={ctaLabel}
            ctaUrl={ctaUrl}
            priceNote={priceNote}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {showCaptions ? (
        <ArabicCaptions isReels={isReels} segments={V5_CAPTION_SEGMENTS} />
      ) : null}
    </AbsoluteFill>
  );
};
