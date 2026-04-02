// Screenshot framing configuration for Kam Baqi (كم باقي)
// THEBOLDS v2: Unified brand background, nuclear status bar removal, killer Saudi copy
// All screenshots share the same dark navy brand background

export const OUTPUT_WIDTH = 1284;
export const OUTPUT_HEIGHT = 2778;
export const FONT_FAMILY = 'Tajawal';

// Unified brand background — same across all screenshots
const BRAND_BG = { type: 'gradient', from: '#0f172a', to: '#141e30' };

export const screenshots = [
  {
    id: '01_home',
    headline: 'كم باقي؟',
    subtitle: 'تابع كل شي يهمّك',
    subtitleColor: '#f6ad55',
    glowColor: '#6c5ce7',
    background: BRAND_BG,
    rawFile: '01_home.png',
    outputFile: '01_home.png',
  },
  {
    id: '02_widget',
    headline: 'دايم قدّام عينك',
    subtitle: 'ودجت مجاني — بدون اشتراك',
    subtitleColor: '#f6ad55',
    glowColor: '#3b82f6',
    background: BRAND_BG,
    rawFile: '02_widget.png',
    outputFile: '02_widget.png',
  },
  {
    id: '03_salary',
    headline: 'باقي كم للراتب؟',
    subtitle: 'عدّاد ذكي يتجدّد كل شهر',
    subtitleColor: '#f6ad55',
    glowColor: '#a855f7',
    background: BRAND_BG,
    rawFile: '06_salary.png',
    outputFile: '03_salary.png',
  },
  {
    id: '04_explore',
    headline: 'لا تفوّتك مناسبة',
    subtitle: 'رمضان • العيد • اليوم الوطني وأكثر',
    subtitleColor: '#f6ad55',
    glowColor: '#10b981',
    background: BRAND_BG,
    rawFile: '04_explore.png',
    outputFile: '04_explore.png',
  },
  {
    id: '05_detail',
    headline: 'أكثر من مجرد عداد',
    subtitle: 'ملاحظات ومهام لكل عد تنازلي',
    subtitleColor: '#f6ad55',
    glowColor: '#3b82f6',
    background: BRAND_BG,
    rawFile: '03_detail.png',
    outputFile: '05_detail.png',
  },
  {
    id: '06_create',
    headline: 'صمّمه على كيفك',
    subtitle: 'ثيمات وإيموجي — جاهز بثواني',
    subtitleColor: '#f6ad55',
    glowColor: '#f59e0b',
    background: BRAND_BG,
    rawFile: '05_create.png',
    outputFile: '06_create.png',
  },
  {
    id: '07_celebration',
    headline: 'حان الوقت!',
    subtitle: 'شاركها مع اللي يهمّونك',
    subtitleColor: '#f6ad55',
    glowColor: '#ec4899',
    background: BRAND_BG,
    rawFile: '07_celebration.png',
    outputFile: '07_celebration.png',
  },
];
