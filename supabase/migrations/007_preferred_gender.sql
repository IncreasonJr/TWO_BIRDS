-- ============================================================================
-- Two Birds - Migration 007: Add Preferred Gender Filter to Profiles
-- ============================================================================
-- Allows premium users to filter discovery feed by 'Women', 'Men', or 'Everyone'.
-- Default is 'Everyone' for all users.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_gender text DEFAULT 'Everyone';
