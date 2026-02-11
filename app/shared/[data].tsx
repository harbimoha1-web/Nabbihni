import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { decodeSharedCountdown } from '@/lib/shareLink';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCountdowns as useCountdownsList } from '@/hooks/useCountdowns';
import { createCountdown } from '@/lib/storage';
import CountdownTimer from '@/components/CountdownTimer';
import AnimatedIcon from '@/components/AnimatedIcon';
import { getTheme } from '@/constants/themes';

const { width } = Dimensions.get('window');

export default function SharedCountdownScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { data } = useLocalSearchParams<{ data: string }>();
  const { refresh } = useCountdownsList();
  const [isAdding, setIsAdding] = useState(false);

  // Decode the shared countdown data
  const sharedData = useMemo(() => {
    if (!data) return null;
    return decodeSharedCountdown(data);
  }, [data]);

  const theme = sharedData ? getTheme(sharedData.theme) : getTheme('default');

  const { timeRemaining } = useCountdown({
    targetDate: sharedData?.targetDate ?? new Date().toISOString(),
  });

  const handleAddToMine = async () => {
    if (!sharedData || isAdding) return;

    setIsAdding(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create a local copy of the countdown
      await createCountdown({
        title: sharedData.title,
        targetDate: sharedData.targetDate,
        icon: sharedData.icon,
        theme: sharedData.theme,
        isPublic: false,
      });

      // Refresh the countdowns list
      await refresh();

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success and go to home
      Alert.alert(
        language === 'ar' ? 'تمت الإضافة!' : 'Added!',
        language === 'ar'
          ? 'تمت إضافة العد التنازلي إلى قائمتك'
          : 'Countdown added to your list',
        [
          {
            text: language === 'ar' ? 'حسناً' : 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding countdown:', error);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar'
          ? 'فشل في إضافة العد التنازلي'
          : 'Failed to add countdown'
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Invalid or expired link
  if (!sharedData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {language === 'ar' ? 'رابط غير صالح' : 'Invalid Link'}
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {language === 'ar'
              ? 'هذا الرابط غير صالح أو انتهت صلاحيته'
              : 'This link is invalid or has expired'}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleClose}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              {language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const fromPersonText = sharedData.sharerName
    ? language === 'ar'
      ? `عد تنازلي من ${sharedData.sharerName}`
      : `Countdown from ${sharedData.sharerName}`
    : language === 'ar'
      ? 'عد تنازلي مشترك'
      : 'Shared Countdown';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={theme.colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.glass }]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* From Person Badge */}
            <View style={[styles.badge, { backgroundColor: colors.glass }]}>
              <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                {fromPersonText}
              </Text>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <AnimatedIcon emoji={sharedData.icon} size={72} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {sharedData.title}
            </Text>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <CountdownTimer
                timeRemaining={timeRemaining}
                theme={theme}
                size="large"
              />
            </View>

            {/* Target Date */}
            <View style={styles.dateContainer}>
              <Text style={[styles.dateHijri, { color: theme.colors.text }]}>
                {new Date(sharedData.targetDate).toLocaleDateString(
                  language === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </Text>
              <Text style={[styles.dateGregorian, { color: theme.colors.textSecondary }]}>
                {new Date(sharedData.targetDate).toLocaleDateString(
                  language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US-u-ca-gregory',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </Text>
            </View>
          </View>

          {/* Add Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.accent },
                isAdding && styles.addButtonDisabled,
              ]}
              onPress={handleAddToMine}
              disabled={isAdding}
            >
              <Ionicons
                name={isAdding ? 'hourglass-outline' : 'add-circle-outline'}
                size={24}
                color={colors.background}
              />
              <Text style={[styles.addButtonText, { color: colors.background }]}>
                {isAdding
                  ? language === 'ar' ? 'جارٍ الإضافة...' : 'Adding...'
                  : language === 'ar' ? 'أضف لعداداتي' : 'Add to My Countdowns'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateHijri: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  dateGregorian: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
