# Nabbihni - TODO List

## Next Up (Tomorrow)

### 1. Create App Store Screenshots
**Tool:** [AppMockUp Studio](https://studio.app-mockup.com)

| # | Screenshot | Arabic Title | Arabic Subtitle |
|---|------------|--------------|-----------------|
| 1 | Home screen | نبّهني | عد تنازلي لأهم لحظاتك |
| 2 | Countdown detail | تابع كل ثانية | عد تنازلي مباشر بالهجري والميلادي |
| 3 | Public events | مناسبات السعودية | رمضان، العيد، اليوم الوطني |
| 4 | Create screen | أنشئ عدادك | سهل وسريع |
| 5 | Themes | ثيمات جميلة | خصص مظهر عدادك |
| 6 | Celebration | 🎉 حان الوقت! | احتفل بلحظاتك المميزة |

**Steps:**
- [ ] Take screenshots from the app (6 screens)
- [ ] Upload to AppMockUp Studio
- [ ] Add Arabic titles/subtitles
- [ ] Export for App Store (iPhone 16 Pro Max)
- [ ] Export for Play Store (Android)

---

## Launch Checklist (Before Release)

### RevenueCat Setup
- [ ] Create account at https://revenuecat.com
- [ ] Get iOS API key (`appl_XXXXX`)
- [ ] Get Android API key (`goog_XXXXX`)
- [ ] Create products: `premium_monthly` (4.99 SAR), `premium_lifetime` (79.99 SAR)
- [ ] Update `contexts/SubscriptionContext.tsx` with keys

### AdMob Setup
- [ ] Configure halal blocking in AdMob Console:
  - Block: Alcohol, Gambling, Dating, Music, Tobacco, Lottery
  - Block: Loans, Crypto, Political, Religious (non-Islamic), Sexual
- [ ] Create `app-ads.txt` at nabbihni.com

### Firebase Setup (Android)
- [ ] Create Firebase project
- [ ] Add Android app with package `app.nabbihni.countdown`
- [ ] Download `google-services.json` → place in project root

### EAS Setup
- [ ] Run `eas init` to get project ID
- [ ] Update `app.json` → `extra.eas.projectId`

### App Store Setup
- [ ] After App Store approval, add App Store ID to `handleRateApp` in settings

---

## Completed (2026-02-04)

- [x] Fix app startup freeze (added babel.config.js)
- [x] Fix yellow scribble in tasks progress bar
- [x] Fix text readability on all themes (white text)
- [x] Fix notes/tasks styling (solid surface background)
