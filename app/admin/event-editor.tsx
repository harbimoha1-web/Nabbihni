import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHolidays } from '@/hooks/useHolidays';
import { useEventAdmin } from '@/hooks/useEventAdmin';
import { PublicEvent, EventCategory, ThemeId, DateConfidence } from '@/types/countdown';
import { publicEvents } from '@/constants/publicEvents';
import { EmojiPicker } from '@/components/EmojiPicker';
import { ThemePicker } from '@/components/ThemePicker';
import { EventCategoryPickerGrid } from '@/components/EventCategoryPicker';
import { DatePickerModal } from '@/components/DatePickerModal';
import { getCustomEvent, CustomEvent } from '@/lib/eventAdminStorage';
import { saveBackgroundImage, deleteBackgroundImage } from '@/lib/imageStorage';

// Admin access control - protected by PIN in settings.tsx
const ADMIN_ENABLED = true;

const COLORS = {
  accent: '#f6ad55',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

type EditorMode = 'create' | 'edit-custom' | 'edit-override';

// Date confidence options
const DATE_CONFIDENCE_OPTIONS: { id: DateConfidence; labelAr: string; labelEn: string; color: string }[] = [
  { id: 'confirmed', labelAr: 'مؤكد', labelEn: 'Confirmed', color: COLORS.success },
  { id: 'estimated', labelAr: 'تقديري', labelEn: 'Estimated', color: COLORS.warning },
  { id: 'tentative', labelAr: 'مبدئي', labelEn: 'Tentative', color: COLORS.warning },
];

interface FormData {
  titleAr: string;
  titleEn: string;
  targetDate: Date;
  icon: string;
  theme: ThemeId;
  backgroundImage?: string;
  category: EventCategory;
  note: string;
  dateConfidence: DateConfidence;
}

export default function EventEditorScreen() {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();
  const { refresh: refreshHolidays } = useHolidays();
  const {
    applyOverride,
    removeOverride,
    addEvent,
    updateEvent,
    getOverrideForEvent,
    saving,
  } = useEventAdmin();

  const params = useLocalSearchParams<{ mode: EditorMode; eventId?: string }>();
  const mode = params.mode || 'create';
  const eventId = params.eventId;

  const [loading, setLoading] = useState(true);
  const [originalEvent, setOriginalEvent] = useState<PublicEvent | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState<FormData>({
    titleAr: '',
    titleEn: '',
    targetDate: new Date(),
    icon: '🎉',
    theme: 'default' as ThemeId,
    backgroundImage: undefined,
    category: 'entertainment' as EventCategory,
    note: '',
    dateConfidence: 'confirmed' as DateConfidence,
  });

  // Gate admin access in production builds
  useEffect(() => {
    if (!ADMIN_ENABLED) {
      router.replace('/');
    }
  }, []);

  // Load event data for editing
  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);

      if (mode === 'create') {
        // Default form for new event
        setForm({
          titleAr: '',
          titleEn: '',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          icon: '🎉',
          theme: 'default',
          backgroundImage: undefined,
          category: 'entertainment',
          note: '',
          dateConfidence: 'confirmed',
        });
        setLoading(false);
        return;
      }

      if (!eventId) {
        Alert.alert('خطأ', 'لم يتم تحديد المناسبة');
        router.back();
        return;
      }

      if (mode === 'edit-custom') {
        // Load custom event
        const customEvent = await getCustomEvent(eventId);
        if (customEvent) {
          setOriginalEvent(customEvent);
          setForm({
            titleAr: customEvent.titleAr || '',
            titleEn: customEvent.title || '',
            targetDate: new Date(customEvent.targetDate),
            icon: customEvent.icon,
            theme: customEvent.theme,
            backgroundImage: customEvent.backgroundImage,
            category: customEvent.category,
            note: customEvent.note || '',
            dateConfidence: customEvent.dateConfidence || 'confirmed',
          });
        } else {
          Alert.alert('خطأ', 'لم يتم العثور على المناسبة');
          router.back();
          return;
        }
      } else if (mode === 'edit-override') {
        // Find original event from publicEvents
        const baseEvent = publicEvents.find(e => e.baseId === eventId || e.id === eventId);
        if (baseEvent) {
          setOriginalEvent(baseEvent);

          // Check if there's an existing override
          const existingOverride = getOverrideForEvent(eventId);
          const mergedData = existingOverride
            ? { ...baseEvent, ...existingOverride.changes }
            : baseEvent;

          setForm({
            titleAr: mergedData.titleAr || '',
            titleEn: mergedData.title || '',
            targetDate: new Date(mergedData.targetDate),
            icon: mergedData.icon,
            theme: mergedData.theme,
            backgroundImage: mergedData.backgroundImage,
            category: mergedData.category,
            note: mergedData.note || '',
            dateConfidence: mergedData.dateConfidence || 'confirmed',
          });
        } else {
          Alert.alert('خطأ', 'لم يتم العثور على المناسبة');
          router.back();
          return;
        }
      }

      setLoading(false);
    };

    loadEventData();
  }, [mode, eventId]);

  // Don't render anything if admin is disabled
  if (!ADMIN_ENABLED) {
    return null;
  }

  const handleSave = async () => {
    // Validation
    if (!form.titleAr.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال العنوان بالعربية');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const eventData: Partial<PublicEvent> = {
      title: form.titleEn.trim() || form.titleAr.trim(),
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim() || undefined,
      targetDate: form.targetDate.toISOString(),
      icon: form.icon,
      theme: form.theme,
      backgroundImage: form.backgroundImage,
      category: form.category,
      note: form.note.trim() || undefined,
      dateConfidence: form.dateConfidence,
    };

    let success = false;

    if (mode === 'create') {
      // Create new custom event
      const result = await addEvent({
        title: eventData.title!,
        titleAr: eventData.titleAr!,
        titleEn: eventData.titleEn,
        targetDate: eventData.targetDate!,
        icon: eventData.icon!,
        theme: eventData.theme!,
        backgroundImage: eventData.backgroundImage,
        category: eventData.category!,
        note: eventData.note,
        dateConfidence: eventData.dateConfidence,
      });
      success = result !== null;
    } else if (mode === 'edit-custom' && eventId) {
      // Update custom event
      const result = await updateEvent(eventId, eventData);
      success = result !== null;
    } else if (mode === 'edit-override' && eventId) {
      // Apply override to existing event
      success = await applyOverride(eventId, eventData);
    }

    if (success) {
      await refreshHolidays();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('تم الحفظ', 'تم حفظ التغييرات بنجاح', [
        { text: 'حسناً', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleRevert = async () => {
    if (mode !== 'edit-override' || !eventId) return;

    Alert.alert(
      'استعادة الأصلي',
      'هل تريد إزالة جميع التعديلات واستعادة البيانات الأصلية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استعادة',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const success = await removeOverride(eventId);
            if (success) {
              await refreshHolidays();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } else {
              Alert.alert('خطأ', 'حدث خطأ أثناء الاستعادة');
            }
          },
        },
      ]
    );
  };

  const getTitle = () => {
    if (mode === 'create') return 'إضافة مناسبة';
    if (mode === 'edit-custom') return 'تعديل المناسبة';
    return 'تعديل المناسبة';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: getTitle(),
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={saving || loading}
              style={styles.headerButton}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.accent} />
              ) : (
                <Text style={[styles.saveText, { color: COLORS.accent }]}>حفظ</Text>
              )}
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Arabic (Required) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              العنوان (عربي) *
            </Text>
            <TextInput
              value={form.titleAr}
              onChangeText={(text) => setForm(f => ({ ...f, titleAr: text }))}
              placeholder="مثال: رمضان ١٤٤٧"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: 'right',
                },
              ]}
            />
          </View>

          {/* Title English (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Title (English)
            </Text>
            <TextInput
              value={form.titleEn}
              onChangeText={(text) => setForm(f => ({ ...f, titleEn: text }))}
              placeholder="e.g., Ramadan 2026"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: 'left',
                },
              ]}
            />
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              التاريخ *
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="calendar" size={20} color={COLORS.accent} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {form.targetDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
            </Pressable>
          </View>

          {/* Date Confidence */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              حالة التاريخ
            </Text>
            <View style={styles.confidenceContainer}>
              {DATE_CONFIDENCE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setForm(f => ({ ...f, dateConfidence: option.id }));
                  }}
                  style={[
                    styles.confidenceButton,
                    {
                      backgroundColor: form.dateConfidence === option.id
                        ? option.color + '20'
                        : colors.surface,
                      borderColor: form.dateConfidence === option.id
                        ? option.color
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      {
                        color: form.dateConfidence === option.id
                          ? option.color
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'ar' ? option.labelAr : option.labelEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Emoji Picker */}
          <EmojiPicker
            selectedEmoji={form.icon}
            onSelectEmoji={(icon) => setForm(f => ({ ...f, icon }))}
          />

          {/* Theme Picker */}
          <ThemePicker
            selectedTheme={form.theme}
            onSelectTheme={(theme) => setForm(f => ({ ...f, theme }))}
          />

          {/* Background Image - Admin Section */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {language === 'ar' ? 'صورة الخلفية' : 'Background Image'}
            </Text>
            <View
              style={[
                styles.imagePickerContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: form.backgroundImage ? COLORS.accent : colors.border,
                },
              ]}
            >
              {/* Image Preview */}
              <View style={styles.imagePreviewContainer}>
                {form.backgroundImage ? (
                  <Image
                    source={{ uri: form.backgroundImage }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={styles.imagePlaceholderEmoji}>🖼️</Text>
                  </View>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.imageButtonsContainer}>
                <Pressable
                  onPress={async () => {
                    Haptics.selectionAsync();
                    try {
                      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (!permissionResult.granted) {
                        Alert.alert(
                          language === 'ar' ? 'صلاحية مطلوبة' : 'Permission Required',
                          language === 'ar' ? 'يرجى السماح بالوصول للصور' : 'Please allow photo access'
                        );
                        return;
                      }

                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        allowsEditing: true,
                        aspect: [16, 9],
                        quality: 0.8,
                      });

                      if (!result.canceled && result.assets[0]) {
                        // Save to persistent storage
                        const savedUri = await saveBackgroundImage(result.assets[0].uri);
                        // Delete old image if exists
                        if (form.backgroundImage) {
                          await deleteBackgroundImage(form.backgroundImage);
                        }
                        setForm(f => ({ ...f, backgroundImage: savedUri }));
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    } catch (error) {
                      console.error('Error picking image:', error);
                      Alert.alert(
                        language === 'ar' ? 'خطأ' : 'Error',
                        language === 'ar' ? 'فشل اختيار الصورة' : 'Failed to pick image'
                      );
                    }
                  }}
                  style={[styles.imageButton, { backgroundColor: COLORS.accent }]}
                >
                  <Ionicons name="image-outline" size={18} color="#000" />
                  <Text style={styles.imageButtonText}>
                    {language === 'ar' ? 'اختر صورة' : 'Pick Image'}
                  </Text>
                </Pressable>

                {form.backgroundImage && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert(
                        language === 'ar' ? 'حذف الصورة' : 'Remove Image',
                        language === 'ar' ? 'هل تريد حذف صورة الخلفية؟' : 'Remove background image?',
                        [
                          { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                          {
                            text: language === 'ar' ? 'حذف' : 'Remove',
                            style: 'destructive',
                            onPress: async () => {
                              if (form.backgroundImage) {
                                await deleteBackgroundImage(form.backgroundImage);
                              }
                              setForm(f => ({ ...f, backgroundImage: undefined }));
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            },
                          },
                        ]
                      );
                    }}
                    style={[styles.imageButton, { backgroundColor: COLORS.danger + '20', borderColor: COLORS.danger, borderWidth: 1 }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    <Text style={[styles.imageButtonText, { color: COLORS.danger }]}>
                      {language === 'ar' ? 'حذف' : 'Remove'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Category Picker */}
          <EventCategoryPickerGrid
            selectedCategory={form.category}
            onSelectCategory={(category) => setForm(f => ({ ...f, category }))}
          />

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              ملاحظة / معلومة
            </Text>
            <TextInput
              value={form.note}
              onChangeText={(text) => setForm(f => ({ ...f, note: text }))}
              placeholder="معلومة مميزة عن المناسبة..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: 'right',
                },
              ]}
            />
          </View>

          {/* Revert Button (only for edit-override mode with existing override) */}
          {mode === 'edit-override' && getOverrideForEvent(eventId || '') && (
            <Pressable
              onPress={handleRevert}
              style={[styles.revertButton, { borderColor: COLORS.danger }]}
            >
              <Ionicons name="refresh-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.revertText, { color: COLORS.danger }]}>
                استعادة الأصلي
              </Text>
            </Pressable>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: COLORS.accent }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#000" />
                <Text style={styles.saveButtonText}>حفظ</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        date={form.targetDate}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setForm(f => ({ ...f, targetDate: date }));
          setShowDatePicker(false);
        }}
      />
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
  headerButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  confidenceContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  confidenceButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  revertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 16,
  },
  revertText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  // Background Image Picker styles
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  imagePreviewContainer: {
    width: 100,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  imagePlaceholderEmoji: {
    fontSize: 28,
  },
  imageButtonsContainer: {
    flex: 1,
    gap: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
