import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  I18nManager,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { COLORS } from '@/constants/themes';

type PlanType = 'monthly' | 'lifetime';

const GOLD_GRADIENT: readonly [string, string, string] = ['#D97706', '#F59E0B', '#FBBF24'];

export default function PaywallScreen() {
  const { trigger } = useLocalSearchParams<{ trigger?: string }>();
  const { t, isRTL } = useLanguage();
  const {
    isLoading,
    monthlyPrice,
    lifetimePrice,
    purchaseMonthly,
    purchaseLifetime,
    restorePurchases,
  } = useSubscriptionContext();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Dynamic headline based on trigger
  const getHeadline = (): string => {
    switch (trigger) {
      case 'limit': return t.paywall.limitHeadline;
      case 'salary': return t.paywall.salaryHeadline;
      case 'recurring': return t.paywall.recurringHeadline;
      case 'wallpaper': return t.paywall.wallpaperHeadline;
      case 'settings': return t.paywall.settingsHeadline;
      default: return t.paywall.defaultHeadline;
    }
  };

  const handleSelectPlan = useCallback((plan: PlanType) => {
    setSelectedPlan(plan);
    Haptics.selectionAsync();
  }, []);

  const handlePurchase = useCallback(async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = selectedPlan === 'lifetime'
        ? await purchaseLifetime()
        : await purchaseMonthly();

      if (success) {
        setPurchaseSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPlan, purchaseLifetime, purchaseMonthly, isPurchasing]);

  const handleRestore = useCallback(async () => {
    await restorePurchases();
  }, [restorePurchases]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  // Feature data
  const features = [
    {
      icon: '♾️',
      title: t.paywall.unlimitedTitle,
      desc: t.paywall.unlimitedDesc,
      badge: t.paywall.unlimitedBadge,
    },
    {
      icon: '💰',
      title: t.paywall.salaryTitle,
      desc: t.paywall.salaryDesc,
      badge: t.paywall.salaryBadge,
    },
    {
      icon: '🔁',
      title: t.paywall.recurringTitle,
      desc: t.paywall.recurringDesc,
      badge: t.paywall.recurringBadge,
    },
    {
      icon: '🎨',
      title: t.paywall.wallpaperTitle,
      desc: t.paywall.wallpaperDesc,
      badge: t.paywall.wallpaperBadge,
    },
    {
      icon: '🚫',
      title: t.paywall.adFreeTitle,
      desc: t.paywall.adFreeDesc,
      badge: t.paywall.adFreeBadge,
    },
    {
      icon: '⚡',
      title: t.paywall.priorityTitle,
      desc: t.paywall.priorityDesc,
      badge: t.paywall.priorityBadge,
    },
  ];

  // Success overlay
  if (purchaseSuccess) {
    return (
      <View style={styles.successOverlay}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          <Text style={styles.successText}>{t.paywall.success}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Close Button */}
        <Pressable
          onPress={handleClose}
          style={[
            styles.closeButton,
            isRTL ? styles.closeButtonRTL : styles.closeButtonLTR,
          ]}
          hitSlop={16}
        >
          <View style={styles.closeButtonBg}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </View>
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <LinearGradient
              colors={GOLD_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGlow}
            >
              <Text style={styles.appIcon}>⏳</Text>
            </LinearGradient>

            <Text style={[styles.headline, { textAlign: isRTL ? 'right' : 'left' }]}>
              {getHeadline()}
            </Text>
            <Text style={[styles.subheadline, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t.paywall.subheadline}
            </Text>
          </Animated.View>

          {/* Feature Stack */}
          <View style={styles.featureStack}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.icon + index}
                entering={FadeInDown.delay(200 + index * 80).duration(400)}
              >
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {feature.desc}
                    </Text>
                  </View>
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Pricing Section */}
          <Animated.View entering={FadeInUp.delay(800).duration(500)}>
            <Text style={styles.choosePlan}>{t.paywall.choosePlan}</Text>

            <View style={styles.pricingRow}>
              {/* Monthly Card */}
              <Pressable
                onPress={() => handleSelectPlan('monthly')}
                style={[
                  styles.pricingCard,
                  styles.pricingCardMonthly,
                  selectedPlan === 'monthly' && styles.pricingCardSelected,
                ]}
              >
                <Text style={[styles.pricingLabel, selectedPlan === 'monthly' && styles.pricingLabelSelected]}>
                  {t.paywall.monthly}
                </Text>
                <Text style={[styles.pricingAmount, selectedPlan === 'monthly' && styles.pricingAmountSelected]}>
                  {monthlyPrice}
                </Text>
                <Text style={[styles.pricingPer, selectedPlan === 'monthly' && styles.pricingPerSelected]}>
                  {t.paywall.perMonth}
                </Text>
              </Pressable>

              {/* Lifetime Card */}
              <Pressable
                onPress={() => handleSelectPlan('lifetime')}
                style={[
                  styles.pricingCard,
                  styles.pricingCardLifetime,
                  selectedPlan === 'lifetime' && styles.pricingCardLifetimeSelected,
                ]}
              >
                {/* Best Value Badge */}
                <View style={styles.bestValueBadge}>
                  <LinearGradient
                    colors={GOLD_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bestValueGradient}
                  >
                    <Text style={styles.bestValueText}>★ {t.paywall.bestValue}</Text>
                  </LinearGradient>
                </View>

                <Text style={[styles.pricingLabel, styles.pricingLabelLifetime]}>
                  {t.paywall.lifetime}
                </Text>
                <Text style={[styles.pricingAmount, styles.pricingAmountLifetime]}>
                  {lifetimePrice}
                </Text>
                <Text style={[styles.pricingSubtext, { textAlign: 'center' }]}>
                  {t.paywall.payOnceOwn}
                </Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{t.paywall.savePercent}</Text>
                </View>
              </Pressable>
            </View>

          </Animated.View>

          {/* CTA Button */}
          <Animated.View entering={FadeInUp.delay(1000).duration(500)} style={styles.ctaContainer}>
            <Pressable
              onPress={handlePurchase}
              disabled={isPurchasing || isLoading}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
                (isPurchasing || isLoading) && styles.ctaButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={GOLD_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.ctaText}>
                    {selectedPlan === 'lifetime'
                      ? `${t.paywall.unlockForever} — ${lifetimePrice}`
                      : `${t.paywall.subscribeNow} — ${monthlyPrice}`}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Restore Link */}
          <Pressable onPress={handleRestore} style={styles.restoreLink}>
            <Text style={styles.restoreText}>{t.paywall.restorePurchases}</Text>
          </Pressable>

          {/* Apple-required subscription legal text */}
          <View style={styles.legalContainer}>
            <Text style={[styles.legalText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {selectedPlan === 'monthly'
                ? t.paywall.legalAutoRenew
                : t.paywall.legalLifetime}
            </Text>
            <Text style={[styles.legalText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t.paywall.legalCancel}
            </Text>
            <View style={[styles.legalLinks, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Pressable onPress={() => Linking.openURL('https://nabbihni.com/privacy.html')}>
                <Text style={styles.legalLinkText}>{t.paywall.privacyPolicy}</Text>
              </Pressable>
              <Text style={styles.legalSeparator}>|</Text>
              <Pressable onPress={() => Linking.openURL('https://nabbihni.com/terms.html')}>
                <Text style={styles.legalLinkText}>{t.paywall.termsOfUse}</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: 56,
    zIndex: 10,
  },
  closeButtonLTR: {
    left: 16,
  },
  closeButtonRTL: {
    right: 16,
  },
  closeButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  iconGlow: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appIcon: {
    fontSize: 36,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subheadline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Feature Stack
  featureStack: {
    marginBottom: 28,
    gap: 8,
  },
  featureCard: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  featureBadge: {
    backgroundColor: COLORS.glass,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Pricing
  choosePlan: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  pricingCardMonthly: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  pricingCardSelected: {
    borderColor: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceHover,
  },
  pricingCardLifetime: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  pricingCardLifetimeSelected: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  pricingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  pricingLabelSelected: {
    color: COLORS.text,
  },
  pricingLabelLifetime: {
    color: '#F59E0B',
    marginTop: 8,
  },
  pricingAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  pricingAmountSelected: {
    color: COLORS.text,
  },
  pricingAmountLifetime: {
    color: COLORS.text,
    fontSize: 24,
  },
  pricingPer: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pricingPerSelected: {
    color: COLORS.textSecondary,
  },
  pricingSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Best Value Badge
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  bestValueGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },

  // Savings Badge
  savingsBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },

  // Monthly equivalent
  monthlyEquivalent: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },

  // CTA
  ctaContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
  },

  // Restore
  restoreLink: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  restoreText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },

  // Legal Text
  legalContainer: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
  },
  legalText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  legalLinks: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  legalLinkText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Success
  successOverlay: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: 16,
    textAlign: 'center',
  },
});
