-- ============================================================================
-- Two Birds - Migration 005: Add Gender Column to Profiles
-- ============================================================================
-- Ensures the gender column exists on public.profiles.
-- Gender is strictly for internal matchmaking and premium preference filters.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
