import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSaudiHolidays, useHolidayAdmin } from '@/hooks/useSaudiHolidays';
import { ResolvedHoliday } from '@/types/saudiHolidays';
import { HIJRI_MONTH_NAMES } from '@/constants/saudiHolidays';
import { formatHijriDate } from '@/lib/hijriService';

// Admin access control - protected by PIN in settings.tsx
const ADMIN_ENABLED = true;

const COLORS = {
  accent: '#f6ad55',
  success: '#10b981',
  warning: '#f59e0b',
};

export default function AdminHolidaysScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { holidays, loading, refresh } = useSaudiHolidays();
  const { applyOverride, removeOverride, saving } = useHolidayAdmin();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  // Gate admin access in production builds
  useEffect(() => {
    if (!ADMIN_ENABLED) {
      router.replace('/');
    }
  }, []);

  // Don't render anything if admin is disabled
  if (!ADMIN_ENABLED) {
    return null;
  }

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    holiday: ResolvedHoliday | null;
    selectedDate: Date;
  }>({
    visible: false,
    holiday: null,
    selectedDate: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const openEditModal = (holiday: ResolvedHoliday) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditModal({
      visible: true,
      holiday,
      selectedDate: new Date(holiday.effective_date),
    });
  };

  const closeEditModal = () => {
    setEditModal({
      visible: false,
      holiday: null,
      selectedDate: new Date(),
    });
    setShowDatePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEditModal((prev) => ({ ...prev, selectedDate }));
    }
  };

  const handleSaveOverride = async () => {
    if (!editModal.holiday) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const dateStr = editModal.selectedDate.toISOString().split('T')[0] + 'T00:00:00';

    const success = await applyOverride(
      editModal.holiday.event_id,
      editModal.holiday.hijri_year,
      dateStr,
      'تأكيد إداري'
    );

    if (success) {
      await refresh();
      closeEditModal();
      Alert.alert('تم الحفظ', 'تم تأكيد التاريخ بنجاح');
    } else {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التاريخ');
    }
  };

  const handleClearOverride = async () => {
    if (!editModal.holiday) return;

    Alert.alert(
      'إزالة التأكيد',
      'هل تريد إزالة التاريخ المؤكد والعودة للتاريخ المحسوب؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إزالة',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const success = await removeOverride(
              editModal.holiday!.event_id,
              editModal.holiday!.hijri_year
            );

            if (success) {
              await refresh();
              closeEditModal();
            }
          },
        },
      ]
    );
  };

  const renderHolidayCard = (holiday: ResolvedHoliday) => {
    const hijriDateStr = formatHijriDate(
      holiday.hijri_year,
      holiday.hijri_month,
      holiday.hijri_day
    );

    const gregorianDate = new Date(holiday.effective_date);
    const gregorianDateStr = gregorianDate.toLocaleDateString(`${locale}-u-ca-gregory`, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return (
      <Pressable
        key={`${holiday.event_id}-${holiday.hijri_year}`}
        style={[styles.holidayCard, { backgroundColor: colors.surface }]}
        onPress={() => openEditModal(holiday)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.holidayIcon}>{holiday.icon}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.holidayName, { color: colors.text }]}>
              {holiday.name_ar}
            </Text>
            <Text style={[styles.hijriDate, { color: colors.textSecondary }]}>
              {hijriDateStr}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: holiday.is_confirmed
                  ? COLORS.success + '20'
                  : COLORS.warning + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: holiday.is_confirmed
                    ? COLORS.success
                    : COLORS.warning,
                },
              ]}
            >
              {holiday.is_confirmed ? 'مؤكد' : 'محسوب'}
            </Text>
          </View>
        </View>

        <View style={[styles.dateRow, { borderTopColor: colors.border }]}>
          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
          <Text style={[styles.gregorianDate, { color: colors.text }]}>
            {gregorianDateStr}
          </Text>
        </View>

        {holiday.override_reason && (
          <Text style={[styles.overrideReason, { color: colors.textSecondary }]}>
            {holiday.override_reason}
          </Text>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'إدارة المناسبات',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            جارٍ التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'إدارة المناسبات',
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-forward" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            المناسبات السعودية
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            اضغط على أي مناسبة لتأكيد التاريخ الرسمي
          </Text>
        </View>

        {holidays.map(renderHolidayCard)}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModal.visible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay} pointerEvents="box-none">
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={closeEditModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editModal.holiday?.icon} {editModal.holiday?.name_ar}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {editModal.holiday && (
              <View style={styles.modalBody}>
                {/* Hijri Date Info */}
                <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    التاريخ الهجري
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatHijriDate(
                      editModal.holiday.hijri_year,
                      editModal.holiday.hijri_month,
                      editModal.holiday.hijri_day
                    )}
                  </Text>
                </View>

                {/* Calculated Date */}
                <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    التاريخ المحسوب
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {new Date(editModal.holiday.calculated_gregorian_date).toLocaleDateString(
                      `${locale}-u-ca-gregory`,
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </Text>
                </View>

                {/* Date Picker Section */}
                <View style={styles.dateSection}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    التاريخ الميلادي
                  </Text>

                  {Platform.OS === 'web' ? (
                    // Web: Use HTML5 date input
                    <input
                      type="date"
                      value={editModal.selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) {
                          setEditModal((prev) => ({ ...prev, selectedDate: newDate }));
                        }
                      }}
                      style={{
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        border: 'none',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        width: '100%',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    />
                  ) : (
                    // Native: Use existing picker
                    <>
                      <Pressable
                        style={[styles.dateButton, { backgroundColor: colors.background }]}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Ionicons name="calendar" size={20} color={COLORS.accent} />
                        <Text style={[styles.dateButtonText, { color: colors.text }]}>
                          {editModal.selectedDate.toLocaleDateString(`${locale}-u-ca-gregory`, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </Pressable>
                      {(showDatePicker || Platform.OS === 'ios') && (
                        <DateTimePicker
                          value={editModal.selectedDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                          style={styles.datePicker}
                        />
                      )}
                    </>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.saveButton, { backgroundColor: COLORS.accent }]}
                    onPress={handleSaveOverride}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#000" />
                        <Text style={styles.saveButtonText}>حفظ التاريخ المؤكد</Text>
                      </>
                    )}
                  </Pressable>

                  {editModal.holiday.is_confirmed && (
                    <Pressable
                      style={[styles.clearButton, { borderColor: colors.border }]}
                      onPress={handleClearOverride}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                      <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                        إزالة التأكيد
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'right',
  },
  holidayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  holidayIcon: {
    fontSize: 32,
    marginLeft: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  holidayName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
  hijriDate: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  gregorianDate: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
  overrideReason: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      cursor: 'auto',
    }),
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'web' ? 24 : 0,
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
    ...(Platform.OS === 'web' && {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  infoSection: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  dateSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'right',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
