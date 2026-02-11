import { ThemeId, CalendarType, ReminderOption } from './countdown';

// Government document template types
export type TemplateId =
  | 'id-card'
  | 'visa'
  | 'vehicle'
  | 'passport'
  | 'driving-license'
  | 'rent'
  | 'birthday';

export interface GovernmentTemplate {
  id: TemplateId;
  titleEn: string;
  titleAr: string;
  icon: string;
  theme: ThemeId;
  // Default reminder days before expiry
  defaultReminders: number[];
  // Calendar type preference (Hijri for Iqama/Vehicle, Gregorian for others)
  preferredCalendar: CalendarType;
  // Description for the template
  descriptionEn: string;
  descriptionAr: string;
  // Recurring template settings
  isRecurring?: boolean;
  recurrenceType?: 'monthly' | 'yearly';
}

export interface TemplateCountdown {
  templateId: TemplateId;
  expiryDate: string; // ISO date string
  customTitle?: string;
  customReminders?: number[];
}
