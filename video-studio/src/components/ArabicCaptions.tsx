import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_SEGMENTS, THEME } from "../theme";

/**
 * Arabic RTL word-by-word kinetic caption engine:
 * - Always wraps lines inside `dir="rtl" lang="ar"` so ligatures and word order stay intact.
 * - Never splits Arabic letters into separate inline-blocks (preserves connected Arabic glyph shaping).
 */
export const ArabicCaptions: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const activeSegment = CAPTION_SEGMENTS.find(
    (seg) => timeMs >= seg.startMs && timeMs <= seg.endMs
  );

  if (!activeSegment) {
    return null;
  }

  const fadeIn = interpolate(
    timeMs,
    [activeSegment.startMs, activeSegment.startMs + 130],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );

  const riseY = interpolate(
    timeMs,
    [activeSegment.startMs, activeSegment.startMs + 160],
    [10, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        insetInline: 48,
        bottom: isReels ? 185 : 54,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          opacity: fadeIn,
          translate: `0px ${riseY}px`,
          backgroundColor: "#09090B",
          border: `2px solid ${THEME.goldSolid}`,
          borderRadius: 18,
          padding: "14px 26px",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.45)",
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          maxWidth: 940,
        }}
      >
        {activeSegment.words.map((word, idx) => {
          const isCurrent =
            timeMs >= word.startMs && timeMs <= word.endMs + 40;
          const isSpoken = timeMs >= word.startMs;

          const wordScale = isCurrent
            ? interpolate(timeMs, [word.startMs, word.startMs + 90], [0.96, 1.06], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

          return (
            <span
              key={`${activeSegment.startMs}-${idx}`}
              dir={word.isLtr ? "ltr" : undefined}
              style={{
                display: "inline-block",
                fontFamily: word.isLtr ? THEME.fontLatin : THEME.fontArabic,
                fontSize: isReels ? 34 : 31,
                fontWeight: word.isAccent ? 800 : 700,
                lineHeight: 1.3,
                padding: isCurrent ? "2px 10px" : "2px 4px",
                borderRadius: 8,
                scale: `${wordScale}`,
                backgroundColor: isCurrent
                  ? THEME.goldSolid
                  : "transparent",
                color: isCurrent
                  ? "#09090B"
                  : word.isAccent && isSpoken
                  ? THEME.goldSolid
                  : isSpoken
                  ? "#FAFAFA"
                  : "#A1A1AA",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
