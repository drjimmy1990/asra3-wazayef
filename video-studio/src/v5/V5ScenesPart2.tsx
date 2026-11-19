import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { VelocityDartSvg } from "../components/BrandMark";
import { THEME } from "../theme";
import { KineticAtmosphere, MetallicSheenOverlay } from "./V5Primitives";
import {
  Activity,
  ArrowLeft,
  Ban,
  BellRing,
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  MailCheck,
  MousePointerClick,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";

/**
 * Video 5 Act 04 (Global 1047 -> duration 258 / 34.90s -> 43.50s):
 * Animated SVG Forcefield Dome + Bouncing Packet Deflection + Domain Typing + 100% Blocked
 */
export const V5Scene04ArmorShield: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // VO 36.75s -> local 55: toggle snaps ON
  const shieldActive = frame >= 56;
  const knobX = interpolate(frame, [54, 66], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 170 }),
  });

  const cursorOp = interpolate(frame, [26, 38, 86, 98], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [28, 52], [150, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [28, 52], [65, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Types @current-employer.ae across local 84..156
  const domain = "current-employer.ae";
  const typedCount = Math.round(
    interpolate(frame, [84, 156], [0, domain.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const shownDomain = domain.slice(0, typedCount);

  // Packet bounce physics against the shield barrier (repeating wave driven by frame)
  const waveCycle = (frame % 48) / 48;
  const packetX =
    waveCycle < 0.5
      ? interpolate(waveCycle, [0, 0.5], [140, 290])
      : interpolate(waveCycle, [0.5, 1], [290, 120]);
  const hitFlash = waveCycle >= 0.45 && waveCycle <= 0.62 ? 1 : 0.25;

  const blockedReady = frame >= 162;

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
      <KineticAtmosphere dark={false} seedOffset={4} />

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
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.goldSolid}`,
            color: THEME.goldSolid,
            padding: "8px 18px",
            fontSize: 15,
            fontWeight: 900,
          }}
        >
          <ShieldCheck size={17} />
          درع الحماية النشط • 100% DOMAIN SHIELD
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            lineHeight: 1.22,
            color: THEME.carbonBlack,
          }}
        >
          حجب تلقائي لشركتك{" "}
          <span style={{ color: THEME.goldMutedInk }}>بنسبة 100%</span>
        </h2>

        {/* Animated Shield Deflection Visualizer Stage */}
        <div
          style={{
            width: "100%",
            borderRadius: 24,
            backgroundColor: THEME.carbonBlack,
            border: `2px solid ${shieldActive ? THEME.goldSolid : "#3F3F46"}`,
            boxShadow: "0 28px 65px rgba(9, 9, 11, 0.25)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Animated SVG Shield Barrier Deflection Sandbox */}
          <div
            dir="ltr"
            style={{
              position: "relative",
              height: 120,
              borderRadius: 16,
              backgroundColor: "#141418",
              border: "1px solid #27272A",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 26px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#A1A1AA",
                }}
              >
                DISPATCH PACKETS
              </span>
              <span
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 16,
                  fontWeight: 800,
                  color: THEME.goldSolid,
                }}
              >
                Asra3 Outbox Stream
              </span>
            </div>

            {/* Deflecting packet + Gold Shield Curve */}
            <svg
              width={400}
              height={120}
              viewBox="0 0 400 120"
              style={{ position: "absolute", left: "50%", marginLeft: -200 }}
              aria-hidden="true"
            >
              {/* Gold curved shield dome */}
              <path
                d="M 310 15 Q 275 60 310 105"
                fill="none"
                stroke={shieldActive ? THEME.goldSolid : "#52525B"}
                strokeWidth={shieldActive ? 5 : 2}
                strokeLinecap="round"
                opacity={shieldActive ? hitFlash + 0.35 : 0.4}
              />
              {shieldActive ? (
                <path
                  d="M 322 8 Q 282 60 322 112"
                  fill="none"
                  stroke={THEME.goldSolid}
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  opacity={hitFlash}
                />
              ) : null}

              {/* Flying outbound CV packet bouncing back */}
              <g>
                <line
                  x1={packetX - 24}
                  y1="60"
                  x2={packetX}
                  y2="60"
                  stroke="#EF4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <circle cx={packetX} cy="60" r="8" fill="#EF4444" />
              </g>
            </svg>

            <div
              style={{
                borderRadius: 12,
                backgroundColor: "#450A0A",
                border: "1.5px solid #DC2626",
                padding: "8px 14px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#FCA5A5",
                }}
              >
                0 DELIVERED
              </div>
              <div
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                Your Employer
              </div>
            </div>
          </div>

          {/* Toggle Row */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 14,
              backgroundColor: "#141418",
              border: `1.5px solid ${
                shieldActive ? THEME.goldSolid : "#27272A"
              }`,
              padding: "13px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Lock size={20} color={shieldActive ? THEME.goldSolid : "#71717A"} />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#FAFAFA" }}>
                تفعيل درع استثناء الشركة الحالية
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                position: "relative",
                width: 66,
                height: 36,
                borderRadius: 9999,
                backgroundColor: shieldActive ? THEME.goldSolid : "#3F3F46",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  backgroundColor: THEME.carbonBlack,
                  translate: `${knobX}px 0px`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -6,
                  bottom: -14,
                  opacity: cursorOp,
                  translate: `${cursorX}px ${cursorY}px`,
                }}
              >
                <MousePointerClick size={32} color="#FAFAFA" />
              </div>
            </div>
          </div>

          {/* Domain Input + Block Tag */}
          <div
            dir="ltr"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 14,
              backgroundColor: "#141418",
              border: `1.5px solid ${blockedReady ? "#DC2626" : THEME.goldSolid}`,
              padding: "14px 18px",
            }}
          >
            <span
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 22,
                fontWeight: 800,
                color: "#FAFAFA",
              }}
            >
              @{shownDomain}
              <span style={{ color: THEME.goldSolid }}>
                {frame >= 80 && frame < 164 ? "|" : ""}
              </span>
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 8,
                backgroundColor: blockedReady ? "#450A0A" : "#27272A",
                border: `1px solid ${blockedReady ? "#DC2626" : "#52525B"}`,
                color: blockedReady ? "#FCA5A5" : "#D4D4D8",
                padding: "6px 12px",
                fontFamily: THEME.fontMono,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              <Ban size={14} />
              {blockedReady ? "100% BLOCKED" : "SHIELD ACTIVE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 5 Act 05 (Global 1287 -> duration 480 / 42.90s -> 58.90s):
 * Rocket Packet Streams + Live Self-Drawing SVG Telemetry Area Graph + CSV Sheen + Personal Gmail Bell Toast
 */
export const V5Scene05RocketTelemetry: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const sentCount = Math.round(
    interpolate(frame, [20, 155], [0, 300], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  const hrOpens = Math.round(
    interpolate(frame, [165, 310], [0, 94], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // SVG Area sparkline draws smoothly left -> right (local 165 -> 310)
  const curveLength = 340;
  const curveOffset = interpolate(frame, [165, 310], [curveLength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Periodic golden data dots flying horizontally to HR companies
  const dotCycle = (frame % 36) / 36;
  const bulletX = interpolate(dotCycle, [0, 1], [10, 290]);

  const csvActive = frame >= 306;
  const replyY = interpolate(frame, [368, 392], [38, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const replyOp = interpolate(frame, [368, 384], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bellTilt = frame >= 378 ? Math.sin(frame * 0.5) * 14 : 0;

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
      <KineticAtmosphere dark={true} seedOffset={5} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
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
            padding: "7px 18px",
            fontSize: 15,
            fontWeight: 900,
          }}
        >
          <Activity size={17} />
          إرسال مباشر + لوحة تتبع لحظة بلحظة
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 45 : 39,
            fontWeight: 900,
            lineHeight: 1.22,
            color: "#FAFAFA",
          }}
        >
          تتبع حي، تقرير <span style={{ color: THEME.goldSolid }}>CSV</span>، والردود على بريدك
        </h2>

        {/* High-Density Telemetry Glass Dashboard */}
        <div
          style={{
            width: "100%",
            borderRadius: 24,
            backgroundColor: "rgba(18, 18, 22, 0.94)",
            border: `2px solid ${THEME.goldSolid}`,
            boxShadow: "0 28px 65px rgba(0, 0, 0, 0.65)",
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Top Rocket Stream Strip */}
          <div
            dir="ltr"
            style={{
              borderRadius: 14,
              backgroundColor: THEME.carbonBlack,
              border: "1px solid #27272A",
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <span
              style={{
                borderRadius: 8,
                backgroundColor: THEME.goldSolid,
                color: THEME.carbonBlack,
                padding: "6px 12px",
                fontFamily: THEME.fontLatin,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              ASRA3 TURBO
            </span>

            <svg width={300} height={24} viewBox="0 0 300 24" style={{ flex: 1 }}>
              <line
                x1="8"
                y1="12"
                x2="292"
                y2="12"
                stroke="#27272A"
                strokeWidth="3"
              />
              <circle cx={bulletX} cy="12" r="6" fill={THEME.goldSolid} />
              <circle
                cx={((bulletX + 140) % 280) + 10}
                cy="12"
                r="4"
                fill="#4ADE80"
              />
            </svg>

            <span
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 16,
                fontWeight: 900,
                color: "#86EFAC",
              }}
            >
              {sentCount} / 300 SENT
            </span>
          </div>

          {/* Live Curve + Counters Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.35fr",
              gap: 12,
            }}
          >
            <div
              style={{
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${THEME.goldSolid}`,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#D4D4D8" }}>
                فتح ملفك من مديري التوظيف
              </span>
              <div
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 38,
                  fontWeight: 900,
                  color: THEME.goldSolid,
                  lineHeight: 1.1,
                }}
              >
                {hrOpens} <span style={{ fontSize: 22 }}>HR ✓</span>
              </div>
              <span style={{ fontSize: 12, color: "#86EFAC", fontWeight: 700 }}>
                متابعة فورية لحظة بلحظة
              </span>
            </div>

            {/* Animated SVG Area Trend Curve */}
            <div
              style={{
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: "1px solid #27272A",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#A1A1AA",
                }}
              >
                <span>منحنى قراءة الـ HR المباشر</span>
                <span dir="ltr" style={{ fontFamily: THEME.fontMono, color: THEME.goldSolid }}>
                  LIVE OPEN CURVE
                </span>
              </div>
              <svg width="100%" height={78} viewBox="0 0 320 78">
                <path
                  d="M 6 68 Q 60 62 110 46 T 215 24 T 312 8"
                  fill="none"
                  stroke={THEME.goldSolid}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={curveLength}
                  strokeDashoffset={curveOffset}
                />
                <circle
                  cx="312"
                  cy="8"
                  r="6"
                  fill="#4ADE80"
                  opacity={frame >= 295 ? 1 : 0}
                />
              </svg>
            </div>
          </div>

          {/* Verified Companies Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { co: "Emaar · Dubai", at: 185 },
              { co: "ROSHN · Riyadh", at: 225 },
              { co: "QNB · Doha", at: 265 },
            ].map((item) => {
              const opened = frame >= item.at;
              return (
                <div
                  key={item.co}
                  style={{
                    borderRadius: 12,
                    backgroundColor: "#141418",
                    border: `1px solid ${opened ? THEME.goldSolid : "#27272A"}`,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    {item.co}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: opened ? THEME.goldSolid : "#86EFAC",
                    }}
                  >
                    {opened ? "✓ فتحه الـ HR" : "✓ تم الإيداع"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CSV Verified Pill + Sliding Gmail Interview Invitation */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              dir="ltr"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 12,
                backgroundColor: csvActive ? THEME.goldSolid : "#18181B",
                border: `1.5px solid ${THEME.goldSolid}`,
                color: csvActive ? THEME.carbonBlack : THEME.goldSolid,
                padding: "11px 16px",
                fontFamily: THEME.fontMono,
                fontSize: 14,
                fontWeight: 900,
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              <Download size={16} />
              Report.csv ✓
              {csvActive ? <MetallicSheenOverlay cycleFrames={55} /> : null}
            </div>

            <div
              style={{
                flex: 1,
                opacity: replyOp,
                translate: `0px ${replyY}px`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 12,
                backgroundColor: "#14532D",
                border: "1.5px solid #4ADE80",
                padding: "10px 14px",
              }}
            >
              <BellRing
                size={22}
                color="#86EFAC"
                style={{ rotate: `${bellTilt}deg`, flexShrink: 0 }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}>
                  رد مباشر على إيميلك الشخصي: دعوة مقابلة!
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 12,
                    color: "#BBF7D0",
                  }}
                >
                  Reply-To: personal@gmail.com • Verified HR ✓
                </span>
              </div>
              <MailCheck size={18} color="#86EFAC" style={{ flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 5 Act 06 (Global 1749 -> duration 261 / 58.30s -> 67.00s):
 * Animated SVG Strikethrough Subscription Pill + 3D Tilted Pricing Stage + Metallic Sheen + Apple Pay Dock
 */
export const V5Scene06ThreeDStage: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Animated crimson slash across monthly fees (local 18..48)
  const slashDash = interpolate(frame, [16, 46], [240, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tiers = [
    {
      name: "Launch انطلاقة",
      price: "129",
      desc: "100 شركة + تتبع حي",
      tilt: "-2deg",
      featured: false,
      delay: 48,
    },
    {
      name: "Turbo الأكثر طلباً",
      price: "229",
      desc: "300 شركة + خطاب AI + أولوية",
      tilt: "0deg",
      featured: true,
      delay: 64,
    },
    {
      name: "Hyper VIP",
      price: "349",
      desc: "500+ شركة + إعادة صياغة ATS",
      tilt: "2deg",
      featured: false,
      delay: 80,
    },
  ];

  // Apple Pay + Cards dock rises right around VO 63.4s (local ~153)
  const payY = interpolate(frame, [138, 162], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 170 }),
  });
  const payOp = interpolate(frame, [138, 152], [0, 1], {
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
      <KineticAtmosphere dark={false} seedOffset={6} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 940,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Crossed-out Monthly Subscription Pill */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 9999,
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.goldSolid}`,
            padding: "9px 22px",
            color: THEME.goldSolid,
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          <span>بدون أي اشتراكات شهرية — دفعة واحدة فقط ✓</span>
          <svg
            width="230"
            height="12"
            viewBox="0 0 230 12"
            style={{
              position: "absolute",
              left: 16,
              bottom: -14,
            }}
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="6"
              x2="230"
              y2="6"
              stroke={THEME.goldSolid}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="240"
              strokeDashoffset={slashDash}
            />
          </svg>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 46 : 40,
            fontWeight: 900,
            lineHeight: 1.24,
            color: THEME.carbonBlack,
            marginTop: 6,
          }}
        >
          باقات تبدأ من <span style={{ color: THEME.goldMutedInk }}>129</span> د.إ / ر.س
        </h2>

        {/* 3 Floating Elevated Tier Cards */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          {tiers.map((t) => {
            const yOffset = interpolate(frame, [t.delay, t.delay + 22], [44, t.featured ? -8 : 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 160 }),
            });
            const op = interpolate(frame, [t.delay, t.delay + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={t.name}
                style={{
                  position: "relative",
                  opacity: op,
                  translate: `0px ${yOffset}px`,
                  rotate: t.tilt,
                  borderRadius: 22,
                  backgroundColor: t.featured
                    ? THEME.carbonBlack
                    : THEME.pureWhite,
                  border: t.featured
                    ? `2.5px solid ${THEME.goldSolid}`
                    : `1.5px solid ${THEME.lightBorder}`,
                  boxShadow: t.featured
                    ? "0 26px 55px rgba(9, 9, 11, 0.28)"
                    : "0 12px 30px rgba(9, 9, 11, 0.08)",
                  padding: "22px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: t.featured ? THEME.goldSolid : THEME.carbonBlack,
                      }}
                    >
                      {t.name}
                    </span>
                    {t.featured ? (
                      <Star size={18} color={THEME.goldSolid} fill={THEME.goldSolid} />
                    ) : null}
                  </div>
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: t.featured ? 44 : 34,
                      fontWeight: 900,
                      color: t.featured ? "#FAFAFA" : THEME.carbonBlack,
                      lineHeight: 1.05,
                    }}
                  >
                    {t.price}{" "}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: t.featured ? THEME.goldSolid : THEME.textDarkSecondary,
                      }}
                    >
                      AED/SAR
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    color: t.featured ? "#D4D4D8" : THEME.textDarkSecondary,
                  }}
                >
                  {t.desc}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 800,
                    color: t.featured ? THEME.goldSolid : "#166534",
                  }}
                >
                  <CheckCircle2 size={15} />
                  دفعة واحدة فقط
                </div>

                {t.featured ? (
                  <MetallicSheenOverlay cycleFrames={64} delay={64} />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Payment Trust Bar */}
        <div
          style={{
            opacity: payOp,
            translate: `0px ${payY}px`,
            width: "100%",
            borderRadius: 16,
            backgroundColor: THEME.carbonBlack,
            border: `2px solid ${THEME.goldSolid}`,
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CreditCard size={22} color={THEME.goldSolid} />
            <span style={{ fontSize: 17, fontWeight: 900, color: "#FAFAFA" }}>
              دفع إلكتروني آمن وفوري
            </span>
          </div>

          <div
            dir="ltr"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: THEME.fontLatin,
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {["Apple Pay", "Visa", "Mastercard", "EasyKash"].map((m) => (
              <span
                key={m}
                style={{
                  borderRadius: 8,
                  backgroundColor: "#18181B",
                  border: `1px solid ${m === "Apple Pay" ? THEME.goldSolid : "#3F3F46"}`,
                  color: THEME.goldSolid,
                  padding: "6px 12px",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Video 5 Act 07 (Global 1992 -> duration 258 / 66.40s -> 75.00s):
 * Bespoke Orbiting Golden VelocityDart Finale + Sheen CTA Punch
 */
export const V5Scene07OrbitFinale: React.FC<{
  readonly isReels?: boolean;
  readonly ctaUrl: string;
  readonly ctaLabel: string;
  readonly priceNote: string;
}> = ({ isReels = false, ctaUrl, ctaLabel, priceNote }) => {
  const frame = useCurrentFrame();

  const logoScale = interpolate(frame, [0, 24], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });

  const ringSpin = (frame * 1.1) % 360;

  const line1Op = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [10, 28], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Hero punch on VO "ابدأ الفحص المجاني الآن" (~local frame 108)
  const ctaScale = interpolate(frame, [95, 114, 128, 145], [0.9, 1, 1.07, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const ctaOp = interpolate(frame, [78, 96], [0, 1], {
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
      <KineticAtmosphere dark={true} seedOffset={7} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 24,
        }}
      >
        {/* VelocityDart inside Rotating Geometric Halo */}
        <div
          style={{
            position: "relative",
            scale: `${logoScale}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              position: "relative",
              width: isReels ? 168 : 150,
              height: isReels ? 168 : 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={isReels ? 168 : 150}
              height={isReels ? 168 : 150}
              viewBox="0 0 168 168"
              style={{
                position: "absolute",
                inset: 0,
                rotate: `${ringSpin}deg`,
              }}
              aria-hidden="true"
            >
              <circle
                cx="84"
                cy="84"
                r="78"
                fill="none"
                stroke={THEME.goldSolid}
                strokeWidth="2"
                strokeDasharray="14 10"
              />
            </svg>
            <VelocityDartSvg size={isReels ? 118 : 106} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: isReels ? 52 : 46,
                fontWeight: 900,
                color: "#FAFAFA",
                lineHeight: 1,
              }}
            >
              أسرع
            </span>
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontLatin,
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: THEME.carbonBlack,
                backgroundColor: THEME.goldSolid,
                borderRadius: 10,
                padding: "6px 16px",
              }}
            >
              ASRA3.COM
            </span>
          </div>
        </div>

        <h2
          style={{
            margin: 0,
            opacity: line1Op,
            translate: `0px ${line1Y}px`,
            fontSize: isReels ? 54 : 48,
            fontWeight: 900,
            lineHeight: 1.22,
            color: "#FAFAFA",
          }}
        >
          لا تنتظر الفرصة..{" "}
          <span style={{ color: THEME.goldSolid }}>أوصل لها بنفسك اليوم</span>
        </h2>

        <p
          style={{
            margin: 0,
            opacity: line1Op,
            fontSize: 21,
            fontWeight: 700,
            color: "#D4D4D8",
          }}
        >
          {priceNote}
        </p>

        {/* Metallic Sheen Hero CTA Button */}
        <div
          style={{
            position: "relative",
            opacity: ctaOp,
            scale: `${ctaScale}`,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            borderRadius: 20,
            backgroundColor: THEME.goldSolid,
            color: THEME.carbonBlack,
            padding: "20px 38px",
            fontSize: isReels ? 31 : 28,
            fontWeight: 900,
            boxShadow: "0 20px 48px rgba(212, 175, 55, 0.38)",
            overflow: "hidden",
          }}
        >
          <Send size={24} />
          <span>{ctaLabel}</span>
          <ArrowLeft size={26} strokeWidth={2.75} />
          <MetallicSheenOverlay cycleFrames={60} delay={90} />
        </div>

        <div
          dir="ltr"
          style={{
            opacity: ctaOp,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: THEME.fontMono,
            fontSize: 15,
            fontWeight: 800,
            color: THEME.goldSolid,
          }}
        >
          <span>{ctaUrl}</span>
          <span style={{ color: "#52525B" }}>•</span>
          <span style={{ color: "#D4D4D8" }}>Free Instant ATS Audit</span>
        </div>
      </div>
    </div>
  );
};
