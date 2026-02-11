import { Theme, ThemeId } from '@/types/countdown';

export const themes: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: 'Midnight',
    nameAr: 'منتصف الليل',
    colors: {
      primary: '#0f0c29',
      secondary: '#302b63',
      background: ['#0f0c29', '#302b63', '#24243e'] as const,
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      accent: '#a78bfa',
    },
    isPremium: false,
  },
  sunset: {
    id: 'sunset',
    name: 'Aurora',
    nameAr: 'الشفق',
    colors: {
      primary: '#ff6b6b',
      secondary: '#feca57',
      background: ['#ff6b6b', '#ff8e53', '#feca57'] as const,
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      accent: '#ffffff',
    },
    isPremium: false,
  },
  night: {
    id: 'night',
    name: 'Ocean',
    nameAr: 'المحيط',
    colors: {
      primary: '#0077b6',
      secondary: '#00b4d8',
      background: ['#03045e', '#0077b6', '#00b4d8'] as const,
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      accent: '#ffffff',
    },
    isPremium: false,
  },
  gold: {
    id: 'gold',
    name: 'Royal',
    nameAr: 'ملكي',
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      background: ['#1a1a2e', '#16213e', '#0f3460'] as const,
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      accent: '#f4d03f',
    },
    isPremium: false,
  },
  ramadan: {
    id: 'ramadan',
    name: 'Emerald',
    nameAr: 'زمردي',
    colors: {
      primary: '#004d40',
      secondary: '#00695c',
      background: ['#004d40', '#00695c', '#00897b'] as const,
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      accent: '#64ffda',
    },
    isPremium: false,
  },
};

export const themeList = Object.values(themes);

export const getTheme = (id: ThemeId): Theme => themes[id] || themes.default;

// Premium glass-style color system (matches dark theme - Arabian Nights)
export const COLORS = {
  // Base
  primary: '#D97706',
  accent: '#F59E0B',
  background: '#0F1419',
  surface: '#181E25',
  surfaceHover: '#1E262F',

  // Glass effect
  glass: 'rgba(245, 243, 240, 0.08)',
  glassBorder: 'rgba(245, 243, 240, 0.12)',
  glassHighlight: 'rgba(245, 243, 240, 0.16)',

  // Text
  text: '#F5F3F0',
  textSecondary: 'rgba(245, 243, 240, 0.72)',
  textMuted: 'rgba(245, 243, 240, 0.48)',

  // Borders
  border: 'rgba(245, 243, 240, 0.12)',
  borderLight: 'rgba(245, 243, 240, 0.06)',

  // Status
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',

  // Gradients
  gradientPrimary: ['#D97706', '#F59E0B', '#FBBF24'] as const,
  gradientAccent: ['#B45309', '#D97706', '#F59E0B'] as const,
  gradientGold: ['#D97706', '#F59E0B', '#FBBF24'] as const,
};

// Celebration colors for animations
export const CELEBRATION_COLORS = {
  confetti: ['#f472b6', '#a78bfa', '#818cf8', '#6ee7b7', '#fcd34d', '#f87171'],
  hearts: ['#f472b6', '#ec4899', '#db2777', '#be185d', '#ff6b9d'],
  stars: ['#fcd34d', '#fbbf24', '#f59e0b', '#ffffff', '#fef3c7'],
  gold: ['#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
  ocean: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'],
  aurora: ['#a78bfa', '#818cf8', '#6366f1', '#f472b6', '#34d399'],
};
