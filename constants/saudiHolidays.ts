import { SaudiHolidayEvent, HijriMonth } from '@/types/saudiHolidays';

export const SAUDI_HOLIDAYS: SaudiHolidayEvent[] = [
  {
    event_id: 'ramadan',
    name_ar: 'رمضان',
    name_en: 'Ramadan',
    hijri_day: 1,
    hijri_month: HijriMonth.RAMADAN,
    icon: '🌙',
    theme: 'ramadan',
    category: 'religious',
  },
  {
    event_id: 'eid-fitr',
    name_ar: 'عيد الفطر',
    name_en: 'Eid Al-Fitr',
    hijri_day: 1,
    hijri_month: HijriMonth.SHAWWAL,
    icon: '🎉',
    theme: 'gold',
    category: 'religious',
  },
  {
    event_id: 'eid-adha',
    name_ar: 'عيد الأضحى',
    name_en: 'Eid Al-Adha',
    hijri_day: 10,
    hijri_month: HijriMonth.DHU_AL_HIJJAH,
    icon: '🐑',
    theme: 'gold',
    category: 'religious',
  },
  {
    event_id: 'islamic-new-year',
    name_ar: 'رأس السنة الهجرية',
    name_en: 'Islamic New Year',
    hijri_day: 1,
    hijri_month: HijriMonth.MUHARRAM,
    icon: '🌟',
    theme: 'night',
    category: 'religious',
  },
];

export const HIJRI_MONTH_NAMES: Record<HijriMonth, string> = {
  [HijriMonth.MUHARRAM]: 'محرم',
  [HijriMonth.SAFAR]: 'صفر',
  [HijriMonth.RABI_AL_AWWAL]: 'ربيع الأول',
  [HijriMonth.RABI_AL_THANI]: 'ربيع الثاني',
  [HijriMonth.JUMADA_AL_ULA]: 'جمادى الأولى',
  [HijriMonth.JUMADA_AL_THANI]: 'جمادى الآخرة',
  [HijriMonth.RAJAB]: 'رجب',
  [HijriMonth.SHABAN]: 'شعبان',
  [HijriMonth.RAMADAN]: 'رمضان',
  [HijriMonth.SHAWWAL]: 'شوال',
  [HijriMonth.DHU_AL_QADAH]: 'ذو القعدة',
  [HijriMonth.DHU_AL_HIJJAH]: 'ذو الحجة',
};
