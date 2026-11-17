"use client";

import React, { useEffect, useRef, useState } from "react";
import { Language } from "@/lib/types";

export function ScrollProgressRail() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const el = barRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      el.style.transform = `scaleX(${ratio})`;
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[60] h-[2.5px] pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-[#D4AF37] origin-left rtl:origin-right"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}

export function RevealOnScroll({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.92) {
      return;
    }

    setVisible(false);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transition:
          "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delayMs}ms`,
      }}
      className={`${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 850,
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [inView, setInView] = useState<boolean>(false);
  const hasAnimatedInitial = useRef<boolean>(false);
  const currentRenderedRef = useRef<number>(value);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasAnimatedInitial.current = true;
      currentRenderedRef.current = value;
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentRenderedRef.current = value;
      setDisplayValue(value);
      return;
    }

    const startVal = hasAnimatedInitial.current
      ? currentRenderedRef.current
      : 0;
    hasAnimatedInitial.current = true;

    if (startVal === value) {
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / Math.max(150, durationMs));
      const eased = 1 - Math.pow(1 - progress, 5);
      const nextVal = startVal + (value - startVal) * eased;

      currentRenderedRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        currentRenderedRef.current = value;
        setDisplayValue(value);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [inView, value, durationMs]);

  const rounded =
    decimals > 0
      ? Number(displayValue.toFixed(decimals))
      : Math.round(displayValue);

  const formatted = rounded.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={spanRef} dir="ltr" className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function RadialProgressGauge({
  percent,
  size = 68,
  strokeWidth = 5,
  label,
  sublabel,
  darkSurface = false,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  darkSurface?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <div className="inline-flex items-center gap-3 shrink-0">
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={darkSurface ? "#27272A" : "#E4E4E7"}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <span
          dir="ltr"
          className={`absolute font-mono font-extrabold tabular-nums ${
            size <= 64 ? "text-xs" : "text-sm"
          } ${darkSurface ? "text-[#D4AF37]" : "text-zinc-950 dark:text-[#D4AF37]"}`}
        >
          {Math.round(clamped)}%
        </span>
      </div>

      {(label || sublabel) && (
        <div className="min-w-0">
          {label && (
            <p
              className={`text-xs font-extrabold truncate ${
                darkSurface ? "text-zinc-100" : "text-zinc-950 dark:text-zinc-100"
              }`}
            >
              {label}
            </p>
          )}
          {sublabel && (
            <p
              className={`text-[11px] font-medium truncate ${
                darkSurface ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function LiveSignalEqualizer({
  className = "",
}: {
  className?: string;
}) {
  const delays = ["0ms", "160ms", "320ms", "120ms"];

  return (
    <span
      aria-hidden="true"
      className={`h-3.5 flex items-end gap-[2px] ${className}`}
    >
      {delays.map((delay, idx) => (
        <span
          key={idx}
          className="w-[3px] h-full rounded-full bg-[#D4AF37] telemetry-bar"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  );
}

const ENTERPRISE_SIGNALS = [
  { name: "EMAAR PJSC · DUBAI DIFC", code: "AE" },
  { name: "ROSHN GROUP · RIYADH KAFD", code: "SA" },
  { name: "QATAR ENERGY · LUSAIL", code: "QA" },
  { name: "M.H. ALSHAYA · KUWAIT CITY", code: "KW" },
  { name: "ADGM · ABU DHABI", code: "AE" },
  { name: "NEOM · KSA VISION 2030", code: "SA" },
  { name: "QNB · DOHA WEST BAY", code: "QA" },
  { name: "MAJID AL FUTTAIM · UAE", code: "AE" },
  { name: "DP WORLD · JEBEL ALI", code: "AE" },
  { name: "STC GROUP · RIYADH", code: "SA" },
];

export function EnterpriseTickerStrip({ lang }: { lang: Language }) {
  const doubled = [...ENTERPRISE_SIGNALS, ...ENTERPRISE_SIGNALS];

  return (
    <section
      aria-label={
        lang === "ar"
          ? "مراكز التوظيف والشركات الموثقة في الخليج"
          : "Verified GCC Employer Ecosystems"
      }
      className="bg-[#09090B] border-b border-zinc-800"
    >
      <div
        dir="ltr"
        className="marquee-wrap relative overflow-hidden py-3 flex items-center"
      >
        <div className="hidden md:flex shrink-0 items-center gap-2 border-e border-zinc-800 bg-[#09090B] px-5 py-1 z-10">
          <span className="gold-beacon" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37] whitespace-nowrap">
            {lang === "ar" ? "GCC NETWORK · MX LIVE" : "GCC NETWORK · MX LIVE"}
          </span>
        </div>

        <div className="marquee-track items-center">
          {doubled.map((item, idx) => {
            const isClone = idx >= ENTERPRISE_SIGNALS.length;
            return (
              <div
                key={`${item.name}-${idx}`}
                aria-hidden={isClone ? "true" : undefined}
                className="flex items-center gap-3 px-5 whitespace-nowrap"
              >
                <span className="rounded bg-[#18181B] border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-[#D4AF37]">
                  {item.code}
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider text-zinc-200">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-300">
                  MX-VERIFIED
                </span>
                <span className="text-[#D4AF37] text-xs font-bold">◆</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
