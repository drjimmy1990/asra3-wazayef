// ==============================================================================
// ASRA3.COM — Built-In Multi-SMTP Pool, Round-Robin Dispatcher & CV Attachment Mailer
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { CampaignRecord, Language, SmtpAccountConfig } from "@/lib/types";
import { resolveLocalCvPath } from "@/lib/cv-parser";

const DATA_DIR = path.join(process.cwd(), ".data");
const SMTP_STORE_FILE = path.join(DATA_DIR, "smtp-accounts.json");

// Prevents duplicate concurrent drip workers for the same campaign ID
const activeDripCampaigns = new Set<string>();
let roundRobinIndex = 0;

function todayUtcString(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bootstrapEnvSmtpAccount(): SmtpAccountConfig | null {
  const host = (process.env.SMTP_HOST || "").trim();
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();

  if (
    !host ||
    !user ||
    !pass ||
    host.includes("your-") ||
    user.includes("your-") ||
    pass.includes("your-")
  ) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1"
      : port === 465;

  return {
    id: "env-default-smtp",
    label: process.env.SMTP_LABEL || `Default .env SMTP (${user})`,
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure,
    user,
    pass,
    from_email: (process.env.SMTP_FROM_EMAIL || user).trim(),
    from_name: (
      process.env.SMTP_FROM_NAME || "Asra3 Executive Talent Desk"
    ).trim(),
    daily_limit: Math.max(10, Number(process.env.SMTP_DAILY_LIMIT || 400)),
    sent_today: 0,
    last_reset_date: todayUtcString(),
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

function readSmtpAccountsRaw(): SmtpAccountConfig[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SMTP_STORE_FILE)) {
      const envAccount = bootstrapEnvSmtpAccount();
      const initial = envAccount ? [envAccount] : [];
      if (initial.length > 0) {
        fs.writeFileSync(
          SMTP_STORE_FILE,
          JSON.stringify(initial, null, 2),
          "utf8"
        );
      }
      return initial;
    }

    const parsed = JSON.parse(
      fs.readFileSync(SMTP_STORE_FILE, "utf8")
    ) as SmtpAccountConfig[];
    const list = Array.isArray(parsed) ? parsed : [];
    const today = todayUtcString();
    let dirty = false;

    for (const acc of list) {
      if (acc.last_reset_date !== today) {
        acc.sent_today = 0;
        acc.last_reset_date = today;
        dirty = true;
      }
    }

    // If file is empty and .env now provides SMTP credentials, bootstrap it
    if (list.length === 0) {
      const envAccount = bootstrapEnvSmtpAccount();
      if (envAccount) {
        list.push(envAccount);
        dirty = true;
      }
    }

    if (dirty) {
      writeSmtpAccountsRaw(list);
    }

    return list;
  } catch {
    const envAccount = bootstrapEnvSmtpAccount();
    return envAccount ? [envAccount] : [];
  }
}

function writeSmtpAccountsRaw(accounts: SmtpAccountConfig[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      SMTP_STORE_FILE,
      JSON.stringify(accounts, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed writing smtp-accounts.json:", err);
  }
}

export function listSmtpAccounts(maskPasswords = true): SmtpAccountConfig[] {
  const list = readSmtpAccountsRaw();
  if (!maskPasswords) return list;
  return list.map((acc) => ({
    ...acc,
    pass: acc.pass ? "••••••••••••" : "",
  }));
}

export function hasActiveSmtpAccounts(): boolean {
  const list = readSmtpAccountsRaw();
  return list.some(
    (acc) => acc.is_active && acc.sent_today < Math.max(1, acc.daily_limit)
  );
}

export function upsertSmtpAccount(input: {
  id?: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_email: string;
  from_name: string;
  daily_limit?: number;
  is_active?: boolean;
}): SmtpAccountConfig[] {
  const list = readSmtpAccountsRaw();
  const existingIdx = input.id
    ? list.findIndex((a) => a.id === input.id)
    : -1;

  if (existingIdx !== -1) {
    const prev = list[existingIdx];
    const nextPass =
      input.pass && !input.pass.startsWith("••••") ? input.pass : prev.pass;
    list[existingIdx] = {
      ...prev,
      label: input.label.trim() || prev.label,
      host: input.host.trim(),
      port: Number(input.port) || 587,
      secure: Boolean(input.secure),
      user: input.user.trim(),
      pass: nextPass,
      from_email: input.from_email.trim() || input.user.trim(),
      from_name: input.from_name.trim() || "Asra3 Executive Talent Desk",
      daily_limit: Math.max(1, Number(input.daily_limit || prev.daily_limit || 300)),
      is_active: input.is_active !== undefined ? input.is_active : prev.is_active,
    };
  } else {
    const newAccount: SmtpAccountConfig = {
      id: `smtp-${crypto.randomUUID().slice(0, 8)}`,
      label: input.label.trim() || `${input.host.trim()} (${input.user.trim()})`,
      host: input.host.trim(),
      port: Number(input.port) || 587,
      secure: Boolean(input.secure),
      user: input.user.trim(),
      pass: input.pass,
      from_email: input.from_email.trim() || input.user.trim(),
      from_name: input.from_name.trim() || "Asra3 Executive Talent Desk",
      daily_limit: Math.max(1, Number(input.daily_limit || 300)),
      sent_today: 0,
      last_reset_date: todayUtcString(),
      is_active: input.is_active !== false,
      created_at: new Date().toISOString(),
    };
    list.push(newAccount);
  }

  writeSmtpAccountsRaw(list);
  return listSmtpAccounts(true);
}

export function toggleSmtpAccount(
  id: string,
  isActive: boolean
): SmtpAccountConfig[] {
  const list = readSmtpAccountsRaw();
  const target = list.find((a) => a.id === id);
  if (target) {
    target.is_active = isActive;
    writeSmtpAccountsRaw(list);
  }
  return listSmtpAccounts(true);
}

export function deleteSmtpAccount(id: string): SmtpAccountConfig[] {
  const list = readSmtpAccountsRaw().filter((a) => a.id !== id);
  writeSmtpAccountsRaw(list);
  return listSmtpAccounts(true);
}

function pickNextSmtpAccount(): SmtpAccountConfig | null {
  const list = readSmtpAccountsRaw();
  const eligible = list.filter(
    (a) => a.is_active && a.sent_today < Math.max(1, a.daily_limit)
  );
  if (eligible.length === 0) return null;

  const chosen = eligible[roundRobinIndex % eligible.length];
  roundRobinIndex = (roundRobinIndex + 1) % eligible.length;
  return chosen;
}

function incrementSmtpSentCounter(accountId: string): void {
  const list = readSmtpAccountsRaw();
  const found = list.find((a) => a.id === accountId);
  if (found) {
    found.sent_today = (found.sent_today || 0) + 1;
    found.last_reset_date = todayUtcString();
    writeSmtpAccountsRaw(list);
  }
}

function createTransport(acc: SmtpAccountConfig) {
  return nodemailer.createTransport({
    host: acc.host,
    port: acc.port,
    secure: acc.secure,
    auth: {
      user: acc.user,
      pass: acc.pass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
  });
}

export async function testSmtpConnectionAndSend(params: {
  accountId?: string;
  toEmail: string;
}): Promise<{ ok: boolean; message: string; usedAccount?: string }> {
  const list = readSmtpAccountsRaw();
  const acc = params.accountId
    ? list.find((a) => a.id === params.accountId)
    : list.find((a) => a.is_active) || list[0];

  if (!acc) {
    return {
      ok: false,
      message: "No SMTP account configured yet. Please add an SMTP server first.",
    };
  }

  try {
    const transporter = createTransport(acc);
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${acc.from_name}" <${acc.from_email}>`,
      to: params.toEmail.trim(),
      subject: "✓ Asra3.com SMTP Verification — Ready for Direct HR Dispatch",
      html: `
        <div style="font-family: Segoe UI, Tahoma, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 32px; border-radius: 16px; border: 1px solid #27272A;">
          <div style="display: inline-block; background: #121215; border: 1px solid #27272A; color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 6px;">
            ASRA3.COM • SMTP VERIFIED
          </div>
          <h2 style="margin: 18px 0 8px; color: #FAFAFA; font-size: 22px;">SMTP Connection Successful ✓</h2>
          <p style="color: #A1A1AA; font-size: 14px; line-height: 1.7;">
            Your mailer <strong style="color: #D4AF37;">${escapeHtml(acc.label)}</strong> (<code>${escapeHtml(acc.host)}:${acc.port}</code>) authenticated cleanly and delivered this test message.
          </p>
          <p style="color: #71717A; font-size: 12px; margin-top: 20px; border-top: 1px solid #27272A; padding-top: 14px;">
            Sender: ${escapeHtml(acc.from_name)} &lt;${escapeHtml(acc.from_email)}&gt; • Daily Quota: ${acc.sent_today}/${acc.daily_limit}
          </p>
        </div>
      `,
    });

    incrementSmtpSentCounter(acc.id);
    return {
      ok: true,
      usedAccount: acc.label,
      message: `Test email sent via "${acc.label}" (Message ID: ${info.messageId})`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      usedAccount: acc.label,
      message: `SMTP Error (${acc.host}:${acc.port}): ${errMsg}`,
    };
  }
}

export async function sendCandidateConfirmationEmail(
  campaign: CampaignRecord,
  appBaseUrl?: string
): Promise<boolean> {
  const acc = pickNextSmtpAccount();
  if (!acc) return false;

  const baseUrl = (
    appBaseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://asra3.com"
  ).replace(/\/$/, "");
  const trackingUrl = `${baseUrl}/track/${campaign.tracking_token}`;
  const isAr = campaign.preferred_lang === "ar";

  const subject = isAr
    ? `تأكيد السداد وبدء توزيع سيرتك الذاتية — رمز التتبع (${campaign.customer_reference})`
    : `Payment Verified & CV Dispatch Active — Code (${campaign.customer_reference})`;

  const html = isAr
    ? `
      <div dir="rtl" style="font-family: Tahoma, Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 32px; border-radius: 16px; border: 1px solid #27272A;">
        <span style="display: inline-block; background: #D4AF37; color: #09090B; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 6px;">
          أسرع | Asra3.com — تم تفعيل الحملة ✓
        </span>
        <h2 style="margin: 18px 0 10px; color: #FAFAFA;">مرحباً ${escapeHtml(campaign.candidate_name)}،</h2>
        <p style="color: #D4D4D8; font-size: 14px; line-height: 1.8;">
          تم تأكيد عملية الدفع بنجاح، وبدأ محرك <strong>أسرع (Asra3.com)</strong> الآن بإيداع سيرتك الذاتية وخطاب التقديم التنفيذي مباشرة لدى <strong>${campaign.total_target_companies} جهة توظيف موثقة</strong> في (${campaign.primary_country_code}).
        </p>
        <div style="background: #121215; border: 1px solid #27272A; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #A1A1AA;">رمز التتبع الخاص بك (احتفظ به):</p>
          <p style="margin: 0; font-family: monospace; font-size: 20px; font-weight: 800; color: #D4AF37;">${escapeHtml(campaign.customer_reference)}</p>
        </div>
        <a href="${trackingUrl}" style="display: inline-block; background: #D4AF37; color: #09090B; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
          فتح لوحة التتبع المباشرة ←
        </a>
        <p style="color: #71717A; font-size: 12px; margin-top: 24px;">
          جميع ردود مسؤولي الموارد البشرية (Reply-To) موجهة مباشرة إلى بريدك الشخصي: ${escapeHtml(campaign.candidate_email)}
        </p>
      </div>
    `
    : `
      <div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 32px; border-radius: 16px; border: 1px solid #27272A;">
        <span style="display: inline-block; background: #D4AF37; color: #09090B; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 6px;">
          ASRA3.COM — DISPATCH ACTIVE ✓
        </span>
        <h2 style="margin: 18px 0 10px; color: #FAFAFA;">Hello ${escapeHtml(campaign.candidate_name)},</h2>
        <p style="color: #D4D4D8; font-size: 14px; line-height: 1.8;">
          Your payment has been verified and <strong>Asra3.com</strong> is now placing your CV and executive cover letter into <strong>${campaign.total_target_companies} verified HR inboxes</strong> across (${campaign.primary_country_code}).
        </p>
        <div style="background: #121215; border: 1px solid #27272A; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #A1A1AA;">Your Private Tracking Code:</p>
          <p style="margin: 0; font-family: monospace; font-size: 20px; font-weight: 800; color: #D4AF37;">${escapeHtml(campaign.customer_reference)}</p>
        </div>
        <a href="${trackingUrl}" style="display: inline-block; background: #D4AF37; color: #09090B; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
          Open Live Tracking Ledger →
        </a>
        <p style="color: #71717A; font-size: 12px; margin-top: 24px;">
          All HR replies (Reply-To) are routed directly to your inbox: ${escapeHtml(campaign.candidate_email)}
        </p>
      </div>
    `;

  try {
    const transporter = createTransport(acc);
    await transporter.sendMail({
      from: `"${acc.from_name}" <${acc.from_email}>`,
      to: campaign.candidate_email,
      subject,
      html,
    });
    incrementSmtpSentCounter(acc.id);
    return true;
  } catch (err) {
    console.warn("Candidate confirmation SMTP warning:", err);
    return false;
  }
}

export async function sendTrackingRecoveryEmail(params: {
  candidateName: string;
  candidateEmail: string;
  customerReference: string;
  trackingUrl: string;
  lang: Language;
  allCodes: Array<{ reference: string; country: string }>;
}): Promise<boolean> {
  const acc = pickNextSmtpAccount();
  if (!acc) return false;

  const isAr = params.lang === "ar";
  const subject = isAr
    ? `رمز تتبع حملتك في أسرع (Asra3.com): ${params.customerReference}`
    : `Your Asra3.com Tracking Code: ${params.customerReference}`;

  const codesHtml = params.allCodes
    .map(
      (c) =>
        `<li style="margin-bottom: 6px; font-family: monospace; color: #D4AF37;"><strong>${escapeHtml(c.reference)}</strong> (${escapeHtml(c.country)})</li>`
    )
    .join("");

  const html = isAr
    ? `
      <div dir="rtl" style="font-family: Tahoma, Segoe UI, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 30px; border-radius: 16px; border: 1px solid #27272A;">
        <h2 style="color: #FAFAFA; margin-top: 0;">مرحباً ${escapeHtml(params.candidateName)}،</h2>
        <p style="color: #D4D4D8; font-size: 14px; line-height: 1.7;">بناءً على طلبك، إليك رمز تتبع حملتك المسجلة على منصة أسرع (Asra3.com):</p>
        <ul style="background: #121215; border: 1px solid #27272A; border-radius: 12px; padding: 16px 32px;">${codesHtml}</ul>
        <a href="${params.trackingUrl}" style="display: inline-block; margin-top: 12px; background: #D4AF37; color: #09090B; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 22px; border-radius: 10px;">
          فتح سجل التتبع الآن ←
        </a>
      </div>
    `
    : `
      <div style="font-family: Segoe UI, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #09090B; color: #FAFAFA; padding: 30px; border-radius: 16px; border: 1px solid #27272A;">
        <h2 style="color: #FAFAFA; margin-top: 0;">Hello ${escapeHtml(params.candidateName)},</h2>
        <p style="color: #D4D4D8; font-size: 14px; line-height: 1.7;">Here is your active Tracking Code on Asra3.com:</p>
        <ul style="background: #121215; border: 1px solid #27272A; border-radius: 12px; padding: 16px 32px;">${codesHtml}</ul>
        <a href="${params.trackingUrl}" style="display: inline-block; margin-top: 12px; background: #D4AF37; color: #09090B; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 22px; border-radius: 10px;">
          Open Tracking Portal →
        </a>
      </div>
    `;

  try {
    const transporter = createTransport(acc);
    await transporter.sendMail({
      from: `"${acc.from_name}" <${acc.from_email}>`,
      to: params.candidateEmail,
      subject,
      html,
    });
    incrementSmtpSentCounter(acc.id);
    return true;
  } catch (err) {
    console.warn("Recovery SMTP send warning:", err);
    return false;
  }
}

async function resolveCandidateCvAttachment(campaign: CampaignRecord): Promise<{
  filename: string;
  content: Buffer;
} | null> {
  const safeName =
    campaign.cv_file_name?.trim() ||
    `${campaign.candidate_name.replace(/\s+/g, "_")}_CV.pdf`;

  if (campaign.original_cv_url) {
    try {
      // 1. Check if it is our signed local /api/cv/file?key=... URL
      const parsedUrl = new URL(
        campaign.original_cv_url,
        "http://localhost:3000"
      );
      const localKey = parsedUrl.searchParams.get("key");
      if (localKey) {
        const localFile = resolveLocalCvPath(localKey);
        if (localFile && fs.existsSync(localFile)) {
          return {
            filename: safeName,
            content: fs.readFileSync(localFile),
          };
        }
      }

      // 2. Otherwise if it is an external HTTPS Supabase Storage signed URL
      if (/^https?:\/\//i.test(campaign.original_cv_url)) {
        const res = await fetch(campaign.original_cv_url, {
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          return {
            filename: safeName,
            content: Buffer.from(await res.arrayBuffer()),
          };
        }
      }
    } catch {
      // Fall through to ATS text profile attachment
    }
  }

  if (campaign.optimized_cv_text) {
    return {
      filename: `${campaign.candidate_name.replace(/\s+/g, "_")}_ATS_CV.txt`,
      content: Buffer.from(campaign.optimized_cv_text, "utf8"),
    };
  }

  return null;
}

export function startBackgroundCampaignSmtpDrip(params: {
  campaign: CampaignRecord;
  companyEmailMap: Map<string, string>;
  onRecipientDispatched: (
    recipientId: string,
    companyId: string,
    status: "sent" | "failed",
    isHardBounce: boolean
  ) => Promise<void>;
}): void {
  const { campaign, companyEmailMap, onRecipientDispatched } = params;

  if (
    !campaign ||
    campaign.tracking_token.startsWith("demo-") ||
    campaign.payment_status !== "paid" ||
    campaign.campaign_status === "completed"
  ) {
    return;
  }

  if (!hasActiveSmtpAccounts()) {
    return;
  }

  if (activeDripCampaigns.has(campaign.id)) {
    return;
  }

  const queued = (campaign.recipients || []).filter(
    (r) => r.status === "queued"
  );
  if (queued.length === 0) {
    return;
  }

  activeDripCampaigns.add(campaign.id);

  const dripDelayMs = Math.max(
    800,
    Number(process.env.SMTP_DRIP_DELAY_MS || 2500)
  );
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://asra3.com"
  ).replace(/\/$/, "");

  void (async () => {
    try {
      const cvAttachment = await resolveCandidateCvAttachment(campaign);

      for (const rec of queued) {
        const hrEmail = (companyEmailMap.get(rec.company_id) || "").trim();
        if (!hrEmail || !hrEmail.includes("@")) {
          await onRecipientDispatched(rec.id, rec.company_id, "failed", false);
          continue;
        }

        const acc = pickNextSmtpAccount();
        if (!acc) {
          // Daily quota exhausted across all active SMTP accounts; pause cleanly until tomorrow/next trigger
          console.warn(
            `[Asra3 SMTP] Daily sending quota reached across active SMTP accounts; pausing campaign ${campaign.customer_reference}.`
          );
          break;
        }

        const openPixelUrl = `${baseUrl}/api/track/open?cid=${encodeURIComponent(
          campaign.id
        )}&rid=${encodeURIComponent(rec.id)}`;

        const coverBody =
          campaign.generated_cover_letter ||
          `Dear Hiring & Talent Acquisition Team at ${rec.company_name},\n\nPlease find attached my CV for ${campaign.job_title} opportunities (${campaign.years_experience}+ years of experience).\n\nBest regards,\n${campaign.candidate_name}\n${campaign.candidate_email} | ${campaign.candidate_phone}`;

        const paragraphsHtml = escapeHtml(coverBody)
          .split(/\r?\n\r?\n/)
          .map(
            (p) =>
              `<p style="margin: 0 0 14px; line-height: 1.7; color: #18181B; font-size: 14px;">${p.replace(
                /\r?\n/g,
                "<br/>"
              )}</p>`
          )
          .join("");

        const html = `
          <div style="font-family: Segoe UI, Arial, sans-serif; max-width: 640px; color: #18181B;">
            ${paragraphsHtml}
            <div style="margin-top: 22px; padding-top: 14px; border-top: 1px solid #E4E4E7; font-size: 12px; color: #52525B;">
              <strong>${escapeHtml(campaign.candidate_name)}</strong> — ${escapeHtml(campaign.job_title)}<br/>
              Direct Email: <a href="mailto:${escapeHtml(campaign.candidate_email)}" style="color: #09090B;">${escapeHtml(campaign.candidate_email)}</a> • Phone: ${escapeHtml(campaign.candidate_phone)}
            </div>
            <img src="${openPixelUrl}" width="1" height="1" alt="" style="display:block;border:0;outline:none;" />
          </div>
        `;

        try {
          const transporter = createTransport(acc);
          await transporter.sendMail({
            from: `"${campaign.candidate_name} (${acc.from_name})" <${acc.from_email}>`,
            replyTo: `"${campaign.candidate_name}" <${campaign.candidate_email}>`,
            to: hrEmail,
            subject: `Application: ${campaign.job_title} — ${campaign.candidate_name} (${campaign.years_experience}+ yrs exp)`,
            text: coverBody,
            html,
            attachments: cvAttachment ? [cvAttachment] : undefined,
          });

          incrementSmtpSentCounter(acc.id);
          await onRecipientDispatched(rec.id, rec.company_id, "sent", false);
        } catch (sendErr) {
          const msg =
            sendErr instanceof Error ? sendErr.message : String(sendErr);
          const isHardBounce = /\b(550|551|552|553|554|user unknown|does not exist|invalid recipient)\b/i.test(
            msg
          );
          console.warn(
            `[Asra3 SMTP] Failed sending to ${hrEmail} (${rec.company_name}): ${msg}`
          );
          await onRecipientDispatched(
            rec.id,
            rec.company_id,
            "failed",
            isHardBounce
          );
        }

        await new Promise((resolve) => setTimeout(resolve, dripDelayMs));
      }
    } finally {
      activeDripCampaigns.delete(campaign.id);
    }
  })();
}
