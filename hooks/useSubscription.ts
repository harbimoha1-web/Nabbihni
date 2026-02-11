import { useCallback } from 'react';
import { router } from 'expo-router';
import {
  useSubscriptionContext,
  FREE_COUNTDOWN_LIMIT,
} from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook for accessing subscription state and methods
 */
export function useSubscription() {
  const { t } = useLanguage();
  const {
    isPremium,
    isLoading,
    monthlyPrice,
    monthlyPackage,
    lifetimePrice,
    lifetimePackage,
    purchaseMonthly,
    purchaseLifetime,
    restorePurchases,
    refreshCustomerInfo,
  } = useSubscriptionContext();

  /**
   * Check if user can create a new countdown based on their subscription status
   * @param currentCount - Current number of countdowns the user has
   * @returns true if user can create more countdowns
   */
  const canCreateCountdown = useCallback(
    (currentCount: number): boolean => {
      if (isPremium) return true;
      return currentCount < FREE_COUNTDOWN_LIMIT;
    },
    [isPremium]
  );

  /**
   * Get remaining countdown slots for free users
   * @param currentCount - Current number of countdowns the user has
   * @returns Number of remaining slots, or Infinity for premium users
   */
  const getRemainingCountdowns = useCallback(
    (currentCount: number): number => {
      if (isPremium) return Infinity;
      return Math.max(0, FREE_COUNTDOWN_LIMIT - currentCount);
    },
    [isPremium]
  );

  /**
   * Whether ads should be shown (free users only)
   */
  const shouldShowAds = !isPremium;

  /**
   * Purchase premium subscription with loading state
   */
  const purchasePremium = useCallback(async (): Promise<boolean> => {
    return purchaseMonthly();
  }, [purchaseMonthly]);

  /**
   * Show upgrade prompt when user hits countdown limit
   */
  const showUpgradePrompt = useCallback(
    () => {
      router.push({ pathname: '/paywall' as any, params: { trigger: 'limit' } });
    },
    []
  );

  /**
   * Check if user can create countdown, show upgrade prompt if not
   * @param currentCount - Current number of countdowns
   * @returns true if user can create, false if at limit
   */
  const checkAndPromptForUpgrade = useCallback(
    (currentCount: number): boolean => {
      if (canCreateCountdown(currentCount)) {
        return true;
      }
      showUpgradePrompt();
      return false;
    },
    [canCreateCountdown, showUpgradePrompt]
  );

  /**
   * Show premium feature prompt for features that require premium subscription
   * @param featureName - Key for the feature message (e.g., 'salary')
   */
  const showPremiumFeaturePrompt = useCallback(
    (featureName: 'salary' | 'recurring' | 'customWallpaper' = 'salary') => {
      const triggerMap: Record<string, string> = {
        salary: 'salary',
        recurring: 'recurring',
        customWallpaper: 'wallpaper',
      };
      const trigger = triggerMap[featureName] || 'default';
      router.push({ pathname: '/paywall' as any, params: { trigger } });
    },
    []
  );

  return {
    // State
    isPremium,
    isLoading,
    monthlyPrice,
    monthlyPackage,
    lifetimePrice,
    lifetimePackage,
    shouldShowAds,

    // Limit checking
    canCreateCountdown,
    getRemainingCountdowns,
    checkAndPromptForUpgrade,
    countdownLimit: FREE_COUNTDOWN_LIMIT,

    // Actions
    purchasePremium,
    purchaseLifetime,
    restorePurchases,
    refreshCustomerInfo,
    showUpgradePrompt,
    showPremiumFeaturePrompt,
  };
}

export type UseSubscriptionReturn = ReturnType<typeof useSubscription>;
