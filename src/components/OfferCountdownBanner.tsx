"use client";

import React, { useEffect, useState } from "react";
import { Check, Clock, Copy, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface OfferCountdownBannerProps {
  compact?: boolean;
  onSelectCoupon?: (code: string) => void;
}

function computeRemainingMs(
  endsAt: string | null,
  evergreenHours: number,
  nowMs: number
): number {
  if (endsAt) {
    const parsed = new Date(endsAt).getTime();
    if (!Number.isNaN(parsed)) {
      return Math.max(0, parsed - nowMs);
    }
  }
  const windowMs = Math.max(1, evergreenHours || 48) * 3600 * 1000;
  const elapsedInWindow = nowMs % windowMs;
  const left = windowMs - elapsedInWindow;
  return left < 60_000 ? windowMs : left;
}

function formatCountdown(ms: number): {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    days,
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

export function OfferCountdownBanner({
  compact = false,
  onSelectCoupon,
}: OfferCountdownBannerProps) {
  const { lang, offerSettings } = useApp();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!offerSettings.enabled) return;
    const tick = () => {
      setRemainingMs(
        computeRemainingMs(
          offerSettings.ends_at,
          offerSettings.evergreen_hours,
          Date.now()
        )
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [
    offerSettings.enabled,
    offerSettings.ends_at,
    offerSettings.evergreen_hours,
  ]);

  if (!offerSettings.enabled) return null;
  // Hide cleanly if a fixed deadline has expired
  if (offerSettings.ends_at && remainingMs === 0) return null;

  const badge = lang === "ar" ? offerSettings.badge_ar : offerSettings.badge_en;
  const headline =
    lang === "ar" ? offerSettings.headline_ar : offerSettings.headline_en;
  const parts = remainingMs !== null ? formatCountdown(remainingMs) : null;
  const couponCode = offerSettings.highlight_coupon_code?.trim();

  const handleCopyCoupon = () => {
    if (!couponCode) return;
    if (onSelectCoupon) {
      onSelectCoupon(couponCode);
    }
    try {
      navigator.clipboard?.writeText(couponCode);
    } catch {
      // Ignore clipboard failures
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border-2 border-[#D4AF37]/80 bg-[#09090B] text-zinc-50 shadow-sm ${
        compact ? "px-4 py-3" : "px-5 py-4 sm:px-6"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-extrabold text-[#09090B]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{badge}</span>
          </span>
          <p className="text-xs sm:text-sm font-bold text-zinc-100">
            {headline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {couponCode && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/60 bg-[#18181B] px-3 py-1.5 font-mono text-xs font-extrabold text-[#D4AF37] hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span dir="ltr">
                {copiedCode
                  ? lang === "ar"
                    ? "تم النسخ ✓"
                    : "COPIED ✓"
                  : `CODE: ${couponCode}`}
              </span>
            </button>
          )}

          {parts && (
            <div
              dir="ltr"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#18181B] border border-zinc-800 px-3 py-1.5 font-mono text-xs font-extrabold text-zinc-100 tabular-nums"
            >
              <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
              {parts.days > 0 && (
                <span className="text-[#D4AF37]">{parts.days}d</span>
              )}
              <span>{parts.hours}</span>
              <span className="text-zinc-500">:</span>
              <span>{parts.minutes}</span>
              <span className="text-zinc-500">:</span>
              <span className="text-[#D4AF37]">{parts.seconds}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
