import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { BrandLockup } from "../components/BrandMark";
import { THEME } from "../theme";
import { KineticAtmosphere, MetallicSheenOverlay } from "./V5Primitives";
import {
  AlertOctagon,
  CheckCircle2,
  Cpu,
  FileText,
  Globe2,
  Layers,
  MapPin,
  MousePointerClick,
  PenTool,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/**
 * Video 5 Act 01 (Global 0 -> 240, overlaps 222..240):
 * 3D cascading job-portal CV trap + flat response bar + crimson zero-replies stamp
 */
export const V5Scene01KineticFunnel: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Gentle dramatic camera push-in
  const camScale = interpolate(frame, [0, 222], [1, 1.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const queueCount = Math.round(
    interpolate(frame, [14, 155], [120, 1482], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Incoming burying resume sheets dropping diagonally into stack (subtle tilt without text collision)
  const fallingCards = [
    { start: 18, tilt: "-1.1deg", label: "840+ متقدم عشوائي من خارج الخليج", tag: "UNREAD" },
    { start: 52, tilt: "0.9deg", label: "600+ سيرة مكررة في الإعلان العام", tag: "QUEUED" },
    { start: 88, tilt: "-0.7deg", label: "ملفات بصيغة صور غير مقروءة للنظام", tag: "DROPPED" },
  ];

  // Zero-replies alarm slams at frame 180 (~6.00s when VO hits "وما يجيك أي رد؟")
  const stampScale = interpolate(frame, [178, 194], [1.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const stampOpacity = interpolate(frame, [178, 188], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barWidthPct = interpolate(frame, [45, 150], [68, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
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
        padding: isReels ? "125px 70px 615px" : "48px 52px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <KineticAtmosphere dark={true} seedOffset={1} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          scale: `${camScale}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
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
            border: "1.5px solid #EF4444",
            padding: "8px 20px",
            boxShadow: "0 0 28px rgba(239, 68, 68, 0.25)",
          }}
        >
          <Layers size={17} color="#FCA5A5" />
          <span
            style={{
              fontFamily: THEME.fontLatin,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#FCA5A5",
            }}
          >
            TRADITIONAL PORTALS FUNNEL
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 50 : 44,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          ليش ملفك القوي{" "}
          <span style={{ color: "#EF4444" }}>يضيع وسط الزحمة؟</span>
        </h1>

        {/* Kinetic Glassmorphic Portal Queue Visualizer */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 24,
            backgroundColor: "rgba(18, 18, 22, 0.92)",
            border: "1.5px solid #27272A",
            boxShadow: "0 30px 70px rgba(0,0,0,0.65)",
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 17,
          }}
        >
          {/* Live Counter Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: "#D4D4D8" }}>
              ترتيب السير الذاتية على بوابات التوظيف
            </span>
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 22,
                fontWeight: 900,
                color: "#FCA5A5",
                backgroundColor: "#450A0A",
                border: "1px solid #DC2626",
                borderRadius: 10,
                padding: "5px 14px",
              }}
            >
              #{queueCount.toLocaleString()} QUEUED
            </span>
          </div>

          {/* Animated Falling Sheets */}
          {fallingCards.map((c) => {
            const dropY = interpolate(frame, [c.start, c.start + 22], [-55, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 170 }),
            });
            const cardOp = interpolate(frame, [c.start, c.start + 14], [0, 0.94], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={c.tag}
                style={{
                  opacity: cardOp,
                  translate: `0px ${dropY}px`,
                  rotate: c.tilt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 12,
                  backgroundColor: "#18181B",
                  border: "1px solid #3F3F46",
                  padding: "11px 16px",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: "#D4D4D8" }}>
                  {c.label}
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#71717A",
                  }}
                >
                  {c.tag}
                </span>
              </div>
            );
          })}

          {/* Candidate's strong CV crushed at bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 14,
              backgroundColor: "#27200B",
              border: `1.5px solid ${THEME.goldSolid}`,
              padding: "13px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={20} color={THEME.goldSolid} />
              <span style={{ fontSize: 18, fontWeight: 900, color: THEME.goldSolid }}>
                ملفك التنفيذي القوي (مدفون أسفل الطابور)
              </span>
            </div>
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 12,
                fontWeight: 900,
                color: "#EF4444",
              }}
            >
              NO VIEW
            </span>
          </div>

          {/* Animated shrinking open-rate meter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#A1A1AA",
              }}
            >
              <span>نسبة وصول ملفك لعين مدير الـ HR</span>
              <span dir="ltr" style={{ fontFamily: THEME.fontMono, color: "#EF4444" }}>
                0.4%
              </span>
            </div>
            <div
              dir="ltr"
              style={{
                height: 8,
                borderRadius: 9999,
                backgroundColor: "#27272A",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barWidthPct}%`,
                  height: "100%",
                  borderRadius: 9999,
                  backgroundColor: "#EF4444",
                }}
              />
            </div>
          </div>

          {/* Dramatic Crimson Stamp */}
          <div
            style={{
              opacity: stampOpacity,
              scale: `${stampScale}`,
              rotate: "-1.5deg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 14,
              backgroundColor: "#DC2626",
              border: "2px solid #FCA5A5",
              color: "#FFFFFF",
              padding: "13px 20px",
              boxShadow: "0 16px 36px rgba(220, 38, 38, 0.45)",
            }}
          >
            <AlertOctagon size={22} />
            <span style={{ fontSize: 20, fontWeight: 900 }}>
              0 ردود من مسؤولي التوظيف — لم يفتح أحد سيرتك!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 5 Act 02 (Global start 222 -> Duration 441 / 7.40s -> 22.10s):
 * Animated Vector GCC Hub Graph with flowing Bezier data trajectories,
 * sonar ripples firing sequentially across UAE -> KSA -> Qatar -> Kuwait, + Specialty Cursor
 */
export const V5Scene02GccNetwork: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // VO mentions UAE, KSA, Qatar, Kuwait at VO 14.15s..16.90s -> local frames 202..285
  const hubs = [
    {
      code: "AE",
      country: "الإمارات",
      cities: "دبي · أبوظبي",
      count: "1,450+",
      activeAt: 196,
      x: 78,
      y: 23,
      path: "M 450 185 Q 585 125 715 78",
    },
    {
      code: "SA",
      country: "السعودية",
      cities: "الرياض · جدة · نيوم",
      count: "2,100+",
      activeAt: 218,
      x: 22,
      y: 23,
      path: "M 450 185 Q 315 125 185 78",
    },
    {
      code: "QA",
      country: "قطر",
      cities: "الدوحة · لوسيل",
      count: "820+",
      activeAt: 240,
      x: 78,
      y: 78,
      path: "M 450 185 Q 585 245 715 288",
    },
    {
      code: "KW",
      country: "الكويت",
      cities: "مدينة الكويت · حولي",
      count: "640+",
      activeAt: 262,
      x: 22,
      y: 78,
      path: "M 450 185 Q 315 245 185 288",
    },
  ];

  const totalCompanies = Math.round(
    interpolate(frame, [196, 345], [1450, 5010], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Flowing SVG pulse offset along routes
  const dashFlow = -(frame * 3.5);

  // Specialty bar selection triggered ~local 325
  const specialtyClicked = frame >= 338;
  const cursorOpacity = interpolate(frame, [175, 190, 385, 405], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [196, 262, 338], [180, -180, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [196, 262, 338], [-80, 75, 200], {
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
        padding: isReels ? "125px 70px 615px" : "48px 52px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <KineticAtmosphere dark={false} seedOffset={2} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
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
              borderRadius: 12,
              backgroundColor: THEME.carbonBlack,
              border: `1.5px solid ${THEME.goldSolid}`,
              color: THEME.goldSolid,
              padding: "8px 16px",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            <Globe2 size={18} color={THEME.goldSolid} />
            <span dir="ltr" style={{ fontFamily: THEME.fontMono }}>
              {totalCompanies.toLocaleString()}+ GCC HR
            </span>
          </div>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 45 : 39,
            fontWeight: 900,
            lineHeight: 1.22,
            color: THEME.carbonBlack,
          }}
        >
          تغطية مباشرة لـ{" "}
          <span style={{ color: THEME.goldMutedInk }}>4 أسواق خليجية</span> حسب تخصصك
        </h2>

        {/* Animated Constellation Stage */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 365,
            borderRadius: 24,
            backgroundColor: THEME.pureWhite,
            border: `1.5px solid ${THEME.lightBorder}`,
            boxShadow: "0 24px 60px rgba(9,9,11,0.12)",
            overflow: "hidden",
          }}
        >
          {/* SVG Flowing Bezier Vectors + Sonar Ripples */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 900 365"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden="true"
          >
            {hubs.map((hub) => {
              const active = frame >= hub.activeAt;
              const sonarRadius = active
                ? 24 + ((frame - hub.activeAt) % 36) * 1.4
                : 0;
              const sonarOpacity = active
                ? interpolate((frame - hub.activeAt) % 36, [0, 35], [0.7, 0])
                : 0;

              const nodeCx = hub.code === "AE" || hub.code === "QA" ? 715 : 185;
              const nodeCy = hub.code === "AE" || hub.code === "SA" ? 78 : 288;

              return (
                <g key={hub.code}>
                  <path
                    d={hub.path}
                    fill="none"
                    stroke="#E4E4E7"
                    strokeWidth="2.5"
                  />
                  {active ? (
                    <path
                      d={hub.path}
                      fill="none"
                      stroke={THEME.goldSolid}
                      strokeWidth="3.5"
                      strokeDasharray="14 10"
                      strokeDashoffset={dashFlow}
                    />
                  ) : null}
                  {active ? (
                    <circle
                      cx={nodeCx}
                      cy={nodeCy}
                      r={sonarRadius}
                      fill="none"
                      stroke={THEME.goldSolid}
                      strokeWidth="2.5"
                      opacity={sonarOpacity}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          {/* Center Asra3 Core Octagon */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              translate: "-50% -50%",
              width: 118,
              height: 118,
              borderRadius: 24,
              backgroundColor: THEME.carbonBlack,
              border: `2.5px solid ${THEME.goldSolid}`,
              boxShadow: "0 16px 36px rgba(212, 175, 55, 0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              zIndex: 4,
            }}
          >
            <Cpu size={28} color={THEME.goldSolid} />
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontLatin,
                fontSize: 13,
                fontWeight: 900,
                color: "#FAFAFA",
              }}
            >
              ASRA3 CORE
            </span>
          </div>

          {/* 4 Hub Cards at Coordinates */}
          {hubs.map((hub) => {
            const active = frame >= hub.activeAt;
            const pop = active
              ? interpolate(frame, [hub.activeAt, hub.activeAt + 14], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 165 }),
                })
              : 0.96;

            return (
              <div
                key={hub.code}
                style={{
                  position: "absolute",
                  left: `${hub.x}%`,
                  top: `${hub.y}%`,
                  translate: "-50% -50%",
                  scale: `${pop}`,
                  width: 248,
                  borderRadius: 16,
                  backgroundColor: active ? THEME.carbonBlack : "#F4F5F8",
                  border: `2px solid ${active ? THEME.goldSolid : THEME.lightBorder}`,
                  padding: "12px 16px",
                  boxShadow: active
                    ? "0 16px 34px rgba(9, 9, 11, 0.25)"
                    : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  zIndex: 5,
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
                      fontSize: 12,
                      fontWeight: 900,
                      color: active ? THEME.carbonBlack : THEME.textDarkSecondary,
                      backgroundColor: active ? THEME.goldSolid : "#E4E4E7",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {hub.code} · {hub.count}
                  </span>
                  <CheckCircle2
                    size={16}
                    color={active ? THEME.goldSolid : "#D4D4D8"}
                  />
                </div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: active ? "#FAFAFA" : THEME.carbonBlack,
                  }}
                >
                  {hub.country}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    color: active ? "#D4D4D8" : THEME.textDarkSecondary,
                  }}
                >
                  <MapPin size={13} color={active ? THEME.goldSolid : "#71717A"} />
                  {hub.cities}
                </div>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              opacity: cursorOpacity,
              translate: `${cursorX}px ${cursorY}px`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <MousePointerClick size={36} color={THEME.goldSolid} />
          </div>
        </div>

        {/* Dynamic Specialty Sector Ribbon */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {[
            { name: "الهندسة والمشاريع", active: specialtyClicked },
            { name: "تقنية المعلومات AI", active: frame >= 352 },
            { name: "المالية والاستثمار", active: false },
            { name: "الإدارة التنفيذية", active: false },
          ].map((s) => (
            <div
              key={s.name}
              style={{
                position: "relative",
                borderRadius: 9999,
                backgroundColor: s.active ? THEME.carbonBlack : THEME.pureWhite,
                border: `2px solid ${s.active ? THEME.goldSolid : THEME.lightBorder}`,
                color: s.active ? THEME.goldSolid : THEME.carbonBlack,
                padding: "9px 18px",
                fontSize: 15,
                fontWeight: 900,
                boxShadow: s.active ? "0 10px 24px rgba(0,0,0,0.16)" : "none",
                overflow: "hidden",
              }}
            >
              {s.name} {s.active ? "✓" : ""}
              {s.active ? <MetallicSheenOverlay cycleFrames={60} /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Video 5 Act 03 (Global start 645 -> Duration 420 / 21.50s -> 35.50s):
 * Isometric CV Scan + Animated Morphing Skill Bars + Dual-Orbit ATS Dial (49->96%) + Live Ink Cover Letter + 3x Starburst
 */
export const V5Scene03AiScanAndWrite: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Hologram laser vertical ping-pong sweep (local 35 -> 165)
  const scanY = interpolate(frame, [35, 100, 165], [0, 145, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanning = frame >= 30 && frame <= 170;

  // Dual rotating dial tracks
  const outerRot = (frame * 1.6) % 360;
  const atsScore = Math.round(
    interpolate(frame, [172, 238], [49, 96], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  const ringR = 52;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - atsScore / 100);

  // Morphing extraction skill bars
  const skills = [
    { label: "GCC Experience & Leadership", target: 98, start: 65 },
    { label: "ATS Keyword Compatibility", target: 96, start: 110 },
    { label: "Clean Parser Readability", target: 100, start: 145 },
  ];

  // Live typing AI Cover Letter (local 250 -> 340)
  const letterText =
    "Dear Director, Bringing 8+ yrs of proven GCC project scale...";
  const typedCount = Math.round(
    interpolate(frame, [248, 336], [0, letterText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shownLetter = letterText.slice(0, typedCount);

  // 3x Badge pops at frame 342 (~32.90s when narrator says "يضاعف فرص مقابلاتك 3 أضعاف")
  const boostScale = interpolate(frame, [340, 358], [0.5, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 140 }),
  });
  const boostOp = interpolate(frame, [340, 352], [0, 1], {
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
        padding: isReels ? "125px 70px 615px" : "48px 52px 175px",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      <KineticAtmosphere dark={true} seedOffset={3} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
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
            fontWeight: 900,
          }}
        >
          <Sparkles size={17} color={THEME.goldSolid} />
          محرك الذكاء الاصطناعي — فحص ATS مجاني + خطاب تقديم
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            lineHeight: 1.22,
            color: "#FAFAFA",
          }}
        >
          توافق <span style={{ color: THEME.goldSolid }}>96% ATS</span> + خطاب تقديم يضاعف مقابلاتك{" "}
          <span style={{ color: THEME.goldSolid }}>3×</span>
        </h2>

        {/* Dual-Column Scanner + Orbit Gauge Card */}
        <div
          style={{
            width: "100%",
            borderRadius: 24,
            backgroundColor: "rgba(18, 18, 22, 0.94)",
            border: `2px solid ${frame >= 220 ? THEME.goldSolid : "#27272A"}`,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "0 28px 65px rgba(0, 0, 0, 0.65)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {/* Morphing Skill Progress Bars + Scanner Beam */}
            <div
              style={{
                position: "relative",
                flex: 1,
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: "1px solid #27272A",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                overflow: "hidden",
              }}
            >
              {skills.map((sk) => {
                const w = interpolate(frame, [sk.start, sk.start + 45], [0, sk.target], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                });
                return (
                  <div
                    key={sk.label}
                    dir="ltr"
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: THEME.fontMono,
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#FAFAFA",
                      }}
                    >
                      <span>{sk.label}</span>
                      <span style={{ color: THEME.goldSolid }}>
                        {Math.round(w)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: "#27272A",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          borderRadius: 9999,
                          backgroundColor: THEME.goldSolid,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {scanning ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 10,
                    translate: `0px ${scanY}px`,
                    height: 3,
                    backgroundColor: THEME.goldSolid,
                    boxShadow: "0 0 18px rgba(212, 175, 55, 0.95)",
                  }}
                />
              ) : null}
            </div>

            {/* Dual-Orbit Rotating ATS Gauge */}
            <div
              style={{
                position: "relative",
                width: 148,
                height: 148,
                flexShrink: 0,
              }}
            >
              <svg
                width={148}
                height={148}
                viewBox="0 0 148 148"
                style={{
                  position: "absolute",
                  inset: 0,
                  rotate: `${outerRot}deg`,
                }}
              >
                <circle
                  cx="74"
                  cy="74"
                  r="68"
                  fill="none"
                  stroke={THEME.goldSolid}
                  strokeWidth="2"
                  strokeDasharray="6 10"
                  opacity="0.55"
                />
              </svg>
              <svg width={148} height={148} viewBox="0 0 148 148">
                <circle
                  cx="74"
                  cy="74"
                  r={ringR}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="11"
                />
                <circle
                  cx="74"
                  cy="74"
                  r={ringR}
                  fill="none"
                  stroke={atsScore >= 85 ? THEME.goldSolid : "#EF4444"}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 74 74)"
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
                    fontSize: 30,
                    fontWeight: 900,
                    color: atsScore >= 85 ? THEME.goldSolid : "#FCA5A5",
                  }}
                >
                  {atsScore}%
                </span>
                <span
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#A1A1AA",
                  }}
                >
                  ATS SCORE
                </span>
              </div>
            </div>
          </div>

          {/* Live Ink Cover Letter + Floating 3x Impact Pill */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              backgroundColor: THEME.carbonBlack,
              border: `1.5px solid ${frame >= 260 ? THEME.goldSolid : "#27272A"}`,
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PenTool size={18} color={THEME.goldSolid} />
                <span style={{ fontSize: 18, fontWeight: 900, color: "#FAFAFA" }}>
                  خطاب تقديم تنفيذي يكتبه الذكاء الاصطناعي لكل شركة
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  opacity: boostOp,
                  scale: `${boostScale}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 9999,
                  backgroundColor: THEME.goldSolid,
                  color: THEME.carbonBlack,
                  padding: "6px 14px",
                  fontSize: 15,
                  fontWeight: 900,
                  overflow: "hidden",
                }}
              >
                <TrendingUp size={16} />
                3× فرص مقابلات
                <MetallicSheenOverlay cycleFrames={50} />
              </div>
            </div>

            <div
              dir="ltr"
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 15,
                color: "#E4E4E7",
                backgroundColor: "#141418",
                borderRadius: 10,
                padding: "11px 14px",
                minHeight: 44,
              }}
            >
              {shownLetter}
              <span style={{ color: THEME.goldSolid }}>
                {frame >= 248 ? "|" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
