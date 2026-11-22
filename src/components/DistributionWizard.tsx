"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { trackGaEvent } from "@/components/GoogleAnalytics";
import { OfferCountdownBanner } from "@/components/OfferCountdownBanner";
import {
  CountryCode,
  CouponDiscountType,
  CvScanResult,
  PackageId,
} from "@/lib/types";
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
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  X,
} from "lucide-react";

const WIZARD_DRAFT_STORAGE_KEY = "asra3_wizard_draft_v1";

interface WizardDraftSnapshot {
  step?: 1 | 2 | 3 | 4;
  selectedCountryCode?: CountryCode;
  selectedCities?: string[];
  extraCountries?: CountryCode[];
  selectedIndustryId?: string;
  jobTitle?: string;
  yearsExp?: number;
  customSkills?: string[];
  selectedPackageId?: PackageId;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  excludedEmployerDomain?: string;
  cvFileName?: string;
  storedCvUrl?: string | null;
  scanResult?: CvScanResult | null;
}

interface DistributionWizardProps {
  externalPackageId?: PackageId | null;
  externalSelectSignal?: number;
}

export function DistributionWizard({
  externalPackageId,
  externalSelectSignal = 0,
}: DistributionWizardProps) {
  const {
    lang,
    t,
    countries,
    industries,
    packages,
    offerSettings,
    selectedCountryCode,
    selectCountry,
    selectedCountry,
  } = useApp();

  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredDraftRef = useRef(false);
  const preserveCitiesOnCountrySyncRef = useRef(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [stepNotice, setStepNotice] = useState<string | null>(null);
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
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_type: CouponDiscountType;
    discount_value: number;
    discountAmount: number;
  } | null>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Concurrency & race-condition guards
  const prevCountryCodeRef = useRef<CountryCode>(selectedCountryCode);
  const pendingCityPrefillRef = useRef<{
    country: CountryCode;
    city: string;
  } | null>(null);
  const cvScanSeqRef = useRef(0);
  const cvScanAbortRef = useRef<AbortController | null>(null);
  const promoSeqRef = useRef(0);
  const promoAbortRef = useRef<AbortController | null>(null);
  const checkoutLockRef = useRef(false);

  const navigateToStep = useCallback((targetStep: 1 | 2 | 3 | 4) => {
    setStepNotice(null);
    setStep(targetStep);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        wizardTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, []);

  // Sync external pricing selection cleanly without wiping user step or CV
  useEffect(() => {
    if (externalPackageId) {
      setSelectedPackageId(externalPackageId);
    }
    if (externalSelectSignal > 0 && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        wizardTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [externalPackageId, externalSelectSignal]);

  // Clean up any in-flight requests on unmount
  useEffect(() => {
    return () => {
      cvScanAbortRef.current?.abort();
      promoAbortRef.current?.abort();
    };
  }, []);

  // Restore draft state & apply explicit URL prefill params once on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qCountry = (params.get("country") || "").toUpperCase();
    const qCity = (params.get("city") || "").trim().toLowerCase();
    const qInd = (params.get("industry") || "").trim();
    const qRole = (params.get("role") || "").trim();
    const hasValidUrlCountry = ["AE", "SA", "QA", "KW"].includes(qCountry);
    const hasRouteCountry = /^\/(?:ae|sa|qa|kw)(?:\/|$)/i.test(
      window.location.pathname
    );

    let draft: WizardDraftSnapshot | null = null;
    try {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
      if (raw) {
        draft = JSON.parse(raw) as WizardDraftSnapshot;
      }
    } catch {
      draft = null;
    }

    if (draft) {
      if (draft.jobTitle) setJobTitle(draft.jobTitle);
      if (typeof draft.yearsExp === "number") {
        setYearsExp(Math.max(0, Math.min(40, draft.yearsExp)));
      }
      if (draft.selectedIndustryId && industries.some((i) => i.id === draft.selectedIndustryId)) {
        setSelectedIndustryId(draft.selectedIndustryId);
      }
      if (Array.isArray(draft.customSkills) && draft.customSkills.length > 0) {
        setCustomSkills(draft.customSkills);
      }
      if (
        draft.selectedPackageId &&
        ["starter", "pro", "ultimate"].includes(draft.selectedPackageId) &&
        !externalPackageId
      ) {
        setSelectedPackageId(draft.selectedPackageId);
      }
      if (draft.candidateName) setCandidateName(draft.candidateName);
      if (draft.candidateEmail) setCandidateEmail(draft.candidateEmail);
      if (draft.candidatePhone) setCandidatePhone(draft.candidatePhone);
      if (draft.excludedEmployerDomain) {
        setExcludedEmployerDomain(draft.excludedEmployerDomain);
      }
      if (draft.cvFileName) setCvFileName(draft.cvFileName);
      if (draft.storedCvUrl) setStoredCvUrl(draft.storedCvUrl);
      if (draft.scanResult) setScanResult(draft.scanResult);
      if (Array.isArray(draft.extraCountries)) {
        setExtraCountries(draft.extraCountries);
      }
      if (draft.step && [1, 2, 3, 4].includes(draft.step)) {
        if (draft.step <= 2 || Boolean(draft.cvFileName)) {
          setStep(draft.step);
        }
      }
    }

    const effectiveCountry = (
      hasValidUrlCountry
        ? qCountry
        : !hasRouteCountry &&
          draft?.selectedCountryCode &&
          ["AE", "SA", "QA", "KW"].includes(draft.selectedCountryCode)
        ? draft.selectedCountryCode
        : selectedCountryCode
    ) as CountryCode;

    const effectiveCountryObj =
      countries.find((c) => c.code === effectiveCountry) || selectedCountry;
    const validCityIds = new Set(effectiveCountryObj.cities.map((c) => c.id));

    if (qCity && validCityIds.has(qCity)) {
      preserveCitiesOnCountrySyncRef.current = true;
      setSelectedCities([qCity]);
      pendingCityPrefillRef.current = { country: effectiveCountry, city: qCity };
    } else if (
      draft &&
      Array.isArray(draft.selectedCities) &&
      draft.selectedCities.some((id) => validCityIds.has(id))
    ) {
      preserveCitiesOnCountrySyncRef.current = true;
      setSelectedCities(draft.selectedCities.filter((id) => validCityIds.has(id)));
    } else if (qCity) {
      pendingCityPrefillRef.current = { country: effectiveCountry, city: qCity };
    }

    if (effectiveCountry !== selectedCountryCode) {
      selectCountry(effectiveCountry, { shallow: true });
    }

    if (qInd && industries.some((i) => i.id === qInd)) {
      setSelectedIndustryId(qInd);
    }
    if (qRole) {
      setJobTitle(qRole);
    }

    hasRestoredDraftRef.current = true;

    if (
      window.location.hash === "#wizard-section" ||
      hasValidUrlCountry ||
      qInd ||
      qRole
    ) {
      requestAnimationFrame(() => {
        const el = document.getElementById("wizard-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save serializable draft snapshot cleanly in sessionStorage (survives mobile reloads/picker)
  useEffect(() => {
    if (!hasRestoredDraftRef.current || typeof window === "undefined") return;
    try {
      const snapshot: WizardDraftSnapshot = {
        step,
        selectedCountryCode,
        selectedCities,
        extraCountries,
        selectedIndustryId,
        jobTitle,
        yearsExp,
        customSkills,
        selectedPackageId,
        candidateName,
        candidateEmail,
        candidatePhone,
        excludedEmployerDomain,
        cvFileName,
        storedCvUrl,
        scanResult,
      };
      sessionStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    step,
    selectedCountryCode,
    selectedCities,
    extraCountries,
    selectedIndustryId,
    jobTitle,
    yearsExp,
    customSkills,
    selectedPackageId,
    candidateName,
    candidateEmail,
    candidatePhone,
    excludedEmployerDomain,
    cvFileName,
    storedCvUrl,
    scanResult,
  ]);

  // Sync default cities & phone prefix ONLY when selectedCountryCode actually changes
  useEffect(() => {
    const countryChanged = prevCountryCodeRef.current !== selectedCountryCode;
    prevCountryCodeRef.current = selectedCountryCode;

    const countryObj =
      countries.find((c) => c.code === selectedCountryCode) || selectedCountry;
    const allCityIds = countryObj.cities.map((c) => c.id);

    const pending = pendingCityPrefillRef.current;
    if (
      pending &&
      pending.country === selectedCountryCode &&
      allCityIds.includes(pending.city)
    ) {
      setSelectedCities([pending.city]);
      pendingCityPrefillRef.current = null;
    } else if (preserveCitiesOnCountrySyncRef.current) {
      preserveCitiesOnCountrySyncRef.current = false;
    } else if (countryChanged || selectedCities.length === 0) {
      setSelectedCities(allCityIds);
    }

    setExtraCountries((prev) =>
      prev.filter((code) => code !== selectedCountryCode)
    );
    setCandidatePhone((prev) => {
      const stripped = prev.trim();
      if (!stripped || /^\+\d{2,4}$/.test(stripped)) {
        return `${countryObj.phone_prefix} `;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryCode]);

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
    cvScanAbortRef.current?.abort();
    const controller = new AbortController();
    cvScanAbortRef.current = controller;
    const seq = ++cvScanSeqRef.current;

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
        signal: controller.signal,
      });

      const data = await res.json();
      if (seq !== cvScanSeqRef.current) return;
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
      trackGaEvent("cv_scan_complete", {
        country: selectedCountryCode,
        industry: typed.detected_industry_id,
        ats_score: typed.ats_score,
      });
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
      if (
        (err instanceof Error && err.name === "AbortError") ||
        seq !== cvScanSeqRef.current
      ) {
        return;
      }
      console.error("Scan failed:", err);
      setStep2Error(
        lang === "ar"
          ? "حدث خطأ أثناء رفع السيرة الذاتية. يرجى المحاولة مرة أخرى."
          : "Network error while uploading CV. Please try again."
      );
    } finally {
      if (seq === cvScanSeqRef.current) {
        setIsScanning(false);
      }
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
    e.target.value = "";
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
    navigateToStep(3);
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

  const validatePromoAgainstServer = async (
    rawCode: string,
    pkgId: PackageId,
    currentSubtotal: number
  ) => {
    const code = rawCode.trim().toUpperCase();
    promoAbortRef.current?.abort();
    const seq = ++promoSeqRef.current;

    if (!code) {
      setAppliedPromo(null);
      setPromoError(null);
      setValidatingPromo(false);
      return;
    }

    const controller = new AbortController();
    promoAbortRef.current = controller;
    setValidatingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          packageId: pkgId,
          subtotal: currentSubtotal,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (seq !== promoSeqRef.current) return;
      if (data?.valid) {
        setAppliedPromo({
          code: data.code,
          discount_type: data.discount_type || "percent",
          discount_value: Number(data.discount_value) || 0,
          discountAmount: Number(data.discountAmount) || 0,
        });
        setPromoError(null);
      } else {
        setAppliedPromo(null);
        const reason = data?.errorReason;
        if (reason === "expired") {
          setPromoError(
            lang === "ar"
              ? "انتهت صلاحية كود الخصم هذا."
              : "This coupon code has expired."
          );
        } else if (reason === "max_uses_reached") {
          setPromoError(
            lang === "ar"
              ? "تم استنفاد الحد الأقصى لاستخدام هذا الكوبون."
              : "This coupon has reached its maximum usage limit."
          );
        } else if (reason === "package_not_eligible") {
          setPromoError(
            lang === "ar"
              ? "هذا الكوبون غير مخصص للباقة المختارة حالياً."
              : "This coupon is not valid for the selected package."
          );
        } else {
          setPromoError(
            lang === "ar"
              ? "كود الخصم غير صالح أو غير مفعّل."
              : "Invalid or inactive promo code."
          );
        }
      }
    } catch (err) {
      if (
        (err instanceof Error && err.name === "AbortError") ||
        seq !== promoSeqRef.current
      ) {
        return;
      }
      setPromoError(
        lang === "ar"
          ? "تعذّر التحقق من كود الخصم، حاول مرة أخرى."
          : "Could not verify promo code, please try again."
      );
    } finally {
      if (seq === promoSeqRef.current) {
        setValidatingPromo(false);
      }
    }
  };

  const handleApplyPromo = () => {
    void validatePromoAgainstServer(promoCode, selectedPackageId, subtotal);
  };

  useEffect(() => {
    if (!appliedPromo?.code) return;
    void validatePromoAgainstServer(
      appliedPromo.code,
      selectedPackageId,
      subtotal
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageId, subtotal]);

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
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

    if (checkoutLockRef.current) return;
    checkoutLockRef.current = true;
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

      if (typeof window !== "undefined") {
        if (data.trackingToken) {
          localStorage.setItem("asra3_last_token", data.trackingToken);
          localStorage.setItem("wazayef_last_token", data.trackingToken);
        }
        try {
          sessionStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }

      trackGaEvent("begin_checkout", {
        package_id: selectedPackageId,
        country: selectedCountryCode,
        currency,
        value: finalTotal,
      });

      window.location.href = data.redirectUrl;
    } catch (err) {
      checkoutLockRef.current = false;
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to initialize payment"
      );
      setIsSubmittingCheckout(false);
    }
  };

  const wizardStepsMeta: Array<{
    num: 1 | 2 | 3 | 4;
    index: string;
    label: string;
    shortLabel: string;
  }> = [
    {
      num: 1,
      index: "01",
      label: t.step1Title,
      shortLabel: lang === "ar" ? "السوق" : "Market",
    },
    {
      num: 2,
      index: "02",
      label: t.step2Title,
      shortLabel: lang === "ar" ? "الـ CV" : "CV Scan",
    },
    {
      num: 3,
      index: "03",
      label: t.step3Title,
      shortLabel: lang === "ar" ? "الباقة" : "Plan",
    },
    {
      num: 4,
      index: "04",
      label: t.step4Title,
      shortLabel: lang === "ar" ? "الدفع" : "Pay",
    },
  ];

  const hasUploadedCv = Boolean(cvFile || cvFileName);
  const currentStepMeta = wizardStepsMeta[step - 1];
  const shortTierLabel =
    activePackage.name_en
      .split(/[—–-]/)[0]
      .replace(/^Asra3\s+/i, "")
      .trim() || activePackage.id.toUpperCase();

  const handleStepperClick = (targetNum: 1 | 2 | 3 | 4) => {
    if (targetNum === step) return;
    if (targetNum < step || targetNum === 2 || (targetNum > 2 && hasUploadedCv)) {
      navigateToStep(targetNum);
      return;
    }
    setStepNotice(
      lang === "ar"
        ? "ارفع سيرتك الذاتية في الخطوة 2 أولاً لتخصيص الباقة وإتمام الدفع."
        : "Upload your CV in Step 2 first to customize your plan and complete checkout."
    );
  };

  // Deliberately NO overflow-hidden on root card so the sticky step action bar attaches smoothly
  return (
    <div
      ref={wizardTopRef}
      className="scroll-mt-24 mx-auto max-w-5xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-[0_20px_50px_rgba(9,9,11,0.06)] dark:shadow-none transition-colors"
    >
      {/* Hidden native file input kept outside clickable containers to prevent accidental picker opening on touch */}
      <input
        id="asra3-cv-file-input"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onFileSelected}
        className="sr-only"
      />

      {/* Top Carbon Stepper Bar */}
      <div className="rounded-t-2xl bg-[#09090B] dark:bg-[#16161A] px-4 py-4 sm:px-8 text-zinc-50 border-b border-zinc-800 space-y-3">
        {/* Compact Mobile Stepper Header */}
        <div className="sm:hidden space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                {lang === "ar"
                  ? `الخطوة ${step} من 4`
                  : `Step ${step} of 4`}
              </span>
              <h3 className="text-sm font-extrabold text-white leading-snug">
                {currentStepMeta.label}
              </h3>
            </div>
            <span
              dir="ltr"
              className="shrink-0 rounded-md border border-[#D4AF37]/50 bg-[#121215] px-2.5 py-1 text-[11px] font-mono font-extrabold text-[#D4AF37]"
            >
              {shortTierLabel} · {finalTotal} {currency}
            </span>
          </div>

          {/* 4-Segment Progress Rail */}
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className={`h-1.5 rounded-full transition-colors ${
                  seg <= step ? "bg-[#D4AF37]" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Touch-Friendly 4-Tab Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {wizardStepsMeta.map((item) => {
              const isCurrent = step === item.num;
              const isDone = step > item.num;
              const isLocked = item.num > 2 && !hasUploadedCv;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => handleStepperClick(item.num)}
                  className={`flex min-h-[40px] items-center justify-center gap-1 rounded-lg px-1.5 text-[11px] font-extrabold transition-colors cursor-pointer touch-manipulation ${
                    isCurrent
                      ? "bg-[#D4AF37] text-[#09090B]"
                      : isDone
                      ? "bg-zinc-900 text-zinc-100 border border-[#D4AF37]/50"
                      : isLocked
                      ? "bg-[#121215] text-zinc-500 border border-zinc-800"
                      : "bg-[#121215] text-zinc-300 border border-zinc-700"
                  }`}
                >
                  {isLocked ? (
                    <Lock className="h-3 w-3 shrink-0" />
                  ) : isDone ? (
                    <Check className="h-3 w-3 shrink-0 text-[#D4AF37]" />
                  ) : (
                    <span dir="ltr" className="font-mono text-[10px]">
                      {item.num}
                    </span>
                  )}
                  <span className="truncate">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Stepper Row */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-2.5">
          {wizardStepsMeta.map((item) => {
            const isCurrent = step === item.num;
            const isDone = step > item.num;
            const isLocked = item.num > 2 && !hasUploadedCv;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => handleStepperClick(item.num)}
                className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors text-start cursor-pointer ${
                  isCurrent
                    ? "bg-[#D4AF37] text-[#09090B]"
                    : isDone
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-700 hover:border-[#D4AF37]"
                    : isLocked
                    ? "bg-[#121215] text-zinc-500 border border-zinc-800/80 hover:border-zinc-700"
                    : "bg-[#121215] text-zinc-300 border border-zinc-800 hover:border-[#D4AF37]"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
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
                </span>
                {isLocked && <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* Clear Inline Notice When Tapping Locked Steps */}
        {stepNotice && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#121215] px-3.5 py-2 text-xs font-bold text-[#D4AF37]">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{stepNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => navigateToStep(2)}
              className="rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-extrabold text-[#09090B] cursor-pointer touch-manipulation"
            >
              {lang === "ar" ? "انتقل للخطوة 2" : "Go to Step 2"}
            </button>
          </div>
        )}
      </div>

      {/* Step Content Body */}
      <div key={step} className="p-4 sm:p-8 lg:p-10 animate-panel-enter">
        {/* ================= STEP 1: COUNTRY & CITIES LOCALIZATION ================= */}
        {step === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                    {t.selectCountryLabel}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    {lang === "ar"
                      ? "يتكيف النظام تلقائياً مع قوائم الشركات وعملة الدفع والمدن الخاصة بالسوق المختار."
                      : "Directories, active cities, and local currency adapt automatically to your chosen Gulf market."}
                  </p>
                </div>
                <span
                  dir="ltr"
                  className="rounded-md bg-[#09090B] px-3 py-1.5 text-xs font-mono font-bold text-[#D4AF37]"
                >
                  {selectedCountry.code} · {selectedCountry.currency_code}
                </span>
              </div>

              {/* Compact 2x2 Mobile / 4x1 Desktop Country Cards (Shallow updates — zero page reloads!) */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
                {countries.map((c) => {
                  const active = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCountry(c.code, { shallow: true })}
                      className={`exec-card-interactive flex flex-col justify-between rounded-xl border p-3.5 sm:p-5 text-start cursor-pointer touch-manipulation ${
                        active
                          ? "border-2 border-[#09090B] bg-[#09090B] text-white dark:border-[#D4AF37] dark:bg-[#18181C]"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          dir="ltr"
                          className={`inline-flex h-7 w-9 sm:h-8 sm:w-10 items-center justify-center rounded-md font-mono text-xs font-extrabold ${
                            active
                              ? "bg-[#D4AF37] text-[#09090B]"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-[#D4AF37]"
                          }`}
                        >
                          {c.code}
                        </span>
                        <span
                          dir="ltr"
                          className={`rounded px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold ${
                            active
                              ? "bg-zinc-800 text-[#D4AF37]"
                              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {c.currency_code}
                        </span>
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <h4
                          className={`font-bold text-sm sm:text-base leading-snug ${
                            active
                              ? "text-white"
                              : "text-zinc-950 dark:text-zinc-50"
                          }`}
                        >
                          {lang === "ar" ? c.name_ar : c.name_en}
                        </h4>
                        <p
                          className={`mt-1 text-[11px] sm:text-xs font-semibold ${
                            active
                              ? "text-[#D4AF37]"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {c.display_companies_count.toLocaleString()}+{" "}
                          {lang === "ar" ? "شركة" : "Employers"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Selection Matrix */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
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
                  className="min-h-[36px] px-2 text-xs font-bold text-zinc-900 dark:text-[#D4AF37] hover:underline cursor-pointer touch-manipulation"
                >
                  {t.selectAllCities}
                </button>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {selectedCountry.cities.map((city) => {
                  const checked = selectedCities.includes(city.id);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                      className={`flex min-h-[46px] items-center justify-between gap-1.5 rounded-lg border px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer touch-manipulation ${
                        checked
                          ? "border-zinc-950 dark:border-[#D4AF37] bg-white dark:bg-[#16161A] text-zinc-950 dark:text-zinc-50"
                          : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-[#121215] text-zinc-500 dark:text-zinc-400 hover:border-zinc-400"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                            checked
                              ? "bg-[#09090B] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#09090B]"
                              : "border border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className="truncate">
                          {lang === "ar" ? city.name_ar : city.name_en}
                        </span>
                      </span>
                      <span className="shrink-0 rounded bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                        {city.companies_count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: UPLOAD CV & AI SECTOR MATCH ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "ارفع سيرتك الذاتية للفحص النصي وتحديد القطاع"
                  : "Upload Your CV for Instant ATS Audit & Sector Matching"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? `يقرأ محرك أسرع النص الفعلي لملفك ويطابق تخصصك مع جهات التوظيف في ${selectedCountry.name_ar}.`
                  : `Asra3 parses your actual CV text and matches your specialty with verified employers in ${selectedCountry.name_en}.`}
              </p>
            </div>

            {/* Mobile-Safe CV Upload Area: Only explicit CTA buttons open the native file dialog */}
            {isScanning ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#D4AF37] bg-zinc-50 dark:bg-[#09090B] p-8 text-center">
                <Loader2 className="h-9 w-9 animate-spin text-[#D4AF37]" />
                <p className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                  {t.scanningCvTitle}
                </p>
              </div>
            ) : cvFileName ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-2 border-zinc-900 dark:border-[#D4AF37] bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#09090B] text-[#D4AF37]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 truncate">
                      {cvFileName}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-[#09090B] px-2.5 py-0.5 text-[11px] font-bold text-[#D4AF37]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t.scanCompleteBadge}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition-colors cursor-pointer touch-manipulation"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{lang === "ar" ? "تغيير الملف" : "Replace CV"}</span>
                </button>
              </div>
            ) : (
              <div
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
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-9 text-center transition-colors ${
                  isDraggingFile
                    ? "border-[#D4AF37] bg-zinc-100 dark:bg-[#16161A]"
                    : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B]"
                }`}
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-[#09090B] text-[#D4AF37] border border-zinc-800">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                  {t.uploadBoxTitle}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {t.uploadBoxSubtitle}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-gold mt-4 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold cursor-pointer touch-manipulation"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>
                    {lang === "ar"
                      ? "اختر ملف PDF أو Word"
                      : "Choose PDF or Word File"}
                  </span>
                </button>
              </div>
            )}

            {step2Error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-bold text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{step2Error}</span>
              </div>
            )}

            {/* AI Scan Match Preview Card */}
            {scanResult && (
              <div className="rounded-xl border border-zinc-800 bg-[#09090B] dark:bg-[#16161A] p-4 sm:p-5 text-zinc-50">
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
                      <p
                        dir="auto"
                        className="font-bold text-white leading-snug text-start"
                      >
                        {comp.company_name}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {lang === "ar" ? comp.city_ar : comp.city_en}
                      </p>
                      {comp.sub_specialty && (
                        <p
                          dir="auto"
                          className="mt-0.5 text-[11px] font-medium text-[#D4AF37] leading-snug line-clamp-2 text-start"
                        >
                          {comp.sub_specialty}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Targeting Fields (16px font on mobile to avoid iOS zoom + Thumb Stepper) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t.detectedIndustryLabel} *
                </label>
                <select
                  value={selectedIndustryId}
                  onChange={(e) => setSelectedIndustryId(e.target.value)}
                  className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3.5 py-2.5 text-base sm:text-sm font-semibold text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
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
                  autoComplete="organization-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: مهندس مدني أول / مراقب مالي"
                      : "e.g. Senior Civil Engineer / Controller"
                  }
                  className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3.5 py-2.5 text-base sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {lang === "ar" ? "سنوات الخبرة" : "Years of Experience"}
                </label>
                <div className="flex min-h-[46px] items-center justify-between rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] p-1">
                  <button
                    type="button"
                    aria-label={lang === "ar" ? "إنقاص سنة" : "Decrease years"}
                    onClick={() => setYearsExp((y) => Math.max(0, y - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer touch-manipulation"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    dir="ltr"
                    className="font-mono text-base font-extrabold text-zinc-950 dark:text-[#D4AF37] tabular-nums"
                  >
                    {yearsExp} {lang === "ar" ? "سنة" : "yrs"}
                  </span>
                  <button
                    type="button"
                    aria-label={lang === "ar" ? "زيادة سنة" : "Increase years"}
                    onClick={() => setYearsExp((y) => Math.min(40, y + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
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
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md bg-white dark:bg-[#16161A] border border-zinc-300 dark:border-zinc-700 ps-3 pe-1.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${sk}`}
                      onClick={() => removeCustomSkill(sk)}
                      className="rounded p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer touch-manipulation"
                    >
                      <X className="h-3.5 w-3.5" />
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
                  className="flex-1 min-h-[44px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-3.5 py-2 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="btn-carbon inline-flex min-h-[44px] items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold cursor-pointer touch-manipulation"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{lang === "ar" ? "إضافة" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PACKAGE TIERS & MULTI-COUNTRY BUMP ================= */}
        {step === 3 && (
          <div className="space-y-7 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {t.choosePackageTitle}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? `الأسعار معروضة بعملة ${selectedCountry.name_ar} (${currencySymbol}) — اضغط زر الاختيار داخل الباقة المناسبة.`
                  : `Localized pricing displayed in ${selectedCountry.name_en} currency (${currencySymbol}) — tap the button inside a plan to select it.`}
              </p>

              <div className="mt-4">
                <OfferCountdownBanner
                  compact
                  onSelectCoupon={(code) => {
                    setPromoCode(code);
                    void validatePromoAgainstServer(
                      code,
                      selectedPackageId,
                      subtotal
                    );
                  }}
                />
              </div>

              {/* Package Cards: outer card NEVER has onClick so vertical touch scrolling cannot switch tiers */}
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {packages.map((pkg) => {
                  const selected = pkg.id === selectedPackageId;
                  const isFeatured = Boolean(pkg.is_featured);
                  const price =
                    pkg.prices_by_currency[currency] ??
                    pkg.prices_by_currency.AED;
                  const originalPrice =
                    pkg.original_prices_by_currency?.[currency] ??
                    pkg.original_prices_by_currency?.AED;
                  const showOfferDiscount =
                    offerSettings.enabled &&
                    Boolean(originalPrice && originalPrice > price);
                  const savePct =
                    showOfferDiscount && originalPrice
                      ? Math.round(
                          ((originalPrice - price) / originalPrice) * 100
                        )
                      : 0;
                  const features =
                    lang === "ar" ? pkg.features_ar : pkg.features_en;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col justify-between rounded-xl p-5 sm:p-6 transition-colors ${
                        isFeatured
                          ? selected
                            ? "bg-[#09090B] dark:bg-[#18181D] text-white border-2 border-[#D4AF37]"
                            : "bg-[#121215] text-white border border-zinc-800"
                          : selected
                          ? "bg-zinc-50 dark:bg-[#18181D] text-zinc-950 dark:text-white border-2 border-zinc-950 dark:border-[#D4AF37]"
                          : "bg-white dark:bg-[#09090B] text-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
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
                        <div className="flex items-start justify-between gap-2">
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
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-extrabold border transition-colors cursor-pointer touch-manipulation ${
                              selected
                                ? "bg-[#D4AF37] border-[#D4AF37] text-[#09090B]"
                                : isFeatured
                                ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-[#D4AF37]"
                                : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {selected
                              ? lang === "ar"
                                ? "✓ مختارة"
                                : "✓ Selected"
                              : lang === "ar"
                              ? "اختر"
                              : "Select"}
                          </button>
                        </div>

                        {showOfferDiscount && originalPrice && (
                          <div className="mt-3.5 flex items-center gap-2">
                            <span
                              dir="ltr"
                              className={`text-xs font-bold line-through tabular-nums ${
                                isFeatured
                                  ? "text-zinc-500"
                                  : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              {originalPrice} {currencySymbol}
                            </span>
                            <span className="rounded bg-[#D4AF37] px-2 py-0.5 text-[10px] font-extrabold text-[#09090B]">
                              {lang === "ar"
                                ? `وفر ${savePct}%`
                                : `SAVE ${savePct}%`}
                            </span>
                          </div>
                        )}

                        <div
                          className={`${
                            showOfferDiscount ? "mt-1" : "mt-4"
                          } flex items-baseline gap-1.5`}
                        >
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
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg py-2.5 text-xs font-extrabold transition-colors cursor-pointer touch-manipulation ${
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
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-6">
              <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <h4 className="font-bold text-sm sm:text-base">
                  {t.multiCountryBumpTitle}
                </h4>
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {t.multiCountryBumpDesc} (+{addonUnitPrice} {currencySymbol} /{" "}
                {lang === "ar" ? "لكل سوق إضافي" : "per extra market"})
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {countries
                  .filter((c) => c.code !== selectedCountryCode)
                  .map((c) => {
                    const added = extraCountries.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleExtraCountry(c.code)}
                        className={`flex min-h-[46px] items-center justify-between rounded-lg border px-4 py-3 text-xs font-bold transition-colors cursor-pointer touch-manipulation ${
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
          </div>
        )}

        {/* ================= STEP 4: CANDIDATE INFO, ORDER SUMMARY & CHECKOUT ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {lang === "ar"
                  ? "بيانات التواصل وإطلاق الحملة التنفيذية"
                  : "Candidate Contact Routing & Final Checkout"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {lang === "ar"
                  ? "أدخل اسمك وبريدك الشخصي الذي ستصل إليه ردود ودعوات المقابلات مباشرة من إدارات التوظيف."
                  : "Enter your full name and personal email where HR interview invitations and replies will be routed directly."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Columns: Candidate Contact Form + Target Summary */}
              <div className="lg:col-span-2 space-y-5">
                {/* Contact Details Card */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-6 space-y-4">
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
                        autoComplete="name"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "مثال: محمد العتيبي"
                            : "e.g. Mohammed Al-Otaibi"
                        }
                        className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2.5 text-base sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
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
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2.5 text-base sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
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
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder={`${selectedCountry.phone_prefix} 50 123 4567`}
                        className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2.5 text-base sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
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
                        className="w-full min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2.5 text-base sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Breakdown & Promo Code */}
                <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-4 sm:p-6">
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
                      dir="ltr"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder={t.promoCodePlaceholder}
                      className="flex-1 min-h-[46px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] px-4 py-2 text-base sm:text-sm font-medium uppercase text-zinc-950 dark:text-zinc-100 focus:border-zinc-950 dark:focus:border-[#D4AF37] focus:outline-none touch-manipulation"
                    />
                    <button
                      type="button"
                      disabled={validatingPromo}
                      onClick={handleApplyPromo}
                      className="btn-carbon min-h-[46px] rounded-lg px-5 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-60 touch-manipulation"
                    >
                      {validatingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t.applyPromoBtn
                      )}
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-xs font-bold text-zinc-950 dark:text-[#D4AF37]">
                      ✓{" "}
                      {appliedPromo.discount_type === "fixed"
                        ? lang === "ar"
                          ? `تم تطبيق كود الخصم (${appliedPromo.code}) بنجاح — خصم ${appliedPromo.discountAmount} ${currencySymbol}!`
                          : `Promo code (${appliedPromo.code}) applied — ${appliedPromo.discountAmount} ${currencySymbol} OFF!`
                        : lang === "ar"
                        ? `تم تطبيق كود الخصم (${appliedPromo.code}) بنجاح — خصم ${appliedPromo.discount_value}%!`
                        : `Promo code (${appliedPromo.code}) applied — ${appliedPromo.discount_value}% OFF!`}
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
              <div className="flex flex-col justify-between rounded-xl bg-[#09090B] dark:bg-[#16161A] border border-zinc-800 p-5 sm:p-6 text-zinc-50">
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

                <div className="mt-5 space-y-3">
                  {/* Desktop Pay button stays inside Order Summary; Mobile Pay lives in the unified sticky bottom bar */}
                  <button
                    type="button"
                    disabled={isSubmittingCheckout}
                    onClick={handleProceedToEasyKash}
                    className="hidden sm:flex btn-gold w-full items-center justify-center gap-2 rounded-lg px-5 py-4 text-sm font-extrabold cursor-pointer disabled:opacity-60"
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
          </div>
        )}
      </div>

      {/* ================= UNIFIED STICKY STEP ACTION BAR ================= */}
      <div className="sticky bottom-0 z-20 rounded-b-2xl border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-4 safe-pb">
        {step === 1 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#09090B] text-[#D4AF37]">
                <Building2 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  {lang === "ar"
                    ? "الشركات المستهدفة الآن:"
                    : "Verified employers:"}
                </p>
                <p className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white truncate tabular-nums">
                  <span className="text-[#9A7B1C] dark:text-[#D4AF37]">
                    {selectedCitiesCompanyCount.toLocaleString()}+
                  </span>{" "}
                  {lang === "ar" ? "شركة نشطة" : "Active"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateToStep(2)}
              className="btn-gold inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 sm:px-6 text-xs sm:text-sm font-extrabold cursor-pointer touch-manipulation"
            >
              <span>{t.nextStepBtn}</span>
              {lang === "ar" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigateToStep(1)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 sm:px-5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer touch-manipulation"
            >
              {t.prevStepBtn}
            </button>
            <button
              type="button"
              onClick={handleProceedFromStep2}
              className="btn-gold inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 sm:px-6 text-xs sm:text-sm font-extrabold cursor-pointer touch-manipulation"
            >
              <span>
                {lang === "ar" ? "اختيار الباقة" : "Choose Plan"}
              </span>
              {lang === "ar" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigateToStep(2)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 sm:px-5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer touch-manipulation"
            >
              {t.prevStepBtn}
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden xs:flex sm:flex flex-col text-end">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  {activePackage.name_en.replace("Asra3 ", "")}
                </span>
                <span
                  dir="ltr"
                  className="text-xs font-mono font-extrabold text-zinc-950 dark:text-[#D4AF37]"
                >
                  {finalTotal} {currencySymbol}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigateToStep(4)}
                className="btn-gold inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 sm:px-6 text-xs sm:text-sm font-extrabold cursor-pointer touch-manipulation"
              >
                <span>
                  {lang === "ar"
                    ? "المتابعة للدفع"
                    : "Continue to Checkout"}
                </span>
                {lang === "ar" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigateToStep(3)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-4 sm:px-5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer touch-manipulation"
            >
              {t.prevStepBtn}
            </button>

            <button
              type="button"
              disabled={isSubmittingCheckout}
              onClick={handleProceedToEasyKash}
              className="sm:hidden btn-gold flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-extrabold cursor-pointer disabled:opacity-60 touch-manipulation"
            >
              {isSubmittingCheckout ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              <span>
                {lang === "ar"
                  ? `ادفع الآن (${finalTotal} ${currencySymbol})`
                  : `Pay ${finalTotal} ${currencySymbol}`}
              </span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
              {lang === "ar"
                ? `الإجمالي جاهز للدفع الآمن: ${finalTotal} ${currencySymbol}`
                : `Ready for encrypted EasyKash checkout: ${finalTotal} ${currencySymbol}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
