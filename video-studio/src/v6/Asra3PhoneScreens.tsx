import React from "react";
import { VelocityDartSvg } from "../components/BrandMark";
import { THEME } from "../theme";
import {
  clamp,
  DigitRoller,
  E,
  mSpring,
  PHONE,
  press,
  prog,
  TapMarker,
  track,
} from "./motionCore";
import {
  Ban,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

/**
 * Real-scale (402 × 874 pt) Asra3.com mobile web interface running inside IPhoneFrame.
 * Every move comes from real app behavior: taps (press + TapMarker), vertical scrolls (track),
 * mechanical digit rollers, in-app push navigation, bottom sheets, and an authentic Apple Pay sheet.
 */
export const Asra3PhoneScreens: React.FC<{
  readonly t: number;
}> = ({ t }) => {
  // 1. Continuous Wizard Scroll Track aligned to fixed step slots (0 / 175 / 660 / 725 / 1360)
  const scrollY = track(t, 0, [
    { t: 17.2, d: 0.7, to: 175, e: E.smooth },
    { t: 21.65, d: 0.65, to: 660, e: E.snappy },
    { t: 29.55, d: 0.65, to: 725, e: E.smooth },
    { t: 35.05, d: 0.7, to: 1360, e: E.snappy },
  ]);

  // 2. Step 1 Country taps synced to VO ("الإمارات، السعودية، قطر، والكويت")
  const aeOn = t >= 14.15;
  const saOn = t >= 14.85;
  const qaOn = t >= 15.55;
  const kwOn = t >= 16.25;
  const specEngOn = t >= 19.0;
  const specItOn = t >= 19.8;

  // 3. Step 2 ATS Scan & Live Cover Letter
  const scanP = prog(t, 23.9, 2.5, E.inOut);
  const scanShow = t >= 23.9 && t <= 26.5;
  const atsArcP = prog(t, 27.3, 2.1, E.snappy);
  const atsVal = Math.round(49 + atsArcP * 47); // 49% -> 96%
  const coverFull =
    "Dear Hiring Director, With 8+ yrs leading GCC operations and delivery...";
  const coverChars = Math.floor(
    clamp((t - 30.0) / 0.06, 0, coverFull.length)
  );
  const coverShown = coverFull.slice(0, coverChars);

  // 4. Step 3 Employer Exclusion Shield
  const shieldOn = t >= 36.85;
  const knobSlide = clamp(mSpring(t, 36.85, 0.34, 0.85), 0, 1);
  const domainFull = "current-employer.ae";
  const domainChars = Math.floor(
    clamp((t - 38.05) / 0.085, 0, domainFull.length)
  );
  const domainShown = domainFull.slice(0, domainChars);
  const domainBlocked = t >= 40.0;

  // 5. In-App Push Navigation -> Live /track/ASR-984210 Dashboard (t >= 43.15s)
  const trackPush = clamp(mSpring(t, 43.15, 0.44, 0.9), 0, 1);
  const showTrack = t >= 43.1;
  const sentBarPct = prog(t, 43.9, 4.2, E.out) * 100;
  const csvPop = press(t, 53.3, 0.92);

  // 6. Pricing Bottom Sheet (t >= 58.65s) + Apple Pay Face ID Sheet (t >= 63.15s)
  const pricingSlide = clamp(mSpring(t, 58.65, 0.46, 0.9), 0, 1);
  const showPricing = t >= 58.6;

  const applePaySlide = clamp(mSpring(t, 63.15, 0.44, 0.9), 0, 1);
  const showApplePay = t >= 63.1;
  const faceIdCircle = prog(t, 64.2, 0.75, E.out);
  const faceIdCheck = prog(t, 64.9, 0.45, E.out);

  // 7. Opening & Closing App Icon Morph Covers (no half-clipped content during rect-morph!)
  const openingIconOp = 1 - prog(t, 8.22, 0.34, E.out);
  const closingIconOp = prog(t, 66.75, 0.42, E.inOut);
  const iconOverlayOp = clamp(Math.max(openingIconOp, closingIconOp), 0, 1);

  const isDarkHeader = t >= 43.2 && t < 58.65;

  // Current active URL shown in minimal mobile Safari bar
  const currentUrl =
    t >= 58.6
      ? "asra3.com/#packages"
      : t >= 43.15
      ? "asra3.com/track/ASR-984210"
      : "asra3.com/#wizard";

  const stepLabel =
    t >= 58.6
      ? "الباقات"
      : t >= 43.15
      ? "تتبع حي"
      : t >= 35.1
      ? "خطوة 3"
      : t >= 21.7
      ? "خطوة 2"
      : "خطوة 1";

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: isDarkHeader ? THEME.carbonBlack : "#FAFAFA",
        fontFamily: THEME.fontArabic,
        overflow: "hidden",
      }}
    >
      {/* Solid Status Bar Safe Backing (y: 0..52) so scrolled content NEVER bleeds behind 9:41 or Island */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 52,
          backgroundColor: isDarkHeader ? THEME.carbonBlack : "#FFFFFF",
          zIndex: 26,
        }}
      />

      {/* Clean Mobile App Header Bar below Dynamic Island (y: 52..102) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 52,
          height: 50,
          padding: "0 16px",
          backgroundColor: isDarkHeader ? THEME.carbonBlack : "#FFFFFF",
          borderBottom: `1px solid ${isDarkHeader ? "#27272A" : "#E4E4E7"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 25,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <VelocityDartSvg size={28} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: isDarkHeader ? "#FAFAFA" : THEME.carbonBlack,
            }}
          >
            أسرع
          </span>
        </div>

        <div
          dir="ltr"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 9999,
            backgroundColor: isDarkHeader ? "#18181B" : "#F4F5F8",
            border: `1px solid ${isDarkHeader ? "#27272A" : "#E4E4E7"}`,
            padding: "4px 10px",
            fontFamily: THEME.fontMono,
            fontSize: 10.5,
            fontWeight: 700,
            color: isDarkHeader ? "#D4D4D8" : "#3F3F46",
          }}
        >
          <Lock size={10} color={THEME.goldSolid} />
          {currentUrl}
        </div>

        <span
          style={{
            borderRadius: 8,
            backgroundColor: isDarkHeader ? THEME.goldSolid : THEME.carbonBlack,
            color: isDarkHeader ? THEME.carbonBlack : THEME.goldSolid,
            padding: "4px 9px",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          {stepLabel}
        </span>
      </div>

      {/* CLIPPED VIEWPORT FOR SCROLLABLE WIZARD LAYER (strictly inside y: 102..874) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 102,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 2200,
            translate: `0px ${(-scrollY).toFixed(2)}px`,
          }}
        >
          {/* ================= STEP 1: GCC COUNTRIES & SPECIALTY (top: 0) ================= */}
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
          <div
            style={{
              borderRadius: 16,
              backgroundColor: THEME.carbonBlack,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{ fontSize: 11.5, fontWeight: 700, color: "#A1A1AA" }}
              >
                الشركات الموثقة المتاحة
              </span>
              <span
                style={{ fontSize: 15, fontWeight: 900, color: "#FAFAFA" }}
              >
                4 أسواق خليجية مباشرة
              </span>
            </div>
            <div
              style={{
                borderRadius: 10,
                backgroundColor: "#18181B",
                border: `1.5px solid ${THEME.goldSolid}`,
                padding: "5px 12px",
                color: THEME.goldSolid,
                fontFamily: THEME.fontMono,
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              <DigitRoller
                t={t}
                height={24}
                steps={[
                  { t: 7.5, v: "1,450+" },
                  { t: 14.85, v: "3,550+" },
                  { t: 15.55, v: "4,370+" },
                  { t: 16.25, v: "5,010+" },
                ]}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: THEME.carbonBlack,
            }}
          >
            1. اختر دولتك ومدنك المستهدفة
          </div>

          {/* 2x2 Tactile Country Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {[
              {
                name: "الإمارات",
                cities: "دبي · أبوظبي",
                cnt: "1,450+",
                on: aeOn,
                tapAt: 14.15,
              },
              {
                name: "السعودية",
                cities: "الرياض · جدة · نيوم",
                cnt: "2,100+",
                on: saOn,
                tapAt: 14.85,
              },
              {
                name: "قطر",
                cities: "الدوحة · لوسيل",
                cnt: "820+",
                on: qaOn,
                tapAt: 15.55,
              },
              {
                name: "الكويت",
                cities: "مدينة الكويت · حولي",
                cnt: "640+",
                on: kwOn,
                tapAt: 16.25,
              },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  scale: `${press(t, c.tapAt, 0.93).toFixed(4)}`,
                  borderRadius: 14,
                  backgroundColor: c.on ? THEME.carbonBlack : "#FFFFFF",
                  border: `1.5px solid ${c.on ? THEME.goldSolid : "#E4E4E7"}`,
                  padding: "12px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: c.on
                    ? "0 8px 18px rgba(9, 9, 11, 0.14)"
                    : "0 2px 6px rgba(0,0,0,0.03)",
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
                      fontSize: 11,
                      fontWeight: 900,
                      color: c.on ? THEME.carbonBlack : "#52525B",
                      backgroundColor: c.on ? THEME.goldSolid : "#F4F4F5",
                      borderRadius: 6,
                      padding: "2px 7px",
                    }}
                  >
                    {c.cnt}
                  </span>
                  <CheckCircle2
                    size={16}
                    color={c.on ? THEME.goldSolid : "#D4D4D8"}
                  />
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: c.on ? "#FAFAFA" : THEME.carbonBlack,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: c.on ? "#D4D4D8" : "#71717A",
                  }}
                >
                  {c.cities}
                </div>
              </div>
            ))}
          </div>

          {/* Specialty Sector Selection (scrolled cleanly into view at 17.2s) */}
          <div
            style={{
              marginTop: 8,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E4E7",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: THEME.carbonBlack,
              }}
            >
              اختر تخصصك الوظيفي الدقيق
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "الهندسة والمشاريع", on: specEngOn, at: 19.0 },
                { label: "تقنية المعلومات", on: specItOn, at: 19.8 },
                { label: "المالية والمحاسبة", on: false, at: 999 },
                { label: "الإدارة التنفيذية", on: false, at: 999 },
              ].map((sp) => (
                <span
                  key={sp.label}
                  style={{
                    scale: `${press(t, sp.at, 0.92).toFixed(4)}`,
                    borderRadius: 9999,
                    backgroundColor: sp.on ? THEME.carbonBlack : "#F4F5F8",
                    border: `1.5px solid ${sp.on ? THEME.goldSolid : "#E4E4E7"}`,
                    color: sp.on ? THEME.goldSolid : THEME.carbonBlack,
                    padding: "7px 13px",
                    fontSize: 12.5,
                    fontWeight: 800,
                  }}
                >
                  {sp.label} {sp.on ? "✓" : ""}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              scale: `${press(t, 21.4, 0.95).toFixed(4)}`,
              borderRadius: 14,
              backgroundColor: THEME.goldSolid,
              color: THEME.carbonBlack,
              padding: "13px 16px",
              textAlign: "center",
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            متابعة ← فحص السيرة مجاناً
          </div>
        </div>

        {/* ================= STEP 2: FREE ATS SCAN + AI COVER LETTER (top: 676) ================= */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 676,
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
                fontSize: 16,
                fontWeight: 900,
                color: THEME.carbonBlack,
              }}
            >
              2. الفحص المجاني وخطاب التقديم
            </span>
            <span
              style={{
                borderRadius: 8,
                backgroundColor: "#DCFCE7",
                color: "#166534",
                padding: "3px 9px",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              مجاني 100%
            </span>
          </div>

          {/* Uploaded PDF Scanner Box */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${t >= 23.2 ? THEME.goldSolid : "#E4E4E7"}`,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: THEME.carbonBlack,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={18} color={THEME.goldSolid} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  dir="ltr"
                  style={{
                    fontFamily: THEME.fontLatin,
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: THEME.carbonBlack,
                  }}
                >
                  Candidate_Executive_CV.pdf
                </div>
                <div
                  style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}
                >
                  تم استخراج الخبرات والمهارات بنجاح ✓
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { label: "GCC Market Fit", at: 24.4 },
                { label: "PMP · Cloud Ops", at: 25.1 },
                { label: "ATS Readable", at: 25.8 },
              ].map((chip) => (
                <span
                  key={chip.label}
                  dir="ltr"
                  style={{
                    opacity: t >= chip.at ? 1 : 0.25,
                    scale: `${clamp(mSpring(t, chip.at, 0.35, 0.8), 0.85, 1)}`,
                    borderRadius: 8,
                    backgroundColor: "#F4F5F8",
                    border: `1px solid ${
                      t >= chip.at ? THEME.goldSolid : "#E4E4E7"
                    }`,
                    color: THEME.carbonBlack,
                    padding: "4px 9px",
                    fontFamily: THEME.fontMono,
                    fontSize: 10.5,
                    fontWeight: 800,
                  }}
                >
                  ✓ {chip.label}
                </span>
              ))}
            </div>

            {scanShow ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  translate: `0px ${(scanP * 115).toFixed(1)}px`,
                  height: 2.5,
                  backgroundColor: THEME.goldSolid,
                }}
              />
            ) : null}
          </div>

          {/* ATS Score Upgrade Card (49% -> 96%) */}
          <div
            style={{
              borderRadius: 16,
              backgroundColor: THEME.carbonBlack,
              border: `1.5px solid ${THEME.goldSolid}`,
              padding: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{ fontSize: 12, fontWeight: 700, color: "#A1A1AA" }}
              >
                درجة توافق أنظمة الفرز ATS
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: atsVal >= 85 ? THEME.goldSolid : "#FCA5A5",
                }}
              >
                {atsVal >= 85
                  ? "جاهز لاجتياز فلاتر الخليج ✓"
                  : "توافق منخفض — جاري التحسين"}
              </span>
            </div>

            <div
              style={{
                borderRadius: 12,
                backgroundColor: "#18181B",
                border: `1.5px solid ${
                  atsVal >= 85 ? THEME.goldSolid : "#DC2626"
                }`,
                padding: "6px 14px",
                color: atsVal >= 85 ? THEME.goldSolid : "#FCA5A5",
                fontFamily: THEME.fontLatin,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              <DigitRoller
                t={t}
                height={28}
                steps={[
                  { t: 21.8, v: "49%" },
                  { t: 27.4, v: "74%" },
                  { t: 28.2, v: "89%" },
                  { t: 28.9, v: "96%" },
                ]}
              />
            </div>
          </div>

          {/* Live Typed Executive AI Cover Letter Card */}
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${t >= 30.0 ? THEME.goldSolid : "#E4E4E7"}`,
              padding: 14,
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
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={15} color={THEME.goldMutedInk} />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 900,
                    color: THEME.carbonBlack,
                  }}
                >
                  خطاب تقديم تنفيذي مخصص (AI)
                </span>
              </div>
              <span
                style={{
                  scale: `${clamp(mSpring(t, 32.8, 0.36, 0.72), 0.01, 1.06)}`,
                  opacity: t >= 32.8 ? 1 : 0,
                  borderRadius: 9999,
                  backgroundColor: THEME.goldSolid,
                  color: THEME.carbonBlack,
                  padding: "3px 9px",
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                3× مقابلات
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                borderRadius: 10,
                backgroundColor: "#F4F5F8",
                padding: "10px 12px",
                fontFamily: THEME.fontMono,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: "#18181B",
                minHeight: 54,
              }}
            >
              {coverShown}
              {t >= 30.0 && t < 34.8 ? (
                <span style={{ color: THEME.goldMutedInk }}>|</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ================= STEP 3: EMPLOYER EXCLUSION SHIELD (top: 1376) ================= */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 1376,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={20} color={THEME.goldMutedInk} />
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: THEME.carbonBlack,
              }}
            >
              3. درع استثناء شركتك الحالية
            </span>
          </div>

          <div
            style={{
              borderRadius: 18,
              backgroundColor: THEME.carbonBlack,
              border: `1.5px solid ${shieldOn ? THEME.goldSolid : "#27272A"}`,
              padding: 16,
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
                style={{ fontSize: 14, fontWeight: 800, color: "#FAFAFA" }}
              >
                تفعيل حجب جهة العمل الحالية
              </span>
              <div
                dir="ltr"
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 9999,
                  backgroundColor: shieldOn ? THEME.goldSolid : "#3F3F46",
                  padding: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    backgroundColor: THEME.carbonBlack,
                    translate: `${(knobSlide * 20).toFixed(1)}px 0px`,
                  }}
                />
              </div>
            </div>

            <div
              dir="ltr"
              style={{
                borderRadius: 12,
                backgroundColor: "#141418",
                border: `1.5px solid ${
                  domainBlocked ? "#DC2626" : THEME.goldSolid
                }`,
                padding: "11px 14px",
                fontFamily: THEME.fontMono,
                fontSize: 15,
                fontWeight: 800,
                color: "#FAFAFA",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              @{domainShown}
              {t >= 38.0 && t < 40.1 ? (
                <span style={{ color: THEME.goldSolid }}>|</span>
              ) : null}
            </div>

            <div
              style={{
                opacity: domainBlocked ? 1 : 0.2,
                scale: `${clamp(mSpring(t, 40.0, 0.36, 0.8), 0.9, 1)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                borderRadius: 10,
                backgroundColor: "#450A0A",
                border: "1px solid #DC2626",
                color: "#FCA5A5",
                padding: "9px 12px",
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              <Ban size={15} />
              محجوب تماماً 100% — لن تصل رسالة لشركتك
            </div>
          </div>

          <div
            style={{
              scale: `${press(t, 42.85, 0.94).toFixed(4)}`,
              borderRadius: 14,
              backgroundColor: THEME.goldSolid,
              color: THEME.carbonBlack,
              padding: "14px 16px",
              textAlign: "center",
              fontSize: 15.5,
              fontWeight: 900,
            }}
          >
            إطلاق الحملة الآن ←
          </div>
        </div>
        </div>
      </div>

      {/* ================= PUSH SCREEN: LIVE /track/ASR-984210 LEDGER ================= */}
      {showTrack ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 102,
            bottom: 0,
            backgroundColor: THEME.carbonBlack,
            padding: "18px 16px",
            translate: `${((1 - trackPush) * -PHONE.W).toFixed(1)}px 0px`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 15,
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
              style={{ fontSize: 16, fontWeight: 900, color: "#FAFAFA" }}
            >
              لوحة التتبع الحية
            </span>
            <span
              dir="ltr"
              style={{
                fontFamily: THEME.fontMono,
                fontSize: 11,
                fontWeight: 800,
                color: THEME.goldSolid,
                backgroundColor: "#27200B",
                border: `1px solid ${THEME.goldSolid}`,
                borderRadius: 8,
                padding: "4px 9px",
              }}
            >
              LIVE · ASR-984210
            </span>
          </div>

          {/* 2 Mechanical Digit Roller Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 14,
                backgroundColor: "#141418",
                border: "1px solid #27272A",
                padding: 13,
              }}
            >
              <div style={{ fontSize: 11.5, color: "#A1A1AA" }}>
                وصلت لصناديق الـ HR
              </div>
              <div
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#FAFAFA",
                  marginTop: 4,
                }}
              >
                <DigitRoller
                  t={t}
                  height={28}
                  steps={[
                    { t: 43.2, v: "000" },
                    { t: 44.5, v: "098" },
                    { t: 46.0, v: "215" },
                    { t: 47.6, v: "300" },
                  ]}
                />
              </div>
            </div>

            <div
              style={{
                borderRadius: 14,
                backgroundColor: "#141418",
                border: `1.5px solid ${THEME.goldSolid}`,
                padding: 13,
              }}
            >
              <div style={{ fontSize: 11.5, color: THEME.goldSolid }}>
                فُتحت من مسؤولي التوظيف
              </div>
              <div
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 24,
                  fontWeight: 900,
                  color: THEME.goldSolid,
                  marginTop: 4,
                }}
              >
                <DigitRoller
                  t={t}
                  height={28}
                  steps={[
                    { t: 43.2, v: "00" },
                    { t: 49.0, v: "31" },
                    { t: 50.6, v: "68" },
                    { t: 52.0, v: "94 ✓" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div
            dir="ltr"
            style={{
              height: 7,
              borderRadius: 9999,
              backgroundColor: "#27272A",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${sentBarPct.toFixed(1)}%`,
                height: "100%",
                backgroundColor: THEME.goldSolid,
                borderRadius: 9999,
              }}
            />
          </div>

          {/* Real GCC Corporate Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { co: "Emaar Properties · Dubai", openAt: 49.6 },
              { co: "ROSHN Group · Riyadh", openAt: 50.8 },
              { co: "Qatar National Bank · Doha", openAt: 51.9 },
            ].map((row) => {
              const opened = t >= row.openAt;
              return (
                <div
                  key={row.co}
                  style={{
                    borderRadius: 12,
                    backgroundColor: "#141418",
                    border: `1px solid ${
                      opened ? THEME.goldSolid : "#27272A"
                    }`,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    dir="ltr"
                    style={{
                      fontFamily: THEME.fontLatin,
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    {row.co}
                  </span>
                  <span
                    style={{
                      borderRadius: 7,
                      backgroundColor: opened ? THEME.goldSolid : "#14532D",
                      color: opened ? THEME.carbonBlack : "#86EFAC",
                      padding: "3px 8px",
                      fontSize: 10.5,
                      fontWeight: 900,
                    }}
                  >
                    {opened ? "✓ فتحه الـ HR" : "تم الإيداع"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Verified CSV Report Download Action */}
          <div
            dir="ltr"
            style={{
              scale: `${csvPop.toFixed(4)}`,
              borderRadius: 12,
              backgroundColor: t >= 53.2 ? THEME.goldSolid : "#18181B",
              border: `1.5px solid ${THEME.goldSolid}`,
              color: t >= 53.2 ? THEME.carbonBlack : THEME.goldSolid,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: THEME.fontMono,
              fontSize: 12.5,
              fontWeight: 900,
            }}
          >
            <Download size={15} />
            Verified_Delivery_Report.csv ✓
          </div>
        </div>
      ) : null}

      {/* ================= PRICING SHEET (t >= 58.65s) ================= */}
      {showPricing ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 102,
            bottom: 0,
            backgroundColor: "#F4F5F8",
            padding: "16px 16px",
            translate: `0px ${((1 - pricingSlide) * 780).toFixed(1)}px`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                borderRadius: 9999,
                backgroundColor: THEME.carbonBlack,
                color: THEME.goldSolid,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              بدون اشتراك شهري — دفعة واحدة فقط ✓
            </span>
          </div>

          {[
            {
              title: "Launch انطلاقة",
              price: "129",
              sub: "100 شركة موثقة + لوحة تتبع حية",
              feat: false,
              tapAt: 62.75,
            },
            {
              title: "Turbo الاحترافية",
              price: "229",
              sub: "300 شركة + خطاب AI مخصص + أولوية",
              feat: true,
              tapAt: 999,
            },
            {
              title: "Hyper VIP",
              price: "349",
              sub: "500+ شركة + إعادة صياغة ATS كاملة",
              feat: false,
              tapAt: 999,
            },
          ].map((pkg) => (
            <div
              key={pkg.title}
              style={{
                scale: `${press(t, pkg.tapAt, 0.95).toFixed(4)}`,
                borderRadius: 15,
                backgroundColor: pkg.feat ? THEME.carbonBlack : "#FFFFFF",
                border: pkg.feat
                  ? `2px solid ${THEME.goldSolid}`
                  : "1.5px solid #E4E4E7",
                padding: "13px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 14.5,
                      fontWeight: 900,
                      color: pkg.feat ? THEME.goldSolid : THEME.carbonBlack,
                    }}
                  >
                    {pkg.title}
                  </span>
                  {pkg.feat ? (
                    <Star size={13} color={THEME.goldSolid} fill={THEME.goldSolid} />
                  ) : null}
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: pkg.feat ? "#D4D4D8" : "#52525B",
                  }}
                >
                  {pkg.sub}
                </span>
              </div>
              <div
                dir="ltr"
                style={{
                  textAlign: "right",
                  fontFamily: THEME.fontLatin,
                  fontSize: 22,
                  fontWeight: 900,
                  color: pkg.feat ? "#FAFAFA" : THEME.carbonBlack,
                }}
              >
                {pkg.price}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: pkg.feat ? THEME.goldSolid : "#71717A",
                  }}
                >
                  AED/SAR
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* ================= AUTHENTIC iOS APPLE PAY FACE ID SHEET (t >= 63.15s) ================= */}
      {showApplePay ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${(applePaySlide * 0.48).toFixed(
              2
            )})`,
            zIndex: 30,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 330,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: "#141417",
              borderTop: "1px solid #27272A",
              padding: "20px 22px 32px",
              translate: `0px ${((1 - applePaySlide) * 340).toFixed(1)}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              dir="ltr"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #27272A",
                paddingBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                Apple Pay
              </span>
              <span
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: THEME.goldSolid,
                }}
              >
                EasyKash · Visa ••42
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ fontSize: 14, fontWeight: 700, color: "#A1A1AA" }}
              >
                الدفع لـ Asra3.com (دفعة واحدة)
              </span>
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontLatin,
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                129.00 AED
              </span>
            </div>

            {/* Animated SVG Face ID / Payment Confirmed Ring */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width={56} height={56} viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="3.5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={THEME.goldSolid}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="151"
                  strokeDashoffset={(1 - faceIdCircle) * 151}
                  transform="rotate(-90 28 28)"
                />
                <path
                  d="M 18 28.5 L 25 35.5 L 38 21.5"
                  fill="none"
                  stroke={THEME.goldSolid}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="34"
                  strokeDashoffset={(1 - faceIdCheck) * 34}
                />
              </svg>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 900,
                  color: faceIdCheck > 0.7 ? THEME.goldSolid : "#D4D4D8",
                }}
              >
                {faceIdCheck > 0.7 ? "تم التأكيد بنجاح ✓" : "جاري التحقق الآمن..."}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* TACTILE FINGER TAP MARKERS (Synced strictly to fixed-slot coordinates!) */}
      <TapMarker t={t} tapAt={14.15} x={295} y={278} />
      <TapMarker t={t} tapAt={14.85} x={105} y={278} />
      <TapMarker t={t} tapAt={15.55} x={295} y={382} />
      <TapMarker t={t} tapAt={16.25} x={105} y={382} />
      <TapMarker t={t} tapAt={19.0} x={295} y={360} />
      <TapMarker t={t} tapAt={21.4} x={201} y={468} />
      <TapMarker t={t} tapAt={36.85} x={52} y={190} />
      <TapMarker t={t} tapAt={42.85} x={201} y={377} />
      <TapMarker t={t} tapAt={62.75} x={201} y={195} />

      {/* CLOSING ICON MORPH OVERLAY (t >= 66.75s: screen becomes the crisp Asra3 App Icon) */}
      {iconOverlayOp > 0.01 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: THEME.carbonBlack,
            opacity: iconOverlayOp,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 45,
          }}
        >
          <VelocityDartSvg size={112} />
        </div>
      ) : null}
    </div>
  );
};
