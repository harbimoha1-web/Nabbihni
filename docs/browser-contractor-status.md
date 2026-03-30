# Browser Contractor — Status Tracker
**Project:** كم باقي (Kam Baqi)
**Last updated:** 2026-03-30 after Session 6 (in progress)

## Sessions Log

| Session | Date | Tasks | Result | Notes |
|---------|------|-------|--------|-------|
| 1 | 2026-03-28 | App Store Connect listing (name, subtitle, description, keywords, URLs) | ✅ | Description emoji paste failed — fixed in session 2 |
| 2 | 2026-03-28 | Fix ASC description with emojis, What's New text, AdMob sensitive categories | ✅ | All 3 tasks done. 7 sensitive categories blocked |
| 3 | 2026-03-28 | AdMob general categories blocking | ✅ | 48 total categories now blocked |
| 4 | 2026-03-30 | Merchant account + service account key | ⚠️ | Merchant: Active. Service account: created but key download cut off by 5-hour limit |
| 5 | 2026-03-30 | API enable, key download, Play Console access, IAP products, RevenueCat | ⚠️ | Key done. Access done. RevenueCat done. IAP BLOCKED — no AAB uploaded yet |
| 6 | 2026-03-30 | AAB upload, app name fix, IAP products, verification | ⏳ | AAB uploaded (manually). App name verified. IAP creation in progress |

## Current State

### Google Play Console
- **App status:** Draft (not yet submitted for production review)
- **Internal testing:** v1.0.0 (build 15) — released to internal testers 2026-03-30 5:48 AM
- **Testers:** None configured (warning shown, non-critical)
- **Store listing name:** كم باقي - عد تنازلي ✅
- **Short description:** Updated to approved text ✅
- **Full description:** Updated, emojis removed ✅
- **Default language:** Arabic (ar) ✅
- **Internal app name:** نبهني (not editable after creation — cosmetic only, users see store listing name)
- **Screenshots:** NOT UPLOADED — needed before production
- **Feature graphic:** UNKNOWN — may need uploading
- **App icon:** UNKNOWN — verify
- **Content rating:** UNKNOWN — may need questionnaire
- **Target audience:** UNKNOWN — may need configuration
- **Privacy policy URL:** UNKNOWN — verify it's set to https://nabbihni.com/privacy.html

### Google Play Console — Monetization
- **Merchant account:** ACTIVE (THEBOLDS, support@nabbihni.com, KAM BAQI)
- **Payment method (IBAN):** NOT SET — needed before first payout, not blocking launch
- **IAP products:** Session 6 creating them now
  - `premium_monthly` — status pending
  - `premium_lifetime` — status pending

### Google Cloud Console
- **Project:** nabbihni-play-console
- **Google Play Android Developer API:** Enabled ✅
- **Service account:** eas-submission@nabbihni-play-console.iam.gserviceaccount.com
- **Service account key:** Downloaded + placed as `play-store-key.json` ✅
- **Play Console role:** Release Manager (all apps) ✅

### RevenueCat (project 9ea89f17)
- **iOS products:** premium_monthly + premium_lifetime ✅
- **Android products:** Premium Monthly (premium_monthly:monthly-plan) + Premium Lifetime (premium_lifetime) ✅
- **Default offering:**
  - Monthly package: Apple ✅ + Google Play ✅
  - Lifetime package: Apple ✅ + Google Play ✅

### App Store Connect (iOS)
- **Build:** v1.0.0 (build 29) — in TestFlight ✅
- **Store listing:** Complete (name, subtitle, description, keywords, URLs) ✅
- **What's New:** Set ✅
- **IAPs:** Ready to Submit ✅
- **Screenshots:** NOT UPLOADED — needed before App Store Review

### AdMob
- **Blocking:** 48 categories blocked (sensitive + general) ✅
- **Halal compliant:** Yes ✅

## Known Blockers

| Blocker | Blocks What | Owner |
|---------|------------|-------|
| Screenshots (6 screens) | App Store Review + Play Store Production | Mohammad |
| Content rating questionnaire | Play Store Production (if not done) | Browser agent — verify in next session |
| Target audience declaration | Play Store Production (if not done) | Browser agent — verify in next session |
| Bank IBAN in Google Payments | First payout (not blocking launch) | Mohammad |

## Next Session Needs
- Await Session 6 completion report (IAP products + verification)
- If Session 6 completes: next session is a FULL Play Console production readiness scan
- Screenshots must be uploaded (both stores) before any review submission
