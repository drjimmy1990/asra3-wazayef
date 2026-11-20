"use client";

import React, { useEffect } from "react";

const RELOAD_GUARD_KEY = "asra3_global_chunk_recovery_ts";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    const msg = String(error?.message || "") + " " + String(error?.name || "");
    if (
      typeof window !== "undefined" &&
      /ChunkLoadError|Loading chunk|is not a function|dynamically imported/i.test(
        msg
      )
    ) {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || "0");
        if (Date.now() - last > 15_000) {
          sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // Ignore
      }
    }
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          color: "#FAFAFA",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            borderRadius: "16px",
            border: "2px solid #D4AF37",
            backgroundColor: "#121215",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: "#D4AF37",
              letterSpacing: "2px",
              marginBottom: "12px",
            }}
          >
            ASRA3.COM
          </div>
          <h1 style={{ fontSize: "18px", margin: "0 0 10px" }}>
            جارٍ تحديث الصفحة • Refreshing Asra3
          </h1>
          <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6 }}>
            تم إطلاق تحديث جديد للمنصة. اضغط الزر أدناه للمتابعة فوراً.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              backgroundColor: "#D4AF37",
              color: "#09090B",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            إعادة التحميل • Reload
          </button>
        </div>
      </body>
    </html>
  );
}
