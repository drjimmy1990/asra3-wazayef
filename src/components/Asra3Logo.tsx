import React from "react";

interface Asra3LogoProps {
  variant?: "auto" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
  lang?: "ar" | "en";
  className?: string;
}

/**
 * Asra3.com ("أسرع") Architectural Brand Mark & Bilingual Lockup
 * Pure Matte Black (#09090B) + Solid Flat Gold (#D4AF37) — Zero Gradients
 */
export function Asra3Logo({
  variant = "auto",
  size = "md",
  showTagline = false,
  tagline,
  lang = "ar",
  className = "",
}: Asra3LogoProps) {
  const iconDim = size === "sm" ? 34 : size === "lg" ? 44 : 38;

  const primaryTextClass =
    variant === "dark"
      ? "text-[#FAFAFA]"
      : variant === "light"
      ? "text-[#09090B]"
      : "text-zinc-950 dark:text-zinc-50";

  const mutedTextClass =
    variant === "dark"
      ? "text-zinc-400"
      : variant === "light"
      ? "text-zinc-500"
      : "text-zinc-500 dark:text-zinc-400";

  const pillClass =
    variant === "dark"
      ? "bg-zinc-900 text-[#D4AF37] border border-zinc-800"
      : variant === "light"
      ? "bg-[#09090B] text-[#D4AF37] border border-[#09090B]"
      : "bg-[#09090B] text-[#D4AF37] border border-zinc-800";

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Pure Matte Black + Solid Flat Gold Emblem (Zero Gradients) */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="14"
          fill="#09090B"
          stroke="#27272A"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="54"
          height="54"
          rx="10"
          stroke="#D4AF37"
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* Solid Flat Gold Velocity Dart with Twin-Wing "3" Cutout */}
        <path
          d="M14 21H36L53 32L36 43H14L25.5 32L14 21Z"
          fill="#D4AF37"
        />
        <path
          d="M12 27.2H26.5L33 32L26.5 36.8H12L17.5 32L12 27.2Z"
          fill="#09090B"
        />

        {/* Crisp White Precision Point */}
        <circle cx="51" cy="16.5" r="2.8" fill="#FAFAFA" />
        <path
          d="M42.5 16.5H46.5"
          stroke="#D4AF37"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark Lockup */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-2">
          {lang === "ar" ? (
            <>
              <span
                className={`font-bold tracking-tight ${
                  size === "sm"
                    ? "text-lg"
                    : size === "lg"
                    ? "text-2xl"
                    : "text-xl"
                } ${primaryTextClass}`}
              >
                أسرع
              </span>
              <span
                dir="ltr"
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-[0.14em] uppercase ${pillClass}`}
              >
                ASRA<span className="text-white">3</span>
              </span>
            </>
          ) : (
            <>
              <span
                dir="ltr"
                className={`font-extrabold tracking-[0.04em] ${
                  size === "sm"
                    ? "text-lg"
                    : size === "lg"
                    ? "text-2xl"
                    : "text-xl"
                } ${primaryTextClass}`}
              >
                ASRA<span className="text-[#D4AF37]">3</span>
                <span
                  className={`text-xs font-medium tracking-normal ${mutedTextClass}`}
                >
                  .com
                </span>
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${pillClass}`}
              >
                أسرع
              </span>
            </>
          )}
        </div>

        {showTagline && (
          <span
            className={`mt-1 text-[10px] font-medium tracking-wide ${mutedTextClass}`}
          >
            {tagline ||
              (lang === "ar"
                ? "توظَّف أسرع في الخليج"
                : "Direct GCC HR Placement")}
          </span>
        )}
      </div>
    </div>
  );
}
