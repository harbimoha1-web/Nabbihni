# Browser Agent Instructions — Session 4
**For:** Claude browser agent
**Date:** 2026-03-30
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi) — Android Launch

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

This session has 4 tasks across 2 waves.

- **Tasks 1 and 2:** Do NOW, in order.
- **Tasks 3 and 4:** Do ONLY IF the merchant account from Task 1 comes back as "Active". If it's "Pending" or "Under review", skip Tasks 3 and 4 and note it in your report.

**PAUSE PROTOCOL:** At points marked `⏸ PAUSE`, stop and message Mohammad with the exact text shown. Do not continue until he replies.

**App package name:** `app.nabbihni.countdown`
**RevenueCat project ID:** `9ea89f17`

---

## CONTEXT: WHERE WE ARE

The merchant account form has already been opened. The form is pre-filled with Mohammad's personal name and address from his existing Google Payments profile. The following fields still need to be filled:

| Field | Value to enter |
|-------|---------------|
| Business name | `THEBOLDS` |
| Website | `nabbihni.com` |
| What do you sell | Select the option closest to **"Digital goods"** or **"Apps"** or **"Software"** |
| Customer support email | `support@nabbihni.com` |
| Credit card statement name | `KAM BAQI` |

---

## TASK 1 — Complete and Submit the Merchant Account Form

**Where:** Google Play Console — you should already be on this form.
If not: https://play.google.com/console → select app **كم باقي** → Monetize → Monetization setup / Set up payments profile

### Steps:

1. If you are not already on the merchant account form, navigate there now.

2. Fill in the fields using the exact values from the table above:
   - **Business name:** Type `THEBOLDS`
   - **Website:** Type `nabbihni.com`
   - **What do you sell:** Open the dropdown. Select the option that best matches "Digital goods", "Apps", "Software", or "Digital content". If you see "Apps and digital content" — select that. If you see multiple options, pick the one most relevant to a mobile app.
   - **Customer support email:** Type `support@nabbihni.com`
   - **Credit card statement name:** Type `KAM BAQI`

3. Double-check every field is filled correctly before submitting.

4. Click **Submit** (or **Save** / **Continue** — whatever the form's primary action button says).

5. Note the status shown after submission. It will say one of:
   - "Active" — merchant account is live immediately
   - "Pending" or "Under review" — Google is reviewing it (could take hours to days)
   - An error message — report it exactly

**⏸ PAUSE — Tell Mohammad:**

> Task 1 done. I submitted the merchant account form with these values:
> - Business name: THEBOLDS
> - Website: nabbihni.com
> - Support email: support@nabbihni.com
> - Statement name: KAM BAQI
>
> Status after submission: [exact status text you saw]
>
> [If Active]: Merchant account is live — I will proceed to Tasks 3 and 4 after Task 2.
> [If Pending/Under review]: Merchant account is under review. I will do Task 2 now, then skip Tasks 3 and 4. Those need a separate session after approval.
>
> Reply "continue" and I'll move to Task 2.

Wait for Mohammad to say "continue".

---

## TASK 2 — Service Account Key (play-store-key.json) — FULLY AUTONOMOUS

**Where:** Google Play Console → Setup → API access, then Google Cloud Console
**Why:** This JSON key allows EAS (Expo Application Services) to automatically submit Android builds to the Play Store without manual upload each time.

### Steps:

1. In Play Console, go to left sidebar → **Setup** → **API access**

2. Check if a Google Cloud project is already linked:
   - If you see "Linked to project: [project name]" → skip to step 3
   - If you see "This account is not linked to a Google Cloud project" → click **"Link to a new Google Cloud project"** and confirm

3. Scroll down to the **"Service accounts"** section.

4. Click **"Create new service account"**
   - A dialog will appear with a link saying **"Google Cloud Console"** — click that link. It opens in a new tab.

5. In the Google Cloud Console tab:
   - You should land on "Create service account" page
   - **Service account name:** `eas-submission`
   - **Service account ID:** leave as auto-filled (`eas-submission`)
   - Click **"Create and Continue"**
   - On "Grant this service account access to project" step → **skip it** (click Continue without selecting any role — Play Console handles its own permissions separately)
   - Click **"Done"**

6. You are now on the Service Accounts list. Find **`eas-submission`** in the list. Click on it.

7. Click the **"Keys"** tab.

8. Click **"Add Key"** → **"Create new key"**

9. Select **"JSON"** → click **"Create"**
   - A JSON file downloads automatically. Note the filename.

10. Go back to the **Play Console tab**.

11. Find the service accounts list — click **"Refresh"** or reload the page if needed.

12. Find **`eas-submission@...`** in the list → click **"Grant access"**

13. In the permissions dialog:
    - Role: **"Release manager"**
    - Click **"Invite user"** or **"Save"**

14. Confirm the service account appears in the list with **"Release manager"** role.

**⏸ PAUSE — Tell Mohammad:**

> Task 2 done. I created the `eas-submission` service account with Release Manager role.
>
> The JSON key was downloaded to your Downloads folder. The filename is something like `[project-name]-[numbers].json`.
>
> Please do these 3 things right now:
> 1. Open your Downloads folder and find that JSON file
> 2. Rename it to exactly: `play-store-key.json` (no spaces, no capitals, no other characters)
> 3. Move it to: `C:\Users\TechTroniX\nabbihni\play-store-key.json`
>
> Reply "key placed" when it's done.

Wait for Mohammad to say "key placed".

---

## TASK 3 — Play Console IAP Products (ONLY IF MERCHANT ACCOUNT IS ACTIVE)

**Condition:** ONLY do this if the merchant account status from Task 1 was **"Active"**. If it was "Pending" or "Under review" — skip this task and note it in your report.

### Part A — Monthly Subscription

1. Play Console → select app **كم باقي** → left sidebar → **Monetize** → **Subscriptions**
2. Click **"Create subscription"**
3. Fill in:
   - **Product ID:** `premium_monthly` ← type EXACTLY as shown, all lowercase
   - **Name:** `اشتراك شهري مميز`
   - **Description:** `عدادات غير محدودة بدون إعلانات`
4. Click **"Add a base plan"**
5. Base plan settings:
   - **Billing period:** Monthly
   - **Price:** Click "Set price" → enter **4.99** → currency **SAR (Saudi Riyal)**
   - Do NOT enable free trial
6. Click **"Save"**
7. Click **"Activate"**
8. Confirm it shows status: **Active**

### Part B — Lifetime One-Time Purchase

1. Left sidebar → **Monetize** → **Products** → **In-app products**
2. Click **"Create product"**
3. Fill in:
   - **Product ID:** `premium_lifetime` ← type EXACTLY as shown, all lowercase
   - **Name:** `مدى الحياة - للأبد`
   - **Description:** `ادفع مرة واحدة واستخدمه للأبد`
4. Under Pricing → set to **79.99 SAR**
5. Click **"Save"**
6. Confirm status is **Active**

---

## TASK 4 — RevenueCat: Link Android Products (ONLY AFTER TASK 3 IS DONE)

**Condition:** Only do this if Task 3 completed successfully.
**URL:** https://app.revenuecat.com/projects/9ea89f17/product-catalog/products

### Steps:

1. Go to: https://app.revenuecat.com
2. Log in if needed. Navigate to project **9ea89f17** (may auto-load).
3. Left sidebar → **Product Catalog** → **Products**
4. Click **"+ New"** or **"Add product"**
5. First product:
   - Store: **Google Play**
   - Product identifier: `premium_monthly`
   - Type: **Subscription**
   - Save
6. Click **"+ New"** again
7. Second product:
   - Store: **Google Play**
   - Product identifier: `premium_lifetime`
   - Type: **Non-consumable** (one-time purchase)
   - Save

8. Left sidebar → **Offerings** → click **"Default"** offering
9. For each package:
   - Click **Monthly** package → attach `premium_monthly` (Google Play) if not already attached
   - Click **Lifetime** package → attach `premium_lifetime` (Google Play) if not already attached
10. Save the offering.

**⏸ PAUSE — Tell Mohammad:**

> Task 4 done. Both Android products are linked in RevenueCat and attached to the default offering.
>
> The app will now load correct pricing on Android once the build is submitted.
>
> Reply "confirmed" and I'll write my final report.

---

## FINAL REPORT FORMAT

When all tasks are done (or skipped with reason), report back in this exact format:

```
SESSION 4 REPORT
================

TASK 1 — Merchant Account:
Status: [DONE / FAILED - reason]
Merchant account status shown after submit: [exact text]

TASK 2 — Service Account (play-store-key.json):
Status: [DONE / FAILED - reason]
Service account email: [full email address of the service account]
JSON key downloaded: [YES / NO]
Mohammad confirmed key placed: [YES / NO]

TASK 3 — Play Console IAP Products:
Status: [DONE / SKIPPED - merchant pending / FAILED - reason]
premium_monthly created and active: [YES / NO / SKIPPED]
premium_lifetime created and active: [YES / NO / SKIPPED]

TASK 4 — RevenueCat Android:
Status: [DONE / SKIPPED / FAILED - reason]
Both Google Play products added to RevenueCat: [YES / NO / SKIPPED]
Default offering updated: [YES / NO / SKIPPED]

BLOCKERS REMAINING:
[List anything still blocking the Android launch]
```

---

## DO NOT DO

- Do not touch App Store Connect — iOS is fully configured.
- Do not touch AdMob — all categories are already blocked.
- Do not change existing RevenueCat iOS products or offerings.
- Do not submit the app for review on either platform.
- Do not create products with IDs other than `premium_monthly` and `premium_lifetime` — these must match the code exactly.
- Do not change the developer account name, email, or any other profile settings.
