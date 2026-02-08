# Database Setup Guide

## 🎯 Goal
Set up Supabase database for caching Google Places API results

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `texas-home-services`
   - **Database Password:** Create a strong password and **SAVE IT**
   - **Region:** Choose closest to you (e.g., `US West` if in Texas)
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

---

## Step 2: Run SQL Schema

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the ENTIRE contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see: **"Success. No rows returned"**

### Verify Tables Created:

Run this query to verify:

```sql
SELECT 
  'businesses' as table_name, COUNT(*) as count FROM businesses
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'search_results', COUNT(*) FROM search_results
UNION ALL
SELECT 'search_cache', COUNT(*) FROM search_cache;
```

Expected output: 4 rows showing count of 0 for each table

---

## Step 3: Get API Keys

1. In Supabase, click **"Settings"** → **"API"** in left sidebar
2. Find and copy these two values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **service_role key (secret):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...  (very long string)
   ```

   ⚠️ **IMPORTANT:** Use the `service_role` key, NOT the `anon` key!

---

## Step 4: Update Environment Variables

1. In your project root, update `.env.local` file:

```bash
# Google Places API Key
GOOGLE_PLACES_API_KEY=your_existing_google_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

2. Replace with your actual values

---

## Step 5: Install Dependencies

```bash
npm install
```

This installs `@supabase/supabase-js`

---

## Step 6: Test Connection

Create a test file to verify connection:

```bash
# In project root
node -e "
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_URL_HERE';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_KEY_HERE';
const supabase = createClient(url, key);
supabase.from('businesses').select('count').then(r => console.log('✅ Connection successful!', r)).catch(e => console.error('❌ Error:', e));
"
```

Expected output: `✅ Connection successful!`

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] 4 tables created (businesses, reviews, search_results, search_cache)
- [ ] Project URL copied
- [ ] Service role key copied
- [ ] .env.local updated with both keys
- [ ] Dependencies installed
- [ ] Connection test passed

---

## 🐛 Troubleshooting

### "relation 'businesses' does not exist"
→ SQL schema wasn't run. Go back to Step 2.

### "invalid API key"
→ Check you're using `service_role` key, not `anon` key

### "Missing Supabase environment variables"
→ Check `.env.local` file exists and has both variables

### Connection timeout
→ Check your internet connection and Supabase project status

---

## 📊 What's Next

Once database is set up:
1. Update API routes to use database
2. Test cache functionality
3. Monitor API costs vs savings

See `TESTING.md` for testing procedures.
