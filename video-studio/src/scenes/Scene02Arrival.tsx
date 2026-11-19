import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { BrandLockup } from "../components/BrandMark";
import { THEME } from "../theme";
import { MailCheck, Radio, Zap } from "lucide-react";

/**
 * Act 02 (141 -> 336 frames / 4.70s -> 11.20s):
 * Local frame 0 -> 195
 * "مع منصة أسرع.كوم... ملفك بيوصل لمديري التوظيف مباشرة في ثلاث دقائق"
 */
export const Scene02Arrival: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const consoleScale = interpolate(frame, [0, 22], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  const consoleOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 5,010+ verified GCC employers counter climbs on VO "ملفك بيوصل لمديري التوظيف"
  const totalEmployers = Math.round(
    interpolate(frame, [42, 130], [0, 5010], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })
  );

  // "3 دقائق" pill slams in around local frame 135 (~9.2s)
  const pillScale = interpolate(frame, [132, 152], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
  });

  const pillOpacity = interpolate(frame, [132, 144], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const beamProgress = interpolate(frame, [70, 185], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const marketNodes = [
    { code: "AE", name: "الإمارات", count: "1,450+" },
    { code: "SA", name: "السعودية", count: "2,100+" },
    { code: "QA", name: "قطر", count: "820+" },
    { code: "KW", name: "الكويت", count: "640+" },
  ];

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
        padding: isReels ? "140px 72px 560px" : "48px 52px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <ArchBackdrop dark={true} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          alignItems: "center",
          opacity: consoleOpacity,
          scale: `${consoleScale}`,
        }}
      >
        <BrandLockup darkSurface={true} scale={isReels ? 1.1 : 1.0} />

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 44,
            fontWeight: 800,
            lineHeight: 1.25,
            color: "#FAFAFA",
          }}
        >
          توظَّف أسرع.. ملفك يصل مباشرة إلى
          <span style={{ color: THEME.goldSolid }}> مديري الـ HR</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com" darkBody={true}>
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Top Dispatch Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1px solid ${THEME.carbonBorder}`,
                paddingBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Radio size={18} color={THEME.goldSolid} />
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    color: THEME.goldSolid,
                  }}
                >
                  LIVE DISPATCH // GCC HR NETWORK
                </span>
              </div>

              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 13,
                  fontWeight: 800,
                  backgroundColor: THEME.carbonElevated,
                  border: `1px solid ${THEME.carbonBorder}`,
                  color: "#E4E4E7",
                  borderRadius: 8,
                  padding: "4px 12px",
                }}
              >
                MX VERIFIED ✓
              </span>
            </div>

            {/* Monumental Counter + 3 Minutes Callout */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${THEME.carbonBorder}`,
                borderRadius: 18,
                padding: "24px 28px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: THEME.textLightSecondary,
                  }}
                >
                  قاعدة جهات التوظيف الموثقة في الخليج
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontEditorial,
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    color: THEME.goldSolid,
                    marginTop: 4,
                  }}
                >
                  {totalEmployers.toLocaleString("en-US")}+
                </div>
              </div>

              <div
                style={{
                  opacity: pillOpacity,
                  scale: `${pillScale}`,
                  backgroundColor: THEME.goldSolid,
                  color: THEME.carbonBlack,
                  borderRadius: 16,
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Zap size={28} color={THEME.carbonBlack} />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      opacity: 0.85,
                    }}
                  >
                    الإطلاق الفوري
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>
                    خلال 3 دقائق
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connection Progress Sweep */}
            <div
              style={{
                backgroundColor: THEME.carbonBlack,
                borderRadius: 14,
                border: `1px solid ${THEME.carbonBorder}`,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#E4E4E7",
                  marginBottom: 10,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <MailCheck size={18} color={THEME.goldSolid} />
                  <span>Reply-To موجَّه لبريدك الشخصي مباشرة</span>
                </span>
                <span dir="ltr" style={{ fontFamily: THEME.fontMono, color: THEME.goldSolid }}>
                  DIRECT INBOX
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  width: "100%",
                  borderRadius: 9999,
                  backgroundColor: THEME.carbonElevated,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(beamProgress * 100)}%`,
                    backgroundColor: THEME.goldSolid,
                    borderRadius: 9999,
                  }}
                />
              </div>
            </div>

            {/* 4 GCC Hub Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {marketNodes.map((m, idx) => {
                const nodeEnter = interpolate(
                  frame,
                  [20 + idx * 14, 42 + idx * 14],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                );
                return (
                  <div
                    key={m.code}
                    style={{
                      opacity: nodeEnter,
                      backgroundColor: THEME.carbonBlack,
                      border: `1px solid ${THEME.carbonBorder}`,
                      borderRadius: 12,
                      padding: "12px 14px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      dir="ltr"
                      style={{
                        fontFamily: THEME.fontMono,
                        fontSize: 12,
                        fontWeight: 800,
                        color: THEME.goldSolid,
                      }}
                    >
                      {m.code}
                    </span>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#FAFAFA",
                        marginTop: 2,
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      dir="ltr"
                      style={{
                        fontFamily: THEME.fontMono,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#A1A1AA",
                        marginTop: 2,
                      }}
                    >
                      {m.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
