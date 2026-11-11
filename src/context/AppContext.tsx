"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CountryCode,
  CountryConfig,
  Industry,
  Language,
  PackageTier,
} from "@/lib/types";
import {
  INITIAL_COUNTRIES,
  INITIAL_INDUSTRIES,
  INITIAL_PACKAGES,
} from "@/lib/seed-data";
import { getTranslation } from "@/lib/i18n";

export type ThemeMode = "light" | "dark";

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: ReturnType<typeof getTranslation>;
  selectedCountryCode: CountryCode;
  setSelectedCountryCode: (code: CountryCode) => void;
  selectedCountry: CountryConfig;
  countries: CountryConfig[];
  industries: Industry[];
  packages: PackageTier[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode>("AE");
  const [countries, setCountries] =
    useState<CountryConfig[]>(INITIAL_COUNTRIES);
  const [industries, setIndustries] = useState<Industry[]>(INITIAL_INDUSTRIES);
  const [packages, setPackages] = useState<PackageTier[]>(INITIAL_PACKAGES);

  // Hydrate saved language & theme preferences on client mount (Light Mode default)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("asra3_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }

      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang === "en" || urlLang === "ar") {
        setLangState(urlLang);
        localStorage.setItem("asra3_lang", urlLang);
        return;
      }
      const saved = localStorage.getItem("asra3_lang");
      if (saved === "en" || saved === "ar") {
        setLangState(saved);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.countries?.length) setCountries(data.countries);
        if (data?.industries?.length) setIndustries(data.industries);
        if (data?.packages?.length) setPackages(data.packages);
      })
      .catch(() => {
        // Fallback to initial seed data
      });
  }, []);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem("asra3_lang", nextLang);
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLangState((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      try {
        localStorage.setItem("asra3_lang", next);
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("asra3_theme", nextTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("asra3_theme", next);
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const selectedCountry =
    countries.find((c) => c.code === selectedCountryCode) || countries[0];

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        theme,
        setTheme,
        toggleTheme,
        t: getTranslation(lang),
        selectedCountryCode,
        setSelectedCountryCode,
        selectedCountry,
        countries,
        industries,
        packages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
