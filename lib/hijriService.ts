import { toGregorian, toHijri } from 'hijri-converter';

const SAUDI_TZ_OFFSET = 3; // UTC+3 (Asia/Riyadh)

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
 * Check if a date has passed in Saudi time (after 23:59:59)
 */
export function hasDatePassedInSaudiTime(isoDate: string): boolean {
  const targetDate = new Date(isoDate);
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
  const targetDate = new Date(isoDate);
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
  const monthNames = [
    'محرم',
    'صفر',
    'ربيع الأول',
    'ربيع الثاني',
    'جمادى الأولى',
    'جمادى الآخرة',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذو القعدة',
    'ذو الحجة',
  ];

  return `${day} ${monthNames[month - 1]} ${year}`;
}

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah',
];

const WEEKDAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format a Gregorian Date as a localized Hijri date string using hijri-converter.
 * This ensures consistency with the Hijri date picker which also uses hijri-converter.
 * Replaces toLocaleDateString with u-ca-islamic which uses a different calendar algorithm.
 */
export function formatHijriDateLocalized(
  date: Date,
  language: 'ar' | 'en',
  options?: { weekday?: boolean }
): string {
  const hijri = gregorianToHijri(date);
  const months = language === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;
  const monthName = months[hijri.month - 1];

  if (options?.weekday) {
    const weekdays = language === 'ar' ? WEEKDAYS_AR : WEEKDAYS_EN;
    const weekday = weekdays[date.getDay()];

    if (language === 'ar') {
      return `${weekday}، ${hijri.day} ${monthName}، ${hijri.year} هـ`;
    }
    return `${weekday}, ${monthName} ${hijri.day}, ${hijri.year} AH`;
  }

  if (language === 'ar') {
    return `${hijri.day} ${monthName}، ${hijri.year} هـ`;
  }
  return `${monthName} ${hijri.day}, ${hijri.year} AH`;
}
