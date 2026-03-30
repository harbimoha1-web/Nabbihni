# Browser Agent Instructions — Session 2
**For:** Claude browser agent
**Date:** 2026-03-28
**Written by:** THEBOLDS / m7zm

You are completing 3 tasks. Read every word before starting. Do not skip steps. Report exactly what you see.

---

## CONTEXT: WHAT THE LAST SESSION DID

The previous browser session updated the App Store Connect listing but failed to save the description with emojis — Apple's validation rejected them during the paste operation. Everything else in App Store Connect is already done. You are here to fix the description, verify "What's New", and check AdMob blocking.

---

## TASK 1 — Fix App Store Description (with emojis)
**URL:** https://appstoreconnect.apple.com/apps/6759000350
**Priority:** CRITICAL

### Step-by-step:

1. Go to: https://appstoreconnect.apple.com
2. Log in if needed.
3. Click on the app **كم باقي - عد تنازلي** (App ID: 6759000350)
4. In the left sidebar, click **"App Store"** → then the current version (should say "1.0 - Prepare for Submission" or similar)
5. Scroll down until you see the **"Description"** text area field.
6. Click inside the Description field to focus it.
7. Press **Ctrl+A** to select all existing text.
8. Press **Delete** or **Backspace** to clear it completely.
9. Now type or paste the following text EXACTLY as shown below — emojis included.

### ⚠️ EMOJI PASTE STRATEGY
The previous agent failed because it pasted all text at once and Apple's live validation triggered an error. Use this approach instead:
- Click inside the empty Description field
- Paste the full text below using the clipboard (Ctrl+V)
- If validation error appears immediately: do NOT click Save yet. Click somewhere else on the page (outside the field), wait 2 seconds, click back into the field, then try again.
- If it still fails: type the non-emoji lines first, then position cursor at each emoji location and insert the emoji character individually using the emoji keyboard or by copying one emoji at a time.

### DESCRIPTION TEXT (paste this exactly):

```
عندك لحظة تنتظرها؟ أنشئ لها عداداً.
الراتب. التخرج. السفر. الخطوبة. أي شيء يهمّك.
جاهز في ثوانٍ — بالثانية. 🌙

- - - - - - - - - - - - - - -

اختر الاسم، الإيموجي، والثيم — وابدأ العد فوراً.
عداد حي يعرض الأيام والساعات والدقائق والثواني.

وإذا كنت تنتظر مناسبة سعودية كبرى،
رمضان، العيد، اليوم الوطني، يوم التأسيس — كلها جاهزة بنقرة.

🎁 ودجت مجاني على شاشتك — بدون ما تفتح التطبيق.
📅 هجري + ميلادي — تلقائياً، بدون حسابات.
🎉 احتفل باللحظة — شارك اللحظة مع من تحب.
🎨 خمسة ثيمات — خصّص كل عداد بلونه.

- - - - - - - - - - - - - - -

كم باقي المميز:
بدون إعلانات. عدادات غير محدودة. ثيمات حصرية.

شهري: 4.99 ر.س
مدى الحياة: 79.99 ر.س — ادفع مرة، استخدمه للأبد.

صُنع بعناية، للعربي أينما كان.
```

10. After pasting, **do not click Save yet.**
11. Scroll through the text and visually confirm these emoji characters appear: 🌙 🎁 📅 🎉 🎨
12. If all 5 emojis are visible in the field → click **Save** at the top right.
13. If emojis are missing or replaced with boxes → report what you see, do not save.

### Success criteria:
- Description field contains the full Arabic text
- All 5 emoji characters are visible: 🌙 🎁 📅 🎉 🎨
- Page shows "Saved" confirmation without error

---

## TASK 2 — Verify and Save "What's New" Text
**URL:** Same page (version listing in App Store Connect)
**Priority:** HIGH

While still on the version page, scroll to find the **"What's New"** field (also called "Version Release Notes").

1. Check what text is currently in the "What's New" field.
2. If it already contains the text below → ✅ leave it, report as already done.
3. If it is empty OR contains different text → clear it and paste the following:

### WHAT'S NEW TEXT (paste this exactly):

```
مرحباً بكم في كم باقي! 🎉
أول إصدار — نسعد بوجودكم معنا.
شاركونا آراءكم لنطوّر التطبيق لكم. 💙
```

4. Click **Save**.
5. Confirm the emoji 🎉 and 💙 are visible in the field.

### Success criteria:
- "What's New" contains the 3-line Arabic text with both emojis visible
- Saved without error

---

## TASK 3 — AdMob: Block Missing Sensitive Categories
**URL:** https://admob.google.com
**Priority:** MEDIUM

The last session confirmed 7 categories were blocked. The following categories were NOT confirmed. Check each one and block it if not already blocked.

### Steps:
1. Go to: https://admob.google.com
2. Log in.
3. In the left sidebar → click **"Blocking controls"**
4. Click **"All apps"** (not a specific app — this applies globally)
5. Click **"Sensitive categories"**
6. Find each category in the list below. If it is NOT blocked, click to block it.

### Categories to check and block if not already blocked:

| Category name | Action if not blocked |
|--------------|----------------------|
| Alcohol | BLOCK IT |
| Gambling | BLOCK IT |
| Tobacco | BLOCK IT |
| Lotteries | BLOCK IT |
| Music | BLOCK IT |
| Personal loans | BLOCK IT |
| Cryptocurrencies & Related | BLOCK IT |

7. After reviewing all 7, click **Save** (if any changes were made).

### Note:
Some category names may appear slightly different in the interface (e.g., "Lotteries" vs "Lottery"). Block anything that matches the intent.

### Success criteria:
- All 7 categories above are confirmed as blocked
- Report which ones were already blocked and which ones you newly blocked

---

## REPORT FORMAT

When done, report back in this exact format:

```
TASK 1 — Description with emojis:
[DONE / FAILED / PARTIAL]
Details: [what happened]
Emojis visible: [YES / NO — which ones]

TASK 2 — What's New:
[DONE / ALREADY DONE / FAILED]
Details: [what happened]

TASK 3 — AdMob blocking:
Already blocked: [list]
Newly blocked: [list]
Could not find: [list]
```

---

## DO NOT DO

- Do not change the app name, subtitle, keywords, or URLs — those are already correct from the last session.
- Do not submit the app for review — only save the listing fields.
- Do not touch anything in Google Play Console — that is for a different session.
- Do not change any pricing or IAP settings.
