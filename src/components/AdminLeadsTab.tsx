"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SupportLeadRecord, SupportLeadStatus } from "@/lib/types";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface AdminLeadsTabProps {
  onNewCountChange?: (count: number) => void;
}

export function AdminLeadsTab({ onNewCountChange }: AdminLeadsTabProps) {
  const { lang } = useApp();
  const [leads, setLeads] = useState<SupportLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SupportLeadStatus>("all");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        onNewCountChange?.(Number(data.newCount) || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [onNewCountChange]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const handleStatusChange = async (id: string, status: SupportLeadStatus) => {
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      onNewCountChange?.(Number(data.newCount) || 0);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      onNewCountChange?.(Number(data.newCount) || 0);
    }
  };

  const filtered =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="animate-panel-enter exec-card exec-card-gold-top rounded-2xl overflow-hidden">
      <div className="exec-card-header px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? `طلبات الدعم وتواصل العملاء (${leads.length})`
                : `Support Chatbot & Customer Leads (${leads.length})`}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === "ar"
                ? "البيانات المجمّعة تلقائياً من زر الدعم العائم ووكيل n8n الذكي"
                : "Contacts collected automatically from the floating Support Chat Widget & n8n AI"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "new", "contacted", "resolved"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase cursor-pointer transition ${
                filter === st
                  ? "btn-gold"
                  : "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadLeads()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-2 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-zinc-500">
            <MessageSquare className="h-8 w-8 mx-auto text-zinc-400" />
            <p className="text-sm font-bold">
              {lang === "ar"
                ? "لا توجد طلبات تواصل في هذا القسم حالياً."
                : "No support leads in this filter yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => {
              const waDigits = lead.phone.replace(/[^0-9]/g, "");
              return (
                <div
                  key={lead.id}
                  className="exec-well rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                        {lead.name}
                      </span>
                      <span
                        dir="ltr"
                        className="rounded bg-[#09090B] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#D4AF37]"
                      >
                        {lead.country_code} • {lead.topic.toUpperCase()}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          lead.status === "new"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : lead.status === "contacted"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {lead.status}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(lead.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                      {lead.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=Asra3.com%20Support`}
                          className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-[#D4AF37] hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span dir="ltr">{lead.email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${waDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr">{lead.phone} (WhatsApp)</span>
                        </a>
                      )}
                      <span className="text-[11px] text-zinc-500">
                        Page: {lead.page_url}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {lead.status !== "contacted" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(lead.id, "contacted")}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] cursor-pointer"
                      >
                        {lang === "ar" ? "تم التواصل" : "Mark Contacted"}
                      </button>
                    )}
                    {lead.status !== "resolved" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(lead.id, "resolved")}
                        className="btn-gold inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-extrabold cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{lang === "ar" ? "مكتمل" : "Resolve"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(lead.id)}
                      title="Delete lead"
                      className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#121215] p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
