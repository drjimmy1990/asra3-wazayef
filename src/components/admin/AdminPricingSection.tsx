"use client";

import React, { useState } from "react";
import { AdminPromosPanel } from "@/components/AdminPromosPanel";
import {
  CouponRecord,
  Language,
  OfferSettings,
  PackageTier,
} from "@/lib/types";
import { Loader2, Save } from "lucide-react";

interface AdminPricingSectionProps {
  lang: Language;
  offerSettings?: OfferSettings;
  coupons?: CouponRecord[];
  packages: PackageTier[];
  onPackagesChange: React.Dispatch<React.SetStateAction<PackageTier[]>>;
  onOverviewReload: () => Promise<void> | void;
}

export function AdminPricingSection({
  lang,
  offerSettings,
  coupons,
  packages,
  onPackagesChange,
  onOverviewReload,
}: AdminPricingSectionProps) {
  const [savingPkgId, setSavingPkgId] = useState<string | null>(null);
  const [savedToastPkgId, setSavedToastPkgId] = useState<string | null>(null);

  const handleSavePackagePrices = async (pkg: PackageTier) => {
    setSavingPkgId(pkg.id);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          pricesByCurrency: pkg.prices_by_currency,
          addonPricesByCurrency: pkg.addon_country_price_by_currency,
          originalPricesByCurrency: pkg.original_prices_by_currency,
        }),
      });
      if (res.ok) {
        setSavedToastPkgId(pkg.id);
        setTimeout(() => setSavedToastPkgId(null), 2500);
      }
    } finally {
      setSavingPkgId(null);
    }
  };

  return (
    <div className="animate-panel-enter space-y-6">
      <AdminPromosPanel
        initialOfferSettings={offerSettings}
        initialCoupons={coupons}
        onChanged={onOverviewReload}
      />

      <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col">
        <div className="exec-card-header px-5 py-4 sm:px-6">
          <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
            {lang === "ar"
              ? "تعديل أسعار باقات أسرع والدول الإضافية"
              : "Asra3 Plan & Add-on Pricing per Currency"}
          </h2>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {packages.map((pkg, pkgIdx) => (
            <div
              key={pkg.id}
              className="exec-well rounded-xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm">
                  {lang === "ar" ? pkg.name_ar : pkg.name_en} (
                  {pkg.company_limit})
                </h3>
                <button
                  type="button"
                  onClick={() => handleSavePackagePrices(pkg)}
                  className="btn-gold inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-extrabold cursor-pointer touch-manipulation"
                >
                  {savingPkgId === pkg.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {savedToastPkgId === pkg.id
                      ? lang === "ar"
                        ? "✓ تم الحفظ"
                        : "✓ Saved"
                      : lang === "ar"
                      ? "حفظ"
                      : "Save"}
                  </span>
                </button>
              </div>

              <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                {lang === "ar" ? "سعر الباقة الأساسي:" : "Base Plan Price:"}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {(["AED", "SAR", "QAR", "KWD", "EGP", "USD"] as const).map(
                  (curr) => (
                    <div key={curr}>
                      <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                        {curr}
                      </label>
                      <input
                        type="number"
                        dir="ltr"
                        value={pkg.prices_by_currency[curr] || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onPackagesChange((prev) =>
                            prev.map((item, idx) =>
                              idx === pkgIdx
                                ? {
                                    ...item,
                                    prices_by_currency: {
                                      ...item.prices_by_currency,
                                      [curr]: val,
                                    },
                                  }
                                : item
                            )
                          );
                        }}
                        className="exec-input w-full rounded-lg px-2.5 py-2 text-base sm:text-xs font-bold"
                      />
                    </div>
                  )
                )}
              </div>

              <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 pt-1">
                {lang === "ar"
                  ? "السعر الأصلي قبل الخصم (يظهر مشطوباً أثناء العرض):"
                  : "Original Anchor Price (Shown Crossed-Out During Offer):"}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {(["AED", "SAR", "QAR", "KWD", "EGP", "USD"] as const).map(
                  (curr) => (
                    <div key={`orig-${curr}`}>
                      <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                        ~~{curr}~~
                      </label>
                      <input
                        type="number"
                        dir="ltr"
                        value={pkg.original_prices_by_currency?.[curr] ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onPackagesChange((prev) =>
                            prev.map((item, idx) =>
                              idx === pkgIdx
                                ? {
                                    ...item,
                                    original_prices_by_currency: {
                                      ...(item.original_prices_by_currency ||
                                        item.prices_by_currency),
                                      [curr]: val,
                                    },
                                  }
                                : item
                            )
                          );
                        }}
                        className="exec-input w-full rounded-lg px-2.5 py-2 text-base sm:text-xs font-bold"
                      />
                    </div>
                  )
                )}
              </div>

              <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 pt-1">
                {lang === "ar"
                  ? "سعر إضافة دولة خليجية إضافية:"
                  : "Extra Country Add-on Price:"}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {(["AED", "SAR", "QAR", "KWD", "EGP", "USD"] as const).map(
                  (curr) => (
                    <div key={`addon-${curr}`}>
                      <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                        +{curr}
                      </label>
                      <input
                        type="number"
                        dir="ltr"
                        value={pkg.addon_country_price_by_currency[curr] || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onPackagesChange((prev) =>
                            prev.map((item, idx) =>
                              idx === pkgIdx
                                ? {
                                    ...item,
                                    addon_country_price_by_currency: {
                                      ...item.addon_country_price_by_currency,
                                      [curr]: val,
                                    },
                                  }
                                : item
                            )
                          );
                        }}
                        className="exec-input w-full rounded-lg px-2.5 py-2 text-base sm:text-xs font-bold"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
