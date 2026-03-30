# Browser Agent Instructions — Session 6
**For:** Claude browser agent
**Date:** 2026-03-30
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi) — Android Launch (final session)

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

This is the final browser session. You have 4 tasks. Do them in order.

**PAUSE PROTOCOL:** At points marked `⏸ PAUSE`, stop and message Mohammad with the exact text shown. Do not continue until he replies.

**App package name:** `app.nabbihni.countdown`

---

## WHAT'S ALREADY DONE — DO NOT REDO

| Item | Status |
|------|--------|
| Merchant account | ✅ ACTIVE (THEBOLDS) |
| Service account | ✅ Created + key placed + Play Console access granted |
| Google Play Android Developer API | ✅ Enabled |
| RevenueCat Android products | ✅ Created + attached to default offering |
| Android AAB | ✅ Built on EAS (must be uploaded manually — first submission) |
| iOS build | ✅ In App Store Connect / TestFlight |
| AdMob | ✅ 48 categories blocked |
| Store listings | ✅ iOS done, Google Play draft saved |

---

## TASK 0 — Upload AAB to Play Console (FIRST — REQUIRED BEFORE EVERYTHING)

**Where:** Google Play Console → Internal Testing
**Why:** Google Play requires the FIRST app bundle to be uploaded manually through the web interface. EAS auto-submit only works for subsequent builds. Without this upload, we cannot create IAP products.

### Step 1: AAB is already downloaded — SKIP downloading

The AAB file is already on this computer at:
**`C:\Users\TechTroniX\Downloads\app-production.aab`** (78 MB)

Do NOT try to download it again. It's already there. Go straight to uploading.

### Step 2: Upload to Play Console

1. Go to: https://play.google.com/console
2. Select the app (may show as "نبهني" — package: `app.nabbihni.countdown`)
3. Left sidebar → **Test and release** → **Testing** → **Internal testing**
   - If you see a different nav: look for **Release** → **Testing** → **Internal testing**
4. Click **"Create new release"**
5. You will see an **"Upload"** area (or "App bundles" section with an upload button/drag area)
6. Click **"Upload"** and select the file: `C:\Users\TechTroniX\Downloads\app-production.aab`
   - In the file picker, navigate to: **This PC** → **C:** → **Users** → **TechTroniX** → **Downloads** → select **app-production.aab**
   - Or drag and drop the file from the Downloads folder into the upload area
7. Wait for the upload to complete and for Google to process it (may take 1-2 minutes)
8. You should see the bundle appear with:
   - Version code: 15
   - Version name: 1.0.0
9. In the **"Release notes"** field (if shown), enter:
   ```
   الإصدار الأول من كم باقي
   ```
10. Click **"Review release"** (or "Save")
11. If you see warnings (like "Missing testers" or "Incomplete") — that's OK for now, just proceed
12. Click **"Start rollout to Internal testing"** (or "Save" if that's the only option)

**⏸ PAUSE — Tell Mohammad:**

> Task 0 done. The AAB (version 1.0.0, build 15) has been uploaded to Play Console Internal Testing.
>
> Upload status: [success / any warnings]
> Release status: [rolling out / draft / other]
>
> Reply "continue" to proceed to app name verification.

Wait for Mohammad to say "continue".

---

## TASK 1 — Verify and Fix App Name in Play Console (CRITICAL)

**Where:** Google Play Console
**URL:** https://play.google.com/console
**Why:** The app was originally created as "نبهني" (old name). The app has been rebranded to "كم باقي". The store listing draft has the correct name, but the internal app name and any other references must be updated to match.

### Steps:

1. Go to: https://play.google.com/console
2. Select the app (it may show as "نبهني" — that's the one, package: `app.nabbihni.countdown`)

3. **Check the store listing:**
   - Left sidebar → **Grow users** → **Store presence** → **Main store listing** (or **Grow users** → **Store listing**)
   - Verify the **App name** field shows: `كم باقي - عد تنازلي`
   - If it shows anything else (like "نبهني") → clear it and type: `كم باقي - عد تنازلي`

4. **Check the Short description** shows:
   `عد تنازلي ذكي للّحظات اللي تنتظرها — بالثانية.`
   - If different → clear and paste the text above

5. **Check the Full description** is in Arabic and mentions "كم باقي" (not "نبهني"). If it references the old name, it needs updating. The approved description is:

```
عندك لحظة تنتظرها؟ أنشئ لها عداداً.
الراتب. التخرج. السفر. الخطوبة. أي شيء يهمّك.
جاهز في ثوانٍ — بالثانية.

- - - - - - - - - - - - - - -

اختر الاسم، الإيموجي، والثيم — وابدأ العد فوراً.
عداد حي يعرض الأيام والساعات والدقائق والثواني.

وإذا كنت تنتظر مناسبة سعودية كبرى،
رمضان، العيد، اليوم الوطني، يوم التأسيس — كلها جاهزة بنقرة.

ودجت مجاني على شاشتك — بدون ما تفتح التطبيق.
هجري + ميلادي — تلقائياً، بدون حسابات.
احتفل باللحظة — شارك اللحظة مع من تحب.
خمسة ثيمات — خصّص كل عداد بلونه.

- - - - - - - - - - - - - - -

كم باقي المميز:
بدون إعلانات. عدادات غير محدودة. ثيمات حصرية.

شهري: 4.99 ر.س
مدى الحياة: 79.99 ر.س — ادفع مرة، استخدمه للأبد.

صُنع بعناية، للعربي أينما كان.
```

6. **Check the app's default language** is set to Arabic (ar).

7. **Look for any "App name" or "Default language" setting** in:
   - **Setup** → **App information** (or similar)
   - If you see a field for "App name" that still shows "نبهني" → change it to `كم باقي - عد تنازلي`

8. Click **Save** after any changes.

**⏸ PAUSE — Tell Mohammad:**

> Task 1 done. Here's what I found and changed:
>
> - Store listing app name: [was correct / changed from X to "كم باقي - عد تنازلي"]
> - Short description: [was correct / updated]
> - Full description: [was correct / updated]
> - Default language: [Arabic / other]
> - App information name: [was correct / changed / field not found]
>
> Reply "continue" to proceed to IAP product creation.

Wait for Mohammad to say "continue".

---

## TASK 2 — Create IAP Products in Play Console

**Where:** Google Play Console → App → Monetize
**Condition:** The Android AAB must already be uploaded to Play Console. If you see "Upload a new APK" when trying to create products, STOP and report this — it means the AAB hasn't been submitted yet.

### Part A — Monthly Subscription (`premium_monthly`)

1. Play Console → select app → left sidebar → **Monetize** (or **Monetize with Play**) → **Products** → **Subscriptions**

2. Click **"Create subscription"**

3. Fill in:
   - **Product ID:** `premium_monthly`
     ⚠️ Type EXACTLY as shown. All lowercase. No spaces. This MUST match the code and RevenueCat.
   - **Name:** `اشتراك شهري مميز`
   - **Description:** `عدادات غير محدودة بدون إعلانات`

4. Click **"Save"**

5. Add a **base plan:**
   - Click **"Add base plan"** or **"Add plan"**
   - **Base plan ID:** `monthly-plan`
     ⚠️ This MUST be exactly `monthly-plan` — it matches what's configured in RevenueCat. If you use a different ID, Android purchases will break.
   - **Auto-renewing:** Yes
   - **Billing period:** **1 Month**
   - **Price:** Click "Set price" → enter **4.99** → currency **SAR (Saudi Riyal)**
     - If a multi-country table appears → set Saudi Arabia to 4.99 SAR → let Google auto-convert others
   - **Free trial:** Do NOT enable
   - **Grace period:** Leave default
   - Click **"Save"** on the base plan

6. Click **"Activate"** to make the subscription live

7. Verify status shows: **Active**

### Part B — Lifetime One-Time Purchase (`premium_lifetime`)

1. Left sidebar → **Monetize** (or **Monetize with Play**) → **Products** → **In-app products** (or **One-time products**)
   ⚠️ This is a DIFFERENT section from Subscriptions

2. Click **"Create product"**

3. Fill in:
   - **Product ID:** `premium_lifetime`
     ⚠️ Type EXACTLY. All lowercase. Must match code and RevenueCat.
   - **Name:** `مدى الحياة - للأبد`
   - **Description:** `ادفع مرة واحدة واستخدمه للأبد`

4. Under **Pricing:**
   - Click "Set price" → enter **79.99** → currency **SAR (Saudi Riyal)**
   - If multi-country table appears → set Saudi Arabia to 79.99 SAR → auto-convert others

5. Set status to **Active**

6. Click **"Save"**

7. Verify status shows: **Active**

**⏸ PAUSE — Tell Mohammad:**

> Task 2 done. Both IAP products created in Play Console:
>
> 1. `premium_monthly` — Subscription, 4.99 SAR/month, base plan ID: `monthly-plan` ✅
> 2. `premium_lifetime` — One-time purchase, 79.99 SAR ✅
>
> Both are Active.
>
> Reply "confirmed" and I'll write my final report.

Wait for Mohammad to say "confirmed".

---

## TASK 3 — Final Verification Sweep

Do a quick check of these items. Do NOT change anything — just verify and report.

1. **Play Console → Monetize → Subscriptions** → confirm `premium_monthly` is Active with correct price
2. **Play Console → Monetize → In-app products** → confirm `premium_lifetime` is Active with correct price
3. **Play Console → Store listing** → confirm app name is "كم باقي - عد تنازلي"
4. **RevenueCat** (https://app.revenuecat.com) → **Offerings** → **Default** → confirm both Monthly and Lifetime packages have Google Play products attached

---

## FINAL REPORT FORMAT

```
SESSION 6 REPORT
================

TASK 0 — AAB Upload:
AAB downloaded from EAS: [YES / NO]
Uploaded to Play Console Internal Testing: [YES / NO]
Version: [1.0.0 / build 15]
Release status: [rolling out / draft / other]

TASK 1 — App Name Verification:
Store listing name: [correct / was changed to "كم باقي - عد تنازلي"]
Short description: [correct / updated]
Full description: [correct / updated]
App information name: [correct / changed / not editable]

TASK 2 — IAP Products:
premium_monthly:
  - Created: [YES / NO]
  - Type: Subscription
  - Base plan ID: [monthly-plan / other]
  - Price: [4.99 SAR/month]
  - Status: [Active / Inactive]
premium_lifetime:
  - Created: [YES / NO]
  - Type: One-time product
  - Price: [79.99 SAR]
  - Status: [Active / Inactive]

TASK 3 — Final Verification:
Play Console subscriptions: [OK / issue]
Play Console in-app products: [OK / issue]
Store listing name: [OK / issue]
RevenueCat offerings: [OK / issue]

BLOCKERS REMAINING:
[List anything still blocking, or "None — Android is ready for release"]
```

---

## DO NOT DO

- Do not touch App Store Connect — iOS is fully configured.
- Do not touch AdMob — all categories already blocked.
- Do not modify or delete existing RevenueCat products or offerings.
- Do not submit the app for review on either platform.
- Do not create products with IDs other than `premium_monthly` and `premium_lifetime`.
- Do not change the base plan ID — it MUST be `monthly-plan`.
- Do not change any developer account settings.
- Do not re-upload or re-submit the AAB.
