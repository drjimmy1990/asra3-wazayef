import React from "react";
import { THEME } from "../theme";

export const VelocityDartSvg: React.FC<{
  readonly size?: number;
}> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect
      x="1"
      y="1"
      width="62"
      height="62"
      rx="14"
      fill="#09090B"
      stroke="#27272A"
      strokeWidth="1.5"
    />
    <rect
      x="5"
      y="5"
      width="54"
      height="54"
      rx="10"
      stroke="#D4AF37"
      strokeOpacity="0.28"
      strokeWidth="1"
    />
    <path d="M14 21H36L53 32L36 43H14L25.5 32L14 21Z" fill="#D4AF37" />
    <path d="M12 27.2H26.5L33 32L26.5 36.8H12L17.5 32L12 27.2Z" fill="#09090B" />
    <circle cx="51" cy="16.5" r="2.8" fill="#FAFAFA" />
    <path
      d="M42.5 16.5H46.5"
      stroke="#D4AF37"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const BrandLockup: React.FC<{
  readonly darkSurface?: boolean;
  readonly scale?: number;
}> = ({ darkSurface = true, scale = 1 }) => (
  <div
    dir="rtl"
    lang="ar"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16 * scale,
      fontFamily: THEME.fontArabic,
    }}
  >
    <VelocityDartSvg size={58 * scale} />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 * scale }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
        <span
          style={{
            fontSize: 32 * scale,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: darkSurface ? "#FAFAFA" : "#09090B",
          }}
        >
          أسرع
        </span>
        <span
          dir="ltr"
          style={{
            fontFamily: THEME.fontLatin,
            fontSize: 13 * scale,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "#D4AF37",
            backgroundColor: "#09090B",
            border: "1px solid #27272A",
            borderRadius: 6 * scale,
            padding: `${4 * scale}px ${9 * scale}px`,
          }}
        >
          ASRA3.COM
        </span>
      </div>
      <span
        style={{
          fontSize: 13 * scale,
          fontWeight: 600,
          color: darkSurface ? "#A1A1AA" : "#52525B",
        }}
      >
        توظَّف أسرع — التوزيع المباشر للـ HR في الخليج
      </span>
    </div>
  </div>
);
