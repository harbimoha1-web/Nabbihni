# Browser Agent Instructions — Session 7
**For:** Claude browser agent
**Date:** 2026-04-01
**Written by:** THEBOLDS / m7zm
**Project:** كم باقي (Kam Baqi)

---

## READ THIS ENTIRE FILE BEFORE STARTING ANYTHING

This session has 1 task: Fix the lifetime subscription package in RevenueCat so it triggers Apple Pay correctly. The monthly subscription works. The lifetime does not. We suspect the package type is wrong.

**PAUSE PROTOCOL:** At points marked ⏸ PAUSE, stop and message Mohammad with the exact text shown. Do not continue until he replies.

---

## WHAT'S ALREADY DONE — DO NOT REDO

| Item | Status |
|------|--------|
| RevenueCat project created | ✅ Project ID: 9ea89f17 |
| iOS products added | ✅ premium_monthly + premium_lifetime |
| Android products added | ✅ premium_monthly + premium_lifetime |
| Default offering created | ✅ Has monthly + lifetime packages |
| Monthly package works | ✅ Triggers Apple Pay correctly |
| Lifetime package | ❌ Does NOT trigger Apple Pay — needs fixing |

---

## TASK 1 — Fix Lifetime Package Type in RevenueCat

**Where:** https://app.revenuecat.com/projects/9ea89f17/offerings
**Why:** Lifetime subscription doesn't trigger Apple Pay. The app code looks for `current.lifetime` which only works if the package type is "Lifetime" in RevenueCat.
**Condition:** None

### Steps:

1. Go to https://app.revenuecat.com/projects/9ea89f17/offerings
2. Click on the **Default** offering (or whatever the current default offering is named)
3. You should see the list of packages in this offering. Look for the lifetime package.
4. **READ and REPORT** the following for EVERY package in this offering:
   - Package name/identifier
   - Package type (e.g., "Monthly", "Lifetime", "Custom", "Annual", etc.)
   - Which products are attached (Apple product ID + Google product ID)
   - Any warnings or errors shown

⏸ PAUSE — Tell Mohammad:
> **RevenueCat Default Offering — Current State:**
>
> Package 1: [name] — Type: [type] — Products: [list]
> Package 2: [name] — Type: [type] — Products: [list]
> (list all packages)
>
> Waiting for instructions.

5. **After Mohammad confirms**, if the lifetime package type is NOT "Lifetime":
   - Look for an "Edit" button or click on the lifetime package
   - Change the package type to **"Lifetime"**
   - If you cannot change the type, you may need to:
     a. Delete the existing lifetime package from the offering
     b. Add a new package with type **"Lifetime"**
     c. Attach the same products to it:
        - Apple: `premium_lifetime`
        - Google: `premium_lifetime`
   - Save the changes

6. After making changes, go back to the offering and verify:
   - The lifetime package now shows type = **"Lifetime"**
   - Products are still attached (Apple + Google)

7. Also check: Go to https://app.revenuecat.com/projects/9ea89f17/product-catalog/products
   - Find the `premium_lifetime` product
   - Verify its **Product Identifier** matches exactly: `premium_lifetime`
   - Note the App Store Product ID (should be `premium_lifetime` or `com.nabbihni.premium.lifetime`)

⏸ PAUSE — Tell Mohammad:
> **Changes made:**
> - [what was changed]
>
> **Final state of Default Offering:**
> Package 1: [name] — Type: [type] — Products: [list]
> Package 2: [name] — Type: [type] — Products: [list]
>
> **Product catalog — premium_lifetime:**
> - Product Identifier: [value]
> - App Store Product ID: [value]
> - Play Store Product ID: [value]

---

## CLOSING SCAN (MANDATORY — DO THIS LAST)

After all tasks are done (or skipped/failed), do a FULL environment scan.
Visit each location below and report EXACTLY what you see.
Do NOT skip any item. Do NOT summarize. Report raw facts.

### A. Platform State (RevenueCat)

Navigate to https://app.revenuecat.com/projects/9ea89f17/overview
Report:
- Project name and status
- Any warnings, errors, or issues visible on the dashboard
- Number of active subscribers (if shown)

### B. What Changed This Session

List every change you made, in order:
- Page/URL where the change was made
- What the field was BEFORE (if you saw it)
- What you changed it TO
- Whether it saved successfully

### C. What Failed or Was Skipped

For each task that failed or was skipped:
- Task name
- What went wrong (exact error message if any)
- What you tried
- What would fix it

### D. What's Blocking Next Steps

List anything you can see that would prevent the next phase of work:
- Missing required fields
- Pending reviews or approvals
- Configuration issues

### E. Credentials & Access

Did you encounter any login issues, permission errors, or access problems?
Report each one with the exact error message.

### REPORT FORMAT

```
CLOSING SCAN — SESSION 7
==========================
Date: 2026-04-01
Project: Kam Baqi (كم باقي)
Tasks completed: X of 1

A. PLATFORM STATE:
RevenueCat: {status, warnings, errors}

B. CHANGES MADE:
1. {what changed} — {before → after} — {saved: yes/no}
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
- Do NOT create a new offering — only fix the existing Default offering
- Do NOT delete or modify the monthly package — it works correctly
- Do NOT change any product identifiers or pricing
- Do NOT touch any Android-specific settings unless explicitly told
- Do NOT modify any App Store Connect or Google Play Console settings
