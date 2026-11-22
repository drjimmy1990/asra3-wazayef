"use client";

import React, { useState } from "react";
import { Language } from "@/lib/types";
import { AdminSystemHealth } from "./admin-types";
import { AlertCircle, Check, Copy, ShieldCheck } from "lucide-react";

interface AdminSystemSectionProps {
  lang: Language;
  systemHealth: AdminSystemHealth;
}

export function AdminSystemSection({
  lang,
  systemHealth,
}: AdminSystemSectionProps) {
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);

  const copyWebhookText = (id: string, text: string) => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopiedWebhookId(id);
    setTimeout(() => setCopiedWebhookId(null), 2000);
  };

  return (
    <div className="animate-panel-enter exec-card exec-card-gold-top rounded-2xl overflow-hidden flex flex-col">
      <div className="exec-card-header px-5 py-4 sm:px-6 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
            {lang === "ar"
              ? "جاهزية الإطلاق الفعلي (EasyKash & Webhooks)"
              : "Production Go-Live Readiness & EasyKash Webhooks"}
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Live Server Diagnostics Matrix */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {lang === "ar"
              ? "فحص جاهزية البيئة الحالية بالخادم:"
              : "Live Server Environment Diagnostics:"}
          </p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {[
              {
                label:
                  lang === "ar"
                    ? "بوابة EasyKash API Key"
                    : "EasyKash DirectPayV1 API Key",
                ready: systemHealth.easykashLive,
                readyText: "LIVE",
                pendingText: "SANDBOX (.env needed)",
              },
              {
                label:
                  lang === "ar"
                    ? "توقيع EasyKash HMAC-SHA512"
                    : "EasyKash HMAC-SHA512 Verification",
                ready: systemHealth.hmacConfigured,
                readyText: "ACTIVE",
                pendingText: "SET EASYKASH_HMAC_SECRET",
              },
              {
                label:
                  lang === "ar"
                    ? "خوادم إرسال البريد (Multi-SMTP)"
                    : "Built-In Multi-SMTP Dispatch Pool",
                ready: systemHealth.smtpActiveCount > 0,
                readyText: `${systemHealth.smtpActiveCount} ACTIVE`,
                pendingText: "ADD IN SMTP TAB",
              },
              {
                label:
                  lang === "ar"
                    ? "كلمة مرور الإدارة"
                    : "Custom Production Admin Passcode",
                ready: systemHealth.customAdminPasscode,
                readyText: "HARDENED",
                pendingText: "USING DEFAULT (change in .env)",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="exec-well flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-xs"
              >
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {item.label}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase ${
                    item.ready
                      ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                      : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {item.ready ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {item.ready ? item.readyText : item.pendingText}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-1">
            Currency Mode:{" "}
            {systemHealth.currencyOverride ||
              "Dynamic GCC (AED / SAR / QAR / KWD)"}{" "}
            • Storage: {systemHealth.storageMode}
          </p>
        </div>

        {/* Copyable Production Webhook Endpoints */}
        <div className="space-y-3 text-xs pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {lang === "ar"
              ? "روابط الربط الرسمية لوضعها في لوحة EasyKash و n8n:"
              : `Endpoints Configured for ${systemHealth.appUrl}:`}
          </p>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {[
              {
                id: "ek-callback",
                title: "1. EasyKash Callback / Webhook URL (HMAC-SHA512):",
                url: `${systemHealth.appUrl}/api/webhooks/easykash`,
                copyable: true,
              },
              {
                id: "ek-api",
                title: "2. EasyKash Payment API (Outbound):",
                url: "https://back.easykash.net/api/directpayv1/pay",
                copyable: false,
              },
              {
                id: "n8n-ingest",
                title: "3. Company Harvester Ingest (POST Webhook):",
                url: `${systemHealth.appUrl}/api/webhooks/companies-ingest`,
                copyable: true,
              },
              {
                id: "n8n-health",
                title: "4. Bounce & Email Hygiene (POST Webhook):",
                url: `${systemHealth.appUrl}/api/webhooks/email-health`,
                copyable: true,
              },
              {
                id: "n8n-support",
                title:
                  "5. Support Chatbot Webhook (Set in VPS .env as N8N_SUPPORT_CHAT_WEBHOOK):",
                url: "https://n8n.asra3.com/webhook/asra3-support-chat",
                copyable: true,
              },
              {
                id: "n8n-cv-parse",
                title:
                  "6. AI CV Parser & ATS Analyzer (Set in VPS .env as N8N_CV_ANALYZE_WEBHOOK):",
                url: "https://n8n.asra3.com/webhook/asra3-cv-parse",
                copyable: true,
              },
            ].map((ep) => (
              <div
                key={ep.id}
                className="rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-zinc-200 font-mono flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[#D4AF37] font-bold mb-1 font-sans text-xs">
                    {ep.title}
                  </p>
                  <p dir="ltr" className="truncate text-[11px]">
                    {ep.url}
                  </p>
                </div>
                {ep.copyable && (
                  <button
                    type="button"
                    onClick={() => copyWebhookText(ep.id, ep.url)}
                    className="shrink-0 inline-flex min-h-[38px] items-center gap-1 rounded-lg bg-[#18181B] border border-zinc-700 px-2.5 py-1.5 text-[11px] font-sans font-bold text-zinc-100 hover:border-[#D4AF37] cursor-pointer transition touch-manipulation"
                  >
                    {copiedWebhookId === ep.id ? (
                      <Check className="h-3.5 w-3.5 text-[#D4AF37]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#D4AF37]" />
                    )}
                    <span>
                      {copiedWebhookId === ep.id
                        ? lang === "ar"
                          ? "نُسخ"
                          : "Copied"
                        : lang === "ar"
                        ? "نسخ"
                        : "Copy"}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
