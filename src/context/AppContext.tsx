"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CountryCode,
  CountryConfig,
  Industry,
  Language,
  OfferSettings,
  PackageTier,
} from "@/lib/types";
import {
  INITIAL_COUNTRIES,
  INITIAL_INDUSTRIES,
  INITIAL_OFFER_SETTINGS,
  INITIAL_PACKAGES,
} from "@/lib/seed-data";
import { getCountryCodeFromPathname } from "@/lib/country-hubs";
import { getTranslation } from "@/lib/i18n";

export type ThemeMode = "light" | "dark";

export interface SelectCountryOptions {
  shallow?: boolean;
}

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
  selectCountry: (code: CountryCode, options?: SelectCountryOptions) => void;
  selectedCountry: CountryConfig;
  countries: CountryConfig[];
  industries: Industry[];
  packages: PackageTier[];
  offerSettings: OfferSettings;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const routeCountry = getCountryCodeFromPathname(pathname);

  const [lang, setLangState] = useState<Language>("ar");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    () => routeCountry ?? "AE"
  );
  const [countries, setCountries] =
    useState<CountryConfig[]>(INITIAL_COUNTRIES);
  const [industries, setIndustries] = useState<Industry[]>(INITIAL_INDUSTRIES);
  const [packages, setPackages] = useState<PackageTier[]>(INITIAL_PACKAGES);
  const [offerSettings, setOfferSettings] = useState<OfferSettings>(
    INITIAL_OFFER_SETTINGS
  );

  useEffect(() => {
    if (routeCountry) {
      setSelectedCountryCode(routeCountry);
    }
  }, [routeCountry]);

  const selectCountry = useCallback(
    (code: CountryCode, options?: SelectCountryOptions) => {
      setSelectedCountryCode(code);

      const livePath =
        typeof window !== "undefined"
          ? window.location.pathname
          : pathnameRef.current;
      const currentRouteCountry = getCountryCodeFromPathname(livePath);

      if (currentRouteCountry && currentRouteCountry !== code) {
        const subMatch = livePath?.match(/^\/(?:ae|sa|qa|kw)(\/.*)?$/i);
        const suffix = subMatch?.[1] || "";
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const nextUrl = `/${code.toLowerCase()}${suffix}${hash}`;
        if (options?.shallow && typeof window !== "undefined") {
          window.history.pushState(null, "", nextUrl);
        } else {
          router.push(nextUrl, { scroll: false });
        }
      }
    },
    [router]
  );

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

  const fetchLiveCatalog = useCallback(() => {
    fetch("/api/catalog", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.countries?.length) setCountries(data.countries);
        if (data?.industries?.length) setIndustries(data.industries);
        if (data?.packages?.length) setPackages(data.packages);
        if (data?.offerSettings) setOfferSettings(data.offerSettings);
      })
      .catch(() => {
        // Fallback to initial seed data
      });
  }, []);

  useEffect(() => {
    fetchLiveCatalog();
  }, [fetchLiveCatalog, pathname]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLiveCatalog();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchLiveCatalog]);

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
        selectCountry,
        selectedCountry,
        countries,
        industries,
        packages,
        offerSettings,
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
