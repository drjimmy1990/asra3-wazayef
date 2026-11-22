// ==============================================================================
// ASRA3.COM — Zero-Chrome Obsidian-Gold 1080x1350 (4:5) Social Carousel Renderer
// Uses Next.js bundled Satori (@vercel/og) + static IBM Plex Sans Arabic TTFs
// Outputs crisp PNGs + Meta Instagram Graph API compliant sRGB JPEGs via ffmpeg
// ==============================================================================

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync, spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");
const { ImageResponse } = require(
  path.join(ROOT, "node_modules/next/dist/compiled/@vercel/og/index.node.js")
);
const QRCode = require(path.join(ROOT, "node_modules/qrcode"));

const WIDTH = 1080;
const HEIGHT = 1350;

const FONT_BOLD_PATH = path.join(ROOT, "public/fonts/og/IBMPlexSansArabic-Bold.ttf");
const FONT_SEMIBOLD_PATH = path.join(ROOT, "public/fonts/og/IBMPlexSansArabic-SemiBold.ttf");

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_OR_DIGIT_RE = /^(?=.*[A-Za-z0-9])[A-Za-z0-9+.#&/()\-–—%:,]+$/;
const PUNCT_ONLY_RE = /^[\-|—–·•:/]+$/;
const DUAL_JOIN_RE =
  /[\u0626\u0628\u062A-\u062E\u0633-\u063A\u0641-\u0647\u064A\u0640](?=[\u0621-\u064A])/g;

function resolveFfmpegBin() {
  const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (probe.status === 0) return "ffmpeg";
  if (process.platform === "win32") {
    const link = path.join(process.env.LOCALAPPDATA || "", "Microsoft/WinGet/Links/ffmpeg.exe");
    if (fs.existsSync(link)) return link;
  }
  throw new Error("ffmpeg binary not found on PATH");
}

function h(type, props, ...children) {
  const flat = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      for (const c of child) {
        if (c !== null && c !== undefined && c !== false) flat.push(c);
      }
    } else if (child !== null && child !== undefined && child !== false) {
      flat.push(child);
    }
  }
  return {
    type,
    props: {
      ...(props || {}),
      children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat,
    },
  };
}

function stripTashkeel(text) {
  return String(text || "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function countArabicJoins(word) {
  const m = word.match(DUAL_JOIN_RE);
  return m ? m.length : 0;
}

function tokenizeRtlBidi(text) {
  const rawWords = stripTashkeel(text).split(/\s+/).filter(Boolean);
  const chunks = [];
  let latinRun = [];

  const flushLatin = () => {
    if (latinRun.length > 0) {
      chunks.push({ text: latinRun.join(" "), kind: "latin" });
      latinRun = [];
    }
  };

  for (const w of rawWords) {
    if (!ARABIC_RE.test(w) && LATIN_OR_DIGIT_RE.test(w)) {
      latinRun.push(w);
    } else if (!ARABIC_RE.test(w) && PUNCT_ONLY_RE.test(w)) {
      flushLatin();
      chunks.push({ text: w, kind: "punct" });
    } else {
      flushLatin();
      chunks.push({ text: w, kind: "ar" });
    }
  }
  flushLatin();
  return chunks;
}

function rtlText(text, opts = {}) {
  const {
    fontSize = 32,
    color = "#FAFAFA",
    fontWeight = 700,
    align = "right",
    lineHeight = 1.32,
    columnGap,
    rowGap = 4,
    maxWidth = "100%",
    style = {},
  } = opts;

  const tokens = tokenizeRtlBidi(text);
  const gap = columnGap ?? Math.max(6, Math.round(fontSize * 0.24));
  const latinPadLeft = Math.max(6, Math.round(fontSize * 0.24));
  const latinPadRight = Math.max(5, Math.round(fontSize * 0.16));
  const punctPad = Math.max(4, Math.round(fontSize * 0.10));
  const justifyContent =
    align === "center" ? "center" : align === "left" ? "flex-end" : "flex-start";

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent,
        columnGap: gap,
        rowGap,
        fontSize,
        fontWeight,
        color,
        lineHeight,
        maxWidth,
        ...style,
      },
    },
    tokens.map((tok, idx) => {
      let tokenStyle = {};
      if (tok.kind === "latin") {
        tokenStyle = {
          paddingLeft: latinPadLeft,
          paddingRight: idx === 0 ? 0 : latinPadRight,
        };
      } else if (tok.kind === "punct") {
        tokenStyle = {
          marginLeft: punctPad,
          marginRight: punctPad,
        };
      } else {
        const joins = countArabicJoins(tok.text);
        if (joins >= 2) {
          const comp = Math.min(
            Math.round(fontSize * 0.34),
            Math.round((joins - 1) * fontSize * 0.095)
          );
          if (comp > 0) {
            tokenStyle = { marginRight: -comp };
          }
        }
      }
      return h(
        "span",
        {
          key: `${idx}-${tok.text}`,
          style: { display: "flex", ...tokenStyle },
        },
        tok.text
      );
    })
  );
}

// ==============================================================================
// Pure Geometric SVG Icons (Zero Emoji / Zero External Fetch)
// ==============================================================================

function asra3LogoMark(size = 52) {
  return h(
    "div",
    {
      style: {
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        backgroundImage: "linear-gradient(135deg, #F3D982 0%, #D4AF37 60%, #B89122 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(212, 175, 55, 0.30)",
      },
    },
    h(
      "svg",
      {
        width: Math.round(size * 0.58),
        height: Math.round(size * 0.58),
        viewBox: "0 0 24 24",
        fill: "none",
      },
      h("path", {
        d: "M5 12H19M13 6L19 12L13 18",
        stroke: "#09090B",
        strokeWidth: "2.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      h("path", {
        d: "M3 8.5H9M3 15.5H9",
        stroke: "#09090B",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      })
    )
  );
}

function alertIcon(size = 34, color = "#F59E0B") {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("circle", { cx: "12", cy: "12", r: "9.5", stroke: color, strokeWidth: "2.2" }),
    h("path", { d: "M12 7.5V13", stroke: color, strokeWidth: "2.4", strokeLinecap: "round" }),
    h("circle", { cx: "12", cy: "16.5", r: "1.3", fill: color })
  );
}

function checkCircleIcon(size = 30, color = "#10B981") {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("circle", { cx: "12", cy: "12", r: "9.5", stroke: color, strokeWidth: "2.2" }),
    h("path", {
      d: "M8 12.4L10.8 15.2L16.4 9.4",
      stroke: color,
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    })
  );
}

function shieldLockIcon(size = 86) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("path", {
      d: "M12 2L4 5.5V11.8C4 17.0 7.4 21.5 12 22.8C16.6 21.5 20 17.0 20 11.8V5.5L12 2Z",
      stroke: "#10B981",
      strokeWidth: "1.8",
      fill: "rgba(16, 185, 129, 0.14)",
      strokeLinejoin: "round",
    }),
    h("rect", {
      x: "8.5",
      y: "11",
      width: "7",
      height: "5.5",
      rx: "1.4",
      stroke: "#F2D680",
      strokeWidth: "1.8",
    }),
    h("path", {
      d: "M10 11V9.3C10 8.1 10.9 7.2 12 7.2C13.1 7.2 14 8.1 14 9.3V11",
      stroke: "#F2D680",
      strokeWidth: "1.8",
      strokeLinecap: "round",
    })
  );
}

function arrowLeftIcon(size = 24, color = "#D4AF37") {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("path", {
      d: "M19 12H5M11 6L5 12L11 18",
      stroke: color,
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    })
  );
}

function sparklesIcon(size = 32, color = "#D4AF37") {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("path", {
      d: "M12 3L14.2 9.2L20.5 11.5L14.2 13.8L12 20L9.8 13.8L3.5 11.5L9.8 9.2L12 3Z",
      stroke: color,
      strokeWidth: "2",
      fill: "rgba(212, 175, 55, 0.20)",
      strokeLinejoin: "round",
    })
  );
}

// ==============================================================================
// Shared Obsidian-Gold Slide Frame (1080x1350 with Progress Bar & Safe Margins)
// ==============================================================================

function slideShell({ slideNumber, totalSlides, footerCueAr, accentGlow = "top-right" }, ...body) {
  const glow =
    accentGlow === "center"
      ? "radial-gradient(circle at 50% 42%, rgba(212,175,55,0.18) 0%, rgba(9,9,11,0) 62%)"
      : accentGlow === "emerald"
      ? "radial-gradient(circle at 50% 34%, rgba(16,185,129,0.18) 0%, rgba(212,175,55,0.08) 40%, rgba(9,9,11,0) 68%)"
      : "radial-gradient(circle at 86% 12%, rgba(212,175,55,0.20) 0%, rgba(9,9,11,0) 56%)";

  const stepLabel = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;

  return h(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#09090B",
        backgroundImage: glow,
        color: "#FAFAFA",
        fontFamily: "IBM Plex Sans Arabic",
        position: "relative",
      },
    },
    // Top metallic gold edge line
    h("div", {
      style: {
        width: "100%",
        height: 7,
        display: "flex",
        backgroundImage: "linear-gradient(90deg, #9A7B22 0%, #F2D680 50%, #D4AF37 100%)",
      },
    }),

    // Inner Safe Frame
    h(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "46px 64px 48px",
        },
      },
      // Top Brand Header
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            },
          },
          asra3LogoMark(48),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 2 } },
            h(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  fontSize: 25,
                  fontWeight: 700,
                  letterSpacing: "2px",
                },
              },
              h("span", { style: { display: "flex", color: "#FAFAFA" } }, "ASRA"),
              h("span", { style: { display: "flex", color: "#D4AF37" } }, "3"),
              h("span", { style: { display: "flex", color: "#A1A1AA", marginLeft: 8, fontSize: 18 } }, "GCC")
            ),
            rtlText("منصة التوظيف الذكي في الخليج", {
              fontSize: 15,
              fontWeight: 600,
              color: "#A1A1AA",
              align: "left",
            })
          )
        ),

        // Slide index badge
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "#141417",
              border: "1.5px solid rgba(212, 175, 55, 0.45)",
              fontSize: 20,
              fontWeight: 700,
              color: "#F2D680",
              letterSpacing: "1.5px",
            },
          },
          stepLabel
        )
      ),

      // Main Slide Body
      h(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            paddingTop: 18,
            paddingBottom: 18,
          },
        },
        ...body
      ),

      // Footer Navigation & Progress Dots
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          },
        },
        h("div", {
          style: {
            width: "100%",
            height: 1.5,
            display: "flex",
            backgroundColor: "#27272A",
          },
        }),
        h(
          "div",
          {
            style: {
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          },
          // Left: Swipe cue or website anchor
          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              },
            },
            slideNumber < totalSlides ? arrowLeftIcon(22, "#D4AF37") : null,
            rtlText(footerCueAr, {
              fontSize: 21,
              fontWeight: 700,
              color: "#D4AF37",
              align: "left",
            })
          ),

          // Center: Progress bars
          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              },
            },
            Array.from({ length: totalSlides }, (_, idx) => {
              const active = idx + 1 === slideNumber;
              return h("div", {
                key: `dot-${idx}`,
                style: {
                  width: active ? 34 : 10,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: active ? "#D4AF37" : "#27272A",
                  display: "flex",
                },
              });
            })
          ),

          // Right: Handle
          h(
            "div",
            {
              style: {
                display: "flex",
                fontSize: 19,
                fontWeight: 700,
                color: "#A1A1AA",
                letterSpacing: "1px",
              },
            },
            "@ASRA3_JOBS"
          )
        )
      )
    )
  );
}

function pillBadge(textAr, { emerald = false } = {}) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 26px",
        borderRadius: 999,
        backgroundColor: emerald ? "rgba(6, 40, 29, 0.92)" : "rgba(212, 175, 55, 0.12)",
        border: emerald
          ? "1.5px solid #10B981"
          : "1.5px solid rgba(212, 175, 55, 0.55)",
      },
    },
    rtlText(textAr, {
      fontSize: 23,
      fontWeight: 700,
      color: emerald ? "#6EE7B7" : "#F2D680",
      align: "center",
    })
  );
}

// ==============================================================================
// PIN #2 — 7-SLIDE OBSIDIAN-GOLD GUIDE CAROUSEL
// ==============================================================================

function buildPin2Slides(qrDataUri) {
  const total = 7;

  // SLIDE 1: HIGH-SAVE HOOK COVER
  const slide1 = slideShell(
    {
      slideNumber: 1,
      totalSlides: total,
      footerCueAr: "اسحب لليسار للخطوات والباقات",
      accentGlow: "center",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        },
      },
      pillBadge("دليل التوظيف الذكي في الخليج 2026"),
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: "48px 42px",
            borderRadius: 34,
            backgroundColor: "#111114",
            border: "2px solid rgba(212, 175, 55, 0.45)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.65)",
          },
        },
        rtlText("كيف تفحص سيرتك مجاناً", {
          fontSize: 64,
          fontWeight: 700,
          color: "#FAFAFA",
          align: "center",
          lineHeight: 1.18,
        }),
        rtlText("وتوصلها إلى 5,000+ شركة موثقة بالخليج؟", {
          fontSize: 50,
          fontWeight: 700,
          color: "#F2D680",
          align: "center",
          lineHeight: 1.24,
        }),
        h(
          "div",
          {
            style: {
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 34px",
              borderRadius: 18,
              backgroundImage: "linear-gradient(135deg, #F2D680 0%, #D4AF37 58%, #B89122 100%)",
            },
          },
          rtlText("مباشرة لبريد الـ HR المفحوص DNS MX — بدون وسطاء", {
            fontSize: 27,
            fontWeight: 700,
            color: "#09090B",
            align: "center",
          })
        )
      ),
      // 4 GCC Market Stat Pills
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
          },
        },
        [
          { code: "AE", num: "1,450+", city: "الإمارات" },
          { code: "SA", num: "2,100+", city: "السعودية" },
          { code: "QA", num: "820+", city: "قطر" },
          { code: "KW", num: "640+", city: "الكويت" },
        ].map((m) =>
          h(
            "div",
            {
              key: m.code,
              style: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "20px 14px",
                borderRadius: 20,
                backgroundColor: "#141417",
                border: "1.5px solid #27272A",
              },
            },
            h(
              "div",
              { style: { display: "flex", fontSize: 16, fontWeight: 700, color: "#D4AF37", letterSpacing: "1.5px" } },
              m.code
            ),
            h(
              "div",
              { style: { display: "flex", fontSize: 30, fontWeight: 700, color: "#FAFAFA" } },
              m.num
            ),
            rtlText(m.city, { fontSize: 20, fontWeight: 600, color: "#A1A1AA", align: "center" })
          )
        )
      ),
      rtlText("احفظ المنشور الآن لتختصر شهوراً من البحث العشوائي", {
        fontSize: 24,
        fontWeight: 600,
        color: "#D4D4D8",
        align: "center",
      })
    )
  );

  // SLIDE 2: WHY 80% OF CVS GET IGNORED
  const slide2 = slideShell(
    {
      slideNumber: 2,
      totalSlides: total,
      footerCueAr: "الحل في الشريحة القادمة",
      accentGlow: "top-right",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 28,
        },
      },
      pillBadge("المشكلة التي يقع فيها أغلب الباحثين عن عمل"),
      rtlText("لماذا لا يرد الـ HR على 80% من المتقدمين في الخليج؟", {
        fontSize: 50,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "right",
        lineHeight: 1.24,
      }),
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 6,
          },
        },
        [
          {
            num: "01",
            title: "أنظمة الـ ATS ترفض ملفك قبل أن يقرأه إنسان",
            desc: "غياب الكلمات المفتاحية الصحيحة أو التنسيق الخاطئ يخفض تقييمك لأقل من 50% تلقائياً",
          },
          {
            num: "02",
            title: "بوابات التوظيف المزدحمة بمئات المتقدمين يومياً",
            desc: "إرسال سيرتك على إعلان واحد وسط 900 متقدم يجعل فرص ظهور ملفك شبه معدومة",
          },
          {
            num: "03",
            title: "إعلانات وهمية أو روابط وبريد إلكتروني منتهي",
            desc: "تضيع أسابيع في التقديم على شواغر قديمة أو إيميلات غير مفعلة بدون فحص DNS MX",
          },
        ].map((item) =>
          h(
            "div",
            {
              key: item.num,
              style: {
                width: "100%",
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "flex-start",
                gap: 22,
                padding: "28px 30px",
                borderRadius: 24,
                backgroundColor: "#141417",
                border: "1.5px solid #27272A",
              },
            },
            h(
              "div",
              {
                style: {
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1.5px solid rgba(245, 158, 11, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                },
              },
              alertIcon(32, "#F59E0B")
            ),
            h(
              "div",
              {
                style: {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 8,
                },
              },
              rtlText(item.title, { fontSize: 30, fontWeight: 700, color: "#FAFAFA", align: "right" }),
              rtlText(item.desc, { fontSize: 22, fontWeight: 600, color: "#A1A1AA", align: "right", lineHeight: 1.42 })
            )
          )
        )
      )
    )
  );

  // SLIDE 3: STEP 1 — FREE AI ATS SCAN
  const slide3 = slideShell(
    {
      slideNumber: 3,
      totalSlides: total,
      footerCueAr: "الخطوة 2: استهداف 5,000+ شركة",
      accentGlow: "emerald",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 28,
        },
      },
      pillBadge("الخطوة 01 · فحص مجاني خلال 10 ثوانٍ", { emerald: true }),
      rtlText("ارفع سيرتك واحصل على تحليل ATS فوري مجاناً", {
        fontSize: 50,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "right",
        lineHeight: 1.24,
      }),
      // Score transformation card (RTL flow: Before 49% on right -> After 96% on left)
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 38px",
            borderRadius: 28,
            backgroundColor: "#111114",
            border: "2px solid rgba(16, 185, 129, 0.50)",
          },
        },
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 250 } },
          rtlText("قبل التحسين", { fontSize: 22, fontWeight: 600, color: "#A1A1AA", align: "center" }),
          h("div", { style: { display: "flex", fontSize: 64, fontWeight: 700, color: "#F59E0B" } }, "49%"),
          h("div", { style: { display: "flex", fontSize: 17, fontWeight: 600, color: "#71717A" } }, "ATS REJECT RISK")
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "14px 24px",
              borderRadius: 18,
              backgroundColor: "rgba(212, 175, 55, 0.14)",
              border: "1.5px solid rgba(212, 175, 55, 0.55)",
            },
          },
          sparklesIcon(30, "#F2D680"),
          h("div", { style: { display: "flex", fontSize: 18, fontWeight: 700, color: "#F2D680" } }, "ASRA3 AI")
        ),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 250 } },
          rtlText("بعد تحسين أسرع", { fontSize: 22, fontWeight: 700, color: "#6EE7B7", align: "center" }),
          h("div", { style: { display: "flex", fontSize: 64, fontWeight: 700, color: "#10B981" } }, "96%"),
          h("div", { style: { display: "flex", fontSize: 17, fontWeight: 700, color: "#6EE7B7" } }, "SHORTLIST READY")
        )
      ),
      // 3 checklist items
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          },
        },
        [
          "قراءة تلقائية لملف PDF أو DOCX وتحديد مجالك الوظيفي بدقة",
          "استخراج نقاط القوة والكلمات المفتاحية التي يبحث عنها HR الخليج",
          "إظهار عدد الشركات المطابقة لتخصصك قبل أن تدفع ريالاً واحداً",
        ].map((point, idx) =>
          h(
            "div",
            {
              key: `p3-${idx}`,
              style: {
                width: "100%",
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 18,
                padding: "22px 26px",
                borderRadius: 20,
                backgroundColor: "#141417",
                border: "1.5px solid #27272A",
              },
            },
            checkCircleIcon(30, "#10B981"),
            rtlText(point, { fontSize: 25, fontWeight: 600, color: "#F4F4F5", align: "right" })
          )
        )
      )
    )
  );

  // SLIDE 4: STEP 2 — PRECISION GCC TARGETING & DNS MX
  const slide4 = slideShell(
    {
      slideNumber: 4,
      totalSlides: total,
      footerCueAr: "الخطوة 3: درع سرية شركتك الحالية",
      accentGlow: "top-right",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 26,
        },
      },
      pillBadge("الخطوة 02 · استهداف جغرافي ومهني دقيق"),
      rtlText("اختر دولتك ومدينتك وتخصصك من 5,000+ شركة موثقة", {
        fontSize: 46,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "right",
        lineHeight: 1.24,
      }),
      // 2x2 GCC Cards using two flex rows
      h(
        "div",
        { style: { width: "100%", display: "flex", flexDirection: "column", gap: 20 } },
        [
          [
            {
              code: "AE · UAE",
              country: "الإمارات العربية المتحدة",
              count: "1,450+ شركة",
              cities: "دبي · أبوظبي · الشارقة · عجمان",
            },
            {
              code: "SA · KSA",
              country: "المملكة العربية السعودية",
              count: "2,100+ شركة",
              cities: "الرياض · جدة · الدمام · نيوم",
            },
          ],
          [
            {
              code: "QA · QATAR",
              country: "دولة قطر",
              count: "820+ شركة",
              cities: "الدوحة · لوسيل · الوكرة · الخور",
            },
            {
              code: "KW · KUWAIT",
              country: "دولة الكويت",
              count: "640+ شركة",
              cities: "مدينة الكويت · حولي · السالمية",
            },
          ],
        ].map((row, rIdx) =>
          h(
            "div",
            { key: `r-${rIdx}`, style: { width: "100%", display: "flex", flexDirection: "row-reverse", gap: 20 } },
            row.map((card) =>
              h(
                "div",
                {
                  key: card.code,
                  style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                    padding: "28px 28px",
                    borderRadius: 24,
                    backgroundColor: "#141417",
                    border: "1.5px solid rgba(212, 175, 55, 0.35)",
                  },
                },
                h(
                  "div",
                  {
                    style: {
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  },
                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        padding: "6px 14px",
                        borderRadius: 10,
                        backgroundColor: "rgba(212, 175, 55, 0.14)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#D4AF37",
                      },
                    },
                    card.code
                  ),
                  rtlText(card.count, { fontSize: 28, fontWeight: 700, color: "#F2D680", align: "right" })
                ),
                rtlText(card.country, { fontSize: 25, fontWeight: 700, color: "#FAFAFA", align: "right" }),
                rtlText(card.cities, { fontSize: 19, fontWeight: 600, color: "#A1A1AA", align: "right" })
              )
            )
          )
        )
      ),
      // DNS MX Guarantee Banner
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 28px",
            borderRadius: 20,
            backgroundColor: "rgba(6, 40, 29, 0.85)",
            border: "1.5px solid #10B981",
          },
        },
        h(
          "div",
          { style: { display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 14 } },
          checkCircleIcon(30, "#10B981"),
          rtlText("12 قطاعاً مهنياً · كل بريد HR مفحوص بسجلات DNS MX", {
            fontSize: 24,
            fontWeight: 700,
            color: "#ECFDF5",
            align: "right",
          })
        ),
        h("div", { style: { display: "flex", fontSize: 18, fontWeight: 700, color: "#6EE7B7" } }, "VERIFIED")
      )
    )
  );

  // SLIDE 5: STEP 3 — 100% CURRENT-EMPLOYER EXCLUSION SHIELD
  const slide5 = slideShell(
    {
      slideNumber: 5,
      totalSlides: total,
      footerCueAr: "مقارنة الباقات والأسعار في الشريحة 6",
      accentGlow: "emerald",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        },
      },
      pillBadge("الخطوة 03 · خصوصية وأمان 100%", { emerald: true }),
      rtlText("قدّم على فرص جديدة بدون أن يعرف مديرك الحالي نهائياً", {
        fontSize: 48,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "center",
        lineHeight: 1.25,
      }),
      // Centerpiece Shield Card
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            padding: "42px 40px",
            borderRadius: 32,
            backgroundColor: "#111114",
            border: "2px solid rgba(16, 185, 129, 0.55)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.60)",
          },
        },
        shieldLockIcon(90),
        rtlText("درع استبعاد الشركة الحالية (100% Exclusion Shield)", {
          fontSize: 32,
          fontWeight: 700,
          color: "#F2D680",
          align: "center",
        }),
        rtlText("فقط اكتب اسم أو نطاق شركتك الحالية داخل المعالج، ويقوم النظام بحجبها تلقائياً من قائمة التوزيع بالكامل", {
          fontSize: 25,
          fontWeight: 600,
          color: "#D4D4D8",
          align: "center",
          lineHeight: 1.45,
        })
      ),
      h(
        "div",
        { style: { width: "100%", display: "flex", flexDirection: "row-reverse", gap: 18 } },
        [
          {
            title: "الردود تصلك مباشرة",
            desc: "كل دعوة مقابلة أو رد من الـ HR يصل إلى بريدك الشخصي بدون أي وسيط",
          },
          {
            title: "لوحة تتبع شفافة",
            desc: "شاهد تقدم الحملة لحظة بلحظة وحمّل تقرير CSV بكل شركة استلمت ملفك",
          },
        ].map((box, idx) =>
          h(
            "div",
            {
              key: `b5-${idx}`,
              style: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
                padding: "24px 26px",
                borderRadius: 22,
                backgroundColor: "#141417",
                border: "1.5px solid #27272A",
              },
            },
            rtlText(box.title, { fontSize: 26, fontWeight: 700, color: "#6EE7B7", align: "right" }),
            rtlText(box.desc, { fontSize: 20, fontWeight: 600, color: "#A1A1AA", align: "right", lineHeight: 1.4 })
          )
        )
      )
    )
  );

  // SLIDE 6: TRANSPARENT PACKAGES COMPARISON (LAUNCH / TURBO / HYPER)
  const slide6 = slideShell(
    {
      slideNumber: 6,
      totalSlides: total,
      footerCueAr: "احصل على كود خصم 20% في الشريحة الأخيرة",
      accentGlow: "top-right",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 22,
        },
      },
      pillBadge("دفعة واحدة فقط · بدون أي اشتراك شهري"),
      rtlText("اختر باقة أسرع المناسبة لطموحك", {
        fontSize: 48,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "right",
        lineHeight: 1.2,
      }),
      // 3 Package Cards
      h(
        "div",
        { style: { width: "100%", display: "flex", flexDirection: "column", gap: 18 } },
        [
          {
            badge: "LAUNCH",
            nameAr: "انطلاقة أسرع · 100 شركة موثقة",
            price: "129",
            oldPrice: "249",
            currency: "AED / SAR / QAR",
            perks: "توزيع مباشر إلى 100 شركة + لوحة تتبع حية + تقرير توصيل CSV",
            featured: false,
          },
          {
            badge: "TURBO · الأكثر طلباً",
            nameAr: "مسار أسرع الاحترافي · 300 شركة",
            price: "229",
            oldPrice: "449",
            currency: "AED / SAR / QAR",
            perks: "300 شركة موثقة + خطاب تقديم ذكي AI مخصص + أولوية إرسال سريعة",
            featured: true,
          },
          {
            badge: "HYPER VIP",
            nameAr: "قمة أسرع VIP · 500+ شركة رائدة",
            price: "349",
            oldPrice: "699",
            currency: "AED / SAR / QAR",
            perks: "500+ شركة + إعادة صياغة CV لمعايير ATS + خطاب تنفيذي ثنائي اللغة",
            featured: false,
          },
        ].map((pkg) =>
          h(
            "div",
            {
              key: pkg.badge,
              style: {
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                padding: "26px 30px",
                borderRadius: 24,
                backgroundColor: pkg.featured ? "#17140B" : "#141417",
                border: pkg.featured
                  ? "2.5px solid #D4AF37"
                  : "1.5px solid #27272A",
              },
            },
            // Left: Price block
            h(
              "div",
              {
                style: {
                  width: 210,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 16px",
                  borderRadius: 18,
                  backgroundColor: pkg.featured ? "#D4AF37" : "#09090B",
                  border: pkg.featured ? "none" : "1px solid #27272A",
                  flexShrink: 0,
                },
              },
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  },
                },
                h(
                  "span",
                  {
                    style: {
                      display: "flex",
                      fontSize: 44,
                      fontWeight: 700,
                      color: pkg.featured ? "#09090B" : "#F2D680",
                    },
                  },
                  pkg.price
                ),
                h(
                  "span",
                  {
                    style: {
                      display: "flex",
                      fontSize: 20,
                      fontWeight: 600,
                      color: pkg.featured ? "#3F3208" : "#71717A",
                      textDecoration: "line-through",
                    },
                  },
                  pkg.oldPrice
                )
              ),
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 700,
                    color: pkg.featured ? "#18181B" : "#A1A1AA",
                    letterSpacing: "0.8px",
                  },
                },
                pkg.currency
              )
            ),
            // Right: Name & Perks
            h(
              "div",
              {
                style: {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 8,
                },
              },
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    padding: "5px 14px",
                    borderRadius: 999,
                    backgroundColor: pkg.featured
                      ? "rgba(212, 175, 55, 0.22)"
                      : "#1F1F24",
                    border: pkg.featured
                      ? "1px solid rgba(212, 175, 55, 0.65)"
                      : "1px solid #2E2E35",
                  },
                },
                rtlText(pkg.badge, {
                  fontSize: 16,
                  fontWeight: 700,
                  color: pkg.featured ? "#F2D680" : "#A1A1AA",
                  align: "right",
                })
              ),
              rtlText(pkg.nameAr, { fontSize: 28, fontWeight: 700, color: "#FAFAFA", align: "right" }),
              rtlText(pkg.perks, { fontSize: 20, fontWeight: 600, color: "#D4D4D8", align: "right", lineHeight: 1.38 })
            )
          )
        )
      ),
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 24px",
            borderRadius: 16,
            backgroundColor: "rgba(212, 175, 55, 0.12)",
            border: "1.5px solid rgba(212, 175, 55, 0.45)",
          },
        },
        rtlText("خصم 20% إضافي بكود ASRA3VIP · الكويت 11 / 19 / 29 KWD", {
          fontSize: 22,
          fontWeight: 700,
          color: "#F2D680",
          align: "center",
        })
      )
    )
  );

  // SLIDE 7: CTA + ASRA3VIP PROMO CODE + BRANDED QR
  const slide7 = slideShell(
    {
      slideNumber: 7,
      totalSlides: total,
      footerCueAr: "ابدأ مجاناً عبر ASRA3.COM",
      accentGlow: "center",
    },
    h(
      "div",
      {
        style: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        },
      },
      pillBadge("عرض الإطلاق الحصري · خصم 20% إضافي"),
      rtlText("ابدأ فحص سيرتك الذاتية مجاناً اليوم", {
        fontSize: 52,
        fontWeight: 700,
        color: "#FAFAFA",
        align: "center",
        lineHeight: 1.2,
      }),
      // Gold Promo Code Highlight Box
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 36px",
            borderRadius: 28,
            backgroundImage: "linear-gradient(135deg, #F2D680 0%, #D4AF37 58%, #B89122 100%)",
            boxShadow: "0 18px 48px rgba(212, 175, 55, 0.30)",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              padding: "14px 28px",
              borderRadius: 16,
              backgroundColor: "#09090B",
              fontSize: 38,
              fontWeight: 700,
              color: "#F2D680",
              letterSpacing: "4px",
            },
          },
          "ASRA3VIP"
        ),
        h(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              paddingLeft: 24,
            },
          },
          rtlText("كود الخصم الحصري 20% إضافي", { fontSize: 30, fontWeight: 700, color: "#09090B", align: "right" }),
          rtlText("يعمل على باقات Launch و Turbo و Hyper", { fontSize: 21, fontWeight: 600, color: "#18181B", align: "right" })
        )
      ),
      // Bottom Action Card: QR + 3 Steps
      h(
        "div",
        {
          style: {
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 30,
            padding: "30px 34px",
            borderRadius: 28,
            backgroundColor: "#141417",
            border: "1.5px solid #27272A",
          },
        },
        // Left: QR Box
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: 16,
              borderRadius: 22,
              backgroundColor: "#09090B",
              border: "2px solid #D4AF37",
              flexShrink: 0,
            },
          },
          h("img", {
            src: qrDataUri,
            width: 210,
            height: 210,
            style: { borderRadius: 12, backgroundColor: "#FFFFFF" },
          }),
          h(
            "div",
            { style: { display: "flex", fontSize: 15, fontWeight: 700, color: "#D4AF37", letterSpacing: "1.5px" } },
            "SCAN TO START FREE"
          )
        ),
        // Right: 3 Clear Actions
        h(
          "div",
          {
            style: {
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 20,
            },
          },
          [
            { n: "1", t: "احفظ المنشور للرجوع إليه لاحقاً" },
            { n: "2", t: 'اكتب كلمة "أسرع" أو "VIP" بالتعليقات' },
            { n: "3", t: "افتح الرابط في البايو أو امسح الكود" },
          ].map((st) =>
            h(
              "div",
              {
                key: st.n,
                style: {
                  width: "100%",
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 16,
                },
              },
              h(
                "div",
                {
                  style: {
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "rgba(212, 175, 55, 0.16)",
                    border: "1.5px solid #D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#F2D680",
                    flexShrink: 0,
                  },
                },
                st.n
              ),
              rtlText(st.t, { fontSize: 24, fontWeight: 700, color: "#FAFAFA", align: "right", lineHeight: 1.32, style: { flex: 1 } })
            )
          )
        )
      )
    )
  );

  return [slide1, slide2, slide3, slide4, slide5, slide6, slide7];
}

export async function renderPin2Carousel(outDir) {
  const targetDir = outDir || path.join(ROOT, "video-studio/out/carousels/pin2-asra3-guide");
  fs.mkdirSync(targetDir, { recursive: true });

  const fontBold = fs.readFileSync(FONT_BOLD_PATH);
  const fontSemiBold = fs.readFileSync(FONT_SEMIBOLD_PATH);
  const fonts = [
    { name: "IBM Plex Sans Arabic", data: fontSemiBold, weight: 600, style: "normal" },
    { name: "IBM Plex Sans Arabic", data: fontBold, weight: 700, style: "normal" },
  ];

  const qrUrl = "https://asra3.com/?utm_source=instagram&utm_medium=carousel&utm_campaign=pin_guide";
  const qrDataUri = await QRCode.toDataURL(qrUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#09090B", light: "#FFFFFF" },
  });

  const ffmpegBin = resolveFfmpegBin();
  const slides = buildPin2Slides(qrDataUri);
  const results = [];

  for (let i = 0; i < slides.length; i++) {
    const num = String(i + 1).padStart(2, "0");
    const pngPath = path.join(targetDir, `pin2-slide-${num}.png`);
    const jpgPath = path.join(targetDir, `pin2-slide-${num}.jpg`);

    const response = new ImageResponse(slides[i], {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });
    const pngBuf = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(pngPath, pngBuf);

    // Convert PNG -> Instagram Graph API compliant sRGB JPEG (1080x1350, q=2)
    execFileSync(
      ffmpegBin,
      [
        "-y",
        "-i",
        pngPath,
        "-vf",
        `scale=${WIDTH}:${HEIGHT},format=yuvj420p`,
        "-q:v",
        "2",
        jpgPath,
      ],
      { stdio: "ignore" }
    );

    const jpgStat = fs.statSync(jpgPath);
    results.push({
      slide: i + 1,
      pngPath,
      jpgPath,
      pngBytes: pngBuf.byteLength,
      jpgBytes: jpgStat.size,
    });
  }

  return results;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("render-social-carousel.mjs")) {
  const outArgIdx = process.argv.indexOf("--out");
  const outDir = outArgIdx !== -1 && process.argv[outArgIdx + 1] ? path.resolve(process.argv[outArgIdx + 1]) : undefined;
  renderPin2Carousel(outDir)
    .then((slides) => {
      console.log(`Rendered ${slides.length} Obsidian-Gold 1080x1350 slides:`);
      for (const s of slides) {
        console.log(`  Slide ${s.slide}: ${path.basename(s.jpgPath)} (${Math.round(s.jpgBytes / 1024)} KB)`);
      }
    })
    .catch((err) => {
      console.error("Carousel render failed:", err);
      process.exit(1);
    });
}
