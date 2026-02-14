import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { ThemePicker } from '@/components/ThemePicker';
import { EmojiPicker } from '@/components/EmojiPicker';
import { DatePickerModal } from '@/components/DatePickerModal';
import { useCountdowns, useSingleCountdown } from '@/hooks/useCountdowns';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useSubscription } from '@/hooks/useSubscription';
import { ThemeId, RecurrenceSettings, ReminderOption, ReminderTiming } from '@/types/countdown';

export default function CreateCountdownScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const { add, update: updateCountdown } = useCountdowns();
  const { scheduleNotifications, cancelNotifications } = useNotifications();
  const { isPremium, showPremiumFeaturePrompt } = useSubscription();

  // Edit mode support
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const isEditMode = mode === 'edit' && !!id;
  const { countdown: existingCountdown, loading: loadingExisting } = useSingleCountdown(isEditMode ? id : '');

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [icon, setIcon] = useState('🎉');
  const [theme, setTheme] = useState<ThemeId>('default');
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recurring countdown settings (premium only)
  const [isRecurring, setIsRecurring] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(!isEditMode);

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

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && existingCountdown && !isFormInitialized) {
      setTitle(existingCountdown.title);
      setNote(existingCountdown.note || '');
      setTargetDate(new Date(existingCountdown.targetDate));
      setIcon(existingCountdown.icon);
      setTheme(existingCountdown.theme);
      setBackgroundImage(existingCountdown.backgroundImage);
      setIsRecurring(existingCountdown.isRecurring || false);
      // Load existing reminder timings
      if (existingCountdown.reminderTiming && Array.isArray(existingCountdown.reminderTiming)) {
        // Standard reminders (strings)
        const standardTimings = existingCountdown.reminderTiming.filter(
          (t): t is ReminderOption => typeof t === 'string'
        );
        if (standardTimings.length > 0) {
          setSelectedReminders(standardTimings);
        }

        // Custom reminders (objects with offsetMinutes)
        const customTimings = existingCountdown.reminderTiming
          .filter((t): t is { type: 'custom'; offsetMinutes: number } =>
            typeof t === 'object' && t !== null && 'type' in t && t.type === 'custom'
          )
          .map(t => t.offsetMinutes);
        if (customTimings.length > 0) {
          setCustomReminders(customTimings);
        }
      }
      setIsFormInitialized(true);
    }
  }, [isEditMode, existingCountdown, isFormInitialized]);

  // Build recurrence settings based on selections
  const recurrenceSettings = useMemo((): RecurrenceSettings | undefined => {
    if (!isRecurring) return undefined;

    return {
      type: 'yearly',
      calendarType: 'gregorian',
      dayOfMonth: targetDate.getDate(),
      adjustmentRule: 'smart',
    };
  }, [isRecurring, targetDate]);

  const handleRecurringToggle = (value: boolean) => {
    if (value && !isPremium) {
      showPremiumFeaturePrompt('recurring');
      return;
    }
    setIsRecurring(value);
  };

  const handleDateConfirm = (selectedDate: Date) => {
    const newDate = new Date(selectedDate);
    // Preserve the time from current targetDate
    newDate.setHours(targetDate.getHours(), targetDate.getMinutes());
    setTargetDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(targetDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setTargetDate(newDate);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert(t.error, t.create.errorNoTitle);
      return;
    }

    if (targetDate <= new Date()) {
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

      if (isEditMode && id) {
        // Update existing countdown
        const updated = await updateCountdown(id, {
          title: title.trim(),
          targetDate: targetDate.toISOString(),
          icon,
          theme,
          isRecurring: isRecurring,
          recurrence: recurrenceSettings,
          backgroundImage,
          reminderTiming,
          note: note.trim() || undefined,
        });

        if (updated) {
          // Reschedule notifications for the updated countdown
          await cancelNotifications(id);
          await scheduleNotifications(updated);
          router.back();
        }
      } else {
        // Create new countdown
        const countdown = await add({
          title: title.trim(),
          targetDate: targetDate.toISOString(),
          icon,
          theme,
          isPublic: false,
          isRecurring: isRecurring,
          recurrence: recurrenceSettings,
          backgroundImage,
          reminderTiming,
          note: note.trim() || undefined,
        });

        if (countdown) {
          // Schedule notifications for the new countdown
          await scheduleNotifications(countdown);
          router.replace(`/countdown/${countdown.id}`);
        }
      }
    } catch (error) {
      Alert.alert(t.error, t.create.errorCreate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    // Show both Hijri and Gregorian
    const hijri = date.toLocaleDateString(`${locale}-u-ca-islamic`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const gregorian = date.toLocaleDateString(`${locale}-u-ca-gregory`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${hijri} | ${gregorian}`;
  };

  const formatTime = (date: Date): string => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state while fetching existing countdown in edit mode
  if (isEditMode && loadingExisting) {
    return (
      <>
        <Stack.Screen
          options={{
            title: t.edit.title,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t.loading}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? t.edit.title : t.create.title,
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
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.create.countdownTitle}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t.create.titlePlaceholder}
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>

          {/* Note Input */}
          <View style={styles.inputGroup}>
            <View style={[styles.noteLabelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                {t.create.note}
              </Text>
              <Text style={[styles.noteOptional, { color: colors.textSecondary }]}>
                {t.create.noteOptional}
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                styles.noteInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder={t.create.notePlaceholder}
              placeholderTextColor={colors.textSecondary}
              maxLength={500}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={[styles.charCounter, { color: colors.textSecondary, textAlign: isRTL ? 'left' : 'right' }]}>
              {note.length}/500
            </Text>
          </View>

          {/* Date & Time Pickers */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.create.dateTime}
            </Text>
            <View style={styles.dateTimeRow}>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.dateTimeText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {formatDate(targetDate)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={[
                  styles.dateTimeButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={20} color={colors.accent} />
                <Text style={[styles.dateTimeText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {formatTime(targetDate)}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Emoji Picker */}
          <EmojiPicker selectedEmoji={icon} onSelectEmoji={setIcon} />

          {/* Theme Picker */}
          <ThemePicker
            selectedTheme={theme}
            onSelectTheme={setTheme}
            backgroundImage={backgroundImage}
            onBackgroundImageChange={setBackgroundImage}
          />

          {/* Reminder Options */}
          <View style={styles.inputGroup}>
            <View style={styles.reminderHeader}>
              <Ionicons name="notifications-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.text, marginBottom: 0, marginLeft: 8 }]}>
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
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

          {/* Recurring Options (Premium) */}
          <View style={styles.inputGroup}>
            <View style={[styles.recurringHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.recurringHeaderContent}>
                <View style={styles.recurringTitleRow}>
                  <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                    {t.create.recurring}
                  </Text>
                  {!isPremium && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.recurringSubtitle, { color: colors.textSecondary }]}>
                  {t.create.recurringDesc}
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={handleRecurringToggle}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>

            {isRecurring && (
              <View style={[styles.recurrenceInfo, { backgroundColor: colors.accent + '10', marginTop: 12 }]}>
                <Ionicons name="repeat-outline" size={18} color={colors.accent} />
                <Text style={[styles.recurrenceInfoText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t.create.recurringInfo}
                </Text>
              </View>
            )}
          </View>

          {/* Create/Save Button */}
          <Pressable
            onPress={handleCreate}
            disabled={isSubmitting}
            style={[
              styles.createButton,
              { backgroundColor: colors.accent },
              isSubmitting && styles.createButtonDisabled,
            ]}
          >
            <Ionicons name={isEditMode ? "checkmark-circle" : "add-circle"} size={24} color={colors.background} />
            <Text style={[styles.createButtonText, { color: colors.background }]}>
              {isSubmitting
                ? (isEditMode ? t.edit.saving : t.create.creating)
                : (isEditMode ? t.edit.saveButton : t.create.createButton)}
            </Text>
          </Pressable>
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={showDatePicker}
          date={targetDate}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateConfirm}
          minimumDate={new Date()}
        />

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={targetDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
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
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  noteLabelRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  noteOptional: {
    fontSize: 13,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  charCounter: {
    fontSize: 12,
    marginTop: 6,
  },
  dateTimeRow: {
    gap: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
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
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  recurringHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  recurringTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurringSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  recurrenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
  },
  recurrenceInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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
