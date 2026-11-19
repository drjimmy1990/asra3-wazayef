import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_SEGMENTS, CaptionSegment, THEME } from "../theme";

/**
 * Arabic RTL word-by-word kinetic caption engine:
 * - Always wraps lines inside `dir="rtl" lang="ar"` so ligatures and word order stay intact.
 * - Never splits Arabic letters into separate inline-blocks (preserves connected Arabic glyph shaping).
 */
export const ArabicCaptions: React.FC<{
  readonly isReels?: boolean;
  readonly segments?: ReadonlyArray<CaptionSegment>;
}> = ({ isReels = false, segments = CAPTION_SEGMENTS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const activeSegment = segments.find(
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
        left: isReels ? 96 : 48,
        right: isReels ? 96 : 48,
        bottom: isReels ? 500 : 54,
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
          backgroundColor: "rgba(9, 9, 11, 0.94)",
          border: `2.5px solid ${THEME.goldSolid}`,
          borderRadius: isReels ? 22 : 18,
          padding: isReels ? "18px 26px" : "15px 28px",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.58)",
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: isReels ? 12 : 10,
          maxWidth: isReels ? 888 : 940,
        }}
      >
        {activeSegment.words.map((word, idx) => {
          const isCurrent =
            timeMs >= word.startMs && timeMs <= word.endMs + 40;
          const isSpoken = timeMs >= word.startMs;

          const wordScale = isCurrent
            ? interpolate(timeMs, [word.startMs, word.startMs + 90], [0.97, 1.06], {
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
                fontSize: isReels ? 44 : 34,
                fontWeight: word.isAccent ? 900 : 800,
                lineHeight: 1.38,
                padding: isCurrent
                  ? isReels
                    ? "3px 12px"
                    : "2px 10px"
                  : isReels
                  ? "3px 5px"
                  : "2px 4px",
                borderRadius: 10,
                scale: `${wordScale}`,
                backgroundColor: isCurrent
                  ? THEME.goldSolid
                  : "transparent",
                color: isCurrent
                  ? "#09090B"
                  : word.isAccent && isSpoken
                  ? THEME.goldSolid
                  : isSpoken
                  ? "#FFFFFF"
                  : "#E4E4E7",
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
