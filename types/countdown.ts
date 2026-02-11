export type ThemeId =
  | 'default'
  | 'sunset'
  | 'night'
  | 'gold'
  | 'ramadan';

export type CalendarType = 'gregorian' | 'hijri';
export type AdjustmentRule = 'smart' | 'none';

// Reminder timing options
export type ReminderOption =
  | 'at_completion'  // عند انتهاء العد
  | '1_hour'         // قبل ساعة واحدة
  | '1_day'          // قبل يوم واحد
  | '1_week'         // قبل أسبوع
  | 'custom';        // مخصص

export interface CustomReminderTiming {
  type: 'custom';
  offsetMinutes: number; // Minutes before the target date
}

export type ReminderTiming = ReminderOption | CustomReminderTiming;

// Recurrence types for general recurring countdowns
export type RecurrenceType = 'salary' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceSettings {
  type: RecurrenceType;
  calendarType: CalendarType;
  dayOfMonth: number;           // 1-31 (Gregorian) or 1-30 (Hijri)
  adjustmentRule: AdjustmentRule;
  lastAutoAdvanced?: string;    // ISO date for debugging
  // For weekly recurrence
  dayOfWeek?: number;           // 0-6 (Sunday-Saturday)
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface Countdown {
  id: string;
  title: string;
  targetDate: string; // ISO date string
  icon: string; // Emoji
  theme: ThemeId;
  isPublic: boolean;
  createdAt: string;
  sharedWith?: string[]; // User IDs (if social)
  participantCount?: number; // For shared countdowns
  recurrence?: RecurrenceSettings;  // For recurring countdowns
  isRecurring?: boolean;            // Flag for recurring countdowns
  isStarred?: boolean;              // Pin/star countdown to top
  reminderTiming?: ReminderTiming[]; // When to send reminders
  backgroundImage?: string;         // Custom wallpaper (premium)
  note?: string;                    // Optional note for countdown
  tasks?: Task[];                   // Optional checklist tasks
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
}

export interface Theme {
  id: ThemeId;
  name: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    background: readonly [string, string, ...string[]];
    text: string;
    textSecondary: string;
    accent: string;
  };
  isPremium: boolean;
}

// Event categories for public events
export type EventCategory = 'religious' | 'national' | 'seasonal' | 'entertainment' | 'milestone' | 'education' | 'international';

// Date confidence levels (critical for Islamic dates)
export type DateConfidence = 'confirmed' | 'estimated' | 'tentative';

// Event recurrence types for automatic year rollover
export type EventRecurrenceType =
  | 'hijri'          // Islamic calendar - auto-calculates from Hijri date (Ramadan, Eid)
  | 'fixed-annual'   // Same Gregorian date every year (National Day = Sep 23)
  | 'seasonal'       // Astronomical/seasonal dates that shift slightly (Summer solstice)
  | 'one-time';      // No recurrence - removes after passing (World Cup 2026)

// Hijri date info for Islamic events
export interface HijriDateInfo {
  month: number;  // 1-12 (Hijri months)
  day: number;    // 1-30
}

// Fixed annual date info
export interface FixedAnnualDateInfo {
  month: number;  // 1-12 (Gregorian)
  day: number;    // 1-31
}

export interface PublicEvent {
  id: string;
  title: string;
  titleAr: string;
  titleEn?: string;
  targetDate: string;
  icon: string;
  theme: ThemeId;
  participantCount: number;
  category: EventCategory;
  dateConfidence?: DateConfidence;
  dateSource?: string;  // e.g., "Royal Decree", "Ministry of Education"
  isHijriDerived?: boolean;  // true = moon sighting dependent
  note?: string;  // Context/Fun fact about the event
  backgroundImage?: string;  // Custom background image URI (admin-managed)

  // Recurrence configuration for automatic year rollover
  recurrenceType?: EventRecurrenceType;  // How event repeats (default: 'one-time')
  hijriDate?: HijriDateInfo;             // For hijri recurrence
  fixedDate?: FixedAnnualDateInfo;       // For fixed-annual recurrence
  baseId?: string;                       // Base event ID without year suffix (e.g., 'ramadan')
}
