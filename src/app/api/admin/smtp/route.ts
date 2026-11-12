import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  deleteSmtpAccount,
  listSmtpAccounts,
  testSmtpConnectionAndSend,
  toggleSmtpAccount,
  upsertSmtpAccount,
} from "@/lib/smtp-mailer";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = listSmtpAccounts(true);
  const activeAccounts = accounts.filter((a) => a.is_active);
  const totalDailyCapacity = activeAccounts.reduce(
    (sum, a) => sum + (a.daily_limit || 0),
    0
  );
  const sentTodayTotal = accounts.reduce(
    (sum, a) => sum + (a.sent_today || 0),
    0
  );

  return NextResponse.json({
    accounts,
    summary: {
      totalAccounts: accounts.length,
      activeCount: activeAccounts.length,
      totalDailyCapacity,
      sentTodayTotal,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.action === "test") {
    const toEmail = String(body.toEmail || "").trim();
    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid recipient email for the SMTP test." },
        { status: 400 }
      );
    }
    const result = await testSmtpConnectionAndSend({
      accountId: body.accountId ? String(body.accountId) : undefined,
      toEmail,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const host = String(body.host || "").trim();
  const user = String(body.user || "").trim();
  const pass = String(body.pass || "").trim();

  if (!host || !user || (!pass && !body.id)) {
    return NextResponse.json(
      { error: "SMTP Host, Username, and Password are required." },
      { status: 400 }
    );
  }

  const accounts = upsertSmtpAccount({
    id: body.id ? String(body.id) : undefined,
    label: String(body.label || ""),
    host,
    port: Number(body.port || 587),
    secure: Boolean(body.secure),
    user,
    pass,
    from_email: String(body.from_email || user),
    from_name: String(body.from_name || "Asra3 Executive Talent Desk"),
    daily_limit: Number(body.daily_limit || 300),
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
  });

  return NextResponse.json({ ok: true, accounts });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) {
    return NextResponse.json({ error: "Missing SMTP account ID" }, { status: 400 });
  }

  const accounts = toggleSmtpAccount(id, Boolean(body.is_active));
  return NextResponse.json({ ok: true, accounts });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Missing SMTP account ID" }, { status: 400 });
  }

  const accounts = deleteSmtpAccount(id);
  return NextResponse.json({ ok: true, accounts });
}
