# Browser Agent Instructions — Session 9
**For:** Claude browser agent
**Date:** 2026-04-02
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi)

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

## CONTEXT

You are submitting an iOS app called "كم باقي" (Kam Baqi) to the App Store for review. It's an Arabic countdown app — users create countdowns for events (salary, Eid, trips, etc.) with themes, widgets, notes, and tasks. It has optional email/password login with cloud sync, a free tier with ads (AdMob), and a premium subscription via RevenueCat (monthly 4.99 SAR, lifetime 79.99 SAR). The app is built with React Native + Expo.

**Current state on App Store Connect:**
- App ID: 6759000350
- Version: 1.0.0
- Build 37 was uploaded to App Store Connect — it should be processed and ready to select
- 7 screenshots are already uploaded (iPhone 6.5" display)
- Description, keywords, support URL, What's New are already filled
- App Review notes are already filled ("No sign-in required. All features accessible without an account.")
- The app is FREE with in-app purchases
- Copyright: 2026 THEBOLDS

**PAUSE PROTOCOL:** At points marked ⏸ PAUSE, stop and message Mohammad with the exact text shown. Do not continue until he replies.

---

## TASK: Change app name + select build + submit for review

### Step 1: Change the App Store Name

1. Go to https://appstoreconnect.apple.com/apps/6759000350
2. In the left sidebar, click **"App Information"** (under "General")
3. Find the **"Name"** field — it currently says "كم باقي"
4. Change it to: **كم باقي - عد تنازلي**
5. Click **Save** at the top right
6. If "App Information" doesn't have the Name field, try: left sidebar → **App Store** tab → look for the Name field on the version page
7. Confirm the name saved successfully

### Step 2: Select Build 37

1. In the left sidebar, click **"App Store"** (under your app)
2. You should see the version page for 1.0.0 (or "Prepare for Submission")
3. Scroll down to the **Build** section — it should show "Add Build" or a "+" button
4. Click it — a popup will show available builds
5. Select **build 37** (version 1.0.0, uploaded April 2, 2026)
6. If build 37 is NOT listed:
   - It might still be processing — wait 5 minutes and refresh
   - Or check the **TestFlight** tab to see if build 37 appears there with status "Ready to Submit"
   - Report the issue if it's not available
7. After selecting, click **Done** or **Save**

### Step 3: Handle Compliance Questions

After selecting the build, Apple may ask compliance questions:

**Export Compliance (Encryption):**
- "Does your app use encryption?" → **Yes**
- "Does your app qualify for any of the exemptions?" → **Yes, it qualifies for the standard encryption exemption**
- The app only uses HTTPS (standard web encryption) — this qualifies for the exemption
- If it asks for an exemption document, select: **"Uses standard encryption protocols (HTTPS/TLS)"**

**Advertising Identifier (IDFA):**
- If asked "Does this app use the Advertising Identifier (IDFA)?" → **Yes**
- Purpose: **"Serve advertisements within the app"** (the app uses Google AdMob)
- Also check: **"Attribute an installation to a previously served advertisement"** if available

### Step 4: Final Verification

Before clicking submit, scroll through the ENTIRE version page and verify:

| Field | Expected Value |
|-------|---------------|
| Name | كم باقي - عد تنازلي |
| Subtitle | Should be filled (Arabic) |
| Screenshots | 7 uploaded (iPhone display) |
| Description | Filled with Arabic text |
| Keywords | Filled |
| Support URL | https://nabbihni.com/support.html |
| Marketing URL | https://nabbihni.com |
| Build | 37 (1.0.0) |
| Price | Free |
| In-App Purchases | Should show premium_monthly + premium_lifetime |
| App Review Notes | "No sign-in required..." |
| Age Rating | Should be set |
| Copyright | 2026 THEBOLDS |
| Version | 1.0 |

If ANY required field is empty or shows an error, **report it before submitting**.

⏸ PAUSE — Tell Mohammad:
> **Pre-submission checklist:**
> - Name: [current value]
> - Build: [selected or not]
> - Screenshots: [count]
> - All fields verified: [yes/no, list any issues]
> - Compliance questions answered: [yes/no]
>
> Ready to submit. Waiting for your go-ahead.

### Step 5: Submit for Review

1. Click **"Submit for Review"** — blue button at the top right of the page
2. If it asks additional questions before submitting:
   - "Is this app designed for children?" → **No**
   - "Does this app access third-party content?" → **No** (the content is user-generated locally + our public events)
   - Content rights: **"This app does not contain, show, or access third-party content"**
3. Confirm the submission
4. The status should change to **"Waiting for Review"**

### Step 6: Report Back

Tell Mohammad:
- Name changed to "كم باقي - عد تنازلي": yes/no?
- Build 37 selected: yes/no?
- Any compliance questions asked and how you answered them
- Submission status: "Waiting for Review" / error?
- Any warnings, errors, or missing fields?
- The exact text of the app status after submission

---

## CLOSING SCAN (MANDATORY — DO THIS LAST)

### A. Platform State

Navigate to the app overview on App Store Connect.
Report:
- App status (Waiting for Review / In Review / etc.)
- Version and build number shown
- Any warnings or issues

### B. What Changed This Session

List every change you made:
- Field changed, old value → new value
- Whether it saved successfully

### C. What Failed or Was Skipped

For each issue:
- What went wrong
- Exact error message
- What would fix it

### D. What's Blocking

List anything preventing review:
- Missing fields
- Build issues
- Policy problems

### E. Credentials & Access

Any login issues or permission errors?

### REPORT FORMAT

```
CLOSING SCAN — SESSION 9
==========================
Date: 2026-04-02
Project: Kam Baqi (كم باقي)
Tasks completed: X of 1

A. PLATFORM STATE:
App Store Connect: {status, version, build}

B. CHANGES MADE:
1. {what changed} — {before → after} — {saved: yes/no}

C. FAILED/SKIPPED:
(or "None")

D. BLOCKERS:
(or "None")

E. ACCESS ISSUES:
(or "None")
```

---

## DO NOT DO
- Do NOT change the app description, keywords, or subtitle — they're already set
- Do NOT change the screenshots or their order — they're already uploaded and approved
- Do NOT change the price or in-app purchase settings
- Do NOT modify any other version or build settings
- Do NOT change anything on Google Play Console — this session is iOS only
