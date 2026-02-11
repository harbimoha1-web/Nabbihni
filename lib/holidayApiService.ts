import AsyncStorage from '@react-native-async-storage/async-storage';
import { PublicEvent, EventCategory, DateConfidence } from '@/types/countdown';

// Holiday API configuration
// Free tier: requires API key from https://holidayapi.com or https://calendarific.com
// Currently using Calendarific as primary (free tier available)

const CACHE_KEY = '@nabbihni/holidays-cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface HolidayCacheData {
  timestamp: number;
  holidays: PublicEvent[];
  year: number;
}

interface CalendarificHoliday {
  name: string;
  description: string;
  date: {
    iso: string;
    datetime: {
      year: number;
      month: number;
      day: number;
    };
  };
  type: string[];
  primary_type: string;
}

interface CalendarificResponse {
  meta: {
    code: number;
  };
  response: {
    holidays: CalendarificHoliday[];
  };
}

// Map Calendarific holiday types to our categories
const mapHolidayCategory = (types: string[], primaryType: string): EventCategory => {
  if (types.includes('religious') || types.includes('muslim')) {
    return 'religious';
  }
  if (types.includes('national') || types.includes('observance')) {
    return 'national';
  }
  return 'seasonal';
};

// Determine date confidence based on holiday type
const getDateConfidence = (types: string[]): DateConfidence => {
  if (types.includes('muslim') || types.includes('religious')) {
    return 'estimated'; // Islamic dates depend on moon sighting
  }
  return 'confirmed';
};

// Check if holiday is Islamic/moon sighting dependent
const isHijriDerived = (types: string[]): boolean => {
  return types.includes('muslim') || types.some(t =>
    t.toLowerCase().includes('eid') ||
    t.toLowerCase().includes('ramadan')
  );
};

// Get icon based on holiday name/type
const getHolidayIcon = (name: string, types: string[]): string => {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('eid') || nameLower.includes('fitr')) return '🎉';
  if (nameLower.includes('adha')) return '🐑';
  if (nameLower.includes('ramadan')) return '🌙';
  if (nameLower.includes('national') || nameLower.includes('day')) return '🇸🇦';
  if (nameLower.includes('founding')) return '🇸🇦';
  if (nameLower.includes('flag')) return '🏴';
  if (types.includes('religious')) return '🕌';

  return '📅';
};

export const fetchSaudiHolidays = async (
  year: number,
  apiKey?: string
): Promise<PublicEvent[]> => {
  if (!apiKey) {
    console.warn('Holiday API key not provided, returning empty array');
    return [];
  }

  try {
    // Using Calendarific API
    const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=SA&year=${year}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CalendarificResponse = await response.json();

    if (data.meta.code !== 200) {
      throw new Error('API returned error code');
    }

    const holidays: PublicEvent[] = data.response.holidays
      .filter(h => h.type.includes('national') || h.type.includes('religious'))
      .map((holiday, index) => ({
        id: `api-${year}-${index}-${holiday.date.iso}`,
        title: holiday.name,
        titleAr: holiday.name, // API returns English, would need translation
        targetDate: `${holiday.date.iso}T00:00:00`,
        icon: getHolidayIcon(holiday.name, holiday.type),
        theme: 'default' as const,
        participantCount: 0,
        category: mapHolidayCategory(holiday.type, holiday.primary_type),
        dateConfidence: getDateConfidence(holiday.type),
        dateSource: 'Calendarific API',
        isHijriDerived: isHijriDerived(holiday.type),
      }));

    return holidays;
  } catch (error) {
    console.error('Failed to fetch holidays from API:', error);
    return [];
  }
};

export const getCachedHolidays = async (): Promise<PublicEvent[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: HolidayCacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - data.timestamp > CACHE_EXPIRY_MS) {
      return null;
    }

    return data.holidays;
  } catch (error) {
    console.error('Failed to get cached holidays:', error);
    return null;
  }
};

export const cacheHolidays = async (holidays: PublicEvent[], year: number): Promise<void> => {
  try {
    const cacheData: HolidayCacheData = {
      timestamp: Date.now(),
      holidays,
      year,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache holidays:', error);
  }
};

export const syncHolidaysToStorage = async (apiKey?: string): Promise<PublicEvent[]> => {
  // Try to get cached holidays first
  const cached = await getCachedHolidays();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fetch fresh holidays if no cache or cache expired
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const [currentYearHolidays, nextYearHolidays] = await Promise.all([
    fetchSaudiHolidays(currentYear, apiKey),
    fetchSaudiHolidays(nextYear, apiKey),
  ]);

  const allHolidays = [...currentYearHolidays, ...nextYearHolidays];

  if (allHolidays.length > 0) {
    await cacheHolidays(allHolidays, currentYear);
  }

  return allHolidays;
};

export const clearHolidayCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear holiday cache:', error);
  }
};
