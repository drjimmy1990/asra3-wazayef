// ==============================================================================
// ASRA3.COM — 4 Magazine-Grade Bilingual (AR + EN) OG / Facebook Job Card Templates
// Rendered via next/og (Satori) using bundled static IBM Plex Sans Arabic TTFs.
// ==============================================================================

import type { ReactElement } from "react";
import { OgJobTemplateId } from "@/lib/og-template-catalog";

export interface OgJobCardData {
  titleAr: string;
  titleEn: string;
  companyName: string;
  countryCode: string;
  countryNameAr: string;
  countryNameEn: string;
  cityAr: string;
  cityEn: string;
  industryAr: string;
  industryEn: string;
  salaryText: string;
  employmentLabelEn: string;
  employmentLabelAr: string;
  skills: string[];
  qrDataUri: string;
  isMxVerified: boolean;
}

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_OR_DIGIT_RE = /^[A-Za-z0-9+.#&/()\-–—%:]+$/;

/**
 * Keeps Arabic, Latin, digits, and safe punctuation while stripping emojis or
 * complex-script symbols that could trigger an unsupported fallback font.
 */
export function bilingualSafe(
  text: string | null | undefined,
  fallback: string
): string {
  const cleaned = String(text || "")
    // Strip Arabic combining diacritics (tashkeel/tanween) that collide in Satori
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\u0020-\u024F\u0600-\u06FF\u060C\u061B\u061F\u2013\u2014\u2022\u00B7\u2190\u2192]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—•·]+|[\s\-–—•·]+$/g, "")
    .trim();
  return /[A-Za-z0-9\u0600-\u06FF]/.test(cleaned) ? cleaned : fallback;
}

export function latinSafe(
  text: string | null | undefined,
  fallback: string
): string {
  const cleaned = String(text || "")
    .replace(/[^\u0020-\u024F\u2013\u2014\u2022\u00B7]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–—•·]+|[\s\-–—•·]+$/g, "")
    .trim();
  return /[A-Za-z0-9]/.test(cleaned) ? cleaned : fallback;
}

export function hasArabicText(text: string): boolean {
  return ARABIC_RE.test(text);
}

/**
 * Splits an Arabic/bilingual phrase into BiDi-safe visual tokens for Satori's
 * `flexDirection: "row-reverse"` layout: consecutive Latin/number words stay
 * grouped LTR inside one span, while Arabic words flow right-to-left.
 */
function tokenizeRtlBidi(text: string): string[] {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let latinRun: string[] = [];

  const flushLatin = () => {
    if (latinRun.length > 0) {
      chunks.push(latinRun.join(" "));
      latinRun = [];
    }
  };

  for (const w of rawWords) {
    if (!ARABIC_RE.test(w) && LATIN_OR_DIGIT_RE.test(w)) {
      latinRun.push(w);
    } else {
      flushLatin();
      chunks.push(w);
    }
  }
  flushLatin();
  return chunks;
}

function truncateChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1).trim()}...`;
}

/**
 * Renders connected RTL Arabic (and mixed Arabic+English) cleanly in Satori.
 * Uses tight columnGap because Satori measures unshaped Arabic word widths.
 */
function RtlText({
  text,
  fontSize,
  color,
  fontWeight = 700,
  align = "right",
  lineHeight = 1.28,
  columnGap,
  rowGap = 2,
  maxWidth,
}: {
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: 600 | 700;
  align?: "right" | "center" | "left";
  lineHeight?: number;
  columnGap?: number;
  rowGap?: number;
  maxWidth?: string | number;
}): ReactElement {
  const cleanText = text.replace(/[\u064B-\u065F\u0670]/g, "");
  const tokens = tokenizeRtlBidi(cleanText);
  const gap = columnGap ?? Math.max(2, Math.round(fontSize * 0.06));
  const justifyContent =
    align === "center"
      ? "center"
      : align === "left"
      ? "flex-end"
      : "flex-start";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent,
        columnGap: `${gap}px`,
        rowGap: `${rowGap}px`,
        fontSize,
        fontWeight,
        color,
        lineHeight,
        maxWidth: maxWidth ?? "100%",
      }}
    >
      {tokens.map((tok, idx) => (
        <span key={`${idx}-${tok}`} style={{ display: "flex" }}>
          {tok}
        </span>
      ))}
    </div>
  );
}

/**
 * Pure geometric Asra3 speed-arrow logo mark (zero external asset fetches).
 */
function Asra3LogoMark({
  size = 40,
  inverted = false,
}: {
  size?: number;
  inverted?: boolean;
}): ReactElement {
  const bg = inverted ? "#09090B" : "#D4AF37";
  const stroke = inverted ? "#D4AF37" : "#09090B";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: inverted ? "1.5px solid #27272A" : "none",
      }}
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5 12H19M13 6L19 12L13 18"
          stroke={stroke}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 8.5H9M3 15.5H9"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function resolveBilingualTitles(data: OgJobCardData): {
  headlineAr: string;
  subtitleEn: string;
} {
  const rawAr = bilingualSafe(data.titleAr, "");
  const rawEn = latinSafe(data.titleEn, "Verified GCC Opportunity");

  if (rawAr && hasArabicText(rawAr)) {
    return {
      headlineAr: truncateChars(rawAr, 64),
      subtitleEn: truncateChars(rawEn, 68),
    };
  }

  return {
    headlineAr: truncateChars(
      `فرصة عمل في ${data.industryAr} — ${data.cityAr}`,
      64
    ),
    subtitleEn: truncateChars(rawEn, 68),
  };
}

// ==============================================================================
// TEMPLATE 1: OBSIDIAN CLASSIC (UPGRADED WITH ARABIC TITLE + ASRA3 LOGO)
// ==============================================================================
function renderObsidianClassic(data: OgJobCardData): ReactElement {
  const { headlineAr, subtitleEn } = resolveBilingualTitles(data);
  const arFontSize = headlineAr.length > 40 ? 34 : 42;
  const enFontSize = subtitleEn.length > 44 ? 22 : 26;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#09090B",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(212,175,55,0.14) 0%, rgba(9,9,11,0) 55%)",
        color: "#FAFAFA",
        fontFamily: "IBM Plex Sans Arabic",
        position: "relative",
        border: "2px solid #27272A",
      }}
    >
      {/* Top Metallic Gold Accent Strip */}
      <div
        style={{
          width: "100%",
          height: "6px",
          backgroundImage:
            "linear-gradient(90deg, #9A7B22 0%, #E5C158 50%, #D4AF37 100%)",
          display: "flex",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 56px 40px",
        }}
      >
        {/* Top Brand & Location Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Asra3LogoMark size={44} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#FAFAFA",
                }}
              >
                <span>ASRA</span>
                <span style={{ color: "#D4AF37" }}>3</span>
                <span>.COM/JOBS</span>
              </div>
              <RtlText
                text="بوابة وظائف الخليج الموثقة"
                fontSize={14}
                fontWeight={600}
                color="#A1A1AA"
                align="left"
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {data.isMxVerified ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#141417",
                  border: "1px solid #3F3F46",
                  color: "#D4AF37",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                DNS MX VERIFIED HR
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "10px",
                backgroundColor: "#D4AF37",
                color: "#09090B",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              <span>{`${data.countryCode} • ${data.cityEn.toUpperCase()}`}</span>
            </div>
          </div>
        </div>

        {/* Center Main Content + Branded QR */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "36px",
            width: "100%",
          }}
        >
          {data.qrDataUri ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                padding: "14px",
                borderRadius: "18px",
                backgroundColor: "#141417",
                border: "2px solid #D4AF37",
                width: "212px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.qrDataUri}
                alt="QR"
                width={176}
                height={176}
                style={{ borderRadius: "10px", backgroundColor: "#FFFFFF" }}
              />
              <RtlText
                text="امسح الكود للتقديم"
                fontSize={15}
                fontWeight={700}
                color="#D4AF37"
                align="center"
              />
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#A1A1AA",
                  letterSpacing: "1.2px",
                  display: "flex",
                }}
              >
                SCAN TO APPLY FREE
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RtlText
                text={`${data.industryAr} • ${data.cityAr}`}
                fontSize={18}
                fontWeight={700}
                color="#D4AF37"
              />
            </div>

            <RtlText
              text={headlineAr}
              fontSize={arFontSize}
              fontWeight={700}
              color="#FAFAFA"
              lineHeight={1.24}
            />

            <div
              style={{
                fontSize: enFontSize,
                fontWeight: 600,
                color: "#E5C158",
                lineHeight: 1.25,
                textAlign: "right",
                display: "flex",
              }}
            >
              {subtitleEn}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "14px",
                fontSize: 21,
                color: "#D4D4D8",
                fontWeight: 600,
                marginTop: "2px",
              }}
            >
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                {data.salaryText}
              </span>
              <span style={{ color: "#52525B" }}>•</span>
              {hasArabicText(data.companyName) ? (
                <RtlText
                  text={data.companyName}
                  fontSize={21}
                  fontWeight={700}
                  color="#FAFAFA"
                />
              ) : (
                <span style={{ color: "#FAFAFA", fontWeight: 700 }}>
                  {data.companyName}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {data.skills.slice(0, 4).map((sk) => (
                <div
                  key={sk}
                  style={{
                    display: "flex",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#18181B",
                    border: "1px solid #27272A",
                    color: "#E4E4E7",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  {sk}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "18px",
            borderTop: "1px solid #27272A",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 24px",
              borderRadius: "10px",
              backgroundColor: "#D4AF37",
              color: "#09090B",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <RtlText
              text="قدّم مباشرة مجاناً ←"
              fontSize={18}
              fontWeight={700}
              color="#09090B"
              align="center"
            />
          </div>

          <RtlText
            text="رابط التقديم المباشر في أول تعليق • Asra3.com"
            fontSize={18}
            fontWeight={600}
            color="#A1A1AA"
          />
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// TEMPLATE 2: GOLD SPLIT EDITORIAL (RECOMMENDED HIGH-CONTRAST FACEBOOK POSTER)
// ==============================================================================
function renderGoldSplitEditorial(data: OgJobCardData): ReactElement {
  const { headlineAr, subtitleEn } = resolveBilingualTitles(data);
  const arFontSize = headlineAr.length > 38 ? 36 : 44;
  const enFontSize = subtitleEn.length > 42 ? 22 : 26;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#0B0B0E",
        color: "#FAFAFA",
        fontFamily: "IBM Plex Sans Arabic",
      }}
    >
      {/* Left Metallic Gold Accent Sidebar (370px) */}
      <div
        style={{
          width: "370px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "36px 28px",
          backgroundImage:
            "linear-gradient(160deg, #E7C762 0%, #D4AF37 52%, #B58F24 100%)",
          color: "#09090B",
        }}
      >
        {/* Top Brand Stamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 14px",
            borderRadius: "12px",
            backgroundColor: "#09090B",
            color: "#FAFAFA",
          }}
        >
          <Asra3LogoMark size={30} />
          <div
            style={{
              display: "flex",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            <span>ASRA</span>
            <span style={{ color: "#D4AF37" }}>3</span>
            <span>.COM</span>
          </div>
        </div>

        {/* Oversized Branded QR Showcase */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            width: "100%",
          }}
        >
          {data.qrDataUri ? (
            <div
              style={{
                display: "flex",
                padding: "14px",
                borderRadius: "20px",
                backgroundColor: "#FFFFFF",
                border: "4px solid #09090B",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.qrDataUri}
                alt="QR"
                width={206}
                height={206}
                style={{ borderRadius: "8px" }}
              />
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <RtlText
              text="امسح الكود للتقديم فوراً"
              fontSize={19}
              fontWeight={700}
              color="#09090B"
              align="center"
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.6px",
                color: "#27272A",
                display: "flex",
              }}
            >
              SCAN QR • APPLY FREE
            </div>
          </div>
        </div>

        {/* Location Stamp */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "rgba(9, 9, 11, 0.14)",
            border: "1.5px solid rgba(9, 9, 11, 0.25)",
          }}
        >
          <RtlText
            text={`${data.cityAr} • ${data.countryNameAr}`}
            fontSize={17}
            fontWeight={700}
            color="#09090B"
            align="center"
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: "1px",
              display: "flex",
              marginTop: "2px",
            }}
          >
            {`${data.countryCode} • ${data.cityEn.toUpperCase()}`}
          </div>
        </div>
      </div>

      {/* Right Architectural Carbon Main Panel (830px) */}
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "42px 52px",
          backgroundColor: "#0B0B0E",
          backgroundImage:
            "radial-gradient(circle at 92% 10%, rgba(212,175,55,0.16) 0%, rgba(11,11,14,0) 58%)",
        }}
      >
        {/* Top Verified & Sector Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.45)",
              color: "#E5C158",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.8px",
            }}
          >
            {data.isMxVerified ? "MX-VERIFIED CORPORATE HR" : "GCC VERIFIED JOB"}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 16px",
              borderRadius: "999px",
              backgroundColor: "#18181B",
              border: "1px solid #27272A",
            }}
          >
            <RtlText
              text={data.industryAr}
              fontSize={16}
              fontWeight={700}
              color="#D4AF37"
            />
          </div>
        </div>

        {/* Hero Bilingual Job Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
            width: "100%",
          }}
        >
          <RtlText
            text={headlineAr}
            fontSize={arFontSize}
            fontWeight={700}
            color="#FFFFFF"
            lineHeight={1.22}
          />
          <div
            style={{
              fontSize: enFontSize,
              fontWeight: 600,
              color: "#E5C158",
              lineHeight: 1.25,
              textAlign: "right",
              display: "flex",
            }}
          >
            {subtitleEn}
          </div>
        </div>

        {/* Structured Company + Salary Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "16px 22px",
              borderRadius: "14px",
              backgroundColor: "#141418",
              border: "1px solid #27272A",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#71717A",
                  letterSpacing: "1px",
                }}
              >
                PACKAGE / TYPE
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#D4AF37",
                  marginTop: "2px",
                }}
              >
                {data.salaryText}
              </span>
            </div>

            <div
              style={{
                width: "1px",
                height: "42px",
                backgroundColor: "#27272A",
                display: "flex",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <RtlText
                text="جهة العمل الموثقة"
                fontSize={13}
                fontWeight={600}
                color="#A1A1AA"
              />
              {hasArabicText(data.companyName) ? (
                <RtlText
                  text={data.companyName}
                  fontSize={22}
                  fontWeight={700}
                  color="#FAFAFA"
                />
              ) : (
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#FAFAFA",
                    marginTop: "2px",
                  }}
                >
                  {data.companyName}
                </span>
              )}
            </div>
          </div>

          {/* Skill Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            {data.skills.slice(0, 4).map((sk) => (
              <div
                key={sk}
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#18181B",
                  border: "1px solid #3F3F46",
                  color: "#E4E4E7",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {sk}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Callout Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "16px",
            borderTop: "1px solid #27272A",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#A1A1AA",
              display: "flex",
            }}
          >
            Link in 1st Comment • Free ATS Check
          </div>
          <RtlText
            text="رابط التقديم المباشر في أول تعليق"
            fontSize={18}
            fontWeight={700}
            color="#E5C158"
          />
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// TEMPLATE 3: ROYAL IVORY LIGHT (ULTRA-HIGH CONTRAST IN FACEBOOK DARK MODE)
// ==============================================================================
function renderRoyalIvoryLight(data: OgJobCardData): ReactElement {
  const { headlineAr, subtitleEn } = resolveBilingualTitles(data);
  const arFontSize = headlineAr.length > 40 ? 36 : 44;
  const enFontSize = subtitleEn.length > 44 ? 22 : 25;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F9F7F2",
        color: "#09090B",
        fontFamily: "IBM Plex Sans Arabic",
        position: "relative",
      }}
    >
      {/* Top Carbon-Black Executive Header Bar */}
      <div
        style={{
          width: "100%",
          height: "92px",
          backgroundColor: "#09090B",
          padding: "0 52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "5px solid #D4AF37",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Asra3LogoMark size={42} />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#FAFAFA",
            }}
          >
            <span>ASRA</span>
            <span style={{ color: "#D4AF37" }}>3</span>
            <span>.COM</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              padding: "7px 16px",
              borderRadius: "8px",
              backgroundColor: "#18181B",
              border: "1px solid #3F3F46",
            }}
          >
            <RtlText
              text={`${data.cityAr}، ${data.countryNameAr}`}
              fontSize={16}
              fontWeight={700}
              color="#FAFAFA"
            />
          </div>
          <div
            style={{
              display: "flex",
              padding: "7px 16px",
              borderRadius: "8px",
              backgroundColor: "#D4AF37",
            }}
          >
            <RtlText
              text="فرصة توظيف موثقة"
              fontSize={16}
              fontWeight={700}
              color="#09090B"
            />
          </div>
        </div>
      </div>

      {/* Body Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "40px",
          padding: "32px 52px 24px",
        }}
      >
        {/* Left Dark Framed QR Card */}
        {data.qrDataUri ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "18px",
              borderRadius: "20px",
              backgroundColor: "#09090B",
              border: "3px solid #D4AF37",
              width: "242px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrDataUri}
              alt="QR"
              width={188}
              height={188}
              style={{ borderRadius: "10px", backgroundColor: "#FFFFFF" }}
            />
            <RtlText
              text="امسح الكود للتقديم"
              fontSize={16}
              fontWeight={700}
              color="#D4AF37"
              align="center"
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#D4D4D8",
                letterSpacing: "1.4px",
                display: "flex",
              }}
            >
              SCAN QR • DIRECT HR
            </div>
          </div>
        ) : null}

        {/* Right Editorial Typography Column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "14px",
            borderRight: "6px solid #D4AF37",
            paddingRight: "26px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: "6px",
                backgroundColor: "#EFEAD8",
                color: "#7C5E10",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {data.isMxVerified ? "DNS MX VERIFIED" : "VERIFIED GCC"}
            </div>
            <RtlText
              text={data.industryAr}
              fontSize={18}
              fontWeight={700}
              color="#9A7516"
            />
          </div>

          <RtlText
            text={headlineAr}
            fontSize={arFontSize}
            fontWeight={700}
            color="#09090B"
            lineHeight={1.22}
          />

          <div
            style={{
              fontSize: enFontSize,
              fontWeight: 600,
              color: "#3F3F46",
              textAlign: "right",
              display: "flex",
            }}
          >
            {subtitleEn}
          </div>

          {/* Info Cards Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "14px",
              width: "100%",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E4E1D6",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#71717A",
                  letterSpacing: "0.8px",
                }}
              >
                OFFER / TYPE
              </span>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "#9A7516",
                }}
              >
                {data.salaryText}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E4E1D6",
              }}
            >
              <RtlText
                text="الشركة المعلنة"
                fontSize={13}
                fontWeight={600}
                color="#71717A"
              />
              {hasArabicText(data.companyName) ? (
                <RtlText
                  text={data.companyName}
                  fontSize={19}
                  fontWeight={700}
                  color="#09090B"
                />
              ) : (
                <span
                  style={{ fontSize: 19, fontWeight: 700, color: "#09090B" }}
                >
                  {data.companyName}
                </span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            {data.skills.slice(0, 4).map((sk) => (
              <div
                key={sk}
                style={{
                  display: "flex",
                  padding: "5px 13px",
                  borderRadius: "8px",
                  backgroundColor: "#ECEAE1",
                  border: "1px solid #D6D3C5",
                  color: "#18181B",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {sk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 52px 24px",
          borderTop: "1px solid #E4E1D6",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "9px 22px",
            borderRadius: "10px",
            backgroundColor: "#09090B",
          }}
        >
          <RtlText
            text="التقديم المباشر عبر Asra3.com"
            fontSize={16}
            fontWeight={700}
            color="#D4AF37"
            align="center"
          />
        </div>

        <RtlText
          text="رابط التقديم وفحص السيرة الذاتية مجاناً في أول تعليق"
          fontSize={17}
          fontWeight={700}
          color="#27272A"
        />
      </div>
    </div>
  );
}

// ==============================================================================
// TEMPLATE 4: GCC NOW HIRING FLYER (HIGH-CTR SOCIAL RECRUITMENT POSTER)
// ==============================================================================
function renderGccHiringBanner(data: OgJobCardData): ReactElement {
  const { headlineAr, subtitleEn } = resolveBilingualTitles(data);
  const arFontSize = headlineAr.length > 38 ? 38 : 46;
  const enFontSize = subtitleEn.length > 44 ? 22 : 26;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0A0C10",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.22) 0%, rgba(10,12,16,0) 60%)",
        color: "#FAFAFA",
        fontFamily: "IBM Plex Sans Arabic",
        padding: "32px 48px",
        border: "3px solid #D4AF37",
      }}
    >
      {/* Top Hiring Ribbon Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 24px",
          borderRadius: "14px",
          backgroundImage:
            "linear-gradient(90deg, #D4AF37 0%, #F0D06B 55%, #D4AF37 100%)",
          color: "#09090B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Asra3LogoMark size={36} inverted />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#09090B",
            }}
          >
            ASRA3.COM
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              padding: "4px 12px",
              borderRadius: "6px",
              backgroundColor: "#09090B",
              color: "#F0D06B",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "1.4px",
            }}
          >
            NOW HIRING
          </div>
          <RtlText
            text="فرصة عمل جديدة في الخليج"
            fontSize={22}
            fontWeight={700}
            color="#09090B"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          width: "100%",
          padding: "26px 30px",
          borderRadius: "18px",
          backgroundColor: "#13161D",
          border: "1.5px solid #272B36",
        }}
      >
        {/* Left QR Box */}
        {data.qrDataUri ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "14px",
              borderRadius: "16px",
              backgroundColor: "#09090B",
              border: "2px solid #D4AF37",
              width: "204px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrDataUri}
              alt="QR"
              width={168}
              height={168}
              style={{ borderRadius: "8px", backgroundColor: "#FFFFFF" }}
            />
            <RtlText
              text="امسح للتقديم المباشر"
              fontSize={14}
              fontWeight={700}
              color="#F0D06B"
              align="center"
            />
          </div>
        ) : null}

        {/* Right Hero Title & Metadata */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                padding: "5px 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(34, 197, 94, 0.14)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                color: "#4ADE80",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {data.isMxVerified ? "MX VERIFIED HR" : "VERIFIED EMPLOYER"}
            </div>
            <div
              style={{
                display: "flex",
                padding: "5px 14px",
                borderRadius: "8px",
                backgroundColor: "#1E222D",
                border: "1px solid #323848",
              }}
            >
              <RtlText
                text={`${data.cityAr}، ${data.countryNameAr}`}
                fontSize={16}
                fontWeight={700}
                color="#F0D06B"
              />
            </div>
          </div>

          <RtlText
            text={headlineAr}
            fontSize={arFontSize}
            fontWeight={700}
            color="#FFFFFF"
            lineHeight={1.2}
          />

          <div
            style={{
              fontSize: enFontSize,
              fontWeight: 600,
              color: "#D4AF37",
              textAlign: "right",
              display: "flex",
            }}
          >
            {subtitleEn}
          </div>

          {/* Highlighted Company & Salary Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "14px",
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "#0A0C10",
              border: "1px solid #272B36",
              marginTop: "4px",
            }}
          >
            <span
              style={{ fontSize: 19, fontWeight: 700, color: "#F0D06B" }}
            >
              {data.salaryText}
            </span>
            <span style={{ color: "#52525B", fontSize: 18 }}>|</span>
            {hasArabicText(data.companyName) ? (
              <RtlText
                text={data.companyName}
                fontSize={20}
                fontWeight={700}
                color="#FAFAFA"
              />
            ) : (
              <span
                style={{ fontSize: 20, fontWeight: 700, color: "#FAFAFA" }}
              >
                {data.companyName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Skills + Direct Apply Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {data.skills.slice(0, 3).map((sk) => (
            <div
              key={sk}
              style={{
                display: "flex",
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#181B24",
                border: "1px solid #2F3545",
                color: "#D4D4D8",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {sk}
            </div>
          ))}
        </div>

        <RtlText
          text="قدّم مجاناً عبر الرابط في أول تعليق أو امسح الكود"
          fontSize={19}
          fontWeight={700}
          color="#F0D06B"
        />
      </div>
    </div>
  );
}

export function buildOgJobCardElement(
  templateId: OgJobTemplateId,
  data: OgJobCardData
): ReactElement {
  switch (templateId) {
    case "obsidian-classic":
      return renderObsidianClassic(data);
    case "royal-ivory-light":
      return renderRoyalIvoryLight(data);
    case "gcc-hiring-banner":
      return renderGccHiringBanner(data);
    case "gold-split-editorial":
    default:
      return renderGoldSplitEditorial(data);
  }
}
