-- ==============================================================================
-- ASRA3.COM — Automated GCC Jobs Board, Employer Portal & Social Syndication
-- Migration 002: Standalone & Idempotent (Safe on fresh or existing Supabase DB)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  dedupe_hash TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_domain TEXT NOT NULL DEFAULT '',
  company_website TEXT,
  apply_email TEXT,
  apply_url TEXT,
  apply_whatsapp TEXT,
  country_code TEXT NOT NULL CHECK (country_code IN ('AE', 'SA', 'QA', 'KW')),
  city_id TEXT NOT NULL,
  city_name_ar TEXT NOT NULL,
  city_name_en TEXT NOT NULL,
  industry_id TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'FULL_TIME'
    CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE')),
  experience_level TEXT NOT NULL DEFAULT 'Mid-Senior (3-7 Years)',
  salary_min INT,
  salary_max INT,
  salary_currency TEXT NOT NULL DEFAULT 'AED',
  summary_ar TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  requirements_ar TEXT[] NOT NULL DEFAULT '{}',
  requirements_en TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'verified_harvester'
    CHECK (source_type IN ('employer_direct', 'verified_harvester', 'admin_curated')),
  source_channel TEXT,
  is_mx_verified BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  quality_score INT NOT NULL DEFAULT 85,
  views_count INT NOT NULL DEFAULT 0,
  apply_clicks_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'pending_review', 'expired', 'rejected')),
  fb_post_id TEXT,
  fb_posted_at TIMESTAMPTZ,
  tg_message_id TEXT,
  tg_posted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '35 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_public_listing
  ON jobs(status, country_code, industry_id, is_featured DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_social_queue
  ON jobs(status, is_mx_verified, fb_posted_at, published_at DESC);
