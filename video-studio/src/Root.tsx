import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Asra3Promo, Asra3PromoSchema } from "./Asra3Promo";
import { FPS, TOTAL_DURATION_FRAMES } from "./theme";
import { Scene07EndCard } from "./scenes/Scene07EndCard";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Asra3-Facebook-Ads">
      <Composition
        id="Asra3-Feed-4x5"
        component={Asra3Promo}
        schema={Asra3PromoSchema}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1350}
        defaultProps={{
          format: "feed-4x5",
          showCaptions: true,
          musicGain: 0.72,
          ctaLabel: "افحص سيرتك مجاناً الآن",
          ctaUrl: "asra3.com",
          priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
        }}
      />

      <Composition
        id="Asra3-Reels-9x16"
        component={Asra3Promo}
        schema={Asra3PromoSchema}
        durationInFrames={TOTAL_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          format: "reels-9x16",
          showCaptions: true,
          musicGain: 0.72,
          ctaLabel: "افحص سيرتك مجاناً الآن",
          ctaUrl: "asra3.com",
          priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
        }}
      />

      <Still
        id="Asra3-Poster-4x5"
        component={Scene07EndCard}
        width={1080}
        height={1350}
        defaultProps={{
          isReels: false,
          staticPoster: true,
          ctaLabel: "افحص سيرتك مجاناً الآن",
          ctaUrl: "asra3.com",
          priceNote: "دفعة واحدة تبدأ من 129 د.إ / ر.س • بدون اشتراك شهري",
        }}
      />
    </Folder>
  );
};
