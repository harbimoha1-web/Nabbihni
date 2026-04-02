# Browser Agent Instructions — Session 8
**For:** Claude browser agent
**Date:** 2026-04-02
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi)

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

This session has 2 major tasks:
1. Upload 7 App Store screenshots to App Store Connect
2. Upload 7 Play Store screenshots to Google Play Console

**PAUSE PROTOCOL:** At points marked ⏸ PAUSE, stop and message Mohammad with the exact text shown. Do not continue until he replies.

---

## WHAT'S ALREADY DONE — DO NOT REDO

| Item | Status |
|------|--------|
| App Store Connect listing (name, description, keywords, URLs) | ✅ Complete |
| Google Play Console listing (name, descriptions) | ✅ Complete |
| iOS build 37 submitted to App Store Connect | ✅ (or in progress — check) |
| Android AAB built (versionCode 17) | ✅ Built but NOT yet in Play Console |
| Screenshot files generated (7 PNGs, 1320×2868px) | ✅ Ready to upload |
| Privacy policy hosted | ✅ https://nabbihni.com/privacy.html |

## ⚠️ KNOWN ISSUE — ANDROID SUBMISSION

EAS auto-submit to Google Play FAILED because the service account is missing app-level permissions.
**You must fix the permissions AND manually upload the AAB in Task 2.**

The AAB download link: https://expo.dev/artifacts/eas/eegAnGVTScZj2EHA27YfLK.aab

---

## SCREENSHOT FILES TO UPLOAD

The 7 screenshots are at this URL pattern (Mohammad will provide the files):
Upload them in THIS EXACT ORDER (this is the App Store display order):

| Order | Filename | Arabic Headline | What it Shows |
|-------|----------|-----------------|---------------|
| 1 | 01_home.png | كم باقي؟ | Home screen with countdown cards |
| 2 | 02_widget.png | دايم قدّام عينك | Widget on iPhone home screen |
| 3 | 03_salary.png | باقي كم للراتب؟ | Salary countdown setup |
| 4 | 04_explore.png | لا تفوّتك مناسبة | Public events (GTA VI, Eid, etc.) |
| 5 | 05_detail.png | أكثر من مجرد عداد | Countdown detail with notes/tasks |
| 6 | 06_create.png | صمّمه على كيفك | Create countdown screen |
| 7 | 07_celebration.png | حان الوقت! | Celebration when countdown ends |

---

## TASK 0 — Fix Google Play Service Account Permissions

**Where:** https://play.google.com/console
**Why:** EAS auto-submit failed because the service account doesn't have app-level permissions
**Condition:** Do this FIRST before any Play Console tasks

### Steps:

1. Go to https://play.google.com/console
2. In the left sidebar, click **Users and permissions** (at the bottom, under Settings)
3. Find the service account: `eas-submission@nabbihni-play-console.iam.gserviceaccount.com`
   - If you don't see it, click **Invite new users** and add this email
4. Click on the service account email
5. Under **App permissions** tab:
   - Click **Add app**
   - Select the app "نبهني" (or "كم باقي - عد تنازلي", package: app.nabbihni.countdown)
   - Grant these permissions: **Release to production, pre-production, and exclude devices**, **Manage store presence**
   - OR simply grant **Admin** access for this app
6. Click **Save changes** / **Invite user** / **Apply**
7. Wait for the confirmation message

⏸ PAUSE — Tell Mohammad:
> **Service account permissions updated:**
> - Account: eas-submission@nabbihni-play-console.iam.gserviceaccount.com
> - App permissions granted: [list what was granted]
> - Any errors: [list or "None"]
>
> Waiting for instructions.

---

## TASK 1 — Upload Screenshots to App Store Connect

**Where:** https://appstoreconnect.apple.com
**App:** كم باقي (App ID: 6759000350)
**Condition:** None — do this first

### Steps:

1. Go to https://appstoreconnect.apple.com
2. Click on "My Apps"
3. Click on "كم باقي" app
4. Click on "App Store" tab (left sidebar)
5. You should see the current version (1.0.0) or "Prepare for Submission"
6. Scroll down to the **Screenshots** section
7. Look for **iPhone 6.7" Display** or **iPhone 6.9" Display** (this is the required size)
   - If you see both 6.7" and 6.9", upload to the LARGER one (6.9" / iPhone 16 Pro Max)
   - The smaller sizes will auto-generate from the largest
8. Click the "+" or drag-and-drop area to upload screenshots
9. Upload all 7 screenshots IN ORDER (01 first, 07 last)
10. Wait for all uploads to complete
11. Verify the order matches: كم باقي؟ → دايم قدّام عينك → باقي كم للراتب؟ → ... → حان الوقت!
12. If order is wrong, drag to reorder

⏸ PAUSE — Tell Mohammad:
> **App Store Connect — Screenshots uploaded:**
> - Display size used: [6.7" / 6.9"]
> - Number uploaded: [X] of 7
> - Order correct: [Yes/No]
> - Any errors: [list or "None"]
>
> Waiting for instructions.

13. After Mohammad confirms, scroll down and verify these fields are filled:
    - Description: Should have Arabic text
    - Keywords: Should be filled
    - Support URL: Should be filled
    - Marketing URL: Optional
    - What's New: Should have text

14. **DO NOT click "Submit for Review" yet** — we need to verify the build is processed first

---

## TASK 2 — Upload AAB + Screenshots to Google Play Console

**Where:** https://play.google.com/console
**App:** كم باقي - عد تنازلي (app.nabbihni.countdown)
**Condition:** Complete Task 0 and Task 1 first

### Part A: Upload New AAB (versionCode 17)

1. Download the AAB file from: https://expo.dev/artifacts/eas/eegAnGVTScZj2EHA27YfLK.aab
   - Save it somewhere accessible (e.g., Downloads folder)
2. Go to https://play.google.com/console
3. Select the app
4. In left sidebar, go to **Release** → **Testing** → **Internal testing**
   (or **Release** → **Production** if Mohammad confirms)
5. Click **Create new release**
6. Upload the AAB file you downloaded
7. Wait for it to process (may take 1-2 minutes)
8. Set release name to "1.0.0 (17)" or leave default
9. Add release notes (Arabic): "إصدار جديد مع مزامنة سحابية وتحسينات"
10. Click **Save** (do NOT click Review/Rollout yet — wait for Mohammad)

### Part B: Upload Screenshots

1. In left sidebar, go to **Grow** → **Store presence** → **Main store listing**
   (or **Store presence** → **Main store listing**)
2. Scroll down to **Graphics** section
3. Look for **Phone screenshots** section
4. Click "Add image" or the upload area
5. Upload all 7 screenshots IN ORDER (01 first, 07 last)
6. Wait for all uploads to complete
7. Verify the order matches the App Store order
8. If order is wrong, drag to reorder

⏸ PAUSE — Tell Mohammad:
> **Google Play Console — Screenshots uploaded:**
> - Section used: [Phone screenshots]
> - Number uploaded: [X] of 7
> - Order correct: [Yes/No]
> - Any errors: [list or "None"]
>
> Waiting for instructions.

11. After Mohammad confirms, click **Save** (or "Save draft")
12. Verify the save was successful (look for green checkmark or success message)

---

## TASK 3 (OPTIONAL) — Check Store Readiness

Only do this if Mohammad asks. Check these items:

### App Store Connect:
- [ ] Screenshots uploaded (7 for iPhone 6.7"/6.9")
- [ ] Build is processed and selectable
- [ ] App description filled
- [ ] Keywords filled
- [ ] Support URL filled
- [ ] Privacy Policy URL filled
- [ ] Content rights: "No third-party content"
- [ ] Age Rating: Completed
- [ ] Price: Free

### Google Play Console:
- [ ] Screenshots uploaded (7 phone screenshots)
- [ ] App description filled (Arabic)
- [ ] Short description filled
- [ ] Privacy policy URL: https://nabbihni.com/privacy.html
- [ ] Content rating: Completed
- [ ] Target audience: Set
- [ ] Store listing status: Not "Draft" errors
- [ ] Release track: Internal testing or Production

---

## CLOSING SCAN (MANDATORY — DO THIS LAST)

After all tasks are done (or skipped/failed), do a FULL environment scan.

### A. Platform State

**App Store Connect:**
Navigate to the app's App Store tab.
Report:
- Current version and build number visible
- Screenshot count per display size
- Any warnings or issues shown
- Submission readiness status (ready / not ready / what's missing)

**Google Play Console:**
Navigate to the app's dashboard.
Report:
- Current release status (draft / internal testing / production)
- Screenshot count
- Any warnings, errors, or policy issues
- Store listing completeness percentage (if shown)

### B. What Changed This Session

List every change you made, in order:
- Page/URL where the change was made
- What you uploaded or changed
- Whether it saved successfully

### C. What Failed or Was Skipped

For each task that failed or was skipped:
- Task name
- What went wrong (exact error message if any)
- What you tried
- What would fix it

### D. What's Blocking Next Steps

List anything preventing submission:
- Missing required fields
- Pending reviews or approvals
- Build processing issues
- Policy compliance issues

### E. Credentials & Access

Did you encounter any login issues, permission errors, or access problems?
Report each one with the exact error message.

### REPORT FORMAT

```
CLOSING SCAN — SESSION 8
==========================
Date: 2026-04-02
Project: Kam Baqi (كم باقي)
Tasks completed: X of 2 (or 3)

A. PLATFORM STATE:
App Store Connect: {status, screenshots, readiness}
Google Play Console: {status, screenshots, readiness}

B. CHANGES MADE:
1. {what changed} — {saved: yes/no}
2. ...

C. FAILED/SKIPPED:
1. {task} — {reason} — {fix needed}
(or "None")

D. BLOCKERS:
1. {blocker} — {what's needed}
(or "None")

E. ACCESS ISSUES:
(or "None")
```

---

## DO NOT DO
- Do NOT change the app name, description, or keywords — they're already set
- Do NOT submit the iOS app for review — wait for Mohammad's explicit instruction
- Do NOT promote the Android app to production — wait for Mohammad's instruction
- Do NOT change any pricing or IAP settings
- Do NOT modify any build or version settings
- Do NOT delete existing screenshots if any — add new ones alongside or replace
