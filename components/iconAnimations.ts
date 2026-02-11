/**
 * Animation configurations for emoji icons
 * Each emoji has a unique animation reflecting its semantic meaning
 */

export type AnimationType =
  | 'shake'
  | 'heartbeat'
  | 'shine'
  | 'float'
  | 'glow'
  | 'breathe'
  | 'swing'
  | 'spin'
  | 'flicker'
  | 'sway'
  | 'twinkle'
  | 'wave'
  | 'bounce'
  | 'nod'
  | 'none'; // No animation for unmatched emojis

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  // Rotation in degrees (for shake, swing, spin, wave, sway)
  rotation?: number;
  // Scale values
  scaleMin?: number;
  scaleMax?: number;
  // Translation values
  translateX?: number;
  translateY?: number;
  // Opacity values
  opacityMin?: number;
  opacityMax?: number;
  // Rest duration between animation cycles
  restDuration?: number;
}

/**
 * Animation configurations for each emoji icon
 */
export const ICON_ANIMATIONS: Record<string, AnimationConfig> = {
  // Primary Icons (12)

  // Party - Festive shake with rotation and occasional bounce
  '🎉': {
    type: 'shake',
    rotation: 8,
    duration: 600,
    restDuration: 800,
  },

  // Heart - Double pulse heartbeat
  '❤️': {
    type: 'heartbeat',
    duration: 1600,
    scaleMin: 1,
    scaleMax: 1.15,
  },

  // Trophy - Gleaming shine with gentle scale
  '🏆': {
    type: 'shine',
    duration: 2000,
    scaleMin: 1,
    scaleMax: 1.05,
    opacityMin: 0.9,
    opacityMax: 1,
  },

  // Airplane - Gentle flight with banking
  '✈️': {
    type: 'float',
    duration: 3000,
    translateX: 4,
    translateY: -6,
    rotation: 5,
  },

  // Moon - Soft glow with very slow breathe
  '🌙': {
    type: 'glow',
    duration: 4000,
    scaleMin: 0.98,
    scaleMax: 1.02,
    opacityMin: 0.85,
    opacityMax: 1,
  },

  // Briefcase - Professional subtle breathe
  '💼': {
    type: 'breathe',
    duration: 3000,
    scaleMin: 0.99,
    scaleMax: 1.01,
  },

  // Graduation - Tassel swing
  '🎓': {
    type: 'swing',
    rotation: 3,
    duration: 2000,
  },

  // Soccer - Rolling continuous spin
  '⚽': {
    type: 'spin',
    duration: 3000,
    rotation: 360,
  },

  // Cake - Candle flicker micro-pulses
  '🎂': {
    type: 'flicker',
    duration: 200,
    scaleMin: 0.97,
    scaleMax: 1.03,
  },

  // House - Very subtle cozy breathe
  '🏠': {
    type: 'breathe',
    duration: 4000,
    scaleMin: 0.99,
    scaleMax: 1.01,
  },

  // Money - Weighty pendulum sway
  '💰': {
    type: 'sway',
    rotation: 4,
    duration: 2500,
  },

  // Flower - Blooming sway with slight scale
  '🌸': {
    type: 'sway',
    rotation: 3,
    duration: 3000,
    scaleMin: 0.98,
    scaleMax: 1.02,
  },

  // Special Icons (6)

  // Star - Twinkling sparkle
  '⭐': {
    type: 'twinkle',
    duration: 1500,
    scaleMin: 0.9,
    scaleMax: 1.1,
    opacityMin: 0.7,
    opacityMax: 1,
  },

  // Recurring - Continuous smooth spin
  '🔄': {
    type: 'spin',
    duration: 2000,
    rotation: 360,
  },

  // Sheep - Grazing head bob (nod)
  '🐑': {
    type: 'nod',
    duration: 2000,
    translateY: 2,
    rotation: 2,
  },

  // Saudi Flag - Proud horizontal wave
  '🇸🇦': {
    type: 'wave',
    duration: 2500,
    rotation: 3,
    scaleMin: 0.98,
    scaleMax: 1.02,
  },

  // Confetti - Celebration bounce with rotation
  '🎊': {
    type: 'bounce',
    duration: 1000,
    translateY: -8,
    rotation: 5,
    restDuration: 500,
  },

  // Theater - Dramatic alternating tilt
  '🎭': {
    type: 'swing',
    rotation: 5,
    duration: 2500,
  },

  // ==========================================
  // EXPANDED CATEGORY-BASED EMOJI ANIMATIONS
  // ==========================================

  // Hearts - pulsing love
  '💕': { type: 'heartbeat', duration: 1600, scaleMax: 1.12 },
  '💖': { type: 'heartbeat', duration: 1600, scaleMax: 1.12 },
  '💗': { type: 'heartbeat', duration: 1800, scaleMax: 1.10 },
  '💓': { type: 'heartbeat', duration: 1400, scaleMax: 1.15 },
  '💞': { type: 'heartbeat', duration: 1700, scaleMax: 1.12 },
  '💘': { type: 'heartbeat', duration: 1600, scaleMax: 1.12 },
  '💝': { type: 'heartbeat', duration: 1600, scaleMax: 1.10 },
  '🥰': { type: 'heartbeat', duration: 1600, scaleMax: 1.10 },
  '😍': { type: 'heartbeat', duration: 1600, scaleMax: 1.10 },

  // Party - festive energy
  '🥳': { type: 'shake', rotation: 8, duration: 600, restDuration: 800 },
  '🎈': { type: 'float', duration: 2500, translateY: -5, rotation: 3 },
  '🎁': { type: 'bounce', duration: 1200, translateY: -6, restDuration: 600 },

  // Achievement - gleaming success
  '🥇': { type: 'shine', duration: 2000, scaleMax: 1.05, opacityMin: 0.9 },
  '🥈': { type: 'shine', duration: 2200, scaleMax: 1.04, opacityMin: 0.88 },
  '🥉': { type: 'shine', duration: 2400, scaleMax: 1.03, opacityMin: 0.86 },
  '👑': { type: 'shine', duration: 2500, scaleMax: 1.04, opacityMin: 0.92 },
  '💎': { type: 'twinkle', duration: 1800, scaleMax: 1.08, opacityMin: 0.75 },
  '✨': { type: 'twinkle', duration: 1200, scaleMax: 1.1, opacityMin: 0.7 },
  '🌟': { type: 'twinkle', duration: 1500, scaleMax: 1.1, opacityMin: 0.7 },
  '💫': { type: 'twinkle', duration: 1400, scaleMax: 1.08, opacityMin: 0.75 },

  // Travel - movement
  '🚀': { type: 'float', duration: 2500, translateX: 3, translateY: -8, rotation: 8 },
  '🛸': { type: 'float', duration: 3500, translateX: 5, translateY: -4, rotation: 3 },
  '🚁': { type: 'float', duration: 2000, translateY: -3, rotation: 2 },
  '🚗': { type: 'float', duration: 2800, translateX: 4, translateY: 0, rotation: 1 },
  '🚌': { type: 'float', duration: 3000, translateX: 3, translateY: 0, rotation: 1 },

  // Nature - gentle breeze
  '🌺': { type: 'sway', rotation: 3, duration: 3000, scaleMin: 0.98, scaleMax: 1.02 },
  '🌷': { type: 'sway', rotation: 4, duration: 2800, scaleMin: 0.98, scaleMax: 1.02 },
  '🌹': { type: 'sway', rotation: 3, duration: 3200, scaleMin: 0.99, scaleMax: 1.01 },
  '🌼': { type: 'sway', rotation: 4, duration: 2600 },
  '🦋': { type: 'float', duration: 2000, translateX: 6, translateY: -4, rotation: 5 },

  // Sports - ball motion
  '🏀': { type: 'bounce', duration: 800, translateY: -10, rotation: 3, restDuration: 400 },
  '⚾': { type: 'spin', duration: 2500, rotation: 360 },
  '🎾': { type: 'bounce', duration: 700, translateY: -8, restDuration: 500 },
  '🏈': { type: 'spin', duration: 2000, rotation: 360 },
  '🎯': { type: 'twinkle', duration: 2000, scaleMax: 1.05, opacityMin: 0.85 },

  // Money - weighty pendulum
  '💵': { type: 'sway', rotation: 3, duration: 2500 },
  '💸': { type: 'float', duration: 2000, translateX: 4, translateY: -3, rotation: 5 },
  '🤑': { type: 'bounce', duration: 1000, translateY: -5, restDuration: 800 },
  '💳': { type: 'breathe', duration: 3000, scaleMin: 0.99, scaleMax: 1.01 },
  '💴': { type: 'sway', rotation: 3, duration: 2600 },
  '💶': { type: 'sway', rotation: 3, duration: 2500 },
  '💷': { type: 'sway', rotation: 3, duration: 2400 },

  // Religious - serene glow
  '🕌': { type: 'glow', duration: 4000, scaleMin: 0.98, scaleMax: 1.02, opacityMin: 0.88 },
  '☪️': { type: 'glow', duration: 4500, scaleMin: 0.99, scaleMax: 1.01, opacityMin: 0.9 },
  '📿': { type: 'sway', rotation: 2, duration: 3000 },
  '🕋': { type: 'glow', duration: 5000, scaleMin: 0.99, scaleMax: 1.01, opacityMin: 0.92 },

  // Food - steam/warmth
  '🍕': { type: 'breathe', duration: 3500, scaleMin: 0.98, scaleMax: 1.02 },
  '🍔': { type: 'breathe', duration: 3500, scaleMin: 0.98, scaleMax: 1.02 },
  '🍰': { type: 'flicker', duration: 250, scaleMin: 0.97, scaleMax: 1.03 },
  '☕': { type: 'flicker', duration: 300, scaleMin: 0.98, scaleMax: 1.02 },
  '🍜': { type: 'flicker', duration: 280, scaleMin: 0.98, scaleMax: 1.02 },
  '🍵': { type: 'flicker', duration: 300, scaleMin: 0.98, scaleMax: 1.02 },
  '🍲': { type: 'flicker', duration: 280, scaleMin: 0.97, scaleMax: 1.03 },

  // Work - professional subtle
  '📊': { type: 'breathe', duration: 3500, scaleMin: 0.99, scaleMax: 1.01 },
  '📈': { type: 'breathe', duration: 3500, scaleMin: 0.99, scaleMax: 1.01 },
  '💻': { type: 'breathe', duration: 4000, scaleMin: 0.99, scaleMax: 1.01 },
  '📱': { type: 'breathe', duration: 4000, scaleMin: 0.99, scaleMax: 1.01 },

  // Home - cozy subtle
  '🏡': { type: 'breathe', duration: 4000, scaleMin: 0.99, scaleMax: 1.01 },
  '🛋️': { type: 'breathe', duration: 4500, scaleMin: 0.99, scaleMax: 1.01 },
  '🛏️': { type: 'breathe', duration: 4500, scaleMin: 0.99, scaleMax: 1.01 },

  // Education - gentle
  '📚': { type: 'breathe', duration: 4000, scaleMin: 0.99, scaleMax: 1.01 },
  '✏️': { type: 'swing', rotation: 2, duration: 2500 },
  '📖': { type: 'breathe', duration: 3500, scaleMin: 0.99, scaleMax: 1.01 },

  // Theater/Entertainment
  '🎬': { type: 'swing', rotation: 4, duration: 2500 },
  '🎪': { type: 'shake', rotation: 5, duration: 800, restDuration: 1000 },

  // Flags - wave motion
  '🏳️': { type: 'wave', duration: 2500, rotation: 3, scaleMin: 0.98, scaleMax: 1.02 },
  '🏴': { type: 'wave', duration: 2500, rotation: 3, scaleMin: 0.98, scaleMax: 1.02 },

  // Recurring - rotation
  '♻️': { type: 'spin', duration: 2500, rotation: 360 },
  '🔃': { type: 'spin', duration: 2000, rotation: 360 },
};

/**
 * Default animation for unknown emojis - no animation (clean, static)
 */
export const DEFAULT_ANIMATION: AnimationConfig = {
  type: 'none',
  duration: 0,
};

/**
 * Get animation config for an emoji, falling back to default
 */
export const getAnimationConfig = (emoji: string): AnimationConfig => {
  return ICON_ANIMATIONS[emoji] || DEFAULT_ANIMATION;
};

/**
 * Size intensity multipliers
 * Smaller icons = more subtle animations
 */
export const SIZE_INTENSITY: Record<number, number> = {
  12: 0.5,  // Badge size - very subtle
  32: 0.7,  // Card size - noticeable but not distracting
  72: 1.0,  // Detail view - full beautiful animation
};

/**
 * Get intensity multiplier based on size
 */
export const getIntensity = (size: number): number => {
  if (size <= 12) return SIZE_INTENSITY[12];
  if (size <= 32) return SIZE_INTENSITY[32];
  return SIZE_INTENSITY[72];
};
