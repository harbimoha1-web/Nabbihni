import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSubscriptionErrorMessage,
  isUserCancellation,
} from '@/lib/subscriptionErrors';
import { translations, Language } from '@/locales/translations';

const LANGUAGE_STORAGE_KEY = '@nabbihni/language';

// Helper to get current language
const getCurrentLanguage = async (): Promise<Language> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en') return 'en';
  } catch {}
  return 'ar';
};

// Helper to get translations synchronously (fallback to Arabic)
const getTranslations = (lang: Language = 'ar') => translations[lang];

// Types from react-native-purchases (declared here to avoid import crash)
type PurchasesPackage = any;
type CustomerInfo = any;
type PurchasesError = any;

// Conditional import of react-native-purchases (native module not available in Expo Go)
let Purchases: typeof import('react-native-purchases').default | null = null;
let LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | null = null;

try {
  const module = require('react-native-purchases');
  Purchases = module.default;
  LOG_LEVEL = module.LOG_LEVEL;
} catch (e) {
  if (__DEV__) console.log('react-native-purchases not available (running in Expo Go)');
}

// RevenueCat Configuration (Production keys — configured 2026-02)
// Products: com.nabbihni.premium.monthly (4.99 SAR), com.nabbihni.premium.lifetime (49.99 SAR)
// Entitlement: "premium"
const REVENUECAT_IOS_API_KEY = 'appl_bapASHjWolpHWzEdmLqgzBOcwFy';
const REVENUECAT_ANDROID_API_KEY = 'goog_FXMvptjwLkbiOCyxjoFKnjVEfOS';
const ENTITLEMENT_ID = 'premium';
const PRODUCT_ID_MONTHLY = 'com.nabbihni.premium.monthly';
const PRODUCT_ID_LIFETIME = 'com.nabbihni.premium.lifetime';

// Check if RevenueCat is configured and available
const isRevenueCatConfigured = () => {
  // Native module not available (Expo Go)
  if (!Purchases) return false;

  const apiKey = Platform.select({
    ios: REVENUECAT_IOS_API_KEY,
    android: REVENUECAT_ANDROID_API_KEY,
    default: REVENUECAT_ANDROID_API_KEY,
  });
  return apiKey && apiKey.length > 0 && !apiKey.includes('YOUR_');
};

// Storage keys
const PREMIUM_CACHE_KEY = '@nabbihni/is-premium';
const PREMIUM_CACHE_TIMESTAMP_KEY = '@nabbihni/premium-cache-timestamp';
const ADMIN_SESSION_KEY = '@nabbihni/admin-session';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Constants
export const FREE_COUNTDOWN_LIMIT = 5;

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  monthlyPrice: string;
  monthlyPackage: PurchasesPackage | null;
  lifetimePrice: string;
  lifetimePackage: PurchasesPackage | null;
  purchaseMonthly: () => Promise<boolean>;
  purchaseLifetime: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// DEV MODE: Set to true ONLY for local testing of premium features
// CRITICAL: Must be false for TestFlight/production builds!
const DEV_FORCE_PREMIUM = false;

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(DEV_FORCE_PREMIUM);
  const [isLoading, setIsLoading] = useState(false); // Start false - don't block UI
  const [monthlyPrice, setMonthlyPrice] = useState<string>('4.99 SAR');
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [lifetimePrice, setLifetimePrice] = useState<string>('49.99 SAR');
  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cache premium status to AsyncStorage for offline access
  const cachePremiumStatus = async (premium: boolean) => {
    try {
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify(premium));
      await AsyncStorage.setItem(PREMIUM_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.error('Failed to cache premium status:', e);
    }
  };

  // Load cached premium status
  const loadCachedPremiumStatus = async (): Promise<boolean | null> => {
    try {
      // Check for admin session first - admin always gets PRO
      const adminSession = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      if (adminSession === 'active') {
        return true;
      }

      const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(PREMIUM_CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        // Only use cache if it's less than 24 hours old
        if (cacheAge < CACHE_DURATION_MS) {
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to load cached premium status:', e);
      return null;
    }
  };

  // Check if user has premium entitlement
  const checkPremiumStatus = (customerInfo: CustomerInfo): boolean => {
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  };

  // Initialize RevenueCat SDK
  const initializeRevenueCat = useCallback(async () => {
    try {
      // Load cached status first for instant UI
      const cachedStatus = await loadCachedPremiumStatus();
      if (cachedStatus !== null) {
        setIsPremium(cachedStatus);
      }

      // Skip RevenueCat if not configured (development mode)
      if (!isRevenueCatConfigured()) {
        console.log('RevenueCat not configured - running in free mode');
        setIsLoading(false);
        return;
      }

      // Configure RevenueCat (guarded - already checked in isRevenueCatConfigured)
      if (__DEV__ && LOG_LEVEL) {
        Purchases!.setLogLevel(LOG_LEVEL.DEBUG);
      }

      const apiKey = Platform.select({
        ios: REVENUECAT_IOS_API_KEY,
        android: REVENUECAT_ANDROID_API_KEY,
        default: REVENUECAT_ANDROID_API_KEY,
      });

      await Purchases!.configure({ apiKey });
      setIsInitialized(true);

      // Fetch actual customer info
      const customerInfo = await Purchases!.getCustomerInfo();
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      await cachePremiumStatus(premium);

      // Fetch available packages
      await fetchPackages();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      // Fall back to cached status
      const cachedStatus = await loadCachedPremiumStatus();
      if (cachedStatus !== null) {
        setIsPremium(cachedStatus);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available subscription packages
  const fetchPackages = async () => {
    if (!Purchases) return;

    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;

      if (current) {
        // Try to get monthly package
        const monthly = current.monthly || current.availablePackages.find(
          (pkg) => pkg.product.identifier === PRODUCT_ID_MONTHLY
        );

        if (monthly) {
          setMonthlyPackage(monthly);
          setMonthlyPrice(monthly.product.priceString);
        }

        // Try to get lifetime package
        const lifetime = current.lifetime || current.availablePackages.find(
          (pkg) => pkg.product.identifier === PRODUCT_ID_LIFETIME
        );

        if (lifetime) {
          setLifetimePackage(lifetime);
          setLifetimePrice(lifetime.product.priceString);
        }
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    }
  };

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async () => {
    // Check for admin session first - admin always gets PRO
    try {
      const adminSession = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      if (adminSession === 'active') {
        setIsPremium(true);
        return;
      }
    } catch (e) {
      // Continue with normal check
    }

    if (!isInitialized || !Purchases) return;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      await cachePremiumStatus(premium);
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
    }
  }, [isInitialized]);

  // Purchase monthly subscription
  const purchaseMonthly = useCallback(async (): Promise<boolean> => {
    const lang = await getCurrentLanguage();
    const t = getTranslations(lang);

    if (!isRevenueCatConfigured()) {
      Alert.alert(
        t.subscription.premiumTitle,
        t.subscription.notActiveYet
      );
      return false;
    }

    if (!monthlyPackage) {
      Alert.alert(
        t.subscription.premiumTitle,
        t.subscription.notAvailable
      );
      return false;
    }

    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases!.purchasePackage(monthlyPackage);
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      await cachePremiumStatus(premium);
      return premium;
    } catch (error) {
      const purchaseError = error as PurchasesError;

      // Don't show alert for user cancellation
      if (!isUserCancellation(purchaseError)) {
        const errorMessage = getSubscriptionErrorMessage(purchaseError);
        Alert.alert(errorMessage.title, errorMessage.message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [monthlyPackage]);

  // Purchase lifetime access
  const purchaseLifetime = useCallback(async (): Promise<boolean> => {
    const lang = await getCurrentLanguage();
    const t = getTranslations(lang);

    if (!isRevenueCatConfigured()) {
      Alert.alert(
        t.subscription.premiumTitle,
        t.subscription.notActiveYet
      );
      return false;
    }

    if (!lifetimePackage) {
      Alert.alert(
        t.subscription.premiumTitle,
        t.subscription.notAvailable
      );
      return false;
    }

    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases!.purchasePackage(lifetimePackage);
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      await cachePremiumStatus(premium);
      return premium;
    } catch (error) {
      const purchaseError = error as PurchasesError;

      // Don't show alert for user cancellation
      if (!isUserCancellation(purchaseError)) {
        const errorMessage = getSubscriptionErrorMessage(purchaseError);
        Alert.alert(errorMessage.title, errorMessage.message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [lifetimePackage]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    const lang = await getCurrentLanguage();
    const t = getTranslations(lang);

    if (!isRevenueCatConfigured()) {
      Alert.alert(
        t.subscription.premiumTitle,
        t.subscription.notActiveYet
      );
      return false;
    }

    try {
      setIsLoading(true);
      const customerInfo = await Purchases!.restorePurchases();
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      await cachePremiumStatus(premium);

      if (premium) {
        Alert.alert(t.subscription.premiumTitle, t.subscription.restoreSuccess);
      } else {
        Alert.alert(t.subscription.premiumTitle, t.subscription.restoreNoSubscription);
      }

      return premium;
    } catch (error) {
      const purchaseError = error as PurchasesError;
      const errorMessage = getSubscriptionErrorMessage(purchaseError, lang);
      Alert.alert(errorMessage.title, errorMessage.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRevenueCat();
  }, [initializeRevenueCat]);

  // Listen for customer info updates
  useEffect(() => {
    if (!isInitialized || !isRevenueCatConfigured() || !Purchases) return;

    const listener = (customerInfo: CustomerInfo) => {
      const premium = checkPremiumStatus(customerInfo);
      setIsPremium(premium);
      cachePremiumStatus(premium);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases!.removeCustomerInfoUpdateListener(listener);
    };
  }, [isInitialized]);

  return (
    <SubscriptionContext.Provider
      value={{
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
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};

export type { SubscriptionContextType };
