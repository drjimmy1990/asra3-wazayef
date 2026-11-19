import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop } from "../components/BrowserFrame";
import { VelocityDartSvg } from "../components/BrandMark";
import { THEME } from "../theme";
import { ArrowLeft, ShieldCheck } from "lucide-react";

/**
 * Act 07 (915 -> 1080 frames / 30.50s -> 36.00s):
 * Local frame 0 -> 165 (VO finishes at ~34.00s / local frame 105; holds crisp CTA until 165)
 * "ابدأ الآن على أسرع.كوم... وتوظّف أسرع"
 */
export const Scene07EndCard: React.FC<{
  readonly isReels?: boolean;
  readonly staticPoster?: boolean;
  readonly ctaUrl: string;
  readonly ctaLabel: string;
  readonly priceNote: string;
}> = ({ isReels = false, staticPoster = false, ctaUrl, ctaLabel, priceNote }) => {
  const frame = useCurrentFrame();

  const logoScale = staticPoster
    ? 1
    : interpolate(frame, [0, 22], [0.76, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.spring({ damping: 180 }),
      });

  const titleY = staticPoster
    ? 0
    : interpolate(frame, [10, 32], [24, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
  const titleOpacity = staticPoster
    ? 1
    : interpolate(frame, [10, 26], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Final emphasis punch around "وتوظف أسرع" (local frame 74 -> 96)
  const ctaScale = staticPoster
    ? 1
    : interpolate(frame, [42, 62, 74, 88], [0.9, 1, 1.05, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.spring({ damping: 170 }),
      });
  const ctaOpacity = staticPoster
    ? 1
    : interpolate(frame, [40, 56], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isReels ? "140px 76px 560px" : "56px 56px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <ArchBackdrop dark={true} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            scale: `${logoScale}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <VelocityDartSvg size={isReels ? 128 : 114} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: isReels ? 56 : 50,
                fontWeight: 900,
                color: "#FAFAFA",
                lineHeight: 1,
              }}
            >
              أسرع
            </span>
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontLatin,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: THEME.carbonBlack,
                backgroundColor: THEME.goldSolid,
                borderRadius: 10,
                padding: "6px 16px",
              }}
            >
              ASRA3.COM
            </span>
          </div>
        </div>

        <h2
          style={{
            margin: 0,
            opacity: titleOpacity,
            translate: `0px ${titleY}px`,
            fontSize: isReels ? 64 : 58,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#FAFAFA",
          }}
        >
          توظَّف أسرع..{" "}
          <span style={{ color: THEME.goldSolid }}>في الخليج</span>
        </h2>

        <p
          style={{
            margin: 0,
            opacity: titleOpacity,
            fontSize: 22,
            fontWeight: 700,
            color: "#D4D4D8",
          }}
        >
          {priceNote}
        </p>

        {/* High-Contrast Sovereign Gold CTA Pill */}
        <div
          style={{
            opacity: ctaOpacity,
            scale: `${ctaScale}`,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            borderRadius: 20,
            backgroundColor: THEME.goldSolid,
            color: THEME.carbonBlack,
            padding: "22px 42px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 900 }}>{ctaLabel}</span>
          <ArrowLeft size={30} color={THEME.carbonBlack} />
        </div>

        <div
          style={{
            opacity: ctaOpacity,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 6,
          }}
        >
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 22,
              fontWeight: 900,
              color: THEME.goldSolid,
              border: `1.5px solid ${THEME.goldSolid}`,
              borderRadius: 12,
              padding: "8px 20px",
              backgroundColor: THEME.carbonElevated,
            }}
          >
            {ctaUrl}
          </span>
          <span
            dir="ltr"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 12,
              border: `1px solid ${THEME.carbonBorder}`,
              backgroundColor: THEME.carbonElevated,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 700,
              color: "#E4E4E7",
            }}
          >
            <ShieldCheck size={18} color={THEME.goldSolid} />
            <span>EasyKash DirectPayV1 Verified</span>
          </span>
        </div>
      </div>
    </div>
  );
};
