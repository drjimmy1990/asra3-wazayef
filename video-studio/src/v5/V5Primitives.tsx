import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

/**
 * Dynamic breathing architectural backdrop with drifting dot lattice,
 * rotating geometric orbital rings, and deterministic floating dust sparks.
 */
export const KineticAtmosphere: React.FC<{
  readonly dark?: boolean;
  readonly seedOffset?: number;
}> = ({ dark = true, seedOffset = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const patternId = dark ? `v5-grid-dark-${seedOffset}` : `v5-grid-light-${seedOffset}`;
  const gridShiftY = (frame * 0.45) % 40;
  const gridShiftX = (frame * 0.2) % 40;
  const orbitDeg = (frame * 0.35 + seedOffset * 40) % 360;
  const counterOrbitDeg = (-frame * 0.25 + seedOffset * 25) % 360;

  const haloScale = 1 + Math.sin((frame + seedOffset * 15) * 0.05) * 0.04;

  const particles = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: dark ? THEME.carbonBlack : THEME.platinumCanvas,
        overflow: "hidden",
      }}
    >
      {/* Drifting dot lattice */}
      <svg
        width={width + 80}
        height={height + 80}
        style={{
          position: "absolute",
          left: -40,
          top: -40,
          translate: `${gridShiftX}px ${gridShiftY}px`,
        }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1.4"
              fill={dark ? THEME.goldSolid : THEME.carbonBlack}
              fillOpacity={dark ? 0.14 : 0.075}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Atmospheric Center Spotlight Halo (SVG, no CSS background-image) */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          inset: 0,
          scale: `${haloScale}`,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`halo-${patternId}`} cx="50%" cy="44%" r="52%">
            <stop
              offset="0%"
              stopColor={dark ? "#D4AF37" : "#FFFFFF"}
              stopOpacity={dark ? "0.14" : "0.75"}
            />
            <stop
              offset="60%"
              stopColor={dark ? "#D4AF37" : "#D4AF37"}
              stopOpacity={dark ? "0.04" : "0.06"}
            />
            <stop offset="100%" stopColor={dark ? "#09090B" : "#EEF0F4"} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill={`url(#halo-${patternId})`} />
      </svg>

      {/* Counter-rotating orbital rings */}
      <svg
        width={900}
        height={900}
        viewBox="0 0 900 900"
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          marginLeft: -450,
          marginTop: -450,
          rotate: `${orbitDeg}deg`,
          opacity: dark ? 0.22 : 0.16,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <circle
          cx="450"
          cy="450"
          r="390"
          fill="none"
          stroke={THEME.goldSolid}
          strokeWidth="1.5"
          strokeDasharray="10 18"
        />
      </svg>

      <svg
        width={700}
        height={700}
        viewBox="0 0 700 700"
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          marginLeft: -350,
          marginTop: -350,
          rotate: `${counterOrbitDeg}deg`,
          opacity: dark ? 0.16 : 0.12,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <circle
          cx="350"
          cy="350"
          r="295"
          fill="none"
          stroke={dark ? "#FAFAFA" : THEME.carbonBlack}
          strokeWidth="1.2"
          strokeDasharray="4 22"
        />
      </svg>

      {/* Floating deterministic ambient sparks */}
      {particles.map((idx) => {
        const px = 12 + ((idx * 127 + seedOffset * 31) % 76);
        const speed = 0.7 + (idx % 3) * 0.45;
        const py = 95 - (((frame * speed + idx * 140) % 105));
        const pOpacity = interpolate(py, [-5, 15, 75, 95], [0, 0.65, 0.55, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${px}%`,
              top: `${py}%`,
              width: idx % 2 === 0 ? 7 : 5,
              height: idx % 2 === 0 ? 7 : 5,
              borderRadius: 9999,
              backgroundColor: THEME.goldSolid,
              opacity: dark ? pOpacity : pOpacity * 0.65,
              boxShadow: `0 0 12px ${THEME.goldSolid}`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Diagonal metallic sheen ribbon sweeping cleanly across cards or CTAs.
 */
export const MetallicSheenOverlay: React.FC<{
  readonly cycleFrames?: number;
  readonly delay?: number;
}> = ({ cycleFrames = 75, delay = 0 }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - delay) % cycleFrames;
  const sheenX = interpolate(local, [0, 32], [-180, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sheenOpacity = interpolate(local, [0, 12, 26, 32], [0, 0.35, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "inherit",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          bottom: -40,
          left: 0,
          width: 90,
          backgroundColor: "#FFFFFF",
          opacity: sheenOpacity,
          rotate: "20deg",
          translate: `${sheenX}px 0px`,
        }}
      />
    </div>
  );
};
