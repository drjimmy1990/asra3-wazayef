"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

const RELOAD_GUARD_KEY = "asra3_chunk_recovery_ts";

function isStaleChunkError(err: Error | null | undefined): boolean {
  const msg = String(err?.message || "") + " " + String(err?.name || "");
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|is not a function|Importing a module script failed/i.test(
    msg
  );
}

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isStaleChunkError(error) || typeof window === "undefined") return;
    try {
      const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || "0");
      if (Date.now() - last > 15_000) {
        sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
        window.location.reload();
      }
    } catch {
      // Ignore storage access errors
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 px-4">
      <div className="max-w-md w-full rounded-2xl border-2 border-[#D4AF37]/70 bg-white dark:bg-[#121215] p-8 text-center space-y-5 shadow-lg">
        <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-[#09090B] px-3 py-1.5 font-mono text-xs font-extrabold text-[#D4AF37]">
          ASRA3.COM
        </div>
        <h1 className="text-xl font-extrabold">
          حدث تحديث جديد للمنصة • Quick Refresh Needed
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          تم تحديث أسرع بإصدار أحدث أثناء تصفحك. اضغط على إعادة التحميل للمتابعة
          فوراً دون فقدان وجهتك.
          <br />
          Asra3 was updated while you were browsing. Tap refresh to continue
          smoothly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة تحميل • Reload Page</span>
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-xs font-bold hover:border-[#D4AF37] transition-colors"
          >
            الرئيسية • Home
          </Link>
        </div>
      </div>
    </div>
  );
}
