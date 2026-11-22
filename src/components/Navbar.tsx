"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Asra3Logo } from "@/components/Asra3Logo";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  Globe,
  Menu,
  Moon,
  SearchCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

export function Navbar() {
  const {
    lang,
    toggleLang,
    theme,
    toggleTheme,
    t,
    countries,
    selectedCountryCode,
    selectedCountry,
    selectCountry,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!countryMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        countryMenuRef.current &&
        !countryMenuRef.current.contains(e.target as Node)
      ) {
        setCountryMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCountryMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [countryMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Identity (compact emblem on mobile, full lockup on sm+) */}
        <Link
          href="/"
          className="flex items-center shrink-0 transition-opacity hover:opacity-85"
          aria-label="Asra3.com Home"
        >
          <span className="sm:hidden">
            <Asra3Logo
              variant="auto"
              size="sm"
              lang={lang}
              showTagline={false}
            />
          </span>
          <span className="hidden sm:inline-flex">
            <Asra3Logo
              variant="auto"
              size="md"
              lang={lang}
              showTagline
              tagline={
                lang === "ar"
                  ? "توظَّف أسرع في الخليج"
                  : "Get Hired Faster in the GCC"
              }
            />
          </span>
        </Link>

        {/* Primary Desktop Navigation — Paid Services First */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-4 lg:gap-5 text-[13px] font-bold text-zinc-600 dark:text-zinc-400"
        >
          <Link
            href="/#pricing-section"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#09090B]/5 dark:bg-[#D4AF37]/10 px-2.5 py-1.5 font-extrabold text-zinc-950 dark:text-[#D4AF37] hover:border-[#D4AF37] transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>{t.navPricing}</span>
          </Link>

          <Link
            href="/#wizard-section"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
          >
            {lang === "ar" ? "توزيع سيرتك" : "Distribute CV"}
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
          >
            <BriefcaseBusiness className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>{lang === "ar" ? "الوظائف المتاحة" : "Live Jobs"}</span>
          </Link>

          <Link
            href="/employers"
            className="hidden lg:inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
          >
            <Building2 className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>{lang === "ar" ? "للشركات" : "For Employers"}</span>
          </Link>
        </nav>

        {/* Right Utility Cluster (Uniform h-9 controls) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Compact Single GCC Market Dropdown */}
          <div ref={countryMenuRef} className="hidden sm:block relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={countryMenuOpen}
              aria-label={
                lang === "ar"
                  ? "اختيار الدولة المستهدفة"
                  : "Select Target GCC Country"
              }
              onClick={() => setCountryMenuOpen((prev) => !prev)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-2.5 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition-colors cursor-pointer"
            >
              <span dir="ltr" className="font-mono text-[#9A7B1C] dark:text-[#D4AF37]">
                {selectedCountry.code}
              </span>
              <span className="hidden xl:inline text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                {selectedCountry.currency_code}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
                  countryMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {countryMenuOpen && (
              <div
                role="menu"
                className="absolute end-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-1.5 shadow-xl z-50"
              >
                {countries.map((c) => {
                  const active = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        selectCountry(c.code);
                        setCountryMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                          : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span dir="ltr" className="font-mono font-extrabold">
                          {c.code}
                        </span>
                        <span>{lang === "ar" ? c.name_ar : c.name_en}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] opacity-80">
                        {c.currency_code}
                        {active && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Icon-Only Theme Toggle (Desktop / Tablet) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            title={
              theme === "dark"
                ? lang === "ar"
                  ? "الوضع الفاتح"
                  : "Light Mode"
                : lang === "ar"
                ? "الوضع الداكن"
                : "Dark Mode"
            }
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-[#D4AF37]" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-900" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer touch-manipulation"
            aria-label="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-zinc-600 dark:text-[#D4AF37]" />
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* Track Campaign Link (Large Screens) */}
          <Link
            href="/track"
            className="hidden lg:inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] transition-colors whitespace-nowrap"
          >
            <SearchCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>{t.navTrackOrder}</span>
          </Link>

          {/* Primary Paid Service CTA — Always Visible */}
          <Link
            href="/#wizard-section"
            className="btn-gold inline-flex h-9 items-center gap-1.5 rounded-lg px-3 sm:px-4 text-xs font-extrabold whitespace-nowrap touch-manipulation"
          >
            <span className="sm:hidden">
              {lang === "ar" ? "ابدأ الآن" : "Start"}
            </span>
            <span className="hidden sm:inline">
              {lang === "ar" ? "توزيع سيرتك" : "Start Campaign"}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#09090B]" />
          </Link>

          {/* Mobile Hamburger Button (40x40 Touch Target) */}
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 cursor-pointer touch-manipulation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Clean Categorized Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] px-4 py-4 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          {/* Section A: Core Paid Distribution Service */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A7B1C] dark:text-[#D4AF37]">
              {lang === "ar"
                ? "الخدمة الرئيسية — التوزيع المباشر للـ HR"
                : "Core Paid Service — Direct HR Placement"}
            </p>
            <Link
              href="/#wizard-section"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-gold flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold touch-manipulation"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {lang === "ar"
                  ? "ابدأ حملة توزيع سيرتك الآن"
                  : "Launch CV Distribution Campaign"}
              </span>
            </Link>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/#pricing-section"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3 text-center text-zinc-950 dark:text-[#D4AF37] touch-manipulation"
              >
                {t.navPricing}
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3 text-center text-zinc-900 dark:text-zinc-100 touch-manipulation"
              >
                <SearchCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{t.navTrackOrder}</span>
              </Link>
            </div>
          </div>

          {/* Section B: GCC Market & Theme Preferences */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {lang === "ar" ? "السوق الخليجي والمظهر" : "GCC Market & Display"}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {countries.map((c) => {
                const active = c.code === selectedCountryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      selectCountry(c.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex min-h-[48px] flex-col items-center justify-center rounded-xl border text-xs font-bold transition-colors cursor-pointer touch-manipulation ${
                      active
                        ? "bg-[#09090B] text-[#D4AF37] border-[#09090B] dark:bg-[#D4AF37] dark:text-[#09090B] dark:border-[#D4AF37]"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-[#121215] dark:text-zinc-300 dark:border-zinc-800"
                    }`}
                  >
                    <span dir="ltr" className="font-mono text-xs font-extrabold">
                      {c.code}
                    </span>
                    <span className="text-[10px] mt-0.5 opacity-80">
                      {c.currency_code}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer touch-manipulation"
            >
              <span>
                {lang === "ar" ? "مظهر المنصة" : "Display Theme"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#9A7B1C] dark:text-[#D4AF37]">
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>{lang === "ar" ? "تبديل للفاتح" : "Light Mode"}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>{lang === "ar" ? "تبديل للداكن" : "Dark Mode"}</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Section C: Free Ecosystem Portals */}
          <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {lang === "ar"
                ? "بوابات أسرع المجانية"
                : "Free Ecosystem Portals"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3 text-zinc-800 dark:text-zinc-200 touch-manipulation"
              >
                <BriefcaseBusiness className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{lang === "ar" ? "الوظائف المتاحة" : "Live Jobs"}</span>
              </Link>
              <Link
                href="/employers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3 text-zinc-800 dark:text-zinc-200 touch-manipulation"
              >
                <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>
                  {lang === "ar" ? "أضف وظيفة مجاناً" : "Post Job Free"}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span dir="ltr">hello@asra3.com</span>
            <div className="flex items-center gap-1 font-semibold">
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-[44px] items-center px-2.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-[#D4AF37] touch-manipulation"
              >
                {lang === "ar" ? "الخصوصية" : "Privacy"}
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-[44px] items-center px-2.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-[#D4AF37] touch-manipulation"
              >
                {lang === "ar" ? "الشروط" : "Terms"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
