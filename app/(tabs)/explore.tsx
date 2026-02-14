import React, { useCallback, useMemo, useRef, useState } from 'react';
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

type CategoryFilter = 'all' | EventCategory;

// Stable keyExtractor at module level
const keyExtractor = (item: PublicEvent) => item.id;

// Card height (230) + marginBottom (16) for getItemLayout
const ITEM_HEIGHT = 230 + 16;

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
  const { holidays, loading, refresh } = useHolidays();
  const tick = useCountdownTick();

  // Only reload on focus if data is stale (> 5 minutes old)
  const lastLoadRef = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastLoadRef.current > 5 * 60 * 1000) {
        lastLoadRef.current = now;
        refresh();
      }
    }, [refresh])
  );
  const [filter, setFilter] = useState<CategoryFilter>('all');

  // Category labels based on current language
  const categoryLabels: Record<CategoryFilter, string> = useMemo(() => ({
    all: t.explore.all,
    religious: t.explore.religious,
    national: t.explore.national,
    seasonal: t.explore.seasonal,
    entertainment: t.explore.entertainment,
    milestone: t.explore.milestone,
    education: t.explore.education,
    international: t.explore.international,
  }), [t]);

  // Pre-compute the mapped list with stable objects (no new Date() per render)
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
        createdAt: event.targetDate, // Stable proxy instead of new Date().toISOString()
        backgroundImage: event.backgroundImage,
      });
    }
    return map;
  }, [holidays, language]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return holidays;
    return holidays.filter((event) => event.category === filter);
  }, [holidays, filter]);

  const handleEventPress = useCallback((event: PublicEvent) => {
    router.push({
      pathname: '/countdown/[id]',
      params: { id: event.id, public: 'true', eventData: JSON.stringify(event) },
    });
  }, []);

  // Get categories that have events
  const availableCategories = useMemo(() => {
    const categories = new Set(holidays.map(h => h.category));
    return ['all', ...Array.from(categories)] as CategoryFilter[];
  }, [holidays]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

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
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
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
