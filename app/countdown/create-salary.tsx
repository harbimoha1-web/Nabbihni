import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemePicker } from '@/components/ThemePicker';
import { SalaryDayPicker } from '@/components/SalaryDayPicker';
import { CalendarTypePicker } from '@/components/CalendarTypePicker';
import { AdjustmentRulePicker } from '@/components/AdjustmentRulePicker';
import { useCountdowns } from '@/hooks/useCountdowns';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeId, CalendarType, AdjustmentRule } from '@/types/countdown';
import { calculateNextSalaryDate, formatCalendarTypeAr } from '@/lib/salaryCalculator';

export default function CreateSalaryCountdownScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { add } = useCountdowns();

  const [title, setTitle] = useState(t.home.salaryDate);
  const [icon, setIcon] = useState('💰');
  const [theme, setTheme] = useState<ThemeId>('gold');
  const [calendarType, setCalendarType] = useState<CalendarType>('gregorian');
  const [dayOfMonth, setDayOfMonth] = useState(25);
  const [adjustmentRule, setAdjustmentRule] = useState<AdjustmentRule>('smart');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate preview date
  const previewDate = useMemo(() => {
    const result = calculateNextSalaryDate({
      dayOfMonth,
      calendarType,
      adjustmentRule,
    });
    return result;
  }, [dayOfMonth, calendarType, adjustmentRule]);

  const formatPreviewDate = (isoDate: string): { hijri: string; gregorian: string } => {
    const date = new Date(isoDate);
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    const hijri = date.toLocaleDateString(`${locale}-u-ca-islamic`, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const gregorian = date.toLocaleDateString(`${locale}-u-ca-gregory`, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return { hijri, gregorian };
  };

  const handleCreate = async () => {
    setIsSubmitting(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const countdown = await add({
        title,
        targetDate: previewDate.targetDate,
        icon,
        theme,
        isPublic: false,
        isRecurring: true,
        recurrence: {
          type: 'salary',
          calendarType,
          dayOfMonth,
          adjustmentRule,
        },
      });

      if (countdown) {
        router.replace(`/countdown/${countdown.id}`);
      }
    } catch (error) {
      Alert.alert(t.error, t.salary.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPreview = formatPreviewDate(previewDate.targetDate);

  return (
    <>
      <Stack.Screen
        options={{
          title: t.home.salaryDate,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Icon */}
          <View style={styles.headerIcon}>
            <Text style={styles.bigIcon}>{icon}</Text>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{title}</Text>
          </View>

          {/* Calendar Type */}
          <CalendarTypePicker
            selectedType={calendarType}
            onSelectType={setCalendarType}
          />

          {/* Day Picker */}
          <SalaryDayPicker
            selectedDay={dayOfMonth}
            onSelectDay={setDayOfMonth}
            calendarType={calendarType}
          />

          {/* Adjustment Rule */}
          <AdjustmentRulePicker
            selectedRule={adjustmentRule}
            onSelectRule={setAdjustmentRule}
          />

          {/* Theme Picker */}
          <ThemePicker selectedTheme={theme} onSelectTheme={setTheme} />

          {/* Preview */}
          <View style={[styles.previewContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.previewHeader}>
              <Ionicons name="eye-outline" size={20} color={colors.accent} />
              <Text style={[styles.previewLabel, { color: colors.text }]}>
                {t.salary.previewNextDate}
              </Text>
            </View>
            <Text style={[styles.previewDateHijri, { color: colors.text }]}>
              {formattedPreview.hijri}
            </Text>
            <Text style={[styles.previewDateGregorian, { color: colors.textSecondary }]}>
              {formattedPreview.gregorian}
            </Text>
            {previewDate.wasAdjusted && (
              <View style={[styles.adjustedBadge, { backgroundColor: `${colors.accent}20` }]}>
                <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
                <Text style={[styles.adjustedText, { color: colors.accent }]}>
                  {t.salary.dateAdjusted}
                </Text>
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: `${colors.accent}10` }]}>
            <Ionicons name="repeat-outline" size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t.salary.autoUpdateInfo}
            </Text>
          </View>

          {/* Create Button */}
          <Pressable
            onPress={handleCreate}
            disabled={isSubmitting}
            style={[
              styles.createButton,
              { backgroundColor: colors.accent },
              isSubmitting && styles.createButtonDisabled,
            ]}
          >
            <Ionicons name="add-circle" size={24} color={colors.background} />
            <Text style={[styles.createButtonText, { color: colors.background }]}>
              {isSubmitting ? t.salary.creating : t.salary.createSalaryDate}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bigIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  previewContainer: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewDateHijri: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewDateGregorian: {
    fontSize: 14,
    textAlign: 'center',
  },
  adjustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  adjustedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
