import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Countdown, ThemeId } from '@/types/countdown';
import { syncWidgetData } from '@/lib/widgetData';

const COUNTDOWNS_KEY = '@nabbihni/countdowns';
const SETTINGS_KEY = '@nabbihni/settings';
export const HOLIDAY_OVERRIDES_KEY = '@nabbihni/holiday-overrides';

export interface AppSettings {
  isPremium: boolean;
  purchasedThemes: ThemeId[];
  notificationsEnabled: boolean;
  hapticEnabled: boolean;
}

const defaultSettings: AppSettings = {
  isPremium: false,
  purchasedThemes: [],
  notificationsEnabled: true,
  hapticEnabled: true,
};

// Countdown CRUD operations
export const getCountdowns = async (): Promise<Countdown[]> => {
  try {
    const data = await AsyncStorage.getItem(COUNTDOWNS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting countdowns:', error);
    return [];
  }
};

export const getCountdown = async (id: string): Promise<Countdown | null> => {
  try {
    const countdowns = await getCountdowns();
    return countdowns.find((c) => c.id === id) || null;
  } catch (error) {
    console.error('Error getting countdown:', error);
    return null;
  }
};

export const createCountdown = async (
  data: Omit<Countdown, 'id' | 'createdAt'>
): Promise<Countdown> => {
  const countdown: Countdown = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  const countdowns = await getCountdowns();
  countdowns.unshift(countdown);
  await AsyncStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(countdowns));

  // Sync widget data (non-blocking)
  syncWidgetData().catch(() => {});

  return countdown;
};

export const updateCountdown = async (
  id: string,
  updates: Partial<Omit<Countdown, 'id' | 'createdAt'>>
): Promise<Countdown | null> => {
  try {
    const countdowns = await getCountdowns();
    const index = countdowns.findIndex((c) => c.id === id);

    if (index === -1) return null;

    countdowns[index] = { ...countdowns[index], ...updates };
    await AsyncStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(countdowns));

    // Sync widget data (non-blocking)
    syncWidgetData().catch(() => {});

    return countdowns[index];
  } catch (error) {
    console.error('Error updating countdown:', error);
    return null;
  }
};

export const deleteCountdown = async (id: string): Promise<boolean> => {
  try {
    const countdowns = await getCountdowns();
    const filtered = countdowns.filter((c) => c.id !== id);
    await AsyncStorage.setItem(COUNTDOWNS_KEY, JSON.stringify(filtered));

    // Sync widget data (non-blocking)
    syncWidgetData().catch(() => {});

    return true;
  } catch (error) {
    console.error('Error deleting countdown:', error);
    return false;
  }
};

// Settings operations
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultSettings;
  }
};

export const updateSettings = async (
  updates: Partial<AppSettings>
): Promise<AppSettings> => {
  try {
    const settings = await getSettings();
    const newSettings = { ...settings, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return newSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    return await getSettings();
  }
};

// Premium check
export const canUseTheme = async (themeId: ThemeId): Promise<boolean> => {
  const settings = await getSettings();
  const freeThemes: ThemeId[] = ['default', 'sunset', 'night', 'gold', 'ramadan'];

  if (freeThemes.includes(themeId)) return true;
  if (settings.isPremium) return true;
  if (settings.purchasedThemes.includes(themeId)) return true;

  return false;
};
