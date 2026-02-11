import React, { useEffect, useMemo, memo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { CELEBRATION_COLORS } from '@/constants/themes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CelebrationType = 'burst' | 'rise' | 'spiral' | 'firework';

// Optimized particle count for smooth 60fps
const BURST_COUNT = 12;
const RISE_COUNT = 15;
const GLOW_COUNT = 6;

// Get celebration style based on icon
const getCelebrationStyle = (icon: string): { colors: string[]; type: CelebrationType } => {
  // Love & Hearts
  if (/❤️|💕|💖|💗|💓|💞|💘|💝|🥰|😍/.test(icon)) {
    return { colors: CELEBRATION_COLORS.hearts, type: 'rise' };
  }
  // Stars & Achievement
  if (/⭐|✨|🌟|💫|🏆|🥇|👑|💎/.test(icon)) {
    return { colors: CELEBRATION_COLORS.gold, type: 'firework' };
  }
  // Party & Birthday
  if (/🎉|🎊|🎈|🥳|🎁|🎂/.test(icon)) {
    return { colors: CELEBRATION_COLORS.confetti, type: 'burst' };
  }
  // Nature & Travel
  if (/🌸|🌺|🦋|🌈|✈️|🚀|🌙/.test(icon)) {
    return { colors: CELEBRATION_COLORS.aurora, type: 'spiral' };
  }
  // Default
  return { colors: CELEBRATION_COLORS.aurora, type: 'burst' };
};

// Glowing orb component
const GlowOrb = memo(({ color, delay, x, y }: { color: string; delay: number; x: number; y: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, { damping: 8, stiffness: 100 }),
        withDelay(800, withTiming(1.5, { duration: 400 }))
      )
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.glowOrb,
        animatedStyle,
        {
          left: x,
          top: y,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
});

// Burst particle - explodes outward from center
const BurstParticle = memo(({
  index,
  total,
  colors,
  onComplete,
}: {
  index: number;
  total: number;
  colors: string[];
  onComplete?: () => void;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const angle = (index / total) * Math.PI * 2 + Math.random() * 0.3;
  const distance = 120 + Math.random() * 80;
  const color = colors[index % colors.length];
  const size = 8 + Math.random() * 8;
  const delay = index * 20;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    scale.value = withDelay(delay, withSpring(1, { damping: 6, stiffness: 150 }));
    rotation.value = withDelay(delay, withTiming(360 + Math.random() * 360, { duration: 1200 }));

    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(targetY * 0.6, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(targetY + 50, { duration: 500, easing: Easing.in(Easing.quad) })
      )
    );

    opacity.value = withDelay(
      delay + 700,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished && index === 0 && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
      ]}
    />
  );
});

// Rising particle - floats upward with sway
const RiseParticle = memo(({
  index,
  colors,
  icon,
}: {
  index: number;
  colors: string[];
  icon: string;
}) => {
  const translateY = useSharedValue(100);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  const startX = (index / RISE_COUNT) * SCREEN_WIDTH * 0.8 + SCREEN_WIDTH * 0.1;
  const color = colors[index % colors.length];
  const delay = index * 100 + Math.random() * 200;
  const duration = 2500 + Math.random() * 500;
  const drift = (Math.random() - 0.5) * 60;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));

    translateY.value = withDelay(
      delay,
      withTiming(-SCREEN_HEIGHT * 0.6, { duration, easing: Easing.out(Easing.quad) })
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(drift, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-drift, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    opacity.value = withDelay(delay + duration - 500, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  // Use heart shape for love icons
  const isHeart = /❤️|💕|💖/.test(icon);

  if (isHeart) {
    return (
      <Animated.View style={[styles.riseParticle, animatedStyle, { left: startX }]}>
        <View style={[styles.heart, { backgroundColor: color }]}>
          <View style={[styles.heartBefore, { backgroundColor: color }]} />
          <View style={[styles.heartAfter, { backgroundColor: color }]} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.riseParticle,
        animatedStyle,
        {
          left: startX,
          width: 12,
          height: 12,
          backgroundColor: color,
          borderRadius: 6,
          shadowColor: color,
          shadowOpacity: 0.6,
          shadowRadius: 6,
        },
      ]}
    />
  );
});

// Firework particle - shoots up then explodes
const FireworkParticle = memo(({
  index,
  colors,
  x,
  delay,
}: {
  index: number;
  colors: string[];
  x: number;
  delay: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const color = colors[index % colors.length];
  const angle = (index / 8) * Math.PI * 2;
  const distance = 40 + Math.random() * 30;

  useEffect(() => {
    // Shoot up first
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-200, { duration: 600, easing: Easing.out(Easing.cubic) }),
        // Then explode outward
        withTiming(-200 + Math.sin(angle) * distance, { duration: 400, easing: Easing.out(Easing.quad) })
      )
    );

    translateX.value = withDelay(
      delay + 600,
      withTiming(Math.cos(angle) * distance, { duration: 400, easing: Easing.out(Easing.quad) })
    );

    scale.value = withDelay(
      delay + 600,
      withSequence(
        withSpring(1.5, { damping: 6 }),
        withTiming(0, { duration: 300 })
      )
    );

    opacity.value = withDelay(delay + 900, withTiming(0, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.fireworkParticle,
        animatedStyle,
        {
          left: x,
          width: 6,
          height: 6,
          backgroundColor: color,
          borderRadius: 3,
          shadowColor: color,
          shadowOpacity: 1,
          shadowRadius: 10,
        },
      ]}
    />
  );
});

// Main celebration text
const CelebrationText = memo(({ onComplete }: { onComplete?: () => void }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 100 }));
    opacity.value = withDelay(200, withTiming(1, { duration: 300 }));

    // Fade out after
    opacity.value = withDelay(2500, withTiming(0, { duration: 500 }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.celebrationTextContainer, animatedStyle]}>
      <Animated.Text style={styles.celebrationEmoji}>🎉</Animated.Text>
    </Animated.View>
  );
});

interface CelebrationAnimationProps {
  active: boolean;
  icon: string;
  onComplete?: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = memo(({
  active,
  icon,
  onComplete,
}) => {
  const { colors, type } = useMemo(() => getCelebrationStyle(icon), [icon]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Burst particles from center */}
      <View style={styles.burstContainer}>
        {Array.from({ length: BURST_COUNT }).map((_, i) => (
          <BurstParticle
            key={`burst-${i}`}
            index={i}
            total={BURST_COUNT}
            colors={colors}
            onComplete={i === 0 ? onComplete : undefined}
          />
        ))}
      </View>

      {/* Rising particles */}
      {type === 'rise' && Array.from({ length: RISE_COUNT }).map((_, i) => (
        <RiseParticle
          key={`rise-${i}`}
          index={i}
          colors={colors}
          icon={icon}
        />
      ))}

      {/* Fireworks */}
      {type === 'firework' && (
        <>
          {[0.3, 0.5, 0.7].map((xRatio, fi) => (
            <View key={`firework-${fi}`} style={styles.fireworkContainer}>
              {Array.from({ length: 8 }).map((_, i) => (
                <FireworkParticle
                  key={`fw-${fi}-${i}`}
                  index={i}
                  colors={colors}
                  x={SCREEN_WIDTH * xRatio}
                  delay={fi * 300}
                />
              ))}
            </View>
          ))}
        </>
      )}

      {/* Center celebration */}
      <CelebrationText />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  burstContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
  },
  particle: {
    position: 'absolute',
  },
  glowOrb: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  riseParticle: {
    position: 'absolute',
    bottom: -20,
  },
  fireworkContainer: {
    position: 'absolute',
    bottom: '30%',
  },
  fireworkParticle: {
    position: 'absolute',
  },
  celebrationTextContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 80,
  },
  // Heart shape
  heart: {
    width: 12,
    height: 12,
    transform: [{ rotate: '-45deg' }],
    position: 'relative',
  },
  heartBefore: {
    position: 'absolute',
    top: -6,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  heartAfter: {
    position: 'absolute',
    top: 0,
    left: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default CelebrationAnimation;
