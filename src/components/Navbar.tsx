"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Asra3Logo } from "@/components/Asra3Logo";
import {
  ArrowUpRight,
  Globe,
  Menu,
  Moon,
  SearchCheck,
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
    setSelectedCountryCode,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <Link
          href="/"
          className="flex items-center shrink-0 transition-opacity hover:opacity-85"
          aria-label="Asra3.com Home"
        >
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
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-7 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400"
        >
          <Link
            href="/#wizard-section"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            {lang === "ar" ? "إطلاق الحملة" : "Start Campaign"}
          </Link>
          <Link
            href="/#countries-section"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            {t.navCountries}
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            {t.navHowItWorks}
          </Link>
          <Link
            href="/#pricing-section"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            {t.navPricing}
          </Link>
          <Link
            href="/#faq-section"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
          </Link>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Compact GCC Market Segmented Control (Desktop) */}
          <div
            role="group"
            aria-label="Target GCC Country"
            className="hidden lg:flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] p-1"
          >
            {countries.map((c) => {
              const active = c.code === selectedCountryCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                      : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <span dir="ltr" className="font-mono text-[11px] font-extrabold">
                    {c.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Light / Dark Mode Switcher */}
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
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-2.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">
                  {lang === "ar" ? "فاتح" : "Light"}
                </span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-zinc-900" />
                <span className="hidden sm:inline">
                  {lang === "ar" ? "داكن" : "Dark"}
                </span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] px-2.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-zinc-600 dark:text-[#D4AF37]" />
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* Track Campaign Link */}
          <Link
            href="/track"
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <SearchCheck className="h-3.5 w-3.5 text-zinc-900 dark:text-[#D4AF37]" />
            <span>{t.navTrackOrder}</span>
          </Link>

          {/* Primary Solid CTA (Pure Black in Light Mode, Solid Gold in Dark Mode) */}
          <Link
            href="/#wizard-section"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-[#D4AF37] dark:text-[#09090B] dark:hover:bg-[#C59F27] px-4 py-2 text-xs font-extrabold transition-colors"
          >
            <span>{t.navStartNow}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#D4AF37] dark:text-[#09090B]" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex lg:hidden items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#121215] p-2 text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] px-4 py-4 space-y-4">
          {/* Mobile Country Switcher */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              {lang === "ar" ? "السوق الخليجي المستهدف" : "Target GCC Market"}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {countries.map((c) => {
                const active = c.code === selectedCountryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCountryCode(c.code)}
                    className={`flex flex-col items-center justify-center rounded-lg py-2 text-xs font-bold border transition-colors cursor-pointer ${
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
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <Link
              href="/#wizard-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-[#09090B] text-white dark:bg-[#D4AF37] dark:text-[#09090B] px-3.5 py-2.5 text-center"
            >
              {lang === "ar" ? "ابدأ حملتك الآن" : "Start Campaign"}
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-2.5 text-center text-zinc-900 dark:text-zinc-100"
            >
              {t.navTrackOrder}
            </Link>
            <Link
              href="/#countries-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-2.5 text-center text-zinc-700 dark:text-zinc-300"
            >
              {t.navCountries}
            </Link>
            <Link
              href="/#pricing-section"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121215] px-3.5 py-2.5 text-center text-zinc-700 dark:text-zinc-300"
            >
              {t.navPricing}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>support@asra3.com</span>
            <div className="flex items-center gap-3 font-semibold">
              <Link href="/privacy" onClick={() => setMobileMenuOpen(false)}>
                {lang === "ar" ? "الخصوصية" : "Privacy"}
              </Link>
              <Link href="/terms" onClick={() => setMobileMenuOpen(false)}>
                {lang === "ar" ? "الشروط" : "Terms"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
