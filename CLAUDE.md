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
   - [ ] Set up products with correct SAR pricing:
     1. **App Store Connect** → Subscriptions & In-App Purchases:
        - Create `premium_monthly` — pick price tier closest to **4.99 SAR/mo** (auto-renewable)
        - Create `premium_lifetime` — pick price tier closest to **79.99 SAR** (non-consumable)
     2. **Google Play Console** → Monetization → Products:
        - Create `premium_monthly` — set price directly to **4.99 SAR/mo**
        - Create `premium_lifetime` — set price directly to **79.99 SAR**
     3. **RevenueCat** → [Product Catalog](https://app.revenuecat.com/projects/9ea89f17/product-catalog/products):
        - Add both products (RevenueCat pulls SAR prices from the stores automatically)
        - Create a **default Offering** with only these 2 packages (remove any extras)
     4. Verify offerings load in the app (no more "empty offerings" error)
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
- Lifetime: 79.99 SAR (permanent, forever)

## Lessons Learned

### Black Screen on iOS Dev Build (2026-02-12)

**Symptom:** App shows black screen immediately on launch in iOS dev client.

**Root causes (3 issues compounding):**

1. **`metro.config.js` — Native module stubbing is required for dev.**
   Native-only modules (`react-native-purchases`, `react-native-google-mobile-ads`, `react-native-android-widget`, `react-native-shared-group-preferences`) must be stubbed (returned as `{ type: 'empty' }`) during local development. They crash during initialization because dev builds don't always have the native code linked. The fix: stub by default, skip stubbing only in EAS builds (`process.env.EAS_BUILD`). Never flip this to "opt-in stubbing" — dev is the common case.

2. **`I18nManager.forceRTL()` + `Updates.reloadAsync()` = infinite loop.**
   `forceRTL()` only takes effect after a **native** restart. `Updates.reloadAsync()` does a **JS** reload. So the RTL mismatch is still there after reload → triggers another reload → infinite loop. Never call `reloadAsync()` to apply RTL changes. Just call `forceRTL()` and let it take effect on the next natural app restart.

3. **`useFonts` error goes unhandled → stuck loading screen.**
   `useFonts()` returns `[loaded, error]`. If fonts fail, `loaded` stays `false` forever. If the render gate only checks `!fontsLoaded`, the app hangs on the loading view (which looks like a black screen if splash already hid). Fix: `(!fontsLoaded && !fontError)` — treat error as "done loading."

**Key rules for this project:**
- `metro.config.js`: Default = stub native modules. `EAS_BUILD` env var = don't stub.
- `newArchEnabled`: Keep `false` until all native deps officially support New Architecture.
- Never auto-reload for RTL changes. Prompt the user to restart manually.
- Always handle both the success AND error states from `useFonts`.

## TODO
- [ ] Supabase integration for social features
- [x] Widget support (iOS + Android)
- [ ] Error tracking (Sentry)
