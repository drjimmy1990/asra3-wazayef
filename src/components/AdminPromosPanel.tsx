"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  CouponDiscountType,
  CouponRecord,
  OfferSettings,
  PackageId,
} from "@/lib/types";
import { INITIAL_OFFER_SETTINGS } from "@/lib/seed-data";
import {
  Check,
  Clock,
  Loader2,
  PlusCircle,
  Power,
  Save,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";

interface AdminPromosPanelProps {
  initialOfferSettings?: OfferSettings;
  initialCoupons?: CouponRecord[];
  onChanged?: () => void;
}

export function AdminPromosPanel({
  initialOfferSettings,
  initialCoupons,
  onChanged,
}: AdminPromosPanelProps) {
  const { lang } = useApp();

  // Limited-Time Offer settings state
  const [offer, setOffer] = useState<OfferSettings>(
    initialOfferSettings || INITIAL_OFFER_SETTINGS
  );
  const [savingOffer, setSavingOffer] = useState(false);
  const [savedOfferToast, setSavedOfferToast] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<CouponRecord[]>(initialCoupons || []);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<CouponDiscountType>("percent");
  const [newValue, setNewValue] = useState("25");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newScope, setNewScope] = useState<"all" | PackageId>("all");
  const [newNote, setNewNote] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (initialOfferSettings) setOffer(initialOfferSettings);
  }, [initialOfferSettings]);

  useEffect(() => {
    if (initialCoupons) setCoupons(initialCoupons);
  }, [initialCoupons]);

  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  useEffect(() => {
    if (!initialCoupons) {
      void loadCoupons();
    }
  }, [initialCoupons, loadCoupons]);

  const handleSaveOffer = async () => {
    setSavingOffer(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerSettings: offer }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.offerSettings) setOffer(data.offerSettings);
        setSavedOfferToast(true);
        setTimeout(() => setSavedOfferToast(false), 2500);
        onChanged?.();
      }
    } finally {
      setSavingOffer(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);
    setCreatingCoupon(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discount_type: newType,
          discount_value: Number(newValue),
          max_uses: newMaxUses ? Number(newMaxUses) : null,
          expires_at: newExpiresAt
            ? new Date(newExpiresAt).toISOString()
            : null,
          applicable_packages: newScope === "all" ? "all" : [newScope],
          note: newNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponFeedback({
          ok: false,
          text: data?.error || "Could not create coupon",
        });
      } else {
        setCoupons(data.coupons || []);
        setNewCode("");
        setNewMaxUses("");
        setNewExpiresAt("");
        setNewNote("");
        setCouponFeedback({
          ok: true,
          text:
            lang === "ar"
              ? `✓ تم إنشاء الكوبون (${data.coupon?.code}) بنجاح`
              : `✓ Coupon (${data.coupon?.code}) created`,
        });
        onChanged?.();
      }
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (cpn: CouponRecord) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cpn.id, is_active: !cpn.is_active }),
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons || []);
      onChanged?.();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const res = await fetch(
      `/api/admin/coupons?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.coupons || []);
      onChanged?.();
    }
  };

  const formatLocalDateTimeInput = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left: Limited-Time Offer Banner & Countdown Controller */}
      <div className="exec-card exec-card-gold-top rounded-2xl overflow-hidden flex flex-col">
        <div className="exec-card-header px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? "عروض الوقت المحدود والعداد التنازلي"
                : "Limited-Time Offer & Countdown Banner"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleSaveOffer}
            disabled={savingOffer}
            className="btn-gold inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-extrabold cursor-pointer disabled:opacity-60"
          >
            {savingOffer ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : savedOfferToast ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>
              {savedOfferToast
                ? lang === "ar"
                  ? "تم الحفظ ✓"
                  : "Saved ✓"
                : lang === "ar"
                ? "حفظ العرض"
                : "Save Offer"}
            </span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="exec-well flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer">
            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              {lang === "ar"
                ? "تفعيل عروض الوقت المحدود والأسعار المشطوبة على الموقع"
                : "Enable Limited-Time Offer Banner & Crossed-Out Prices"}
            </span>
            <input
              type="checkbox"
              checked={offer.enabled}
              onChange={(e) =>
                setOffer((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "شارة العرض (عربي)" : "Offer Badge (AR)"}
              </label>
              <input
                type="text"
                value={offer.badge_ar}
                onChange={(e) =>
                  setOffer((prev) => ({ ...prev, badge_ar: e.target.value }))
                }
                className="exec-input w-full rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "شارة العرض (إنجليزي)" : "Offer Badge (EN)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={offer.badge_en}
                onChange={(e) =>
                  setOffer((prev) => ({ ...prev, badge_en: e.target.value }))
                }
                className="exec-input w-full rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "عنوان العرض (عربي)" : "Offer Headline (AR)"}
              </label>
              <input
                type="text"
                value={offer.headline_ar}
                onChange={(e) =>
                  setOffer((prev) => ({ ...prev, headline_ar: e.target.value }))
                }
                className="exec-input w-full rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "عنوان العرض (إنجليزي)" : "Offer Headline (EN)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={offer.headline_en}
                onChange={(e) =>
                  setOffer((prev) => ({ ...prev, headline_en: e.target.value }))
                }
                className="exec-input w-full rounded-lg px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar"
                  ? "تاريخ انتهاء محدد (اتركه فارغاً للتجدد التلقائي)"
                  : "Fixed End Date/Time (Blank = Auto-Renew Cycle)"}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="datetime-local"
                  dir="ltr"
                  value={formatLocalDateTimeInput(offer.ends_at)}
                  onChange={(e) =>
                    setOffer((prev) => ({
                      ...prev,
                      ends_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    }))
                  }
                  className="exec-input flex-1 rounded-lg px-2.5 py-2 text-xs font-mono"
                />
                {offer.ends_at && (
                  <button
                    type="button"
                    onClick={() =>
                      setOffer((prev) => ({ ...prev, ends_at: null }))
                    }
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
                  >
                    {lang === "ar" ? "مسح" : "Clear"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                {lang === "ar" ? "دورة التجدد (ساعة)" : "Evergreen Hours"}
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={offer.evergreen_hours}
                onChange={(e) =>
                  setOffer((prev) => ({
                    ...prev,
                    evergreen_hours: Number(e.target.value) || 48,
                  }))
                }
                className="exec-input w-full rounded-lg px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              {lang === "ar"
                ? "كود خصم مميز يظهر على شريط العرض (اختياري)"
                : "Featured Public Coupon Code on Banner (Optional)"}
            </label>
            <input
              type="text"
              dir="ltr"
              value={offer.highlight_coupon_code || ""}
              onChange={(e) =>
                setOffer((prev) => ({
                  ...prev,
                  highlight_coupon_code: e.target.value.toUpperCase() || null,
                }))
              }
              placeholder="ASRA3VIP"
              className="exec-input w-full rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
            />
          </div>
        </div>
      </div>

      {/* Right: Discount Coupons Manager */}
      <div className="exec-card exec-card-carbon-top rounded-2xl overflow-hidden flex flex-col">
        <div className="exec-card-header px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#09090B] border border-zinc-800 text-[#D4AF37]">
              <Tag className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {lang === "ar"
                ? `إدارة كوبونات الخصم (${coupons.length})`
                : `Discount Coupons Manager (${coupons.length})`}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Create Coupon Form */}
          <form
            onSubmit={handleCreateCoupon}
            className="exec-well rounded-xl p-4 space-y-3"
          >
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {lang === "ar" ? "+ إنشاء كوبون خصم جديد" : "+ Create New Coupon"}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                dir="ltr"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="LAUNCH30"
                className="exec-input rounded-lg px-2.5 py-2 text-xs font-mono font-extrabold uppercase"
              />

              <select
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as CouponDiscountType)
                }
                className="exec-input rounded-lg px-2.5 py-2 text-xs font-bold"
              >
                <option value="percent">% Percent</option>
                <option value="fixed">Fixed Amount</option>
              </select>

              <input
                type="number"
                required
                min={1}
                max={newType === "percent" ? 99 : 50000}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === "percent" ? "20" : "50"}
                className="exec-input rounded-lg px-2.5 py-2 text-xs font-bold"
              />

              <select
                value={newScope}
                onChange={(e) =>
                  setNewScope(e.target.value as "all" | PackageId)
                }
                className="exec-input rounded-lg px-2.5 py-2 text-xs font-bold"
              >
                <option value="all">All Tiers</option>
                <option value="starter">Starter Only</option>
                <option value="pro">Turbo Only</option>
                <option value="ultimate">Hyper VIP Only</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="number"
                min={1}
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder={
                  lang === "ar" ? "أقصى استخدام (اختياري)" : "Max uses (opt)"
                }
                className="exec-input rounded-lg px-2.5 py-2 text-xs"
              />
              <input
                type="datetime-local"
                dir="ltr"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="exec-input rounded-lg px-2.5 py-2 text-xs font-mono"
              />
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={lang === "ar" ? "ملاحظة (اختياري)" : "Note (opt)"}
                className="exec-input rounded-lg px-2.5 py-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="text-xs font-bold">
                {couponFeedback && (
                  <span
                    className={
                      couponFeedback.ok
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {couponFeedback.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={creatingCoupon}
                className="btn-gold inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold cursor-pointer disabled:opacity-60"
              >
                {creatingCoupon ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PlusCircle className="h-3.5 w-3.5" />
                )}
                <span>{lang === "ar" ? "إضافة الكوبون" : "Add Coupon"}</span>
              </button>
            </div>
          </form>

          {/* Coupons List */}
          {loadingCoupons ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
            </div>
          ) : coupons.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">
              {lang === "ar" ? "لا توجد كوبونات بعد." : "No coupons yet."}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
              {coupons.map((cpn) => {
                const isExpired = Boolean(
                  cpn.expires_at &&
                    new Date(cpn.expires_at).getTime() < Date.now()
                );
                return (
                  <div
                    key={cpn.id}
                    className="exec-well rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          dir="ltr"
                          className="rounded bg-[#09090B] px-2.5 py-0.5 font-mono text-xs font-extrabold text-[#D4AF37]"
                        >
                          {cpn.code}
                        </span>
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                          {cpn.discount_type === "fixed"
                            ? `-${cpn.discount_value} Fixed`
                            : `${cpn.discount_value}% OFF`}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            cpn.is_active && !isExpired
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {isExpired
                            ? "EXPIRED"
                            : cpn.is_active
                            ? "ACTIVE"
                            : "PAUSED"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        Used: {cpn.used_count}
                        {cpn.max_uses ? ` / ${cpn.max_uses}` : " / ∞"} • Scope:{" "}
                        {cpn.applicable_packages === "all"
                          ? "ALL"
                          : cpn.applicable_packages.join(",")}
                        {cpn.expires_at
                          ? ` • Exp: ${cpn.expires_at.slice(0, 10)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(cpn)}
                        title={cpn.is_active ? "Pause coupon" : "Activate coupon"}
                        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] p-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] cursor-pointer"
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(cpn.id)}
                        title="Delete coupon"
                        className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#121215] p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
