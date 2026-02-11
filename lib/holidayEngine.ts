import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SaudiHolidayEvent,
  SaudiHolidayInstance,
  ResolvedHoliday,
} from '@/types/saudiHolidays';
import { SAUDI_HOLIDAYS } from '@/constants/saudiHolidays';
import {
  hijriToGregorian,
  getCurrentHijriYear,
  hasDatePassedInSaudiTime,
} from './hijriService';

const HOLIDAY_OVERRIDES_KEY = '@nabbihni/holiday-overrides';

/**
 * Get all holiday instances from storage
 */
async function getHolidayInstances(): Promise<SaudiHolidayInstance[]> {
  try {
    const data = await AsyncStorage.getItem(HOLIDAY_OVERRIDES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting holiday instances:', error);
    return [];
  }
}

/**
 * Save holiday instances to storage
 */
async function saveHolidayInstances(
  instances: SaudiHolidayInstance[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(HOLIDAY_OVERRIDES_KEY, JSON.stringify(instances));
  } catch (error) {
    console.error('Error saving holiday instances:', error);
  }
}

/**
 * Determine which Hijri year to use for an event
 * Auto-rolls to next year if the event date has passed in Saudi time
 */
function determineHijriYear(event: SaudiHolidayEvent): number {
  const currentHijriYear = getCurrentHijriYear();

  // Calculate the date for current Hijri year
  const currentYearDate = hijriToGregorian(
    currentHijriYear,
    event.hijri_month,
    event.hijri_day
  );

  // If the date has passed, use next year
  if (hasDatePassedInSaudiTime(currentYearDate)) {
    return currentHijriYear + 1;
  }

  return currentHijriYear;
}

/**
 * Get or create a holiday instance for a specific event and year
 */
async function getOrCreateInstance(
  event: SaudiHolidayEvent,
  hijriYear: number
): Promise<SaudiHolidayInstance> {
  const instances = await getHolidayInstances();

  // Find existing instance
  let instance = instances.find(
    (i) => i.event_id === event.event_id && i.hijri_year === hijriYear
  );

  if (!instance) {
    // Create new instance
    const calculatedDate = hijriToGregorian(
      hijriYear,
      event.hijri_month,
      event.hijri_day
    );

    instance = {
      event_id: event.event_id,
      hijri_year: hijriYear,
      calculated_gregorian_date: calculatedDate,
      override_gregorian_date: null,
      override_reason: null,
      last_calculated_at: new Date().toISOString(),
    };

    // Save the new instance
    instances.push(instance);
    await saveHolidayInstances(instances);
  }

  return instance;
}

/**
 * Resolve a holiday event to its full details
 */
export async function resolveHoliday(
  event: SaudiHolidayEvent
): Promise<ResolvedHoliday> {
  const hijriYear = determineHijriYear(event);
  const instance = await getOrCreateInstance(event, hijriYear);

  const effectiveDate =
    instance.override_gregorian_date ?? instance.calculated_gregorian_date;

  return {
    event_id: event.event_id,
    name_ar: event.name_ar,
    name_en: event.name_en,
    icon: event.icon,
    theme: event.theme,
    category: event.category,
    hijri_year: hijriYear,
    hijri_day: event.hijri_day,
    hijri_month: event.hijri_month,
    calculated_gregorian_date: instance.calculated_gregorian_date,
    override_gregorian_date: instance.override_gregorian_date,
    override_reason: instance.override_reason,
    effective_date: effectiveDate,
    is_confirmed: instance.override_gregorian_date !== null,
    last_calculated_at: instance.last_calculated_at,
  };
}

/**
 * Get all upcoming Saudi holidays, sorted by date
 */
export async function getUpcomingSaudiHolidays(): Promise<ResolvedHoliday[]> {
  const resolvedHolidays: ResolvedHoliday[] = [];

  for (const event of SAUDI_HOLIDAYS) {
    const resolved = await resolveHoliday(event);
    resolvedHolidays.push(resolved);
  }

  // Sort by effective date
  return resolvedHolidays.sort(
    (a, b) =>
      new Date(a.effective_date).getTime() -
      new Date(b.effective_date).getTime()
  );
}

/**
 * Set an admin override for a holiday
 */
export async function setHolidayOverride(
  eventId: string,
  hijriYear: number,
  date: string,
  reason: string | null
): Promise<void> {
  const instances = await getHolidayInstances();

  const index = instances.findIndex(
    (i) => i.event_id === eventId && i.hijri_year === hijriYear
  );

  if (index >= 0) {
    instances[index].override_gregorian_date = date;
    instances[index].override_reason = reason;
  } else {
    // Find the event to create a new instance
    const event = SAUDI_HOLIDAYS.find((e) => e.event_id === eventId);
    if (event) {
      const calculatedDate = hijriToGregorian(
        hijriYear,
        event.hijri_month,
        event.hijri_day
      );

      instances.push({
        event_id: eventId,
        hijri_year: hijriYear,
        calculated_gregorian_date: calculatedDate,
        override_gregorian_date: date,
        override_reason: reason,
        last_calculated_at: new Date().toISOString(),
      });
    }
  }

  await saveHolidayInstances(instances);
}

/**
 * Clear an admin override for a holiday
 */
export async function clearHolidayOverride(
  eventId: string,
  hijriYear: number
): Promise<void> {
  const instances = await getHolidayInstances();

  const index = instances.findIndex(
    (i) => i.event_id === eventId && i.hijri_year === hijriYear
  );

  if (index >= 0) {
    instances[index].override_gregorian_date = null;
    instances[index].override_reason = null;
    await saveHolidayInstances(instances);
  }
}

/**
 * Recalculate all holiday dates (useful when hijri-converter is updated)
 */
export async function recalculateAllHolidays(): Promise<void> {
  const instances = await getHolidayInstances();

  for (const instance of instances) {
    const event = SAUDI_HOLIDAYS.find((e) => e.event_id === instance.event_id);
    if (event) {
      instance.calculated_gregorian_date = hijriToGregorian(
        instance.hijri_year,
        event.hijri_month,
        event.hijri_day
      );
      instance.last_calculated_at = new Date().toISOString();
    }
  }

  await saveHolidayInstances(instances);
}
