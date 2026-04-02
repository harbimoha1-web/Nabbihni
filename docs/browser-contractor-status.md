# Browser Contractor — Status Tracker
**Project:** كم باقي (Kam Baqi)
**Last updated:** 2026-04-02 after builds + screenshot v2 redesign

## Sessions Log

| Session | Date | Tasks | Result | Notes |
|---------|------|-------|--------|-------|
| 1 | 2026-03-28 | App Store Connect listing (name, subtitle, description, keywords, URLs) | ✅ | Description emoji paste failed — fixed in session 2 |
| 2 | 2026-03-28 | Fix ASC description with emojis, What's New text, AdMob sensitive categories | ✅ | All 3 tasks done. 7 sensitive categories blocked |
| 3 | 2026-03-28 | AdMob general categories blocking | ✅ | 48 total categories now blocked |
| 4 | 2026-03-30 | Merchant account + service account key | ⚠️ | Merchant: Active. Service account: created but key download cut off by 5-hour limit |
| 5 | 2026-03-30 | API enable, key download, Play Console access, IAP products, RevenueCat | ⚠️ | Key done. Access done. RevenueCat done. IAP BLOCKED — no AAB uploaded yet |
| 6 | 2026-03-30 | AAB upload, app name fix, IAP products, verification | ⚠️ | AAB uploaded (manually). App name verified. IAP creation in progress |
| 7 | — | Fix RevenueCat lifetime package type | ⏳ | Instructions written. NOT YET EXECUTED |
| 8 | — | Fix Play Console permissions + Upload screenshots (both stores) + AAB upload | ⏳ | Instructions written. NOT YET EXECUTED |

## Current State (2026-04-02)

### Builds
- **Android:** versionCode 17 — ✅ BUILT. AAB: https://expo.dev/artifacts/eas/eegAnGVTScZj2EHA27YfLK.aab
- **iOS:** buildNumber 37 — ⏳ In EAS queue (waiting for build server)
- **EAS auto-submit (Android):** ❌ FAILED — service account missing app-level permissions

### Screenshots (v2 Starized — APPROVED by Mohammad)
- **Location:** `docs/screenshots/output/` — 7 PNGs, 1320×2868px
- **Design:** Unified dark navy background, gold subtitles, no status bar, phone glow
- **Status:** Generated and approved. NOT YET uploaded to stores.

### App Store Connect (iOS)
- **Build:** v1.0.0 (build 29) in TestFlight — STALE (no cloud sync)
- **New build:** buildNumber 37 — in EAS queue
- **Store listing:** Complete (name, subtitle, description, keywords, URLs) ✅
- **What's New:** Set ✅
- **IAPs:** Ready to Submit ✅
- **Screenshots:** ❌ NOT UPLOADED — Session 8 will handle
- **Submission:** Not yet — needs new build + screenshots

### Google Play Console
- **App status:** Draft
- **Internal testing:** v1.0.0 (build 15) — STALE (no cloud sync)
- **New AAB:** versionCode 17 built, needs manual upload (Session 8)
- **Store listing:** Complete (name, descriptions) ✅
- **Screenshots:** ❌ NOT UPLOADED — Session 8 will handle
- **Service account permissions:** ❌ BROKEN — needs app-level access (Session 8 Task 0)

### Google Play Console — Monetization
- **Merchant account:** ACTIVE (THEBOLDS) ✅
- **IAP products:** premium_monthly (Active) + premium_lifetime (Active) ✅
- **Payment method (IBAN):** NOT SET — needed for payout, not blocking launch

### RevenueCat (project 9ea89f17)
- **Monthly package:** Works ✅
- **Lifetime package:** ❌ Does NOT trigger Apple Pay — Session 7 will fix
- **Default offering:** Has monthly + lifetime packages

### AdMob
- **48 categories blocked** (halal compliant) ✅

## Pending Browser Agent Sessions

### Session 7 — RevenueCat Lifetime Fix
- **File:** `docs/browser-agent-session7.md`
- **Task:** Fix lifetime package type in RevenueCat Default Offering
- **Priority:** HIGH — blocks subscription revenue
- **Status:** Instructions ready, not executed

### Session 8 — Screenshots Upload + AAB Upload + Permissions Fix
- **File:** `docs/browser-agent-session8.md`
- **Tasks:**
  - Task 0: Fix service account app-level permissions in Play Console
  - Task 1: Upload 7 screenshots to App Store Connect
  - Task 2: Upload AAB (versionCode 17) + 7 screenshots to Google Play Console
- **Priority:** CRITICAL — blocks both store submissions
- **Status:** Instructions ready, not executed

## Blockers to Launch

| Blocker | Blocks | Fix |
|---------|--------|-----|
| Screenshots not uploaded | Both stores | Session 8 |
| iOS build in queue | iOS submission | Wait for EAS |
| Service account permissions | Android auto-submit | Session 8 Task 0 |
| RevenueCat lifetime package | Lifetime subscription | Session 7 |
| Content rating questionnaire | Play Store (verify if done) | Session 8 Task 3 |

## Next Actions (in order)
1. Deploy browser agent for **Session 7** (RevenueCat fix)
2. Deploy browser agent for **Session 8** (screenshots + AAB + permissions)
3. Wait for iOS build to finish → submit via `eas submit --platform ios`
4. Submit iOS for App Review (browser agent or EAS)
5. Promote Android to Production (browser agent)
