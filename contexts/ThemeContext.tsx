import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Accent
  accent: string;
  accentLight: string;
  accentDark: string;

  // Borders
  border: string;
  borderLight: string;

  // Status
  success: string;
  error: string;
  warning: string;

  // Overlay
  overlay: string;
  glass: string;
}

const lightColors: AppColors = {
  // Backgrounds - Warm creams (Desert Dawn theme)
  background: '#FBF8F4',       // Warm cream - easy on eyes
  surface: '#FFFFFF',          // Pure white cards
  surfaceSecondary: '#F5F0E8', // Warm sand tint
  card: '#FFFFFF',

  // Text - Rich warm tones for Arabic readability
  text: '#1C1614',             // Warm charcoal
  textSecondary: '#5C5147',    // Warm brown-gray
  textMuted: '#9A8F83',        // Muted warm gray

  // Accent - Amber/Gold for celebration
  accent: '#D97706',           // Amber - celebratory, warm
  accentLight: '#F59E0B',      // Lighter amber
  accentDark: '#B45309',       // Deeper amber

  // Borders
  border: '#E8E0D5',           // Warm border
  borderLight: '#F0EBE3',      // Very subtle

  // Status
  success: '#059669',          // Teal-green
  error: '#DC2626',            // Rich red
  warning: '#D97706',          // Amber

  // Overlay
  overlay: 'rgba(28, 22, 20, 0.5)',
  glass: 'rgba(255, 253, 250, 0.85)',
};

const darkColors: AppColors = {
  // Backgrounds - Deep midnight blue (Arabian Nights theme)
  background: '#0F1419',       // Midnight blue, not harsh black
  surface: '#181E25',          // Elevated surface
  surfaceSecondary: '#1E262F', // Secondary surface
  card: '#1E262F',

  // Text - Warm off-whites
  text: '#F5F3F0',             // Warm off-white
  textSecondary: 'rgba(245, 243, 240, 0.72)',
  textMuted: 'rgba(245, 243, 240, 0.48)',

  // Accent - Golden amber
  accent: '#F59E0B',           // Bright amber
  accentLight: '#FBBF24',      // Lighter gold
  accentDark: '#D97706',       // Deeper amber

  // Borders
  border: 'rgba(245, 243, 240, 0.12)',
  borderLight: 'rgba(245, 243, 240, 0.06)',

  // Status
  success: '#34D399',          // Bright emerald
  error: '#F87171',            // Soft coral
  warning: '#FBBF24',          // Gold

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.65)',
  glass: 'rgba(30, 38, 47, 0.95)',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@nabbihni/theme-mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  // Track system theme separately for reactive updates
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setModeState(saved as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme:', e);
      }
      setIsLoaded(true);
    };
    loadTheme();
  }, []);

  // Update systemTheme when useColorScheme() hook value changes
  // (no need for a separate Appearance.addChangeListener — the hook already handles it)
  useEffect(() => {
    if (systemColorScheme) {
      setSystemTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme]);

  // Save theme preference
  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, []);

  // Determine if dark mode - use systemTheme state for reactive updates
  const isDark = mode === 'system'
    ? systemTheme === 'dark'
    : mode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => ({
    mode, isDark, colors, setMode,
  }), [mode, isDark, colors, setMode]);

  // Always render provider - splash screen handles loading state
  // This prevents the blocking null chain that causes startup freeze
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export colors for static usage (backwards compatibility)
export { lightColors, darkColors };
export type { AppColors, ThemeMode };
