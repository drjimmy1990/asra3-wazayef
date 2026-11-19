import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { THEME } from "../theme";
import { CheckCircle2, EyeOff, Lock, MousePointerClick, ShieldCheck } from "lucide-react";

/**
 * Act 05 (681 -> 807 frames / 22.70s -> 26.90s):
 * Local frame 0 -> 126
 * "وبسرية تامة... احجب شركتك الحالية بنقرة واحدة"
 */
export const Scene05PrivacyShield: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const windowY = interpolate(frame, [0, 22], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Deterministic typing of "my-current-company.ae" from frame 18 -> 54
  const fullDomain = "my-current-company.ae";
  const typedCount = Math.round(
    interpolate(frame, [16, 52], [0, fullDomain.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedDomain = fullDomain.slice(0, typedCount);

  // Deliberate cursor arrives (frames 44 -> 66) and clicks the Gold Toggle at frame 68 (~24.97s)
  const cursorX = interpolate(frame, [42, 66], [220, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [42, 66], [90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorScale = interpolate(frame, [66, 70, 76], [1, 0.84, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(frame, [38, 48, 92, 108], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shieldActive = frame >= 70;
  const toggleKnobX = interpolate(frame, [68, 80], [0, 28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
  });

  const badgeScale = interpolate(frame, [70, 88], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
  });
  const badgeOpacity = interpolate(frame, [70, 82], [0, 1], {
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
        padding: isReels ? "140px 72px 560px" : "48px 52px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <ArchBackdrop dark={false} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          translate: `0px ${windowY}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              backgroundColor: THEME.carbonBlack,
              color: THEME.goldSolid,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <EyeOff size={17} color={THEME.goldSolid} />
            درع الخصوصية والسرية التامة
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 14,
              fontWeight: 800,
              color: THEME.carbonBlack,
            }}
          >
            STEP 04 · EXCLUSION SHIELD
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 38,
            fontWeight: 900,
            lineHeight: 1.2,
            color: THEME.carbonBlack,
          }}
        >
          حماية سرية <span style={{ color: THEME.goldMutedInk }}>100%</span> من شركتك الحالية
        </h2>

        <BrowserWindow urlLabel="asra3.com/#confidentiality" darkBody={false}>
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  backgroundColor: THEME.carbonBlack,
                  border: `1.5px solid ${THEME.goldSolid}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={30} color={THEME.goldSolid} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 800,
                    color: THEME.carbonBlack,
                  }}
                >
                  استثناء جهة عملك الحالية للسرية التامة
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 16,
                    fontWeight: 600,
                    color: THEME.textDarkSecondary,
                  }}
                >
                  لن يصل ملفك أو سيرتك الذاتية لأي بريد تابع لنطاق شركتك الحالية نهائياً.
                </p>
              </div>
            </div>

            {/* Domain Input + Deliberate Toggle Switch */}
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                backgroundColor: THEME.mutedSurface,
                border: `2px solid ${
                  shieldActive ? THEME.goldSolid : THEME.lightBorder
                }`,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Lock size={20} color={THEME.goldSolid} />
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 22,
                    fontWeight: 800,
                    color: THEME.carbonBlack,
                  }}
                >
                  @{typedDomain}
                  {typedCount < fullDomain.length && frame % 12 < 6 ? "|" : ""}
                </span>
              </div>

              {/* Sovereign Toggle + Pointer */}
              <div style={{ position: "relative" }}>
                <div
                  dir="ltr"
                  style={{
                    width: 66,
                    height: 36,
                    borderRadius: 9999,
                    backgroundColor: shieldActive
                      ? THEME.goldSolid
                      : "#D4D4D8",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    border: `2px solid ${
                      shieldActive ? THEME.carbonBlack : "#A1A1AA"
                    }`,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 9999,
                      backgroundColor: THEME.carbonBlack,
                      translate: `${toggleKnobX}px 0px`,
                    }}
                  />
                </div>

                {/* Deliberate Animated Cursor Explaining Click */}
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    left: 26,
                    opacity: cursorOpacity,
                    translate: `${cursorX}px ${cursorY}px`,
                    scale: `${cursorScale}`,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9999,
                      backgroundColor: THEME.carbonBlack,
                      border: `2px solid ${THEME.goldSolid}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
                    }}
                  >
                    <MousePointerClick size={22} color={THEME.goldSolid} />
                  </div>
                </div>
              </div>
            </div>

            {/* Shield Active Confirmation Banner */}
            <div
              style={{
                opacity: badgeOpacity,
                scale: `${badgeScale}`,
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: `2px solid ${THEME.goldSolid}`,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircle2 size={26} color={THEME.goldSolid} />
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    تم حجب نطاق شركتك الحالية بنسبة 100%
                  </div>
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: THEME.goldSolid,
                      marginTop: 2,
                    }}
                  >
                    DISPATCH BLOCK ACTIVE FOR *@{fullDomain}
                  </div>
                </div>
              </div>

              <span
                style={{
                  borderRadius: 10,
                  backgroundColor: THEME.goldSolid,
                  color: THEME.carbonBlack,
                  padding: "7px 14px",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                BLOCKED ✓
              </span>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
