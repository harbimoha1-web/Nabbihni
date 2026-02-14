import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, updateSettings, AppSettings } from '@/lib/storage';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotifications } from '@/hooks/useNotifications';

// Admin PIN - Change this to your secret PIN
const ADMIN_PIN = '1711';

export default function SettingsScreen() {
  const { colors, mode, setMode, isDark } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const {
    isPremium,
    isLoading: subscriptionLoading,
    monthlyPrice,
    purchasePremium,
    restorePurchases,
  } = useSubscription();

  const {
    permissionGranted: notificationsPermissionGranted,
    toggleNotifications: toggleReminderNotifications,
    requestNotificationPermission,
  } = useNotifications();

  // Hidden admin access - triple tap on version number with PIN protection
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleVersionTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 3) {
        tapCountRef.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Show PIN modal
        setShowPinModal(true);
        setPinInput('');
        setPinError(false);
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapRef.current = now;
  };

  const handlePinSubmit = async () => {
    if (pinInput === ADMIN_PIN) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Set admin session flag for PRO bypass (expires in 24 hours)
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      await AsyncStorage.setItem('@nabbihni/admin-session', JSON.stringify({ expiry }));
      // Show admin options
      Alert.alert(
        'Admin',
        language === 'ar' ? 'اختر لوحة الإدارة' : 'Choose Admin Panel',
        [
          {
            text: language === 'ar' ? 'إدارة الأعياد' : 'Holidays Admin',
            onPress: () => router.push('/admin/holidays'),
          },
          {
            text: language === 'ar' ? 'إدارة المناسبات' : 'Events Admin',
            onPress: () => router.push('/admin/events'),
          },
          {
            text: language === 'ar' ? 'إلغاء' : 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      setPinError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinInput('');
    }
  };

  const handlePinClose = () => {
    setShowPinModal(false);
    setPinInput('');
    setPinError(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const handleToggle = useCallback(
    async (key: keyof AppSettings, value: boolean) => {
      if (!settings) return;
      const updated = await updateSettings({ [key]: value });
      setSettings(updated);
    },
    [settings]
  );

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleUpgradeToPremium = () => {
    router.push({ pathname: '/paywall' as any, params: { trigger: 'settings' } });
  };

  const handleRestorePurchases = async () => {
    if (subscriptionLoading) return;
    await restorePurchases();
  };

  const handleRateApp = async () => {
    // TODO: Replace with actual App Store ID after app approval
    // Get the ID from App Store Connect URL: https://apps.apple.com/app/idXXXXXXXXXX
    // Example: If URL is https://apps.apple.com/app/id1234567890, use '1234567890'
    const APP_STORE_ID = '6759000350';

    if (!APP_STORE_ID) {
      Alert.alert(t.settings.comingSoon, t.settings.rateNotAvailable);
      return;
    }

    const storeUrl = `https://apps.apple.com/app/id${APP_STORE_ID}`;
    try {
      await Linking.openURL(storeUrl);
    } catch {
      Alert.alert(t.error, t.settings.cantOpenStore);
    }
  };

  const handleContactUs = async () => {
    const email = 'kam.baqi.sa@gmail.com';
    const subject = encodeURIComponent(language === 'ar' ? 'تواصل من تطبيق نبّهني' : 'Contact from Nabbihni app');
    try {
      await Linking.openURL(`mailto:${email}?subject=${subject}`);
    } catch {
      Alert.alert(t.error, t.settings.cantOpenEmail);
    }
  };

  const handlePrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://nabbihni.com/privacy');
    } catch {
      Alert.alert(t.error, t.settings.cantOpenLink);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value && !notificationsPermissionGranted) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          t.error,
          t.settings.enableNotificationsPrompt,
          [
            { text: t.cancel, style: 'cancel' },
            { text: t.settings.openSettings, onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    await handleToggle('notificationsEnabled', value);
    await toggleReminderNotifications(value);
  };

  if (!settings) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Section */}
        {isPremium ? (
          <View style={[styles.premiumBanner, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
            <View style={styles.premiumContent}>
              <Text style={[styles.premiumTitle, { color: colors.success }]}>{t.subscription.premiumTitle}</Text>
              <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
                {t.subscription.youArePremium}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          </View>
        ) : (
          <View style={[styles.premiumBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
            <View style={styles.premiumContent}>
              <Text style={[styles.premiumTitle, { color: colors.accent }]}>{t.subscription.premiumTitle}</Text>
              <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
                {t.subscription.noAds} • {t.subscription.unlimitedCountdowns}
              </Text>
              <Text style={[styles.premiumPrice, { color: colors.textSecondary }]}>{monthlyPrice}</Text>
            </View>
            <Pressable
              onPress={handleUpgradeToPremium}
              style={[styles.premiumButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.premiumButtonText}>
                {t.subscription.subscribe}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.language}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            <View style={styles.languageModes}>
              {[
                { id: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
                { id: 'en' as Language, label: 'English', flag: '🇺🇸' },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleLanguageChange(item.id)}
                  style={[
                    styles.languageButton,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    language === item.id && { borderColor: colors.accent, backgroundColor: colors.accent + '20' },
                  ]}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.languageText,
                      { color: language === item.id ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.appearance}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.themeHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.accent} />
              </View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.displayMode}</Text>
            </View>
            <View style={styles.themeModes}>
              {[
                { id: 'light' as ThemeMode, label: t.settings.light, icon: 'sunny-outline' as const },
                { id: 'dark' as ThemeMode, label: t.settings.dark, icon: 'moon-outline' as const },
                { id: 'system' as ThemeMode, label: t.settings.auto, icon: 'phone-portrait-outline' as const },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleThemeChange(item.id)}
                  style={[
                    styles.themeModeButton,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    mode === item.id && { borderColor: colors.accent, backgroundColor: colors.accent + '20' },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={mode === item.id ? colors.accent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeModeText,
                      { color: mode === item.id ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.preferences}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            <Pressable
              onPress={() => handleNotificationsToggle(!settings.notificationsEnabled)}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="notifications-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.notifications}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.settings.notificationsDesc}</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </Pressable>
            <Pressable
              onPress={() => handleToggle('hapticEnabled', !settings.hapticEnabled)}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: 'transparent' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="phone-portrait-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.vibration}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.settings.vibrationDesc}</Text>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(value) => handleToggle('hapticEnabled', value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.aboutApp}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            <Pressable
              onPress={handleRateApp}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="star-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.rateApp}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.settings.rateAppDesc}</Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={handleContactUs}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="mail-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.contactUs}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.settings.contactUsDesc}</Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={handlePrivacyPolicy}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.settings.privacyPolicy}</Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={handleRestorePurchases}
              disabled={subscriptionLoading}
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: 'transparent' },
                pressed && { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="refresh-outline" size={22} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t.subscription.restorePurchases}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t.settings.restoreDesc}</Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Version Info */}
        <Pressable style={styles.versionContainer} onPress={handleVersionTap}>
          <Text style={[styles.versionText, { color: colors.text }]}>{t.settings.appName}</Text>
          <Text style={[styles.versionNumber, { color: colors.textSecondary }]}>{t.settings.version} 1.0.0</Text>
        </Pressable>
      </ScrollView>

      {/* Admin PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={handlePinClose}
      >
        <Pressable style={styles.pinModalOverlay} onPress={handlePinClose}>
          <Pressable style={[styles.pinModalContent, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[styles.pinModalTitle, { color: colors.text }]}>
              {language === 'ar' ? 'أدخل رمز الدخول' : 'Enter PIN'}
            </Text>

            {pinError && (
              <Text style={styles.pinErrorText}>
                {language === 'ar' ? 'رمز خاطئ' : 'Wrong PIN'}
              </Text>
            )}

            <TextInput
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: pinError ? '#ef4444' : colors.border,
                },
              ]}
              onSubmitEditing={handlePinSubmit}
            />

            <View style={styles.pinModalButtons}>
              <Pressable
                onPress={handlePinClose}
                style={[styles.pinButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.pinButtonText, { color: colors.textSecondary }]}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePinSubmit}
                style={[styles.pinButton, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.pinButtonText, { color: '#000' }]}>
                  {language === 'ar' ? 'دخول' : 'Enter'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
  },
  premiumPrice: {
    fontSize: 12,
    marginTop: 4,
  },
  premiumButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  themeModes: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  themeModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeModeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 14,
  },
  languageModes: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // PIN Modal styles
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pinErrorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
  },
  pinInput: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  pinModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pinButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
