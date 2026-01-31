import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import AnimatedIcon from './AnimatedIcon';

// Life categories - tap to select the icon
export const CATEGORIES = [
  { icon: '🎉', nameAr: 'احتفال' },
  { icon: '❤️', nameAr: 'حب' },
  { icon: '🏆', nameAr: 'إنجاز' },
  { icon: '✈️', nameAr: 'سفر' },
  { icon: '🌙', nameAr: 'روحاني' },
  { icon: '💼', nameAr: 'عمل' },
  { icon: '🎓', nameAr: 'دراسة' },
  { icon: '⚽', nameAr: 'رياضة' },
  { icon: '🎂', nameAr: 'مناسبة' },
  { icon: '🏠', nameAr: 'عائلة' },
  { icon: '💰', nameAr: 'مالي' },
  { icon: '🌸', nameAr: 'طبيعة' },
];

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  selectedEmoji,
  onSelectEmoji,
}) => {
  const { colors } = useTheme();

  const handleSelect = (icon: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectEmoji(icon);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>اختر الفئة</Text>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.icon}
            onPress={() => handleSelect(category.icon)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: colors.surface,
                borderColor: selectedEmoji === category.icon ? colors.accent : colors.border,
              },
              selectedEmoji === category.icon && {
                backgroundColor: `${colors.accent}20`,
              },
            ]}
          >
            <AnimatedIcon emoji={category.icon} size={32} />
            <Text
              style={[
                styles.name,
                { color: colors.textSecondary },
                selectedEmoji === category.icon && {
                  color: colors.accent,
                  fontWeight: '600',
                },
              ]}
            >
              {category.nameAr}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '31%',
    aspectRatio: 1.3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EmojiPicker;
