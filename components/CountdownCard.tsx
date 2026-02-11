import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Countdown } from '@/types/countdown';
import { getTheme } from '@/constants/themes';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/contexts/LanguageContext';
import CountdownTimer from './CountdownTimer';
import AnimatedIcon from './AnimatedIcon';

const { width } = Dimensions.get('window');

const formatEventDate = (dateString: string, language: 'ar' | 'en') => {
  const date = new Date(dateString);
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  // Gregorian format (explicitly specify Gregorian calendar)
  const gregorian = date.toLocaleDateString(`${locale}-u-ca-gregory`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Hijri format
  const hijri = date.toLocaleDateString(`${locale}-u-ca-islamic`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return { gregorian, hijri };
};
const CARD_WIDTH = (width - 48) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CountdownCardProps {
  countdown: Countdown;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: 'small' | 'large';
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  countdown,
  onPress,
  onLongPress,
  size = 'small',
}) => {
  const { t, language } = useLanguage();
  const theme = getTheme(countdown.theme);
  const { timeRemaining } = useCountdown({
    targetDate: countdown.targetDate,
  });

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    // Use opacity instead of scale to avoid blur from subpixel rendering
    opacity.value = withSpring(0.7, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  const isLarge = size === 'large';
  const hasBackgroundImage = !!countdown.backgroundImage;

  const renderContent = () => (
    <View style={styles.content}>
      {/* Badges in top-right corner */}
      <View style={styles.badgesContainer}>
        {countdown.isStarred && (
          <View style={styles.starBadge}>
            <AnimatedIcon emoji="⭐" size={12} />
          </View>
        )}
        {countdown.isRecurring && (
          <View style={styles.recurringBadge}>
            <AnimatedIcon emoji="🔄" size={12} />
          </View>
        )}
      </View>

      {/* Centered icon and title */}
      <View style={styles.headerCenter}>
        <AnimatedIcon emoji={countdown.icon} size={isLarge ? 40 : 32} />
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {countdown.title}
        </Text>
      </View>

      {/* Timer */}
      <CountdownTimer
        timeRemaining={timeRemaining}
        theme={theme}
        size={isLarge ? 'small' : 'compact'}
      />

      {/* Dates */}
      <View style={styles.datesContainer}>
        <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>
          {formatEventDate(countdown.targetDate, language).gregorian}
        </Text>
        <Text style={[styles.eventDateHijri, { color: theme.colors.textSecondary }]}>
          {formatEventDate(countdown.targetDate, language).hijri}
        </Text>
      </View>
    </View>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={300}
      style={[
        animatedStyle,
        isLarge ? styles.cardLarge : styles.cardSmall,
      ]}
    >
      {hasBackgroundImage ? (
        <ImageBackground
          source={{ uri: countdown.backgroundImage }}
          style={styles.imageBackground}
          imageStyle={styles.imageBackgroundImage}
        >
          {/* Dark overlay for text readability */}
          <View style={styles.imageOverlay} />
          {renderContent()}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={theme.colors.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  cardSmall: {
    width: CARD_WIDTH,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardLarge: {
    width: '100%',
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
  },
  imageBackgroundImage: {
    borderRadius: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 1,
  },
  starBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  datesContainer: {
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 11,
    textAlign: 'center',
  },
  eventDateHijri: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default CountdownCard;
