import { toGregorian, toHijri } from 'hijri-converter';
import { CalendarType, AdjustmentRule } from '@/types/countdown';
import { getSaudiNow, gregorianToHijri } from './hijriService';

interface CalculateSalaryDateOptions {
  dayOfMonth: number;
  calendarType: CalendarType;
  adjustmentRule: AdjustmentRule;
  referenceDate?: Date;
}

interface SalaryDateResult {
  targetDate: string;
  wasAdjusted: boolean;
  adjustedFrom?: string;
}

/**
 * Get the number of days in a Gregorian month
 */
function getDaysInGregorianMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the number of days in a Hijri month (always 29 or 30)
 */
function getDaysInHijriMonth(year: number, month: number): number {
  // Hijri months alternate between 29 and 30 days
  // Odd months (1,3,5,7,9,11) have 30 days
  // Even months (2,4,6,8,10) have 29 days
  // Month 12 has 30 days in leap years, 29 otherwise
  if (month === 12) {
    // Leap year check for Hijri calendar
    // Hijri leap years occur in years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 of 30-year cycle
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    const yearInCycle = year % 30;
    return leapYears.includes(yearInCycle) ? 30 : 29;
  }
  return month % 2 === 1 ? 30 : 29;
}

/**
 * Check if a date is a Saudi weekend (Friday or Saturday)
 */
function isSaudiWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
}

/**
 * Adjust date for weekend based on rule
 * Smart adjustment: Friday → Thursday, Saturday → Sunday
 * Backwards compatible: 'earlier' and 'later' are treated as 'smart'
 */
function adjustForWeekend(
  date: Date,
  rule: AdjustmentRule | 'earlier' | 'later'
): { date: Date; wasAdjusted: boolean; originalDate: Date } {
  const originalDate = new Date(date);

  if (rule === 'none') {
    return { date, wasAdjusted: false, originalDate };
  }

  const dayOfWeek = date.getDay();
  const adjustedDate = new Date(date);

  // Friday (5) → Thursday (move back 1 day)
  if (dayOfWeek === 5) {
    adjustedDate.setDate(adjustedDate.getDate() - 1);
    return { date: adjustedDate, wasAdjusted: true, originalDate };
  }

  // Saturday (6) → Sunday (move forward 1 day)
  if (dayOfWeek === 6) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    return { date: adjustedDate, wasAdjusted: true, originalDate };
  }

  // Not a weekend day - no adjustment needed
  return { date, wasAdjusted: false, originalDate };
}

/**
 * Calculate next salary date for Gregorian calendar
 */
function calculateGregorianSalaryDate(
  dayOfMonth: number,
  referenceDate: Date,
  adjustmentRule: AdjustmentRule
): SalaryDateResult {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1; // 1-indexed
  const today = referenceDate.getDate();

  let targetYear = year;
  let targetMonth = month;

  // Determine if we need to use next month
  if (today >= dayOfMonth) {
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  }

  // Clamp day to actual days in the target month
  const daysInMonth = getDaysInGregorianMonth(targetYear, targetMonth);
  const actualDay = Math.min(dayOfMonth, daysInMonth);

  // Create target date (month is 0-indexed in Date constructor)
  const targetDate = new Date(targetYear, targetMonth - 1, actualDay, 23, 59, 59);

  // Apply weekend adjustment
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
 * Calculate next salary date for Hijri calendar
 */
function calculateHijriSalaryDate(
  dayOfMonth: number,
  referenceDate: Date,
  adjustmentRule: AdjustmentRule
): SalaryDateResult {
  // Convert reference date to Hijri
  const hijri = gregorianToHijri(referenceDate);
  const hijriYear = hijri.year;
  const hijriMonth = hijri.month;
  const hijriDay = hijri.day;

  let targetHijriYear = hijriYear;
  let targetHijriMonth = hijriMonth;

  // Determine if we need to use next month
  if (hijriDay >= dayOfMonth) {
    targetHijriMonth += 1;
    if (targetHijriMonth > 12) {
      targetHijriMonth = 1;
      targetHijriYear += 1;
    }
  }

  // Clamp day to actual days in the target Hijri month
  const daysInHijriMonth = getDaysInHijriMonth(targetHijriYear, targetHijriMonth);
  const actualDay = Math.min(dayOfMonth, daysInHijriMonth);

  // Convert Hijri date to Gregorian
  const gregorian = toGregorian(targetHijriYear, targetHijriMonth, actualDay);
  const targetDate = new Date(
    gregorian.gy,
    gregorian.gm - 1,
    gregorian.gd,
    23,
    59,
    59
  );

  // Apply weekend adjustment
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
 * Format date as ISO string with T23:59:59 suffix
 */
function formatAsISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59`;
}

/**
 * Main function to calculate next salary date
 */
export function calculateNextSalaryDate(
  options: CalculateSalaryDateOptions
): SalaryDateResult {
  const { dayOfMonth, calendarType, adjustmentRule, referenceDate } = options;
  const refDate = referenceDate || getSaudiNow();

  if (calendarType === 'hijri') {
    return calculateHijriSalaryDate(dayOfMonth, refDate, adjustmentRule);
  }

  return calculateGregorianSalaryDate(dayOfMonth, refDate, adjustmentRule);
}

/**
 * Get max days for a calendar type
 */
export function getMaxDaysForCalendar(calendarType: CalendarType): number {
  return calendarType === 'hijri' ? 30 : 31;
}

/**
 * Format adjustment rule as Arabic text
 * Backwards compatible: 'earlier' and 'later' display as 'smart'
 */
export function formatAdjustmentRuleAr(rule: AdjustmentRule | 'earlier' | 'later'): string {
  switch (rule) {
    case 'smart':
    case 'earlier':
    case 'later':
      return 'يُعدّل للعطلة';
    case 'none':
      return 'بدون تعديل';
  }
}

/**
 * Format calendar type as Arabic text
 */
export function formatCalendarTypeAr(type: CalendarType): string {
  return type === 'hijri' ? 'هجري' : 'ميلادي';
}

/**
 * Get ordinal suffix for day in Arabic
 */
export function formatDayAr(day: number): string {
  return `اليوم ${day}`;
}
