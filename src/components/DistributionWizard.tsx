"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { CountryCode, CvScanResult, PackageId } from "@/lib/types";
import { RadialProgressGauge } from "@/components/MotionPrimitives";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  X,
} from "lucide-react";

interface DistributionWizardProps {
  externalPackageId?: PackageId | null;
}

export function DistributionWizard({
  externalPackageId,
}: DistributionWizardProps) {
  const {
    lang,
    t,
    countries,
    industries,
    packages,
    selectedCountryCode,
    selectCountry,
    selectedCountry,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [extraCountries, setExtraCountries] = useState<CountryCode[]>([]);

  // Step 2: CV Upload & AI Scan State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>("");
  const [storedCvUrl, setStoredCvUrl] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<CvScanResult | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Candidate Profile & Contact State
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [selectedIndustryId, setSelectedIndustryId] = useState("engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExp, setYearsExp] = useState(5);
  const [customSkills, setCustomSkills] = useState<string[]>([
    "Project Management",
    "GCC Market Compliance",
    "Team Leadership",
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [excludedEmployerDomain, setExcludedEmployerDomain] = useState("");

  // Step 3 & 4: Package & Checkout State
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>("pro");
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    percent: number;
  } | null>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (externalPackageId) {
      setSelectedPackageId(externalPackageId);
    }
  }, [externalPackageId]);

  // Sync default cities & phone prefix ONLY when selected country changes
  useEffect(() => {
    const allCityIds = selectedCountry.cities.map((c) => c.id);
    setSelectedCities(allCityIds);
    setExtraCountries((prev) =>
      prev.filter((code) => code !== selectedCountryCode)
    );
    setCandidatePhone((prev) => {
      const stripped = prev.trim();
      if (!stripped || /^\+\d{2,4}$/.test(stripped)) {
        return `${selectedCountry.phone_prefix} `;
      }
      return prev;
    });
  }, [selectedCountryCode, selectedCountry]);

  const toggleCity = (cityId: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.length > 1
          ? prev.filter((id) => id !== cityId)
          : prev
        : [...prev, cityId]
    );
  };

  const toggleExtraCountry = (code: CountryCode) => {
    if (code === selectedCountryCode) return;
    setExtraCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedCitiesCompanyCount = selectedCountry.cities
    .filter((c) => selectedCities.includes(c.id))
    .reduce((acc, c) => acc + c.companies_count, 0);

  const handleCvScan = async (fileToScan: File) => {
    setIsScanning(true);
    setStep2Error(null);
    try {
      const formData = new FormData();
      formData.append("file", fileToScan);
      formData.append("countryCode", selectedCountryCode);
      formData.append("industryId", selectedIndustryId);

      const res = await fetch("/api/cv/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setStep2Error(
          data?.error ||
            (lang === "ar"
              ? "تعذر تحليل الملف. تأكد من أن الملف بصيغة PDF أو DOCX وبحجم أقل من 10 ميجابايت."
              : "Failed to scan CV file. Please upload a PDF or DOCX under 10 MB.")
        );
        return;
      }

      const typed = data as CvScanResult;
      setScanResult(typed);
      setSelectedIndustryId(typed.detected_industry_id);
      setJobTitle(typed.job_title);
      setYearsExp(typed.years_experience);
      if (typed.stored_cv_url) {
        setStoredCvUrl(typed.stored_cv_url);
      }
      if (typed.detected_skills?.length) {
        setCustomSkills(typed.detected_skills);
      }
      if (!candidateName.trim() && typed.candidate_name) {
        setCandidateName(typed.candidate_name);
      }
      if (!candidateEmail.trim() && typed.candidate_email) {
        setCandidateEmail(typed.candidate_email);
      }
      if (
        typed.candidate_phone &&
        typed.candidate_phone.replace(/[^\d]/g, "").length >= 8
      ) {
        setCandidatePhone(typed.candidate_phone);
      }
    } catch (err) {
      console.error("Scan failed:", err);
      setStep2Error(
        lang === "ar"
          ? "حدث خطأ أثناء رفع السيرة الذاتية. يرجى المحاولة مرة أخرى."
          : "Network error while uploading CV. Please try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const acceptCvFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setStep2Error(
        lang === "ar"
          ? "حجم الملف يتجاوز 10 ميجابايت. يرجى رفع نسخة مضغوطة من سيرتك الذاتية."
          : "File size exceeds 10 MB. Please upload a smaller PDF or DOCX file."
      );
      return;
    }
    if (!/\.(pdf|doc|docx|txt)$/i.test(f.name)) {
      setStep2Error(
        lang === "ar"
          ? "صيغة غير مدعومة. يرجى رفع ملف PDF أو Word (DOCX)."
          : "Unsupported file type. Please upload a PDF or Word (DOCX) file."
      );
      return;
    }
    setCvFile(f);
    setCvFileName(f.name);
    handleCvScan(f);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptCvFile(e.target.files?.[0]);
  };

  const onDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    acceptCvFile(e.dataTransfer.files?.[0]);
  };

  const addCustomSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || customSkills.includes(trimmed)) return;
    setCustomSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleProceedFromStep2 = () => {
    if (!cvFile && !cvFileName) {
      setStep2Error(
        lang === "ar"
          ? "يرجى رفع ملف سيرتك الذاتية (PDF أو Word) أولاً للمتابعة إلى اختيار الباقة."
          : "Please upload your CV file (PDF or Word) first before proceeding to package selection."
      );
      return;
    }
    setStep2Error(null);
    setStep(3);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      setPromoError(null);
      return;
    }
    if (code === "ASRA3VIP" || code === "GCC20") {
      setAppliedPromo({ code, percent: 20 });
      setPromoError(null);
    } else if (code === "FAST15" || code === "WAZAYEF15") {
      setAppliedPromo({ code, percent: 15 });
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError(
        lang === "ar"
          ? "كود الخصم غير صالح أو منتهي الصلاحية."
          : "Invalid or expired promo code."
      );
    }
  };

  const activePackage =
    packages.find((p) => p.id === selectedPackageId) || packages[1];
  const currency = selectedCountry.currency_code;
  const currencySymbol =
    lang === "ar"
      ? selectedCountry.currency_symbol_ar
      : selectedCountry.currency_symbol_en;

  const basePrice =
    activePackage.prices_by_currency[currency] ??
    activePackage.prices_by_currency.AED;
  const addonUnitPrice =
    activePackage.addon_country_price_by_currency[currency] ??
    activePackage.addon_country_price_by_currency.AED;
  const addonTotal = extraCountries.length * addonUnitPrice;
  const subtotal = basePrice + addonTotal;
  const discountAmount = appliedPromo
    ? Math.round((subtotal * appliedPromo.percent) / 100)
    : 0;
  const finalTotal = Math.max(1, subtotal - discountAmount);

  const totalCompaniesToReach =
    activePackage.company_limit +
    extraCountries.length * Math.round(activePackage.company_limit * 0.5);

  const handleProceedToEasyKash = async () => {
    const cleanName = candidateName.trim();
    const cleanEmail = candidateEmail.trim();
    const cleanPhone = candidatePhone.trim();

    if (!cleanName || cleanName.length < 2) {
      setCheckoutError(
        lang === "ar"
          ? "يرجى إدخال اسمك الكامل كما سيظهر لأقسام الموارد البشرية (HR)."
          : "Please enter your full name as it should appear to HR departments."
      );
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setCheckoutError(
        lang === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح لاستلام دعوات المقابلات والردود."
          : "Please enter a valid email address to receive HR interview replies."
      );
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/[^\d]/g, "").length < 7) {
      setCheckoutError(
        lang === "ar"
          ? "يرجى إدخال رقم الجوال / الواتساب بشكل صحيح."
          : "Please enter a valid mobile / WhatsApp number."
      );
      return;
    }

    setCheckoutError(null);
    setIsSubmittingCheckout(true);

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: cleanName,
          candidate_email: cleanEmail,
          candidate_phone: cleanPhone,
          preferred_lang: lang,
          primary_country_code: selectedCountryCode,
          extra_country_codes: extraCountries,
          selected_cities: selectedCities,
          industry_id: selectedIndustryId,
          job_title: jobTitle.trim() || "Specialist",
          years_experience: yearsExp,
          cv_file_name: cvFileName || cvFile?.name || "Candidate_CV.pdf",
          original_cv_url: storedCvUrl,
          detected_skills: customSkills,
          ats_score: scanResult?.ats_score || 82,
          package_id: selectedPackageId,
          promo_code: appliedPromo?.code || "",
          excluded_domain: excludedEmployerDomain.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || "Payment initialization failed");
      }

      if (data.trackingToken && typeof window !== "undefined") {
        localStorage.setItem("asra3_last_token", data.trackingToken);
        localStorage.setItem("wazayef_last_token", data.trackingToken);
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to initialize payment"
      );
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-[0_20px_50px_rgba(9,9,11,0.06)] dark:shadow-none overflow-hidden transition-colors">
      {/* Top Carbon Stepper Bar */}
      <div className="bg-[#09090B] dark:bg-[#16161A] px-5 py-4 sm:px-8 text-zinc-50 border-b border-zinc-800">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { num: 1, index: "01", label: t.step1Title },
            { num: 2, index: "02", label: t.step2Title },
            { num: 3, index: "03", label: t.step3Title },
            { num: 4, index: "04", label: t.step4Title },
          ].map((item) => {
            const isCurrent = step === item.num;
            const isDone = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  if (item.num < step) {
                    setStep(item.num as 1 | 2 | 3 | 4);
                  } else if (item.num === 2) {
                    setStep(2);
                  } else if (item.num > 2 && (cvFile || cvFileName)) {
                    setStep(item.num as 1 | 2 | 3 | 4);
                  }
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-colors text-start cursor-pointer ${
                  isCurrent
                    ? "bg-[#D4AF37] text-[#09090B]"
                    : isDone
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-700"
                    : "bg-[#121215] text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-100"
                }`}
              >
                <span
                  dir="ltr"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-mono font-extrabold ${
                    isCurrent
                      ? "bg-[#09090B] text-[#D4AF37]"
                      : isDone
                      ? "bg-[#D4AF37] text-[#09090B]"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {isDone ? "✓" : item.index}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Body */}
      <div key={step} className="p-6 sm:p-8 lg:p-10 animate-panel-enter">
        {/* ================= STEP 1: COUNTRY & CITIES LOCALIZATION ================= */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                    {t.selectCountryLabel}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {lang === "ar"
                      ? "يتكيف النظام تلقائياً مع قوائم الشركات وعملة الدفع والمدن الخاصة بالسوق المختار."
                      : "Directories, active cities, and local currency adapt automatically to your chosen Gulf market."}
                  </p>
                </div>
                <span
                  dir="ltr"
                  className="rounded-md bg-[#09090B] px-3.5 py-1.5 text-xs font-mono font-bold text-[#D4AF37]"
                >
                  {selectedCountry.code} · {selectedCountry.currency_code}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {countries.map((c) => {
                  const active = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() =>
                        selectCountry(c.code, {
                          shallow: Boolean(cvFile || cvFileName),
                        })
                      }
                      className={`exec-card-interactive flex flex-col justify-between rounded-xl border p-5 text-start cursor-pointer ${
                        active
                          ? "border-[#09090B] bg-[#09090B] text-white dark:border-[#D4AF37] dark:bg-[#18181C]"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          dir="ltr"
                          className={`inline-flex h-8 w-10 items-center justify-center rounded-md font-mono text-xs font-extrabold ${
                            active
                              ? "bg-[#D4AF37] text-[#09090B]"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-[#D4AF37]"
                          }`}
                        >
                          {c.code}
                        </span>
                        <span
                          dir="ltr"
                          className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                            active
                              ? "bg-zinc-800 text-[#D4AF37]"
                              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {c.currency_code}
                        </span>
                      </div>
                      <div className="mt-4">
                        <h4
                          className={`font-bold text-base ${
                            active
                              ? "text-white"
                              : "text-zinc-950 dark:text-zinc-50"
                          }`}
                        >
                          {lang === "ar" ? c.name_ar : c.name_en}
                        </h4>
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            active
                              ? "text-[#D4AF37]"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {c.display_companies_count.toLocaleString()}+{" "}
                          {lang === "ar"
                            ? "جهة توظيف"
                            : "Verified Employers"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Selection Matrix */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <h4 className="font-bold text-zinc-950 dark:text-zinc-50">
                    {t.selectCitiesLabel} (
                    {lang === "ar"
                      ? selectedCountry.name_ar
                      : selectedCountry.name_en}
                    )
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCities(selectedCountry.cities.map((ct) => ct.id))
                  }
                  className="text-xs font-bold text-zinc-900 dark:text-[#D4AF37] hover:underline cursor-pointer"
                >
                  {t.selectAllCities}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedCountry.cities.map((city) => {
                  const checked = selectedCities.includes(city.id);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                        checked
                          ? "border-zinc-950 dark:border-[#D4AF37] bg-white dark:bg-[#16161A] text-zinc-950 dark:text-zinc-50"
                          : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#121215] text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${
                            checked
                              ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                              : "border border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span>
                          {lang === "ar" ? city.name_ar : city.name_en}
                        </span>
                      </span>
                      <span className="rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {city.companies_count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Country Counter Callout */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#09090B] dark:bg-[#16161A] border border-zinc-800 px-5 py-4 text-zinc-50">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-[#D4AF37]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">
                      {lang === "ar"
                        ? "الشركات النشطة في المدن المحددة:"
                        : "Verified employers in selected cities:"}
                    </p>
                    <p className="text-lg font-bold text-white">
                      <span className="text-[#D4AF37]">
                        {selectedCitiesCompanyCount.toLocaleString()}+
                      </span>{" "}
                      {t.companiesAvailableLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-gold flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-extrabold cursor-pointer"
                >
                  <span>{t.nextStepBtn}</span>
                  {lang === "ar" ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: UPLOAD CV & AI SECTOR MATCH ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "ارفع سيرتك الذاتية للفحص النصي وتحديد القطاع"
                  : "Upload Your CV for Instant ATS Audit & Sector Matching"}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? `يقرأ محرك أسرع النص الفعلي لملفك ويطابق تخصصك مع جهات التوظيف في ${selectedCountry.name_ar}.`
                  : `Asra3 parses your actual CV text and matches your specialty with verified employers in ${selectedCountry.name_en}.`}
              </p>
            </div>

            {/* Drag and Drop Upload Vault */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDraggingFile) setIsDraggingFile(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingFile(false);
              }}
              onDrop={onDropFile}
              className={`group flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-9 text-center transition-colors cursor-pointer ${
                isDraggingFile
                  ? "border-[#D4AF37] bg-zinc-100 dark:bg-[#16161A]"
                  : cvFileName
                  ? "border-zinc-900 dark:border-[#D4AF37] bg-zinc-50 dark:bg-[#09090B]"
                  : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] hover:border-zinc-900 dark:hover:border-[#D4AF37]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={onFileSelected}
                className="hidden"
              />
              {isScanning ? (
                <div className="flex flex-col items-center gap-3 py-3">
                  <Loader2 className="h-9 w-9 animate-spin text-[#D4AF37]" />
                  <p className="font-bold text-zinc-950 dark:text-zinc-50">
                    {t.scanningCvTitle}
                  </p>
                </div>
              ) : cvFileName ? (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#09090B] text-[#D4AF37]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                    {cvFileName}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#09090B] px-3 py-1 text-xs font-bold text-[#D4AF37]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t.scanCompleteBadge}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 underline">
                      {lang === "ar" ? "تغيير الملف" : "Replace file"}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#09090B] text-[#D4AF37] border border-zinc-800">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="mt-3.5 text-base font-bold text-zinc-950 dark:text-zinc-50">
                    {t.uploadBoxTitle}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t.uploadBoxSubtitle}
                  </p>
                </>
              )}
            </div>

            {step2Error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-bold text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{step2Error}</span>
              </div>
            )}

            {/* AI Scan Match Preview Card */}
            {scanResult && (
              <div className="rounded-xl border border-zinc-800 bg-[#09090B] dark:bg-[#16161A] p-5 text-zinc-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4AF37] text-[#09090B] font-extrabold shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                        {t.scanCompleteBadge}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {lang === "ar"
                          ? scanResult.summary_ar
                          : scanResult.summary_en}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-3.5 py-2 border border-zinc-800">
                    <RadialProgressGauge
                      percent={scanResult.ats_score}
                      size={60}
                      strokeWidth={5}
                      darkSurface
                    />
                    <div className="text-start">
                      <p className="text-[11px] text-zinc-400">
                        {t.atsScoreLabel}
                      </p>
                      <p
                        dir="ltr"
                        className="text-xs font-mono font-extrabold text-[#D4AF37]"
                      >
                        Target → 96%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sample Matched Companies */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {scanResult.sample_matched_companies.map((comp, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-800 bg-[#121215] p-3 text-xs"
                    >
                      <p className="font-bold text-white truncate">
                        {comp.company_name}
                      </p>
                      <p className="mt-0.5 text-zinc-400 truncate">
                        {lang === "ar" ? comp.city_ar : comp.city_en} ·{" "}
                        <span className="text-[#D4AF37]">{comp.sub_specialty}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Targeting Fields (Industry, Role, Experience) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.detectedIndustryLabel} *
                </label>
                <select
                  value={selectedIndustryId}
                  onChange={(e) => setSelectedIndustryId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 py-3 text-sm font-semibold text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {lang === "ar" ? ind.name_ar : ind.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.jobTitleLabel} *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: مهندس مدني أول / مراقب مالي"
                      : "e.g. Senior Civil Engineer / Controller"
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {lang === "ar" ? "سنوات الخبرة" : "Years of Experience"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={yearsExp}
                  onChange={(e) =>
                    setYearsExp(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 py-3 text-sm font-bold text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Skills Chips Editor */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5">
                {lang === "ar"
                  ? "المهارات والكلمات المفتاحية المستخرجة (تُدرج في خطاب التقديم التنفيذي):"
                  : "Extracted ATS Keywords & Competencies (Embedded in Executive Cover Letter):"}
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {customSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white dark:bg-[#16161A] border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomSkill(sk)}
                      className="text-zinc-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder={
                    lang === "ar"
                      ? "أضف مهارة أو اعتماداً مهنياً (مثال: PMP, CFA, SAP)..."
                      : "Add a skill or certification (e.g. PMP, CFA, SAP)..."
                  }
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-3.5 py-2 text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="btn-carbon inline-flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{lang === "ar" ? "إضافة" : "Add"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {t.prevStepBtn}
              </button>
              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="inline-flex items-center gap-2 rounded-lg bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-[#D4AF37] dark:text-[#09090B] dark:hover:bg-[#C59F27] px-6 py-3 text-sm font-extrabold transition-colors cursor-pointer"
              >
                <span>{t.nextStepBtn}</span>
                {lang === "ar" ? (
                  <ChevronLeft className="h-4 w-4 text-[#D4AF37] dark:text-[#09090B]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#D4AF37] dark:text-[#09090B]" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PACKAGE TIERS & MULTI-COUNTRY BUMP ================= */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {t.choosePackageTitle}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? `الأسعار معروضة بعملة ${selectedCountry.name_ar} (${currencySymbol})`
                  : `Localized pricing displayed in ${selectedCountry.name_en} currency (${currencySymbol})`}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {packages.map((pkg) => {
                  const selected = pkg.id === selectedPackageId;
                  const isFeatured = Boolean(pkg.is_featured);
                  const price =
                    pkg.prices_by_currency[currency] ??
                    pkg.prices_by_currency.AED;
                  const features =
                    lang === "ar" ? pkg.features_ar : pkg.features_en;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`exec-card-interactive relative flex flex-col justify-between rounded-xl p-6 cursor-pointer ${
                        isFeatured
                          ? selected
                            ? "bg-[#09090B] dark:bg-[#18181D] text-white border-2 border-[#D4AF37]"
                            : "bg-[#121215] text-white border border-zinc-800 hover:border-[#D4AF37]"
                          : selected
                          ? "bg-zinc-50 dark:bg-[#18181D] text-zinc-950 dark:text-white border-2 border-zinc-950 dark:border-[#D4AF37]"
                          : "bg-white dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      {isFeatured && (
                        <span className="btn-gold absolute -top-3 end-5 rounded px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                          {lang === "ar"
                            ? "الأكثر اختياراً — موصى به"
                            : "MOST POPULAR"}
                        </span>
                      )}

                      <div>
                        <h4
                          className={`text-lg font-bold ${
                            isFeatured
                              ? "text-white"
                              : "text-zinc-950 dark:text-zinc-50"
                          }`}
                        >
                          {lang === "ar" ? pkg.name_ar : pkg.name_en}
                        </h4>
                        <p
                          className={`mt-1 text-xs ${
                            isFeatured
                              ? "text-zinc-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {lang === "ar" ? pkg.tagline_ar : pkg.tagline_en}
                        </p>

                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span
                            dir="ltr"
                            className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
                              isFeatured
                                ? "text-[#D4AF37]"
                                : "text-zinc-950 dark:text-zinc-50"
                            }`}
                          >
                            {price}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isFeatured
                                ? "text-zinc-200"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {currencySymbol}
                          </span>
                          <span
                            className={`text-xs ${
                              isFeatured
                                ? "text-zinc-400"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            / {pkg.company_limit}{" "}
                            {lang === "ar" ? "شركة" : "Companies"}
                          </span>
                        </div>

                        <ul
                          className={`mt-5 space-y-2.5 border-t pt-4 ${
                            isFeatured
                              ? "border-zinc-800"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {features.map((feat, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-2 text-xs ${
                                isFeatured
                                  ? "text-zinc-200"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              <Check
                                className={`h-4 w-4 shrink-0 mt-0.5 ${
                                  isFeatured
                                    ? "text-[#D4AF37]"
                                    : "text-zinc-950 dark:text-[#D4AF37]"
                                }`}
                              />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`mt-6 w-full rounded-lg py-2.5 text-xs font-extrabold transition-colors cursor-pointer ${
                          selected
                            ? isFeatured
                              ? "btn-gold"
                              : "bg-[#09090B] text-white dark:bg-[#D4AF37] dark:text-[#09090B]"
                            : isFeatured
                            ? "bg-zinc-800 text-white hover:bg-zinc-700"
                            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {selected
                          ? lang === "ar"
                            ? "✓ الباقة المختارة"
                            : "✓ Selected Tier"
                          : lang === "ar"
                          ? "اختيار هذه الباقة"
                          : "Select Tier"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-Country Add-on Order Bump */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <h4 className="font-bold text-base">
                  {t.multiCountryBumpTitle}
                </h4>
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {t.multiCountryBumpDesc} (+{addonUnitPrice} {currencySymbol} /{" "}
                {lang === "ar" ? "لكل سوق إضافي" : "per extra market"})
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {countries
                  .filter((c) => c.code !== selectedCountryCode)
                  .map((c) => {
                    const added = extraCountries.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleExtraCountry(c.code)}
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-bold transition-colors cursor-pointer ${
                          added
                            ? "border-[#09090B] bg-[#09090B] text-white dark:border-[#D4AF37] dark:bg-[#18181D]"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-800 dark:text-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              added
                                ? "bg-[#D4AF37] text-[#09090B]"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#D4AF37]"
                            }`}
                          >
                            {c.code}
                          </span>
                          <span>
                            {lang === "ar" ? c.name_ar : c.name_en}
                          </span>
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            added
                              ? "bg-zinc-800 text-[#D4AF37]"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {added ? "✓" : `+${addonUnitPrice} ${currencySymbol}`}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {t.prevStepBtn}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#09090B] text-white hover:bg-zinc-800 dark:bg-[#D4AF37] dark:text-[#09090B] dark:hover:bg-[#C59F27] px-6 py-3 text-sm font-extrabold transition-colors cursor-pointer"
              >
                <span>{t.nextStepBtn}</span>
                {lang === "ar" ? (
                  <ChevronLeft className="h-4 w-4 text-[#D4AF37] dark:text-[#09090B]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#D4AF37] dark:text-[#09090B]" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CANDIDATE INFO, ORDER SUMMARY & CHECKOUT ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "بيانات التواصل وإطلاق الحملة التنفيذية"
                  : "Candidate Contact Routing & Final Checkout"}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? "أدخل اسمك وبريدك الشخصي الذي ستصل إليه ردود ودعوات المقابلات مباشرة من إدارات التوظيف."
                  : "Enter your full name and personal email where HR interview invitations and replies will be routed directly."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Columns: Candidate Contact Form + Target Summary */}
              <div className="lg:col-span-2 space-y-5">
                {/* Contact Details Card */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-5 sm:p-6 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    {lang === "ar"
                      ? "01 — هوية المرشح وتوجيه الردود المباشرة (Reply-To)"
                      : "01 — Candidate Identity & Direct HR Reply Routing"}
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{t.candidateNameLabel} *</span>
                      </label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "مثال: محمد العتيبي"
                            : "e.g. Mohammed Al-Otaibi"
                        }
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{t.candidateEmailLabel} *</span>
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{t.candidatePhoneLabel} *</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder={`${selectedCountry.phone_prefix} 50 123 4567`}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        <EyeOff className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>
                          {lang === "ar"
                            ? "استثناء شركتك الحالية (اختياري)"
                            : "Exclude Current Employer (Optional)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={excludedEmployerDomain}
                        onChange={(e) =>
                          setExcludedEmployerDomain(e.target.value)
                        }
                        placeholder="currentcompany.ae"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Breakdown & Promo Code */}
                <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      {lang === "ar"
                        ? "02 — ملخص النطاق والملف المرفق"
                        : "02 — Scope & Attached Dossier"}
                    </h4>
                    <span className="rounded bg-[#09090B] dark:bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                      {totalCompaniesToReach}{" "}
                      {lang === "ar" ? "شركة مستهدفة" : "Target Employers"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                    <div className="rounded-lg bg-white dark:bg-[#121215] p-3.5 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang === "ar" ? "الأسواق المستهدفة" : "Target Markets"}
                      </p>
                      <p className="mt-1 font-bold text-zinc-950 dark:text-zinc-50">
                        {lang === "ar"
                          ? selectedCountry.name_ar
                          : selectedCountry.name_en}
                        {extraCountries.length > 0 &&
                          ` + ${extraCountries.join(", ")}`}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-[#121215] p-3.5 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang === "ar" ? "المسمى الوظيفي" : "Target Role"}
                      </p>
                      <p className="mt-1 font-bold text-zinc-950 dark:text-zinc-50 truncate">
                        {jobTitle || "Specialist"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-[#121215] p-3.5 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang === "ar" ? "ملف السيرة الذاتية" : "Attached CV"}
                      </p>
                      <p className="mt-1 font-bold text-zinc-950 dark:text-[#D4AF37] truncate">
                        {cvFileName || "CV.pdf"}
                      </p>
                    </div>
                  </div>

                  {/* Promo Code Box */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder={t.promoCodePlaceholder}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="btn-carbon rounded-lg px-5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      {t.applyPromoBtn}
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-xs font-bold text-zinc-950 dark:text-[#D4AF37]">
                      ✓{" "}
                      {lang === "ar"
                        ? `تم تطبيق كود الخصم (${appliedPromo.code}) بنجاح — خصم ${appliedPromo.percent}%!`
                        : `Promo code (${appliedPromo.code}) applied — ${appliedPromo.percent}% OFF!`}
                    </p>
                  )}
                  {promoError && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      {promoError}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Calculation Carbon Box */}
              <div className="flex flex-col justify-between rounded-xl bg-[#09090B] dark:bg-[#16161A] border border-zinc-800 p-6 text-zinc-50">
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#D4AF37]">
                    {lang === "ar" ? "ملخص السداد" : "Order Summary"}
                  </h4>

                  <div className="flex justify-between text-sm text-zinc-300">
                    <span>
                      {lang === "ar"
                        ? activePackage.name_ar
                        : activePackage.name_en}
                    </span>
                    <span className="font-bold text-white">
                      {basePrice} {currencySymbol}
                    </span>
                  </div>

                  {extraCountries.length > 0 && (
                    <div className="flex justify-between text-sm text-[#D4AF37]">
                      <span>
                        + {extraCountries.length}{" "}
                        {lang === "ar" ? "أسواق إضافية" : "Extra GCC Markets"}
                      </span>
                      <span className="font-bold">
                        {addonTotal} {currencySymbol}
                      </span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-[#D4AF37] font-bold">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>
                        -{discountAmount} {currencySymbol}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-4 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-zinc-200">
                      {lang === "ar" ? "الإجمالي المستحق:" : "Total Due:"}
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37] tabular-nums">
                      {finalTotal}{" "}
                      <span className="text-sm font-bold text-zinc-200">
                        {currencySymbol}
                      </span>
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="my-3 rounded-lg bg-red-950/60 border border-red-500/40 p-3 text-xs font-bold text-red-200">
                    {checkoutError}
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={isSubmittingCheckout}
                    onClick={handleProceedToEasyKash}
                    className="btn-gold flex w-full items-center justify-center gap-2 rounded-lg px-5 py-4 text-sm font-extrabold cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingCheckout ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    <span>{t.payWithEasyKashBtn}</span>
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 text-center">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                    <span>{t.securePaymentNote}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {t.prevStepBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
