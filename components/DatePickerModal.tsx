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
import {
  gregorianToHijri as serviceGregorianToHijri,
  hijriToGregorian as serviceHijriToGregorian,
} from '@/lib/hijriService';

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

// Accurate Hijri conversion using hijri-converter library via hijriService
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  return serviceGregorianToHijri(date);
}

function hijriToGregorian(year: number, month: number, day: number): Date {
  const dateStr = serviceHijriToGregorian(year, month, day);
  return new Date(dateStr);
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
                  { color: colors.text, opacity: 0.5 },
                  isSelected && [styles.wheelItemTextSelected, { color: colors.text, opacity: 1 }],
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
  const [calendarType, setCalendarType] = useState<CalendarType>('gregorian');
  const [tempDate, setTempDate] = useState(date);
  const [hijriOverride, setHijriOverride] = useState<{year: number; month: number; day: number} | null>(null);

  // Reset temp date when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempDate(date);
      setHijriOverride(null);
    }
  }, [visible, date]);

  const hijriDate = hijriOverride ?? gregorianToHijri(tempDate);
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

      day = Math.min(day, 30);
      setHijriOverride({ year, month, day });
      newDate = hijriToGregorian(year, month, day);
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

      day = Math.min(day, 30);
      setHijriOverride({ year: currentDate.year, month, day });
      newDate = hijriToGregorian(currentDate.year, month, day);
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
      setHijriOverride({ year: currentDate.year, month: currentDate.month, day });
      newDate = hijriToGregorian(currentDate.year, currentDate.month, day);
    } else {
      newDate = new Date(currentDate.year, currentDate.month - 1, day);
    }
    setTempDate(ensureMinimumDate(newDate));
  };

  const handleConfirm = () => {
    let finalDate = tempDate;
    // If in Hijri mode with override, do a fresh conversion for accuracy
    if (calendarType === 'hijri' && hijriOverride) {
      finalDate = hijriToGregorian(hijriOverride.year, hijriOverride.month, hijriOverride.day);
    }
    // Check minimum date
    if (minimumDate && finalDate < minimumDate) {
      setTempDate(minimumDate);
      setHijriOverride(null);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(finalDate);
  };

  const toggleCalendar = () => {
    Haptics.selectionAsync();
    setHijriOverride(null);
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
    backgroundColor: 'rgba(246, 173, 85, 0.25)',
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
