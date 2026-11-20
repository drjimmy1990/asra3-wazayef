// ==============================================================================
// ASRA3.COM — Server-Side OG Template Persistence & Bundled Arabic Font Loader
// Stored persistently in .data/og-settings.json (survives Docker rebuilds)
// ==============================================================================

import fs from "fs";
import path from "path";
import {
  DEFAULT_OG_JOB_TEMPLATE,
  isValidOgJobTemplateId,
  OgJobTemplateId,
} from "@/lib/og-template-catalog";

const OG_SETTINGS_FILE = path.join(process.cwd(), ".data", "og-settings.json");

interface OgSettingsDisk {
  activeJobTemplate: OgJobTemplateId;
  updatedAt: string;
}

export function getActiveOgJobTemplate(): OgJobTemplateId {
  try {
    if (!fs.existsSync(OG_SETTINGS_FILE)) {
      return DEFAULT_OG_JOB_TEMPLATE;
    }
    const raw = fs.readFileSync(OG_SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<OgSettingsDisk>;
    if (isValidOgJobTemplateId(parsed.activeJobTemplate)) {
      return parsed.activeJobTemplate;
    }
  } catch {
    // Fallback safely to default
  }
  return DEFAULT_OG_JOB_TEMPLATE;
}

export function setActiveOgJobTemplate(id: OgJobTemplateId): OgJobTemplateId {
  const safeId: OgJobTemplateId = isValidOgJobTemplateId(id)
    ? id
    : DEFAULT_OG_JOB_TEMPLATE;

  try {
    const dir = path.dirname(OG_SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload: OgSettingsDisk = {
      activeJobTemplate: safeId,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(OG_SETTINGS_FILE, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not persist og-settings.json:", err);
  }
  return safeId;
}

export interface LoadedOgFont {
  name: string;
  data: Buffer;
  weight: 600 | 700;
  style: "normal";
}

let cachedArabicFonts: LoadedOgFont[] | null = null;

/**
 * Loads bundled static IBM Plex Sans Arabic TTFs from public/fonts/og once into
 * memory. Static TTFs render full connected Arabic + Latin glyphs in next/og
 * without triggering Satori's unsupported OpenType lookupType 5 substFormat 3.
 */
export function loadOgArabicFonts(): LoadedOgFont[] {
  if (cachedArabicFonts) return cachedArabicFonts;

  const fontDir = path.join(process.cwd(), "public", "fonts", "og");
  const candidates: Array<{ file: string; weight: 600 | 700 }> = [
    { file: "IBMPlexSansArabic-SemiBold.ttf", weight: 600 },
    { file: "IBMPlexSansArabic-Bold.ttf", weight: 700 },
  ];

  const loaded: LoadedOgFont[] = [];
  for (const c of candidates) {
    const fullPath = path.join(fontDir, c.file);
    try {
      if (fs.existsSync(fullPath)) {
        loaded.push({
          name: "IBM Plex Sans Arabic",
          data: fs.readFileSync(fullPath),
          weight: c.weight,
          style: "normal",
        });
      }
    } catch (err) {
      console.warn(`Failed reading OG font ${c.file}:`, err);
    }
  }

  if (loaded.length > 0) {
    cachedArabicFonts = loaded;
  }
  return loaded;
}
