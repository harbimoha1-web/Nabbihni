import React, { memo, useEffect } from 'react';
import { Text, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  getAnimationConfig,
  getIntensity,
  AnimationConfig,
} from './iconAnimations';

interface AnimatedIconProps {
  emoji: string;
  size: number;
  disabled?: boolean;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * AnimatedIcon - Displays an emoji with a unique idle animation
 * based on its semantic meaning
 */
export const AnimatedIcon: React.FC<AnimatedIconProps> = memo(({
  emoji,
  size,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    let isMounted = true;

    const startAnimation = async () => {
      // Check for reduce motion accessibility setting
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();

      if (disabled || reduceMotion || !isMounted) {
        return;
      }

      const config = getAnimationConfig(emoji);
      const intensity = getIntensity(size);

      // Apply animation based on type
      applyAnimation(config, intensity);
    };

    const applyAnimation = (config: AnimationConfig, intensity: number) => {
      const { type, duration } = config;
      const easeInOut = Easing.inOut(Easing.sin);

      switch (type) {
        case 'none':
          // No animation - emoji stays static
          return;
        case 'shake':
          applyShakeAnimation(config, intensity, easeInOut);
          break;
        case 'heartbeat':
          applyHeartbeatAnimation(config, intensity);
          break;
        case 'shine':
          applyShineAnimation(config, intensity, easeInOut);
          break;
        case 'float':
          applyFloatAnimation(config, intensity, easeInOut);
          break;
        case 'glow':
          applyGlowAnimation(config, intensity, easeInOut);
          break;
        case 'breathe':
          applyBreatheAnimation(config, intensity, easeInOut);
          break;
        case 'swing':
          applySwingAnimation(config, intensity, easeInOut);
          break;
        case 'spin':
          applySpinAnimation(config);
          break;
        case 'flicker':
          applyFlickerAnimation(config, intensity);
          break;
        case 'sway':
          applySwayAnimation(config, intensity, easeInOut);
          break;
        case 'twinkle':
          applyTwinkleAnimation(config, intensity, easeInOut);
          break;
        case 'wave':
          applyWaveAnimation(config, intensity, easeInOut);
          break;
        case 'bounce':
          applyBounceAnimation(config, intensity);
          break;
        case 'nod':
          applyNodAnimation(config, intensity, easeInOut);
          break;
      }
    };

    // Shake animation - festive rotation with occasional bounce
    const applyShakeAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const rot = (config.rotation || 8) * intensity;
      const dur = config.duration;
      const rest = config.restDuration || 800;

      rotation.value = withRepeat(
        withSequence(
          withTiming(-rot, { duration: dur / 4, easing }),
          withTiming(rot, { duration: dur / 2, easing }),
          withTiming(-rot / 2, { duration: dur / 4, easing }),
          withTiming(0, { duration: dur / 4, easing }),
          withDelay(rest, withTiming(0))
        ),
        -1,
        false
      );

      // Occasional bounce
      scale.value = withRepeat(
        withSequence(
          withDelay(dur, withTiming(1.05 * intensity + (1 - intensity), { duration: 150 })),
          withTiming(1, { duration: 150 }),
          withDelay(rest, withTiming(1))
        ),
        -1,
        false
      );
    };

    // Heartbeat - double pulse
    const applyHeartbeatAnimation = (
      config: AnimationConfig,
      intensity: number
    ) => {
      const scaleMax = config.scaleMax || 1.15;
      const scaleMid = 1 + (scaleMax - 1) * 0.33;
      const maxScaled = 1 + (scaleMax - 1) * intensity;
      const midScaled = 1 + (scaleMid - 1) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration: 150 }),
          withTiming(1, { duration: 100 }),
          withTiming(midScaled, { duration: 150 }),
          withTiming(1, { duration: 100 }),
          withDelay(1100, withTiming(1))
        ),
        -1,
        false
      );
    };

    // Shine - gentle scale with subtle opacity
    const applyShineAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, scaleMax = 1.05, opacityMin = 0.9 } = config;
      const maxScaled = 1 + (scaleMax - 1) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration: duration / 2, easing }),
          withTiming(1, { duration: duration / 2, easing })
        ),
        -1,
        false
      );

      const opMin = 1 - (1 - opacityMin) * intensity;
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing }),
          withTiming(opMin, { duration: duration / 2, easing })
        ),
        -1,
        false
      );
    };

    // Float - gentle movement upward-right with banking
    const applyFloatAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, translateX: tx = 4, translateY: ty = -6, rotation: rot = 5 } = config;
      const txScaled = tx * intensity;
      const tyScaled = ty * intensity;
      const rotScaled = rot * intensity;

      translateX.value = withRepeat(
        withSequence(
          withTiming(txScaled, { duration: duration / 2, easing }),
          withTiming(-txScaled / 2, { duration: duration / 2, easing })
        ),
        -1,
        true
      );

      translateY.value = withRepeat(
        withSequence(
          withTiming(tyScaled, { duration: duration / 2, easing }),
          withTiming(-tyScaled / 2, { duration: duration / 2, easing })
        ),
        -1,
        true
      );

      rotation.value = withRepeat(
        withSequence(
          withTiming(rotScaled, { duration: duration / 2, easing }),
          withTiming(-rotScaled / 2, { duration: duration / 2, easing })
        ),
        -1,
        true
      );
    };

    // Glow - slow breathe with opacity pulse
    const applyGlowAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const {
        duration,
        scaleMin = 0.98,
        scaleMax = 1.02,
        opacityMin = 0.85,
        opacityMax = 1,
      } = config;

      const minScaled = 1 - (1 - scaleMin) * intensity;
      const maxScaled = 1 + (scaleMax - 1) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration: duration / 2, easing }),
          withTiming(minScaled, { duration: duration / 2, easing })
        ),
        -1,
        true
      );

      const opMin = 1 - (1 - opacityMin) * intensity;
      opacity.value = withRepeat(
        withSequence(
          withTiming(opacityMax, { duration: duration / 2, easing }),
          withTiming(opMin, { duration: duration / 2, easing })
        ),
        -1,
        true
      );
    };

    // Breathe - subtle scale pulse
    const applyBreatheAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, scaleMin = 0.98, scaleMax = 1.02 } = config;
      const minScaled = 1 - (1 - scaleMin) * intensity;
      const maxScaled = 1 + (scaleMax - 1) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration: duration / 2, easing }),
          withTiming(minScaled, { duration: duration / 2, easing })
        ),
        -1,
        true
      );
    };

    // Swing - gentle pendulum rotation
    const applySwingAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, rotation: rot = 3 } = config;
      const rotScaled = rot * intensity;

      rotation.value = withRepeat(
        withSequence(
          withTiming(-rotScaled, { duration: duration / 2, easing }),
          withTiming(rotScaled, { duration: duration / 2, easing })
        ),
        -1,
        true
      );
    };

    // Spin - continuous 360 rotation
    const applySpinAnimation = (config: AnimationConfig) => {
      const { duration } = config;

      rotation.value = withRepeat(
        withTiming(360, { duration, easing: Easing.linear }),
        -1,
        false
      );
    };

    // Flicker - rapid micro-pulses like a candle flame
    const applyFlickerAnimation = (
      config: AnimationConfig,
      intensity: number
    ) => {
      const { duration, scaleMin = 0.97, scaleMax = 1.03 } = config;
      const minScaled = 1 - (1 - scaleMin) * intensity;
      const maxScaled = 1 + (scaleMax - 1) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration }),
          withTiming(minScaled, { duration: duration * 0.8 }),
          withTiming(1, { duration: duration * 0.5 }),
          withTiming(maxScaled * 0.98, { duration }),
          withTiming(minScaled * 1.01, { duration: duration * 0.7 })
        ),
        -1,
        true
      );
    };

    // Sway - gentle swinging with optional scale
    const applySwayAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, rotation: rot = 4, scaleMin, scaleMax } = config;
      const rotScaled = rot * intensity;

      rotation.value = withRepeat(
        withSequence(
          withTiming(-rotScaled, { duration: duration / 2, easing }),
          withTiming(rotScaled, { duration: duration / 2, easing })
        ),
        -1,
        true
      );

      if (scaleMin && scaleMax) {
        const minScaled = 1 - (1 - scaleMin) * intensity;
        const maxScaled = 1 + (scaleMax - 1) * intensity;

        scale.value = withRepeat(
          withSequence(
            withTiming(maxScaled, { duration: duration / 2, easing }),
            withTiming(minScaled, { duration: duration / 2, easing })
          ),
          -1,
          true
        );
      }
    };

    // Twinkle - scale pulse with occasional sparkle (opacity)
    const applyTwinkleAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const {
        duration,
        scaleMin = 0.9,
        scaleMax = 1.1,
        opacityMin = 0.7,
      } = config;

      const minScaled = 1 - (1 - scaleMin) * intensity;
      const maxScaled = 1 + (scaleMax - 1) * intensity;
      const opMin = 1 - (1 - opacityMin) * intensity;

      scale.value = withRepeat(
        withSequence(
          withTiming(maxScaled, { duration: duration / 3, easing }),
          withTiming(minScaled, { duration: duration / 3, easing }),
          withTiming(1, { duration: duration / 3, easing })
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 4 }),
          withTiming(opMin, { duration: duration / 4 }),
          withTiming(1, { duration: duration / 4 }),
          withDelay(duration / 4, withTiming(1))
        ),
        -1,
        false
      );
    };

    // Wave - horizontal wave effect (flag-like)
    const applyWaveAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, rotation: rot = 3, scaleMin, scaleMax } = config;
      const rotScaled = rot * intensity;

      rotation.value = withRepeat(
        withSequence(
          withTiming(-rotScaled, { duration: duration / 4, easing }),
          withTiming(rotScaled, { duration: duration / 2, easing }),
          withTiming(0, { duration: duration / 4, easing })
        ),
        -1,
        false
      );

      if (scaleMin && scaleMax) {
        const minScaled = 1 - (1 - scaleMin) * intensity;
        const maxScaled = 1 + (scaleMax - 1) * intensity;

        scale.value = withRepeat(
          withSequence(
            withTiming(maxScaled, { duration: duration / 2, easing }),
            withTiming(minScaled, { duration: duration / 2, easing })
          ),
          -1,
          true
        );
      }
    };

    // Bounce - vertical bounce with rotation
    const applyBounceAnimation = (
      config: AnimationConfig,
      intensity: number
    ) => {
      const { duration, translateY: ty = -8, rotation: rot = 5, restDuration = 500 } = config;
      const tyScaled = ty * intensity;
      const rotScaled = rot * intensity;

      translateY.value = withRepeat(
        withSequence(
          withTiming(tyScaled, { duration: duration / 2, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: duration / 2, easing: Easing.in(Easing.bounce) }),
          withDelay(restDuration, withTiming(0))
        ),
        -1,
        false
      );

      rotation.value = withRepeat(
        withSequence(
          withTiming(-rotScaled, { duration: duration / 4 }),
          withTiming(rotScaled, { duration: duration / 2 }),
          withTiming(0, { duration: duration / 4 }),
          withDelay(restDuration, withTiming(0))
        ),
        -1,
        false
      );
    };

    // Nod - grazing head bob
    const applyNodAnimation = (
      config: AnimationConfig,
      intensity: number,
      easing: Easing.EasingFn
    ) => {
      const { duration, translateY: ty = 2, rotation: rot = 2 } = config;
      const tyScaled = ty * intensity;
      const rotScaled = rot * intensity;

      translateY.value = withRepeat(
        withSequence(
          withTiming(tyScaled, { duration: duration / 4, easing }),
          withTiming(0, { duration: duration / 4, easing }),
          withDelay(duration / 2, withTiming(0))
        ),
        -1,
        false
      );

      rotation.value = withRepeat(
        withSequence(
          withTiming(rotScaled, { duration: duration / 4, easing }),
          withTiming(0, { duration: duration / 4, easing }),
          withDelay(duration / 2, withTiming(0))
        ),
        -1,
        false
      );
    };

    startAnimation();

    return () => {
      isMounted = false;
      cancelAnimation(scale);
      cancelAnimation(rotation);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [emoji, size, disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <AnimatedText
      style={[
        styles.icon,
        { fontSize: size },
        animatedStyle,
      ]}
    >
      {emoji}
    </AnimatedText>
  );
});

AnimatedIcon.displayName = 'AnimatedIcon';

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default AnimatedIcon;
