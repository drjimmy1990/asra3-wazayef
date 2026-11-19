import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { THEME } from "../theme";
import { Building2, CheckCircle2, MailCheck } from "lucide-react";

/**
 * Act 06 (807 -> 915 frames / 26.90s -> 30.50s):
 * Local frame 0 -> 108
 * "وتابع كل شركة فتحت ملفك لحظة بلحظة"
 */
export const Scene06LiveLedger: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const consoleScale = interpolate(frame, [0, 18], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  const sentCount = Math.round(
    interpolate(frame, [6, 78], [248, 300], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })
  );

  const openCount = Math.round(
    interpolate(frame, [10, 86], [42, 84], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })
  );

  const progressPct = Math.round((sentCount / 300) * 100);

  const ledgerRows = [
    {
      company: "Emaar Properties PJSC",
      city: "دبي · AE",
      flipFrame: 22,
    },
    {
      company: "ROSHN Group (PIF)",
      city: "الرياض · SA",
      flipFrame: 40,
    },
    {
      company: "Qatar National Bank (QNB)",
      city: "الدوحة · QA",
      flipFrame: 58,
    },
    {
      company: "M.H. Alshaya Group",
      city: "الكويت · KW",
      flipFrame: 76,
    },
  ];

  // Deterministic audio-style telemetry wave bars
  const barHeights = [0.45, 0.9, 0.6, 1.0].map((phase, idx) =>
    Math.max(
      0.28,
      0.35 + 0.65 * Math.abs(Math.sin(frame * 0.28 + idx * 1.4 + phase))
    )
  );

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
          gap: 22,
          scale: `${consoleScale}`,
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
              gap: 10,
              borderRadius: 10,
              backgroundColor: THEME.carbonElevated,
              border: `1px solid ${THEME.goldSolid}`,
              color: THEME.goldSolid,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "flex-end",
                gap: 3,
                height: 16,
              }}
            >
              {barHeights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: 3,
                    height: `${Math.round(h * 100)}%`,
                    backgroundColor: THEME.goldSolid,
                    borderRadius: 9999,
                  }}
                />
              ))}
            </span>
            لوحة التتبع الحية لحظة بلحظة
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
            ASRA3.COM/TRACK
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 38,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#FAFAFA",
          }}
        >
          شاهد كل <span style={{ color: THEME.goldSolid }}>إيداع وفتح HR</span> مباشرة
        </h2>

        <BrowserWindow urlLabel="asra3.com/track/ASR-955675" darkBody={true}>
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Top KPI & Progress Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: THEME.carbonBlack,
                  border: `1px solid ${THEME.carbonBorder}`,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#A1A1AA" }}>
                  إجمالي المودعة
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontEditorial,
                    fontSize: 42,
                    fontWeight: 700,
                    color: "#FAFAFA",
                    lineHeight: 1.05,
                    marginTop: 4,
                  }}
                >
                  {sentCount} / 300
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: THEME.carbonBlack,
                  border: `1.5px solid ${THEME.goldSolid}`,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.goldSolid }}>
                  فُتحت من مديري الـ HR
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontEditorial,
                    fontSize: 42,
                    fontWeight: 700,
                    color: THEME.goldSolid,
                    lineHeight: 1.05,
                    marginTop: 4,
                  }}
                >
                  {openCount} ✓
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: THEME.carbonBlack,
                  border: `1px solid ${THEME.carbonBorder}`,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#A1A1AA" }}>
                  نسبة التقدم
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontEditorial,
                    fontSize: 42,
                    fontWeight: 700,
                    color: "#FAFAFA",
                    lineHeight: 1.05,
                    marginTop: 4,
                  }}
                >
                  {progressPct}%
                </div>
              </div>
            </div>

            {/* Delivery Ledger Rows Flipping to Opened */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ledgerRows.map((row) => {
                const opened = frame >= row.flipFrame;
                return (
                  <div
                    key={row.company}
                    style={{
                      borderRadius: 14,
                      backgroundColor: THEME.carbonBlack,
                      border: `1.5px solid ${
                        opened ? THEME.goldSolid : THEME.carbonBorder
                      }`,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Building2 size={20} color={THEME.goldSolid} />
                      <div>
                        <div
                          dir="ltr"
                          style={{
                            fontFamily: THEME.fontLatin,
                            fontSize: 17,
                            fontWeight: 800,
                            color: "#FAFAFA",
                          }}
                        >
                          {row.company}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#A1A1AA",
                          }}
                        >
                          {row.city}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 8,
                        backgroundColor: opened
                          ? THEME.goldSolid
                          : THEME.carbonElevated,
                        color: opened ? THEME.carbonBlack : "#E4E4E7",
                        border: `1px solid ${
                          opened ? THEME.goldSolid : THEME.carbonBorder
                        }`,
                        padding: "6px 14px",
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {opened ? (
                        <CheckCircle2 size={15} color={THEME.carbonBlack} />
                      ) : (
                        <MailCheck size={15} color={THEME.goldSolid} />
                      )}
                      <span>
                        {opened ? "فُتح من مسؤول التوظيف ✓" : "تم الإيداع"}
                      </span>
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
