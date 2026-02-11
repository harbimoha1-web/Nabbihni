import React, { useRef, useEffect } from 'react';
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
import { CalendarType } from '@/types/countdown';
import { getMaxDaysForCalendar } from '@/lib/salaryCalculator';

interface SalaryDayPickerProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  calendarType: CalendarType;
}

export const SalaryDayPicker: React.FC<SalaryDayPickerProps> = ({
  selectedDay,
  onSelectDay,
  calendarType,
}) => {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const maxDays = getMaxDaysForCalendar(calendarType);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const handleSelect = (day: number) => {
    Haptics.selectionAsync();
    onSelectDay(day);
  };

  // Scroll to selected day on mount
  useEffect(() => {
    if (scrollRef.current && selectedDay > 5) {
      const offset = (selectedDay - 3) * 60; // Approximate item width + gap
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, []);

  // Adjust selected day if it exceeds max days (when switching calendar type)
  useEffect(() => {
    if (selectedDay > maxDays) {
      onSelectDay(maxDays);
    }
  }, [maxDays, selectedDay, onSelectDay]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.text }]}>{t.salary.salaryDay}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {calendarType === 'hijri' ? '(1-30)' : '(1-31)'}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <Pressable
              key={day}
              onPress={() => handleSelect(day)}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? colors.background : colors.text },
                ]}
              >
                {day.toLocaleString(locale)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  dayButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SalaryDayPicker;
