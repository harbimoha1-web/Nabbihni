import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventCategory } from '@/types/countdown';

// Category definitions with icons and labels
const CATEGORIES: { id: EventCategory; icon: string; labelAr: string; labelEn: string }[] = [
  { id: 'religious', icon: '🌙', labelAr: 'ديني', labelEn: 'Religious' },
  { id: 'national', icon: '🇸🇦', labelAr: 'وطني', labelEn: 'National' },
  { id: 'seasonal', icon: '☀️', labelAr: 'موسمي', labelEn: 'Seasonal' },
  { id: 'entertainment', icon: '🎭', labelAr: 'ترفيهي', labelEn: 'Entertainment' },
  { id: 'milestone', icon: '🏆', labelAr: 'محطة', labelEn: 'Milestone' },
  { id: 'education', icon: '🎓', labelAr: 'تعليمي', labelEn: 'Education' },
  { id: 'international', icon: '🌍', labelAr: 'دولي', labelEn: 'International' },
];

interface EventCategoryPickerProps {
  selectedCategory: EventCategory;
  onSelectCategory: (category: EventCategory) => void;
}

export const EventCategoryPicker: React.FC<EventCategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const handleSelect = (category: EventCategory) => {
    Haptics.selectionAsync();
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {language === 'ar' ? 'التصنيف' : 'Category'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => handleSelect(category.id)}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: isSelected ? colors.accent + '20' : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: isSelected ? colors.accent : colors.textSecondary },
                ]}
              >
                {language === 'ar' ? category.labelAr : category.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Grid variant for use in forms
export const EventCategoryPickerGrid: React.FC<EventCategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const handleSelect = (category: EventCategory) => {
    Haptics.selectionAsync();
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {language === 'ar' ? 'التصنيف' : 'Category'}
      </Text>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => handleSelect(category.id)}
              style={[
                styles.gridButton,
                {
                  backgroundColor: isSelected ? colors.accent + '20' : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.gridIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.gridLabel,
                  { color: isSelected ? colors.accent : colors.textSecondary },
                  isSelected && { fontWeight: '600' },
                ]}
              >
                {language === 'ar' ? category.labelAr : category.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// Get category info by ID
export const getCategoryInfo = (categoryId: EventCategory, language: 'ar' | 'en') => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;
  return {
    icon: category.icon,
    label: language === 'ar' ? category.labelAr : category.labelEn,
  };
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridButton: {
    width: '31%',
    aspectRatio: 1.4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: 6,
  },
  gridIcon: {
    fontSize: 24,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EventCategoryPicker;
