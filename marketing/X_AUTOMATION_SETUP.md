# Nabbihni - X/Twitter Automation Setup Guide

## Overview

This guide walks you through setting up automated daily countdown posts to X (Twitter) using Make.com.

**Total Cost**: $0/month (all free tiers)
**Setup Time**: ~2 hours

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAKE.COM SCENARIO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ TRIGGER │───→│ SHEETS  │───→│ BUILD   │───→│  POST   │  │
│  │ 9am AST │    │Get Data │    │ Tweet   │    │  to X   │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Required Accounts

### 1.1 Make.com Account
1. Go to https://make.com
2. Click "Get started free"
3. Sign up with email or Google
4. Verify your email
5. Free tier includes: 1,000 operations/month (plenty for daily posts)

### 1.2 X Developer Account
1. Go to https://developer.twitter.com
2. Sign in with your @NabbihniApp X account
3. Click "Sign up for Free Account"
4. Fill out the application:
   - **Use case**: "Posting automated countdown updates for my app"
   - **Will you tweet?**: Yes
   - **Will you use Retweets?**: No
   - **Will you use Likes?**: No

5. Accept the Developer Agreement
6. Create a Project:
   - Name: "Nabbihni Marketing"
   - Use case: "Making a bot"

7. Create an App within the project:
   - App name: "NabbihniBot"

8. Go to "Keys and Tokens" tab:
   - Generate **API Key and Secret**
   - Generate **Access Token and Secret**
   - Save all 4 values securely!

### 1.3 Google Account (for Sheets)
- Use your existing Google account
- We'll create a Google Sheet for the fun facts database

---

## Step 2: Create Google Sheets Database

### 2.1 Create New Spreadsheet
1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Name it: "Nabbihni - Tweet Database"

### 2.2 Sheet 1: Events Calendar
Name the first sheet tab "Events"

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| date | event_ar | emoji | hashtag | priority |
| 2026-02-17 | رمضان | 🌙 | #رمضان | 1 |
| 2026-02-22 | يوم التأسيس | 🏰 | #يوم_التأسيس | 2 |
| 2026-03-19 | عيد الفطر | 🎉 | #عيد_الفطر | 1 |
| 2026-06-06 | عيد الأضحى | 🐑 | #عيد_الأضحى | 1 |
| 2026-09-23 | اليوم الوطني | 🇸🇦 | #اليوم_الوطني_السعودي | 1 |

### 2.3 Sheet 2: Fun Facts Database
Create second sheet tab named "Facts"

Copy the data from `marketing/fun_facts_database.csv` into this sheet.

### 2.4 Sheet 3: Post Log
Create third sheet tab named "Log"

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| timestamp | event | fact_id | tweet_text |

---

## Step 3: Build Make.com Scenario

### 3.1 Create New Scenario
1. Log into Make.com
2. Click "Create a new scenario"
3. Name it: "Nabbihni Daily Tweet"

### 3.2 Module 1: Schedule Trigger
1. Click the "+" button
2. Search for "Schedule"
3. Select "Schedule" module
4. Configure:
   - **Run scenario**: At regular intervals
   - **Interval**: 1 day
   - **Time**: 09:00
   - **Advanced scheduling**: Click to expand
   - **Timezone**: Select "Asia/Riyadh" (UTC+3)

### 3.3 Module 2: Google Sheets - Get Events
1. Click "+" after Schedule
2. Search for "Google Sheets"
3. Select "Search Rows"
4. Connect your Google account
5. Configure:
   - **Spreadsheet**: Select "Nabbihni - Tweet Database"
   - **Sheet**: Events
   - **Filter**: Leave empty (get all rows)

### 3.4 Module 3: Set Variable - Calculate Nearest Event
1. Click "+"
2. Search for "Tools"
3. Select "Set Variable"
4. Configure:
   - **Variable name**: nearestEvent
   - **Variable value**: Use this formula logic in Make.com

```
// In Make.com, you'll use built-in date functions
// This pseudo-code shows the logic:

For each event in Events sheet:
  daysUntil = dateDiff(today, event.date)
  if daysUntil > 0 AND daysUntil < currentNearest:
    nearestEvent = event
```

### 3.5 Module 4: Google Sheets - Get Random Fact
1. Click "+"
2. Select "Google Sheets" > "Search Rows"
3. Configure:
   - **Sheet**: Facts
   - **Filter**:
     - event_ar = {{nearestEvent.event_ar}}
     - used = "No"
   - **Limit**: 1
   - **Sort**: Random

### 3.6 Module 5: Text Aggregator - Build Tweet
1. Click "+"
2. Search for "Tools"
3. Select "Text Aggregator" or "Set Variable"
4. Build the tweet text:

```
{{nearestEvent.emoji}} نبّهني على {{nearestEvent.event_ar}}؟

{{daysUntil}} يوم

💡 {{fact.fact_ar}}

📲 حمّل تطبيق "نبّهني"
🔗 https://onelink.to/nabbihni

{{nearestEvent.hashtag}} #نبهني
```

### 3.7 Module 6: Twitter - Create Tweet
1. Click "+"
2. Search for "Twitter"
3. Select "Create a Tweet"
4. Connect your X account:
   - Click "Add"
   - Enter your API credentials from Step 1.2
5. Configure:
   - **Text**: {{tweetText}}

### 3.8 Module 7: Google Sheets - Mark Fact Used
1. Click "+"
2. Select "Google Sheets" > "Update a Row"
3. Configure:
   - **Sheet**: Facts
   - **Row number**: {{fact.rowNumber}}
   - **used**: Yes
   - **used_date**: {{now}}

### 3.9 Module 8: Google Sheets - Log Post
1. Click "+"
2. Select "Google Sheets" > "Add a Row"
3. Configure:
   - **Sheet**: Log
   - **timestamp**: {{now}}
   - **event**: {{nearestEvent.event_ar}}
   - **fact_id**: {{fact.id}}
   - **tweet_text**: {{tweetText}}

---

## Step 4: Test the Scenario

### 4.1 Manual Test
1. Click "Run once" button
2. Watch each module execute
3. Check:
   - ✅ Schedule triggers
   - ✅ Events data fetched
   - ✅ Nearest event calculated
   - ✅ Random fact retrieved
   - ✅ Tweet text built correctly
   - ✅ Tweet posted to X
   - ✅ Fact marked as used
   - ✅ Log entry created

### 4.2 Verify on X
1. Go to your X profile
2. Check that the tweet posted correctly
3. Verify formatting looks good on mobile

### 4.3 Fix Any Issues
- If modules fail, check the error messages
- Common issues:
  - API credentials incorrect
  - Sheet permissions not granted
  - Date format mismatches

---

## Step 5: Activate the Scenario

### 5.1 Enable Scheduling
1. Click the toggle switch at bottom-left to turn ON
2. Scenario will now run daily at 9am AST

### 5.2 Error Notifications
1. Go to Scenario settings (gear icon)
2. Enable email notifications for failures
3. This alerts you if a post fails

---

## Step 6: Ongoing Maintenance

### Weekly Tasks
- [ ] Check X profile for posted tweets
- [ ] Review engagement metrics
- [ ] Add new fun facts to database as needed

### Monthly Tasks
- [ ] Update event dates for next year
- [ ] Reset "used" column for facts (allows reuse)
- [ ] Review and improve underperforming tweets

### Yearly Tasks
- [ ] Update Islamic calendar dates (they shift ~11 days/year)
- [ ] Add new Saudi events
- [ ] Refresh fun facts database

---

## Troubleshooting

### Tweet Not Posted
1. Check Make.com scenario history
2. Look for red (failed) executions
3. Click to see error details
4. Common fixes:
   - Regenerate X API tokens
   - Check rate limits
   - Verify tweet isn't duplicate

### Wrong Event Selected
1. Check Events sheet dates
2. Verify date format: YYYY-MM-DD
3. Check timezone settings

### No Facts Available
1. Check Facts sheet has entries for the event
2. Verify "used" column isn't all "Yes"
3. Reset used facts if needed

---

## Alternative: AI-Generated Tweets

If you prefer AI-generated variety, replace Module 5 with:

### OpenRouter API Module
1. Add "HTTP" > "Make a request"
2. Configure:
   - **URL**: `https://openrouter.ai/api/v1/chat/completions`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer YOUR_OPENROUTER_KEY
     Content-Type: application/json
     ```
   - **Body**:
     ```json
     {
       "model": "meta-llama/llama-3.1-8b-instruct:free",
       "messages": [
         {
           "role": "system",
           "content": "أنت مسوق سعودي. اكتب تغريدة قصيرة وجذابة بالعربي."
         },
         {
           "role": "user",
           "content": "اكتب تغريدة عن {{event}} (باقي {{days}} يوم). أضف معلومة مفيدة. اختم برابط [LINK] وهاشتاق #نبهني. لا تتجاوز 250 حرف."
         }
       ]
     }
     ```

### Get OpenRouter API Key (Free)
1. Go to https://openrouter.ai
2. Sign up
3. Get free API key
4. Free tier includes Llama 3.1 model

---

## App Store Links

Use these links in tweets:

- **Universal Link**: `https://onelink.to/nabbihni` (create at onelink.to)
- **App Store**: `https://apps.apple.com/app/nabbihni/id[YOUR_ID]`
- **Play Store**: `https://play.google.com/store/apps/details?id=app.nabbihni.countdown`

---

## Support

If you encounter issues:
1. Check Make.com documentation: https://www.make.com/en/help
2. X API documentation: https://developer.twitter.com/en/docs
3. Google Sheets API: https://developers.google.com/sheets

---

## Checklist

- [ ] Make.com account created
- [ ] X Developer account approved
- [ ] Google Sheet created with Events + Facts
- [ ] Make.com scenario built
- [ ] Test tweet posted successfully
- [ ] Scenario activated
- [ ] Error notifications enabled
