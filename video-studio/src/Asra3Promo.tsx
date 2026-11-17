import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  Track,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { useAsra3Fonts } from "./fonts";
import { ACTS, getMusicDuckGain, THEME } from "./theme";
import { ArabicCaptions } from "./components/ArabicCaptions";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Arrival } from "./scenes/Scene02Arrival";
import { Scene03AtsAudit } from "./scenes/Scene03AtsAudit";
import { Scene04GccMarkets } from "./scenes/Scene04GccMarkets";
import { Scene05PrivacyShield } from "./scenes/Scene05PrivacyShield";
import { Scene06LiveLedger } from "./scenes/Scene06LiveLedger";
import { Scene07EndCard } from "./scenes/Scene07EndCard";

export const Asra3PromoSchema = z.object({
  format: z.enum(["feed-4x5", "reels-9x16"]),
  showCaptions: z.boolean(),
  musicGain: z.number().min(0).max(1),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  priceNote: z.string(),
});

export type Asra3PromoProps = z.infer<typeof Asra3PromoSchema>;

const DuckingMusicBed: React.FC<{ readonly baseGain: number }> = ({
  baseGain,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const vol = getMusicDuckGain(timeMs) * baseGain;

  return (
    <Audio
      name="Ambient executive beat"
      src={staticFile("audio/ambient-pulse.wav")}
      volume={vol}
    />
  );
};

export const Asra3Promo: React.FC<Asra3PromoProps> = ({
  format,
  showCaptions,
  musicGain,
  ctaLabel,
  ctaUrl,
  priceNote,
}) => {
  useAsra3Fonts();
  const isReels = format === "reels-9x16";

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.carbonBlack }}>
      {/* Visual Storyline Acts Track */}
      <Track name="Visual-Acts">
        <Sequence
          name="01-Hook"
          from={ACTS.hook.from}
          durationInFrames={ACTS.hook.duration}
        >
          <Scene01Hook isReels={isReels} />
        </Sequence>

        <Sequence
          name="02-Arrival"
          from={ACTS.arrival.from}
          durationInFrames={ACTS.arrival.duration}
        >
          <Scene02Arrival isReels={isReels} />
        </Sequence>

        <Sequence
          name="03-ATS-Audit"
          from={ACTS.ats.from}
          durationInFrames={ACTS.ats.duration}
        >
          <Scene03AtsAudit isReels={isReels} />
        </Sequence>

        <Sequence
          name="04-GCC-Markets"
          from={ACTS.markets.from}
          durationInFrames={ACTS.markets.duration}
        >
          <Scene04GccMarkets isReels={isReels} />
        </Sequence>

        <Sequence
          name="05-Privacy-Shield"
          from={ACTS.shield.from}
          durationInFrames={ACTS.shield.duration}
        >
          <Scene05PrivacyShield isReels={isReels} />
        </Sequence>

        <Sequence
          name="06-Live-Ledger"
          from={ACTS.ledger.from}
          durationInFrames={ACTS.ledger.duration}
        >
          <Scene06LiveLedger isReels={isReels} />
        </Sequence>

        <Sequence
          name="07-EndCard"
          from={ACTS.endCard.from}
          durationInFrames={ACTS.endCard.duration}
        >
          <Scene07EndCard
            isReels={isReels}
            ctaLabel={ctaLabel}
            ctaUrl={ctaUrl}
            priceNote={priceNote}
          />
        </Sequence>
      </Track>

      {/* Word-level RTL Arabic Captions */}
      {showCaptions && <ArabicCaptions isReels={isReels} />}

      {/* Primary AI Studio Voiceover Track */}
      <Track name="Voiceover">
        <Audio
          name="Arabic AI Studio VO"
          src={staticFile("audio/voiceover.wav")}
          volume={1}
        />
      </Track>

      {/* Ducking Executive Pulse Bed */}
      <Track name="Music-Bed">
        <DuckingMusicBed baseGain={musicGain} />
      </Track>

      {/* Deterministic UI SFX Accents on Beats & Cuts */}
      <Track name="UI-SFX">
        <Audio
          name="Hook Wipe Swoosh"
          from={118}
          src={staticFile("audio/sfx-swoosh.wav")}
          volume={0.55}
        />
        <Audio
          name="3Min Pill Pop"
          from={273}
          src={staticFile("audio/sfx-pop.wav")}
          volume={0.5}
        />
        <Audio
          name="ATS Transition Swoosh"
          from={336}
          src={staticFile("audio/sfx-swoosh.wav")}
          volume={0.45}
        />
        <Audio
          name="ATS 96% Chime"
          from={432}
          src={staticFile("audio/sfx-chime.wav")}
          volume={0.45}
        />
        <Audio
          name="AE Click"
          from={582}
          src={staticFile("audio/sfx-click.wav")}
          volume={0.45}
        />
        <Audio
          name="SA Click"
          from={606}
          src={staticFile("audio/sfx-click.wav")}
          volume={0.45}
        />
        <Audio
          name="QA Click"
          from={628}
          src={staticFile("audio/sfx-click.wav")}
          volume={0.45}
        />
        <Audio
          name="KW Click"
          from={648}
          src={staticFile("audio/sfx-click.wav")}
          volume={0.45}
        />
        <Audio
          name="Shield Lock Click"
          from={751}
          src={staticFile("audio/sfx-pop.wav")}
          volume={0.6}
        />
        <Audio
          name="Ledger Transition"
          from={807}
          src={staticFile("audio/sfx-swoosh.wav")}
          volume={0.4}
        />
        <Audio
          name="End Card Chime"
          from={915}
          src={staticFile("audio/sfx-chime.wav")}
          volume={0.55}
        />
      </Track>
    </AbsoluteFill>
  );
};
