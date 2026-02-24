import { toGregorian, toHijri } from 'hijri-converter';

const SAUDI_TZ_OFFSET = 3; // UTC+3 (Asia/Riyadh)

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhul-Qi\'dah', 'Dhul-Hijjah',
];

const WEEKDAYS_AR = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت',
];

const WEEKDAYS_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

/**
 * Get current time in Saudi Arabia (UTC+3)
 */
export function getSaudiNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + SAUDI_TZ_OFFSET * 3600000);
}

/**
 * Convert Hijri date to Gregorian ISO date string (at Saudi midnight)
 */
export function hijriToGregorian(
  year: number,
  month: number,
  day: number
): string {
  const gregorian = toGregorian(year, month, day);
  // Format as ISO date string (YYYY-MM-DD)
  const dateStr = `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
  return `${dateStr}T00:00:00`;
}

/**
 * Convert Hijri date to a local-time Date object (no timezone ambiguity)
 */
export function hijriToGregorianDate(year: number, month: number, day: number): Date {
  const gregorian = toGregorian(year, month, day);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
}

/**
 * Convert Gregorian date to Hijri
 */
export function gregorianToHijri(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const hijri = toHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return { year: hijri.hy, month: hijri.hm, day: hijri.hd };
}

/**
 * Get current Hijri year in Saudi Arabia
 */
export function getCurrentHijriYear(): number {
  const saudiNow = getSaudiNow();
  const hijri = gregorianToHijri(saudiNow);
  return hijri.year;
}

/**
 * Format a Gregorian date/string as a localized Hijri string using the same
 * hijri-converter library as the date picker (tabular Islamic calendar).
 * This avoids the 1-2 day mismatch caused by using the platform's Umm al-Qura calendar.
 */
export function formatHijriDateLocalized(
  input: Date | string,
  language: 'ar' | 'en',
  options?: { weekday?: boolean }
): string {
  // Resolve input to local date components
  let year: number, month0: number, day: number, weekdayIndex: number;

  if (typeof input === 'string') {
    // For stored date strings, use parseLocalDate to handle both old UTC and new local formats
    const d = parseLocalDate(input);
    year = d.getFullYear();
    month0 = d.getMonth();
    day = d.getDate();
    weekdayIndex = d.getDay();
  } else {
    year = input.getFullYear();
    month0 = input.getMonth();
    day = input.getDate();
    weekdayIndex = input.getDay();
  }

  const hijri = toHijri(year, month0 + 1, day);
  const months = language === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;
  const monthName = months[hijri.hm - 1];

  if (options?.weekday) {
    const weekdays = language === 'ar' ? WEEKDAYS_AR : WEEKDAYS_EN;
    const weekdayName = weekdays[weekdayIndex];
    return `${weekdayName}، ${hijri.hd} ${monthName} ${hijri.hy}`;
  }

  return `${hijri.hd} ${monthName} ${hijri.hy}`;
}

/**
 * Format a Date as a local ISO string (no Z suffix) to avoid UTC date-shift.
 * e.g. 2026-03-15T00:00:00 instead of 2026-03-14T21:00:00.000Z
 */
export function toLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

/**
 * Parse an ISO date string as local time (avoids timezone ambiguity with new Date(string)).
 * Handles both old UTC format ("...Z") and new local format ("...T00:00:00").
 */
export function parseLocalDate(isoDate: string): Date {
  // Old stored dates end in 'Z' — parse via Date constructor to get correct local components
  if (isoDate.endsWith('Z')) {
    const d = new Date(isoDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const [datePart] = isoDate.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Check if a date has passed in Saudi time (after 23:59:59)
 */
export function hasDatePassedInSaudiTime(isoDate: string): boolean {
  const targetDate = parseLocalDate(isoDate);
  const saudiNow = getSaudiNow();

  // Set target to end of day (23:59:59) in Saudi time
  const targetEndOfDay = new Date(targetDate);
  targetEndOfDay.setHours(23, 59, 59, 999);

  return saudiNow > targetEndOfDay;
}

/**
 * Get time remaining until Saudi midnight of the target date
 */
export function getTimeUntilSaudiMidnight(isoDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
} {
  const targetDate = parseLocalDate(isoDate);
  const saudiNow = getSaudiNow();

  const diff = targetDate.getTime() - saudiNow.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isComplete: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isComplete: false,
  };
}

/**
 * Format Hijri date as Arabic string
 */
export function formatHijriDate(
  year: number,
  month: number,
  day: number
): string {
  return `${day} ${HIJRI_MONTHS_AR[month - 1]} ${year}`;
}
