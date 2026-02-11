import { RecurrenceType, RecurrenceSettings, CalendarType, AdjustmentRule } from '@/types/countdown';
import { calculateNextSalaryDate } from './salaryCalculator';
import { getSaudiNow } from './hijriService';
import { translations, Language } from '@/locales/translations';

interface CalculateNextDateOptions {
  recurrence: RecurrenceSettings;
  referenceDate?: Date;
}

interface RecurrenceDateResult {
  targetDate: string;
  wasAdjusted: boolean;
  adjustedFrom?: string;
}

/**
 * Format date as ISO string with T23:59:59 suffix
 */
function formatAsISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59`;
}

/**
 * Check if a date is a Saudi weekend (Friday or Saturday)
 */
function isSaudiWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

/**
 * Adjust date for weekend based on rule
 */
function adjustForWeekend(
  date: Date,
  rule: AdjustmentRule
): { date: Date; wasAdjusted: boolean; originalDate: Date } {
  const originalDate = new Date(date);

  if (rule === 'none') {
    return { date, wasAdjusted: false, originalDate };
  }

  const dayOfWeek = date.getDay();
  const adjustedDate = new Date(date);

  if (dayOfWeek === 5) {
    adjustedDate.setDate(adjustedDate.getDate() - 1);
    return { date: adjustedDate, wasAdjusted: true, originalDate };
  }

  if (dayOfWeek === 6) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    return { date: adjustedDate, wasAdjusted: true, originalDate };
  }

  return { date, wasAdjusted: false, originalDate };
}

/**
 * Calculate next occurrence for daily recurrence
 */
function calculateNextDaily(referenceDate: Date): RecurrenceDateResult {
  const nextDate = new Date(referenceDate);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDate.setHours(23, 59, 59, 0);

  return {
    targetDate: formatAsISODate(nextDate),
    wasAdjusted: false,
  };
}

/**
 * Calculate next occurrence for weekly recurrence
 */
function calculateNextWeekly(
  dayOfWeek: number,
  referenceDate: Date,
  adjustmentRule: AdjustmentRule
): RecurrenceDateResult {
  const nextDate = new Date(referenceDate);
  const currentDayOfWeek = nextDate.getDay();

  // Calculate days until target day
  let daysUntilTarget = dayOfWeek - currentDayOfWeek;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  nextDate.setDate(nextDate.getDate() + daysUntilTarget);
  nextDate.setHours(23, 59, 59, 0);

  const { date: adjustedDate, wasAdjusted, originalDate } = adjustForWeekend(
    nextDate,
    adjustmentRule
  );

  return {
    targetDate: formatAsISODate(adjustedDate),
    wasAdjusted,
    adjustedFrom: wasAdjusted ? formatAsISODate(originalDate) : undefined,
  };
}

/**
 * Calculate next occurrence for yearly recurrence
 */
function calculateNextYearly(
  dayOfMonth: number,
  monthOfYear: number,
  referenceDate: Date,
  adjustmentRule: AdjustmentRule
): RecurrenceDateResult {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  let targetYear = refYear;

  // Check if this year's date has passed
  if (
    refMonth > monthOfYear ||
    (refMonth === monthOfYear && refDay >= dayOfMonth)
  ) {
    targetYear += 1;
  }

  // Get actual days in target month
  const daysInMonth = new Date(targetYear, monthOfYear, 0).getDate();
  const actualDay = Math.min(dayOfMonth, daysInMonth);

  const targetDate = new Date(targetYear, monthOfYear - 1, actualDay, 23, 59, 59);

  const { date: adjustedDate, wasAdjusted, originalDate } = adjustForWeekend(
    targetDate,
    adjustmentRule
  );

  return {
    targetDate: formatAsISODate(adjustedDate),
    wasAdjusted,
    adjustedFrom: wasAdjusted ? formatAsISODate(originalDate) : undefined,
  };
}

/**
 * Main function to calculate next occurrence for any recurrence type
 */
export function calculateNextRecurringDate(
  options: CalculateNextDateOptions
): RecurrenceDateResult {
  const { recurrence, referenceDate } = options;
  const refDate = referenceDate || getSaudiNow();

  switch (recurrence.type) {
    case 'salary':
    case 'monthly':
      // Use existing salary calculation for monthly
      return calculateNextSalaryDate({
        dayOfMonth: recurrence.dayOfMonth,
        calendarType: recurrence.calendarType,
        adjustmentRule: recurrence.adjustmentRule,
        referenceDate: refDate,
      });

    case 'daily':
      return calculateNextDaily(refDate);

    case 'weekly':
      return calculateNextWeekly(
        recurrence.dayOfWeek ?? 0,
        refDate,
        recurrence.adjustmentRule
      );

    case 'yearly':
      // For yearly, dayOfMonth is the day and we'll add a month field later
      // For now, use current month
      const currentMonth = refDate.getMonth() + 1;
      return calculateNextYearly(
        recurrence.dayOfMonth,
        currentMonth,
        refDate,
        recurrence.adjustmentRule
      );

    default:
      // Default to monthly calculation
      return calculateNextSalaryDate({
        dayOfMonth: recurrence.dayOfMonth,
        calendarType: recurrence.calendarType,
        adjustmentRule: recurrence.adjustmentRule,
        referenceDate: refDate,
      });
  }
}

/**
 * Get recurrence type labels based on language
 */
export const getRecurrenceTypeLabels = (lang: Language): Record<RecurrenceType, string> => {
  const t = translations[lang];
  return {
    salary: t.recurrence.salary,
    daily: t.recurrence.daily,
    weekly: t.recurrence.weekly,
    monthly: t.recurrence.monthly,
    yearly: t.recurrence.yearly,
  };
};

/**
 * Get weekday labels based on language
 */
export const getWeekdayLabels = (lang: Language): Record<number, string> => {
  const t = translations[lang];
  return {
    0: t.weekdays.sun,
    1: t.weekdays.mon,
    2: t.weekdays.tue,
    3: t.weekdays.wed,
    4: t.weekdays.thu,
    5: t.weekdays.fri,
    6: t.weekdays.sat,
  };
};

/**
 * Arabic labels for recurrence types (legacy)
 */
export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = getRecurrenceTypeLabels('ar');

/**
 * Arabic labels for days of week (legacy)
 */
export const WEEKDAY_LABELS: Record<number, string> = getWeekdayLabels('ar');
