# كم باقي — Complete Browser Launch Guide
**Written by THEBOLDS · All departments contributed · 2026-03-28**

---

## Before You Start — Keep These Open

| Item | Value |
|------|-------|
| Apple ID | harbimoha1@gmail.com |
| App Store ID | 6759000350 |
| Bundle ID | app.nabbihni.countdown |
| Store Copy File | Open in browser: `docs/store-copy.html` (same folder as this file) |
| RevenueCat Project | https://app.revenuecat.com/projects/9ea89f17 |

---

## CRITICAL ORDER: Do tasks in this sequence

```
[1] App Store Connect — Accept License Agreement   ← 2 min, BLOCKS iOS submit
[2] App Store Connect — EU DSA Compliance          ← 5 min, BLOCKS iOS submit
[3] App Store Connect — Verify IAPs                ← 5 min, verify both products
[4] App Store Connect — Update Store Listing       ← 10 min, paste approved copy
[5] Google Play — Set Up Merchant Account          ← 20-30 min, BLOCKS Android IAP
[6] Google Play — Create IAP Products              ← 10 min, after merchant account
[7] Google Play — Download play-store-key.json     ← 5 min, hand to me after
[8] Google Play — Update Store Listing             ← 10 min, paste approved copy
[9] RevenueCat — Link Android Products             ← 5 min, after task [6]
[10] Verify app-ads.txt is live                    ← 2 min, open URL in browser
[11] AdMob — Verify Halal Ad Blocking              ← 5 min
```

**Total estimated time: ~75 minutes**

---

## TASK 1 — App Store Connect: Accept License Agreement
**URL:** https://appstoreconnect.apple.com/agreements/paid/
**Time:** 2 minutes
**Blocks:** Nothing submits to App Store without this

### Steps:
1. Go to → https://appstoreconnect.apple.com
2. Login with `harbimoha1@gmail.com`
3. Top right → click your name/profile → **"Agreements, Tax, and Banking"**
4. Look for a **yellow banner** at the top: *"New Terms & Conditions"* or *"Action Required"*
5. Click **"Review and Sign"**
6. Scroll to bottom → click **"Agree"**
7. ✅ Done — banner disappears

> If you see no banner: the agreement is already accepted. Move on.

---

## TASK 2 — App Store Connect: EU DSA Compliance
**URL:** https://appstoreconnect.apple.com (same login)
**Time:** 5 minutes
**Blocks:** App Store submission in EU region

### Steps:
1. In App Store Connect → click on your app **"كم باقي"** (App ID: 6759000350)
2. Look for a banner saying **"Action Required"** or **"Complete EU Compliance"**
   - OR: left sidebar → **"App Information"** → scroll down to find DSA section
3. **Trader Status:** Select **"I am not a trader"**
   - You are an individual developer. Not a business selling physical goods.
4. Click **Save / Submit**
5. ✅ Done

> Apple asks this to comply with EU Digital Services Act. Answering "not a trader" is correct for individual developers.

---

## TASK 3 — App Store Connect: Verify IAP Products
**URL:** https://appstoreconnect.apple.com/apps/6759000350/distribution/inapppurchase
**Time:** 5 minutes
**Blocks:** Paywall showing correct prices

### Steps:
1. In App Store Connect → your app → left sidebar → **"In-App Purchases"**
2. You should see **two products:**

| Product ID | Type | Price | Expected Status |
|------------|------|-------|----------------|
| `premium_monthly` | Auto-Renewable Subscription | 4.99 SAR/month | Ready to Submit |
| `premium_lifetime` | Non-Consumable | 79.99 SAR | Ready to Submit |

3. If both exist with status **"Ready to Submit"** → ✅ Move on

### If a product is MISSING — Create it:

**Monthly (auto-renewable subscription):**
- Click **"+"** → Auto-Renewable Subscription
- Reference Name: `كم باقي المميز - شهري`
- Product ID: `premium_monthly`
- Subscription Group: Create new → name it `Premium`
- Duration: 1 Month
- Price: find the tier closest to **4.99 SAR**
- Localization (Arabic): Display Name: `كم باقي المميز`, Description: `بدون إعلانات، عدادات غير محدودة`
- Click Save → Submit for Review

**Lifetime (non-consumable):**
- Click **"+"** → Non-Consumable
- Reference Name: `كم باقي المميز - مدى الحياة`
- Product ID: `premium_lifetime`
- Price: find the tier closest to **79.99 SAR**
- Localization (Arabic): Display Name: `كم باقي مدى الحياة`, Description: `ادفع مرة واحدة، استخدمه للأبد`
- Click Save → Submit for Review

---

## TASK 4 — App Store Connect: Update Store Listing
**URL:** https://appstoreconnect.apple.com/apps/6759000350
**Time:** 10 minutes

> Open `docs/store-copy.html` in your browser to copy-paste from.

### Steps:
1. In App Store Connect → your app → **"App Information"** tab (left sidebar)
2. Under **Name:** paste →
   ```
   كم باقي - عد تنازلي
   ```
3. Under **Subtitle:** paste →
   ```
   عداد رمضان والعيد ومناسباتك
   ```
4. Under **Keywords:** paste →
   ```
   عد تنازلي,رمضان,عيد,اليوم الوطني,تقويم هجري,ودجت,مناسبات,عداد,countdown,timer
   ```
5. Click **Save**

6. Now click on **"1.0 Prepare for Submission"** (or current version)
7. Under **Description**, paste:
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

8. Under **What's New**, paste:
   ```
   مرحباً بكم في كم باقي! 🎉
   أول إصدار — نسعد بوجودكم معنا.
   شاركونا آراءكم لنطوّر التطبيق لكم. 💙
   ```

9. Scroll down and verify these URLs are set:
   - **Support URL:** `https://nabbihni.com/support.html`
   - **Marketing URL:** `https://nabbihni.com`
   - **Privacy Policy URL:** `https://nabbihni.com/privacy.html`

10. Click **Save**
11. ✅ Done

---

## TASK 5 — Google Play Console: Set Up Merchant Account
**URL:** https://play.google.com/console
**Time:** 20–30 minutes (verification is usually instant)
**Blocks:** ALL Android in-app purchases. Without this, the paywall does nothing on Android.

### Steps:
1. Go to → https://play.google.com/console
2. Click your app → left sidebar → **"Monetize"** section
3. Click **"Monetization setup"** (or you may see "Set up payments profile")
4. Click **"Get started"** — this opens Google Payments Center

### In Google Payments Center:
5. **Business type:** Individual (not Business)
6. **Country:** Saudi Arabia
7. **Currency:** SAR
8. **Full legal name:** (your full name as on national ID)
9. **Address:** (your Saudi address)
10. **Bank account:** Add your Saudi bank account
    - IBAN: SA followed by 22 digits
    - Bank name
    - Account holder name (must match your legal name exactly)
11. Click **Save & Continue**
12. Google may ask to verify your identity → upload national ID photo
13. ✅ Once submitted, you'll see: "Payments profile active"

> Verification is usually instant. In rare cases it takes up to 24 hours.

---

## TASK 6 — Google Play Console: Create IAP Products
**URL:** https://play.google.com/console → your app → Monetize → Products
**Time:** 10 minutes
**Requires:** Task 5 (merchant account) to be complete first

### Create Subscription (Monthly):
1. Left sidebar → **Monetize → Subscriptions** → **"Create subscription"**
2. **Product ID:** `premium_monthly`
   > ⚠️ This must be EXACTLY `premium_monthly` — the app's code looks for this exact ID
3. **Name:** كم باقي المميز - شهري
4. **Description:** بدون إعلانات وعدادات غير محدودة
5. Click **"Add base plan"**
6. Billing period: **Monthly**
7. Price: **4.99 SAR** (type it directly in the Saudi Arabia field)
8. Click **Activate** → then **Save**

### Create One-Time Purchase (Lifetime):
1. Left sidebar → **Monetize → In-app products** → **"Create product"**
2. **Product ID:** `premium_lifetime`
   > ⚠️ Must be EXACTLY `premium_lifetime`
3. **Name:** كم باقي المميز - مدى الحياة
4. **Description:** ادفع مرة واحدة، استخدمه للأبد
5. **Status:** Active
6. **Price:** Click Saudi Arabia → enter **79.99 SAR**
7. Click **Save**

---

## TASK 7 — Google Play Console: Download Service Account Key
**URL:** https://play.google.com/console → Setup → API access
**Time:** 10 minutes
**Why:** This file lets EAS automatically submit builds to Google Play so you don't have to upload manually.

### Steps:
1. Play Console → left sidebar bottom → **"Setup"** → **"API access"**
2. Click **"Link to a Google Cloud project"**
   - If no project exists: click "Create new project" → name it `kam-baqi-deploy`
   - If a project exists: link to it
3. Scroll down to **"Service accounts"** section → click **"Create new service account"**
4. Click the **"Google Cloud Console"** link that opens in a new tab

### In Google Cloud Console:
5. Click **"+ Create Service Account"**
6. **Name:** `eas-submit`
7. **Description:** EAS automated submission
8. Click **"Create and Continue"**
9. **Role:** Select **"Service Account User"**
10. Click **"+ Add Another Role"** → select **"Editor"**
11. Click **"Done"**
12. You're back at the service accounts list → click on `eas-submit`
13. Click **"Keys"** tab → **"Add Key"** → **"Create new key"** → **JSON**
14. File downloads automatically

### Back in Play Console:
15. Switch back to Play Console tab → refresh the page
16. The new service account appears → click **"Grant access"**
17. **Role:** Release Manager
18. Click **"Invite user"** → **Send invitation**

### Final Step:
19. Rename the downloaded JSON file to: `play-store-key.json`
20. Place it at: `C:\Users\TechTroniX\nabbihni\play-store-key.json`
21. Come back to Claude and say "done" — I'll handle the rest from terminal.

---

## TASK 8 — Google Play Console: Update Store Listing
**URL:** https://play.google.com/console → your app → Grow → Store presence → Main store listing
**Time:** 10 minutes

> Open `docs/store-copy.html` in your browser to copy-paste from.

### Steps:
1. Play Console → left sidebar → **"Grow"** → **"Store presence"** → **"Main store listing"**

2. **App name:** paste →
   ```
   كم باقي - عد تنازلي
   ```

3. **Short description** (80 chars max): paste →
   ```
   عداد رمضان والعيد واليوم الوطني — بالتقويم الهجري 🌙
   ```

4. **Full description:** paste the full Arabic description (same text as Task 4, step 7 above)

5. Scroll down → verify **Contact details:**
   - Email: `support@nabbihni.com`
   - Website: `https://nabbihni.com`
   - Privacy Policy: `https://nabbihni.com/privacy.html`

6. Click **Save**
7. ✅ Done

---

## TASK 9 — RevenueCat: Link Android Products
**URL:** https://app.revenuecat.com/projects/9ea89f17/product-catalog/products
**Time:** 5 minutes
**Requires:** Task 6 (Play Store products created) to be complete first

### Steps:
1. Login to RevenueCat → your project
2. Left sidebar → **"Product Catalog"** → **"Products"**
3. Find the Google Play monthly product → link it to `premium_monthly`
4. Find the Google Play lifetime product → link it to `premium_lifetime`
5. Left sidebar → **"Offerings"** → click **"Default"**
6. Verify the **Default offering** has exactly 2 packages:
   - Monthly package → links to `premium_monthly` on **both** App Store + Google Play
   - Lifetime package → links to `premium_lifetime` on **both** App Store + Google Play
7. ✅ Done

---

## TASK 10 — Verify app-ads.txt is Live
**Time:** 2 minutes

The file already exists in the project (`docs/app-ads.txt`).

### Just verify:
1. Open your browser
2. Go to: **https://nabbihni.com/app-ads.txt**
3. ✅ If you see text content (not a 404 page) → DONE, nothing to do
4. ❌ If you see a 404 → come back and tell me, I'll push it from terminal

---

## TASK 11 — AdMob: Verify Halal Ad Blocking
**URL:** https://admob.google.com
**Time:** 5 minutes

### Steps:
1. Login to AdMob → https://admob.google.com
2. Left sidebar → **"Blocking controls"** → **"All apps"**
3. Click on **"Sensitive categories"**
4. Make sure ALL of these are set to **"Block":**

| Category | Must be |
|----------|---------|
| Alcohol | BLOCKED |
| Gambling | BLOCKED |
| Dating | BLOCKED |
| Tobacco | BLOCKED |
| Lottery | BLOCKED |
| Music | BLOCKED |
| Loans | BLOCKED |
| Cryptocurrency | BLOCKED |
| Political | BLOCKED |
| Religious (non-Islamic) | BLOCKED |
| Sexual & Reproductive Health | BLOCKED |

5. Click **Save**
6. ✅ Done

---

## After All Tasks — Come Back to Claude

Once you're done, tell me and I'll run from terminal:

```bash
eas build --platform ios --profile production --auto-submit
eas build --platform android --profile production
eas submit --platform android --profile production
```

---

## Quick Reference

| # | Platform | Task | Time | Blocker? |
|---|----------|------|------|---------|
| 1 | App Store Connect | Accept License Agreement | 2 min | YES |
| 2 | App Store Connect | EU DSA Compliance | 5 min | YES |
| 3 | App Store Connect | Verify IAP Products | 5 min | Paywall |
| 4 | App Store Connect | Update Store Listing | 10 min | Store review |
| 5 | Google Play Console | Set Up Merchant Account | 30 min | YES |
| 6 | Google Play Console | Create IAP Products | 10 min | Android Paywall |
| 7 | Google Play Console | Download play-store-key.json | 10 min | Android Submit |
| 8 | Google Play Console | Update Store Listing | 10 min | Store review |
| 9 | RevenueCat | Link Android Products | 5 min | Android Paywall |
| 10 | nabbihni.com | Verify app-ads.txt | 2 min | AdMob Revenue |
| 11 | AdMob | Verify Halal Ad Blocking | 5 min | Compliance |

**Total: ~75 minutes**
