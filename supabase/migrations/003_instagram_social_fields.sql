-- ==============================================================================
-- ASRA3.COM — Instagram Reels Syndication Tracking Fields
-- Migration 003: Idempotent (safe to re-run on existing Supabase database)
-- ==============================================================================

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS ig_post_id TEXT,
  ADD COLUMN IF NOT EXISTS ig_posted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_jobs_instagram_posted_at
  ON jobs(ig_posted_at DESC)
  WHERE ig_posted_at IS NOT NULL;
