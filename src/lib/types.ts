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
  secondary_industries?: string[];
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
  original_prices_by_currency?: Record<CurrencyCode, number>;
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

// ==============================================================================
// Automated GCC Jobs Board, Search Ranking & Employer Portal Models
// ==============================================================================

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "REMOTE";

export type JobSourceType =
  | "employer_direct"
  | "verified_harvester"
  | "admin_curated";

export type JobPostingStatus =
  | "published"
  | "pending_review"
  | "expired"
  | "rejected";

export type JobSortOption = "rank" | "newest" | "salary" | "verified";

export interface JobPostingRecord {
  id: string;
  slug: string;
  dedupe_hash: string;
  title_ar: string;
  title_en: string;
  company_name: string;
  company_domain: string;
  company_website?: string | null;
  apply_email?: string | null;
  masked_apply_email?: string | null;
  apply_url?: string | null;
  apply_whatsapp?: string | null;
  country_code: CountryCode;
  city_id: string;
  city_name_ar: string;
  city_name_en: string;
  industry_id: string;
  secondary_industries?: string[];
  employment_type: EmploymentType;
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency: CurrencyCode;
  summary_ar: string;
  summary_en: string;
  requirements_ar: string[];
  requirements_en: string[];
  skills: string[];
  source_type: JobSourceType;
  source_channel?: string | null;
  is_mx_verified: boolean;
  is_featured: boolean;
  quality_score: number;
  views_count: number;
  apply_clicks_count: number;
  status: JobPostingStatus;
  fb_post_id?: string | null;
  fb_posted_at?: string | null;
  ig_post_id?: string | null;
  ig_posted_at?: string | null;
  tg_message_id?: string | null;
  tg_posted_at?: string | null;
  published_at: string;
  expires_at: string;
  created_at: string;
  rank_score?: number;
}

export interface JobSearchParams {
  q?: string;
  country?: CountryCode | "";
  city?: string;
  industry?: string;
  employmentType?: EmploymentType | "";
  verifiedOnly?: boolean;
  sort?: JobSortOption;
  page?: number;
  limit?: number;
  includePending?: boolean;
}

export interface JobSearchResponse {
  jobs: JobPostingRecord[];
  total: number;
  page: number;
  totalPages: number;
  totalActiveJobs: number;
  countsByCountry: Record<CountryCode, number>;
  countsByIndustry: Record<string, number>;
}

// ==============================================================================
// Dynamic Discount Coupons, Limited-Time Offers & Support Chatbot Leads
// ==============================================================================

export type CouponDiscountType = "percent" | "fixed";

export interface CouponRecord {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  applicable_packages: PackageId[] | "all";
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  note?: string;
  created_at: string;
}

export interface OfferSettings {
  enabled: boolean;
  badge_ar: string;
  badge_en: string;
  headline_ar: string;
  headline_en: string;
  ends_at: string | null;
  evergreen_hours: number;
  highlight_coupon_code?: string | null;
}

export type SupportLeadTopic =
  | "pricing"
  | "campaign_help"
  | "employer_hr"
  | "payment"
  | "general";

export type SupportLeadStatus = "new" | "contacted" | "resolved";

export interface SupportLeadRecord {
  id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  topic: SupportLeadTopic;
  message: string;
  page_url: string;
  status: SupportLeadStatus;
  created_at: string;
}



