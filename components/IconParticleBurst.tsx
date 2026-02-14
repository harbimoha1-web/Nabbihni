import React, { useEffect, useMemo, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

// Medium intensity: 7 particles for performance + beauty balance
const PARTICLE_COUNT = 7;

// Cycle duration for continuous loops (ms)
const CYCLE_DURATION = 2500;

type ParticleType =
  | 'hearts'
  | 'confetti'
  | 'stars'
  | 'trail'
  | 'petals'
  | 'motion'
  | 'coins'
  | 'crescents'
  | 'wisps'
  | 'glow'        // NEW: Night/Calm - soft floating dots
  | 'spotlights'  // NEW: Entertainment/Drama - dramatic rays
  | 'shimmer'     // NEW: National/Flags - gentle wave
  | 'none';

interface ParticleConfig {
  type: ParticleType;
  colors: string[];
  glow: boolean;
}

// Get particle style based on emoji - semantic matching (VIBE-ALIGNED)
const getParticleConfig = (emoji: string): ParticleConfig => {
  // Hearts - mini hearts floating upward
  if (/[❤💕💖💗💓💞💘💝🥰😍]/u.test(emoji)) {
    return {
      type: 'hearts',
      colors: ['#FF6B6B', '#FF8E8E', '#FFA5A5', '#FF5252', '#FF7B7B', '#FFAAAA', '#FF9999'],
      glow: true,
    };
  }

  // Night/Calm - gentle glow dots (peaceful, sleep, night vibes)
  // 🌙 Moon is NOT religious - it's peaceful/night energy
  if (/[🌙🌛🌜🌚🌝]/u.test(emoji)) {
    return {
      type: 'glow',
      colors: ['#C9D1FF', '#E8EBFF', '#A5B4FC', '#CBD5FF', '#DFE5FF', '#F0F3FF', '#B8C4FF'],
      glow: true,
    };
  }

  // Entertainment/Drama - spotlight rays (artistic, theatrical vibes)
  // 🎭 Theater is NOT party - it's dramatic/artistic energy
  if (/[🎭🎬🎪🎤🎥🎞️]/u.test(emoji)) {
    return {
      type: 'spotlights',
      colors: ['#FCD34D', '#FBBF24', '#F59E0B', '#FEF3C7', '#FFFBEB', '#FDE68A', '#FEF08A'],
      glow: true,
    };
  }

  // National/Flags - patriotic shimmer (pride, elegant wave)
  if (/🇸🇦/u.test(emoji)) {
    return {
      type: 'shimmer',
      colors: ['#22C55E', '#FFFFFF', '#16A34A', '#86EFAC', '#DCFCE7', '#F0FDF4', '#4ADE80'],
      glow: false,
    };
  }

  // Party/Celebration - confetti rectangles + ribbons (REMOVED 🎭)
  if (/[🎉🎊🥳🎈🎁]/u.test(emoji)) {
    return {
      type: 'confetti',
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#88D8B0'],
      glow: false,
    };
  }
  // Stars/Achievement - 4-point stars + diamonds (includes 🎓 graduation)
  if (/[⭐✨🌟💫🏆🥇👑💎🎓]/u.test(emoji)) {
    return {
      type: 'stars',
      colors: ['#FFD700', '#FFCA28', '#FFE082', '#FFC107', '#FFEB3B', '#FFA000', '#FFD54F'],
      glow: true,
    };
  }
  // Travel/Movement - speed lines + clouds
  if (/[✈️🚀🛸🚁]/u.test(emoji)) {
    return {
      type: 'trail',
      colors: ['#64B5F6', '#90CAF9', '#BBDEFB', '#42A5F5', '#E3F2FD', '#FFFFFF', '#B3E5FC'],
      glow: true,
    };
  }
  // Nature/Flowers - flower petals + leaves
  if (/[🌸🦋🌺🌷🌹🌼]/u.test(emoji)) {
    return {
      type: 'petals',
      colors: ['#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#FCE4EC', '#FF80AB', '#F8BBD0'],
      glow: false,
    };
  }
  // Sports - motion lines (horizontal streaks)
  if (/[⚽🏀⚾🎾🏈🎯]/u.test(emoji)) {
    return {
      type: 'motion',
      colors: ['#78909C', '#90A4AE', '#B0BEC5', '#ECEFF1', '#CFD8DC', '#FFFFFF', '#546E7A'],
      glow: false,
    };
  }
  // Money - coins with shine
  if (/[💰💵💸🤑💳💴💶💷]/u.test(emoji)) {
    return {
      type: 'coins',
      colors: ['#FFD700', '#FFC107', '#C0C0C0', '#FFE082', '#FFCA28', '#E0E0E0', '#FFD54F'],
      glow: true,
    };
  }
  // Religious/Islamic - crescents + stars (Eid context, REMOVED 🌙)
  if (/[🕌☪️📿🕋🐑]/u.test(emoji)) {
    return {
      type: 'crescents',
      colors: ['#D4AF37', '#FFFFFF', '#FFE082', '#F5F5DC', '#FFD700', '#FFFAF0', '#FFF8E1'],
      glow: true,
    };
  }
  // Food/Home - steam wisps
  if (/[🍕🍔🎂🍰☕🏠🍜🍵🍲]/u.test(emoji)) {
    return {
      type: 'wisps',
      colors: ['#FFF8E7', '#FFFFFF', '#F5F5F5', '#EEEEEE', '#FAFAFA', '#FFF3E0', '#FFECB3'],
      glow: false,
    };
  }
  // Default: NO particles (clean, no visual noise)
  // This applies to emojis without semantic particle meaning (💼, etc.)
  return {
    type: 'none',
    colors: [],
    glow: false,
  };
};

// Get staggered delay for even distribution across cycle
const getParticleDelay = (index: number, total: number) => {
  return (index / total) * CYCLE_DURATION;
};

// ============================================
// HEART PARTICLES - Continuous float up, fade, respawn
// ============================================
const HeartParticle = memo(({
  index,
  color,
  containerSize,
  glow,
}: {
  index: number;
  color: string;
  containerSize: number;
  glow: boolean;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  const startX = (index / PARTICLE_COUNT) * containerSize - containerSize / 2;
  const delay = getParticleDelay(index, PARTICLE_COUNT);

  useEffect(() => {
    // Infinite loop: fade in → rise → fade out → reset → repeat
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(CYCLE_DURATION - 600, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(0.8 + (index % 3) * 0.2, { damping: 12, stiffness: 150 }),
          withDelay(CYCLE_DURATION - 500, withTiming(0.8, { duration: 1 })),
          withTiming(0.3, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-80, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Gentle continuous sway
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(-20, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 600 }),
          withTiming(-15, { duration: 600 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <View style={[
        styles.heart,
        { backgroundColor: color },
        glow && { shadowColor: color, shadowOpacity: 0.6, shadowRadius: 4 }
      ]}>
        <View style={[styles.heartBefore, { backgroundColor: color }]} />
        <View style={[styles.heartAfter, { backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
});

// ============================================
// CONFETTI PARTICLES - Perpetual burst and fall cycle
// ============================================
const ConfettiParticle = memo(({
  index,
  total,
  color,
}: {
  index: number;
  total: number;
  color: string;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const angle = (index / total) * Math.PI * 2 + (index * 0.3);
  const distance = 55 + (index % 3) * 15;
  const delay = getParticleDelay(index, total);
  const isRibbon = index % 2 === 0;
  const width = isRibbon ? 3 + (index % 2) * 2 : 5 + (index % 3) * 2;
  const height = isRibbon ? 10 + (index % 3) * 3 : 5 + (index % 2) * 3;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    // Infinite opacity: pop in → stay → fade out → reset
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(CYCLE_DURATION - 400, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 6, stiffness: 250 }),
          withDelay(CYCLE_DURATION - 400, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false
      )
    );

    // Spin continuously
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(360, { duration: CYCLE_DURATION - 200 }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Burst outward then reset
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: 600, easing: Easing.out(Easing.cubic) }),
          withDelay(CYCLE_DURATION - 700, withTiming(targetX, { duration: 1 })),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Gravity effect - rise then fall, then reset
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY * 0.6, { duration: 350, easing: Easing.out(Easing.cubic) }),
          withTiming(targetY + 40, { duration: CYCLE_DURATION - 450, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
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
          width,
          height,
          backgroundColor: color,
          borderRadius: isRibbon ? 1 : 2,
        },
      ]}
    />
  );
});

// ============================================
// STAR PARTICLES - Endless twinkle and pulse
// ============================================
const StarParticle = memo(({
  index,
  total,
  color,
  glow,
}: {
  index: number;
  total: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const angle = (index / total) * Math.PI * 2;
  const distance = 40 + (index % 4) * 8;
  const delay = getParticleDelay(index, total);
  const isDiamond = index % 3 === 0;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    // Infinite twinkle scale animation
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1.3, { damping: 5, stiffness: 200 }),
          withTiming(0.7, { duration: 200 }),
          withSpring(1.1, { damping: 8 }),
          withTiming(0.9, { duration: 150 }),
          withSpring(1.2, { damping: 6 }),
          withTiming(0.6, { duration: 200 }),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(CYCLE_DURATION - 350, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 150 }),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false
      )
    );

    // Gentle rotation for stars
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(isDiamond ? 45 : 20, { duration: CYCLE_DURATION / 2 }),
          withTiming(isDiamond ? 90 : -20, { duration: CYCLE_DURATION / 2 }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Float outward and back
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
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

  // 4-point star or diamond shape
  if (isDiamond) {
    return (
      <Animated.View
        style={[
          styles.particle,
          animatedStyle,
          styles.diamond,
          {
            backgroundColor: color,
            shadowColor: glow ? color : 'transparent',
            shadowOpacity: glow ? 0.8 : 0,
            shadowRadius: glow ? 6 : 0,
          },
        ]}
      />
    );
  }

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <View style={[
        styles.fourPointStar,
        { backgroundColor: color },
        glow && { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 6 }
      ]}>
        <View style={[styles.starHorizontal, { backgroundColor: color }]} />
        <View style={[styles.starVertical, { backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
});

// ============================================
// TRAIL PARTICLES - Infinite streak left, fade, reset right
// ============================================
const TrailParticle = memo(({
  index,
  color,
  glow,
}: {
  index: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scaleX = useSharedValue(0.3);

  const delay = getParticleDelay(index, PARTICLE_COUNT);
  const offsetY = (index - PARTICLE_COUNT / 2) * 12;
  const length = 15 + (index % 4) * 5;

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 150 }),
          withDelay(CYCLE_DURATION - 500, withTiming(0.9, { duration: 1 })),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 150 }),
        ),
        -1,
        false
      )
    );

    scaleX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 8, stiffness: 150 }),
          withDelay(CYCLE_DURATION - 600, withTiming(1, { duration: 1 })),
          withTiming(0.2, { duration: 200 }),
          withTiming(0.3, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Trail streak left then reset
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-50 - index * 5, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(offsetY * 0.5, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: length,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 2,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.6 : 0,
          shadowRadius: glow ? 4 : 0,
        },
      ]}
    />
  );
});

// ============================================
// PETAL PARTICLES - Infinite spiral rise, fade, respawn
// ============================================
const PetalParticle = memo(({
  index,
  color,
  containerSize,
}: {
  index: number;
  color: string;
  containerSize: number;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);
  const rotation = useSharedValue(0);

  const startX = ((index / PARTICLE_COUNT) - 0.5) * containerSize * 0.5;
  const delay = getParticleDelay(index, PARTICLE_COUNT);
  const isLeaf = index % 4 === 0;

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(CYCLE_DURATION - 550, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 350 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(0.9 + (index % 3) * 0.15, { damping: 10 }),
          withDelay(CYCLE_DURATION - 500, withTiming(0.9, { duration: 1 })),
          withTiming(0.4, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Spiral float upward then reset
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-70, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Continuous spiral X motion
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 20, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX - 15, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX + 10, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX - 5, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Gentle tumble rotation
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(180, { duration: CYCLE_DURATION - 200 }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
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
        isLeaf ? styles.leaf : styles.petal,
        animatedStyle,
        { backgroundColor: color },
      ]}
    />
  );
});

// ============================================
// MOTION PARTICLES - Infinite horizontal speed streaks
// ============================================
const MotionParticle = memo(({
  index,
  color,
}: {
  index: number;
  color: string;
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scaleX = useSharedValue(0.2);

  const offsetY = (index - PARTICLE_COUNT / 2) * 14;
  const delay = getParticleDelay(index, PARTICLE_COUNT);
  const length = 18 + (index % 4) * 5;

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 80 }),
          withDelay(CYCLE_DURATION - 400, withTiming(0.8, { duration: 1 })),
          withTiming(0, { duration: 170 }),
          withTiming(0, { duration: 150 }),
        ),
        -1,
        false
      )
    );

    scaleX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withDelay(CYCLE_DURATION - 500, withTiming(1, { duration: 1 })),
          withTiming(0.4, { duration: 170 }),
          withTiming(0.2, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Quick horizontal streak then reset
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-45 - index * 8, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: offsetY },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: length,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 1.5,
        },
      ]}
    />
  );
});

// ============================================
// COIN PARTICLES - Infinite fountain arc up/down
// ============================================
const CoinParticle = memo(({
  index,
  total,
  color,
  glow,
}: {
  index: number;
  total: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotateY = useSharedValue(0);

  const angle = (index / total) * Math.PI - Math.PI / 2; // Upward arc
  const distance = 35 + (index % 3) * 10;
  const delay = getParticleDelay(index, total);
  const size = 8 + (index % 3) * 2;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance * 0.8;

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withDelay(CYCLE_DURATION - 450, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 8, stiffness: 180 }),
          withDelay(CYCLE_DURATION - 500, withTiming(1, { duration: 1 })),
          withTiming(0.3, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Continuous coin flip rotation
    rotateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(720, { duration: CYCLE_DURATION }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Fountain: rise then fall with bounce, then reset
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-55, { duration: (CYCLE_DURATION - 200) / 2, easing: Easing.out(Easing.cubic) }),
          withTiming(20, { duration: (CYCLE_DURATION - 200) / 2, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateY: `${rotateY.value}deg` },
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
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.7 : 0,
          shadowRadius: glow ? 5 : 0,
        },
      ]}
    >
      {/* Inner shine arc */}
      <View style={[styles.coinShine, { width: size * 0.4, height: size * 0.4 }]} />
    </Animated.View>
  );
});

// ============================================
// CRESCENT PARTICLES - Infinite glow pulse
// ============================================
const CrescentParticle = memo(({
  index,
  total,
  color,
  glow,
}: {
  index: number;
  total: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const glowPulse = useSharedValue(1);

  const angle = (index / total) * Math.PI * 2;
  const distance = 35 + (index % 3) * 10;
  const delay = getParticleDelay(index, total);
  const isStar = index % 3 === 0;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 250 }),
          withDelay(CYCLE_DURATION - 600, withTiming(1, { duration: 1 })),
          withTiming(0, { duration: 350 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 12, stiffness: 120 }),
          withDelay(CYCLE_DURATION - 500, withTiming(1, { duration: 1 })),
          withTiming(0.3, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Infinite gentle glow pulse
    if (glow) {
      glowPulse.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(0.9, { duration: 500 }),
          ),
          -1,
          true
        )
      );
    }

    // Gentle radial float then reset
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value * glowPulse.value },
    ],
    opacity: opacity.value,
  }));

  if (isStar) {
    // Tiny 4-point star
    return (
      <Animated.View style={[styles.particle, animatedStyle]}>
        <View style={[
          styles.tinyStar,
          { backgroundColor: color },
          glow && { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 4 }
        ]} />
      </Animated.View>
    );
  }

  // Crescent moon shape
  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <View style={[
        styles.crescent,
        {
          borderColor: color,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.7 : 0,
          shadowRadius: glow ? 5 : 0,
        }
      ]}>
        <View style={styles.crescentInner} />
      </View>
    </Animated.View>
  );
});

// ============================================
// WISP PARTICLES - Infinite steam rise, expand, fade, respawn
// ============================================
const WispParticle = memo(({
  index,
  color,
}: {
  index: number;
  color: string;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const scaleX = useSharedValue(1);

  const startX = ((index / PARTICLE_COUNT) - 0.5) * 30;
  const delay = getParticleDelay(index, PARTICLE_COUNT);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 200 }),
          withDelay(CYCLE_DURATION - 700, withTiming(0.7, { duration: 1 })),
          withTiming(0, { duration: 500 }),
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: CYCLE_DURATION - 200 }),
          withTiming(0.5, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Rise upward then reset
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-60, { duration: CYCLE_DURATION - 200, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Gentle continuous drift
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 12, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX - 10, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(startX + 5, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );

    // Expand horizontally as it rises (steam dissipation)
    scaleX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withDelay(400, withTiming(1.8, { duration: CYCLE_DURATION - 600, easing: Easing.out(Easing.quad) })),
          withTiming(1, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        styles.wisp,
        animatedStyle,
        { backgroundColor: color },
      ]}
    />
  );
});

// ============================================
// GLOW PARTICLES - Soft floating dots for Night/Calm vibes (🌙)
// ============================================
const GlowParticle = memo(({
  index,
  total,
  color,
  glow,
}: {
  index: number;
  total: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const glowPulse = useSharedValue(1);

  const angle = (index / total) * Math.PI * 2;
  const distance = 30 + (index % 4) * 10;
  const delay = getParticleDelay(index, total);
  const size = 4 + (index % 3) * 2;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    // Gentle fade in/out - peaceful rhythm
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600, easing: Easing.out(Easing.quad) }),
          withDelay(CYCLE_DURATION - 1400, withTiming(0.7, { duration: 200 })),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false
      )
    );

    // Gentle scale pulse
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
          withDelay(CYCLE_DURATION - 1200, withTiming(1.1, { duration: 200 })),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        false
      )
    );

    // Soft breathing glow pulse
    if (glow) {
      glowPulse.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true
        )
      );
    }

    // Very gentle float outward - peaceful movement
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX * 0.7, { duration: CYCLE_DURATION - 400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY * 0.7, { duration: CYCLE_DURATION - 400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value * glowPulse.value },
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
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.9 : 0,
          shadowRadius: glow ? 8 : 0,
        },
      ]}
    />
  );
});

// ============================================
// SPOTLIGHT PARTICLES - Dramatic rays for Entertainment (🎭)
// ============================================
const SpotlightParticle = memo(({
  index,
  total,
  color,
  glow,
}: {
  index: number;
  total: number;
  color: string;
  glow: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scaleY = useSharedValue(0.2);
  const rotation = useSharedValue(0);

  const angle = (index / total) * Math.PI * 2;
  const baseRotation = (angle * 180) / Math.PI + 90; // Point outward from center
  const distance = 35 + (index % 3) * 8;
  const delay = getParticleDelay(index, total);
  const length = 14 + (index % 4) * 4;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    // Dramatic entrance - quick flash in, hold, fade
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withDelay(CYCLE_DURATION - 600, withTiming(0.9, { duration: 100 })),
          withTiming(0, { duration: 350 }),
        ),
        -1,
        false
      )
    );

    // Ray extends outward dramatically
    scaleY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 8, stiffness: 200 }),
          withDelay(CYCLE_DURATION - 600, withTiming(1.1, { duration: 100 })),
          withTiming(0.2, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Slight rotation wiggle for drama
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(baseRotation + 5, { duration: 400 }),
          withTiming(baseRotation - 5, { duration: 400 }),
          withTiming(baseRotation, { duration: 200 }),
          withDelay(CYCLE_DURATION - 1200, withTiming(baseRotation, { duration: 1 })),
          withTiming(baseRotation, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Fan outward from center
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: 500, easing: Easing.out(Easing.cubic) }),
          withDelay(CYCLE_DURATION - 700, withTiming(targetX, { duration: 1 })),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY, { duration: 500, easing: Easing.out(Easing.cubic) }),
          withDelay(CYCLE_DURATION - 700, withTiming(targetY, { duration: 1 })),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scaleY: scaleY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: 3,
          height: length,
          backgroundColor: color,
          borderRadius: 1.5,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.7 : 0,
          shadowRadius: glow ? 6 : 0,
        },
      ]}
    />
  );
});

// ============================================
// SHIMMER PARTICLES - Patriotic wave for Flags (🇸🇦)
// ============================================
const ShimmerParticle = memo(({
  index,
  total,
  color,
}: {
  index: number;
  total: number;
  color: string;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(45); // Diamond orientation

  const angle = (index / total) * Math.PI * 2;
  const distance = 32 + (index % 3) * 10;
  const delay = getParticleDelay(index, total);
  const size = 5 + (index % 3) * 2;

  useEffect(() => {
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    // Wave-like opacity - elegant shimmer
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0.5, { duration: 300 }),
          withTiming(0.9, { duration: 300 }),
          withDelay(CYCLE_DURATION - 1300, withTiming(0.8, { duration: 100 })),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false
      )
    );

    // Gentle scale pulse
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1, { damping: 12, stiffness: 120 }),
          withTiming(0.8, { duration: 200 }),
          withTiming(1.1, { duration: 200 }),
          withDelay(CYCLE_DURATION - 800, withTiming(1, { duration: 100 })),
          withTiming(0.3, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Diamond rotation - subtle sparkle
    rotation.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(60, { duration: 400 }),
          withTiming(30, { duration: 400 }),
          withTiming(45, { duration: 300 }),
          withDelay(CYCLE_DURATION - 1300, withTiming(45, { duration: 1 })),
          withTiming(45, { duration: 200 }),
        ),
        -1,
        false
      )
    );

    // Wave motion - float outward with slight wave
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetX, { duration: CYCLE_DURATION - 400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(targetY + Math.sin(angle * 2) * 8, { duration: (CYCLE_DURATION - 400) / 2, easing: Easing.out(Easing.quad) }),
          withTiming(targetY - Math.sin(angle * 2) * 5, { duration: (CYCLE_DURATION - 400) / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false
      )
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
          borderRadius: 1,
        },
      ]}
    />
  );
});

// ============================================
// MAIN COMPONENT
// ============================================
interface IconParticleBurstProps {
  emoji: string;
  size?: number;
}

export const IconParticleBurst: React.FC<IconParticleBurstProps> = memo(({
  emoji,
  size = 72,
}) => {
  const config = useMemo(() => getParticleConfig(emoji), [emoji]);

  const particles = useMemo(() => {
    // Return nothing for 'none' type - no particles for unmatched emojis
    if (config.type === 'none') {
      return [];
    }

    const result = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = config.colors[i % config.colors.length];

      switch (config.type) {
        case 'hearts':
          result.push(
            <HeartParticle key={i} index={i} color={color} containerSize={size} glow={config.glow} />
          );
          break;
        case 'confetti':
          result.push(
            <ConfettiParticle key={i} index={i} total={PARTICLE_COUNT} color={color} />
          );
          break;
        case 'stars':
          result.push(
            <StarParticle key={i} index={i} total={PARTICLE_COUNT} color={color} glow={config.glow} />
          );
          break;
        case 'trail':
          result.push(
            <TrailParticle key={i} index={i} color={color} glow={config.glow} />
          );
          break;
        case 'petals':
          result.push(
            <PetalParticle key={i} index={i} color={color} containerSize={size} />
          );
          break;
        case 'motion':
          result.push(
            <MotionParticle key={i} index={i} color={color} />
          );
          break;
        case 'coins':
          result.push(
            <CoinParticle key={i} index={i} total={PARTICLE_COUNT} color={color} glow={config.glow} />
          );
          break;
        case 'crescents':
          result.push(
            <CrescentParticle key={i} index={i} total={PARTICLE_COUNT} color={color} glow={config.glow} />
          );
          break;
        case 'wisps':
          result.push(
            <WispParticle key={i} index={i} color={color} />
          );
          break;
        case 'glow':
          result.push(
            <GlowParticle key={i} index={i} total={PARTICLE_COUNT} color={color} glow={config.glow} />
          );
          break;
        case 'spotlights':
          result.push(
            <SpotlightParticle key={i} index={i} total={PARTICLE_COUNT} color={color} glow={config.glow} />
          );
          break;
        case 'shimmer':
          result.push(
            <ShimmerParticle key={i} index={i} total={PARTICLE_COUNT} color={color} />
          );
          break;
      }
    }

    return result;
  }, [config, size]);

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      {particles}
    </View>
  );
});

IconParticleBurst.displayName = 'IconParticleBurst';

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  particle: {
    position: 'absolute',
  },
  // Heart shape
  heart: {
    width: 9,
    height: 9,
    transform: [{ rotate: '-45deg' }],
    position: 'relative',
  },
  heartBefore: {
    position: 'absolute',
    top: -4.5,
    left: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  heartAfter: {
    position: 'absolute',
    top: 0,
    left: 4.5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  // 4-point star shape
  fourPointStar: {
    width: 10,
    height: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starHorizontal: {
    position: 'absolute',
    width: 10,
    height: 3,
    borderRadius: 1.5,
  },
  starVertical: {
    position: 'absolute',
    width: 3,
    height: 10,
    borderRadius: 1.5,
  },
  // Diamond shape
  diamond: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  // Tiny star for crescents
  tinyStar: {
    width: 5,
    height: 5,
    borderRadius: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  // Crescent moon shape
  crescent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.5,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  crescentInner: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  // Petal shape (curved ellipse)
  petal: {
    width: 6,
    height: 11,
    borderRadius: 6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  // Leaf shape (pointed ellipse)
  leaf: {
    width: 5,
    height: 10,
    borderRadius: 5,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Coin shine
  coinShine: {
    position: 'absolute',
    top: 1,
    left: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 100,
  },
  // Wisp/steam shape
  wisp: {
    width: 12,
    height: 6,
    borderRadius: 6,
    opacity: 0.6,
  },
});

export default IconParticleBurst;
