import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import CountdownCard from '@/components/CountdownCard';
import DateConfidenceBadge from '@/components/DateConfidenceBadge';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHolidays } from '@/hooks/useHolidays';
import { PublicEvent, Countdown, EventCategory } from '@/types/countdown';

type CategoryFilter = 'all' | EventCategory;

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { holidays, loading, refresh } = useHolidays();

  // Refresh data when screen gains focus (picks up admin changes)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );
  const [filter, setFilter] = useState<CategoryFilter>('all');

  // Category labels based on current language
  const categoryLabels: Record<CategoryFilter, string> = {
    all: t.explore.all,
    religious: t.explore.religious,
    national: t.explore.national,
    seasonal: t.explore.seasonal,
    entertainment: t.explore.entertainment,
    milestone: t.explore.milestone,
    education: t.explore.education,
    international: t.explore.international,
  };

  // Convert public event to countdown format, using correct language title
  const publicEventToCountdown = (event: PublicEvent): Countdown & { _event: PublicEvent } => ({
    id: event.id,
    title: language === 'en' ? event.title : event.titleAr,
    targetDate: event.targetDate,
    icon: event.icon,
    theme: event.theme,
    isPublic: true,
    createdAt: new Date().toISOString(),
    participantCount: event.participantCount,
    backgroundImage: event.backgroundImage,
    _event: event, // Store original event for confidence badge
  });

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return holidays;
    return holidays.filter((event) => event.category === filter);
  }, [holidays, filter]);

  const handleEventPress = (event: PublicEvent) => {
    router.push(`/countdown/${event.id}?public=true`);
  };

  // Get categories that have events
  const availableCategories = useMemo(() => {
    const categories = new Set(holidays.map(h => h.category));
    return ['all', ...Array.from(categories)] as CategoryFilter[];
  }, [holidays]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Filter Chips - Horizontal Scroll */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {availableCategories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setFilter(cat)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === cat ? colors.accent : colors.surface,
                  borderWidth: 1,
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
                {categoryLabels[cat]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const countdownWithEvent = publicEventToCountdown(item);
            return (
              <View style={styles.cardContainer}>
                {/* Card with badge overlay - badge relative to card only */}
                <View style={styles.cardWrapper}>
                  <CountdownCard
                    countdown={countdownWithEvent}
                    onPress={() => handleEventPress(item)}
                    size="large"
                  />
                  {/* Show confidence badge only for events with dateConfidence */}
                  {item.dateConfidence && (
                    <View style={styles.badgeOverlay}>
                      <DateConfidenceBadge
                        confidence={item.dateConfidence}
                        isHijriDerived={item.isHijriDerived}
                        showLabel={true}
                        size="small"
                      />
                    </View>
                  )}
                </View>
                {/* Note shown below the card, not overlapping badge */}
                {item.note && (
                  <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                      {item.note}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t.explore.noUpcomingEvents}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    minHeight: 56,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardWrapper: {
    position: 'relative',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 1,
  },
  noteContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
