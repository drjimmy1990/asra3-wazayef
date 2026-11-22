// ==============================================================================
// ASRA3.COM — Zero-Chrome Production Motion-Graphics Job Reel Renderer
// Satori (next/og) 7 Transparent RGBA PNG Layers + FFmpeg Motion Compositor
// Output: 1080x1920 | 30 FPS | 10.000s | H.264 yuv420p + AAC 192k Stereo (+faststart)
// ==============================================================================

import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { execFile, spawnSync } from "child_process";
import { promisify } from "util";
import React, { type CSSProperties, type ReactElement } from "react";
import { ImageResponse } from "next/og";
import { getJobBySlug } from "@/lib/jobs-store";
import {
  bilingualSafe,
  hasArabicText,
  latinSafe,
} from "@/lib/og-job-card-renderer";
import { loadOgArabicFonts } from "@/lib/og-settings";
import { buildBrandedQrDataUri } from "@/lib/qr-code";
import {
  INITIAL_COUNTRIES,
  INITIAL_INDUSTRIES,
  maskEmail,
} from "@/lib/seed-data";
import { getCanonicalSiteUrl } from "@/lib/seo-indexer";
import type { JobPostingRecord } from "@/lib/types";

const execFileAsync = promisify(execFile);

const WIDTH = 1080;
const HEIGHT = 1920;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PRUNE_MAX_AGE_MS = 48 * 60 * 60 * 1000;
const PRUNE_MAX_FILES = 50;

const ARABIC_RE = /[\u0600-\u06FF]/;
const LATIN_OR_DIGIT_RE = /^(?=.*[A-Za-z0-9])[A-Za-z0-9+.#&/()\-–—%:,]+$/;
const PUNCT_ONLY_RE = /^[\-|—–·•:/]+$/;
const DUAL_JOIN_RE =
  /[\u0626\u0628\u062A-\u062E\u0633-\u063A\u0641-\u0647\u064A\u0640](?=[\u0621-\u064A])/g;

const SHORT_COUNTRY_AR: Record<string, string> = {
  AE: "الإمارات",
  SA: "السعودية",
  QA: "قطر",
  KW: "الكويت",
};

const CURRENCY_AR: Record<string, string> = {
  AED: "درهم",
  SAR: "ريال",
  QAR: "ريال قطري",
  KWD: "دينار",
  USD: "دولار",
};

const EMPLOYMENT_AR: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACT: "عقد",
  REMOTE: "عن بُعد",
};

export interface JobReelData {
  slug: string;
  cityAr: string;
  countryAr: string;
  locationCode: string;
  industryAr: string;
  employmentAr: string;
  titleAr: string;
  titleEn: string;
  companyPrimary: string;
  companyPrimaryIsArabic: boolean;
  companySecondary: string;
  hookSublineAr: string;
  salaryHeadlineAr: string;
  salaryCardLabelAr: string;
  salaryBenefitAr: string;
  salaryRange: string;
  skills: string[];
  domain: string;
  maskedEmail: string;
  commentKeyword: string;
  applyUrl: string;
  qrDataUri: string;
}

export interface RenderedReelResult {
  slug: string;
  filePath: string;
  sizeBytes: number;
  cached: boolean;
  renderMs: number;
}

const inFlightRenders = new Map<string, Promise<RenderedReelResult>>();
let renderQueueTail: Promise<void> = Promise.resolve();

function runInSerialQueue<T>(task: () => Promise<T>): Promise<T> {
  const result = renderQueueTail.then(task, task);
  renderQueueTail = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function getReelsCacheDir(): string {
  return path.join(process.cwd(), ".data", "reels");
}

function safeCacheKey(slug: string): string {
  const base = slug
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  const hash = crypto.createHash("sha1").update(slug).digest("hex").slice(0, 8);
  return `${base || "job"}-${hash}`;
}

function truncateChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 1)).trim()}...`;
}

function companyFromDomain(domain: string | null | undefined): string {
  const base = String(domain || "")
    .toLowerCase()
    .replace(/\.(com|net|org|gov|edu|co)\.(ae|sa|qa|kw)$/, "")
    .replace(/\.(com|net|org|gov|edu|co|io|ae|sa|qa|kw)$/, "")
    .split(".")
    .pop();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Verified Employer";
}

function stripTashkeel(text: string): string {
  return String(text || "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function countArabicJoins(word: string): number {
  const m = word.match(DUAL_JOIN_RE);
  return m ? m.length : 0;
}

interface BidiToken {
  text: string;
  kind: "ar" | "latin" | "punct";
}

function tokenizeRtlBidi(text: string): BidiToken[] {
  const rawWords = stripTashkeel(text).split(/\s+/).filter(Boolean);
  const chunks: BidiToken[] = [];
  let latinRun: string[] = [];

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

function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: Array<ReactElement | string | number | boolean | null | undefined | ReactElement[]>
): ReactElement {
  const flat: Array<ReactElement | string | number> = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      for (const c of child) {
        if (c !== null && c !== undefined && typeof c !== "boolean") {
          flat.push(c);
        }
      }
    } else if (child !== null && child !== undefined && typeof child !== "boolean") {
      flat.push(child);
    }
  }
  return React.createElement(type, props || {}, ...flat);
}

function rtlText(
  text: string,
  opts: {
    fontSize?: number;
    color?: string;
    fontWeight?: 600 | 700;
    align?: "right" | "center" | "left";
    lineHeight?: number;
    columnGap?: number;
    rowGap?: number;
    maxWidth?: string | number;
    style?: CSSProperties;
  } = {}
): ReactElement {
  const {
    fontSize = 32,
    color = "#FAFAFA",
    fontWeight = 700,
    align = "right",
    lineHeight = 1.28,
    columnGap,
    rowGap = 4,
    maxWidth = "100%",
    style = {},
  } = opts;

  const tokens = tokenizeRtlBidi(text);
  const gap = columnGap ?? Math.max(4, Math.round(fontSize * 0.22));
  const latinPadLeft = Math.max(6, Math.round(fontSize * 0.28));
  const latinPadRight = Math.max(5, Math.round(fontSize * 0.20));
  const punctPad = Math.max(4, Math.round(fontSize * 0.12));
  const justifyContent =
    align === "center"
      ? "center"
      : align === "left"
      ? "flex-end"
      : "flex-start";

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
      } satisfies CSSProperties,
    },
    tokens.map((tok, idx) => {
      let tokenStyle: CSSProperties = {};
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
          tokenStyle = {
            marginRight: -Math.round((joins - 0.5) * fontSize * 0.17),
          };
        }
      }
      return h(
        "span",
        {
          key: `${idx}-${tok.text}`,
          style: { display: "flex", ...tokenStyle } satisfies CSSProperties,
        },
        tok.text
      );
    })
  );
}

function asra3LogoMark(size = 54): ReactElement {
  return h(
    "div",
    {
      style: {
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        backgroundImage:
          "linear-gradient(135deg, #F3D982 0%, #D4AF37 60%, #B89122 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 20px rgba(212, 175, 55, 0.35)",
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

function chevronDownIcon(size = 24, color = "#D4AF37"): ReactElement {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("path", {
      d: "M6 9L12 15L18 9",
      stroke: color,
      strokeWidth: "2.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    })
  );
}

function briefcaseIcon(size = 28, color = "#D4AF37"): ReactElement {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("rect", {
      x: "3",
      y: "7",
      width: "18",
      height: "13",
      rx: "2.5",
      stroke: color,
      strokeWidth: "2.1",
    }),
    h("path", {
      d: "M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7",
      stroke: color,
      strokeWidth: "2.1",
    }),
    h("path", {
      d: "M3 12H21",
      stroke: color,
      strokeWidth: "1.9",
    })
  );
}

function shieldCheckIcon(size = 34, color = "#10B981"): ReactElement {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("path", {
      d: "M12 2L4 5.5V11.5C4 16.8 7.4 21.4 12 22.8C16.6 21.4 20 16.8 20 11.5V5.5L12 2Z",
      stroke: color,
      strokeWidth: "2.2",
      strokeLinejoin: "round",
    }),
    h("path", {
      d: "M8.5 12.2L10.8 14.5L15.8 9.5",
      stroke: color,
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    })
  );
}

function padlockIcon(size = 30, color = "#D4AF37"): ReactElement {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none" },
    h("rect", {
      x: "5",
      y: "11",
      width: "14",
      height: "10",
      rx: "2.5",
      stroke: color,
      strokeWidth: "2.2",
    }),
    h("path", {
      d: "M8 11V7.5C8 5.0 9.8 3 12 3C14.2 3 16 5.0 16 7.5V11",
      stroke: color,
      strokeWidth: "2.2",
      strokeLinecap: "round",
    })
  );
}

function fullFrameRoot(...children: ReactElement[]): ReactElement {
  return h(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        fontFamily: "IBM Plex Sans Arabic",
        backgroundColor: "transparent",
      } satisfies CSSProperties,
    },
    ...children
  );
}

function buildLayer1Chrome(job: JobReelData): ReactElement {
  return fullFrameRoot(
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        backgroundImage:
          "linear-gradient(180deg, rgba(9,9,11,0.82) 0%, rgba(9,9,11,0.34) 22%, rgba(9,9,11,0.40) 68%, rgba(9,9,11,0.88) 100%)",
      },
    }),

    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 148,
          left: 80,
          width: 920,
          height: 86,
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
            gap: 16,
          },
        },
        asra3LogoMark(54),
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "1.8px",
              },
            },
            h("span", { style: { display: "flex", color: "#FAFAFA" } }, "ASRA3"),
            h("span", { style: { display: "flex", color: "#D4AF37" } }, "JOBS")
          ),
          rtlText("بوابة وظائف الخليج الموثقة", {
            fontSize: 16,
            fontWeight: 600,
            color: "#A1A1AA",
            align: "left",
          })
        )
      ),

      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 999,
            backgroundColor: "rgba(6, 36, 26, 0.90)",
            border: "1.5px solid #10B981",
          },
        },
        rtlText(`وظيفة موثقة · ${job.cityAr}`, {
          fontSize: 24,
          fontWeight: 700,
          color: "#ECFDF5",
          align: "center",
        }),
        h("div", {
          style: {
            display: "flex",
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: "#10B981",
          },
        })
      )
    ),

    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 1536,
          left: 80,
          width: 920,
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
            fontSize: 20,
            fontWeight: 700,
            color: "#D4AF37",
            letterSpacing: "2px",
          },
        },
        "ASRA3.COM/JOBS"
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 19,
            fontWeight: 600,
            color: "#A1A1AA",
            letterSpacing: "1.4px",
          },
        },
        "DNS MX VERIFIED | DIRECT HR"
      )
    )
  );
}

function buildLayer2Hook(job: JobReelData): ReactElement {
  const headlineSize = job.salaryHeadlineAr.length > 22 ? 48 : 58;
  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 340,
          left: 80,
          width: 920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 30px",
            borderRadius: 999,
            backgroundColor: "rgba(9, 9, 11, 0.88)",
            border: "1.5px solid rgba(212, 175, 55, 0.65)",
          },
        },
        rtlText(`فرصة حقيقية في ${job.cityAr} | بدون وسطاء`, {
          fontSize: 28,
          fontWeight: 600,
          color: "#F4E19C",
          align: "center",
        })
      ),

      h(
        "div",
        {
          style: {
            width: 920,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "54px 44px",
            borderRadius: 36,
            backgroundColor: "rgba(9, 9, 11, 0.88)",
            border: "2px solid rgba(212, 175, 55, 0.45)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          },
        },
        rtlText(`وظيفة موثقة في ${job.cityAr}`, {
          fontSize: 60,
          fontWeight: 700,
          color: "#FAFAFA",
          align: "center",
        }),
        rtlText(job.hookSublineAr, {
          fontSize: 44,
          fontWeight: 600,
          color: "#D4D4D8",
          align: "center",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 42px",
              borderRadius: 24,
              backgroundImage:
                "linear-gradient(135deg, #F2D680 0%, #D4AF37 55%, #B89122 100%)",
              boxShadow: "0 12px 34px rgba(212, 175, 55, 0.35)",
            },
          },
          rtlText(job.salaryHeadlineAr, {
            fontSize: headlineSize,
            fontWeight: 700,
            color: "#09090B",
            align: "center",
          })
        ),
        rtlText("التقديم مباشر لقسم HR — الشروط أسهل مما تتوقع", {
          fontSize: 30,
          fontWeight: 600,
          color: "#E4E4E7",
          align: "center",
        })
      ),

      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "14px 32px",
            borderRadius: 999,
            backgroundColor: "rgba(9, 9, 11, 0.88)",
            border: "1.5px solid #27272A",
          },
        },
        chevronDownIcon(24, "#D4AF37"),
        rtlText("شاهد تفاصيل الشاغر الآن", {
          fontSize: 26,
          fontWeight: 700,
          color: "#D4AF37",
          align: "center",
        })
      )
    )
  );
}

function buildLayer3JobCard(job: JobReelData): ReactElement {
  const titleArSize =
    job.titleAr.length > 32 ? 42 : job.titleAr.length > 22 ? 48 : 56;
  const titleEnSize = job.titleEn.length > 38 ? 24 : 28;

  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 300,
          left: 80,
          width: 920,
          height: 540,
          display: "flex",
          flexDirection: "column",
          borderRadius: 34,
          overflow: "hidden",
          backgroundColor: "rgba(9, 9, 11, 0.92)",
          border: "2px solid rgba(212, 175, 55, 0.50)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.60)",
        },
      },
      h("div", {
        style: {
          width: "100%",
          height: 6,
          display: "flex",
          backgroundImage:
            "linear-gradient(90deg, #B89122 0%, #F2D680 50%, #D4AF37 100%)",
        },
      }),
      h(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 42px",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                padding: "8px 18px",
                borderRadius: 12,
                backgroundColor: "#18181B",
                border: "1.5px solid rgba(212, 175, 55, 0.50)",
                fontSize: 22,
                fontWeight: 700,
                color: "#D4AF37",
                letterSpacing: "1px",
              },
            },
            job.locationCode
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                padding: "8px 20px",
                borderRadius: 12,
                backgroundColor: "#18181B",
                border: "1.5px solid #27272A",
              },
            },
            rtlText(`${job.industryAr} | ${job.employmentAr}`, {
              fontSize: 22,
              fontWeight: 600,
              color: "#E4E4E7",
              align: "right",
            })
          )
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 10,
              width: "100%",
            },
          },
          rtlText(job.titleAr, {
            fontSize: titleArSize,
            fontWeight: 700,
            color: "#FAFAFA",
            align: "right",
            lineHeight: 1.18,
          }),
          h(
            "div",
            {
              style: {
                display: "flex",
                fontSize: titleEnSize,
                fontWeight: 600,
                color: "#D4AF37",
              },
            },
            job.titleEn
          )
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 14,
              borderTop: "1.5px solid #27272A",
            },
          },
          h(
            "div",
            {
              style: {
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
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: "#18181B",
                  border: "1.5px solid rgba(212, 175, 55, 0.40)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              briefcaseIcon(26, "#D4AF37")
            ),
            job.companyPrimaryIsArabic
              ? rtlText(job.companyPrimary, {
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#FAFAFA",
                  align: "right",
                })
              : h(
                  "div",
                  {
                    style: {
                      display: "flex",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#FAFAFA",
                    },
                  },
                  job.companyPrimary
                )
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                fontSize: 21,
                fontWeight: 600,
                color: "#A1A1AA",
              },
            },
            job.companySecondary
          )
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 12,
              width: "100%",
            },
          },
          job.skills.map((skill) =>
            h(
              "div",
              {
                key: skill,
                style: {
                  display: "flex",
                  padding: "9px 18px",
                  borderRadius: 12,
                  backgroundColor: "#18181B",
                  border: "1.5px solid #3F3F46",
                  fontSize: 21,
                  fontWeight: 600,
                  color: "#F4F4F5",
                },
              },
              skill
            )
          )
        )
      )
    )
  );
}

function buildLayer3bSalary(job: JobReelData): ReactElement {
  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 868,
          left: 80,
          width: 920,
          height: 196,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "24px 40px",
          borderRadius: 28,
          backgroundImage:
            "linear-gradient(135deg, #F3D982 0%, #D4AF37 55%, #B89122 100%)",
          boxShadow: "0 18px 46px rgba(212, 175, 55, 0.30)",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          },
        },
        rtlText(job.salaryCardLabelAr, {
          fontSize: 26,
          fontWeight: 700,
          color: "#18181B",
          align: "center",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              padding: "5px 16px",
              borderRadius: 999,
              backgroundColor: "#09090B",
            },
          },
          rtlText(job.salaryBenefitAr, {
            fontSize: 20,
            fontWeight: 700,
            color: "#D4AF37",
            align: "center",
          })
        )
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            fontSize: job.salaryRange.length > 22 ? 46 : 54,
            fontWeight: 700,
            color: "#09090B",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          },
        },
        job.salaryRange
      )
    )
  );
}

function buildLayer4Mx(job: JobReelData): ReactElement {
  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 1092,
          left: 80,
          width: 920,
          height: 164,
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 34px",
          borderRadius: 26,
          backgroundColor: "rgba(6, 36, 26, 0.94)",
          border: "2px solid #10B981",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.50)",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 20,
          },
        },
        h(
          "div",
          {
            style: {
              width: 58,
              height: 58,
              borderRadius: 16,
              backgroundColor: "rgba(16, 185, 129, 0.16)",
              border: "1.5px solid rgba(16, 185, 129, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          shieldCheckIcon(34, "#10B981")
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            },
          },
          rtlText("نطاق بريد HR مفحوص وموثق 100%", {
            fontSize: 28,
            fontWeight: 700,
            color: "#ECFDF5",
            align: "right",
          }),
          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                fontSize: 23,
                fontWeight: 600,
                color: "#6EE7B7",
              },
            },
            `DNS MX OK | ${job.domain}`
          )
        )
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            padding: "10px 20px",
            borderRadius: 12,
            backgroundColor: "#10B981",
            color: "#052E16",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "1px",
          },
        },
        "VERIFIED"
      )
    )
  );
}

function buildLayer5Cta(job: JobReelData): ReactElement {
  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 350,
          left: 80,
          width: 920,
          height: 215,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
          padding: "28px 36px",
          borderRadius: 30,
          backgroundColor: "rgba(9, 9, 11, 0.92)",
          border: "2px solid rgba(212, 175, 55, 0.55)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
        },
      },
      rtlText("بريد التوظيف المباشر | محمي ضد البوتات", {
        fontSize: 25,
        fontWeight: 600,
        color: "#A1A1AA",
        align: "right",
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              padding: "10px 22px",
              borderRadius: 12,
              backgroundColor: "rgba(16, 185, 129, 0.18)",
              border: "1.5px solid #10B981",
            },
          },
          rtlText("افتح البريد الآن", {
            fontSize: 24,
            fontWeight: 700,
            color: "#6EE7B7",
            align: "center",
          })
        ),
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
          padlockIcon(32, "#D4AF37"),
          h(
            "div",
            {
              style: {
                display: "flex",
                fontSize: job.maskedEmail.length > 26 ? 26 : 31,
                fontWeight: 700,
                color: "#FAFAFA",
                letterSpacing: "0.4px",
              },
            },
            job.maskedEmail
          )
        )
      )
    ),

    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 593,
          left: 80,
          width: 920,
          height: 360,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "36px 40px",
          borderRadius: 32,
          backgroundColor: "rgba(9, 9, 11, 0.92)",
          border: "2px solid #27272A",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.55)",
        },
      },
      h(
        "div",
        {
          style: {
            width: 264,
            height: 264,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 16,
            border: "3px solid #D4AF37",
          },
        },
        h("img", {
          src: job.qrDataUri,
          alt: "QR",
          width: 230,
          height: 230,
          style: { borderRadius: 8 },
        })
      ),
      h(
        "div",
        {
          style: {
            width: 530,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 14,
          },
        },
        rtlText("التقديم المباشر عبر أسرع", {
          fontSize: 25,
          fontWeight: 700,
          color: "#D4AF37",
          align: "right",
        }),
        rtlText("امسح الكود أو افتح الرابط", {
          fontSize: 40,
          fontWeight: 700,
          color: "#FAFAFA",
          align: "right",
        }),
        rtlText("توصيل فوري لسيرتك الذاتية لبريد HR", {
          fontSize: 25,
          fontWeight: 600,
          color: "#D4D4D8",
          align: "right",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              padding: "9px 22px",
              borderRadius: 12,
              backgroundColor: "#18181B",
              border: "1.5px solid rgba(212, 175, 55, 0.45)",
              fontSize: 23,
              fontWeight: 700,
              color: "#F2D680",
              letterSpacing: "0.6px",
            },
          },
          "asra3.com/jobs"
        )
      )
    )
  );
}

function buildLayer6CommentCta(job: JobReelData): ReactElement {
  const isSingleWord = !job.commentKeyword.includes(" ");
  return fullFrameRoot(
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 985,
          left: 80,
          width: 920,
          height: 270,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "28px 40px",
          borderRadius: 32,
          backgroundImage:
            "linear-gradient(135deg, #F3D982 0%, #D4AF37 55%, #B89122 100%)",
          boxShadow: "0 20px 50px rgba(212, 175, 55, 0.35)",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            padding: "8px 24px",
            borderRadius: 999,
            backgroundColor: "#09090B",
          },
        },
        rtlText("تفعيل الإرسال التلقائي في الرسائل", {
          fontSize: 22,
          fontWeight: 700,
          color: "#D4AF37",
          align: "center",
        })
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          },
        },
        rtlText("اكتب كلمة", {
          fontSize: 42,
          fontWeight: 700,
          color: "#09090B",
          align: "center",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isSingleWord ? "6px 12px 6px 26px" : "6px 22px",
              borderRadius: 14,
              backgroundColor: "#09090B",
            },
          },
          isSingleWord
            ? h(
                "span",
                {
                  style: {
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#F3D982",
                  },
                },
                job.commentKeyword
              )
            : rtlText(job.commentKeyword, {
                fontSize: 38,
                fontWeight: 700,
                color: "#F3D982",
                align: "center",
              })
        ),
        rtlText("في التعليقات الآن", {
          fontSize: 42,
          fontWeight: 700,
          color: "#09090B",
          align: "center",
        })
      ),
      rtlText("أو افتح الرابط في أول تعليق للتقديم المباشر", {
        fontSize: 26,
        fontWeight: 600,
        color: "#18181B",
        align: "center",
      })
    )
  );
}

function buildFilterGraph(): string {
  return [
    `[2:v]format=rgba,fade=t=in:st=0:d=0.25:alpha=1[c1];`,
    `[3:v]format=rgba,fade=t=in:st=0.12:d=0.18:alpha=1,fade=t=out:st=2.44:d=0.22:alpha=1[c2];`,
    `[4:v]format=rgba,fade=t=in:st=2.60:d=0.22:alpha=1,fade=t=out:st=6.30:d=0.22:alpha=1[c3];`,
    `[5:v]format=rgba,fade=t=in:st=3.28:d=0.16:alpha=1,fade=t=out:st=6.30:d=0.22:alpha=1[c3b];`,
    `[6:v]format=rgba,fade=t=in:st=4.15:d=0.16:alpha=1,fade=t=out:st=6.30:d=0.22:alpha=1[c4];`,
    `[7:v]format=rgba,fade=t=in:st=6.45:d=0.20:alpha=1[c5];`,
    `[8:v]format=rgba,fade=t=in:st=7.08:d=0.16:alpha=1[c6];`,
    `[0:v][c1]overlay=x=0:y=0[v1];`,
    `[v1][c2]overlay=x=0:y='if(lt(t,0.12),90,if(lt(t,0.48),90*pow(1-(t-0.12)/0.36,3),if(gt(t,2.44),-45*(t-2.44)/0.22,0)))':enable='between(t,0.12,2.66)'[v2];`,
    `[v2][c3]overlay=x='if(lt(t,2.60),140,if(lt(t,3.02),140*pow(1-(t-2.60)/0.42,3),0))':y=0:enable='between(t,2.60,6.52)'[v3];`,
    `[v3][c3b]overlay=x=0:y='if(lt(t,3.28),70,if(lt(t,3.62),70*pow(1-(t-3.28)/0.34,3),0))':enable='between(t,3.28,6.52)'[v4];`,
    `[v4][c4]overlay=x=0:y='if(lt(t,4.15),65,if(lt(t,4.47),65*pow(1-(t-4.15)/0.32,3),0))':enable='between(t,4.15,6.52)'[v5];`,
    `[v5][c5]overlay=x=0:y='if(lt(t,6.45),100,if(lt(t,6.85),100*pow(1-(t-6.45)/0.40,3),0))':enable='between(t,6.45,10.00)'[v6];`,
    `[v6][c6]overlay=x=0:y='if(lt(t,7.08),80,if(lt(t,7.38),80*pow(1-(t-7.08)/0.30,3),0))':enable='between(t,7.08,10.00)'[v7];`,
    `color=c=0x27272A:s=920x8:r=30:d=10,format=rgba,colorchannelmixer=aa=0.65[pbg];`,
    `color=c=0xD4AF37:s=920x8:r=30:d=10,format=rgba[pfg];`,
    `[pbg][pfg]overlay=x='-920+920*min(1,t/10)':y=0:format=rgb[pbar];`,
    `[v7][pbar]overlay=x=80:y=1604,format=yuv420p[vout]`,
  ].join("\n");
}

function resolveFfmpegBin(): string {
  const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (probe.status === 0) return "ffmpeg";

  if (process.platform === "win32") {
    const candidates: string[] = [
      path.join(process.env.LOCALAPPDATA || "", "Microsoft/WinGet/Links/ffmpeg.exe"),
    ];
    const pkgRoot = path.join(
      process.env.LOCALAPPDATA || "",
      "Microsoft/WinGet/Packages"
    );
    if (fs.existsSync(pkgRoot)) {
      for (const entry of fs.readdirSync(pkgRoot)) {
        if (entry.toLowerCase().includes("gyan.ffmpeg")) {
          const sub = path.join(pkgRoot, entry);
          for (const inner of fs.readdirSync(sub)) {
            candidates.push(path.join(sub, inner, "bin/ffmpeg.exe"));
          }
        }
      }
    }
    for (const cand of candidates) {
      if (cand && fs.existsSync(cand)) return cand;
    }
  }

  throw new Error("ffmpeg binary is not available on PATH");
}

function buildJobReelData(
  job: JobPostingRecord | null,
  slug: string,
  siteUrl: string
): JobReelData {
  if (!job) {
    const applyUrl = `${siteUrl}/jobs`;
    return {
      slug: "preview",
      cityAr: "دبي",
      countryAr: "الإمارات",
      locationCode: "AE | DUBAI",
      industryAr: "المالية والمحاسبة",
      employmentAr: "دوام كامل",
      titleAr: "مدير مالي أول",
      titleEn: "Senior Finance Manager",
      companyPrimary: "مجموعة النور كابيتال",
      companyPrimaryIsArabic: true,
      companySecondary: "Al-Noor Capital Group",
      hookSublineAr: "براتب شهري يوصل إلى",
      salaryHeadlineAr: "32,000 درهم بالشهر",
      salaryCardLabelAr: "نطاق الراتب الشهري التقديري",
      salaryBenefitAr: "مزايا وتأمين شامل",
      salaryRange: "24,000 – 32,000 AED",
      skills: ["IFRS", "Financial Modeling", "GCC VAT", "SAP ERP"],
      domain: "alnoorcapital.ae",
      maskedEmail: "c*****s@alnoorcapital.ae",
      commentKeyword: "دبي",
      applyUrl,
      qrDataUri: buildBrandedQrDataUri(applyUrl, 230),
    };
  }

  const countryCode = job.country_code || "AE";
  const countryObj =
    INITIAL_COUNTRIES.find((c) => c.code === countryCode) ||
    INITIAL_COUNTRIES[0];
  const industryObj =
    INITIAL_INDUSTRIES.find((i) => i.id === job.industry_id) ||
    INITIAL_INDUSTRIES[0];

  const cityEn = latinSafe(job.city_name_en, countryObj.cities[0].name_en);
  const cityAr = bilingualSafe(job.city_name_ar, countryObj.cities[0].name_ar);
  const countryAr = SHORT_COUNTRY_AR[countryCode] || countryObj.name_ar;
  const industryAr = bilingualSafe(industryObj.name_ar, "فرص تنفيذية");

  const empType = job.employment_type || "FULL_TIME";
  const employmentAr = EMPLOYMENT_AR[empType] || "دوام كامل";
  const employmentEn = empType.replace("_", " ");

  const rawTitleAr = bilingualSafe(job.title_ar, "");
  const titleAr =
    rawTitleAr && hasArabicText(rawTitleAr)
      ? truncateChars(rawTitleAr, 44)
      : truncateChars(`فرصة عمل في ${industryAr} — ${cityAr}`, 44);
  const titleEn = truncateChars(
    latinSafe(job.title_en, "Verified GCC Opportunity"),
    52
  );

  const rawCompany = bilingualSafe(job.company_name, "");
  const domain = truncateChars(
    latinSafe(job.company_domain, "verified-hr.gcc"),
    32
  );
  const companyPrimaryIsArabic = Boolean(rawCompany && hasArabicText(rawCompany));
  const companyPrimary = companyPrimaryIsArabic
    ? truncateChars(rawCompany, 34)
    : truncateChars(latinSafe(job.company_name, companyFromDomain(domain)), 32);
  const companySecondary = companyPrimaryIsArabic
    ? truncateChars(latinSafe(companyFromDomain(domain), domain), 28)
    : domain;

  const hasSalary = Boolean(
    job.salary_min && job.salary_max && job.salary_max > 0
  );
  const currAr = CURRENCY_AR[job.salary_currency] || job.salary_currency;

  const hookSublineAr = hasSalary
    ? "براتب شهري يوصل إلى"
    : "فرصة مميزة براتب تنافسي";
  const salaryHeadlineAr = hasSalary
    ? `${job.salary_max!.toLocaleString("en-US")} ${currAr} بالشهر`
    : "تقديم مباشر لقسم HR";
  const salaryCardLabelAr = hasSalary
    ? "نطاق الراتب الشهري التقديري"
    : "حزمة راتب ومزايا تنافسية";
  const salaryBenefitAr = hasSalary ? "مزايا وتأمين شامل" : "توظيف فوري";
  const salaryRange = hasSalary
    ? `${job.salary_min!.toLocaleString("en-US")} – ${job.salary_max!.toLocaleString("en-US")} ${job.salary_currency}`
    : `${countryCode} | ${employmentEn}`;

  const skills = (job.skills || [])
    .map((s) => truncateChars(latinSafe(s, ""), 22))
    .filter(Boolean)
    .slice(0, 4);
  if (skills.length === 0) {
    skills.push("ATS Ready", "Direct HR", "Verified Role");
  }

  const maskedEmail = truncateChars(
    latinSafe(job.masked_apply_email, "") ||
      (job.apply_email ? maskEmail(job.apply_email) : `hr@${domain}`),
    32
  );

  const applyUrl = `${siteUrl}/jobs/${encodeURIComponent(job.slug || slug)}`;
  const commentKeyword = bilingualSafe(cityAr, "وظيفة");

  return {
    slug: job.slug || slug,
    cityAr,
    countryAr,
    locationCode: `${countryCode} | ${cityEn.toUpperCase()}`,
    industryAr,
    employmentAr,
    titleAr,
    titleEn,
    companyPrimary,
    companyPrimaryIsArabic,
    companySecondary,
    hookSublineAr,
    salaryHeadlineAr,
    salaryCardLabelAr,
    salaryBenefitAr,
    salaryRange,
    skills,
    domain,
    maskedEmail,
    commentKeyword,
    applyUrl,
    qrDataUri: buildBrandedQrDataUri(applyUrl, 230),
  };
}

function pruneReelsCache(cacheDir: string): void {
  try {
    if (!fs.existsSync(cacheDir)) return;
    const now = Date.now();
    const entries = fs
      .readdirSync(cacheDir)
      .filter((name) => name.endsWith(".mp4"))
      .map((name) => {
        const full = path.join(cacheDir, name);
        const st = fs.statSync(full);
        return { full, mtimeMs: st.mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (now - entry.mtimeMs > PRUNE_MAX_AGE_MS || i >= PRUNE_MAX_FILES) {
        fs.unlinkSync(entry.full);
      }
    }
  } catch {
    // Non-fatal cleanup
  }
}

export function getCachedJobReelPath(slug: string): string | null {
  const cachePath = path.join(getReelsCacheDir(), `${safeCacheKey(slug)}.mp4`);
  if (!fs.existsSync(cachePath)) return null;
  const st = fs.statSync(cachePath);
  if (st.size < 100_000 || Date.now() - st.mtimeMs > CACHE_TTL_MS) {
    return null;
  }
  return cachePath;
}

export async function renderOrGetJobReel(
  slug: string,
  options: { force?: boolean } = {}
): Promise<RenderedReelResult | null> {
  const cleanSlug = decodeURIComponent(slug || "").trim();
  if (!cleanSlug) return null;

  const isPreview = cleanSlug === "preview";
  const jobResult = isPreview ? null : await getJobBySlug(cleanSlug);
  if (!isPreview && !jobResult?.job) {
    return null;
  }

  const cacheDir = getReelsCacheDir();
  const key = safeCacheKey(cleanSlug);
  const outPath = path.join(cacheDir, `${key}.mp4`);

  if (!options.force) {
    const cachedPath = getCachedJobReelPath(cleanSlug);
    if (cachedPath) {
      return {
        slug: cleanSlug,
        filePath: cachedPath,
        sizeBytes: fs.statSync(cachedPath).size,
        cached: true,
        renderMs: 0,
      };
    }
  }

  const existing = inFlightRenders.get(key);
  if (existing && !options.force) {
    return existing;
  }

  const promise = runInSerialQueue(async (): Promise<RenderedReelResult> => {
    const startMs = Date.now();
    if (!options.force) {
      const rechecked = getCachedJobReelPath(cleanSlug);
      if (rechecked) {
        return {
          slug: cleanSlug,
          filePath: rechecked,
          sizeBytes: fs.statSync(rechecked).size,
          cached: true,
          renderMs: 0,
        };
      }
    }

    const assetsDir = path.join(process.cwd(), "public", "reel-assets");
    const bgPath = path.join(assetsDir, "bg-dubai-luxury-10s.mp4");
    const audioPath = path.join(assetsDir, "reel-10s-bed.m4a");
    if (!fs.existsSync(bgPath) || !fs.existsSync(audioPath)) {
      throw new Error("Missing production reel assets in public/reel-assets");
    }

    fs.mkdirSync(cacheDir, { recursive: true });
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `asra3-reel-${key}-`));
    const tmpOut = path.join(tmpDir, "out.mp4");

    try {
      const siteUrl = getCanonicalSiteUrl();
      const reelData = buildJobReelData(
        jobResult?.job || null,
        cleanSlug,
        siteUrl
      );
      const fonts = loadOgArabicFonts();
      const fontList = fonts.length > 0 ? fonts : undefined;

      const layers: Array<{ file: string; el: ReactElement }> = [
        { file: "l1_chrome.png", el: buildLayer1Chrome(reelData) },
        { file: "l2_hook.png", el: buildLayer2Hook(reelData) },
        { file: "l3_card.png", el: buildLayer3JobCard(reelData) },
        { file: "l3b_salary.png", el: buildLayer3bSalary(reelData) },
        { file: "l4_mx.png", el: buildLayer4Mx(reelData) },
        { file: "l5_cta.png", el: buildLayer5Cta(reelData) },
        { file: "l6_comment_cta.png", el: buildLayer6CommentCta(reelData) },
      ];

      const layerPaths: Record<string, string> = {};
      // Render Satori PNGs sequentially or in batches of 2 to keep peak Docker RAM low
      for (const layer of layers) {
        const res = new ImageResponse(layer.el, {
          width: WIDTH,
          height: HEIGHT,
          fonts: fontList,
        });
        const buf = Buffer.from(await res.arrayBuffer());
        const target = path.join(tmpDir, layer.file);
        fs.writeFileSync(target, buf);
        layerPaths[layer.file] = target;
      }

      const ffmpegBin = resolveFfmpegBin();
      const filterGraph = buildFilterGraph();
      const args = [
        "-y",
        "-i", bgPath,
        "-i", audioPath,
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l1_chrome.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l2_hook.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l3_card.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l3b_salary.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l4_mx.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l5_cta.png"],
        "-loop", "1", "-framerate", "30", "-t", "10", "-i", layerPaths["l6_comment_cta.png"],
        "-filter_complex", filterGraph,
        "-map", "[vout]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-threads", "2",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "copy",
        "-movflags", "+faststart",
        "-t", "10",
        tmpOut,
      ];

      await execFileAsync(ffmpegBin, args, { maxBuffer: 4 * 1024 * 1024 });

      fs.copyFileSync(tmpOut, outPath);
      const sizeBytes = fs.statSync(outPath).size;
      pruneReelsCache(cacheDir);

      return {
        slug: cleanSlug,
        filePath: outPath,
        sizeBytes,
        cached: false,
        renderMs: Date.now() - startMs,
      };
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  inFlightRenders.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightRenders.delete(key);
  }
}
