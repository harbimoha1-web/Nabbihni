import { ThemeId } from './countdown';

export enum HijriMonth {
  MUHARRAM = 1,
  SAFAR = 2,
  RABI_AL_AWWAL = 3,
  RABI_AL_THANI = 4,
  JUMADA_AL_ULA = 5,
  JUMADA_AL_THANI = 6,
  RAJAB = 7,
  SHABAN = 8,
  RAMADAN = 9,
  SHAWWAL = 10,
  DHU_AL_QADAH = 11,
  DHU_AL_HIJJAH = 12,
}

export interface SaudiHolidayEvent {
  event_id: string;
  name_ar: string;
  name_en: string;
  hijri_day: number;
  hijri_month: HijriMonth;
  icon: string;
  theme: ThemeId;
  category: 'religious' | 'national';
}

export interface SaudiHolidayInstance {
  event_id: string;
  hijri_year: number;
  calculated_gregorian_date: string; // ISO date string
  override_gregorian_date: string | null; // Admin override
  override_reason: string | null;
  last_calculated_at: string;
}

export interface ResolvedHoliday {
  event_id: string;
  name_ar: string;
  name_en: string;
  icon: string;
  theme: ThemeId;
  category: 'religious' | 'national';
  hijri_year: number;
  hijri_day: number;
  hijri_month: HijriMonth;
  calculated_gregorian_date: string;
  override_gregorian_date: string | null;
  override_reason: string | null;
  effective_date: string; // override_gregorian_date ?? calculated_gregorian_date
  is_confirmed: boolean; // true if override exists
  last_calculated_at: string;
}
