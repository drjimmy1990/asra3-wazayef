"use client";

import React, { useState } from "react";
import { Language, SmtpAccountConfig } from "@/lib/types";
import { SmtpFormState, SmtpSummary } from "./admin-types";
import {
  Loader2,
  Mail,
  Pencil,
  PlusCircle,
  Power,
  Send,
  Server,
  Trash2,
} from "lucide-react";

interface AdminSmtpSectionProps {
  lang: Language;
  smtpAccounts: SmtpAccountConfig[];
  smtpSummary: SmtpSummary;
  onRefreshSmtp: () => Promise<void> | void;
}

const DEFAULT_SMTP_FORM: SmtpFormState = {
  id: "",
  label: "",
  host: "",
  port: 465,
  secure: true,
  user: "",
  pass: "",
  from_email: "",
  from_name: "Asra3 Executive Talent Desk",
  daily_limit: 350,
};

export function AdminSmtpSection({
  lang,
  smtpAccounts,
  smtpSummary,
  onRefreshSmtp,
}: AdminSmtpSectionProps) {
  const [smtpForm, setSmtpForm] = useState<SmtpFormState>(DEFAULT_SMTP_FORM);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [testToEmail, setTestToEmail] = useState("");
  const [testAccountId, setTestAccountId] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const applySmtpPreset = (preset: {
    label: string;
    host: string;
    port: number;
    secure: boolean;
    daily_limit: number;
  }) => {
    setSmtpFeedback(null);
    setSmtpForm((prev) => ({
      ...prev,
      id: "",
      label: preset.label,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      daily_limit: preset.daily_limit,
    }));
  };

  const resetSmtpForm = () => {
    setSmtpForm(DEFAULT_SMTP_FORM);
  };

  const handleSaveSmtpAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpFeedback(null);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpFeedback({
          ok: true,
          text:
            lang === "ar"
              ? "✓ تم حفظ حساب SMTP وتفعيله في محرك الإرسال التلقائي."
              : "✓ SMTP account saved and added to the active rotation pool.",
        });
        resetSmtpForm();
        await onRefreshSmtp();
      } else {
        setSmtpFeedback({
          ok: false,
          text: data.error || "Failed to save SMTP account.",
        });
      }
    } catch {
      setSmtpFeedback({
        ok: false,
        text: "Network error while saving SMTP settings.",
      });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleEditSmtpAccount = (acc: SmtpAccountConfig) => {
    setSmtpFeedback(null);
    setSmtpForm({
      id: acc.id,
      label: acc.label,
      host: acc.host,
      port: acc.port,
      secure: acc.secure,
      user: acc.user,
      pass: "",
      from_email: acc.from_email,
      from_name: acc.from_name,
      daily_limit: acc.daily_limit,
    });
  };

  const handleToggleSmtpAccount = async (acc: SmtpAccountConfig) => {
    await fetch("/api/admin/smtp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: acc.id, is_active: !acc.is_active }),
    });
    await onRefreshSmtp();
  };

  const handleDeleteSmtpAccount = async (acc: SmtpAccountConfig) => {
    await fetch(`/api/admin/smtp?id=${encodeURIComponent(acc.id)}`, {
      method: "DELETE",
    });
    if (smtpForm.id === acc.id) resetSmtpForm();
    await onRefreshSmtp();
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testToEmail.trim()) return;
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          accountId: testAccountId || undefined,
          toEmail: testToEmail.trim(),
        }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        text: data.message || data.error || "Unknown SMTP response.",
      });
      if (data.ok) {
        await onRefreshSmtp();
      }
    } catch {
      setTestResult({
        ok: false,
        text: "Network error while testing SMTP connection.",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="animate-panel-enter space-y-6">
      {/* Top Status & Architecture Strip */}
      <div className="exec-card exec-card-gold-top rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                  smtpSummary.activeCount > 0
                    ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                    : "bg-zinc-100 dark:bg-[#09090B] border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
                }`}
              >
                <Server className="h-3 w-3" />
                {smtpSummary.activeCount > 0
                  ? lang === "ar"
                    ? `محرك SMTP المباشر مفعل (${smtpSummary.activeCount} حساب نشط)`
                    : `Live Multi-SMTP Dispatch Active (${smtpSummary.activeCount} Active)`
                  : lang === "ar"
                  ? "وضع المحاكاة (أضف حساب SMTP لتفعيل الإرسال الفعلي)"
                  : "Sandbox Mode (Add an SMTP Server to Go Live)"}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "إدارة خوادم البريد (Multi-SMTP Rotation) وإرفاق السيرة الذاتية تلقائياً"
                : "Built-In Multi-SMTP Rotation Pool & Direct CV Attachment Engine"}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {lang === "ar"
                ? "يعمل الإرسال مباشرة من داخل حاوية Docker دون الحاجة لأي خدمات خارجية: يتم إرفاق ملف PDF/DOCX الأصلي للمرشح، وتوجيه ردود الـ HR مباشرة لبريد المرشح (Reply-To)، مع التبديل التلقائي (Round-Robin) بين جميع حسابات SMTP المضافة لحماية سمعة النطاق."
                : "Emails dispatch natively inside your Docker container: attaches the candidate's uploaded PDF/DOCX CV, sets Reply-To directly to the candidate's personal inbox, tracks opens via 1x1 pixel, and round-robins across all active SMTP accounts with automatic daily quota limits."}
            </p>
          </div>

          <div className="rounded-xl bg-[#09090B] border border-zinc-800 px-5 py-3.5 text-end">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {lang === "ar"
                ? "السعة اليومية المستخدمة"
                : "Daily Pool Quota Used"}
            </p>
            <p className="mt-1 font-editorial text-2xl font-bold text-[#D4AF37] tabular-nums">
              {smtpSummary.sentTodayTotal.toLocaleString()} /{" "}
              {smtpSummary.totalDailyCapacity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Add / Edit SMTP Account Form + 1-Click Presets */}
        <div className="exec-card exec-card-carbon-top xl:col-span-5 rounded-2xl overflow-hidden flex flex-col">
          <div className="exec-card-header px-5 py-4 sm:px-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                {smtpForm.id
                  ? lang === "ar"
                    ? "تعديل بيانات خادم SMTP"
                    : "Edit SMTP Mailer"
                  : lang === "ar"
                  ? "إضافة حساب SMTP جديد"
                  : "Add SMTP Server to Pool"}
              </h3>
            </div>
            {smtpForm.id && (
              <button
                type="button"
                onClick={resetSmtpForm}
                className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] cursor-pointer"
              >
                {lang === "ar" ? "إلغاء التعديل" : "Cancel Edit"}
              </button>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* 1-Click Provider Presets */}
            <div className="exec-well rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                {lang === "ar"
                  ? "قوالب إعداد سريع بنقرة واحدة:"
                  : "1-Click Provider Presets:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: "Hostinger",
                    label: "Hostinger Business Mail",
                    host: "smtp.hostinger.com",
                    port: 465,
                    secure: true,
                    daily_limit: 400,
                  },
                  {
                    name: "Brevo SMTP",
                    label: "Brevo Transactional Relay",
                    host: "smtp-relay.brevo.com",
                    port: 587,
                    secure: false,
                    daily_limit: 2500,
                  },
                  {
                    name: "Amazon SES",
                    label: "Amazon SES (ME-Central)",
                    host: "email-smtp.me-central-1.amazonaws.com",
                    port: 587,
                    secure: false,
                    daily_limit: 5000,
                  },
                  {
                    name: "Google Workspace",
                    label: "Google Workspace / Gmail App",
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    daily_limit: 450,
                  },
                  {
                    name: "Zoho Mail",
                    label: "Zoho Workplace Mail",
                    host: "smtp.zoho.com",
                    port: 465,
                    secure: true,
                    daily_limit: 350,
                  },
                  {
                    name: "aaPanel Mail",
                    label: "aaPanel Postfix Mail Server",
                    host: "mail.asra3.com",
                    port: 465,
                    secure: true,
                    daily_limit: 500,
                  },
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applySmtpPreset(p)}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121215] px-2.5 py-1.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] transition cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveSmtpAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === "ar" ? "اسم تعريفي للحساب" : "Account Label"}
                </label>
                <input
                  type="text"
                  value={smtpForm.label}
                  onChange={(e) =>
                    setSmtpForm((f) => ({ ...f, label: e.target.value }))
                  }
                  placeholder="Primary Dispatch #1 (talent@asra3.com)"
                  className="exec-input w-full rounded-xl px-3 py-2 text-base sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={smtpForm.host}
                    onChange={(e) =>
                      setSmtpForm((f) => ({ ...f, host: e.target.value }))
                    }
                    placeholder="smtp.hostinger.com"
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Port *
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    required
                    value={smtpForm.port}
                    onChange={(e) => {
                      const nextPort = Number(e.target.value);
                      setSmtpForm((f) => ({
                        ...f,
                        port: nextPort,
                        secure: nextPort === 465 ? true : f.secure,
                      }));
                    }}
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs font-bold"
                  />
                </div>
              </div>

              <div className="exec-well flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2.5">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {lang === "ar"
                    ? "وضع التشفير (SSL 465 / STARTTLS 587)"
                    : "Encryption Mode"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSmtpForm((f) => ({ ...f, secure: true, port: 465 }))
                    }
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border cursor-pointer transition ${
                      smtpForm.secure
                        ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                        : "bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    SSL (465)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSmtpForm((f) => ({
                        ...f,
                        secure: false,
                        port: f.port === 465 ? 587 : f.port,
                      }))
                    }
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border cursor-pointer transition ${
                      !smtpForm.secure
                        ? "bg-[#09090B] text-[#D4AF37] border-[#D4AF37]"
                        : "bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    STARTTLS (587)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === "ar"
                      ? "اسم المستخدم / الإيميل *"
                      : "SMTP Username *"}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={smtpForm.user}
                    onChange={(e) =>
                      setSmtpForm((f) => ({ ...f, user: e.target.value }))
                    }
                    placeholder="talent@asra3.com"
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    {smtpForm.id
                      ? lang === "ar"
                        ? "كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)"
                        : "Password (blank = keep current)"
                      : lang === "ar"
                      ? "كلمة المرور / App Key *"
                      : "SMTP Password / App Key *"}
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    required={!smtpForm.id}
                    value={smtpForm.pass}
                    onChange={(e) =>
                      setSmtpForm((f) => ({ ...f, pass: e.target.value }))
                    }
                    placeholder="••••••••••••"
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === "ar"
                      ? "بريد المرسل (From Email)"
                      : "From Email (Sender)"}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={smtpForm.from_email}
                    onChange={(e) =>
                      setSmtpForm((f) => ({
                        ...f,
                        from_email: e.target.value,
                      }))
                    }
                    placeholder="talent@asra3.com"
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === "ar"
                      ? "الحد اليومي الآمن للرسائل"
                      : "Safe Daily Limit"}
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    min={10}
                    max={50000}
                    value={smtpForm.daily_limit}
                    onChange={(e) =>
                      setSmtpForm((f) => ({
                        ...f,
                        daily_limit: Number(e.target.value),
                      }))
                    }
                    className="exec-input w-full rounded-xl px-3 py-2 font-mono text-base sm:text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === "ar"
                    ? "اسم المرسل الظاهر لدى مسؤول التوظيف (From Name)"
                    : "Sender Display Name (From Name)"}
                </label>
                <input
                  type="text"
                  value={smtpForm.from_name}
                  onChange={(e) =>
                    setSmtpForm((f) => ({
                      ...f,
                      from_name: e.target.value,
                    }))
                  }
                  placeholder="Asra3 Executive Talent Desk"
                  className="exec-input w-full rounded-xl px-3 py-2 text-base sm:text-xs"
                />
              </div>

              {smtpFeedback && (
                <div
                  className={`rounded-xl border p-3 text-xs font-bold ${
                    smtpFeedback.ok
                      ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
                  }`}
                >
                  {smtpFeedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingSmtp}
                className="btn-gold flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold cursor-pointer disabled:opacity-50 touch-manipulation"
              >
                {savingSmtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                <span>
                  {smtpForm.id
                    ? lang === "ar"
                      ? "تحديث بيانات خادم SMTP"
                      : "Update SMTP Account"
                    : lang === "ar"
                    ? "حفظ وإضافة لأسطول الإرسال"
                    : "Save & Activate SMTP Mailer"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Test Dispatch + Active SMTP Accounts Pool */}
        <div className="xl:col-span-7 space-y-6">
          <div className="exec-card rounded-2xl overflow-hidden">
            <div className="exec-card-header px-5 py-4 sm:px-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                  {lang === "ar"
                    ? "فحص الاتصال وإرسال رسالة تجريبية فورية"
                    : "Verify SMTP Connection & Send Live Test Email"}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {lang === "ar"
                    ? "تأكد من وصول الرسائل لصندوق الوارد (Inbox) قبل إطلاق الحملات."
                    : "Tests authentication (SMTP AUTH) and delivers a real verification email to your inbox."}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <form
                onSubmit={handleSendTestEmail}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5"
              >
                <select
                  value={testAccountId}
                  onChange={(e) => setTestAccountId(e.target.value)}
                  className="exec-input sm:col-span-4 rounded-xl px-3 py-2.5 text-base sm:text-xs font-bold"
                >
                  <option value="">
                    {lang === "ar"
                      ? "تلقائي (أول حساب نشط)"
                      : "Auto (First Active Mailer)"}
                  </option>
                  {smtpAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label}
                    </option>
                  ))}
                </select>

                <input
                  type="email"
                  dir="ltr"
                  required
                  value={testToEmail}
                  onChange={(e) => setTestToEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="exec-input sm:col-span-5 rounded-xl px-3.5 py-2.5 font-mono text-base sm:text-xs"
                />

                <button
                  type="submit"
                  disabled={testingSmtp || smtpAccounts.length === 0}
                  className="btn-gold sm:col-span-3 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-50 touch-manipulation"
                >
                  {testingSmtp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {lang === "ar" ? "إرسال تجريبي" : "Send Test"}
                  </span>
                </button>
              </form>

              {testResult && (
                <div
                  dir="ltr"
                  className={`rounded-xl border p-3.5 font-mono text-xs ${
                    testResult.ok
                      ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
                  }`}
                >
                  {testResult.text}
                </div>
              )}
            </div>
          </div>

          <div className="exec-card rounded-2xl overflow-hidden">
            <div className="exec-card-header px-5 py-4 sm:px-6 flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? `خوادم SMTP المربوطة (${smtpAccounts.length})`
                  : `Configured SMTP Rotation Pool (${smtpAccounts.length})`}
              </h3>
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                .data/smtp-accounts.json
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {smtpAccounts.length === 0 ? (
                <div className="exec-well rounded-xl border-dashed p-8 text-center space-y-2">
                  <Mail className="mx-auto h-7 w-7 text-[#9A7B1C] dark:text-[#D4AF37]" />
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {lang === "ar"
                      ? "لم تتم إضافة أي خادم SMTP بعد"
                      : "No SMTP Mailers Added Yet"}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    {lang === "ar"
                      ? "اختر قالباً جاهزاً من النموذج الجانبي (Hostinger أو Brevo أو SES أو Gmail App Password) أو أضف متغيرات SMTP_HOST في ملف .env على الخادم."
                      : "Select a 1-click provider preset on the left (Hostinger, Brevo, SES, Google Workspace, or aaPanel Mail) or define SMTP_HOST in your VPS .env file."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smtpAccounts.map((acc) => {
                    const pct = Math.min(
                      100,
                      Math.round(
                        ((acc.sent_today || 0) /
                          Math.max(1, acc.daily_limit)) *
                          100
                      )
                    );
                    return (
                      <div
                        key={acc.id}
                        className="exec-well rounded-xl p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                                {acc.label}
                              </span>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                  acc.is_active
                                    ? "bg-[#09090B] border-[#D4AF37] text-[#D4AF37]"
                                    : "bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                {acc.is_active
                                  ? lang === "ar"
                                    ? "نشط"
                                    : "Active"
                                  : lang === "ar"
                                  ? "متوقف"
                                  : "Paused"}
                              </span>
                            </div>
                            <p
                              dir="ltr"
                              className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400 break-all"
                            >
                              {acc.host}:{acc.port} (
                              {acc.secure ? "SSL" : "STARTTLS"}) • From:{" "}
                              {acc.from_name} &lt;{acc.from_email}&gt;
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              title="Edit SMTP account"
                              onClick={() => handleEditSmtpAccount(acc)}
                              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-2 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] hover:text-[#9A7B1C] dark:hover:text-[#D4AF37] cursor-pointer transition"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title={
                                acc.is_active ? "Pause mailer" : "Enable mailer"
                              }
                              onClick={() => handleToggleSmtpAccount(acc)}
                              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-2 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer transition"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete mailer"
                              onClick={() => handleDeleteSmtpAccount(acc)}
                              className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#121215] p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                            <span>
                              {lang === "ar"
                                ? "الإرسال اليومي (تصفير تلقائي UTC)"
                                : "Sent Today (Auto-resets 00:00 UTC)"}
                            </span>
                            <span className="font-mono text-zinc-900 dark:text-zinc-200 tabular-nums">
                              {acc.sent_today} / {acc.daily_limit} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-full bg-[#D4AF37] transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
