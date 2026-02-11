/**
 * Event Recurrence Engine
 *
 * Automatically generates upcoming event instances based on recurrence type:
 * - hijri: Islamic calendar events (Ramadan, Eid) - calculates from Hijri date
 * - fixed-annual: Same Gregorian date every year (National Day = Sep 23)
 * - seasonal: Astronomical events with slight day variation (Summer solstice)
 * - one-time: No recurrence - removed after passing (World Cup 2026)
 */

import {
  PublicEvent,
  EventRecurrenceType,
  HijriDateInfo,
  FixedAnnualDateInfo,
} from '@/types/countdown';
import {
  hijriToGregorian,
  getCurrentHijriYear,
  gregorianToHijri,
  getSaudiNow,
} from './hijriService';

// Seasonal event astronomical dates (approximate - varies by 1-2 days)
const SEASONAL_DATES: Record<string, { month: number; day: number }> = {
  'summer-start': { month: 6, day: 21 },   // Summer solstice
  'winter-start': { month: 12, day: 21 },  // Winter solstice
  'spring-start': { month: 3, day: 20 },   // Spring equinox
  'fall-start': { month: 9, day: 22 },     // Fall equinox
  'suhail': { month: 8, day: 24 },         // Suhail star rising
  'al-wasm': { month: 10, day: 16 },       // Al-Wasm season
  'al-aqrab': { month: 11, day: 16 },      // Al-Aqrab season
};

/**
 * Calculate the next occurrence date for an event based on its recurrence type
 */
export function calculateNextOccurrence(
  event: PublicEvent,
  referenceDate?: Date
): string | null {
  const now = referenceDate || getSaudiNow();
  const recurrenceType = event.recurrenceType || 'one-time';

  switch (recurrenceType) {
    case 'hijri':
      return calculateNextHijriDate(event, now);

    case 'fixed-annual':
      return calculateNextFixedAnnualDate(event, now);

    case 'seasonal':
      return calculateNextSeasonalDate(event, now);

    case 'one-time':
    default:
      // One-time events don't recur - return original date
      return event.targetDate;
  }
}

/**
 * Calculate next Hijri-based event date (Ramadan, Eid, etc.)
 */
function calculateNextHijriDate(event: PublicEvent, now: Date): string | null {
  if (!event.hijriDate) {
    console.warn(`Event ${event.id} is hijri type but missing hijriDate`);
    return event.targetDate;
  }

  const currentHijriYear = getCurrentHijriYear();
  const { month, day } = event.hijriDate;

  // Try current Hijri year
  let targetDate = hijriToGregorian(currentHijriYear, month, day);
  let targetDateObj = new Date(targetDate);

  // If date has passed, use next Hijri year
  if (targetDateObj <= now) {
    targetDate = hijriToGregorian(currentHijriYear + 1, month, day);
  }

  return targetDate;
}

/**
 * Calculate next fixed annual date (National Day, Founding Day, etc.)
 */
function calculateNextFixedAnnualDate(event: PublicEvent, now: Date): string | null {
  if (!event.fixedDate) {
    console.warn(`Event ${event.id} is fixed-annual type but missing fixedDate`);
    return event.targetDate;
  }

  const currentYear = now.getFullYear();
  const { month, day } = event.fixedDate;

  // Create date for current year
  let targetYear = currentYear;
  let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);

  // If date has passed this year, use next year
  if (targetDate <= now) {
    targetYear += 1;
    targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  }

  return formatDateToISO(targetDate);
}

/**
 * Calculate next seasonal date (solstices, equinoxes, star calendars)
 */
function calculateNextSeasonalDate(event: PublicEvent, now: Date): string | null {
  // Check if we have fixed date info or use seasonal lookup
  const seasonalInfo = event.fixedDate || SEASONAL_DATES[event.baseId || ''];

  if (!seasonalInfo) {
    console.warn(`Event ${event.id} is seasonal type but missing date info`);
    return event.targetDate;
  }

  const currentYear = now.getFullYear();
  const { month, day } = seasonalInfo;

  // Create date for current year
  let targetYear = currentYear;
  let targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);

  // If date has passed this year, use next year
  if (targetDate <= now) {
    targetYear += 1;
    targetDate = new Date(targetYear, month - 1, day, 0, 0, 0);
  }

  return formatDateToISO(targetDate);
}

/**
 * Format Date to ISO string (YYYY-MM-DDTHH:mm:ss)
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

/**
 * Generate dynamic title with correct year
 */
function generateTitle(
  baseTitle: string,
  baseTitleAr: string,
  targetDate: string,
  recurrenceType: EventRecurrenceType
): { title: string; titleAr: string } {
  const date = new Date(targetDate);
  const gregorianYear = date.getFullYear();

  if (recurrenceType === 'hijri') {
    const hijri = gregorianToHijri(date);
    const hijriYearAr = convertToArabicNumerals(hijri.year);
    const gregorianYearAr = convertToArabicNumerals(gregorianYear);

    // Replace year in titles
    return {
      title: `${baseTitle} ${gregorianYear}`,
      titleAr: baseTitleAr.includes('١٤')
        ? baseTitleAr.replace(/١٤\d{2}/, hijriYearAr)
        : `${baseTitleAr} ${hijriYearAr}`,
    };
  }

  const gregorianYearAr = convertToArabicNumerals(gregorianYear);

  return {
    title: baseTitle.replace(/\d{4}/, String(gregorianYear)),
    titleAr: baseTitleAr.replace(/[٠-٩]{4}/, gregorianYearAr),
  };
}

/**
 * Convert number to Arabic numerals
 */
function convertToArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit)] || digit)
    .join('');
}

/**
 * Generate upcoming event instance from base event definition
 */
export function generateEventInstance(event: PublicEvent): PublicEvent | null {
  const now = getSaudiNow();
  const recurrenceType = event.recurrenceType || 'one-time';

  // Calculate next occurrence date
  const nextDate = calculateNextOccurrence(event, now);

  if (!nextDate) {
    return null;
  }

  const targetDate = new Date(nextDate);

  // For one-time events, check if passed
  if (recurrenceType === 'one-time' && targetDate <= now) {
    return null; // Event has passed, don't show
  }

  // Generate updated titles with correct year
  const { title, titleAr } = generateTitle(
    event.title,
    event.titleAr,
    nextDate,
    recurrenceType
  );

  // Generate unique instance ID
  const year = targetDate.getFullYear();
  const baseId = event.baseId || event.id.replace(/-\d{4}$/, '');
  const instanceId = `${baseId}-${year}`;

  // Update note with current year info if needed
  let note = event.note;
  if (recurrenceType === 'fixed-annual' && note) {
    // Update anniversary numbers (e.g., "الذكرى ٩٦" → "الذكرى ٩٧")
    note = updateAnniversaryNumber(note, year, event);
  }

  return {
    ...event,
    id: instanceId,
    title,
    titleAr,
    targetDate: nextDate,
    note,
  };
}

/**
 * Update anniversary numbers in notes
 */
function updateAnniversaryNumber(
  note: string,
  year: number,
  event: PublicEvent
): string {
  // National Day: Founded 1932, so anniversary = year - 1932
  if (event.baseId === 'national-day' || event.id.includes('national-day')) {
    const anniversary = year - 1932;
    const arabicNum = convertToArabicNumerals(anniversary);
    return note.replace(/الذكرى [٠-٩]+/, `الذكرى ${arabicNum}`);
  }

  return note;
}

/**
 * Process all events and generate upcoming instances
 * Filters out past one-time events and generates next occurrences for recurring
 */
export function processEventsWithRecurrence(
  events: PublicEvent[]
): PublicEvent[] {
  const processedEvents: PublicEvent[] = [];
  const seenBaseIds = new Set<string>();

  for (const event of events) {
    const instance = generateEventInstance(event);

    if (instance) {
      // Prevent duplicates for recurring events
      const baseId = instance.baseId || instance.id.replace(/-\d{4}$/, '');

      if (!seenBaseIds.has(baseId)) {
        seenBaseIds.add(baseId);
        processedEvents.push(instance);
      }
    }
  }

  // Sort by date
  return processedEvents.sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
}

/**
 * Check if an event needs to be auto-advanced to next occurrence
 */
export function shouldAutoAdvance(event: PublicEvent): boolean {
  const recurrenceType = event.recurrenceType || 'one-time';

  if (recurrenceType === 'one-time') {
    return false;
  }

  const targetDate = new Date(event.targetDate);
  const now = getSaudiNow();

  return targetDate <= now;
}

/**
 * Get the Hijri year for a given date
 */
export function getHijriYearForDate(date: Date): number {
  const hijri = gregorianToHijri(date);
  return hijri.year;
}

export default {
  calculateNextOccurrence,
  generateEventInstance,
  processEventsWithRecurrence,
  shouldAutoAdvance,
  getHijriYearForDate,
};
