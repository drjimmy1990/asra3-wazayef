import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArchBackdrop, BrowserWindow } from "../components/BrowserFrame";
import { THEME } from "../theme";
import {
  Activity,
  Ban,
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
 * Video 4 Act 04 (1056 -> 1296 frames / 35.20s -> 43.20s):
 * Local frames 0 -> 240
 * Interactive toggle flip + domain typing "@current-employer.ae" -> 100% Blocked before sending
 */
export const V4Scene04ShieldLock: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const slideY = interpolate(frame, [0, 20], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  // Cursor clicks toggle at local frame 52 (~36.93s)
  const shieldActive = frame >= 52;
  const knobX = interpolate(frame, [50, 62], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 180 }),
  });

  const cursorOpacity = interpolate(frame, [28, 38, 86, 98], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [30, 50], [160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const cursorY = interpolate(frame, [30, 50], [70, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Domain types "@current-employer.ae" across local frames 78 -> 165 ("واكتب نطاق شركتك لحجبها تماماً")
  const domain = "current-employer.ae";
  const typedLen = Math.round(
    interpolate(frame, [78, 160], [0, domain.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedText = domain.slice(0, typedLen);

  // 100% Blocked seal slams right at frame 164
  const blocked = frame >= 164;
  const sealScale = interpolate(frame, [164, 180], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
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
          maxWidth: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          translate: `0px ${slideY}px`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            backgroundColor: THEME.carbonBlack,
            color: THEME.goldSolid,
            padding: "8px 18px",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          <ShieldCheck size={17} color={THEME.goldSolid} />
          حماية سرية 100% من شركتك الحالية
        </span>

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
          فعّل درع الخصوصية واحجب شركتك{" "}
          <span style={{ color: THEME.goldMutedInk }}>100%</span>
        </h2>

        <BrowserWindow urlLabel="asra3.com/#exclusion-shield" darkBody={true}>
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Header Toggle */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 14,
                backgroundColor: THEME.carbonBlack,
                border: `1.5px solid ${
                  shieldActive ? THEME.goldSolid : THEME.carbonBorder
                }`,
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Lock
                  size={21}
                  color={shieldActive ? THEME.goldSolid : "#A1A1AA"}
                />
                <span
                  style={{ fontSize: 19, fontWeight: 800, color: "#FAFAFA" }}
                >
                  تفعيل درع استثناء جهة العمل
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
                    opacity: cursorOpacity,
                    translate: `${cursorX}px ${cursorY}px`,
                  }}
                >
                  <MousePointerClick size={32} color="#FAFAFA" />
                </div>
              </div>
            </div>

            {/* Live Typed Exclusion Input */}
            <div
              dir="ltr"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 14,
                backgroundColor: "#141418",
                border: `1.5px solid ${
                  blocked ? "#DC2626" : THEME.goldSolid
                }`,
                padding: "16px 20px",
              }}
            >
              <span
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 23,
                  fontWeight: 800,
                  color: "#FAFAFA",
                }}
              >
                @{typedText}
                <span style={{ color: THEME.goldSolid }}>
                  {frame >= 72 && frame < 170 ? "|" : ""}
                </span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 8,
                  backgroundColor: blocked ? "#450A0A" : "#27272A",
                  border: `1px solid ${blocked ? "#DC2626" : "#52525B"}`,
                  color: blocked ? "#FCA5A5" : "#D4D4D8",
                  padding: "6px 12px",
                  fontFamily: THEME.fontMono,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                <Ban size={14} />
                {blocked ? "100% BLOCKED" : "TYPING"}
              </span>
            </div>

            <div
              style={{
                opacity: blocked ? 1 : 0.25,
                scale: `${blocked ? sealScale : 0.96}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderRadius: 14,
                backgroundColor: THEME.goldSolid,
                color: THEME.carbonBlack,
                padding: "14px 20px",
              }}
            >
              <ShieldCheck size={22} />
              <span style={{ fontSize: 19, fontWeight: 900 }}>
                لن تُرسل أي رسالة لشركتك الحالية — حظر 100% قبل الإرسال
              </span>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 4 Act 05 (1296 -> 1758 frames / 43.20s -> 58.60s):
 * Local frames 0 -> 462
 * Turbo Dispatch counter (0->300) + HR Opens (0->94) + CSV Verified Pill + Personal Gmail Reply Popup
 */
export const V4Scene05DispatchAndTrack: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  // Sent roll-up across frames 20 -> 145 ("خلال دقائق ينطلق ملفك مباشرة")
  const sentCount = Math.round(
    interpolate(frame, [20, 145], [0, 300], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // HR Opens roll-up across frames 160 -> 300 ("تشوف فيها كل شركة فتحت سيرتك")
  const hrOpens = Math.round(
    interpolate(frame, [160, 300], [0, 94], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  const progressPct = Math.round((sentCount / 300) * 100);

  // CSV verified badge pops at local frame 298 (~53.13s)
  const csvHighlighted = frame >= 296;
  const csvScale = interpolate(frame, [296, 314], [0.92, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 160 }),
  });

  // Personal Inbox Reply notification slides up at local frame 362 (~55.26s)
  const replyY = interpolate(frame, [360, 382], [32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 170 }),
  });
  const replyOpacity = interpolate(frame, [360, 375], [0, 1], {
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              backgroundColor: "#27200B",
              border: `1.5px solid ${THEME.goldSolid}`,
              color: THEME.goldSolid,
              padding: "7px 16px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            <Activity size={17} />
            لوحة التتبع الحية لحظة بلحظة
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontMono,
              fontSize: 14,
              fontWeight: 800,
              color: "#A1A1AA",
            }}
          >
            TRACK · ASR-984210
          </span>
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
          تتبع حي، تقرير <span style={{ color: THEME.goldSolid }}>CSV</span>، وردود تصلك مباشرة
        </h2>

        <BrowserWindow urlLabel="asra3.com/track/ASR-984210" darkBody={true}>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* 3 Telemetry Counters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: THEME.carbonBlack,
                  border: "1px solid #27272A",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 13, color: "#A1A1AA" }}>
                  وصلت لصندوق الـ HR
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#FAFAFA",
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
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 13, color: THEME.goldSolid }}>
                  فُتحت من مسؤولي التوظيف
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 26,
                    fontWeight: 900,
                    color: THEME.goldSolid,
                    marginTop: 4,
                  }}
                >
                  {hrOpens} ✓
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: THEME.carbonBlack,
                  border: "1px solid #27272A",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 13, color: "#A1A1AA" }}>
                  تقدم الإرسال السريع
                </div>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontMono,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#86EFAC",
                  }}
                >
                  {progressPct}%
                </div>
              </div>
            </div>

            {/* HR Dispatch Feed Rows */}
            {[
              { name: "Emaar Properties · Dubai HR", at: 48, opened: 185 },
              { name: "ROSHN Group · Riyadh KAFD", at: 84, opened: 225 },
              { name: "Qatar National Bank (QNB)", at: 118, opened: 265 },
            ].map((row) => {
              const sent = frame >= row.at;
              const isOpened = frame >= row.opened;
              return (
                <div
                  key={row.name}
                  style={{
                    opacity: sent ? 1 : 0.3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 12,
                    backgroundColor: "#141418",
                    border: `1px solid ${
                      isOpened ? THEME.goldSolid : "#27272A"
                    }`,
                    padding: "11px 16px",
                  }}
                >
                  <div
                    dir="ltr"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontFamily: THEME.fontLatin,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    <Send
                      size={15}
                      color={isOpened ? THEME.goldSolid : "#86EFAC"}
                    />
                    {row.name}
                  </div>
                  <span
                    style={{
                      borderRadius: 8,
                      backgroundColor: isOpened ? THEME.goldSolid : "#14532D",
                      color: isOpened ? THEME.carbonBlack : "#86EFAC",
                      padding: "4px 12px",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {isOpened ? "✓ فتحه مسؤول الـ HR" : "✓ تم التسليم"}
                  </span>
                </div>
              );
            })}

            {/* Verified CSV Download Pill + Personal Inbox Reply Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                dir="ltr"
                style={{
                  scale: `${csvHighlighted ? csvScale : 1}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 12,
                  backgroundColor: csvHighlighted ? THEME.goldSolid : "#18181B",
                  border: `1.5px solid ${THEME.goldSolid}`,
                  color: csvHighlighted ? THEME.carbonBlack : THEME.goldSolid,
                  padding: "10px 16px",
                  fontFamily: THEME.fontMono,
                  fontSize: 14,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                <Download size={16} />
                Verified_Report.csv ✓
              </div>

              <div
                style={{
                  flex: 1,
                  opacity: replyOpacity,
                  translate: `0px ${replyY}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 12,
                  backgroundColor: "#14532D",
                  border: "1.5px solid #4ADE80",
                  padding: "10px 16px",
                }}
              >
                <MailCheck size={20} color="#86EFAC" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF" }}
                  >
                    رد مباشر من مدير التوظيف على إيميلك الشخصي!
                  </span>
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontMono,
                      fontSize: 12,
                      color: "#BBF7D0",
                    }}
                  >
                    Reply-To: your.personal@email.com · Interview Invite ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </BrowserWindow>
      </div>
    </div>
  );
};

/**
 * Video 4 Act 06 (1758 -> 2001 frames / 58.60s -> 66.70s):
 * Local frames 0 -> 243
 * Zero Subscriptions + 3 One-Time Packages (129 / 229 / 349) + Apple Pay & Card Trust
 */
export const V4Scene06PricingOneTime: React.FC<{
  readonly isReels?: boolean;
}> = ({ isReels = false }) => {
  const frame = useCurrentFrame();

  const tiers = [
    {
      name: "Launch انطلاقة",
      price: "129",
      desc: "100 شركة موثقة + لوحة التتبع الحية",
      featured: false,
      delay: 14,
    },
    {
      name: "Turbo الاحترافية",
      price: "229",
      desc: "300 شركة + خطاب AI مخصص + أولوية",
      featured: true,
      delay: 30,
    },
    {
      name: "Hyper VIP",
      price: "349",
      desc: "500+ شركة + إعادة صياغة ATS كاملة",
      featured: false,
      delay: 46,
    },
  ];

  const payOpacity = interpolate(frame, [115, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const payScale = interpolate(frame, [115, 138], [0.92, 1], {
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
          gap: 22,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            backgroundColor: THEME.carbonBlack,
            color: THEME.goldSolid,
            padding: "8px 18px",
            fontSize: 15,
            fontWeight: 900,
          }}
        >
          ✓ دفعة واحدة فقط — بدون أي اشتراكات شهرية
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
          باقات تبدأ من <span style={{ color: THEME.goldMutedInk }}>129</span> د.إ / ر.س
        </h2>

        {/* 3 Staggered Tier Cards */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.12fr 1fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          {tiers.map((t) => {
            const cardY = interpolate(frame, [t.delay, t.delay + 20], [28, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 180 }),
            });
            const cardOp = interpolate(frame, [t.delay, t.delay + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={t.name}
                style={{
                  opacity: cardOp,
                  translate: `0px ${cardY}px`,
                  borderRadius: 20,
                  backgroundColor: t.featured
                    ? THEME.carbonBlack
                    : THEME.pureWhite,
                  border: t.featured
                    ? `2.5px solid ${THEME.goldSolid}`
                    : `1.5px solid ${THEME.lightBorder}`,
                  boxShadow: t.featured
                    ? "0 24px 50px rgba(9, 9, 11, 0.25)"
                    : "0 12px 30px rgba(9, 9, 11, 0.08)",
                  padding: "22px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
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
                        fontSize: 17,
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
                      fontSize: t.featured ? 42 : 34,
                      fontWeight: 900,
                      color: t.featured ? "#FAFAFA" : THEME.carbonBlack,
                      lineHeight: 1.05,
                    }}
                  >
                    {t.price}{" "}
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
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
              </div>
            );
          })}
        </div>

        {/* Apple Pay & Card Trust Strip */}
        <div
          style={{
            opacity: payOpacity,
            scale: `${payScale}`,
            width: "100%",
            borderRadius: 16,
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.goldSolid}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CreditCard size={22} color={THEME.goldSolid} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "#FAFAFA" }}>
              دفع آمن وفوري عبر EasyKash DirectPayV1
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
            {["Apple Pay", "Visa", "Mastercard", "Mada"].map((method) => (
              <span
                key={method}
                style={{
                  borderRadius: 8,
                  backgroundColor: "#18181B",
                  border: "1px solid #3F3F46",
                  color: THEME.goldSolid,
                  padding: "6px 12px",
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
