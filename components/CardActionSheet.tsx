import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Countdown } from '@/types/countdown';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280;

interface CardActionSheetProps {
  visible: boolean;
  countdown: Countdown | null;
  onClose: () => void;
  onStar: () => void;
  onDelete: () => void;
}

export const CardActionSheet: React.FC<CardActionSheetProps> = ({
  visible,
  countdown,
  onClose,
  onStar,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Fast timing animation - no bounce, instant feel
      translateY.value = withTiming(0, { duration: 200 });
      backdropOpacity.value = withTiming(1, { duration: 150 });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 150 });
      backdropOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = () => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 150 });
    backdropOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(onClose, 150);
  };

  const handleStar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStar();
    handleClose();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
    handleClose();
  };

  if (!countdown) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { backgroundColor: colors.surface },
          ]}
        >
          {/* Handle indicator */}
          <View style={[styles.handle, { backgroundColor: colors.textMuted }]} />

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.icon]}>{countdown.icon}</Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {countdown.title}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Star option */}
          <Pressable
            style={({ pressed }) => [
              styles.option,
              pressed && { backgroundColor: colors.glass },
            ]}
            onPress={handleStar}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {countdown.isStarred ? t.home.removeFromFavorites : t.home.addToFavorites}
            </Text>
            <Text style={styles.optionIcon}>
              {countdown.isStarred ? '⭐' : '☆'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Delete option */}
          <Pressable
            style={({ pressed }) => [
              styles.option,
              pressed && { backgroundColor: colors.glass },
            ]}
            onPress={handleDelete}
          >
            <Text style={[styles.optionText, styles.deleteText]}>{t.delete}</Text>
            <Text style={styles.optionIcon}>🗑️</Text>
          </Pressable>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Cancel option */}
          <Pressable
            style={({ pressed }) => [
              styles.option,
              pressed && { backgroundColor: colors.glass },
            ]}
            onPress={handleClose}
          >
            <Text style={[styles.optionText, { color: colors.textSecondary }]}>
              {t.cancel}
            </Text>
            <Text style={styles.optionIcon}>✕</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  deleteText: {
    color: '#F87171',
  },
});

export default CardActionSheet;
