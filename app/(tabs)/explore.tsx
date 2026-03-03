import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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
};

type SectionData = {
  category: EventCategory;
  title: string;
  icon: string;
  data: PublicEvent[];
};

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

const SectionHeader = React.memo(({
  icon,
  title,
  colors,
}: {
  icon: string;
  title: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
    <Text style={styles.sectionIcon}>{icon}</Text>
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
  </View>
));

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { holidays, loading, error, refresh } = useHolidays();
  const tick = useCountdownTick();
  const sectionListRef = useRef<SectionList<PublicEvent, SectionData>>(null);

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

  // Group events into sections ordered by CATEGORY_ORDER
  const sections = useMemo<SectionData[]>(() => {
    const grouped: Partial<Record<EventCategory, PublicEvent[]>> = {};
    for (const event of holidays) {
      if (!grouped[event.category]) grouped[event.category] = [];
      grouped[event.category]!.push(event);
    }
    return CATEGORY_ORDER
      .filter(cat => (grouped[cat]?.length ?? 0) > 0)
      .map(cat => ({
        category: cat,
        title: categoryLabels[cat] ?? cat,
        icon: CATEGORY_ICONS[cat] ?? '📌',
        data: grouped[cat]!,
      }));
  }, [holidays, categoryLabels]);

  const handleJumpToSection = useCallback((sectionIndex: number) => {
    sectionListRef.current?.scrollToLocation({
      animated: true,
      sectionIndex,
      itemIndex: 0,
      viewPosition: 0,
    });
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

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <SectionHeader
      icon={section.icon}
      title={section.title}
      colors={colors}
    />
  ), [colors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Hijri date disclaimer */}
      <View style={[styles.disclaimerContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          {t.explore.hijriDisclaimer}
        </Text>
      </View>

      {/* Jump Anchor Bar */}
      <View style={styles.anchorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.anchorContainer}
        >
          {sections.map((section, index) => (
            <Pressable
              key={section.category}
              onPress={() => handleJumpToSection(index)}
              style={[
                styles.anchorChip,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={styles.anchorIcon}>{section.icon}</Text>
              <Text style={[styles.anchorText, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            </Pressable>
          ))}
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
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onScrollToIndexFailed={() => {}}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={7}
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
  anchorWrapper: {
    minHeight: 48,
  },
  anchorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  anchorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  anchorIcon: {
    fontSize: 13,
  },
  anchorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  disclaimerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'right',
  },
});
