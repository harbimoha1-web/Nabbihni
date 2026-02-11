# نبّهني (Nabbihni) - Social Countdown App

## Project Overview
Nabbihni is an Arabic-first social countdown app for iOS and Android built with React Native + Expo.

## Tech Stack
- **Framework:** React Native + Expo (managed workflow)
- **Navigation:** expo-router
- **Storage:** AsyncStorage (local)
- **Animations:** react-native-reanimated
- **Styling:** StyleSheet (dark theme, RTL)

## Project Structure
```
nabbihni/
├── app/                    # expo-router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Home (my countdowns)
│   │   ├── explore.tsx     # Public countdowns
│   │   └── settings.tsx    # Settings
│   ├── countdown/
│   │   ├── [id].tsx        # Countdown detail
│   │   └── create.tsx      # Create countdown
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── constants/              # App constants (themes, events)
└── types/                  # TypeScript type definitions
```

## Key Files
- `hooks/useCountdown.ts` - Timer logic and formatting
- `hooks/useCountdowns.ts` - CRUD operations for countdowns
- `lib/storage.ts` - AsyncStorage helpers
- `constants/themes.ts` - Visual themes (5 free)
- `constants/publicEvents.ts` - Saudi Arabia events

## Design System
- **Primary Color:** Deep blue (#1a365d)
- **Accent Color:** Gold (#f6ad55)
- **Background:** Dark (#0f172a)
- **Language:** Arabic (RTL enabled)

## Commands
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser
```

## Features
1. Personal countdowns with themes
2. Public Saudi events (Ramadan, Eid, National Day)
3. Celebration animation when countdown ends
4. Share countdowns via deep links
5. Home screen widgets (iOS WidgetKit + Android)

## Widgets
- **Android**: `react-native-android-widget` — widgets in `widgets/` directory
- **iOS**: `@bacons/apple-targets` + SwiftUI — widget in `targets/countdown-widget/`
- **Data sync**: `lib/widgetData.ts` — syncs on every CRUD operation
- **Sizes**: Small (single countdown) + Medium (top 3 countdowns)
- **Note**: Widgets require `expo-dev-client` build, not Expo Go

## Data Model
```typescript
interface Countdown {
  id: string;
  title: string;
  targetDate: string;     // ISO date
  icon: string;           // Emoji
  theme: ThemeId;
  isPublic: boolean;
  createdAt: string;
  participantCount?: number;
}
```

## Launch Checklist (CRITICAL)

### Before TestFlight/Production Build

1. **RevenueCat Setup** (`contexts/SubscriptionContext.tsx`)
   - [x] Create account at https://revenuecat.com
   - [x] Get iOS API key (format: `appl_XXXXX`)
   - [x] Get Android API key (format: `goog_XXXXX`)
   - [ ] Verify products exist in RevenueCat Console: `premium_monthly` (4.99 SAR) and `premium_lifetime` (49.99 SAR)
   - [x] Verify `DEV_FORCE_PREMIUM = false`

2. **AdMob Setup** (`components/AdBanner.tsx`, `app.json`)
   - [x] Create AdMob account at https://admob.google.com
   - [x] Create iOS and Android apps
   - [x] Get ad unit IDs and add to `AdBanner.tsx`
   - [x] Update `GADApplicationIdentifier` in `app.json`
   - [ ] **Configure halal blocking** in AdMob Console:
     - Block: Alcohol, Gambling, Dating, Music, Tobacco, Lottery
     - Block: Loans, Crypto, Political, Religious (non-Islamic), Sexual
   - [ ] Create `app-ads.txt` at nabbihni.com

3. **Firebase Setup** (iOS + Android)
   - [x] Create Firebase project at console.firebase.google.com
   - [x] Add Android app with package `app.nabbihni.countdown`
   - [x] Download `google-services.json` and place in project root
   - [x] Download `GoogleService-Info.plist` and place in project root

4. **App Store Setup** (`app/(tabs)/settings.tsx`)
   - [ ] After App Store approval, add App Store ID to `handleRateApp`

5. **EAS Setup** (`app.json`)
   - [x] Run `eas init` to get project ID
   - [x] Update `extra.eas.projectId` (`a9e98f50-3009-4527-9790-0e7d6a4d30d9`)

6. **Widget Setup** (`app.json`)
   - [x] Set `ios.appleTeamId` to `A94DV992X6`
   - [x] Widgets auto-register via config plugins (no additional setup needed)
   - [ ] Test: `npx expo prebuild` then build with `eas build`

### Pricing
- Free: 5 countdowns + ads
- Monthly: 4.99 SAR/month
- Lifetime: 49.99 SAR (permanent, forever)

## TODO
- [ ] Supabase integration for social features
- [x] Widget support (iOS + Android)
- [ ] Error tracking (Sentry)
