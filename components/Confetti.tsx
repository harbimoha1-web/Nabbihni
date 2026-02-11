import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#f6ad55', // gold
  '#f97316', // orange
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#10b981', // green
  '#38bdf8', // blue
  '#ef4444', // red
  '#fbbf24', // yellow
];

const CONFETTI_COUNT = 50;

interface ConfettiPieceProps {
  index: number;
  onComplete?: () => void;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, onComplete }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const startX = Math.random() * width;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 8 + Math.random() * 8;
  const delay = Math.random() * 500;
  const duration = 2000 + Math.random() * 1000;
  const horizontalDrift = (Math.random() - 0.5) * 200;

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));

    translateY.value = withDelay(
      delay,
      withTiming(height + 100, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(horizontalDrift / 2, { duration: duration / 2 }),
        withTiming(horizontalDrift, { duration: duration / 2 })
      )
    );

    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, {
        duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished && index === 0 && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, [
    delay,
    duration,
    horizontalDrift,
    index,
    onComplete,
    opacity,
    rotate,
    scale,
    translateX,
    translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const isSquare = index % 3 === 0;
  const isCircle = index % 3 === 1;

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        {
          left: startX,
          width: size,
          height: isSquare ? size : size * 1.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : isSquare ? 2 : 0,
        },
      ]}
    />
  );
};

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  if (!active) return null;

  return (
    <>
      {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
        <ConfettiPiece
          key={index}
          index={index}
          onComplete={index === 0 ? onComplete : undefined}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    top: 0,
  },
});

export default Confetti;
