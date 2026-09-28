import { useMemo, useCallback, useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export interface SubscriptionStatus {
  isPremium: boolean;
  isExpired: boolean;
  isInGracePeriod: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
  isCardUser: boolean;
  isMomoUser: boolean;
  formattedExpiry: string;
  refreshSubscription: () => Promise<void>;
}

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * useSubscription hook
 * Provides real-time subscription lifecycle state: active, 24-hour grace period, expiration, and payment channel.
 */
export function useSubscription(): SubscriptionStatus {
  const { currentUser, refreshProfile } = useUser();
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // Refresh time check every 60 seconds
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const status = useMemo(() => {
    const rawExpiresAt = currentUser?.premiumExpiresAt;
    const expiresAt = rawExpiresAt ? new Date(rawExpiresAt) : null;
    const now = currentTime;
    const isPremiumFlag = Boolean(currentUser?.isPremium);

    let isPremium = false;
    let isExpired = false;
    let isInGracePeriod = false;
    let daysRemaining = 0;

    if (expiresAt) {
      const expiresAtMs = expiresAt.getTime();
      const gracePeriodEndMs = expiresAtMs + GRACE_PERIOD_MS;

      if (now <= expiresAtMs) {
        // Active within standard 30-day period
        isPremium = isPremiumFlag;
        daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));
      } else if (now <= gracePeriodEndMs) {
        // Active within 24-hour grace period
        isPremium = isPremiumFlag;
        isInGracePeriod = true;
        daysRemaining = 0;
      } else {
        // Expired past grace period
        isPremium = false;
        isExpired = true;
        daysRemaining = 0;
      }
    } else if (isPremiumFlag) {
      // Premium without explicit date (e.g. lifetime/promo fallback)
      isPremium = true;
      daysRemaining = 30;
    }

    const isCardUser = Boolean(
      currentUser?.paystackChannel === 'card' || currentUser?.paystackAuthorizationCode
    );

    const isMomoUser = Boolean(
      currentUser?.paystackChannel === 'mobile_money' ||
      (!isCardUser && isPremiumFlag)
    );

    const formattedExpiry = expiresAt
      ? expiresAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

    return {
      isPremium,
      isExpired,
      isInGracePeriod,
      expiresAt,
      daysRemaining,
      isCardUser,
      isMomoUser,
      formattedExpiry,
    };
  }, [currentUser, currentTime]);

  const refreshSubscription = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  return {
    ...status,
    refreshSubscription,
  };
}
