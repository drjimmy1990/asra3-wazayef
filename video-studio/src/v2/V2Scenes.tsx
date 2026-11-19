import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { BrandLockup, VelocityDartSvg } from "../components/BrandMark";
import { THEME } from "../theme";
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  MailCheck,
  ScanLine,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

/**
 * Video 2 Act 01 (0 -> 132 frames / 0.00s -> 4.40s):
 * "تعرف ليش سيرتك الذاتية تنرفض قبل ما أي مسؤول توظيف يقرأها؟"
 */
export const V2Scene01RejectHook: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const cardScale = interpolate(frame, [0, 18], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Crimson ATS laser sweep across the CV card
  const laserY = interpolate(frame, [10, 56], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rejected stamp slams onto screen at frame 52 (~1.73s)
  const stampScale = interpolate(frame, [52, 66], [1.65, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
  });
  const stampOpacity = interpolate(frame, [52, 60], [0, 1], {
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
        padding: isReels ? "140px 76px 560px" : "52px 56px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <ArchBackdrop dark={true} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 9999,
            backgroundColor: "#450A0A",
            border: "1.5px solid #DC2626",
            padding: "8px 20px",
          }}
        >
          <AlertTriangle size={18} color="#FCA5A5" />
          <span style={{ fontSize: 15, fontWeight: 800, color: "#FCA5A5" }}>
            ATS AUTO-FILTER ALERT
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 56 : 52,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          ليش سيرتك الذاتية{" "}
          <span style={{ color: "#EF4444" }}>تنرفض</span>
          <br />
          قبل ما مسؤول التوظيف يقرأها؟
        </h1>

        <div style={{ width: "100%", scale: `${cardScale}` }}>
          <BrowserWindow urlLabel="ats-bot.internal/scan" darkBody={false}>
            <div
              style={{
                position: "relative",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                overflow: "hidden",
              }}
            >
              {/* Simulated CV Page Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: "#F4F5F8",
                    border: "1.5px solid #DCDFE6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileWarning size={28} color="#DC2626" />
                </div>
                <div>
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 22,
                      fontWeight: 800,
                      color: THEME.carbonBlack,
                    }}
                  >
                    Candidate_Resume_Final.pdf
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#52525B" }}>
                    خبرة قوية + شهادات احترافية — لكن دون تحسين ATS
                  </div>
                </div>
              </div>

              {/* Faux CV Text Lines */}
              {[90, 74, 82].map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    height: 18,
                    width: `${w}%`,
                    borderRadius: 8,
                    backgroundColor: "#E4E4E7",
                  }}
                />
              ))}

              {/* Active Scanning Laser Bar */}
              {frame < 58 && (
                <div
                  style={{
                    position: "absolute",
                    insetInline: 0,
                    top: laserY,
                    height: 4,
                    backgroundColor: "#DC2626",
                    boxShadow: "0 0 18px rgba(220, 38, 38, 0.8)",
                  }}
                />
              )}

              {/* ATS REJECTED STAMP */}
              <div
                style={{
                  opacity: stampOpacity,
                  scale: `${stampScale}`,
                  rotate: "-3deg",
                  alignSelf: "center",
                  marginTop: 8,
                  borderRadius: 16,
                  backgroundColor: "#FEF2F2",
                  border: "3px solid #DC2626",
                  padding: "16px 32px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <XCircle size={34} color="#DC2626" />
                <div>
                  <div
                    style={{ fontSize: 24, fontWeight: 900, color: "#991B1B" }}
                  >
                    استبعاد تلقائي • 49% ATS
                  </div>
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#B91C1C",
                    }}
                  >
                    FILTERED BEFORE HUMAN HR REVIEW
                  </div>
                </div>
              </div>
            </div>
          </BrowserWindow>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 2 Act 02 (132 -> 264 frames / 4.40s -> 8.80s):
 * "أنظمة الفرز الآلي تستبعد نص الملفات من أول ثانية"
 */
export const V2Scene02XrayFilter: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const faults = [
    {
      title: "1. جداول وتصاميم تمنع قراءة النص الحقيقي",
      tag: "PARSER FAIL",
      at: 18,
    },
    {
      title: "2. غياب الكلمات المفتاحية المطلوبة في الخليج",
      tag: "SCORE: 49%",
      at: 44,
    },
    {
      title: "3. التقديم بدون خطاب تقديم تنفيذي مخصص",
      tag: "NO COVER",
      at: 70,
    },
  ];

  // Final Gold Velocity Sweep transitioning into Asra3 at frame 114 -> 131
  const sweepX = interpolate(frame, [112, 131], [1160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.7, 0, 0.2, 1),
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
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          gap: 24,
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
            <ScanLine size={17} color={THEME.goldSolid} />
            تشخيص الاستبعاد في أول ثانية
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 15,
              fontWeight: 900,
              color: "#DC2626",
            }}
          >
            0.4 SEC FILTER
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 42,
            fontWeight: 900,
            color: THEME.carbonBlack,
          }}
        >
          لماذا يُستبعد <span style={{ color: "#DC2626" }}>50%+</span> من الكفاءات آلياً؟
        </h2>

        <BrowserWindow urlLabel="ats-diagnostic/report" darkBody={true}>
          <div
            style={{
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {faults.map((f) => {
              const alpha = interpolate(frame, [f.at, f.at + 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const slideY = interpolate(frame, [f.at, f.at + 18], [16, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 200 }),
              });

              return (
                <div
                  key={f.tag}
                  style={{
                    opacity: alpha,
                    translate: `0px ${slideY}px`,
                    borderRadius: 16,
                    backgroundColor: THEME.carbonBlack,
                    border: "1.5px solid #991B1B",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <XCircle size={26} color="#EF4444" style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 21,
                        fontWeight: 800,
                        color: "#FAFAFA",
                      }}
                    >
                      {f.title}
                    </span>
                  </div>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 13,
                      fontWeight: 900,
                      borderRadius: 8,
                      backgroundColor: "#450A0A",
                      color: "#FCA5A5",
                      padding: "6px 12px",
                      flexShrink: 0,
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </BrowserWindow>
      </div>

      {/* Gold Sweep Wipe into Asra3 Rescue */}
      {frame >= 112 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: THEME.carbonBlack,
            borderInlineStart: `8px solid ${THEME.goldSolid}`,
            translate: `${sweepX}px 0px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            zIndex: 40,
          }}
        >
          <VelocityDartSvg size={54} />
          <span
            style={{ fontSize: 38, fontWeight: 900, color: THEME.goldSolid }}
          >
            الحل عبر أسرع (Asra3.com)
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Video 2 Act 03 (264 -> 414 frames / 8.80s -> 13.80s):
 * "على منصة أسرع.كوم... افحص سيرتك مجاناً لأنظمة الـ ATS"
 */
export const V2Scene03AtsRescue: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const score = interpolate(frame, [46, 126], [49, 96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const checks = [
    { label: "استخراج النص الحقيقي (PDF / DOCX)", frameAt: 64 },
    { label: "مطابقة الكلمات المفتاحية لسوق الخليج", frameAt: 92 },
    { label: "فحص مجاني 100% قبل أي دفع", frameAt: 116 },
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
          alignItems: "center",
          gap: 24,
        }}
      >
        <BrandLockup darkSurface={true} scale={1.0} />

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 42,
            fontWeight: 900,
            color: "#FAFAFA",
          }}
        >
          فحص <span style={{ color: THEME.goldSolid }}>ATS مجاني</span> يرفع قبول ملفك فوراً
        </h2>

        <BrowserWindow urlLabel="asra3.com/#wizard-section" darkBody={true}>
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {/* Giant Dual Comparison Ring */}
            <div
              style={{
                borderRadius: 20,
                backgroundColor: THEME.carbonBlack,
                border: `2px solid ${THEME.goldSolid}`,
                padding: "28px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 28,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 170,
                  height: 170,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width={170}
                  height={170}
                  viewBox="0 0 170 170"
                  style={{ rotate: "-90deg" }}
                >
                  <circle
                    cx={85}
                    cy={85}
                    r={radius}
                    fill="none"
                    stroke="#27272A"
                    strokeWidth={13}
                  />
                  <circle
                    cx={85}
                    cy={85}
                    r={radius}
                    fill="none"
                    stroke={THEME.goldSolid}
                    strokeWidth={13}
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
                    fontSize: 38,
                    fontWeight: 900,
                    color: THEME.goldSolid,
                  }}
                >
                  {Math.round(score)}%
                </span>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#FCA5A5",
                      textDecoration: "line-through",
                    }}
                  >
                    49% REJECTED
                  </span>
                  <span style={{ color: THEME.goldSolid, fontWeight: 900 }}>
                    →
                  </span>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 18,
                      fontWeight: 900,
                      backgroundColor: THEME.goldSolid,
                      color: THEME.carbonBlack,
                      borderRadius: 8,
                      padding: "4px 12px",
                    }}
                  >
                    {Math.round(score)}% READY
                  </span>
                </div>

                {checks.map((c) => {
                  const show = frame >= c.frameAt;
                  return (
                    <div
                      key={c.label}
                      style={{
                        opacity: show ? 1 : 0.25,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <CheckCircle2
                        size={20}
                        color={show ? THEME.goldSolid : "#52525B"}
                      />
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: show ? "#FAFAFA" : "#71717A",
                        }}
                      >
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 2 Act 04 (414 -> 576 frames / 13.80s -> 19.20s):
 * "وخلي الذكاء الاصطناعي يجهّز خطاب تقديم احترافي يضاعف فرصك ثلاث مرات"
 */
export const V2Scene04CoverAndBoost: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const cardY = interpolate(frame, [0, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // 3x Multiplier pops on "يضاعف فرصك ثلاث مرات" around local frame 98 (global 17.07s)
  const boostScale = interpolate(frame, [94, 114], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const boostOpacity = interpolate(frame, [94, 108], [0, 1], {
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
          gap: 22,
          translate: `0px ${cardY}px`,
        }}
      >
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            color: THEME.carbonBlack,
          }}
        >
          خطاب تقديم ذكي يضاعف مقابلاتك{" "}
          <span style={{ color: THEME.goldMutedInk }}>3× أسرع</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com/#cover-letter" darkBody={false}>
          <div
            style={{
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* AI Tailored Executive Letter Card */}
            <div
              style={{
                borderRadius: 18,
                backgroundColor: THEME.pureWhite,
                border: `2px solid ${THEME.carbonBlack}`,
                borderTop: `5px solid ${THEME.goldSolid}`,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                    fontSize: 20,
                    fontWeight: 900,
                    color: THEME.carbonBlack,
                  }}
                >
                  <Sparkles size={20} color={THEME.goldMutedInk} />
                  خطاب تقديم تنفيذي مخصص لخبراتك
                </span>
                <span
                  style={{
                    borderRadius: 8,
                    backgroundColor: THEME.carbonBlack,
                    color: THEME.goldSolid,
                    padding: "5px 12px",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  AI TAILORED ✓
                </span>
              </div>

              {[
                "• صياغة احترافية تربط إنجازاتك مباشرة بمتطلبات مدير التوظيف في الخليج.",
                "• إرسال مباشر لصندوق الوارد مع ملف الـ CV بصيغة PDF وتوجيه الرد لبريدك.",
              ].map((txt, idx) => {
                const lineAlpha = interpolate(
                  frame,
                  [20 + idx * 24, 38 + idx * 24],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                );
                return (
                  <div
                    key={idx}
                    style={{
                      opacity: lineAlpha,
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#3F3F46",
                    }}
                  >
                    {txt}
                  </div>
                );
              })}
            </div>

            {/* 3x Multiplier Hero Banner */}
            <div
              style={{
                opacity: boostOpacity,
                scale: `${boostScale}`,
                borderRadius: 18,
                backgroundColor: THEME.carbonBlack,
                border: `2px solid ${THEME.goldSolid}`,
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: THEME.goldSolid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={32} color={THEME.carbonBlack} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#FAFAFA",
                    }}
                  >
                    توظَّف أسرع بثلاثة أضعاف
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#D4D4D8",
                      marginTop: 4,
                    }}
                  >
                    <MailCheck size={16} color={THEME.goldSolid} />
                    <span>ردود الـ HR تصلك على بريدك الشخصي مباشرة</span>
                  </div>
                </div>
              </div>

              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontEditorial,
                  fontSize: 68,
                  fontWeight: 700,
                  color: THEME.goldSolid,
                  lineHeight: 1,
                }}
              >
                3×
              </span>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
