"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  OG_JOB_TEMPLATES,
  OgJobTemplateId,
} from "@/lib/og-template-catalog";

interface PreviewJobOption {
  slug: string;
  title_ar: string;
  title_en: string;
  country_code: string;
}

interface AdminOgTemplatesPanelProps {
  lang: "ar" | "en";
  activeTemplate: OgJobTemplateId;
  onTemplateUpdated: (next: OgJobTemplateId) => void;
}

export function AdminOgTemplatesPanel({
  lang,
  activeTemplate,
  onTemplateUpdated,
}: AdminOgTemplatesPanelProps) {
  const [savingId, setSavingId] = useState<OgJobTemplateId | null>(null);
  const [savedId, setSavedId] = useState<OgJobTemplateId | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewSlug, setPreviewSlug] = useState<string>("preview");
  const [liveJobs, setLiveJobs] = useState<PreviewJobOption[]>([]);

  useEffect(() => {
    fetch("/api/jobs?limit=6")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data?.jobs) ? data.jobs : [];
        setLiveJobs(
          list.map((j: Record<string, unknown>) => ({
            slug: String(j.slug || ""),
            title_ar: String(j.title_ar || j.title_en || ""),
            title_en: String(j.title_en || ""),
            country_code: String(j.country_code || "AE"),
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleSelectTemplate = async (templateId: OgJobTemplateId) => {
    if (templateId === activeTemplate || savingId) return;
    setSavingId(templateId);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ogTemplate: templateId }),
      });
      if (!res.ok) {
        throw new Error("Failed to update OG template");
      }
      const data = await res.json();
      const updated = (data?.ogTemplate || templateId) as OgJobTemplateId;
      onTemplateUpdated(updated);
      setSavedId(updated);
      setTimeout(() => setSavedId(null), 2600);
    } catch {
      setErrorMsg(
        lang === "ar"
          ? "تعذر حفظ قالب البطاقة. حاول مرة أخرى."
          : "Failed to save OG card template. Please retry."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="exec-card rounded-2xl p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#09090B] text-[#D4AF37] border border-zinc-800">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <span>
                {lang === "ar"
                  ? "قوالب بطاقات الوظائف (Facebook & OG Cards — عربي + إنجليزي)"
                  : "Social & Facebook Job Card Templates (Bilingual AR + EN)"}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {lang === "ar"
                ? "اختر القالب الافتراضي لبطاقات الوظائف المنشورة تلقائياً على فيسبوك وبطاقات المشاركة (1200×630 مع العنوان العربي وكود QR). التغيير يُطبّق فوراً على المنشورات الجديدة."
                : "Select the active design template used automatically by your 2-hour Facebook Autopilot and job share cards (1200×630 with Arabic title & branded A3 QR). Switches take effect immediately."}
            </p>
          </div>
        </div>

        {/* Live Job Preview Switcher */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="og-preview-job-select"
            className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
          >
            {lang === "ar" ? "معاينة على:" : "Preview on:"}
          </label>
          <select
            id="og-preview-job-select"
            value={previewSlug}
            onChange={(e) => setPreviewSlug(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[230px]"
          >
            <option value="preview">
              {lang === "ar"
                ? "نموذج وظيفة خليجية (عربي + إنجليزي)"
                : "Sample Bilingual GCC Job"}
            </option>
            {liveJobs.map((j) => (
              <option key={j.slug} value={j.slug}>
                {`[${j.country_code}] ${j.title_ar || j.title_en}`.slice(0, 42)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {OG_JOB_TEMPLATES.map((tpl) => {
          const isActive = activeTemplate === tpl.id;
          const isSaving = savingId === tpl.id;
          const isJustSaved = savedId === tpl.id;
          const previewUrl = `/api/og/job/${encodeURIComponent(
            previewSlug
          )}?template=${tpl.id}`;

          return (
            <div
              key={tpl.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all flex flex-col ${
                isActive
                  ? "border-[#D4AF37] bg-[#FFFDF5] dark:bg-[#141418] shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101013] hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              {/* Live 1200x630 Rendered PNG Preview */}
              <div className="relative aspect-[1200/630] w-full bg-[#09090B] overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={tpl.name_en}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-[#09090B]/90 border border-[#D4AF37]/60 px-2 py-0.5 text-[10px] font-extrabold text-[#D4AF37]">
                    {lang === "ar" ? tpl.badge_ar : tpl.badge_en}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-extrabold text-[#09090B] shadow">
                    <Check className="h-3 w-3" />
                    <span>{lang === "ar" ? "القالب المُفعَّل" : "ACTIVE"}</span>
                  </div>
                )}
              </div>

              {/* Metadata & Action Row */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
                      {lang === "ar" ? tpl.name_ar : tpl.name_en}
                    </h3>
                    <span
                      dir="ltr"
                      className="font-mono text-[10px] text-zinc-400"
                    >
                      {tpl.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {lang === "ar" ? tpl.tagline_ar : tpl.tagline_en}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    disabled={isActive || Boolean(savingId)}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#09090B] text-[#D4AF37] border border-[#D4AF37] cursor-default"
                        : "btn-gold"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isActive ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isSaving
                        ? lang === "ar"
                          ? "جارٍ التفعيل..."
                          : "Activating..."
                        : isJustSaved
                        ? lang === "ar"
                          ? "تم التفعيل ✓"
                          : "Activated ✓"
                        : isActive
                        ? lang === "ar"
                          ? "مُفعَّل حالياً"
                          : "Currently Active"
                        : lang === "ar"
                        ? "تفعيل هذا القالب"
                        : "Use This Template"}
                    </span>
                  </button>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] transition-colors"
                  >
                    <span>{lang === "ar" ? "معاينة HD" : "Full HD"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
