import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { getTheme } from '@/constants/themes';
import { ThemeId } from '@/types/countdown';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface CelebrationShareCardProps {
  title: string;
  icon: string;
  theme: ThemeId;
  language?: 'ar' | 'en';
}

export interface CelebrationShareCardRef {
  capture: () => Promise<string | undefined>;
}

/**
 * A beautiful shareable card shown when a countdown ends.
 * Can be captured as an image for sharing.
 */
const CelebrationShareCard = forwardRef<CelebrationShareCardRef, CelebrationShareCardProps>(
  ({ title, icon, theme, language = 'ar' }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);
    const themeConfig = getTheme(theme);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (viewShotRef.current && viewShotRef.current.capture) {
          return viewShotRef.current.capture();
        }
        return undefined;
      },
    }));

    const celebrationText = language === 'ar' ? 'حان الوقت!' : "Time's up!";
    const watermarkText = 'نبّهني';

    return (
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        }}
      >
        <View style={styles.container}>
          <LinearGradient
            colors={themeConfig.colors.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Content */}
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
              </View>

              {/* Celebration emoji */}
              <Text style={styles.celebrationEmoji}>🎉</Text>

              {/* Celebration text */}
              <Text
                style={[
                  styles.celebrationText,
                  { color: themeConfig.colors.accent },
                ]}
              >
                {celebrationText}
              </Text>

              {/* Title */}
              <Text
                style={[styles.title, { color: themeConfig.colors.text }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>

            {/* Watermark */}
            <View style={styles.watermarkContainer}>
              <Text
                style={[
                  styles.watermark,
                  { color: themeConfig.colors.textSecondary },
                ]}
              >
                {watermarkText}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ViewShot>
    );
  }
);

CelebrationShareCard.displayName = 'CelebrationShareCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  card: {
    flex: 1,
    padding: 24,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 72,
    textAlign: 'center',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 16,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermark: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
});

export default CelebrationShareCard;
