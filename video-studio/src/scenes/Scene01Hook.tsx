import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { VelocityDartSvg } from "../components/BrandMark";
import { THEME } from "../theme";
import { Clock, FileText, Users, Zap } from "lucide-react";

/**
 * Act 01 (0 -> 141 frames / 0.00s -> 4.70s):
 * "سيرتك الذاتية قوية... بس بتضيع وسط زحمة مواقع التوظيف؟"
 */
export const Scene01Hook: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const cardEnter = interpolate(frame, [0, 20], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  const headlineOpacity = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const applicantCount = Math.round(
    interpolate(frame, [38, 108], [142, 1248], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    })
  );

  const queueWarningOpacity = interpolate(frame, [52, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const queueWarningY = interpolate(frame, [52, 72], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Velocity Dart wipe enters at beat pause (frame 118 -> 140)
  const wipeProgress = interpolate(frame, [118, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });

  const wipeTranslateX = interpolate(wipeProgress, [0, 1], [1160, 0], {
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
        padding: isReels ? "140px 76px 560px" : "56px 56px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <ArchBackdrop dark={false} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* Top Kicker */}
        <div
          style={{
            opacity: headlineOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.carbonBorder}`,
            borderRadius: 9999,
            padding: "8px 20px",
          }}
        >
          <VelocityDartSvg size={24} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: THEME.goldSolid,
            }}
          >
            أسرع · ASRA3.COM
          </span>
        </div>

        {/* Bold Editorial Hook Title */}
        <h1
          style={{
            margin: 0,
            opacity: headlineOpacity,
            textAlign: "center",
            fontSize: isReels ? 58 : 54,
            fontWeight: 800,
            lineHeight: 1.24,
            color: THEME.carbonBlack,
          }}
        >
          سيرتك الذاتية{" "}
          <span
            style={{
              display: "inline-block",
              backgroundColor: THEME.carbonBlack,
              color: THEME.goldSolid,
              borderRadius: 14,
              padding: "2px 18px",
            }}
          >
            قوية
          </span>
          <br />
          بس بتضيع في طوابير المواقع؟
        </h1>

        {/* Cramped Portal Application Mockup inside Real Browser Frame */}
        <div
          style={{
            width: "100%",
            scale: `${cardEnter}`,
          }}
        >
          <BrowserWindow urlLabel="job-portal.example/applied" darkBody={false}>
            <div
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Candidate File Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 14,
                  backgroundColor: THEME.mutedSurface,
                  border: `1.5px solid ${THEME.lightBorder}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                        fontSize: 19,
                        fontWeight: 800,
                        color: THEME.carbonBlack,
                      }}
                    >
                      Senior_Specialist_CV.pdf
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: THEME.textDarkSecondary,
                      }}
                    >
                      خبرة مهنية معتمدة • جاهز للمقابلات
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: 8,
                    backgroundColor: "#E4E4E7",
                    padding: "6px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#27272A",
                  }}
                >
                  قيد الانتظار
                </span>
              </div>

              {/* Overcrowded Queue Counter */}
              <div
                style={{
                  opacity: queueWarningOpacity,
                  translate: `0px ${queueWarningY}px`,
                  borderRadius: 16,
                  backgroundColor: "#FEF2F2",
                  border: "1.5px solid #FCA5A5",
                  padding: "20px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: "#DC2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Users size={24} color="#FFFFFF" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#7F1D1D",
                      }}
                    >
                      <span
                        dir="ltr"
                        style={{
                          fontFamily: THEME.fontMono,
                          fontWeight: 900,
                        }}
                      >
                        {applicantCount.toLocaleString("en-US")}+
                      </span>{" "}
                      متقدم على نفس الإعلان!
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#991B1B",
                        marginTop: 4,
                      }}
                    >
                      <Clock size={15} color="#991B1B" />
                      <span>متوسط رد بوابات التوظيف: أسابيع بلا رد</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blurred Stacked Ghost Rows */}
              {[0.7, 0.45].map((op, i) => (
                <div
                  key={i}
                  style={{
                    opacity: op * queueWarningOpacity,
                    borderRadius: 12,
                    backgroundColor: THEME.mutedSurface,
                    border: `1px solid ${THEME.lightBorder}`,
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#71717A",
                  }}
                >
                  <span>تم استلام الطلب في طابور الإعلان العام</span>
                  <span dir="ltr" style={{ fontFamily: THEME.fontMono }}>
                    #QUEUE-{8420 + i * 119}
                  </span>
                </div>
              ))}
            </div>
          </BrowserWindow>
        </div>
      </div>

      {/* Carbon + Sovereign Gold Velocity Wipe into Act 02 */}
      {wipeProgress > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: THEME.carbonBlack,
            borderInlineStart: `8px solid ${THEME.goldSolid}`,
            translate: `${wipeTranslateX}px 0px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Zap size={44} color={THEME.goldSolid} />
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: THEME.goldSolid,
              }}
            >
              تخطَّ الزحمة الآن
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
