import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  deleteSupportLead,
  listSupportLeads,
  updateSupportLeadStatus,
} from "@/lib/store";
import { SupportLeadStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  const leads = listSupportLeads();
  const newCount = leads.filter((l) => l.status === "new").length;
  return NextResponse.json({ leads, newCount });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    const status = body.status as SupportLeadStatus;
    if (!id || !["new", "contacted", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Valid lead id and status are required" },
        { status: 400 }
      );
    }
    const updated = updateSupportLeadStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    const leads = listSupportLeads();
    return NextResponse.json({
      ok: true,
      lead: updated,
      leads,
      newCount: leads.filter((l) => l.status === "new").length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedAdminResponse();
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Lead id required" }, { status: 400 });
  }
  const ok = deleteSupportLead(id);
  if (!ok) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  const leads = listSupportLeads();
  return NextResponse.json({
    ok: true,
    leads,
    newCount: leads.filter((l) => l.status === "new").length,
  });
}
