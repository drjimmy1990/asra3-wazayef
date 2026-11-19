import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { THEME } from "../theme";
import { Check, Globe2, MapPin } from "lucide-react";

/**
 * Act 04 (540 -> 681 frames / 18.00s -> 22.70s):
 * Local frame 0 -> 141
 * "اختر دولتك ومدنك عبر الإمارات، السعودية، قطر، والكويت"
 */
export const Scene04GccMarkets: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Activation frames aligned to spoken country names (~19.95s, ~20.55s, ~21.15s, ~21.70s -> local 58, 76, 94, 111)
  const countries = [
    {
      code: "AE",
      nameAr: "الإمارات العربية المتحدة",
      currency: "AED",
      count: "1,450+ شركة",
      cities: ["دبي", "أبوظبي", "الشارقة"],
      activateFrame: 42,
    },
    {
      code: "SA",
      nameAr: "المملكة العربية السعودية",
      currency: "SAR",
      count: "2,100+ شركة",
      cities: ["الرياض", "جدة", "الدمام ونيوم"],
      activateFrame: 66,
    },
    {
      code: "QA",
      nameAr: "دولة قطر",
      currency: "QAR",
      count: "820+ شركة",
      cities: ["الدوحة", "لوسيل", "مدينة الطاقة"],
      activateFrame: 88,
    },
    {
      code: "KW",
      nameAr: "دولة الكويت",
      currency: "KWD",
      count: "640+ شركة",
      cities: ["مدينة الكويت", "حولي", "السالمية"],
      activateFrame: 108,
    },
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
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: headerOpacity,
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
              backgroundColor: THEME.carbonElevated,
              border: `1px solid ${THEME.carbonBorder}`,
              color: THEME.goldSolid,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <Globe2 size={17} color={THEME.goldSolid} />
            تغطية خليجية مخصصة بالمدن
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 14,
              fontWeight: 800,
              color: THEME.goldSolid,
            }}
          >
            STEP 01 · GCC HUBS
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            opacity: headerOpacity,
            textAlign: "center",
            fontSize: isReels ? 48 : 38,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#FAFAFA",
          }}
        >
          استهدف <span style={{ color: THEME.goldSolid }}>4 أسواق خليجية</span> بأدق المدن
        </h2>

        <BrowserWindow urlLabel="asra3.com/ae · /sa · /qa · /kw" darkBody={true}>
          <div
            style={{
              padding: 28,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 18,
            }}
          >
            {countries.map((c, idx) => {
              const enterScale = interpolate(
                frame,
                [6 + idx * 8, 26 + idx * 8],
                [0.92, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 200 }),
                }
              );

              const active = frame >= c.activateFrame;
              const popBoost = interpolate(
                frame,
                [c.activateFrame, c.activateFrame + 12],
                [0.98, 1.02],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 160 }),
                }
              );

              return (
                <div
                  key={c.code}
                  style={{
                    scale: `${active ? popBoost : enterScale}`,
                    borderRadius: 18,
                    backgroundColor: active
                      ? THEME.carbonElevated
                      : THEME.carbonBlack,
                    border: `2px solid ${
                      active ? THEME.goldSolid : THEME.carbonBorder
                    }`,
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      dir="ltr"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          borderRadius: 8,
                          backgroundColor: active
                            ? THEME.goldSolid
                            : THEME.carbonElevated,
                          color: active ? THEME.carbonBlack : THEME.goldSolid,
                          padding: "5px 12px",
                          fontFamily: THEME.fontMono,
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        {c.code}
                      </span>
                      <span
                        style={{
                          fontFamily: THEME.fontMono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#A1A1AA",
                        }}
                      >
                        {c.currency}
                      </span>
                    </div>

                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9999,
                        backgroundColor: active
                          ? THEME.goldSolid
                          : THEME.carbonBlack,
                        border: `1.5px solid ${
                          active ? THEME.goldSolid : THEME.carbonBorderStrong
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active && (
                        <Check size={16} strokeWidth={3} color={THEME.carbonBlack} />
                      )}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#FAFAFA",
                      }}
                    >
                      {c.nameAr}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: THEME.goldSolid,
                        marginTop: 2,
                      }}
                    >
                      {c.count}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${THEME.carbonBorder}`,
                    }}
                  >
                    {c.cities.map((city) => (
                      <span
                        key={city}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          borderRadius: 8,
                          backgroundColor: THEME.carbonBlack,
                          border: `1px solid ${THEME.carbonBorder}`,
                          padding: "5px 10px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: active ? "#FAFAFA" : "#A1A1AA",
                        }}
                      >
                        <MapPin size={12} color={THEME.goldSolid} />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
