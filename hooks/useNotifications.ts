import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Countdown, ReminderOption } from '@/types/countdown';
import {
  requestPermissions,
  scheduleAllNotificationsForCountdown,
  cancelCountdownNotifications,
  rescheduleCountdownNotifications,
  getReminderSettings,
  updateReminderSettings,
  ReminderSettings,
  REMINDER_LABELS,
} from '@/lib/notifications';

// Only import notifications on native platforms
const Notifications = Platform.OS !== 'web' ? require('expo-notifications') : null;

export interface UseNotificationsResult {
  permissionGranted: boolean;
  reminderSettings: ReminderSettings | null;
  requestNotificationPermission: () => Promise<boolean>;
  scheduleNotifications: (countdown: Countdown) => Promise<string[]>;
  cancelNotifications: (countdownId: string) => Promise<void>;
  rescheduleNotifications: (countdown: Countdown) => Promise<string[]>;
  updateDefaultTimings: (timings: ReminderOption[]) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
}

export const useNotifications = (): UseNotificationsResult => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings | null>(null);

  // Initialize notifications - listeners are set up in _layout.tsx to avoid duplicates
  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    const settings = await getReminderSettings();
    setReminderSettings(settings);
  };

  const checkPermission = async () => {
    if (!Notifications) {
      setPermissionGranted(false);
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const scheduleNotifications = useCallback(
    async (countdown: Countdown): Promise<string[]> => {
      if (!permissionGranted) {
        const granted = await requestNotificationPermission();
        if (!granted) return [];
      }
      return scheduleAllNotificationsForCountdown(countdown);
    },
    [permissionGranted, requestNotificationPermission]
  );

  const cancelNotifications = useCallback(
    async (countdownId: string): Promise<void> => {
      await cancelCountdownNotifications(countdownId);
    },
    []
  );

  const rescheduleNotifications = useCallback(
    async (countdown: Countdown): Promise<string[]> => {
      if (!permissionGranted) {
        const granted = await requestNotificationPermission();
        if (!granted) return [];
      }
      return rescheduleCountdownNotifications(countdown);
    },
    [permissionGranted, requestNotificationPermission]
  );

  const updateDefaultTimings = useCallback(
    async (timings: ReminderOption[]): Promise<void> => {
      const updated = await updateReminderSettings({ defaultTimings: timings });
      setReminderSettings(updated);
    },
    []
  );

  const toggleNotifications = useCallback(
    async (enabled: boolean): Promise<void> => {
      const updated = await updateReminderSettings({ enabled });
      setReminderSettings(updated);
    },
    []
  );

  return {
    permissionGranted,
    reminderSettings,
    requestNotificationPermission,
    scheduleNotifications,
    cancelNotifications,
    rescheduleNotifications,
    updateDefaultTimings,
    toggleNotifications,
  };
};

export { REMINDER_LABELS };
export default useNotifications;
