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
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimePickerModalProps {
  visible: boolean;
  date: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
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
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => setIsScrolling(true)}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(event) => {
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

// Convert 24h to 12h format
function to12Hour(hours24: number): { hour12: number; isPM: boolean } {
  const isPM = hours24 >= 12;
  let hour12 = hours24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, isPM };
}

// Convert 12h to 24h format
function to24Hour(hour12: number, isPM: boolean): number {
  if (hour12 === 12) return isPM ? 12 : 0;
  return isPM ? hour12 + 12 : hour12;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  date,
  onClose,
  onConfirm,
}) => {
  const { colors } = useTheme();

  const initial12 = to12Hour(date.getHours());
  const [tempHour, setTempHour] = useState(initial12.hour12);
  const [tempMinute, setTempMinute] = useState(date.getMinutes());
  const [tempIsPM, setTempIsPM] = useState(initial12.isPM);

  // Reset temp values when modal opens
  React.useEffect(() => {
    if (visible) {
      const { hour12, isPM } = to12Hour(date.getHours());
      setTempHour(hour12);
      setTempMinute(date.getMinutes());
      setTempIsPM(isPM);
    }
  }, [visible, date]);

  // Generate items
  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));

  const periods = [
    { value: 0, label: 'ص' },  // AM
    { value: 1, label: 'م' },  // PM
  ];

  // Format display time
  const displayTime = `${tempHour}:${String(tempMinute).padStart(2, '0')} ${tempIsPM ? 'م' : 'ص'}`;

  const handleConfirm = () => {
    const hour24 = to24Hour(tempHour, tempIsPM);
    const newDate = new Date(date);
    newDate.setHours(hour24, tempMinute);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(newDate);
  };

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>اختر الوقت</Text>
            <Pressable onPress={handleConfirm} style={styles.headerButton}>
              <Text style={[styles.confirmText, { color: colors.accent }]}>تأكيد</Text>
            </Pressable>
          </View>

          {/* Selected Time Display */}
          <Text style={[styles.selectedTimeText, { color: colors.text }]}>{displayTime}</Text>

          {/* Wheel Pickers */}
          <View style={styles.pickersContainer}>
            <WheelPicker
              items={hours}
              selectedValue={tempHour}
              onValueChange={setTempHour}
              width={SCREEN_WIDTH * 0.25}
              colors={colors}
            />
            <WheelPicker
              items={minutes}
              selectedValue={tempMinute}
              onValueChange={setTempMinute}
              width={SCREEN_WIDTH * 0.25}
              colors={colors}
            />
            <WheelPicker
              items={periods}
              selectedValue={tempIsPM ? 1 : 0}
              onValueChange={(val) => setTempIsPM(val === 1)}
              width={SCREEN_WIDTH * 0.25}
              colors={colors}
            />
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.25, color: colors.textSecondary }]}>ساعة</Text>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.25, color: colors.textSecondary }]}>دقيقة</Text>
            <Text style={[styles.labelText, { width: SCREEN_WIDTH * 0.25, color: colors.textSecondary }]}>فترة</Text>
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
  selectedTimeText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
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

export default TimePickerModal;
