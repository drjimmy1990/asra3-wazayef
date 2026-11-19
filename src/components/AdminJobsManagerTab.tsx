"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { JobPostingRecord } from "@/lib/types";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

export function AdminJobsManagerTab({ appUrl }: { appUrl: string }) {
  const { lang } = useApp();

  const [jobs, setJobs] = useState<JobPostingRecord[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    published: 0,
    pending_review: 0,
    expired: 0,
    fb_posted: 0,
    employer_direct: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [harvesting, setHarvesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/jobs?status=${encodeURIComponent(statusFilter)}`
      );
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.counts) setCounts(data.counts);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleHarvestNow = async () => {
    setHarvesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "harvest_now",
          pagesPerChannel: 2,
          maxJobsToInsert: 20,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(
          lang === "ar"
            ? `✓ اكتمل الحصاد الحي: فُحص ${data.postsScanned} منشور، نُشرت ${data.jobsPublished} وظيفة جديدة، وأُضيفت ${data.companiesEnriched} شركة موثقة.`
            : `✓ Harvest complete: scanned ${data.postsScanned} posts, published ${data.jobsPublished} new jobs, enriched ${data.companiesEnriched} companies.`
        );
        loadJobs();
      }
    } finally {
      setHarvesting(false);
    }
  };

  const runAction = async (
    id: string,
    action:
      | "approve"
      | "reject"
      | "toggle_featured"
      | "expire"
      | "reset_social"
      | "delete"
  ) => {
    const res = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      loadJobs();
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cleanBase = (appUrl || "https://asra3.com").replace(/\/+$/, "");

  return (
    <div className="space-y-6">
      {/* Top Action & n8n Webhook Strip */}
      <div className="exec-card exec-card-gold-top rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "إدارة الوظائف المنشورة، طلبات الشركات، والنشر التلقائي لفيسبوك"
                : "Automated Jobs Board, Employer Queue & Facebook Syndication"}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {lang === "ar"
                ? `إجمالي نشط: ${counts.published} • بانتظار المراجعة: ${counts.pending_review} • شركات مباشرة: ${counts.employer_direct} • نُشرت على فيسبوك: ${counts.fb_posted}`
                : `Published: ${counts.published} • Pending Review: ${counts.pending_review} • Employer Direct: ${counts.employer_direct} • Posted to FB: ${counts.fb_posted}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={harvesting}
              onClick={handleHarvestNow}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-60"
            >
              {harvesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>
                {lang === "ar"
                  ? "حصاد ونشر وظائف جديدة الآن"
                  : "Harvest Live GCC Jobs Now"}
              </span>
            </button>

            <Link
              href="/jobs"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3.5 py-2.5 text-xs font-bold"
            >
              <span>{lang === "ar" ? "فتح /jobs" : "Open /jobs"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {feedback && (
          <div className="rounded-xl border border-[#D4AF37]/50 bg-[#09090B] px-4 py-3 text-xs font-bold text-[#D4AF37]">
            {feedback}
          </div>
        )}

        {/* Ready-to-Copy n8n Automation Endpoints */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
          {[
            {
              id: "wh-harvest",
              title:
                lang === "ar"
                  ? "رابط n8n لحصاد ونشر الوظائف تلقائياً (POST)"
                  : "n8n Automated Job Harvest Webhook (POST)",
              url: `${cleanBase}/api/webhooks/jobs-harvest`,
            },
            {
              id: "wh-social",
              title:
                lang === "ar"
                  ? "رابط n8n لجلب طابور فيسبوك وتيليجرام (GET / POST)"
                  : "n8n Facebook & Telegram Social Queue (GET / POST)",
              url: `${cleanBase}/api/webhooks/jobs-social?limit=2`,
            },
          ].map((ep) => (
            <div
              key={ep.id}
              className="rounded-xl bg-[#09090B] border border-zinc-800 p-3.5 text-zinc-200 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-[#D4AF37] font-bold text-[11px]">
                  {ep.title}
                </p>
                <p dir="ltr" className="font-mono text-[11px] truncate mt-0.5">
                  {ep.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyText(ep.id, ep.url)}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] font-bold hover:border-[#D4AF37] cursor-pointer"
              >
                {copiedId === ep.id ? (
                  <Check className="h-3.5 w-3.5 text-[#D4AF37]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#D4AF37]" />
                )}
                <span>{copiedId === ep.id ? "Copied" : "Copy"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: `All (${counts.total})` },
          { id: "pending_review", label: `Pending Review (${counts.pending_review})` },
          { id: "published", label: `Published (${counts.published})` },
          { id: "expired", label: `Expired (${counts.expired})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold border cursor-pointer ${
              statusFilter === f.id
                ? "bg-[#09090B] text-[#D4AF37] border-[#09090B] dark:border-[#D4AF37]"
                : "bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="exec-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37] mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300">
                  <th className="px-4 py-3 text-start font-extrabold">Role & Company</th>
                  <th className="px-4 py-3 text-start font-extrabold">Market</th>
                  <th className="px-4 py-3 text-start font-extrabold">Source & MX</th>
                  <th className="px-4 py-3 text-start font-extrabold">Status & Social</th>
                  <th className="px-4 py-3 text-end font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-4 py-3.5 max-w-xs">
                      <Link
                        href={`/jobs/${job.slug}`}
                        target="_blank"
                        className="font-extrabold text-zinc-950 dark:text-zinc-50 hover:underline block truncate"
                      >
                        {lang === "ar" ? job.title_ar : job.title_en}
                      </Link>
                      <span className="text-[11px] text-zinc-500 block truncate">
                        {job.company_name} • {job.apply_email || "External Link"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        dir="ltr"
                        className="rounded bg-[#09090B] px-2 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]"
                      >
                        {job.country_code}
                      </span>{" "}
                      <span>{job.city_name_en}</span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap space-y-1">
                      <div className="font-semibold">{job.source_type}</div>
                      {job.is_mx_verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> MX Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold">
                          Webmail / Manual Review
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap space-y-1">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          job.status === "published"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : job.status === "pending_review"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {job.status}
                      </span>
                      <div className="text-[10px] text-zinc-500">
                        {job.fb_posted_at ? "FB Posted ✓" : "FB Queued"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-end">
                      <div className="inline-flex items-center gap-1.5">
                        {job.status !== "published" && (
                          <button
                            type="button"
                            onClick={() => runAction(job.id, "approve")}
                            title="Approve & Publish"
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1.5 text-[11px] font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {job.status === "pending_review" && (
                          <button
                            type="button"
                            onClick={() => runAction(job.id, "reject")}
                            title="Reject"
                            className="rounded-lg bg-amber-600 text-white p-1.5 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => runAction(job.id, "toggle_featured")}
                          title="Toggle Featured Pin"
                          className={`rounded-lg border p-1.5 cursor-pointer ${
                            job.is_featured
                              ? "bg-[#D4AF37] text-[#09090B] border-[#D4AF37]"
                              : "border-zinc-300 dark:border-zinc-700 text-zinc-500"
                          }`}
                        >
                          <Flame className="h-3.5 w-3.5" />
                        </button>

                        <a
                          href={`/api/og/job/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview Facebook 1200x630 Card"
                          className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-1.5 text-zinc-600 dark:text-zinc-300"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </a>

                        {job.fb_posted_at && (
                          <button
                            type="button"
                            onClick={() => runAction(job.id, "reset_social")}
                            title="Re-queue for Facebook"
                            className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-1.5 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => runAction(job.id, "delete")}
                          title="Delete Job"
                          className="rounded-lg border border-red-500/40 p-1.5 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
