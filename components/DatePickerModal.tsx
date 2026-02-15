import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type CalendarType = 'gregorian' | 'hijri';

interface DatePickerModalProps {
  visible: boolean;
  date: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  minimumDate?: Date;
}

// Hijri month names in Arabic
const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

// Gregorian month names in Arabic
const GREGORIAN_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

// Simple Hijri conversion (approximate - for display purposes)
// For production, use a proper library like hijri-converter
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month, day };
}

function hijriToGregorian(year: number, month: number, day: number): Date {
  const jd = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385;
  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const gDay = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const gMonth = j + 2 - 12 * l4;
  const gYear = 100 * (n - 49) + i + l4;

  return new Date(gYear, gMonth - 1, gDay);
}

interface WheelPickerProps {
  items: { value: number; label: string }[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  width: number;
  colors: {
    text: string;
    textSecondary: string;
  };
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  width,
  colors,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const selectedIndex = items.findIndex(item => item.value === selectedValue);

  React.useEffect(() => {
    if (!isScrolling && scrollViewRef.current && selectedIndex >= 0) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex, isScrolling]);

  const handleScrollEnd = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
      Haptics.selectionAsync();
      onValueChange(items[clampedIndex].value);
    }

    setIsScrolling(false);
  }, [items, selectedValue, onValueChange]);

  return (
    <View style={[styles.wheelContainer, { width }, Platform.OS === 'web' && { overflow: 'visible', cursor: 'grab' } as any]}>
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} pointerEvents="none" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => setIsScrolling(true)}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(event) => {
          // Handle case where momentum doesn't trigger
          const velocity = event.nativeEvent.velocity?.y || 0;
          if (Math.abs(velocity) < 0.5) {
            handleScrollEnd(event);
          }
        }}
        style={Platform.OS === 'web' ? { overflow: 'auto' as any } : undefined}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => {
          const isSelected = item.value === selectedValue;
          return (
            <View key={`${item.value}-${index}`} style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelItemText,
                  { color: colors.textSecondary },
                  isSelected && [styles.wheelItemTextSelected, { color: colors.text }],
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  date,
  onClose,
  onConfirm,
  minimumDate,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [tempDate, setTempDate] = useState(date);

  // Reset temp date when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempDate(date);
    }
  }, [visible, date]);

  const hijriDate = gregorianToHijri(tempDate);
  const gregorianDate = {
    year: tempDate.getFullYear(),
    month: tempDate.getMonth() + 1,
    day: tempDate.getDate(),
  };

  // Get minimum date info
  const today = minimumDate || new Date();
  today.setHours(0, 0, 0, 0);
  const minHijri = gregorianToHijri(today);
  const minGregorian = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  const currentDate = calendarType === 'hijri' ? hijriDate : gregorianDate;
  const minDate = calendarType === 'hijri' ? minHijri : minGregorian;
  const months = calendarType === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS;

  // Generate years (from minimum year to +10 years) - only future years
  const minYear = minDate.year;
  const years = Array.from({ length: 15 }, (_, i) => {
    const year = minYear + i;
    return { value: year, label: String(year) };
  });

  // Generate months - filter out past months if in minimum year
  const monthItems = months
    .map((name, index) => ({
      value: index + 1,
      label: name,
    }))
    .filter(item => {
      // If current selected year is the minimum year, filter out past months
      if (currentDate.year === minDate.year) {
        return item.value >= minDate.month;
      }
      return true;
    });

  // Generate days - filter out past days if in minimum year and month
  const daysInMonth = calendarType === 'hijri'
    ? 30
    : new Date(currentDate.year, currentDate.month, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  })).filter(item => {
    // If current selected year and month match minimum, filter out past days
    if (currentDate.year === minDate.year && currentDate.month === minDate.month) {
      return item.value >= minDate.day;
    }
    return true;
  });

  // Helper to ensure date is not before minimum
  const ensureMinimumDate = (newDate: Date): Date => {
    if (minimumDate && newDate < minimumDate) {
      return new Date(minimumDate);
    }
    return newDate;
  };

  const handleYearChange = (year: number) => {
    let newDate: Date;
    if (calendarType === 'hijri') {
      // When year changes, adjust month/day if needed
      let month = currentDate.month;
      let day = currentDate.day;

      // If switching to minimum year, ensure month is valid
      if (year === minDate.year && month < minDate.month) {
        month = minDate.month;
      }
      // If in minimum year/month, ensure day is valid
      if (year === minDate.year && month === minDate.month && day < minDate.day) {
        day = minDate.day;
      }

      newDate = hijriToGregorian(year, month, Math.min(day, 30));
    } else {
      let month = currentDate.month;
      let day = currentDate.day;

      if (year === minDate.year && month < minDate.month) {
        month = minDate.month;
      }
      if (year === minDate.year && month === minDate.month && day < minDate.day) {
        day = minDate.day;
      }

      const maxDay = new Date(year, month, 0).getDate();
      newDate = new Date(year, month - 1, Math.min(day, maxDay));
    }
    setTempDate(ensureMinimumDate(newDate));
  };

  const handleMonthChange = (month: number) => {
    let newDate: Date;
    if (calendarType === 'hijri') {
      let day = currentDate.day;

      // If in minimum year/month, ensure day is valid
      if (currentDate.year === minDate.year && month === minDate.month && day < minDate.day) {
        day = minDate.day;
      }

      newDate = hijriToGregorian(currentDate.year, month, Math.min(day, 30));
    } else {
      let day = currentDate.day;

      if (currentDate.year === minDate.year && month === minDate.month && day < minDate.day) {
        day = minDate.day;
      }

      const maxDay = new Date(currentDate.year, month, 0).getDate();
      newDate = new Date(currentDate.year, month - 1, Math.min(day, maxDay));
    }
    setTempDate(ensureMinimumDate(newDate));
  };

  const handleDayChange = (day: number) => {
    let newDate: Date;
    if (calendarType === 'hijri') {
      newDate = hijriToGregorian(currentDate.year, currentDate.month, day);
    } else {
      newDate = new Date(currentDate.year, currentDate.month - 1, day);
    }
    setTempDate(ensureMinimumDate(newDate));
  };

  const handleConfirm = () => {
    // Check minimum date
    if (minimumDate && tempDate < minimumDate) {
      setTempDate(minimumDate);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(tempDate);
  };

  const toggleCalendar = () => {
    Haptics.selectionAsync();
    setCalendarType(prev => prev === 'hijri' ? 'gregorian' : 'hijri');
  };

  // Format display date
  const displayDate = calendarType === 'hijri'
    ? `${hijriDate.day} ${HIJRI_MONTHS[hijriDate.month - 1]} ${hijriDate.year} هـ`
    : `${gregorianDate.day} ${GREGORIAN_MONTHS[gregorianDate.month - 1]} ${gregorianDate.year} م`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackground} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>إلغاء</Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>اختر التاريخ</Text>
            <Pressable onPress={handleConfirm} style={styles.headerButton}>
              <Text style={[styles.confirmText, { color: colors.accent }]}>تأكيد</Text>
            </Pressable>
          </View>

          {/* Calendar Type Toggle */}
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={toggleCalendar}
              style={[
                styles.toggleButton,
                { backgroundColor: colors.background },
                calendarType === 'hijri' && { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: colors.textSecondary },
                  calendarType === 'hijri' && { color: colors.background },
                ]}
              >
                {t.calendar.hijri}
              </Text>
            </Pressable>
            <Pressable
              onPress={toggleCalendar}
              style={[
                styles.toggleButton,
                { backgroundColor: colors.background },
                calendarType === 'gregorian' && { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: colors.textSecondary },
                  calendarType === 'gregorian' && { color: colors.background },
                ]}
              >
                {t.calendar.gregorian}
              </Text>
            </Pressable>
          </View>

          {/* Selected Date Display */}
          <Text style={[styles.selectedDateText, { color: colors.text }]}>{displayDate}</Text>

          {/* Wheel Pickers */}
          <View style={styles.pickersContainer}>
            <WheelPicker
              items={days}
              selectedValue={currentDate.day}
              onValueChange={handleDayChange}
              width={SCREEN_WIDTH * 0.2}
              colors={colors}
            />
            <WheelPicker
              items={monthItems}
              selectedValue={currentDate.month}
              onValueChange={handleMonthChange}
              width={SCREEN_WIDTH * 0.4}
              colors={colors}
            />
            <WheelPicker
              items={years}
              selectedValue={currentDate.year}
              onValueChange={handleYearChange}
              width={SCREEN_WIDTH * 0.25}
              colors={colors}
            />
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.2, color: colors.textSecondary }]}>يوم</Text>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.4, color: colors.textSecondary }]}>شهر</Text>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.25, color: colors.textSecondary }]}>سنة</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: PICKER_HEIGHT,
    paddingHorizontal: 16,
  },
  wheelContainer: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(246, 173, 85, 0.15)',
    borderRadius: 8,
    zIndex: 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 18,
  },
  wheelItemTextSelected: {
    fontSize: 20,
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DatePickerModal;
