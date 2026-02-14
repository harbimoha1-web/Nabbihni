import { PublicEvent } from '@/types/countdown';

// Saudi Arabia and International public events
// Events are defined with recurrence types for automatic year rollover:
// - hijri: Islamic calendar events (auto-calculates from Hijri date)
// - fixed-annual: Same Gregorian date every year
// - seasonal: Astronomical/weather events
// - one-time: No recurrence (World Cup, specific year events)

export const publicEvents: PublicEvent[] = [
  // ============================================
  // ISLAMIC/RELIGIOUS EVENTS (Hijri-based)
  // ============================================
  {
    id: 'ramadan-2026',
    baseId: 'ramadan',
    title: 'Ramadan 2026',
    titleAr: 'رمضان ١٤٤٧',
    targetDate: '2026-02-17T00:00:00',
    icon: '🌙',
    theme: 'ramadan',
    category: 'religious',
    dateConfidence: 'estimated',
    dateSource: 'Hijri Calendar Calculation',
    isHijriDerived: true,
    note: 'الشهر الكريم - شهر الصيام والقرآن',
    recurrenceType: 'hijri',
    hijriDate: { month: 9, day: 1 }, // 1 Ramadan
  },
  {
    id: 'eid-fitr-2026',
    baseId: 'eid-fitr',
    title: 'Eid Al-Fitr 2026',
    titleAr: 'عيد الفطر ١٤٤٧',
    targetDate: '2026-03-19T00:00:00',
    icon: '🎉',
    theme: 'gold',
    category: 'religious',
    dateConfidence: 'estimated',
    dateSource: 'Hijri Calendar Calculation',
    isHijriDerived: true,
    note: 'عيد الفرحة بعد شهر الصيام',
    recurrenceType: 'hijri',
    hijriDate: { month: 10, day: 1 }, // 1 Shawwal
  },
  {
    id: 'hajj-2026',
    baseId: 'hajj',
    title: 'Hajj Season 2026',
    titleAr: 'موسم الحج ١٤٤٧',
    targetDate: '2026-05-24T00:00:00',
    icon: '🕋',
    theme: 'gold',
    category: 'religious',
    dateConfidence: 'estimated',
    dateSource: 'Hijri Calendar Calculation',
    isHijriDerived: true,
    note: 'الركن الخامس من أركان الإسلام',
    recurrenceType: 'hijri',
    hijriDate: { month: 12, day: 8 }, // 8 Dhul Hijjah (start of Hajj)
  },
  {
    id: 'eid-adha-2026',
    baseId: 'eid-adha',
    title: 'Eid Al-Adha 2026',
    titleAr: 'عيد الأضحى ١٤٤٧',
    targetDate: '2026-05-26T00:00:00',
    icon: '🐑',
    theme: 'gold',
    category: 'religious',
    dateConfidence: 'estimated',
    dateSource: 'Hijri Calendar Calculation',
    isHijriDerived: true,
    note: 'عيد الأضحية - ذكرى فداء إسماعيل عليه السلام',
    recurrenceType: 'hijri',
    hijriDate: { month: 12, day: 10 }, // 10 Dhul Hijjah
  },

  // ============================================
  // SAUDI NATIONAL EVENTS (Fixed Annual)
  // ============================================
  {
    id: 'founding-day-2026',
    baseId: 'founding-day',
    title: 'Founding Day 2026',
    titleAr: 'يوم التأسيس ٢٠٢٦',
    targetDate: '2026-02-22T00:00:00',
    icon: '🇸🇦',
    theme: 'default',
    category: 'national',
    dateConfidence: 'confirmed',
    dateSource: 'Royal Decree 2022',
    note: 'ذكرى تأسيس الدولة السعودية الأولى ١٧٢٧م',
    recurrenceType: 'fixed-annual',
    fixedDate: { month: 2, day: 22 }, // February 22
  },
  {
    id: 'flag-day-2026',
    baseId: 'flag-day',
    title: 'Flag Day 2026',
    titleAr: 'يوم العلم ٢٠٢٦',
    targetDate: '2026-03-11T00:00:00',
    icon: '🇸🇦',
    theme: 'default',
    category: 'national',
    dateConfidence: 'confirmed',
    dateSource: 'Royal Decree 2023',
    note: 'احتفاء بالعلم السعودي ورمزيته الوطنية',
    recurrenceType: 'fixed-annual',
    fixedDate: { month: 3, day: 11 }, // March 11
  },
  {
    id: 'national-day-2026',
    baseId: 'national-day',
    title: 'National Day 2026',
    titleAr: 'اليوم الوطني ٢٠٢٦',
    targetDate: '2026-09-23T00:00:00',
    icon: '🇸🇦',
    theme: 'default',
    category: 'national',
    dateConfidence: 'confirmed',
    dateSource: 'Fixed since 1932',
    note: 'الذكرى ٩٦ لتوحيد المملكة العربية السعودية',
    recurrenceType: 'fixed-annual',
    fixedDate: { month: 9, day: 23 }, // September 23
  },

  // ============================================
  // SAUDI SEASONS (Seasonal - Weather & Stars)
  // ============================================
  {
    id: 'summer-start-2026',
    baseId: 'summer-start',
    title: 'Summer Begins',
    titleAr: 'بداية الصيف ٢٠٢٦',
    targetDate: '2026-06-21T00:00:00',
    icon: '☀️',
    theme: 'sunset',
    category: 'seasonal',
    dateConfidence: 'confirmed',
    dateSource: 'Astronomical Calendar',
    note: 'الانقلاب الصيفي - أطول نهار في السنة',
    recurrenceType: 'seasonal',
    fixedDate: { month: 6, day: 21 },
  },
  {
    id: 'suhail-2026',
    baseId: 'suhail',
    title: 'Suhail Star Rising',
    titleAr: 'طلوع سهيل ٢٠٢٦',
    targetDate: '2026-08-24T00:00:00',
    icon: '⭐',
    theme: 'night',
    category: 'seasonal',
    dateConfidence: 'confirmed',
    dateSource: 'Arabian Star Calendar',
    note: 'بشير انكسار الحرارة - يقول المثل: إذا طلع سهيل، لطّف الليل',
    recurrenceType: 'seasonal',
    fixedDate: { month: 8, day: 24 },
  },
  {
    id: 'al-wasm-2026',
    baseId: 'al-wasm',
    title: 'Al-Wasm Season',
    titleAr: 'موسم الوسم ٢٠٢٦',
    targetDate: '2026-10-16T00:00:00',
    icon: '🌧️',
    theme: 'default',
    category: 'seasonal',
    dateConfidence: 'confirmed',
    dateSource: 'Arabian Star Calendar',
    note: 'موسم الأمطار وبداية الخضرة في الصحراء',
    recurrenceType: 'seasonal',
    fixedDate: { month: 10, day: 16 },
  },
  {
    id: 'al-aqrab-2026',
    baseId: 'al-aqrab',
    title: 'Al-Aqrab Season',
    titleAr: 'موسم العقرب ٢٠٢٦',
    targetDate: '2026-11-16T00:00:00',
    icon: '🦂',
    theme: 'sunset',
    category: 'seasonal',
    dateConfidence: 'confirmed',
    dateSource: 'Arabian Star Calendar',
    note: 'بداية أقسى فترات البرد - ٤٠ يوم',
    recurrenceType: 'seasonal',
    fixedDate: { month: 11, day: 16 },
  },
  {
    id: 'winter-start-2026',
    baseId: 'winter-start',
    title: 'Winter Begins',
    titleAr: 'بداية الشتاء ٢٠٢٦',
    targetDate: '2026-12-21T00:00:00',
    icon: '❄️',
    theme: 'night',
    category: 'seasonal',
    dateConfidence: 'confirmed',
    dateSource: 'Astronomical Calendar',
    note: 'الانقلاب الشتوي - أقصر نهار في السنة',
    recurrenceType: 'seasonal',
    fixedDate: { month: 12, day: 21 },
  },

  // ============================================
  // ANNUAL INTERNATIONAL EVENTS (Fixed Annual)
  // ============================================
  {
    id: 'new-year-2027',
    baseId: 'new-year',
    title: 'New Year 2027',
    titleAr: 'السنة الجديدة ٢٠٢٧',
    targetDate: '2027-01-01T00:00:00',
    icon: '🎊',
    theme: 'night',
    category: 'international',
    dateConfidence: 'confirmed',
    dateSource: 'Fixed Date',
    note: 'استقبال العام الجديد حول العالم',
    recurrenceType: 'fixed-annual',
    fixedDate: { month: 1, day: 1 },
  },

  // ============================================
  // ENTERTAINMENT (Tentative Annual)
  // ============================================
  {
    id: 'riyadh-season-2026',
    baseId: 'riyadh-season',
    title: 'Riyadh Season 2026',
    titleAr: 'موسم الرياض ٢٠٢٦',
    targetDate: '2026-10-15T00:00:00',
    icon: '🎭',
    theme: 'sunset',
    category: 'entertainment',
    dateConfidence: 'tentative',
    dateSource: 'GEA (pending confirmation)',
    note: 'أكبر موسم ترفيهي في الشرق الأوسط',
    recurrenceType: 'fixed-annual',
    fixedDate: { month: 10, day: 15 },
  },

  // ============================================
  // ONE-TIME EVENTS (No Recurrence)
  // ============================================
  {
    id: 'worldcup-2026',
    baseId: 'worldcup-2026',
    title: 'FIFA World Cup 2026',
    titleAr: 'كأس العالم ٢٠٢٦',
    targetDate: '2026-06-11T00:00:00',
    icon: '⚽',
    theme: 'gold',
    category: 'international',
    dateConfidence: 'confirmed',
    dateSource: 'FIFA Official',
    note: 'أكبر نسخة في التاريخ - ٤٨ منتخب في أمريكا وكندا والمكسيك',
    recurrenceType: 'one-time',
  },
  {
    id: 'apple-event-2026',
    baseId: 'apple-event-2026',
    title: 'Apple September Event',
    titleAr: 'حدث آبل سبتمبر ٢٠٢٦',
    targetDate: '2026-09-08T00:00:00',
    icon: '📱',
    theme: 'night',
    category: 'international',
    dateConfidence: 'tentative',
    dateSource: 'Apple (Expected)',
    note: 'الكشف عن iPhone 18 والأجهزة الجديدة',
    recurrenceType: 'one-time',
  },
  {
    id: 'us-elections-2026',
    baseId: 'us-elections-2026',
    title: 'US Midterm Elections',
    titleAr: 'انتخابات أمريكا النصفية',
    targetDate: '2026-11-03T00:00:00',
    icon: '🗳️',
    theme: 'default',
    category: 'international',
    dateConfidence: 'confirmed',
    dateSource: 'US Federal Election Commission',
    note: 'انتخابات الكونغرس النصفية',
    recurrenceType: 'one-time',
  },

  // ============================================
  // MILESTONE EVENTS (One-time, far future)
  // ============================================
  {
    id: 'vision-2030',
    baseId: 'vision-2030',
    title: 'Vision 2030',
    titleAr: 'رؤية السعودية ٢٠٣٠',
    targetDate: '2030-12-31T00:00:00',
    icon: '🚀',
    theme: 'gold',
    category: 'milestone',
    dateConfidence: 'confirmed',
    dateSource: 'Vision 2030 Program',
    note: 'مستقبل المملكة - تنويع الاقتصاد وجودة الحياة',
    recurrenceType: 'one-time',
  },
  {
    id: 'expo-2030',
    baseId: 'expo-2030',
    title: 'Expo 2030 Riyadh',
    titleAr: 'إكسبو الرياض ٢٠٣٠',
    targetDate: '2030-10-01T00:00:00',
    icon: '🌍',
    theme: 'gold',
    category: 'milestone',
    dateConfidence: 'confirmed',
    dateSource: 'BIE Official',
    note: 'الرياض تستضيف العالم تحت شعار "حقبة التغيير"',
    recurrenceType: 'one-time',
  },
  {
    id: 'worldcup-2034',
    baseId: 'worldcup-2034',
    title: 'FIFA World Cup 2034',
    titleAr: 'كأس العالم السعودية ٢٠٣٤',
    targetDate: '2034-11-01T00:00:00',
    icon: '🏆',
    theme: 'gold',
    category: 'milestone',
    dateConfidence: 'confirmed',
    dateSource: 'FIFA Official',
    note: 'المملكة تستضيف كأس العالم لأول مرة!',
    recurrenceType: 'one-time',
  },
];

/**
 * @deprecated Use processEventsWithRecurrence from eventRecurrenceEngine instead
 * Get upcoming events (legacy - static filter)
 */
export const getUpcomingEvents = (): PublicEvent[] => {
  const now = new Date();
  return publicEvents
    .filter((event) => new Date(event.targetDate) > now)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
};

/**
 * Get events by category
 */
export const getEventsByCategory = (category: PublicEvent['category']): PublicEvent[] => {
  return publicEvents.filter((event) => event.category === category);
};
