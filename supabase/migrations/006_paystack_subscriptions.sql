-- ============================================================================
-- Two Birds - Migration 006: Add Paystack Subscription Columns to Profiles
-- ============================================================================
-- Supports Paystack monthly premium subscriptions (GHS 47.34 = 4734 pesewas)
-- for Card (auto-renew) and Mobile Money (manual monthly renew).
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS paystack_authorization_code text,
  ADD COLUMN IF NOT EXISTS paystack_customer_code text,
  ADD COLUMN IF NOT EXISTS paystack_subscription_code text,
  ADD COLUMN IF NOT EXISTS paystack_channel text,
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz;

-- Index for expiration queries, daily cron reminders, and performance
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expiry
  ON public.profiles(is_premium, premium_expires_at);
