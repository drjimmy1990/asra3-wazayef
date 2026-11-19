import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { BrandLockup } from "../components/BrandMark";
import { THEME } from "../theme";
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  EyeOff,
  Lock,
  MailCheck,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";

/**
 * Video 3 Act 01 (0 -> 186 frames / 0.00s -> 6.20s):
 * "شغّال حالياً وتبغى تنتقل لفرصة أفضل في الخليج... بس خايف سيرتك توصل لمديرك؟"
 */
export const V3Scene01OfficeFear: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const windowScale = interpolate(frame, [0, 18], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Escalate exposure warning when narrator says "بس خايف سيرتك توصل لمديرك؟" (~frame 114)
  const alertOpacity = interpolate(frame, [114, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const alertY = interpolate(frame, [114, 130], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
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
            backgroundColor: "#27200B",
            border: `1.5px solid ${THEME.goldSolid}`,
            padding: "8px 20px",
          }}
        >
          <EyeOff size={17} color={THEME.goldSolid} />
          <span
            style={{
              fontFamily: THEME.fontLatin,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: THEME.goldSolid,
            }}
          >
            STEALTH CAREER UPGRADE
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 54 : 48,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          شغّال حالياً وتبغى{" "}
          <span style={{ color: THEME.goldSolid }}>فرصة أفضل</span>
          <br />
          في الخليج؟
        </h1>

        <div style={{ width: "100%", scale: `${windowScale}` }}>
          <BrowserWindow urlLabel="hr-inbox.current-company.ae" darkBody={false}>
            <div
              style={{
                padding: 30,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: "#F4F5F8",
                      border: "1.5px solid #DCDFE6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={26} color={THEME.carbonBlack} />
                  </div>
                  <div>
                    <div
                      dir="ltr"
                      style={{
                        fontFamily: THEME.fontLatin,
                        fontSize: 20,
                        fontWeight: 800,
                        color: THEME.carbonBlack,
                      }}
                    >
                      director@current-company.ae
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: THEME.textDarkSecondary,
                      }}
                    >
                      صندوق وارد مديرك المباشر و HR شركتك الحالية
                    </div>
                  </div>
                </div>

                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#DC2626",
                    backgroundColor: "#FEE2E2",
                    borderRadius: 8,
                    padding: "6px 12px",
                  }}
                >
                  EXPOSURE RISK
                </span>
              </div>

              <div
                style={{
                  opacity: alertOpacity,
                  translate: `0px ${alertY}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  backgroundColor: "#FEF2F2",
                  border: "1.5px solid #FCA5A5",
                  padding: "16px 20px",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AlertTriangle size={22} color="#DC2626" />
                  <span
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: "#991B1B",
                    }}
                  >
                    هل خايف سيرتك توصل لشركتك الحالية عن طريق الخطأ؟
                  </span>
                </div>
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#FFFFFF",
                    backgroundColor: "#DC2626",
                    borderRadius: 8,
                    padding: "5px 10px",
                    flexShrink: 0,
                  }}
                >
                  ALERT
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
 * Video 3 Act 02 (186 -> 351 frames / 6.20s -> 11.70s):
 * Local frames 0 -> 165
 * "مع درع الخصوصية في Asra3.com... اكتب نطاق شركتك الحالية فقط"
 */
export const V3Scene02ShieldDomain: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const slideY = interpolate(frame, [0, 20], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Types "@current-employer.ae" cleanly as narrator says "اكتب نطاق شركتك الحالية فقط" (local 66 -> 136)
  const fullDomain = "current-employer.ae";
  const typedCount = Math.round(
    interpolate(frame, [66, 134], [0, fullDomain.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedDomain = fullDomain.slice(0, typedCount);
  const cursorVisible = frame >= 60 && Math.floor(frame / 10) % 2 === 0;

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
          alignItems: "center",
          gap: 22,
          translate: `0px ${slideY}px`,
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              backgroundColor: THEME.carbonBlack,
              color: THEME.goldSolid,
              padding: "9px 18px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <ShieldCheck size={17} color={THEME.goldSolid} />
            درع استثناء جهة العمل
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 42,
            fontWeight: 900,
            lineHeight: 1.24,
            color: THEME.carbonBlack,
          }}
        >
          اكتب نطاق <span style={{ color: THEME.goldMutedInk }}>شركتك الحالية</span> فقط
        </h2>

        <BrowserWindow urlLabel="asra3.com/#privacy-shield" darkBody={true}>
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
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
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#FAFAFA",
                }}
              >
                أضف نطاق الشركة المطلوب حجبها بالكامل
              </span>
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 12,
                  fontWeight: 800,
                  color: THEME.goldSolid,
                  backgroundColor: "#27200B",
                  border: `1px solid ${THEME.goldSolid}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                STEP 04 · DOMAIN SHIELD
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 14,
                backgroundColor: THEME.carbonBlack,
                border: `2px solid ${THEME.goldSolid}`,
                padding: "18px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Lock size={22} color={THEME.goldSolid} />
                <span
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#FAFAFA",
                  }}
                >
                  @{typedDomain}
                  <span style={{ color: THEME.goldSolid }}>
                    {cursorVisible ? "|" : ""}
                  </span>
                </span>
              </div>
              <span
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 13,
                  fontWeight: 800,
                  color: THEME.carbonBlack,
                  backgroundColor: THEME.goldSolid,
                  borderRadius: 8,
                  padding: "6px 12px",
                }}
              >
                DOMAIN RULE
              </span>
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#A1A1AA",
              }}
            >
              كل حسابات التوظيف والإدارة التابعة لهذا النطاق تُستبعد قبل بدء أي إرسال
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 3 Act 03 (351 -> 462 frames / 11.70s -> 15.40s):
 * Local frames 0 -> 111
 * "والنظام يحجبها تماماً بنسبة 100%"
 */
export const V3Scene03EmployerBlocked: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Cursor glides onto Gold Lock toggle (local frames 6 -> 22) and clicks at 22
  const cursorX = interpolate(frame, [6, 22], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [6, 22], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorOpacity = interpolate(frame, [2, 10, 56, 70], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shieldLocked = frame >= 22;
  const knobX = interpolate(frame, [20, 32], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
  });

  const bannerScale = interpolate(frame, [36, 54], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
  });
  const bannerOpacity = interpolate(frame, [36, 48], [0, 1], {
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
          gap: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 50 : 44,
            fontWeight: 900,
            lineHeight: 1.24,
            color: "#FAFAFA",
          }}
        >
          حجب تلقائي لشركتك بنسبة{" "}
          <span style={{ color: THEME.goldSolid }}>100%</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com/#shield-active" darkBody={true}>
          <div
            style={{
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Interactive Toggle Strip */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${
                  shieldLocked ? THEME.goldSolid : THEME.carbonBorder
                }`,
                padding: "16px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldCheck
                  size={24}
                  color={shieldLocked ? THEME.goldSolid : "#A1A1AA"}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#FAFAFA",
                  }}
                >
                  حظر النطاق:{" "}
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      color: THEME.goldSolid,
                    }}
                  >
                    @current-employer.ae
                  </span>
                </span>
              </div>

              <div
                dir="ltr"
                style={{
                  position: "relative",
                  width: 66,
                  height: 36,
                  borderRadius: 9999,
                  backgroundColor: shieldLocked ? THEME.goldSolid : "#3F3F46",
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
                    opacity: cursorOpacity,
                    translate: `${cursorX}px ${cursorY}px`,
                    pointerEvents: "none",
                  }}
                >
                  <MousePointerClick size={32} color="#FAFAFA" />
                </div>
              </div>
            </div>

            {/* Blocked Domain Targets */}
            {[
              "director@current-employer.ae",
              "hr-recruitment@current-employer.ae",
            ].map((email) => (
              <div
                key={email}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  backgroundColor: "#141418",
                  border: "1px solid #3F3F46",
                  padding: "14px 20px",
                  opacity: shieldLocked ? 0.85 : 1,
                }}
              >
                <span
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: shieldLocked ? "#71717A" : "#FAFAFA",
                    textDecoration: shieldLocked ? "line-through" : "none",
                  }}
                >
                  {email}
                </span>
                <span
                  dir="ltr"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 8,
                    backgroundColor: shieldLocked ? "#450A0A" : "#27272A",
                    border: `1px solid ${shieldLocked ? "#DC2626" : "#52525B"}`,
                    color: shieldLocked ? "#FCA5A5" : "#D4D4D8",
                    padding: "6px 12px",
                    fontFamily: THEME.fontMono,
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  <Ban size={14} />
                  {shieldLocked ? "100% BLOCKED" : "PENDING"}
                </span>
              </div>
            ))}

            {/* 100% Blocked Gold Seal */}
            <div
              style={{
                opacity: bannerOpacity,
                scale: `${bannerScale}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                borderRadius: 14,
                backgroundColor: THEME.goldSolid,
                color: THEME.carbonBlack,
                padding: "14px 20px",
              }}
            >
              <Lock size={22} />
              <span style={{ fontSize: 20, fontWeight: 900 }}>
                تم الحجب الكامل 100% — لن تصل أي رسالة لشركتك الحالية
              </span>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 3 Act 04 (462 -> 600 frames / 15.40s -> 20.00s):
 * Local frames 0 -> 138
 * "ويوصل ملفك لباقي الشركات الموثقة... بسرية تامة"
 */
export const V3Scene04StealthDispatch: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const competitors = [
    { name: "Emaar Properties · Dubai DIFC", statusFrame: 14 },
    { name: "ROSHN Group · Riyadh KAFD", statusFrame: 26 },
    { name: "QNB Group · Doha West Bay", statusFrame: 38 },
  ];

  // Stealth seal pops around frame 76 ("بسرية تامة")
  const sealScale = interpolate(frame, [74, 92], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 165 }),
  });
  const sealOpacity = interpolate(frame, [74, 86], [0, 1], {
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
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isReels ? 48 : 42,
            fontWeight: 900,
            lineHeight: 1.24,
            color: THEME.carbonBlack,
          }}
        >
          ملفك يصل لباقي الشركات{" "}
          <span style={{ color: THEME.goldMutedInk }}>بسرية تامة</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com/track/confidential" darkBody={false}>
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Excluded employer pinned securely at top */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 12,
                backgroundColor: "#F4F4F5",
                border: "1px dashed #A1A1AA",
                padding: "12px 18px",
              }}
            >
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#52525B",
                }}
              >
                current-employer.ae
              </span>
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#DC2626",
                  backgroundColor: "#FEE2E2",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                EXCLUDED · 0 SENT
              </span>
            </div>

            {competitors.map((comp) => {
              const rowOpacity = interpolate(
                frame,
                [comp.statusFrame, comp.statusFrame + 12],
                [0.25, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const delivered = frame >= comp.statusFrame + 10;

              return (
                <div
                  key={comp.name}
                  style={{
                    opacity: rowOpacity,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    backgroundColor: "#FAFAFA",
                    border: "1.5px solid #E4E4E7",
                    padding: "14px 20px",
                  }}
                >
                  <div
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 18,
                      fontWeight: 800,
                      color: THEME.carbonBlack,
                    }}
                  >
                    {comp.name}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      borderRadius: 8,
                      backgroundColor: delivered ? "#DCFCE7" : "#F4F4F5",
                      color: delivered ? "#166534" : "#52525B",
                      padding: "6px 12px",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {delivered ? "وصل للـ HR بسرية" : "جاري التوجيه..."}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                opacity: sealOpacity,
                scale: `${sealScale}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 16,
                backgroundColor: THEME.carbonBlack,
                border: `2px solid ${THEME.goldSolid}`,
                padding: "16px 22px",
                marginTop: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MailCheck size={24} color={THEME.goldSolid} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#FAFAFA",
                    }}
                  >
                    الردود المباشرة تصلك على بريدك الشخصي فقط
                  </span>
                  <span style={{ fontSize: 14, color: "#A1A1AA" }}>
                    بسرية تامة وبلا أي إعلان عام لسيرتك الذاتية
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 30,
                  fontWeight: 900,
                  color: THEME.goldSolid,
                }}
              >
                100%
              </span>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};
