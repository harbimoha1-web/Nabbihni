import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalendarType } from '@/types/countdown';

interface CalendarTypePickerProps {
  selectedType: CalendarType;
  onSelectType: (type: CalendarType) => void;
}

export const CalendarTypePicker: React.FC<CalendarTypePickerProps> = ({
  selectedType,
  onSelectType,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleSelect = (type: CalendarType) => {
    Haptics.selectionAsync();
    onSelectType(type);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t.calendar.calendarType}</Text>

      <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
        <Pressable
          onPress={() => handleSelect('gregorian')}
          style={[
            styles.toggleOption,
            selectedType === 'gregorian' && {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  selectedType === 'gregorian'
                    ? colors.background
                    : colors.textSecondary,
              },
              selectedType === 'gregorian' && styles.toggleTextSelected,
            ]}
          >
            {t.calendar.gregorian}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleSelect('hijri')}
          style={[
            styles.toggleOption,
            selectedType === 'hijri' && {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  selectedType === 'hijri'
                    ? colors.background
                    : colors.textSecondary,
              },
              selectedType === 'hijri' && styles.toggleTextSelected,
            ]}
          >
            {t.calendar.hijri}
          </Text>
        </Pressable>
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
    marginBottom: 12,
    textAlign: 'right',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextSelected: {
    fontWeight: '700',
  },
});

export default CalendarTypePicker;
