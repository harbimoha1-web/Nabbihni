import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import { CATEGORIES } from './EmojiPicker';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();

  const handleSelect = (icon: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(icon);
  };

  const isAllSelected = selectedCategory === null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" pill */}
        <Pressable
          onPress={() => handleSelect(null)}
          style={[
            styles.pill,
            {
              backgroundColor: isAllSelected ? colors.accent : colors.surface,
              borderColor: isAllSelected ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: isAllSelected ? colors.background : colors.textSecondary,
              },
            ]}
          >
            الكل
          </Text>
        </Pressable>

        {/* Category pills */}
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.icon;
          return (
            <Pressable
              key={category.icon}
              onPress={() => handleSelect(category.icon)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.emoji}>{category.icon}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 20,
  },
});

export default CategoryFilter;
