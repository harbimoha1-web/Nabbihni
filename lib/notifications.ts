import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Countdown, ReminderTiming, ReminderOption, CustomReminderTiming } from '@/types/countdown';
import { translations, Language } from '@/locales/translations';

// Only import notifications on native platforms
const Notifications = Platform.OS !== 'web' ? require('expo-notifications') : null;

const NOTIFICATION_SETTINGS_KEY = '@nabbihni/notification-settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@nabbihni/scheduled-notifications';
const LANGUAGE_STORAGE_KEY = '@nabbihni/language';

// Default reminder settings
export interface ReminderSettings {
  enabled: boolean;
  defaultTimings: ReminderOption[];
}

const defaultReminderSettings: ReminderSettings = {
  enabled: true,
  defaultTimings: ['at_completion', '1_day'],
};

// Helper to get current language
const getCurrentLanguage = async (): Promise<Language> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en') return 'en';
  } catch {}
  return 'ar';
};

// Get reminder labels based on language
export const getReminderLabels = (lang: Language): Record<ReminderOption, string> => {
  const t = translations[lang];
  return {
    at_completion: t.reminders.atCompletion,
    '1_hour': t.reminders.oneHour,
    '1_day': t.reminders.oneDay,
    '1_week': t.reminders.oneWeek,
    custom: t.reminders.custom,
  };
};

// Legacy export for backwards compatibility (uses Arabic)
export const REMINDER_LABELS: Record<ReminderOption, string> = getReminderLabels('ar');

// Offset in milliseconds for each reminder option
export const REMINDER_OFFSETS: Record<Exclude<ReminderOption, 'custom'>, number> = {
  at_completion: 0,
  '1_hour': 60 * 60 * 1000,           // 1 hour
  '1_day': 24 * 60 * 60 * 1000,       // 1 day
  '1_week': 7 * 24 * 60 * 60 * 1000,  // 1 week
};

/**
 * Configure notification handler
 */
export const configureNotifications = () => {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Request notification permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    const lang = await getCurrentLanguage();
    const t = translations[lang];
    await Notifications.setNotificationChannelAsync('countdown-reminders', {
      name: t.notifications.channelName,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f6ad55',
    });
  }

  return true;
};

/**
 * Get reminder settings from storage
 */
export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (data) {
      return { ...defaultReminderSettings, ...JSON.parse(data) };
    }
    return defaultReminderSettings;
  } catch (error) {
    console.error('Error getting reminder settings:', error);
    return defaultReminderSettings;
  }
};

/**
 * Update reminder settings
 */
export const updateReminderSettings = async (
  updates: Partial<ReminderSettings>
): Promise<ReminderSettings> => {
  try {
    const settings = await getReminderSettings();
    const newSettings = { ...settings, ...updates };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    return newSettings;
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    return await getReminderSettings();
  }
};

/**
 * Calculate notification time based on reminder timing
 */
const getNotificationTime = (
  targetDate: Date,
  timing: ReminderTiming
): Date | null => {
  const now = new Date();

  if (typeof timing === 'object' && timing.type === 'custom') {
    const notifyTime = new Date(targetDate.getTime() - timing.offsetMinutes * 60 * 1000);
    return notifyTime > now ? notifyTime : null;
  }

  const offset = REMINDER_OFFSETS[timing as Exclude<ReminderOption, 'custom'>];
  if (offset === undefined) return null;

  const notifyTime = new Date(targetDate.getTime() - offset);
  return notifyTime > now ? notifyTime : null;
};

/**
 * Schedule a notification for a countdown
 */
export const scheduleCountdownNotification = async (
  countdown: Countdown,
  timing: ReminderTiming
): Promise<string | null> => {
  if (!Notifications) return null;

  try {
    const targetDate = new Date(countdown.targetDate);
    const notifyTime = getNotificationTime(targetDate, timing);

    if (!notifyTime) {
      return null; // Time already passed
    }

    const lang = await getCurrentLanguage();
    const t = translations[lang];
    const reminderLabels = getReminderLabels(lang);

    const timingLabel =
      typeof timing === 'object'
        ? t.reminders.beforeMinutes.replace('{minutes}', String(timing.offsetMinutes))
        : reminderLabels[timing];

    const isAtCompletion = timing === 'at_completion';
    const title = isAtCompletion
      ? `${countdown.icon} ${countdown.title}`
      : `${countdown.icon} ${t.notifications.reminderTitle.replace('{title}', countdown.title)}`;
    const body = isAtCompletion
      ? t.notifications.countdownEnded
      : timingLabel;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          countdownId: countdown.id,
          type: 'countdown_reminder',
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifyTime,
        channelId: Platform.OS === 'android' ? 'countdown-reminders' : undefined,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Schedule all notifications for a countdown based on its reminder settings
 */
export const scheduleAllNotificationsForCountdown = async (
  countdown: Countdown
): Promise<string[]> => {
  const scheduledIds: string[] = [];
  const timings = countdown.reminderTiming || [];

  // If no specific timings, use default settings
  if (timings.length === 0) {
    const settings = await getReminderSettings();
    if (!settings.enabled) return [];

    for (const timing of settings.defaultTimings) {
      const id = await scheduleCountdownNotification(countdown, timing);
      if (id) scheduledIds.push(id);
    }
  } else {
    for (const timing of timings) {
      const id = await scheduleCountdownNotification(countdown, timing);
      if (id) scheduledIds.push(id);
    }
  }

  // Store scheduled notification IDs
  await storeScheduledNotifications(countdown.id, scheduledIds);

  return scheduledIds;
};

/**
 * Cancel all notifications for a countdown
 */
export const cancelCountdownNotifications = async (countdownId: string): Promise<void> => {
  if (!Notifications) return;

  try {
    const scheduledMap = await getScheduledNotifications();
    const notificationIds = scheduledMap[countdownId] || [];

    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    // Remove from storage
    delete scheduledMap[countdownId];
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledMap));
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Reschedule notifications for a countdown (e.g., after updating target date)
 */
export const rescheduleCountdownNotifications = async (
  countdown: Countdown
): Promise<string[]> => {
  await cancelCountdownNotifications(countdown.id);
  return scheduleAllNotificationsForCountdown(countdown);
};

/**
 * Store scheduled notification IDs
 */
const storeScheduledNotifications = async (
  countdownId: string,
  notificationIds: string[]
): Promise<void> => {
  try {
    const scheduledMap = await getScheduledNotifications();
    scheduledMap[countdownId] = notificationIds;
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledMap));
  } catch (error) {
    console.error('Error storing scheduled notifications:', error);
  }
};

/**
 * Get all scheduled notification IDs
 */
const getScheduledNotifications = async (): Promise<Record<string, string[]>> => {
  try {
    const data = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return {};
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};
