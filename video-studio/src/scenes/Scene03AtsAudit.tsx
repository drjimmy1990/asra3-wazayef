import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { THEME } from "../theme";
import { CheckCircle2, FileText, Sparkles, UploadCloud } from "lucide-react";

/**
 * Act 03 (336 -> 540 frames / 11.20s -> 18.00s):
 * Local frame 0 -> 204
 * "ارفع سيرتك الآن والنظام يرفع توافق الـ ATS... ويصيغ لك خطاب تقديم تنفيذي مخصص"
 */
export const Scene03AtsAudit: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const cardY = interpolate(frame, [0, 22], [32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // PDF Drop Animation (local frame 10 -> 42)
  const fileDropY = interpolate(frame, [8, 36], [-36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
  });

  const fileDropOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Radial Gauge Climb (58% -> 96%, local frame 34 -> 102 — lands right on "توافق ATS")
  const atsScore = interpolate(frame, [34, 100], [58, 96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - atsScore / 100);

  // Executive AI Cover Letter Unfolds cleanly on seg_06 (local frame 112 -> 124)
  const letterOpacity = interpolate(frame, [112, 124], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const letterY = interpolate(frame, [112, 128], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  const letterLines = [
    "الموضوع: ترشيح تنفيذي — تخصص هندسة المشاريع الكبرى (خبرة 8+ سنوات)",
    "خطاب صِيغ تلقائياً بكلمات ATS المفتاحية المطابقة لسوق الإمارات والسعودية.",
    "إرفاق السيرة المحسَّنة PDF + ضبط الرد المباشر (Reply-To) على بريدك الشخصي.",
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
      <ArchBackdrop dark={false} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          translate: `0px ${cardY}px`,
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
              borderRadius: 10,
              backgroundColor: THEME.carbonBlack,
              color: THEME.goldSolid,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            الخطوة 2 · فحص ورفع السيرة الذاتية
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
            STEP 02 / AI ENGINE
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
          توافق <span style={{ color: THEME.goldMutedInk }}>ATS</span> حقيقي + خطاب تقديم ذكي
        </h2>

        <BrowserWindow urlLabel="asra3.com/#wizard-section" darkBody={false}>
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Step 2 Upload Drop Vault */}
            <div
              style={{
                borderRadius: 16,
                border: `2px dashed ${THEME.goldSolid}`,
                backgroundColor: THEME.mutedSurface,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div
                style={{
                  opacity: fileDropOpacity,
                  translate: `0px ${fileDropY}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: THEME.carbonBlack,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={24} color={THEME.goldSolid} />
                </div>
                <div>
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 18,
                      fontWeight: 800,
                      color: THEME.carbonBlack,
                    }}
                  >
                    Engineer_Profile_2026.pdf
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: THEME.textDarkSecondary,
                    }}
                  >
                    اكتمل استخراج الخبرات والمهارات بنجاح ✓
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 10,
                  backgroundColor: THEME.carbonBlack,
                  color: THEME.goldSolid,
                  padding: "8px 14px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                <UploadCloud size={17} color={THEME.goldSolid} />
                <span>Asra3 AI Ready</span>
              </div>
            </div>

            {/* ATS Radial Gauge Carbon Console */}
            <div
              style={{
                borderRadius: 18,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${THEME.carbonBorder}`,
                padding: "22px 26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    position: "relative",
                    width: 142,
                    height: 142,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width={142}
                    height={142}
                    viewBox="0 0 142 142"
                    style={{ rotate: "-90deg" }}
                  >
                    <circle
                      cx={71}
                      cy={71}
                      r={radius}
                      fill="none"
                      stroke="#27272A"
                      strokeWidth={11}
                    />
                    <circle
                      cx={71}
                      cy={71}
                      r={radius}
                      fill="none"
                      stroke={THEME.goldSolid}
                      strokeWidth={11}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <span
                    dir="ltr"
                    style={{
                      position: "absolute",
                      fontFamily: THEME.fontMono,
                      fontSize: 32,
                      fontWeight: 900,
                      color: THEME.goldSolid,
                    }}
                  >
                    {Math.round(atsScore)}%
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 800,
                      color: THEME.goldSolid,
                    }}
                  >
                    <Sparkles size={16} color={THEME.goldSolid} />
                    تحسين التوافق مع أنظمة الفرز الذكية
                  </span>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#FAFAFA",
                      lineHeight: 1.2,
                    }}
                  >
                    تقييم توافق الـ ATS ارتفع إلى{" "}
                    <span dir="ltr" style={{ fontFamily: THEME.fontMono, color: THEME.goldSolid }}>
                      {Math.round(atsScore)}%
                    </span>
                  </div>
                  <div
                    dir="ltr"
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 2,
                    }}
                  >
                    {["Project Management", "GCC Compliance", "IFRS / PMP"].map(
                      (tag) => (
                        <span
                          key={tag}
                          style={{
                            borderRadius: 8,
                            backgroundColor: THEME.carbonElevated,
                            border: `1px solid ${THEME.carbonBorder}`,
                            padding: "4px 10px",
                            fontFamily: THEME.fontLatin,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#E4E4E7",
                          }}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Bespoke Cover Letter Reveal */}
            <div
              style={{
                opacity: letterOpacity,
                translate: `0px ${letterY}px`,
                borderRadius: 16,
                backgroundColor: THEME.pureWhite,
                border: `2px solid ${THEME.carbonBlack}`,
                borderTop: `4px solid ${THEME.goldSolid}`,
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
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
                    fontSize: 18,
                    fontWeight: 800,
                    color: THEME.carbonBlack,
                  }}
                >
                  خطاب التقديم التنفيذي المخصص (AI Cover Letter)
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 8,
                    backgroundColor: THEME.goldSolid,
                    color: THEME.carbonBlack,
                    padding: "4px 12px",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <CheckCircle2 size={15} color={THEME.carbonBlack} />
                  جاهز للإيداع
                </span>
              </div>

              {letterLines.map((line, i) => {
                const lineAlpha = interpolate(
                  frame,
                  [118 + i * 16, 136 + i * 16],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                );
                return (
                  <div
                    key={i}
                    style={{
                      opacity: lineAlpha,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#3F3F46",
                      paddingInlineStart: 12,
                      borderInlineStart: `3px solid ${THEME.goldSolid}`,
                    }}
                  >
                    {line}
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
