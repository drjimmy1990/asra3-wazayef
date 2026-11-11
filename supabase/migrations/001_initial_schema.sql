-- ==============================================================================
-- WAZAYEF GCC — Multi-Country Localized CV Distribution & AI Recruitment SaaS
-- Complete Production SQL Setup (Paste & Run in Supabase SQL Editor)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Countries & Localization Configuration
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY, -- 'AE', 'SA', 'QA', 'KW'
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  currency_code TEXT NOT NULL, -- 'AED', 'SAR', 'QAR', 'KWD'
  currency_symbol_ar TEXT NOT NULL,
  currency_symbol_en TEXT NOT NULL,
  phone_prefix TEXT NOT NULL,
  cities JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_companies_count INT NOT NULL DEFAULT 500,
  hero_badge_ar TEXT,
  hero_badge_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Standardized Industries / Job Specializations
CREATE TABLE IF NOT EXISTS industries (
  id TEXT PRIMARY KEY, -- 'engineering', 'it-software', 'sales-marketing', etc.
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Briefcase',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 1
);

-- 3. Target Companies Directory (HR Database per Country & City)
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name TEXT NOT NULL,
  hr_email TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  city_id TEXT NOT NULL,
  city_name_ar TEXT NOT NULL,
  city_name_en TEXT NOT NULL,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  sub_specialty TEXT DEFAULT 'General Recruitment',
  company_size TEXT DEFAULT '100-500',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_contacted_at TIMESTAMPTZ,
  total_emails_received INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hr_email, country_code)
);

CREATE INDEX IF NOT EXISTS idx_companies_country_industry
  ON companies(country_code, industry_id, is_active);

-- 4. Pricing Packages
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY, -- 'starter', 'pro', 'ultimate'
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tagline_ar TEXT NOT NULL,
  tagline_en TEXT NOT NULL,
  company_limit INT NOT NULL, -- 100, 300, 500
  includes_cover_letter BOOLEAN NOT NULL DEFAULT false,
  includes_cv_rewrite BOOLEAN NOT NULL DEFAULT false,
  includes_priority_queue BOOLEAN NOT NULL DEFAULT false,
  prices_by_currency JSONB NOT NULL,
  addon_country_price_by_currency JSONB NOT NULL,
  features_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 1
);

-- 5. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses INT,
  current_uses INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Campaigns (Customer CV Distribution Orders)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tracking_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  customer_reference TEXT UNIQUE NOT NULL, -- Sent to EasyKash as customerReference
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT NOT NULL,
  preferred_lang TEXT NOT NULL DEFAULT 'ar' CHECK (preferred_lang IN ('ar', 'en')),
  primary_country_code TEXT NOT NULL REFERENCES countries(code),
  extra_country_codes TEXT[] NOT NULL DEFAULT '{}',
  selected_cities TEXT[] NOT NULL DEFAULT '{}',
  industry_id TEXT NOT NULL REFERENCES industries(id),
  job_title TEXT NOT NULL,
  years_experience INT NOT NULL DEFAULT 3,
  cv_file_name TEXT NOT NULL,
  original_cv_url TEXT,
  optimized_cv_text TEXT,
  generated_cover_letter TEXT,
  detected_skills TEXT[] NOT NULL DEFAULT '{}',
  ats_score INT NOT NULL DEFAULT 78,
  package_id TEXT NOT NULL REFERENCES packages(id),
  total_target_companies INT NOT NULL DEFAULT 100,
  emails_sent_count INT NOT NULL DEFAULT 0,
  emails_opened_count INT NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
  campaign_status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (campaign_status IN ('awaiting_payment', 'optimizing_ai', 'distributing', 'completed', 'paused')),
  easykash_ref TEXT,
  easykash_product_code TEXT,
  easykash_voucher TEXT,
  payment_method TEXT,
  promo_code TEXT,
  amount_original NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_campaigns_tracking_token ON campaigns(tracking_token);
CREATE INDEX IF NOT EXISTS idx_campaigns_customer_ref ON campaigns(customer_reference);
CREATE INDEX IF NOT EXISTS idx_campaigns_email ON campaigns(candidate_email);

-- 7. Campaign Recipients (Per-Company Delivery Log)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  masked_hr_email TEXT NOT NULL,
  country_code TEXT NOT NULL,
  city_name_ar TEXT NOT NULL,
  city_name_en TEXT NOT NULL,
  industry_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'opened', 'failed')),
  sent_at TIMESTAMPTZ,
  UNIQUE(campaign_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);

-- ==============================================================================
-- SEED DATA 1: 4 GCC Countries (UAE, KSA, Qatar, Kuwait)
-- ==============================================================================
INSERT INTO countries (code, name_ar, name_en, flag_emoji, currency_code, currency_symbol_ar, currency_symbol_en, phone_prefix, display_companies_count, hero_badge_ar, hero_badge_en, sort_order, cities)
VALUES
  (
    'AE',
    'الإمارات العربية المتحدة',
    'United Arab Emirates',
    '🇦🇪',
    'AED',
    'د.إ',
    'AED',
    '+971',
    1450,
    'أكثر من 1,450 شركة موثقة في دبي وأبوظبي والشارقة',
    '1,450+ Verified Companies across Dubai, Abu Dhabi & Sharjah',
    1,
    '[
      {"id": "dubai", "name_ar": "دبي", "name_en": "Dubai", "companies_count": 680},
      {"id": "abudhabi", "name_ar": "أبوظبي", "name_en": "Abu Dhabi", "companies_count": 420},
      {"id": "sharjah", "name_ar": "الشارقة", "name_en": "Sharjah", "companies_count": 190},
      {"id": "ajman", "name_ar": "عجمان", "name_en": "Ajman", "companies_count": 75},
      {"id": "rak", "name_ar": "رأس الخيمة", "name_en": "Ras Al Khaimah", "companies_count": 55},
      {"id": "fujairah", "name_ar": "الفجيرة", "name_en": "Fujairah", "companies_count": 30}
    ]'::jsonb
  ),
  (
    'SA',
    'المملكة العربية السعودية',
    'Saudi Arabia',
    '🇸🇦',
    'SAR',
    'ر.س',
    'SAR',
    '+966',
    2100,
    'أكثر من 2,100 شركة ومؤسسة توظف في الرياض وجدة والدمام ونيوم',
    '2,100+ Verified Employers across Riyadh, Jeddah, Dammam & NEOM',
    2,
    '[
      {"id": "riyadh", "name_ar": "الرياض", "name_en": "Riyadh", "companies_count": 980},
      {"id": "jeddah", "name_ar": "جدة", "name_en": "Jeddah", "companies_count": 540},
      {"id": "dammam", "name_ar": "الدمام والخبر", "name_en": "Dammam & Khobar", "companies_count": 340},
      {"id": "neom", "name_ar": "نيوم وتبوك", "name_en": "NEOM & Tabuk", "companies_count": 140},
      {"id": "makkah", "name_ar": "مكة والمدينة", "name_en": "Makkah & Madinah", "companies_count": 100}
    ]'::jsonb
  ),
  (
    'QA',
    'دولة قطر',
    'Qatar',
    '🇶🇦',
    'QAR',
    'ر.ق',
    'QAR',
    '+974',
    820,
    'أكثر من 820 شركة قطرية ودولية في الدوحة ولوسيل',
    '820+ Active Hiring Companies in Doha, Lusail & Al Wakrah',
    3,
    '[
      {"id": "doha", "name_ar": "الدوحة", "name_en": "Doha", "companies_count": 520},
      {"id": "lusail", "name_ar": "لوسيل", "name_en": "Lusail", "companies_count": 180},
      {"id": "alwakrah", "name_ar": "الوكرة", "name_en": "Al Wakrah", "companies_count": 70},
      {"id": "alkhor", "name_ar": "الخور", "name_en": "Al Khor", "companies_count": 50}
    ]'::jsonb
  ),
  (
    'KW',
    'دولة الكويت',
    'Kuwait',
    '🇰🇼',
    'KWD',
    'د.ك',
    'KWD',
    '+965',
    640,
    'أكثر من 640 شركة رائدة في مدينة الكويت وحولي والسالمية',
    '640+ Leading Employers in Kuwait City, Hawalli & Salmiya',
    4,
    '[
      {"id": "kuwaitcity", "name_ar": "مدينة الكويت", "name_en": "Kuwait City", "companies_count": 350},
      {"id": "hawalli", "name_ar": "حولي", "name_en": "Hawalli", "companies_count": 130},
      {"id": "salmiya", "name_ar": "السالمية", "name_en": "Salmiya", "companies_count": 95},
      {"id": "farwaniya", "name_ar": "الفروانية والأحمدي", "name_en": "Farwaniya & Ahmadi", "companies_count": 65}
    ]'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- SEED DATA 2: 12 Standardized Industries
-- ==============================================================================
INSERT INTO industries (id, name_ar, name_en, icon_name, keywords, sort_order)
VALUES
  ('engineering', 'الهندسة والمقاولات والإنشاءات', 'Engineering, Construction & MEP', 'HardHat', ARRAY['civil','mechanical','electrical','architect','engineer','mep','construction'], 1),
  ('it-software', 'تكنولوجيا المعلومات والبرمجيات والذكاء الاصطناعي', 'IT, Software, Cloud & AI', 'Code2', ARRAY['software','developer','frontend','backend','fullstack','devops','cyber','data','ai'], 2),
  ('sales-marketing', 'التسويق والمبيعات وتطوير الأعمال', 'Marketing, Digital Growth & Sales', 'TrendingUp', ARRAY['marketing','sales','digital','seo','social media','business development'], 3),
  ('finance-accounting', 'المحاسبة والمالية والبنوك والتدقيق', 'Finance, Accounting, Banking & Audit', 'Landmark', ARRAY['accountant','finance','auditor','cpa','cma','tax','banking'], 4),
  ('healthcare', 'الطب والرعاية الصحية والصيدلة', 'Healthcare, Medical & Pharmacy', 'HeartPulse', ARRAY['doctor','nurse','pharmacist','medical','dental','clinic','hospital'], 5),
  ('hospitality-retail', 'الضيافة والفنادق والسياحة والتجزئة', 'Hospitality, Hotels, F&B & Retail', 'Hotel', ARRAY['hotel','hospitality','restaurant','chef','retail','tourism'], 6),
  ('hr-admin', 'الموارد البشرية والإدارة والسكرتارية', 'HR, Administration & Executive Support', 'Users', ARRAY['hr','human resources','recruiter','admin','secretary'], 7),
  ('logistics-supply', 'سلاسل الإمداد واللوجستيات والمشتريات', 'Logistics, Supply Chain & Procurement', 'Truck', ARRAY['logistics','supply chain','procurement','warehouse','shipping'], 8),
  ('real-estate', 'العقارات وإدارة الأملاك والمرافق', 'Real Estate, Property & Facilities Management', 'Building2', ARRAY['real estate','property','broker','leasing','facilities'], 9),
  ('education', 'التعليم والتدريب الأكاديمي', 'Education, Teaching & Training', 'GraduationCap', ARRAY['teacher','professor','education','school','trainer'], 10),
  ('legal', 'الشؤون القانونية والمحاماة والعقود', 'Legal, Corporate Law & Compliance', 'Scale', ARRAY['lawyer','legal','counsel','compliance','contracts'], 11),
  ('design-media', 'التصميم الجرافيكي والإنتاج الإعلامي', 'Graphic Design, UI/UX & Media Production', 'Palette', ARRAY['designer','graphic','ui','ux','video editor','motion'], 12)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA 3: 3 Package Tiers (Starter, Pro, Ultimate)
-- ==============================================================================
INSERT INTO packages (id, name_ar, name_en, tagline_ar, tagline_en, company_limit, includes_cover_letter, includes_cv_rewrite, includes_priority_queue, prices_by_currency, addon_country_price_by_currency, features_ar, features_en, is_featured, sort_order)
VALUES
  (
    'starter',
    'الباقة الأساسية (Starter)',
    'Starter Distribution',
    'انطلاقة سريعة للوصول إلى 100 شركة في تخصصك',
    'Fast-track outreach to 100 verified HR departments in your field',
    100,
    false,
    false,
    false,
    '{"AED": 129, "SAR": 129, "QAR": 129, "KWD": 11, "EGP": 1690, "USD": 35}'::jsonb,
    '{"AED": 69, "SAR": 69, "QAR": 69, "KWD": 6, "EGP": 890, "USD": 19}'::jsonb,
    '["إرسال السيرة الذاتية إلى 100 شركة موثقة في مجالك", "استهداف دقيق حسب الدولة والمدن المختارة", "لوحة تحكم مباشرة لمتابعة حالة الإرسال لحظة بلحظة", "الردود تصل مباشرة إلى بريدك الإلكتروني الشخصي", "تقرير نهائي بالشركات التي استلمت سيرتك الذاتية"]'::jsonb,
    '["Distribute CV to 100 verified companies in your field", "Precision targeting by selected country & cities", "Live candidate dashboard with real-time progress bar", "HR replies go directly to your personal email inbox", "Final verified delivery log upon campaign completion"]'::jsonb,
    false,
    1
  ),
  (
    'pro',
    'الباقة الاحترافية (Pro — الأكثر طلباً)',
    'Pro Distribution + AI Cover Letter',
    'أعلى نسبة ردود ومقابلات مع خطاب تقديم ذكي مخصص لكل شركة',
    '3x higher interview rate with custom AI Cover Letter & 300 companies',
    300,
    true,
    false,
    true,
    '{"AED": 229, "SAR": 229, "QAR": 229, "KWD": 19, "EGP": 2950, "USD": 62}'::jsonb,
    '{"AED": 99, "SAR": 99, "QAR": 99, "KWD": 8, "EGP": 1250, "USD": 27}'::jsonb,
    '["إرسال السيرة الذاتية إلى 300 شركة موثقة في مجالك", "كتابة خطاب تقديم (Cover Letter) احترافي بالذكاء الاصطناعي مخصص لخبراتك", "أولوية قصوى في طابور الإرسال الذكي لأقسام الـ HR", "عنوان بريد إلكتروني مخصص يجذب مسؤولي التوظيف", "لوحة تحكم حية + سجل شفاف لكل شركة تم مراسلتها"]'::jsonb,
    '["Distribute CV to 300 verified companies in your field", "Custom AI-generated Cover Letter tailored to your profile", "Priority fast-lane sending queue to HR decision makers", "High-converting personalized email subject lines", "Live dashboard + transparent per-company delivery log"]'::jsonb,
    true,
    2
  ),
  (
    'ultimate',
    'الباقة الشاملة (Ultimate VIP)',
    'Ultimate 500 + AI ATS CV Rewrite',
    'تغطية شاملة لـ 500+ شركة مع إعادة صياغة سيرتك الذاتية لمعايير ATS',
    'Maximum reach to 500+ companies + full AI ATS CV Optimization before sending',
    500,
    true,
    true,
    true,
    '{"AED": 349, "SAR": 349, "QAR": 349, "KWD": 29, "EGP": 4490, "USD": 95}'::jsonb,
    '{"AED": 129, "SAR": 129, "QAR": 129, "KWD": 11, "EGP": 1650, "USD": 35}'::jsonb,
    '["إرسال السيرة الذاتية إلى 500+ شركة رائدة في مجالك", "تحسين وإعادة صياغة سيرتك الذاتية بنظام ATS بالذكاء الاصطناعي قبل التوزيع", "خطاب تقديم (Cover Letter) احترافي ثنائي اللغة (عربي / إنجليزي)", "تحميل نسخة الـ CV المحسنة جاهزة من لوحة التحكم الخاصة بك", "أولوية VIP في الإرسال + تقرير توصيل مفصل"]'::jsonb,
    '["Distribute CV to 500+ top companies in your specialization", "Full AI ATS CV Optimization & keyword enhancement before sending", "Executive bilingual AI Cover Letter included", "Download your newly optimized ATS CV directly from your dashboard", "VIP Priority Distribution + comprehensive delivery report"]'::jsonb,
    false,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SEED DATA 4: Promo Codes
-- ==============================================================================
INSERT INTO promo_codes (code, discount_percent, is_active)
VALUES
  ('GCC20', 20, true),
  ('WAZAYEF15', 15, true)
ON CONFLICT (code) DO NOTHING;
