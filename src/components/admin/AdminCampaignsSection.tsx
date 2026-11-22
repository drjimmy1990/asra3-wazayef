"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CampaignRecord, Language } from "@/lib/types";
import { ExternalLink, FileText, Search, Users } from "lucide-react";

interface AdminCampaignsSectionProps {
  lang: Language;
  campaigns: CampaignRecord[];
}

export function AdminCampaignsSection({
  lang,
  campaigns,
}: AdminCampaignsSectionProps) {
  const [campaignFilter, setCampaignFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    let paid = 0;
    let pending = 0;
    for (const c of campaigns) {
      if (c.payment_status === "paid") paid++;
      else pending++;
    }
    return { all: campaigns.length, paid, pending };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let list = campaigns;
    if (campaignFilter === "paid") {
      list = list.filter((c) => c.payment_status === "paid");
    } else if (campaignFilter === "pending") {
      list = list.filter((c) => c.payment_status !== "paid");
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (c) =>
        c.candidate_name.toLowerCase().includes(q) ||
        c.candidate_email.toLowerCase().includes(q) ||
        c.customer_reference.toLowerCase().includes(q) ||
        c.primary_country_code.toLowerCase().includes(q)
    );
  }, [campaigns, campaignFilter, searchQuery]);

  return (
    <div className="animate-panel-enter exec-card exec-card-gold-top rounded-2xl overflow-hidden">
      <div className="exec-card-header px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
            {lang === "ar"
              ? `سجل طلبات العملاء وحملات التوزيع (${filteredCampaigns.length})`
              : `Customer Campaigns & EasyKash Transactions (${filteredCampaigns.length})`}
          </h2>
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#09090B] p-1">
            {(
              [
                { id: "all", label: `all (${counts.all})` },
                { id: "paid", label: `paid (${counts.paid})` },
                { id: "pending", label: `pending (${counts.pending})` },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setCampaignFilter(st.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase cursor-pointer transition touch-manipulation ${
                  campaignFilter === st.id
                    ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:flex-initial sm:w-60">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "ابحث بالاسم أو البريد أو ASR..."
                  : "Search name, email or ASR ref..."
              }
              className="exec-input w-full min-h-[40px] rounded-xl ps-8 pe-3 py-2 text-base sm:text-xs placeholder:text-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {filteredCampaigns.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {lang === "ar"
              ? "لا توجد حملات مطابقة للفلتر المحدد."
              : "No campaigns match the selected filter."}
          </p>
        ) : (
          <>
            {/* Mobile Stacked Cards (< md) */}
            <div className="md:hidden space-y-3">
              {filteredCampaigns.map((camp) => {
                const pct = Math.min(
                  100,
                  Math.round(
                    (camp.emails_sent_count /
                      Math.max(1, camp.total_target_companies)) *
                      100
                  )
                );
                return (
                  <div
                    key={camp.id}
                    className="exec-well rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          dir="auto"
                          className="font-bold text-sm text-zinc-950 dark:text-zinc-50 truncate"
                        >
                          {camp.candidate_name}
                        </p>
                        <p
                          dir="ltr"
                          className="text-xs text-zinc-500 dark:text-zinc-400 truncate text-start"
                        >
                          {camp.candidate_email}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          camp.payment_status === "paid"
                            ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                            : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {camp.payment_status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        dir="ltr"
                        className="font-mono font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        {camp.customer_reference}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {camp.primary_country_code} • {camp.package_id} •{" "}
                        {camp.amount_paid} {camp.currency}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                        <span>{lang === "ar" ? "التوزيع" : "Progress"}</span>
                        <span>
                          {camp.emails_sent_count}/{camp.total_target_companies}{" "}
                          ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-[#D4AF37]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {camp.original_cv_url && (
                        <a
                          href={camp.original_cv_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#9A7B1C] dark:text-[#D4AF37]" />
                          <span>CV</span>
                        </a>
                      )}
                      <Link
                        href={`/track/${camp.tracking_token}`}
                        className="btn-carbon inline-flex min-h-[40px] items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold"
                      >
                        <span>{lang === "ar" ? "فتح" : "Portal"}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#D4AF37]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="exec-table-head text-[11px] font-bold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">Code</th>
                    <th className="px-4 py-3 text-start">
                      {lang === "ar" ? "المرشح" : "Candidate"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {lang === "ar" ? "الدولة والمسار" : "Country & Plan"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {lang === "ar" ? "المبلغ" : "Amount"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {lang === "ar" ? "التوزيع" : "Progress"}
                    </th>
                    <th className="px-4 py-3 text-end">
                      {lang === "ar" ? "الملف واللوحة" : "CV & Portal"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#121215]">
                  {filteredCampaigns.map((camp) => {
                    const pct = Math.min(
                      100,
                      Math.round(
                        (camp.emails_sent_count /
                          Math.max(1, camp.total_target_companies)) *
                          100
                      )
                    );
                    return (
                      <tr
                        key={camp.id}
                        className="even:bg-[#F8F9FB] dark:even:bg-transparent hover:bg-[#ECEEF3] dark:hover:bg-[#18181B] transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {camp.customer_reference}
                        </td>
                        <td className="px-4 py-3.5">
                          <p
                            dir="auto"
                            className="font-bold text-zinc-950 dark:text-zinc-50 text-start"
                          >
                            {camp.candidate_name}
                          </p>
                          <p
                            dir="ltr"
                            className="text-xs text-zinc-500 dark:text-zinc-400 text-start"
                          >
                            {camp.candidate_email}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-zinc-950 dark:text-zinc-100">
                            {camp.primary_country_code}
                          </span>{" "}
                          •{" "}
                          <span className="inline-block rounded bg-[#09090B] border border-zinc-800 px-2 py-0.5 uppercase text-[10px] font-extrabold text-[#D4AF37]">
                            {camp.package_id}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950 dark:text-zinc-50">
                          {camp.amount_paid} {camp.currency}
                          <span
                            className={`ms-1.5 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${
                              camp.payment_status === "paid"
                                ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {camp.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="min-w-[120px] space-y-1">
                            <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 tabular-nums">
                              {camp.emails_sent_count}/
                              {camp.total_target_companies} ({pct}%)
                            </span>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                              <div
                                className="h-full bg-[#D4AF37]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-end">
                          <div className="inline-flex items-center gap-2">
                            {camp.original_cv_url && (
                              <a
                                href={camp.original_cv_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-2.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition"
                              >
                                <FileText className="h-3 w-3 text-[#9A7B1C] dark:text-[#D4AF37]" />
                                <span>CV</span>
                              </a>
                            )}
                            <Link
                              href={`/track/${camp.tracking_token}`}
                              className="btn-carbon inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold"
                            >
                              <span>{lang === "ar" ? "فتح" : "Portal"}</span>
                              <ExternalLink className="h-3 w-3 text-[#D4AF37]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
