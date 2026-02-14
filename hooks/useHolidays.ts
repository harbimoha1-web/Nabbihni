import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicEvent } from '@/types/countdown';
import { publicEvents } from '@/constants/publicEvents';
import { educationEvents, getUpcomingEducationEvents } from '@/constants/educationCalendar';
import { syncHolidaysToStorage, clearHolidayCache } from '@/lib/holidayApiService';
import { processEventsWithRecurrence } from '@/lib/eventRecurrenceEngine';
import { getEventOverrides, getCustomEvents, CustomEvent } from '@/lib/eventAdminStorage';

// Note: API key should be configured via environment variables
// For now, we fallback to hardcoded events when no API key is available
const HOLIDAY_API_KEY = process.env.EXPO_PUBLIC_HOLIDAY_API_KEY;

interface UseHolidaysResult {
  holidays: PublicEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useHolidays = (): UseHolidaysResult => {
  const [holidays, setHolidays] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track whether we have data via ref to avoid destabilizing refresh callback
  const hasDataRef = useRef(false);

  const loadHolidays = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      // Process public events with automatic recurrence engine
      // This automatically:
      // - Generates next year's dates for recurring events (hijri, fixed-annual, seasonal)
      // - Filters out past one-time events
      // - Updates titles with correct year
      // - Updates anniversary numbers in notes
      const processedPublicEvents = processEventsWithRecurrence(publicEvents);

      // Get education events (also process with recurrence if needed)
      const educationHolidays = getUpcomingEducationEvents();

      // Combine all events
      let allHolidays = [...processedPublicEvents, ...educationHolidays];

      // Apply admin overrides to existing events
      try {
        const [overrides, customEvents] = await Promise.all([
          getEventOverrides(),
          getCustomEvents(),
        ]);

        if (overrides.length > 0) {
          // O(n+m) lookup via Map instead of O(n*m) via .find()
          const overrideMap = new Map(overrides.map(o => [o.eventId, o]));
          allHolidays = allHolidays.map(event => {
            const eventBaseId = event.baseId || event.id;
            const override = overrideMap.get(eventBaseId);
            if (override) {
              return { ...event, ...override.changes };
            }
            return event;
          });
        }

        // Add custom admin events
        if (customEvents.length > 0) {
          // Cast custom events to PublicEvent (they have all required fields)
          const customAsPublicEvents: PublicEvent[] = customEvents.map(ce => ({
            id: ce.id,
            baseId: ce.baseId,
            title: ce.title,
            titleAr: ce.titleAr,
            titleEn: ce.titleEn,
            targetDate: ce.targetDate,
            icon: ce.icon,
            theme: ce.theme,
            participantCount: ce.participantCount,
            category: ce.category,
            dateConfidence: ce.dateConfidence,
            dateSource: ce.dateSource,
            isHijriDerived: ce.isHijriDerived,
            note: ce.note,
            backgroundImage: ce.backgroundImage,
            recurrenceType: ce.recurrenceType || 'one-time',
          }));
          allHolidays = [...allHolidays, ...customAsPublicEvents];
        }
      } catch (adminError) {
        console.warn('Error loading admin data:', adminError);
      }

      // Try to fetch from API if key is available (for real-time updates)
      if (HOLIDAY_API_KEY) {
        try {
          const apiHolidays = await syncHolidaysToStorage(HOLIDAY_API_KEY);

          if (apiHolidays.length > 0) {
            // Merge API holidays with processed events, avoiding duplicates
            const existingIds = new Set(allHolidays.map(h => h.baseId || h.id));
            const newApiHolidays = apiHolidays.filter(h => {
              const baseId = h.baseId || h.id;
              return !existingIds.has(baseId);
            });
            allHolidays = [...allHolidays, ...newApiHolidays];
          }
        } catch (apiError) {
          console.warn('API fetch failed, using processed events only:', apiError);
        }
      }

      // Pre-compute timestamps for sort + filter (avoid repeated Date construction)
      const nowTs = Date.now();
      const timestampCache = new Map<string, number>();
      for (const h of allHolidays) {
        if (!timestampCache.has(h.targetDate)) {
          timestampCache.set(h.targetDate, new Date(h.targetDate).getTime());
        }
      }

      // Sort by date (ascending - nearest first)
      allHolidays.sort((a, b) =>
        timestampCache.get(a.targetDate)! - timestampCache.get(b.targetDate)!
      );

      // Filter to only upcoming events
      const upcomingHolidays = allHolidays.filter(
        h => timestampCache.get(h.targetDate)! > nowTs
      );

      hasDataRef.current = upcomingHolidays.length > 0;
      setHolidays(upcomingHolidays);
    } catch (err) {
      console.error('Failed to load holidays:', err);
      setError('Failed to load holidays');

      // Fallback to processed events on error
      const fallbackHolidays = processEventsWithRecurrence(publicEvents);
      hasDataRef.current = fallbackHolidays.length > 0;
      setHolidays(fallbackHolidays);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await clearHolidayCache();
    // Silent refresh (no spinner) if we already have data
    await loadHolidays(hasDataRef.current);
  }, [loadHolidays]);

  const clearCache = useCallback(async () => {
    await clearHolidayCache();
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  return {
    holidays,
    loading,
    error,
    refresh,
    clearCache,
  };
};

export default useHolidays;
