import { useState, useEffect, useCallback } from 'react';
import { ResolvedHoliday } from '@/types/saudiHolidays';
import {
  getUpcomingSaudiHolidays,
  resolveHoliday,
  setHolidayOverride,
  clearHolidayOverride,
} from '@/lib/holidayEngine';
import { SAUDI_HOLIDAYS } from '@/constants/saudiHolidays';

/**
 * Hook to get all Saudi holidays
 */
export function useSaudiHolidays() {
  const [holidays, setHolidays] = useState<ResolvedHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingSaudiHolidays();
      setHolidays(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { holidays, loading, error, refresh };
}

/**
 * Hook to get a single Saudi holiday by ID
 */
export function useSaudiHoliday(eventId: string) {
  const [holiday, setHoliday] = useState<ResolvedHoliday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const event = SAUDI_HOLIDAYS.find((e) => e.event_id === eventId);
      if (!event) {
        setHoliday(null);
        return;
      }

      const data = await resolveHoliday(event);
      setHoliday(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { holiday, loading, error, refresh };
}

/**
 * Hook for admin operations on holidays
 */
export function useHolidayAdmin() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const applyOverride = useCallback(
    async (
      eventId: string,
      hijriYear: number,
      date: string,
      reason: string | null
    ) => {
      try {
        setSaving(true);
        setError(null);
        await setHolidayOverride(eventId, hijriYear, date, reason);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const removeOverride = useCallback(
    async (eventId: string, hijriYear: number) => {
      try {
        setSaving(true);
        setError(null);
        await clearHolidayOverride(eventId, hijriYear);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { applyOverride, removeOverride, saving, error };
}
