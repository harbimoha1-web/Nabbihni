import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import { useCountdownTick } from '@/hooks/useCountdown';
import { PublicEvent, Countdown, EventCategory } from '@/types/countdown';

// Stable keyExtractor at module level
const keyExtractor = (item: PublicEvent) => item.id;

const CATEGORY_ORDER: EventCategory[] = [
  'religious', 'national', 'education', 'tech',
  'gaming', 'sports', 'finance', 'entertainment',
  'political', 'international', 'milestone', 'seasonal',
];

const CATEGORY_ICONS: Record<string, string> = {
  religious: '🌙',
  national: '🇸🇦',
  education: '📚',
  tech: '💻',
  gaming: '🎮',
  sports: '⚽',
  finance: '💰',
  entertainment: '🎭',
  political: '🗳️',
  international: '🌍',
  milestone: '🏆',
  seasonal: '🌤️',
  others: '📌',
};

type FilterCategory = EventCategory | 'all';

// Memoized card wrapper to stabilize per-item onPress
const ExploreCard = React.memo(({
  countdown,
  event,
  onPress,
  tick,
}: {
  countdown: Countdown;
  event: PublicEvent;
  onPress: (event: PublicEvent) => void;
  tick: number;
}) => {
  const { colors } = useTheme();
  const handlePress = useCallback(() => onPress(event), [onPress, event]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardWrapper}>
        <CountdownCard
          countdown={countdown}
          onPress={handlePress}
          size="large"
          tick={tick}
        />
        {event.dateConfidence && (
          <View style={styles.badgeOverlay}>
            <DateConfidenceBadge
              confidence={event.dateConfidence}
              isHijriDerived={event.isHijriDerived}
              showLabel={true}
              size="small"
            />
          </View>
        )}
      </View>
      {event.note && (
        <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {event.note}
          </Text>
        </View>
      )}
    </View>
  );
});

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { holidays, loading, error, refresh } = useHolidays();
  const tick = useCountdownTick();

  // Only reload on focus if data is stale (> 5 minutes old)
  const lastLoadRef = useRef<number>(0);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastLoadRef.current > 5 * 60 * 1000) {
        lastLoadRef.current = now;
        refresh();
      }
    }, [refresh])
  );

  // Category labels based on current language
  const categoryLabels: Partial<Record<EventCategory, string>> = useMemo(() => ({
    religious: t.explore.religious,
    national: t.explore.national,
    seasonal: t.explore.seasonal,
    entertainment: t.explore.entertainment,
    milestone: t.explore.milestone,
    education: t.explore.education,
    international: t.explore.international,
    tech: t.explore.tech,
    finance: t.explore.finance,
    gaming: t.explore.gaming,
    sports: t.explore.sports,
    political: t.explore.political,
    others: t.explore.others,
  }), [t]);

  // Pre-compute the mapped list with stable objects
  const countdownMap = useMemo(() => {
    const map = new Map<string, Countdown>();
    for (const event of holidays) {
      map.set(event.id, {
        id: event.id,
        title: language === 'en' ? event.title : event.titleAr,
        targetDate: event.targetDate,
        icon: event.icon,
        theme: event.theme,
        isPublic: true,
        createdAt: event.targetDate,
        backgroundImage: event.backgroundImage,
      });
    }
    return map;
  }, [holidays, language]);

  // Categories that have at least one event, ordered by CATEGORY_ORDER
  const availableCategories = useMemo((): EventCategory[] => {
    const seen = new Set<EventCategory>();
    for (const event of holidays) seen.add(event.category);
    return CATEGORY_ORDER.filter(cat => seen.has(cat));
  }, [holidays]);

  // Filter events by selected category
  const filteredEvents = useMemo((): PublicEvent[] => {
    if (selectedCategory === 'all') return holidays;
    return holidays.filter(event => event.category === selectedCategory);
  }, [holidays, selectedCategory]);

  const handleChipPress = useCallback((cat: FilterCategory) => {
    setSelectedCategory(cat);
  }, []);

  const handleEventPress = useCallback((event: PublicEvent) => {
    router.push({
      pathname: '/countdown/[id]',
      params: { id: event.id, public: 'true', eventData: JSON.stringify(event) },
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: PublicEvent }) => {
    const countdown = countdownMap.get(item.id)!;
    return (
      <ExploreCard
        countdown={countdown}
        event={item}
        onPress={handleEventPress}
        tick={tick}
      />
    );
  }, [countdownMap, handleEventPress, tick]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Filter Chip Bar */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* "All" chip */}
          <Pressable
            onPress={() => handleChipPress('all')}
            style={[
              styles.filterChip,
              selectedCategory === 'all'
                ? { backgroundColor: colors.accent, borderColor: colors.accent }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[
              styles.filterChipText,
              { color: selectedCategory === 'all' ? colors.background : colors.textSecondary },
            ]}>
              {t.explore.all}
            </Text>
          </Pressable>

          {/* Category chips */}
          {availableCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => handleChipPress(cat)}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={styles.filterChipIcon}>{CATEGORY_ICONS[cat] ?? '📌'}</Text>
                <Text style={[
                  styles.filterChipText,
                  { color: isActive ? colors.background : colors.textSecondary },
                ]}>
                  {categoryLabels[cat] ?? cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error ?? '#ef4444' }]}>
            {t.explore.loadFailed}
          </Text>
          <Pressable
            onPress={refresh}
            style={[styles.retryButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.retryButtonText, { color: colors.text }]}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={7}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedCategory === 'all'
                  ? t.explore.noUpcomingEvents
                  : t.explore.noEventsInCategory}
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
    minHeight: 48,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipIcon: {
    fontSize: 13,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
