// ==============================================================================
// WAZAYEF GCC — Core TypeScript Domain Models
// ==============================================================================

export type CountryCode = "AE" | "SA" | "QA" | "KW";
export type Language = "ar" | "en";
export type CurrencyCode = "AED" | "SAR" | "QAR" | "KWD" | "EGP" | "USD";

export interface CityInfo {
  id: string;
  name_ar: string;
  name_en: string;
  companies_count: number;
}

export interface CountryConfig {
  code: CountryCode;
  name_ar: string;
  name_en: string;
  flag_emoji: string;
  currency_code: CurrencyCode;
  currency_symbol_ar: string;
  currency_symbol_en: string;
  phone_prefix: string;
  cities: CityInfo[];
  display_companies_count: number;
  hero_badge_ar: string;
  hero_badge_en: string;
  is_active: boolean;
  sort_order: number;
}

export interface Industry {
  id: string;
  name_ar: string;
  name_en: string;
  icon_name: string;
  keywords: string[];
  sort_order: number;
}

export interface CompanyRecord {
  id: string;
  company_name: string;
  hr_email: string;
  country_code: CountryCode;
  city_id: string;
  city_name_ar: string;
  city_name_en: string;
  industry_id: string;
  sub_specialty: string;
  company_size: string;
  is_verified: boolean;
  is_active: boolean;
  last_contacted_at: string | null;
  total_emails_received: number;
  created_at: string;
}

export type PackageId = "starter" | "pro" | "ultimate";

export interface PackageTier {
  id: PackageId;
  name_ar: string;
  name_en: string;
  tagline_ar: string;
  tagline_en: string;
  company_limit: number;
  includes_cover_letter: boolean;
  includes_cv_rewrite: boolean;
  includes_priority_queue: boolean;
  prices_by_currency: Record<CurrencyCode, number>;
  addon_country_price_by_currency: Record<CurrencyCode, number>;
  features_ar: string[];
  features_en: string[];
  is_featured: boolean;
  sort_order: number;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type CampaignStatus =
  | "awaiting_payment"
  | "optimizing_ai"
  | "distributing"
  | "completed"
  | "paused";

export interface CvScanResult {
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  detected_industry_id: string;
  job_title: string;
  years_experience: number;
  detected_skills: string[];
  ats_score: number;
  matched_companies_count: number;
  stored_cv_url?: string;
  has_text_layer?: boolean;
  sample_matched_companies: Array<{
    company_name: string;
    city_ar: string;
    city_en: string;
    sub_specialty: string;
  }>;
  summary_ar: string;
  summary_en: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  company_id: string;
  company_name: string;
  masked_hr_email: string;
  country_code: CountryCode;
  city_name_ar: string;
  city_name_en: string;
  industry_id: string;
  status: "queued" | "sending" | "sent" | "opened" | "failed";
  sent_at: string | null;
}

export interface CampaignRecord {
  id: string;
  tracking_token: string;
  customer_reference: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  preferred_lang: Language;
  primary_country_code: CountryCode;
  extra_country_codes: CountryCode[];
  selected_cities: string[];
  industry_id: string;
  job_title: string;
  years_experience: number;
  cv_file_name: string;
  original_cv_url: string | null;
  optimized_cv_text: string | null;
  generated_cover_letter: string | null;
  detected_skills: string[];
  ats_score: number;
  package_id: PackageId;
  total_target_companies: number;
  emails_sent_count: number;
  emails_opened_count: number;
  payment_status: PaymentStatus;
  campaign_status: CampaignStatus;
  easykash_ref: string | null;
  easykash_product_code: string | null;
  easykash_voucher: string | null;
  payment_method: string | null;
  promo_code: string | null;
  amount_original: number;
  amount_paid: number;
  currency: CurrencyCode;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  recipients?: CampaignRecipient[];
}

// EasyKash DirectPayV1 API Types
export interface EasyKashDirectPayRequest {
  amount: number;
  currency: CurrencyCode;
  paymentOptions?: number[];
  cashExpiry: number;
  name: string;
  email: string;
  mobile: string;
  redirectUrl: string;
  customerReference: string;
}

export interface EasyKashCallbackPayload {
  ProductCode?: string;
  PaymentMethod?: string;
  ProductType?: string;
  Amount?: string | number;
  BuyerEmail?: string;
  BuyerMobile?: string;
  BuyerName?: string;
  Timestamp?: string | number;
  status?: string; // 'PAID' | 'SUCCESS' | 'DELIVERED' | 'FAILED' | 'EXPIRED'
  voucher?: string;
  easykashRef?: string;
  VoucherData?: string;
  customerReference?: string;
  signatureHash?: string;
}

export interface SmtpAccountConfig {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_email: string;
  from_name: string;
  daily_limit: number;
  sent_today: number;
  last_reset_date: string;
  is_active: boolean;
  created_at: string;
}

