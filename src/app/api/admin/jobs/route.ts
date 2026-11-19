import { NextRequest, NextResponse } from "next/server";
import {
  isAdminAuthorized,
  unauthorizedAdminResponse,
} from "@/lib/admin-auth";
import {
  getAllJobsRaw,
  performAdminJobAction,
} from "@/lib/jobs-store";
import { harvestLiveGccJobs } from "@/lib/job-harvester";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "all";

  const all = await getAllJobsRaw();
  const counts = {
    total: all.length,
    published: all.filter((j) => j.status === "published").length,
    pending_review: all.filter((j) => j.status === "pending_review").length,
    expired: all.filter((j) => j.status === "expired").length,
    fb_posted: all.filter((j) => Boolean(j.fb_posted_at)).length,
    employer_direct: all.filter((j) => j.source_type === "employer_direct")
      .length,
  };

  const filtered =
    statusFilter === "all"
      ? all
      : all.filter((j) => j.status === statusFilter);

  return NextResponse.json({
    jobs: filtered.slice(0, 200),
    counts,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await req.json();

    if (body.action === "harvest_now") {
      const harvestResult = await harvestLiveGccJobs({
        pagesPerChannel: Number(body.pagesPerChannel) || 2,
        maxJobsToInsert: Number(body.maxJobsToInsert) || 20,
      });
      return NextResponse.json({ ok: true, ...harvestResult });
    }

    const id = String(body.id || "").trim();
    const action = body.action as
      | "approve"
      | "reject"
      | "toggle_featured"
      | "expire"
      | "reset_social"
      | "delete";

    if (
      !id ||
      ![
        "approve",
        "reject",
        "toggle_featured",
        "expire",
        "reset_social",
        "delete",
      ].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid job ID or admin action." },
        { status: 400 }
      );
    }

    const result = await performAdminJobAction(id, action);
    if (!result.ok) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to execute admin job action" },
      { status: 500 }
    );
  }
}
