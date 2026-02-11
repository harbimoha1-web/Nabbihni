import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHolidays } from '@/hooks/useHolidays';
import { useEventAdmin } from '@/hooks/useEventAdmin';
import { PublicEvent, EventCategory } from '@/types/countdown';
import { publicEvents } from '@/constants/publicEvents';
import { getCategoryInfo } from '@/components/EventCategoryPicker';
import { isCustomEvent } from '@/lib/eventAdminStorage';

// Admin access control - protected by PIN in settings.tsx
// No need for __DEV__ guard here since PIN modal handles authentication
const ADMIN_ENABLED = true;

const COLORS = {
  accent: '#f6ad55',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  danger: '#ef4444',
};

type CategoryFilter = 'all' | EventCategory;

export default function AdminEventsScreen() {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();
  const { holidays, loading: holidaysLoading, refresh: refreshHolidays } = useHolidays();
  const { overrides, customEvents, loading: adminLoading, deleteEvent, saving } = useEventAdmin();
  const [filter, setFilter] = useState<CategoryFilter>('all');

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

  // Combine holidays with info about whether they are modified/custom
  const eventsWithStatus = useMemo(() => {
    const events: (PublicEvent & { isModified: boolean; isCustom: boolean })[] = [];

    // Add all holidays (already merged with overrides in useHolidays)
    holidays.forEach(holiday => {
      const isModified = overrides.some(o => o.eventId === (holiday.baseId || holiday.id));
      const isCustom = isCustomEvent(holiday.id);
      events.push({ ...holiday, isModified, isCustom });
    });

    return events;
  }, [holidays, overrides]);

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return eventsWithStatus;
    return eventsWithStatus.filter(e => e.category === filter);
  }, [eventsWithStatus, filter]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = new Set(eventsWithStatus.map(e => e.category));
    return ['all', ...Array.from(categories)] as CategoryFilter[];
  }, [eventsWithStatus]);

  const handleAddEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin/event-editor?mode=create');
  };

  const handleEditEvent = (event: PublicEvent & { isModified: boolean; isCustom: boolean }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const eventId = event.baseId || event.id;
    const mode = event.isCustom ? 'edit-custom' : 'edit-override';
    router.push(`/admin/event-editor?mode=${mode}&eventId=${encodeURIComponent(eventId)}`);
  };

  const handleDeleteEvent = (event: PublicEvent & { isModified: boolean; isCustom: boolean }) => {
    if (!event.isCustom) {
      Alert.alert(
        'غير مسموح',
        'لا يمكن حذف المناسبات الأصلية. يمكنك فقط تعديلها.',
        [{ text: 'حسناً' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'حذف المناسبة',
      `هل تريد حذف "${event.titleAr || event.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEvent(event.id);
            if (success) {
              await refreshHolidays();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
            }
          },
        },
      ]
    );
  };

  const getCategoryLabel = (cat: CategoryFilter): string => {
    if (cat === 'all') return language === 'ar' ? 'الكل' : 'All';
    const info = getCategoryInfo(cat, language as 'ar' | 'en');
    return info ? `${info.icon} ${info.label}` : cat;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEventCard = (event: PublicEvent & { isModified: boolean; isCustom: boolean }) => {
    const categoryInfo = getCategoryInfo(event.category, language as 'ar' | 'en');

    return (
      <Pressable
        key={event.id}
        onPress={() => handleEditEvent(event)}
        onLongPress={() => handleDeleteEvent(event)}
        delayLongPress={500}
        style={[styles.eventCard, { backgroundColor: colors.surface }]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.eventIcon}>{event.icon}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
              {language === 'ar' ? event.titleAr : event.title}
            </Text>
            <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
              {formatDate(event.targetDate)}
            </Text>
          </View>

          {/* Status Badges */}
          <View style={styles.badgesContainer}>
            {event.isCustom && (
              <View style={[styles.badge, { backgroundColor: COLORS.info + '20' }]}>
                <Text style={[styles.badgeText, { color: COLORS.info }]}>مخصص</Text>
              </View>
            )}
            {event.isModified && !event.isCustom && (
              <View style={[styles.badge, { backgroundColor: COLORS.warning + '20' }]}>
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>معدل</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          {categoryInfo && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
              <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                {categoryInfo.label}
              </Text>
            </View>
          )}

          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>
    );
  };

  const loading = holidaysLoading || adminLoading;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'إدارة مناسبات الاستكشاف',
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
          title: 'إدارة مناسبات الاستكشاف',
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-forward" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleAddEvent} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color={COLORS.accent} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            مناسبات الاستكشاف
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            اضغط للتعديل • اضغط مطولاً للحذف (المخصصة فقط)
          </Text>
        </View>

        {/* Add Event Button */}
        <Pressable
          onPress={handleAddEvent}
          style={[styles.addEventButton, { backgroundColor: COLORS.accent }]}
        >
          <Ionicons name="add-circle-outline" size={22} color="#000" />
          <Text style={styles.addEventText}>اضافة مناسبة</Text>
        </Pressable>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          {availableCategories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(cat);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === cat ? colors.accent : colors.surface,
                  borderColor: filter === cat ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: filter === cat ? colors.background : colors.text },
                ]}
              >
                {getCategoryLabel(cat)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>
              {eventsWithStatus.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              إجمالي
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: COLORS.info }]}>
              {customEvents.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              مخصص
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>
              {overrides.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              معدل
            </Text>
          </View>
        </View>

        {/* Event List */}
        <View style={styles.eventsList}>
          {filteredEvents.map(renderEventCard)}
        </View>

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد مناسبات في هذا التصنيف
            </Text>
          </View>
        )}
      </ScrollView>
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
  addButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'right',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  addEventText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  eventIcon: {
    fontSize: 32,
  },
  cardTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  eventDate: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
