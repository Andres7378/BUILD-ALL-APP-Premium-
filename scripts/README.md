# 🔍 API Investigation & Database Planning

## What We're Doing

Before building our database, we need to understand EXACTLY what data Google Places API returns. This will help us design an efficient schema.

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `tsx` - To run TypeScript files directly
- `dotenv` - To load environment variables

### Step 2: Set Up Your API Key

Make sure you have `.env.local` file with:

```
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

### Step 3: Run Investigation Script

```bash
npm run investigate
```

### Step 4: Review Results

The script will create `scripts/output/` folder with:

1. **`search-result-*.json`** - Raw search API responses
2. **`place-details-*.json`** - Raw details API responses  
3. **`investigation-results.json`** - Complete analysis

## 📊 What the Script Does

1. **Tests Text Search API** with 3 queries:
   - "plumbing contractor in Houston, Texas"
   - "electrical services near Austin, TX"
   - "HVAC repair in Dallas, Texas"

2. **Tests Place Details API** on the first 3 results

3. **Analyzes the data:**
   - Lists all fields found
   - Compares search vs details APIs
   - Identifies optional vs required fields
   - Recommends database schema

4. **Saves everything** to JSON files for you to inspect

## 🎯 What We're Looking For

### From Text Search API:
- ✅ What fields are always present?
- ✅ What's optional?
- ✅ How big is each result?
- ✅ Photo reference format

### From Place Details API:
- ✅ What extra info does it provide?
- ✅ Review structure and count
- ✅ Opening hours complexity
- ✅ Contact information format

### Overlap Analysis:
- ✅ Which fields appear in both?
- ✅ What should we cache from search?
- ✅ What should we lazy-load from details?

## 📋 Expected Console Output

```
🔍 Starting Google Places API Investigation...

📋 PART 1: TEXT SEARCH API INVESTIGATION
============================================================

🔎 Testing query: "plumbing contractor in Houston, Texas"
   ✅ Found 20 results
   📊 Fields in first result: 15
   📝 Fields: business_status, formatted_address, geometry, ...
   💾 Saved sample to: search-result-plumbing.json

... (more searches)

📋 PART 2: PLACE DETAILS API INVESTIGATION
============================================================

🏢 Testing place: "ABC Plumbing"
   📊 Total fields: 25
   ⭐ Rating: 4.5
   📝 Reviews: 50
   📸 Photos: 8
   📞 Phone: (713) 555-1234
   🌐 Website: https://abcplumbing.com
   💾 Saved details to: place-details-abc-plumbing.json

... (more places)

📋 PART 3: DATA ANALYSIS
============================================================

🔍 SEARCH API FIELDS:
   Total unique fields: 15
   Fields: business_status, formatted_address, ...

🔍 DETAILS API FIELDS:
   Total unique fields: 25
   Fields: all search fields + reviews, phone, website, ...

🔍 DETAILS-ONLY FIELDS (not in search):
   Total: 10
   Fields: formatted_phone_number, reviews, website, ...

📋 PART 4: RECOMMENDATIONS FOR DATABASE SCHEMA
============================================================

💡 Based on investigation:

1️⃣  SEARCH TABLE (basic info from Text Search):
   - Always present: place_id, name, formatted_address, geometry
   - Often present: rating, user_ratings_total, types
   - Sometimes present: opening_hours, photos, business_status

2️⃣  DETAILS TABLE (additional info from Place Details):
   - Contact: formatted_phone_number, website
   - Reviews: reviews[] (can be large!)
   - Hours: opening_hours.weekday_text, periods
   - Other: price_level, url

3️⃣  STORAGE STRATEGY:
   ✅ Store basic info immediately (from search)
   ✅ Lazy-load details (only when user clicks)
   ✅ Reviews in separate table (can be 5+ per place)
   ✅ Photos as references only (fetch on demand)

✅ Investigation complete!
📁 All results saved to scripts/output/
```

## 🔎 How to Inspect Results

### Option 1: VS Code
Just open the JSON files in `scripts/output/` and browse

### Option 2: Command Line
```bash
# Pretty print a file
cat scripts/output/investigation-results.json | jq
```

### Option 3: Node REPL
```javascript
const results = require('./scripts/output/investigation-results.json');
console.log(results.testSearches[0].sampleResult);
```

## 🎯 Next Steps After Investigation

1. **Review the JSON files** to understand data structure
2. **Check IMPLEMENTATION_PLAN.md** for full strategy
3. **Design database schema** based on findings
4. **Set up Supabase** (or chosen database)
5. **Implement caching layer**

## 💡 Cost Estimate for Investigation

This script makes approximately:
- 3 Text Search API calls (~$0.10)
- 3 Place Details API calls (~$0.05)
- **Total: ~$0.15**

Don't worry - this is a one-time cost to understand the API!

## 🐛 Troubleshooting

### "GOOGLE_PLACES_API_KEY not found"
- Make sure `.env.local` exists
- Make sure the key is correct
- No quotes needed: `GOOGLE_PLACES_API_KEY=AIza...`

### "API Error: REQUEST_DENIED"
- Your API key might not have Places API enabled
- Go to Google Cloud Console → Enable Places API

### "ZERO_RESULTS"
- This is normal for some queries
- The script handles this gracefully
- Try a different location if needed

## 📞 Questions?

After running the investigation, review the output and we'll use it to design the perfect database schema!
