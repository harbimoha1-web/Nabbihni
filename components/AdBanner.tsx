import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/contexts/ThemeContext';

// Conditional import - native module not available in Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
} catch (e) {
  console.log('react-native-google-mobile-ads not available (running in Expo Go)');
}

// Check if AdMob is available (native module loaded)
const isAdMobAvailable = () => BannerAd !== null && BannerAdSize !== null;

// =============================================================================
// CRITICAL - AdMob Configuration Required Before Launch!
// =============================================================================
// 1. Create AdMob account at https://admob.google.com
// 2. Create apps for iOS and Android
// 3. Create banner ad units for each platform
// 4. IMPORTANT: Configure Shariah-compliant blocking in AdMob Console:
//    Navigate to: Blocking controls > General categories
//    Block these categories:
//    - Alcohol, Gambling & Betting, Dating Services, Sexual Content
//    - Tobacco, Lottery & Sweepstakes, Cryptocurrency, Loans & Credit
//    - Political, Religious (non-Islamic), Music Streaming
// 5. Host app-ads.txt at https://nabbihni.com/app-ads.txt
// =============================================================================

const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-7647210654588736/4264299477',
    largeBanner: 'ca-app-pub-7647210654588736/2951217804',
    mediumRectangle: 'ca-app-pub-7647210654588736/4124698672',
  },
  android: {
    banner: 'ca-app-pub-7647210654588736/1638136137',
    largeBanner: 'ca-app-pub-7647210654588736/2411726985',
    mediumRectangle: 'ca-app-pub-7647210654588736/9827182573',
  },
};

// Test ad unit IDs for development
const TEST_AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  largeBanner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  mediumRectangle: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
};

type AdSize = 'banner' | 'largeBanner' | 'mediumRectangle';

interface AdBannerProps {
  size?: AdSize;
}

/**
 * AdMob Banner component
 * Returns null for premium users, renders ad banner for free users
 */
export default function AdBanner({ size = 'banner' }: AdBannerProps) {
  const { shouldShowAds } = useSubscription();
  const { colors } = useTheme();

  // Premium users don't see ads
  if (!shouldShowAds) {
    return null;
  }

  const getHeight = () => {
    switch (size) {
      case 'largeBanner':
        return 100;
      case 'mediumRectangle':
        return 250;
      case 'banner':
      default:
        return 50;
    }
  };

  // Get the appropriate ad unit ID
  const getAdUnitId = (): string => {
    if (__DEV__) {
      return TEST_AD_UNIT_IDS[size] || TEST_AD_UNIT_IDS.banner;
    }

    const platformIds = Platform.OS === 'ios' ? AD_UNIT_IDS.ios : AD_UNIT_IDS.android;
    return platformIds[size] || platformIds.banner;
  };

  // Get BannerAdSize equivalent
  const getBannerAdSize = () => {
    switch (size) {
      case 'largeBanner':
        return BannerAdSize.LARGE_BANNER;
      case 'mediumRectangle':
        return BannerAdSize.MEDIUM_RECTANGLE;
      case 'banner':
      default:
        return BannerAdSize.BANNER;
    }
  };

  // Check if real ad unit IDs are configured (not placeholders)
  const isAdUnitConfigured = () => {
    const adUnitId = getAdUnitId();
    return adUnitId && !adUnitId.includes('XXXXXXXXXXXXXXXX') && !adUnitId.includes('3940256099942544');
  };

  // In development, when not configured, or when AdMob native module is not available (Expo Go)
  if (__DEV__ || !isAdUnitConfigured() || !isAdMobAvailable()) {
    return (
      <View
        style={[
          styles.placeholder,
          { height: getHeight(), backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
          مساحة إعلانية ({size})
        </Text>
        <Text style={[styles.adIdText, { color: colors.textMuted }]}>
          {!isAdMobAvailable() ? 'Expo Go' : __DEV__ ? 'Test Mode' : 'Configure AdMob'}
        </Text>
      </View>
    );
  }

  // Production AdMob banner
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={getAdUnitId()}
        size={getBannerAdSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          if (__DEV__) console.log('Ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          if (__DEV__) console.error('Ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placeholder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginVertical: 8,
    gap: 4,
  },
  placeholderText: {
    fontSize: 12,
  },
  adIdText: {
    fontSize: 9,
    opacity: 0.7,
  },
});
