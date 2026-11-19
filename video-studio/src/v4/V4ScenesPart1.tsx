import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { BrandLockup } from "../components/BrandMark";
import { THEME } from "../theme";
import {
  AlertOctagon,
  CheckCircle2,
  FileText,
  Globe2,
  Layers,
  MapPin,
  MousePointerClick,
  ScanLine,
  Sparkles,
  UploadCloud,
} from "lucide-react";

/**
 * Video 4 Act 01 (0 -> 231 frames / 0.00s -> 7.70s):
 * Crowded job portal queue burying strong candidate CV -> Zero replies alert
 */
export const V4Scene01BrokenPortals: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const cardScale = interpolate(frame, [0, 20], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Buried applicant stack counter racing upward from 140 -> 1,482
  const applicantCount = Math.round(
    interpolate(frame, [16, 150], [140, 1482], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Staggered generic resumes sliding on top of candidate card
  const coverStack1 = interpolate(frame, [40, 70], [45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const coverStack2 = interpolate(frame, [85, 115], [45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Zero replies stamp slams at frame 182 (~6.06s when VO asks "وما يجيك أي رد؟")
  const slamScale = interpolate(frame, [182, 198], [1.65, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const slamOpacity = interpolate(frame, [182, 192], [0, 1], {
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
        padding: isReels ? "130px 72px 620px" : "48px 52px 175px",
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
          gap: 24,
        }}
      >
        <div
          dir="ltr"
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
          <Layers size={17} color="#FCA5A5" />
          <span
            style={{
              fontFamily: THEME.fontLatin,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#FCA5A5",
            }}
          >
            TRADITIONAL PORTALS PROBLEM
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 52 : 46,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          ليش ملفك القوي{" "}
          <span style={{ color: "#EF4444" }}>يضيع بين آلاف السير؟</span>
        </h1>

        <div style={{ width: "100%", scale: `${cardScale}` }}>
          <BrowserWindow urlLabel="legacy-job-portal.com/queue" darkBody={true}>
            <div
              style={{
                position: "relative",
                padding: 28,
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
                <span
                  style={{ fontSize: 18, fontWeight: 800, color: "#D4D4D8" }}
                >
                  المتقدمون لنفس الوظيفة في الخليج
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#EF4444",
                    backgroundColor: "#450A0A",
                    border: "1px solid #DC2626",
                    borderRadius: 10,
                    padding: "6px 14px",
                  }}
                >
                  #{applicantCount.toLocaleString()} IN QUEUE
                </span>
              </div>

              {/* Sliding crowded cards burying user's CV */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 12,
                  backgroundColor: "#18181B",
                  border: "1px solid #3F3F46",
                  padding: "12px 18px",
                  opacity: interpolate(frame, [40, 58], [0.2, 0.9], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: `0px ${coverStack1}px`,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: "#A1A1AA" }}>
                  840+ متقدم عشوائي من خارج المنطقة
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 12,
                    color: "#71717A",
                  }}
                >
                  UNREAD
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 12,
                  backgroundColor: "#18181B",
                  border: "1px solid #3F3F46",
                  padding: "12px 18px",
                  opacity: interpolate(frame, [85, 102], [0.2, 0.95], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: `0px ${coverStack2}px`,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: "#A1A1AA" }}>
                  600+ سيرة مكررة في صندوق الإعلان العام
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 12,
                    color: "#71717A",
                  }}
                >
                  QUEUED
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  backgroundColor: "#27200B",
                  border: `1.5px solid ${THEME.goldSolid}`,
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={20} color={THEME.goldSolid} />
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: THEME.goldSolid,
                    }}
                  >
                    سيرتك الذاتية القوية (مدفونة في الأسفل)
                  </span>
                </div>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#FCA5A5",
                  }}
                >
                  BURIED #1,482
                </span>
              </div>

              {/* Zero Replies Slam Stamp */}
              <div
                style={{
                  opacity: slamOpacity,
                  scale: `${slamScale}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderRadius: 12,
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  padding: "12px 18px",
                }}
              >
                <AlertOctagon size={20} />
                <span style={{ fontSize: 18, fontWeight: 900 }}>
                  0 ردود من مسؤولي التوظيف — لم يفتح أحد ملفك!
                </span>
              </div>
            </div>
          </BrowserWindow>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 4 Act 02 (231 -> 654 frames / 7.70s -> 21.80s):
 * Local frames 0 -> 423
 * Brand intro + 4 GCC Countries selected dynamically + 5,100+ verified counter + Specialty click
 */
export const V4Scene02GccRadar: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hub activations timed to narrator reading "الإمارات، السعودية، قطر، والكويت" (VO ~14.15s = local frame 193..260)
  const hubs = [
    {
      code: "AE",
      name: "الإمارات العربية المتحدة",
      cities: "دبي · أبوظبي · الشارقة",
      count: "1,450+",
      activeAt: 188,
    },
    {
      code: "SA",
      name: "المملكة العربية السعودية",
      cities: "الرياض · جدة · نيوم",
      count: "2,100+",
      activeAt: 210,
    },
    {
      code: "QA",
      name: "دولة قطر",
      cities: "الدوحة · لوسيل · الوكرة",
      count: "820+",
      activeAt: 232,
    },
    {
      code: "KW",
      name: "دولة الكويت",
      cities: "مدينة الكويت · حولي",
      count: "640+",
      activeAt: 254,
    },
  ];

  // Counter rolling smoothly up to 5,010+ real GCC verified network when narrator hits 17.30s (local ~288)
  const totalCount = Math.round(
    interpolate(frame, [188, 340], [1450, 5010], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Specialty bar enters at local frame 310 (~18.0s) and cursor picks Engineering/Tech
  const specialtySelected = frame >= 340;
  const cursorOpacity = interpolate(
    frame,
    [170, 185, 365, 385],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const cursorX = interpolate(frame, [185, 254, 340], [140, -140, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [185, 254, 340], [-40, 40, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
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
        padding: isReels ? "130px 72px 620px" : "48px 52px 175px",
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
          alignItems: "center",
          gap: 20,
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BrandLockup darkSurface={false} scale={0.78} />
          <div
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
            <Globe2 size={17} color={THEME.goldSolid} />
            <span dir="ltr" style={{ fontFamily: THEME.fontMono }}>
              {totalCount.toLocaleString()}+ GCC HR
            </span>
          </div>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            lineHeight: 1.24,
            color: THEME.carbonBlack,
          }}
        >
          اختر دولتك ومدنك عبر{" "}
          <span style={{ color: THEME.goldMutedInk }}>4 أسواق خليجية</span>
        </h2>

        <BrowserWindow
          urlLabel="asra3.com/ae · /sa · /qa · /kw"
          darkBody={false}
        >
          <div
            style={{
              position: "relative",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* 2x2 GCC Hub Matrix lighting sequentially */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {hubs.map((hub) => {
                const isSelected = frame >= hub.activeAt;
                const popScale = isSelected
                  ? interpolate(
                      frame,
                      [hub.activeAt, hub.activeAt + 12],
                      [0.95, 1],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.spring({ damping: 180 }),
                      }
                    )
                  : 0.98;

                return (
                  <div
                    key={hub.code}
                    style={{
                      scale: `${popScale}`,
                      borderRadius: 14,
                      backgroundColor: isSelected
                        ? THEME.carbonBlack
                        : "#F8F9FB",
                      border: `2px solid ${
                        isSelected ? THEME.goldSolid : THEME.lightBorder
                      }`,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
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
                        dir="ltr"
                        style={{
                          fontFamily: THEME.fontMono,
                          fontSize: 13,
                          fontWeight: 900,
                          color: isSelected
                            ? THEME.carbonBlack
                            : THEME.textDarkSecondary,
                          backgroundColor: isSelected
                            ? THEME.goldSolid
                            : "#E4E4E7",
                          borderRadius: 6,
                          padding: "3px 8px",
                        }}
                      >
                        {hub.code} · {hub.count}
                      </span>
                      <CheckCircle2
                        size={18}
                        color={isSelected ? THEME.goldSolid : "#D4D4D8"}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: isSelected ? "#FAFAFA" : THEME.carbonBlack,
                      }}
                    >
                      {hub.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isSelected ? "#D4D4D8" : THEME.textDarkSecondary,
                      }}
                    >
                      <MapPin
                        size={13}
                        color={isSelected ? THEME.goldSolid : "#71717A"}
                      />
                      {hub.cities}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Specialty Selector Strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 6,
                borderTop: `1px solid ${THEME.lightBorder}`,
              }}
            >
              {[
                { label: "الهندسة والمشاريع", active: specialtySelected },
                { label: "تقنية المعلومات", active: false },
                { label: "المالية والمحاسبة", active: false },
                { label: "الإدارة التنفيذية", active: false },
              ].map((spec) => (
                <span
                  key={spec.label}
                  style={{
                    borderRadius: 9999,
                    backgroundColor: spec.active
                      ? THEME.goldSolid
                      : THEME.mutedSurface,
                    border: `1.5px solid ${
                      spec.active ? THEME.carbonBlack : THEME.lightBorder
                    }`,
                    color: THEME.carbonBlack,
                    padding: "7px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {spec.label} {spec.active ? "✓" : ""}
                </span>
              ))}
            </div>

            {/* Animated Interactive Cursor */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                opacity: cursorOpacity,
                translate: `${cursorX}px ${cursorY}px`,
                pointerEvents: "none",
                filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.35))",
              }}
            >
              <MousePointerClick size={36} color={THEME.goldSolid} />
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 4 Act 03 (654 -> 1056 frames / 21.80s -> 35.20s):
 * Local frames 0 -> 402
 * Free PDF Upload -> AI Skill Parse -> 49% -> 96% ATS Gauge -> Live Typing Executive Cover Letter + 3x
 */
export const V4Scene03AiEngine: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Scanner laser sweeps local frames 48..145
  const scanY = interpolate(frame, [48, 130], [0, 140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanVisible = frame >= 44 && frame <= 145;

  // Gauge leaps 49 -> 96 between local frames 160..225 ("يرفع توافقها مع أنظمة ATS")
  const atsScore = Math.round(
    interpolate(frame, [160, 225], [49, 96], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  const ringRadius = 46;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - atsScore / 100);

  // Live typing AI Cover Letter between local frames 245..345 ("ويصيغ لك خطاب تقديم تنفيذي مخصص")
  const coverDraft =
    "Dear Hiring Committee, Following my 8+ yrs in GCC delivery...";
  const typedLen = Math.round(
    interpolate(frame, [242, 330], [0, coverDraft.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visibleCover = coverDraft.slice(0, typedLen);

  // 3x Multiplier punch at local frame 342 (~33.2s)
  const boostScale = interpolate(frame, [340, 358], [0.86, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
  });
  const boostOpacity = interpolate(frame, [340, 352], [0, 1], {
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
        padding: isReels ? "130px 72px 620px" : "48px 52px 175px",
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
          gap: 20,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            backgroundColor: "#27200B",
            border: `1.5px solid ${THEME.goldSolid}`,
            color: THEME.goldSolid,
            padding: "8px 18px",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          <Sparkles size={17} color={THEME.goldSolid} />
          فحص مجاني فوري • AI ATS + خطاب تقديم
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          رفع توافق <span style={{ color: THEME.goldSolid }}>ATS</span> + خطاب تقديم يضاعف فرصك{" "}
          <span style={{ color: THEME.goldSolid }}>3×</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com/#wizard-step2" darkBody={true}>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Top Split: PDF Scanner + Live Gauge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${
                  frame >= 190 ? THEME.goldSolid : THEME.carbonBorder
                }`,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <UploadCloud size={22} color={THEME.goldSolid} />
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    Candidate_CV_2026.pdf
                  </span>
                  <span
                    style={{
                      borderRadius: 6,
                      backgroundColor: "#14532D",
                      color: "#86EFAC",
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "3px 8px",
                    }}
                  >
                    فحص مجاني ✓
                  </span>
                </div>

                {/* Extracted Skills revealing staggered */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { text: "GCC Market Fit", at: 75 },
                    { text: "ATS Parser Ready", at: 105 },
                    { text: "Executive Keywords", at: 135 },
                  ].map((chip) => (
                    <span
                      key={chip.text}
                      dir="ltr"
                      style={{
                        opacity: frame >= chip.at ? 1 : 0.2,
                        borderRadius: 8,
                        backgroundColor: "#18181B",
                        border: `1px solid ${
                          frame >= chip.at ? THEME.goldSolid : "#3F3F46"
                        }`,
                        color: frame >= chip.at ? THEME.goldSolid : "#71717A",
                        padding: "5px 10px",
                        fontFamily: THEME.fontMono,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ✓ {chip.text}
                    </span>
                  ))}
                </div>

                {scanVisible ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: -10,
                      translate: `0px ${scanY}px`,
                      height: 3,
                      backgroundColor: THEME.goldSolid,
                      boxShadow: "0 0 14px rgba(212, 175, 55, 0.9)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ScanLine size={16} color={THEME.goldSolid} />
                  </div>
                ) : null}
              </div>

              {/* Radial ATS Ring Gauge */}
              <div
                style={{
                  position: "relative",
                  width: 112,
                  height: 112,
                  flexShrink: 0,
                }}
              >
                <svg width={112} height={112} viewBox="0 0 112 112">
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke="#27272A"
                    strokeWidth="10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke={atsScore >= 85 ? THEME.goldSolid : "#EF4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 56 56)"
                  />
                </svg>
                <div
                  dir="ltr"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 24,
                      fontWeight: 900,
                      color: atsScore >= 85 ? THEME.goldSolid : "#FCA5A5",
                    }}
                  >
                    {atsScore}%
                  </span>
                  <span
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#A1A1AA",
                    }}
                  >
                    ATS
                  </span>
                </div>
              </div>
            </div>

            {/* Live AI Cover Letter Box + 3x Badge */}
            <div
              style={{
                borderRadius: 16,
                backgroundColor: "#141418",
                border: "1.5px solid #27272A",
                padding: "16px 20px",
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
                    fontSize: 17,
                    fontWeight: 800,
                    color: THEME.goldSolid,
                  }}
                >
                  ✨ خطاب التقديم التنفيذي المخصص (AI Cover Letter)
                </span>
                <span
                  style={{
                    opacity: boostOpacity,
                    scale: `${boostScale}`,
                    borderRadius: 9999,
                    backgroundColor: THEME.goldSolid,
                    color: THEME.carbonBlack,
                    padding: "4px 12px",
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  3× مقابلات أسرع
                </span>
              </div>

              <div
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 15,
                  color: "#E4E4E7",
                  backgroundColor: THEME.carbonBlack,
                  borderRadius: 10,
                  padding: "12px 14px",
                  minHeight: 46,
                }}
              >
                {visibleCover}
                <span style={{ color: THEME.goldSolid }}>
                  {frame >= 240 ? "|" : ""}
                </span>
              </div>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
