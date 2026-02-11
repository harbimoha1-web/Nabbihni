import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCountdowns } from '@/hooks/useCountdowns';
import CountdownCard from '@/components/CountdownCard';
import CardActionSheet from '@/components/CardActionSheet';
import AdBanner from '@/components/AdBanner';
import CategoryFilter from '@/components/CategoryFilter';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Countdown } from '@/types/countdown';
import { governmentTemplates } from '@/constants/governmentTemplates';

// Interval for showing ads between cards (every 5th item after processing pairs)
const AD_INTERVAL = 5;

type ListItem =
  | { type: 'countdown-pair'; data: [Countdown, Countdown | null] }
  | { type: 'ad'; id: string };

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { countdowns, loading, error, refresh, toggleStar, remove } = useCountdowns();
  const { checkAndPromptForUpgrade, isPremium, showPremiumFeaturePrompt, shouldShowAds } = useSubscription();

  // Separate state for pull-to-refresh (decoupled from loading state to fix flicker)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Category filter state (null = show all)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Action sheet state
  const [selectedCountdown, setSelectedCountdown] = useState<Countdown | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Filter countdowns by selected category
  const filteredCountdowns = useMemo(() => {
    if (selectedCategory === null) {
      return countdowns;
    }
    return countdowns.filter((countdown) => countdown.icon === selectedCategory);
  }, [countdowns, selectedCategory]);

  // Process countdowns into pairs with ads interspersed
  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    let pairCount = 0;

    for (let i = 0; i < filteredCountdowns.length; i += 2) {
      const pair: [Countdown, Countdown | null] = [
        filteredCountdowns[i],
        filteredCountdowns[i + 1] || null,
      ];
      items.push({ type: 'countdown-pair', data: pair });
      pairCount++;

      // Insert ad after every AD_INTERVAL pairs (for free users)
      if (shouldShowAds && pairCount % AD_INTERVAL === 0 && i + 2 < filteredCountdowns.length) {
        items.push({ type: 'ad', id: `ad-${pairCount}` });
      }
    }

    return items;
  }, [filteredCountdowns, shouldShowAds]);

  const handleCreatePress = () => {
    if (checkAndPromptForUpgrade(countdowns.length)) {
      router.push('/countdown/create');
    }
  };

  // Refresh countdowns when screen comes into focus
  // Note: Empty dependency array to prevent infinite loop
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const handleCountdownPress = (countdown: Countdown) => {
    router.push(`/countdown/${countdown.id}`);
  };

  const handleCountdownLongPress = (countdown: Countdown) => {
    setSelectedCountdown(countdown);
    setActionSheetVisible(true);
  };

  const handleActionSheetClose = () => {
    setActionSheetVisible(false);
    setSelectedCountdown(null);
  };

  const handleStarAction = () => {
    if (selectedCountdown) {
      toggleStar(selectedCountdown.id);
    }
  };

  const handleDeleteAction = () => {
    if (selectedCountdown) {
      Alert.alert(
        t.home.deleteConfirmTitle,
        t.home.deleteConfirmMessage.replace('{title}', selectedCountdown.title),
        [
          {
            text: t.cancel,
            style: 'cancel',
          },
          {
            text: t.delete,
            style: 'destructive',
            onPress: () => {
              remove(selectedCountdown.id);
            },
          },
        ]
      );
    }
  };

  const handleSalaryPress = () => {
    if (!isPremium) {
      showPremiumFeaturePrompt('salary');
      return;
    }
    router.push('/countdown/create-salary');
  };

  const handleTemplatePress = (templateId: string) => {
    router.push(`/countdown/create-template?templateId=${templateId}`);
  };

  // Handle pull-to-refresh with separate state (prevents FlatList flicker)
  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const renderEmptyState = () => (
    <ScrollView contentContainerStyle={styles.emptyState}>
      <Ionicons name="timer-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.home.noCountdowns}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t.home.createFirst}
      </Text>
      <View style={styles.emptyButtons}>
        <Pressable
          onPress={handleCreatePress}
          style={[styles.createButtonLarge, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={24} color={colors.background} />
          <Text style={[styles.createButtonLargeText, { color: colors.background }]}>{t.home.createCountdown}</Text>
        </Pressable>
        <Pressable
          onPress={handleSalaryPress}
          style={[styles.salaryButtonLarge, { backgroundColor: colors.surface, borderColor: colors.accent }]}
        >
          <Text style={styles.salaryIcon}>💰</Text>
          <Text style={[styles.salaryButtonText, { color: colors.accent }]}>{t.home.addSalary}</Text>
          {!isPremium && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>⭐ PRO</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Document Templates Section */}
      <View style={styles.templatesSection}>
        <Text style={[styles.templatesSectionTitle, { color: colors.text }]}>
          {t.templates.title}
        </Text>
        <View style={styles.templatesGrid}>
          {governmentTemplates.slice(0, 4).map((template) => (
            <Pressable
              key={template.id}
              onPress={() => handleTemplatePress(template.id)}
              style={[styles.templateButton, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <Text style={[styles.templateTitle, { color: colors.text }]} numberOfLines={1}>
                {language === 'ar' ? template.titleAr : template.titleEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    // Only show loading spinner on initial load, not on refetch (fixes navigation flicker)
    if (loading && countdowns.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Pressable onPress={refresh} style={[styles.retryButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.retryButtonText, { color: colors.text }]}>{t.retry}</Text>
          </Pressable>
        </View>
      );
    }

    if (countdowns.length === 0) {
      return renderEmptyState();
    }

    // Empty state for when filter returns no results
    if (filteredCountdowns.length === 0 && selectedCategory !== null) {
      return (
        <>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterEmoji}>{selectedCategory}</Text>
            <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>
              {t.home.noCategoryResults}
            </Text>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[styles.showAllButton, { backgroundColor: colors.surface, borderColor: colors.accent }]}
            >
              <Text style={[styles.showAllButtonText, { color: colors.accent }]}>{t.showAll}</Text>
            </Pressable>
          </View>
        </>
      );
    }

    const renderListItem = ({ item }: { item: ListItem }) => {
      if (item.type === 'ad') {
        return (
          <View style={styles.adContainer}>
            <AdBanner size="banner" />
          </View>
        );
      }

      const [first, second] = item.data;
      return (
        <View style={styles.row}>
          <CountdownCard
            countdown={first}
            onPress={() => handleCountdownPress(first)}
            onLongPress={() => handleCountdownLongPress(first)}
          />
          {second && (
            <CountdownCard
              countdown={second}
              onPress={() => handleCountdownPress(second)}
              onLongPress={() => handleCountdownLongPress(second)}
            />
          )}
          {!second && <View style={styles.emptyCard} />}
        </View>
      );
    };

    return (
      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.type === 'ad' ? item.id : item.data[0].id
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderListItem}
        onRefresh={handlePullToRefresh}
        refreshing={isRefreshing}
        ListHeaderComponent={
          <>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            {/* Document Templates Quick Access */}
            <View style={styles.templatesHeader}>
              <Text style={[styles.templatesHeaderTitle, { color: colors.textSecondary }]}>
                {t.templates.title}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templatesHeaderScroll}
              >
                {governmentTemplates.map((template) => (
                  <Pressable
                    key={template.id}
                    onPress={() => handleTemplatePress(template.id)}
                    style={[styles.templateChip, { backgroundColor: colors.surface }]}
                  >
                    <Text style={styles.templateChipIcon}>{template.icon}</Text>
                    <Text style={[styles.templateChipText, { color: colors.text }]} numberOfLines={1}>
                      {language === 'ar' ? template.titleAr : template.titleEn}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        }
        ListFooterComponent={
          shouldShowAds && filteredCountdowns.length > 0 ? (
            <View style={styles.bottomAdContainer}>
              <AdBanner size="banner" />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {renderContent()}

      <View style={styles.fabContainer}>
        <Pressable
          onPress={handleSalaryPress}
          style={[styles.fabSalaryPill, { backgroundColor: colors.surface, borderColor: colors.accent }]}
        >
          {!isPremium && (
            <View style={styles.proBadgeFab}>
              <Text style={styles.proBadgeTextFab}>⭐ PRO</Text>
            </View>
          )}
          <Text style={[styles.fabSalaryText, { color: colors.accent }]}>{t.home.salaryDate}</Text>
          <Text style={styles.fabSalaryIcon}>💰</Text>
        </Pressable>
        <Pressable
          onPress={handleCreatePress}
          style={[styles.fab, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={28} color={colors.background} />
        </Pressable>
      </View>

      <CardActionSheet
        visible={actionSheetVisible}
        countdown={selectedCountdown}
        onClose={handleActionSheetClose}
        onStar={handleStarAction}
        onDelete={handleDeleteAction}
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyCard: {
    flex: 1,
    maxWidth: '48%',
  },
  adContainer: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  bottomAdContainer: {
    marginTop: 8,
    marginBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    gap: 12,
    alignItems: 'center',
  },
  createButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  createButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  salaryButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
  },
  salaryIcon: {
    fontSize: 20,
  },
  salaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fabSalaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabSalaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fabSalaryIcon: {
    fontSize: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  proBadgeFab: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeTextFab: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  emptyFilterState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyFilterEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyFilterText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  showAllButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  showAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  templatesSection: {
    marginTop: 32,
    width: '100%',
    paddingHorizontal: 8,
  },
  templatesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  templateButton: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  templateIcon: {
    fontSize: 32,
  },
  templateTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  templatesHeader: {
    marginBottom: 16,
  },
  templatesHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  templatesHeaderScroll: {
    gap: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  templateChipIcon: {
    fontSize: 16,
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
