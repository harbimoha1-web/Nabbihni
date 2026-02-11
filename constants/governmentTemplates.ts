import { GovernmentTemplate } from '@/types/templates';

// Government document templates for Saudi Arabia
// Users provide their own expiry dates
export const governmentTemplates: GovernmentTemplate[] = [
  {
    id: 'id-card',
    titleEn: 'ID Expiry',
    titleAr: 'انتهاء الهوية',
    icon: '🆔',
    theme: 'default',
    defaultReminders: [90, 30, 14, 7], // days before expiry
    preferredCalendar: 'hijri',
    descriptionEn: 'Track your ID expiry (Saudi National ID or Iqama)',
    descriptionAr: 'تتبع انتهاء الهوية (بطاقة الهوية الوطنية أو الإقامة)',
  },
  {
    id: 'visa',
    titleEn: 'Visa Expiry',
    titleAr: 'انتهاء التأشيرة',
    icon: '✈️',
    theme: 'sunset',
    defaultReminders: [30, 14, 7, 1], // days before expiry
    preferredCalendar: 'gregorian',
    descriptionEn: 'Track your visa expiry date',
    descriptionAr: 'تتبع تاريخ انتهاء التأشيرة',
  },
  {
    id: 'vehicle',
    titleEn: 'Vehicle Registration',
    titleAr: 'رخصة السيارة',
    icon: '🚗',
    theme: 'default',
    defaultReminders: [30, 7], // days before expiry
    preferredCalendar: 'hijri',
    descriptionEn: 'Track your vehicle registration expiry',
    descriptionAr: 'تتبع تاريخ انتهاء رخصة السيارة',
  },
  {
    id: 'passport',
    titleEn: 'Passport Expiry',
    titleAr: 'انتهاء جواز السفر',
    icon: '📘',
    theme: 'night',
    defaultReminders: [180, 90, 30], // days before expiry
    preferredCalendar: 'gregorian',
    descriptionEn: 'Track your passport expiry date',
    descriptionAr: 'تتبع تاريخ انتهاء جواز السفر',
  },
  {
    id: 'driving-license',
    titleEn: 'Driving License',
    titleAr: 'رخصة القيادة',
    icon: '🪪',
    theme: 'default',
    defaultReminders: [30, 7], // days before expiry
    preferredCalendar: 'hijri',
    descriptionEn: 'Track your driving license expiry',
    descriptionAr: 'تتبع تاريخ انتهاء رخصة القيادة',
  },
  {
    id: 'rent',
    titleEn: 'Rent Payment',
    titleAr: 'موعد الإيجار',
    icon: '🏠',
    theme: 'gold',
    defaultReminders: [7, 3, 1], // days before due
    preferredCalendar: 'gregorian',
    descriptionEn: 'Track your rent payment due date',
    descriptionAr: 'تتبع موعد دفع الإيجار',
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    id: 'birthday',
    titleEn: 'Birthday',
    titleAr: 'يوم ميلاد',
    icon: '🎂',
    theme: 'sunset',
    defaultReminders: [7, 1, 0], // week before, day before, on the day
    preferredCalendar: 'gregorian',
    descriptionEn: "Count down to your special day or a loved one's birthday",
    descriptionAr: 'العد التنازلي ليومك المميز أو يوم ميلاد من تحب',
    isRecurring: true,
    recurrenceType: 'yearly',
  },
];

export const getTemplateById = (id: string): GovernmentTemplate | undefined => {
  return governmentTemplates.find((template) => template.id === id);
};

export const getTemplatesByCalendar = (calendarType: 'hijri' | 'gregorian'): GovernmentTemplate[] => {
  return governmentTemplates.filter((template) => template.preferredCalendar === calendarType);
};
