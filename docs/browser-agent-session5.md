# Browser Agent Instructions — Session 5
**For:** Claude browser agent
**Date:** 2026-03-30
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi) — Android Launch (continued from Session 4)

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

Session 4 completed the merchant account (Active) and created the service account but the session timed out before downloading the JSON key. This session picks up from there and finishes everything.

**You have 5 tasks. Do them in order. Do NOT skip ahead.**

**PAUSE PROTOCOL:** At points marked `⏸ PAUSE`, stop and message Mohammad with the exact text shown. Do not continue until he replies.

---

## WHAT'S ALREADY DONE — DO NOT REDO

| Item | Status | Details |
|------|--------|---------|
| Merchant account | ✅ ACTIVE | THEBOLDS, support@nabbihni.com, KAM BAQI |
| GCP project | ✅ CREATED | Project name: `nabbihni-play-console` |
| Service account | ✅ CREATED | `eas-submission@nabbihni-play-console.iam.gserviceaccount.com` |
| Service account key | ❌ NOT DONE | Session 4 timed out before clicking "Keys" tab |
| Play Console access for SA | ❌ NOT DONE | Service account not yet invited to Play Console |
| Google Play Android Developer API | ❌ UNKNOWN | May not have been enabled |
| IAP products | ❌ NOT DONE | `premium_monthly` and `premium_lifetime` not yet created |
| RevenueCat | ❌ NOT DONE | Android products not yet linked |

---

## TASK A — Enable the Google Play Android Developer API

**Where:** Google Cloud Console
**URL:** https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com?project=nabbihni-play-console
**Why:** Without this API enabled, the service account cannot communicate with Google Play at all. EAS submit will fail without it.

### Steps:

1. Go to: https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com?project=nabbihni-play-console

2. Make sure the project shown at the top is **`nabbihni-play-console`**. If it shows a different project, click the project selector dropdown and switch to `nabbihni-play-console`.

3. You will see the **"Google Play Android Developer API"** page.
   - If it says **"API enabled"** or shows a **"Manage"** button → it's already enabled. Skip to Task B.
   - If it shows an **"Enable"** button → click **"Enable"** and wait for it to activate (a few seconds).

4. Confirm the API is now enabled (page should show "API enabled" or redirect to the API dashboard).

---

## TASK B — Download the Service Account JSON Key

**Where:** Google Cloud Console → IAM → Service Accounts
**URL:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=nabbihni-play-console
**Why:** This JSON key file is what EAS uses to authenticate with Google Play to upload and submit builds.

### Steps:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=nabbihni-play-console

2. Make sure the project at the top says **`nabbihni-play-console`**.

3. You will see a list of service accounts. Find the row with:
   - **Name:** `eas-submission`
   - **Email:** `eas-submission@nabbihni-play-console.iam.gserviceaccount.com`

4. Click on the **email address** link (not the checkbox — click the email text itself). This opens the service account details page.

5. You will see tabs at the top: **Details**, **Permissions**, **Keys**, **Metrics**, **Logs**
   Click the **"Keys"** tab.

6. Click **"Add Key"** (it's a button, might say "+ Add Key" or have a dropdown).

7. Select **"Create new key"** from the dropdown.

8. A dialog appears asking for key type. Select **"JSON"** (not P12).

9. Click **"Create"**.

10. A JSON file will automatically download to your Downloads folder. The filename will be something like:
    `nabbihni-play-console-xxxxxxxxxxxx.json`
    Note the exact filename — you will tell Mohammad what it is.

11. You should see a confirmation message like "Private key saved to your computer" and the key now appears in the Keys list with a Key ID.

**⏸ PAUSE — Tell Mohammad:**

> Task B done. The service account JSON key has been downloaded.
>
> The file is in your Downloads folder. Look for a file named something like:
> `nabbihni-play-console-[some numbers and letters].json`
>
> Please do these 3 things right now:
> 1. Open your Downloads folder
> 2. Find the JSON file (it will be the most recently downloaded `.json` file)
> 3. **Rename** it to exactly: `play-store-key.json`
> 4. **Move** it to: `C:\Users\TechTroniX\nabbihni\play-store-key.json`
>
> Reply "key placed" when done.

Wait for Mohammad to say "key placed" before continuing.

---

## TASK C — Grant Service Account Access in Play Console

**Where:** Google Play Console → Users and permissions
**URL:** https://play.google.com/console
**Why:** The service account exists in Google Cloud but Play Console doesn't know about it yet. Without this, the service account has no permission to submit builds to the Play Store.

### Steps:

1. Go to: https://play.google.com/console

2. In the left sidebar, click **"Users and permissions"**
   - If you don't see it in the sidebar, look under **"Setup"** or try the direct URL approach

3. Click **"Invite new users"** (button, usually at the top right of the Users list).

4. In the **email address** field, type EXACTLY:
   ```
   eas-submission@nabbihni-play-console.iam.gserviceaccount.com
   ```
   Copy-paste this to avoid typos.

5. Now set permissions. You will see either:
   - **A role dropdown** → select **"Release manager"**
   - **OR a permissions checklist** → if you see granular permissions, check these:
     - ✅ View app information and download bulk reports
     - ✅ Create, edit, and delete draft apps
     - ✅ Release to production, exclude devices, and use Play App Signing
     - ✅ Release apps to testing tracks
     - ✅ Manage testing tracks and edit tester lists

6. Under **App access:**
   - If asked which apps → select **"All apps"** (so this works for future apps too)
   - If it defaults to all apps → leave it

7. Click **"Invite user"** or **"Send invitation"**.

8. Confirm the service account appears in the Users list with the correct role/permissions.

> **Note:** Unlike regular users, service accounts don't need to "accept" the invitation — the permissions take effect immediately.

---

## TASK D — Create IAP Products in Play Console

**Where:** Google Play Console → App → Monetize
**Why:** These are the two products the app sells. Without them, the paywall screen shows nothing.

### Part 1: Monthly Subscription (`premium_monthly`)

1. Play Console → click on app **كم باقي** (package: `app.nabbihni.countdown`)

2. Left sidebar → **Monetize** → **Subscriptions**
   - If you see a different nav structure, look for: **Monetize** → **Products** → **Subscriptions**

3. Click **"Create subscription"**

4. Fill in the subscription details:
   - **Product ID:** `premium_monthly`
     ⚠️ Type this EXACTLY. All lowercase. No spaces. No hyphens or underscores other than what's shown. This ID must match the code.
   - **Name:** `اشتراك شهري مميز`
   - **Description:** `عدادات غير محدودة بدون إعلانات`

5. Click **"Save"** (or it may auto-save)

6. Now you need to add a **base plan**:
   - Click **"Add base plan"** or **"Add plan"**
   - **Base plan ID:** leave as auto-generated, OR type `monthly-plan`
   - **Auto-renewing:** Yes (this should be the default)
   - **Billing period:** Select **"1 Month"**
   - **Price:** Click **"Set price"** or **"Set prices"**
     - A pricing dialog will appear
     - If it asks for a default price → enter **4.99** and select currency **SAR (Saudi Riyal)**
     - If it shows a price table for multiple countries → set Saudi Arabia to **4.99 SAR**, and let Google auto-convert for other countries (or click "Use default price" for all other countries)
   - **Free trial:** Do NOT enable. Leave it off.
   - **Grace period:** Leave as default
   - Click **"Save"** on the base plan

7. Back on the subscription page, click **"Activate"** to make the subscription live.
   - If it asks for confirmation → confirm
   - If it requires you to save first → save, then activate

8. Verify the subscription shows status: **Active**

### Part 2: Lifetime One-Time Purchase (`premium_lifetime`)

1. Left sidebar → **Monetize** → **In-app products**
   - If different nav: **Monetize** → **Products** → **In-app products**
   - This is a DIFFERENT section from Subscriptions — make sure you're in "In-app products", not "Subscriptions"

2. Click **"Create product"**

3. Fill in:
   - **Product ID:** `premium_lifetime`
     ⚠️ Type EXACTLY. All lowercase. Must match the code.
   - **Name:** `مدى الحياة - للأبد`
   - **Description:** `ادفع مرة واحدة واستخدمه للأبد`

4. Under **Pricing** (or "Managed product price"):
   - Click **"Set price"**
   - Enter **79.99** → currency **SAR (Saudi Riyal)**
   - If it shows a multi-country price table → set Saudi Arabia to **79.99 SAR**, let Google auto-convert for others
   - Click **"Apply"** or **"Save"**

5. Set status to **Active** (there may be a toggle or a separate "Activate" button)

6. Click **"Save"**

7. Verify the product shows status: **Active**

**⏸ PAUSE — Tell Mohammad:**

> Task D done. Both IAP products are created and active in Play Console:
>
> 1. `premium_monthly` — Subscription, 4.99 SAR/month ✅
> 2. `premium_lifetime` — One-time purchase, 79.99 SAR ✅
>
> Reply "continue" and I'll set up RevenueCat (Task E — the final task).

Wait for Mohammad to say "continue".

---

## TASK E — Link Android Products in RevenueCat

**Where:** RevenueCat dashboard
**URL:** https://app.revenuecat.com
**Why:** RevenueCat is the middleware that manages subscriptions across iOS and Android. The app code talks to RevenueCat, not directly to Play Store. Without linking these products, the Android app's paywall won't show any purchase options.

**RevenueCat project ID:** `9ea89f17`

### Steps:

1. Go to: https://app.revenuecat.com
   Log in if needed.

2. Make sure you're in the correct project. The project ID should be `9ea89f17`. You can check this in the URL — it should contain `/projects/9ea89f17/`.
   If you're in the wrong project → click the project switcher (top left) and select the correct one.

3. Left sidebar → **Product Catalog** → **Products**

4. You should see existing products (probably iOS products like `premium_monthly` and `premium_lifetime` for Apple).

5. **Add the first Android product:**
   - Click **"+ New"** or **"Add product"** or the **"+"** button
   - **App / Store:** Select the **Google Play** app (NOT the Apple one). It should show as the Android app with package `app.nabbihni.countdown`.
     - If you don't see a Google Play app listed, it means the Google Play app hasn't been added to this RevenueCat project yet. In that case:
       - Go to Project Settings → Apps → + New App
       - Select "Google Play Store"
       - App name: `كم باقي`
       - Package name: `app.nabbihni.countdown`
       - Save
       - Then come back to Products and try again
   - **Product identifier:** `premium_monthly`
   - Click **"Save"** or **"Add"**

6. **Add the second Android product:**
   - Click **"+ New"** again
   - **App / Store:** Select the **Google Play** app
   - **Product identifier:** `premium_lifetime`
   - Click **"Save"** or **"Add"**

7. **Now attach these products to the Default Offering:**
   - Left sidebar → **Product Catalog** → **Offerings**
   - Click on the **"Default"** offering (there should be one already)
   - You should see packages inside this offering. Likely:
     - A **Monthly** package (or `$rc_monthly`)
     - A **Lifetime** package (or `$rc_lifetime`)
   - Click on the **Monthly** package
     - You should see products attached (probably the iOS `premium_monthly` is already here)
     - Look for an **"Attach"** button or **"Add product"** option
     - Attach the Google Play `premium_monthly` product
     - Save
   - Click on the **Lifetime** package
     - Attach the Google Play `premium_lifetime` product
     - Save

8. Verify:
   - Default offering has 2 packages (Monthly + Lifetime)
   - Each package has 2 products (1 Apple + 1 Google Play)

**⏸ PAUSE — Tell Mohammad:**

> ALL TASKS COMPLETE. Here's the final status:
>
> ✅ Task A — Google Play Android Developer API: Enabled
> ✅ Task B — Service account JSON key: Downloaded (Mohammad placed as play-store-key.json)
> ✅ Task C — Service account granted Release Manager in Play Console
> ✅ Task D — IAP Products created:
>    - `premium_monthly` → 4.99 SAR/month (Active)
>    - `premium_lifetime` → 79.99 SAR (Active)
> ✅ Task E — RevenueCat:
>    - Both Google Play products added
>    - Both attached to Default offering
>
> **Android is now fully configured for monetization and build submission.**
>
> Remaining for Mohammad:
> 1. Add bank IBAN in Google Payments → "How you get paid" (needed before first payout)
> 2. Run builds in terminal:
>    - `eas build --platform ios --profile production --auto-submit`
>    - `eas build --platform android --profile production`
>    - After Android build: `eas submit --platform android --profile production`

---

## FINAL REPORT FORMAT

Report back in this exact format:

```
SESSION 5 REPORT
================

TASK A — Google Play Android Developer API:
Status: [ALREADY ENABLED / NEWLY ENABLED / FAILED - reason]

TASK B — Service Account JSON Key:
Status: [DONE / FAILED - reason]
Filename downloaded: [exact filename]
Mohammad confirmed key placed: [YES / NO]

TASK C — Play Console Access:
Status: [DONE / FAILED - reason]
Service account email invited: [full email]
Role assigned: [Release Manager / other]
App scope: [All apps / specific app]

TASK D — IAP Products:
Status: [DONE / FAILED - reason]
premium_monthly:
  - Created: [YES / NO]
  - Type: [Subscription]
  - Price: [4.99 SAR/month]
  - Status: [Active / Inactive]
premium_lifetime:
  - Created: [YES / NO]
  - Type: [In-app product]
  - Price: [79.99 SAR]
  - Status: [Active / Inactive]

TASK E — RevenueCat:
Status: [DONE / FAILED - reason]
Google Play app exists in RevenueCat: [YES / NO - had to create it]
premium_monthly added: [YES / NO]
premium_lifetime added: [YES / NO]
Default offering updated: [YES / NO]
Monthly package has Google Play product: [YES / NO]
Lifetime package has Google Play product: [YES / NO]

BLOCKERS REMAINING:
[List anything still blocking Android launch, or "None"]
```

---

## DO NOT DO

- Do not touch App Store Connect — iOS is fully configured.
- Do not touch AdMob — all categories already blocked.
- Do not modify or delete existing RevenueCat iOS products or offerings.
- Do not re-create the service account — it already exists.
- Do not re-submit the merchant account form — it's already Active.
- Do not submit the app for review on either platform.
- Do not create products with IDs other than `premium_monthly` and `premium_lifetime`.
- Do not change the developer account name, email, or any other profile settings.
- Do not change the GCP project name or create a new project.
