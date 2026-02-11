import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Countdown } from '@/types/countdown';
import { getTheme } from '@/constants/themes';

const COUNTDOWNS_KEY = '@nabbihni/countdowns';
const WIDGET_DATA_KEY = '@nabbihni/widget-data';
const APP_GROUP_ID = 'group.app.nabbihni.countdown';

export interface WidgetCountdown {
  id: string;
  title: string;
  icon: string;
  targetDate: string;
  bgColor1: string;
  bgColor2: string;
  accentColor: string;
  isComplete: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
}

export interface WidgetData {
  countdowns: WidgetCountdown[];
  updatedAt: string;
}

/**
 * Calculate time remaining for a countdown
 */
function getTimeRemaining(targetDate: string) {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isComplete: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { days, hours, minutes, isComplete: false };
}

/**
 * Prepare widget data from countdowns
 */
function prepareWidgetData(countdowns: Countdown[]): WidgetData {
  // Sort by nearest target date, exclude completed ones first
  const now = Date.now();
  const sorted = [...countdowns]
    .sort((a, b) => {
      const aTime = new Date(a.targetDate).getTime();
      const bTime = new Date(b.targetDate).getTime();
      const aComplete = aTime <= now;
      const bComplete = bTime <= now;

      // Active countdowns first
      if (aComplete !== bComplete) return aComplete ? 1 : -1;
      // Starred first among active
      if (!aComplete && a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      // Then by nearest date
      return aTime - bTime;
    })
    .slice(0, 3); // Top 3 for widget display

  const widgetCountdowns: WidgetCountdown[] = sorted.map((c) => {
    const theme = getTheme(c.theme);
    const remaining = getTimeRemaining(c.targetDate);

    return {
      id: c.id,
      title: c.title,
      icon: c.icon,
      targetDate: c.targetDate,
      bgColor1: theme.colors.background[0],
      bgColor2: theme.colors.background[1],
      accentColor: theme.colors.accent,
      isComplete: remaining.isComplete,
      daysRemaining: remaining.days,
      hoursRemaining: remaining.hours,
      minutesRemaining: remaining.minutes,
    };
  });

  return {
    countdowns: widgetCountdowns,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Sync widget data to platform-specific storage
 * Called after every countdown CRUD operation
 */
export async function syncWidgetData(): Promise<void> {
  try {
    // Read countdowns from AsyncStorage
    const raw = await AsyncStorage.getItem(COUNTDOWNS_KEY);
    const countdowns: Countdown[] = raw ? JSON.parse(raw) : [];
    const widgetData = prepareWidgetData(countdowns);
    const jsonString = JSON.stringify(widgetData);

    // Store in AsyncStorage (Android widget task handler reads this)
    await AsyncStorage.setItem(WIDGET_DATA_KEY, jsonString);

    // Platform-specific sync
    if (Platform.OS === 'android') {
      await syncAndroidWidget();
    } else if (Platform.OS === 'ios') {
      await syncIOSWidget(jsonString);
    }
  } catch (error) {
    if (__DEV__) console.log('Widget sync skipped:', error);
  }
}

/**
 * Android: Request widget update via react-native-android-widget
 */
async function syncAndroidWidget(): Promise<void> {
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    // Update both small and medium widgets
    await requestWidgetUpdate({ widgetName: 'CountdownSmall' }).catch(() => {});
    await requestWidgetUpdate({ widgetName: 'CountdownMedium' }).catch(() => {});
  } catch {
    // Module not available (Expo Go or web)
  }
}

/**
 * iOS: Write data to App Group UserDefaults for WidgetKit
 */
async function syncIOSWidget(jsonString: string): Promise<void> {
  try {
    const SharedGroupPreferences = require('react-native-shared-group-preferences').default;
    await SharedGroupPreferences.setItem('widgetData', jsonString, APP_GROUP_ID);
  } catch {
    // Module not available (Expo Go or web)
  }
}
