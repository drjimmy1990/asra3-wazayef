import React from "react";
import { THEME } from "../theme";
import { Lock } from "lucide-react";

export const ArchBackdrop: React.FC<{
  readonly dark?: boolean;
}> = ({ dark = false }) => {
  const dotColor = dark ? "#D4AF37" : "#09090B";
  const dotOpacity = dark ? 0.1 : 0.07;
  const bg = dark ? THEME.carbonBlack : THEME.platinumCanvas;
  const patternId = dark ? "arch-dots-dark" : "arch-dots-light";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: bg,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1.3"
              fill={dotColor}
              fillOpacity={dotOpacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

export const BrowserWindow: React.FC<{
  readonly urlLabel?: string;
  readonly darkBody?: boolean;
  readonly width?: number | string;
  readonly children: React.ReactNode;
}> = ({
  urlLabel = "asra3.com",
  darkBody = true,
  width = "100%",
  children,
}) => {
  return (
    <div
      style={{
        width,
        borderRadius: 24,
        border: `1.5px solid ${darkBody ? THEME.carbonBorder : THEME.lightBorder}`,
        backgroundColor: darkBody ? THEME.carbonSurface : THEME.pureWhite,
        boxShadow: darkBody
          ? "0 30px 70px rgba(0, 0, 0, 0.55)"
          : "0 26px 60px rgba(9, 9, 11, 0.14)",
        overflow: "hidden",
      }}
    >
      {/* Top Browser Bar (Motion-Designer Desktop/Web App Container) */}
      <div
        dir="ltr"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          backgroundColor: darkBody ? THEME.carbonBlack : "#F6F7F9",
          borderBottom: `1px solid ${darkBody ? THEME.carbonBorder : THEME.lightBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 9999,
              backgroundColor: "#3F3F46",
            }}
          />
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 9999,
              backgroundColor: "#52525B",
            }}
          />
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 9999,
              backgroundColor: THEME.goldSolid,
            }}
          />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 10,
            backgroundColor: darkBody ? THEME.carbonElevated : THEME.pureWhite,
            border: `1px solid ${darkBody ? THEME.carbonBorder : THEME.lightBorder}`,
            fontFamily: THEME.fontMono,
            fontSize: 15,
            fontWeight: 700,
            color: darkBody ? "#E4E4E7" : "#09090B",
          }}
        >
          <Lock size={14} color={THEME.goldSolid} />
          <span>{urlLabel}</span>
        </div>

        <div
          style={{
            fontFamily: THEME.fontMono,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: THEME.goldSolid,
            backgroundColor: darkBody ? THEME.carbonElevated : THEME.carbonBlack,
            padding: "5px 10px",
            borderRadius: 7,
            border: `1px solid ${THEME.carbonBorder}`,
          }}
        >
          GCC · VERIFIED
        </div>
      </div>

      {/* Framed Real UI Content */}
      <div>{children}</div>
    </div>
  );
};
