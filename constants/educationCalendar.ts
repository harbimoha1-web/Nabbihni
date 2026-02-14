import { PublicEvent } from '@/types/countdown';

// Saudi Arabia Education Calendar 2025-2026 (1446-1447 Hijri)
// Source: Ministry of Education official calendar
// URL: https://moe.gov.sa/en/education/generaleducation/Pages/academicCalendar.aspx
// Note: 180 school days, 38 weeks.
// IMPORTANT: Education events are 'one-time' - they require manual update when MOE publishes new calendar.
// Unlike Eid/National Day, school dates vary significantly each year.

export const educationEvents: PublicEvent[] = [
  // 2025-2026 Academic Year
  {
    id: 'school-start-2025',
    title: 'School Year Start 2025',
    titleAr: 'بداية العام الدراسي ٢٠٢٥',
    targetDate: '2025-08-24T00:00:00',
    icon: '📚',
    theme: 'default',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time', // Manual update required each year
  },
  {
    id: 'first-semester-end-2025',
    title: 'First Semester End 2025',
    titleAr: 'نهاية الفصل الدراسي الأول ٢٠٢٥',
    targetDate: '2025-12-18T00:00:00',
    icon: '🎓',
    theme: 'default',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
  {
    id: 'winter-break-start-2025',
    title: 'Winter Break Start 2025',
    titleAr: 'بداية إجازة الشتاء ٢٠٢٥',
    targetDate: '2025-12-19T00:00:00',
    icon: '❄️',
    theme: 'night',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
  {
    id: 'second-semester-start-2026',
    title: 'Second Semester Start 2026',
    titleAr: 'بداية الفصل الدراسي الثاني ٢٠٢٦',
    targetDate: '2026-01-04T00:00:00',
    icon: '📖',
    theme: 'default',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
  {
    id: 'spring-break-start-2026',
    title: 'Spring Break Start 2026',
    titleAr: 'بداية إجازة الربيع ٢٠٢٦',
    targetDate: '2026-03-22T00:00:00',
    icon: '🌸',
    theme: 'sunset',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
  {
    id: 'third-semester-start-2026',
    title: 'Third Semester Start 2026',
    titleAr: 'بداية الفصل الدراسي الثالث ٢٠٢٦',
    targetDate: '2026-04-05T00:00:00',
    icon: '📝',
    theme: 'default',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
  {
    id: 'summer-vacation-2026',
    title: 'Summer Vacation 2026',
    titleAr: 'بداية الإجازة الصيفية ٢٠٢٦',
    targetDate: '2026-06-25T00:00:00',
    icon: '☀️',
    theme: 'gold',
    category: 'education',
    dateConfidence: 'confirmed',
    dateSource: 'Ministry of Education',
    recurrenceType: 'one-time',
  },
];

export const getUpcomingEducationEvents = (): PublicEvent[] => {
  const now = new Date();
  return educationEvents
    .filter((event) => new Date(event.targetDate) > now)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
};
