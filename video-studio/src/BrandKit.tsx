import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { useAsra3Fonts } from "./fonts";
import { ArchBackdrop } from "./components/BrowserFrame";
import { BrandLockup, VelocityDartSvg } from "./components/BrandMark";
import { THEME } from "./theme";
import {
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  FileCheck2,
  Globe2,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

export const Asra3ProfileAvatar: React.FC = () => {
  useAsra3Fonts();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.carbonBlack,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ArchBackdrop dark={true} />

      {/* Outer Circular Halo Ring Safe for Facebook/TikTok/IG Circular Crop */}
      <div
        style={{
          position: "relative",
          width: 900,
          height: 900,
          borderRadius: 9999,
          border: `3px solid ${THEME.carbonBorder}`,
          backgroundColor: THEME.carbonBlack,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 22,
            borderRadius: 9999,
            border: `2px solid ${THEME.goldSolid}`,
            opacity: 0.35,
          }}
        />

        <VelocityDartSvg size={440} />

        <div
          dir="rtl"
          lang="ar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: THEME.fontArabic,
          }}
        >
          <span
            style={{
              fontSize: 78,
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
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.14em",
              backgroundColor: THEME.goldSolid,
              color: THEME.carbonBlack,
              borderRadius: 12,
              padding: "8px 20px",
            }}
          >
            ASRA3.COM
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Asra3FacebookCoverSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  ctaText: z.string(),
});

export type Asra3FacebookCoverProps = z.infer<typeof Asra3FacebookCoverSchema>;

/**
 * Facebook Page Cover (1640 x 624 — exact 820x312 @2x Retina)
 * Safe zone keeps key copy, logo, and market badges cleanly inside center 1160px
 * so neither Mobile left/right crops nor Desktop profile avatars clip text.
 */
export const Asra3FacebookCover: React.FC<Asra3FacebookCoverProps> = ({
  headline,
  subheadline,
  ctaText,
}) => {
  useAsra3Fonts();

  const markets = [
    { code: "AE", label: "الإمارات 1,450+" },
    { code: "SA", label: "السعودية 2,100+" },
    { code: "QA", label: "قطر 820+" },
    { code: "KW", label: "الكويت 640+" },
  ];

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        backgroundColor: THEME.carbonBlack,
        fontFamily: THEME.fontArabic,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ArchBackdrop dark={true} />

      {/* Top Subtle Sovereign Gold Frame Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          insetInline: 0,
          height: 6,
          backgroundColor: THEME.goldSolid,
        }}
      />

      <div
        style={{
          position: "relative",
          width: 1180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 24,
          paddingBottom: 26,
        }}
      >
        <BrandLockup darkSurface={true} scale={1.12} />

        <h1
          style={{
            margin: 0,
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#FAFAFA",
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 23,
            fontWeight: 600,
            color: "#D4D4D8",
            maxWidth: 960,
          }}
        >
          {subheadline}
        </p>

        {/* Bottom Market Badges + CTA Strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginTop: 4,
          }}
        >
          {markets.map((m) => (
            <span
              key={m.code}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 10,
                backgroundColor: THEME.carbonElevated,
                border: `1.5px solid ${THEME.carbonBorder}`,
                padding: "8px 16px",
                fontSize: 16,
                fontWeight: 800,
                color: "#FAFAFA",
              }}
            >
              <span
                dir="ltr"
                style={{
                  fontFamily: THEME.fontMono,
                  fontSize: 13,
                  fontWeight: 900,
                  color: THEME.goldSolid,
                }}
              >
                {m.code}
              </span>
              <span>{m.label}</span>
            </span>
          ))}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 12,
              backgroundColor: THEME.goldSolid,
              color: THEME.carbonBlack,
              padding: "10px 22px",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            <span>{ctaText}</span>
            <ArrowLeft size={18} color={THEME.carbonBlack} />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * LinkedIn Company Page Cover Banner (1584 x 396)
 */
export const Asra3LinkedInCover: React.FC = () => {
  useAsra3Fonts();

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        backgroundColor: THEME.carbonBlack,
        fontFamily: THEME.fontArabic,
        justifyContent: "center",
        paddingInline: 90,
      }}
    >
      <ArchBackdrop dark={true} />
      <div
        style={{
          position: "absolute",
          top: 0,
          insetInline: 0,
          height: 5,
          backgroundColor: THEME.goldSolid,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <BrandLockup darkSurface={true} scale={0.95} />
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#FAFAFA",
              lineHeight: 1.2,
            }}
          >
            أسرع مسار ذكي لإيداع سيرتك الذاتية لدى{" "}
            <span style={{ color: THEME.goldSolid }}>5,010+ شركة خليجية</span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "#A1A1AA" }}>
            فحص ATS متقدم • خطاب تقديم تنفيذي • سرية تامة • لوحة تتبع حية عبر asra3.com
          </div>
        </div>

        {/* Right KPI Pillars */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { num: "3.4×", label: "أسرع للمقابلات" },
            { num: "96%", label: "توافق ATS" },
            { num: "100%", label: "حجب شركتك" },
          ].map((stat) => (
            <div
              key={stat.num}
              style={{
                borderRadius: 16,
                backgroundColor: THEME.carbonElevated,
                border: `1.5px solid ${THEME.goldSolid}`,
                padding: "18px 24px",
                textAlign: "center",
                minWidth: 150,
              }}
            >
              <div
                dir="ltr"
                style={{
                  fontFamily: THEME.fontEditorial,
                  fontSize: 44,
                  fontWeight: 700,
                  color: THEME.goldSolid,
                  lineHeight: 1,
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#FAFAFA",
                  marginTop: 8,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CarouselSlideSchema = z.object({
  slideNumber: z.number().min(1).max(5),
  totalSlides: z.number(),
  eyebrow: z.string(),
  title: z.string(),
  body: z.string(),
  highlightValue: z.string(),
  highlightLabel: z.string(),
  dark: z.boolean(),
});

export type CarouselSlideProps = z.infer<typeof CarouselSlideSchema>;

export const Asra3CarouselSlide: React.FC<CarouselSlideProps> = ({
  slideNumber,
  totalSlides,
  eyebrow,
  title,
  body,
  highlightValue,
  highlightLabel,
  dark,
}) => {
  useAsra3Fonts();

  const surfaceBg = dark ? THEME.carbonElevated : THEME.pureWhite;
  const surfaceBorder = dark ? THEME.goldSolid : THEME.carbonBlack;
  const headingColor = dark ? "#FAFAFA" : THEME.carbonBlack;
  const bodyColor = dark ? "#D4D4D8" : "#3F3F46";

  const SlideIcon =
    slideNumber === 2
      ? Users
      : slideNumber === 3
      ? FileCheck2
      : slideNumber === 4
      ? EyeOff
      : slideNumber === 5
      ? MailCheck
      : Sparkles;

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: THEME.fontArabic,
        padding: "76px 76px 84px",
        justifyContent: "space-between",
      }}
    >
      <ArchBackdrop dark={dark} />

      {/* Top Slide Brand & Progress Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BrandLockup darkSurface={dark} scale={0.85} />
        <div
          dir="ltr"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 12,
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.goldSolid}`,
            padding: "8px 18px",
            fontFamily: THEME.fontMono,
            fontSize: 20,
            fontWeight: 900,
            color: THEME.goldSolid,
          }}
        >
          0{slideNumber} / 0{totalSlides}
        </div>
      </div>

      {/* Central Content Architectural Card */}
      <div
        style={{
          position: "relative",
          borderRadius: 28,
          backgroundColor: surfaceBg,
          border: `2px solid ${surfaceBorder}`,
          borderTop: `8px solid ${THEME.goldSolid}`,
          padding: 56,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          boxShadow: dark
            ? "0 30px 60px rgba(0, 0, 0, 0.55)"
            : "0 24px 54px rgba(9, 9, 11, 0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              backgroundColor: THEME.carbonBlack,
              border: `1.5px solid ${THEME.goldSolid}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SlideIcon size={34} color={THEME.goldSolid} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: dark ? THEME.goldSolid : THEME.goldMutedInk,
            }}
          >
            {eyebrow}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.24,
            color: headingColor,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.55,
            color: bodyColor,
          }}
        >
          {body}
        </p>

        {/* Highlight Telemetry Strip */}
        <div
          style={{
            borderRadius: 20,
            backgroundColor: THEME.carbonBlack,
            border: `1.5px solid ${THEME.goldSolid}`,
            padding: "24px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#FAFAFA",
            }}
          >
            {highlightLabel}
          </span>
          <span
            dir="ltr"
            style={{
              fontFamily: THEME.fontEditorial,
              fontSize: 54,
              fontWeight: 700,
              color: THEME.goldSolid,
              lineHeight: 1,
            }}
          >
            {highlightValue}
          </span>
        </div>
      </div>

      {/* Bottom Swipe / Website Footer */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 12,
            backgroundColor: THEME.goldSolid,
            color: THEME.carbonBlack,
            padding: "12px 24px",
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          <span>
            {slideNumber < totalSlides
              ? "اسحب للشريحة التالية"
              : "افحص سيرتك مجاناً الآن"}
          </span>
          <ArrowLeft size={20} color={THEME.carbonBlack} />
        </div>

        <span
          dir="ltr"
          style={{
            fontFamily: THEME.fontMono,
            fontSize: 22,
            fontWeight: 900,
            color: dark ? THEME.goldSolid : THEME.carbonBlack,
          }}
        >
          asra3.com
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const Asra3ComparisonPost: React.FC = () => {
  useAsra3Fonts();

  const traditionalCons = [
    "منافسة مع 1,000+ متقدم على نفس الإعلان العام",
    "استبعاد تلقائي عبر ATS بدون مراجعة بشرية",
    "صمت تام — لا تعلم إن فُتِح ملفك أصلاً",
    "تقديم عشوائي وقد يصل ملفك لجهتك الحالية",
  ];

  const asra3Pros = [
    "إيداع مباشر لصناديق بريد مديري الـ HR الموثقين",
    "فحص ATS ذكي + خطاب تقديم تنفيذي مخصص لك",
    "لوحة تتبع حية لكل شركة استلمت وفتحت سيرتك",
    "درع حماية يحجب نطاق شركتك الحالية بنسبة 100%",
  ];

  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: THEME.fontArabic,
        padding: "64px 64px 72px",
        justifyContent: "space-between",
      }}
    >
      <ArchBackdrop dark={false} />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <BrandLockup darkSurface={false} scale={0.95} />
        <h1
          style={{
            margin: 0,
            fontSize: 50,
            fontWeight: 900,
            lineHeight: 1.2,
            color: THEME.carbonBlack,
          }}
        >
          لماذا يحصل مستخدمو <span style={{ color: THEME.goldMutedInk }}>أسرع</span> على مقابلات 3.4× أسرع؟
        </h1>
      </div>

      {/* Split Comparison Grid */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Traditional Card */}
        <div
          style={{
            borderRadius: 24,
            backgroundColor: THEME.pureWhite,
            border: `2px solid ${THEME.lightBorder}`,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#52525B" }}>
              مواقع التوظيف التقليدية
            </span>
            <span
              style={{
                borderRadius: 8,
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                padding: "6px 14px",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              انتظار طويل
            </span>
          </div>
          {traditionalCons.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <XCircle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: "#3F3F46" }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Asra3 Carbon Sovereign Card */}
        <div
          style={{
            borderRadius: 24,
            backgroundColor: THEME.carbonBlack,
            border: `3px solid ${THEME.goldSolid}`,
            padding: 34,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 24px 54px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: THEME.goldSolid }}>
              منصة أسرع (Asra3.com)
            </span>
            <span
              style={{
                borderRadius: 8,
                backgroundColor: THEME.goldSolid,
                color: THEME.carbonBlack,
                padding: "6px 14px",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              في 3 دقائق فقط ⚡
            </span>
          </div>
          {asra3Pros.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={24} color={THEME.goldSolid} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FAFAFA" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Strip */}
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          backgroundColor: THEME.goldSolid,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Globe2 size={28} color={THEME.carbonBlack} />
          <span style={{ fontSize: 26, fontWeight: 900, color: THEME.carbonBlack }}>
            افحص سيرتك مجاناً وابدأ من 129 د.إ / ر.س
          </span>
        </div>
        <div
          dir="ltr"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 10,
            backgroundColor: THEME.carbonBlack,
            color: THEME.goldSolid,
            padding: "8px 18px",
            fontFamily: THEME.fontMono,
            fontSize: 22,
            fontWeight: 900,
          }}
        >
          <ShieldCheck size={20} color={THEME.goldSolid} />
          <span>asra3.com</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
