// Screenshot framing configuration for Kam Baqi (كم باقي)
// Each entry defines the text overlay, colors, and background for one App Store screenshot.

export const OUTPUT_WIDTH = 1320;
export const OUTPUT_HEIGHT = 2868;
export const FONT_FAMILY = 'Tajawal';

export const screenshots = [
  {
    id: '01_home',
    headline: 'كم باقي؟',
    subtitle: 'عدّ لحظاتك المميزة',
    subtitleColor: '#F59E0B',
    background: { type: 'gradient', from: '#0f0c29', to: '#302b63' },
    rawFile: '01_home.png',
    outputFile: '01_home.png',
  },
  {
    id: '02_widget',
    headline: 'ودجت مجاني تماماً 🎁',
    subtitle: 'بدون اشتراك — على شاشتك الرئيسية',
    subtitleColor: '#34D399',
    background: { type: 'gradient', from: '#0f172a', to: '#1a365d' },
    rawFile: '02_widget.png',
    outputFile: '02_widget.png',
  },
  {
    id: '03_detail',
    headline: 'كل ثانية تحتسب',
    subtitle: 'تابع وقتك بدقة لحظة بلحظة',
    subtitleColor: '#f4d03f',
    background: { type: 'gradient', from: '#1a1a2e', to: '#0f3460' },
    rawFile: '03_detail.png',
    outputFile: '03_detail.png',
  },
  {
    id: '04_explore',
    headline: 'مناسبات السعودية',
    subtitle: 'رمضان • العيد • اليوم الوطني',
    subtitleColor: '#64ffda',
    background: { type: 'gradient', from: '#004d40', to: '#00695c' },
    rawFile: '04_explore.png',
    outputFile: '04_explore.png',
  },
  {
    id: '05_create',
    headline: 'أنشئ عدادك في ثوانٍ',
    subtitle: 'سهل، سريع، وجميل',
    subtitleColor: 'rgba(255,255,255,0.85)',
    background: { type: 'gradient', from: '#ff6b6b', to: '#feca57' },
    rawFile: '05_create.png',
    outputFile: '05_create.png',
  },
  {
    id: '06_salary',
    headline: 'راتبك كل شهر تلقائياً 💰',
    subtitle: 'يتحدّث ذاتياً — مع تعديل ذكي للعطلات',
    subtitleColor: '#f4d03f',
    background: { type: 'gradient', from: '#0f0c29', to: '#1a1a2e' },
    rawFile: '06_salary.png',
    outputFile: '06_salary.png',
  },
  {
    id: '07_celebration',
    headline: '🎉 حان الوقت!',
    subtitle: 'احتفل بلحظاتك المميزة وشاركها',
    subtitleColor: 'rgba(255,255,255,0.9)',
    background: { type: 'gradient', from: '#ff6b6b', to: '#feca57' },
    rawFile: '07_celebration.png',
    outputFile: '07_celebration.png',
  },
];
