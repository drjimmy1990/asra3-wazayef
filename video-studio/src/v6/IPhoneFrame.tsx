import React from "react";
import { THEME } from "../theme";
import { Cam, PHONE, prog, Rect, mSpring, E, clamp } from "./motionCore";
import { Mail } from "lucide-react";

const SIDE_BUTTONS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, 142, 28],
  [-1, 212, 50],
  [-1, 276, 50],
  [1, 238, 98],
];

/**
 * Realistic Titanium iPhone 16 Pro hardware shell ported from kaventro/motion-designer
 * (402 x 874 pt native app coordinate space, Dynamic Island, status bar, side buttons,
 * clipPath rect-morphing from Dot/Icon -> Full Screen -> App Icon, plus Dynamic Island Mail Banner).
 */
export const IPhoneFrame: React.FC<{
  readonly t: number;
  readonly cam: Cam;
  readonly rect: Rect;
  readonly edge: number;
  readonly buttons: number;
  readonly darkStatusBar?: boolean;
  readonly mailBannerAt?: number;
  readonly mailBannerHideAt?: number;
  readonly children: React.ReactNode;
}> = ({
  t,
  cam,
  rect,
  edge,
  buttons,
  darkStatusBar = false,
  mailBannerAt = 55.1,
  mailBannerHideAt = 58.6,
  children,
}) => {
  const e = (PHONE.bezel + PHONE.frame) * edge;
  const b = PHONE.bezel * edge;

  const bodyX = rect.x - e;
  const bodyY = rect.y - e;
  const bodyW = rect.w + 2 * e;
  const bodyH = rect.h + 2 * e;
  const bodyR = rect.r + e;

  const sbColor = darkStatusBar ? "#FAFAFA" : "#09090B";

  // Dynamic Island iOS Mail Push Notification Banner
  const bannerIn = clamp(mSpring(t, mailBannerAt, 0.44, 0.84), 0, 1.06);
  const bannerOut = prog(t, mailBannerHideAt, 0.3, E.in);
  const bannerVisible = t >= mailBannerAt && t <= mailBannerHideAt + 0.35;
  const bannerY = -88 + bannerIn * 144 - bannerOut * 144;
  const bannerScale = 0.65 + clamp(bannerIn, 0, 1) * 0.35 - bannerOut * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: PHONE.W,
        height: PHONE.H,
        transformOrigin: "0 0",
        translate: `${cam.x.toFixed(2)}px ${cam.y.toFixed(2)}px`,
        scale: `${cam.s.toFixed(4)}`,
        pointerEvents: "none",
      }}
    >
      {/* Realistic Soft Contact Drop Shadow */}
      {edge > 0.002 ? (
        <div
          style={{
            position: "absolute",
            left: bodyX,
            top: bodyY,
            width: bodyW,
            height: bodyH,
            borderRadius: bodyR,
            boxShadow: `0 ${(28 * edge).toFixed(2)}px ${(64 * edge).toFixed(
              2
            )}px rgba(9, 12, 16, ${(0.24 * edge).toFixed(3)})`,
          }}
        />
      ) : null}

      {/* Titanium Side Hardware Buttons */}
      {buttons > 0.01
        ? SIDE_BUTTONS.map(([side, by, bh], idx) => {
            const bw = 3.2 * buttons;
            const ratio = rect.h / PHONE.H;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left:
                    side < 0
                      ? bodyX - bw + 0.6
                      : bodyX + bodyW - 0.6,
                  top: rect.y + by * ratio,
                  width: bw,
                  height: bh * ratio,
                  borderRadius: 1.5,
                  backgroundColor: "#2C3035",
                  boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.28)",
                }}
              />
            );
          })
        : null}

      {/* Metallic Titanium Outer Shell + Deep Obsidian Bezel */}
      {edge > 0.002 ? (
        <div
          style={{
            position: "absolute",
            left: bodyX,
            top: bodyY,
            width: bodyW,
            height: bodyH,
            borderRadius: bodyR,
            backgroundColor: "#24282C",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.28), inset 0 0 0 2.5px #14171A",
            overflow: "hidden",
          }}
        >
          {/* Inner Pitch Black Screen Bezel */}
          <div
            style={{
              position: "absolute",
              left: e - b,
              top: e - b,
              width: rect.w + 2 * b,
              height: rect.h + 2 * b,
              borderRadius: rect.r + b,
              backgroundColor: "#060708",
            }}
          />
        </div>
      ) : null}

      {/* Clipped Screen Viewport (Rect-Morphing Container) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: PHONE.W,
          height: PHONE.H,
          overflow: "hidden",
          clipPath: `inset(${rect.y.toFixed(2)}px ${(
            PHONE.W -
            rect.x -
            rect.w
          ).toFixed(2)}px ${(PHONE.H - rect.y - rect.h).toFixed(2)}px ${rect.x.toFixed(
            2
          )}px round ${rect.r.toFixed(2)}px)`,
          backgroundColor: "#FFFFFF",
        }}
      >
        {children}

        {/* Authentic iPhone Status Bar, Dynamic Island & Home Indicator */}
        {edge > 0.35 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: clamp((edge - 0.35) / 0.65, 0, 1),
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {/* 9:41 Time */}
            <div
              dir="ltr"
              style={{
                position: "absolute",
                left: 36,
                top: 15,
                fontFamily: THEME.fontLatin,
                fontSize: 16,
                fontWeight: 700,
                color: sbColor,
                letterSpacing: "-0.02em",
              }}
            >
              9:41
            </div>

            {/* Signal Bars + Battery */}
            <div
              dir="ltr"
              style={{
                position: "absolute",
                right: 26,
                top: 20,
                display: "flex",
                alignItems: "flex-end",
                gap: 2.5,
              }}
            >
              {[5, 7, 9, 11].map((h) => (
                <div
                  key={h}
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 1,
                    backgroundColor: sbColor,
                  }}
                />
              ))}
              <div
                style={{
                  width: 24,
                  height: 11.5,
                  marginLeft: 5,
                  borderRadius: 3.5,
                  border: `1.5px solid ${sbColor}`,
                  padding: 1.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 1.5,
                    backgroundColor: sbColor,
                  }}
                />
              </div>
            </div>

            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                left: 138.5,
                top: 11,
                width: 125,
                height: 36,
                borderRadius: 9999,
                backgroundColor: "#050606",
              }}
            />

            {/* Real iOS Mail Push Notification Dropping Out of Dynamic Island */}
            {bannerVisible ? (
              <div
                dir="rtl"
                lang="ar"
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  top: 0,
                  translate: `0px ${bannerY.toFixed(1)}px`,
                  scale: `${bannerScale.toFixed(3)}`,
                  borderRadius: 20,
                  backgroundColor: "rgba(18, 18, 22, 0.96)",
                  border: `1.5px solid ${THEME.goldSolid}`,
                  boxShadow: "0 14px 32px rgba(0,0,0,0.42)",
                  padding: "11px 13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: THEME.fontArabic,
                  zIndex: 60,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={19} color="#FFFFFF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 900,
                        color: THEME.goldSolid,
                      }}
                    >
                      دعوة مقابلة — مدير الـ HR (دبي)
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#A1A1AA",
                      }}
                    >
                      الآن
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FAFAFA",
                      marginTop: 2,
                    }}
                  >
                    وصل الرد مباشرة إلى بريدك الشخصي ✓
                  </div>
                </div>
              </div>
            ) : null}

            {/* Home Indicator */}
            <div
              style={{
                position: "absolute",
                left: 134,
                top: 860,
                width: 134,
                height: 5,
                borderRadius: 3,
                backgroundColor: sbColor,
                opacity: 0.85,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
