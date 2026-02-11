import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemePicker } from '@/components/ThemePicker';
import { DatePickerModal } from '@/components/DatePickerModal';
import { useCountdowns } from '@/hooks/useCountdowns';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeId, ReminderOption, ReminderTiming, CustomReminderTiming } from '@/types/countdown';
import { getTemplateById, governmentTemplates } from '@/constants/governmentTemplates';
import { TemplateId } from '@/types/templates';

export default function CreateTemplateCountdownScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { add } = useCountdowns();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();

  // Get template or default to first one
  const template = useMemo(() => {
    return getTemplateById(templateId || 'id-card') || governmentTemplates[0];
  }, [templateId]);

  const [title, setTitle] = useState(language === 'ar' ? template.titleAr : template.titleEn);
  const [icon, setIcon] = useState(template.icon);
  const [theme, setTheme] = useState<ThemeId>(template.theme);
  // Initialize to tomorrow to pass future date validation
  const [expiryDate, setExpiryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reminder settings - ALL options selected by default
  const [selectedReminders, setSelectedReminders] = useState<ReminderOption[]>([
    'at_completion', '1_hour', '1_day', '1_week'
  ]);

  // Custom reminders (in minutes)
  const [customReminders, setCustomReminders] = useState<number[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  // Reminder option labels
  const reminderLabels: Record<ReminderOption, string> = {
    at_completion: t.reminders.atCompletion,
    '1_hour': t.reminders.oneHour,
    '1_day': t.reminders.oneDay,
    '1_week': t.reminders.oneWeek,
    custom: t.reminders.custom,
  };

  const handleReminderToggle = (reminder: ReminderOption) => {
    setSelectedReminders(prev => {
      if (prev.includes(reminder)) {
        // Allow removing all standard reminders if custom ones exist
        if (prev.length === 1 && customReminders.length === 0) return prev;
        return prev.filter(r => r !== reminder);
      }
      return [...prev, reminder];
    });
  };

  const handleAddCustomReminder = () => {
    const days = parseInt(customDays) || 0;
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;

    const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;

    if (totalMinutes <= 0) {
      return;
    }

    // Add if not already exists
    if (!customReminders.includes(totalMinutes)) {
      setCustomReminders(prev => [...prev, totalMinutes].sort((a, b) => b - a));
    }

    // Reset and close
    setCustomDays('');
    setCustomHours('');
    setCustomMinutes('');
    setShowCustomModal(false);
  };

  const handleRemoveCustomReminder = (minutes: number) => {
    setCustomReminders(prev => prev.filter(m => m !== minutes));
  };

  const formatCustomReminder = (totalMinutes: number): string => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const mins = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} ${t.reminders.days}`);
    if (hours > 0) parts.push(`${hours} ${t.reminders.hours}`);
    if (mins > 0) parts.push(`${mins} ${t.reminders.minutes}`);

    return `${parts.join(' ')} ${t.reminders.before}`;
  };

  const formatDate = (date: Date): { hijri: string; gregorian: string } => {
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
    // Validate date is in the future
    if (expiryDate <= new Date()) {
      Alert.alert(t.error, t.create.errorPastDate);
      return;
    }

    setIsSubmitting(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Build reminder timing array with both standard and custom reminders
      const reminderTiming: ReminderTiming[] = [
        ...selectedReminders,
        ...customReminders.map(mins => ({ type: 'custom' as const, offsetMinutes: mins })),
      ];

      // Build countdown data
      const countdownData: Parameters<typeof add>[0] = {
        title,
        targetDate: expiryDate.toISOString(),
        icon,
        theme,
        isPublic: false,
        isRecurring: template.isRecurring || false,
        reminderTiming,
      };

      // Add recurrence settings for recurring templates (like rent)
      if (template.isRecurring && template.recurrenceType) {
        countdownData.recurrence = {
          type: template.recurrenceType,
          calendarType: template.preferredCalendar,
          dayOfMonth: expiryDate.getDate(),
          adjustmentRule: 'none',
        };
      }

      const countdown = await add(countdownData);

      if (countdown) {
        router.replace(`/countdown/${countdown.id}`);
      }
    } catch (error) {
      Alert.alert(t.error, t.create.errorCreate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = formatDate(expiryDate);

  return (
    <>
      <Stack.Screen
        options={{
          title: language === 'ar' ? template.titleAr : template.titleEn,
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
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {language === 'ar' ? template.descriptionAr : template.descriptionEn}
            </Text>
          </View>

          {/* Date Picker Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.templates.expiryDate}
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.dateButton, { borderColor: colors.accent }]}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.accent} />
              <View style={styles.dateTextContainer}>
                <Text style={[styles.dateTextHijri, { color: colors.text }]}>
                  {formattedDate.hijri}
                </Text>
                <Text style={[styles.dateTextGregorian, { color: colors.textSecondary }]}>
                  {formattedDate.gregorian}
                </Text>
              </View>
            </Pressable>
          </View>

          <DatePickerModal
            visible={showDatePicker}
            date={expiryDate}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(selectedDate) => {
              setExpiryDate(selectedDate);
              setShowDatePicker(false);
            }}
            minimumDate={new Date()}
          />

          {/* Recurring Info (for rent, etc.) */}
          {template.isRecurring && (
            <View style={[styles.infoBox, { backgroundColor: `${colors.accent}10` }]}>
              <Ionicons name="repeat" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  {t.countdown.recurringCountdown}
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {t.create.recurringInfo}
                </Text>
              </View>
            </View>
          )}

          {/* Reminder Options */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <Ionicons name="alarm-outline" size={20} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>
                {t.settings.whenToRemind}
              </Text>
            </View>
            <View style={styles.reminderOptions}>
              {(['at_completion', '1_hour', '1_day', '1_week'] as ReminderOption[]).map((reminder) => {
                const isSelected = selectedReminders.includes(reminder);
                return (
                  <Pressable
                    key={reminder}
                    onPress={() => handleReminderToggle(reminder)}
                    style={[
                      styles.reminderOption,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && { borderColor: colors.accent, backgroundColor: colors.accent + '20' },
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.reminderOptionText,
                        { color: isSelected ? colors.accent : colors.textSecondary },
                      ]}
                    >
                      {reminderLabels[reminder]}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Custom Reminder Button */}
              <Pressable
                onPress={() => setShowCustomModal(true)}
                style={[
                  styles.reminderOption,
                  styles.customReminderButton,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' },
                ]}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={[styles.reminderOptionText, { color: colors.accent }]}>
                  {t.reminders.custom}
                </Text>
              </Pressable>
            </View>

            {/* Custom Reminders List */}
            {customReminders.length > 0 && (
              <View style={styles.customRemindersList}>
                {customReminders.map((minutes) => (
                  <View
                    key={minutes}
                    style={[styles.customReminderChip, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
                  >
                    <Text style={[styles.customReminderText, { color: colors.accent }]}>
                      {formatCustomReminder(minutes)}
                    </Text>
                    <Pressable onPress={() => handleRemoveCustomReminder(minutes)} hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color={colors.accent} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Custom Reminder Modal */}
          <Modal
            visible={showCustomModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCustomModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t.reminders.customReminderTitle}
                </Text>

                <View style={styles.customInputsRow}>
                  <View style={styles.customInputGroup}>
                    <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>
                      {t.reminders.days}
                    </Text>
                    <TextInput
                      style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      value={customDays}
                      onChangeText={setCustomDays}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.customInputGroup}>
                    <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>
                      {t.reminders.hours}
                    </Text>
                    <TextInput
                      style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      value={customHours}
                      onChangeText={setCustomHours}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      maxLength={2}
                    />
                  </View>

                  <View style={styles.customInputGroup}>
                    <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>
                      {t.reminders.minutes}
                    </Text>
                    <TextInput
                      style={[styles.customInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      value={customMinutes}
                      onChangeText={setCustomMinutes}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      maxLength={2}
                    />
                  </View>
                </View>

                <Text style={[styles.customPreview, { color: colors.textSecondary }]}>
                  {t.reminders.before}
                </Text>

                <View style={styles.modalButtons}>
                  <Pressable
                    onPress={() => setShowCustomModal(false)}
                    style={[styles.modalButton, { backgroundColor: colors.background }]}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>{t.cancel}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddCustomReminder}
                    style={[styles.modalButton, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.background }]}>{t.reminders.add}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Theme Picker */}
          <ThemePicker selectedTheme={theme} onSelectTheme={setTheme} />

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
              {isSubmitting ? t.templates.creating : t.templates.createReminder}
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
    marginBottom: 24,
  },
  bigIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateTextHijri: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTextGregorian: {
    fontSize: 14,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
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
  reminderSection: {
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  reminderOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customReminderButton: {
    borderStyle: 'dashed',
  },
  customRemindersList: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customReminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  customReminderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  customInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  customInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  customInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  customInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  customPreview: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
