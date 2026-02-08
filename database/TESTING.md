# Testing Guide - Database Caching Implementation

## 🎯 What We're Testing

1. **Cache Miss** - First search calls API and saves to database
2. **Cache Hit** - Repeat search returns from database (no API call)
3. **No Duplicates** - Overlapping searches share the same businesses
4. **Details Lazy-Loading** - Details fetched only when needed
5. **Cache Expiration** - Old cache refreshes automatically

---

## 🚀 Prerequisites

- [ ] Supabase database set up (see `database/SETUP.md`)
- [ ] .env.local configured with all keys
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)

---

## Test 1: Cache Miss (First Search)

### Steps:
1. Open browser to: http://localhost:3000/api/search?category=plumbing&location=Houston
2. Wait for response

### Expected Result:
```json
{
  "results": [/* 20 businesses */],
  "meta": {
    "category": "plumbing",
    "location": "Houston",
    "metro": "Houston Metro",
    "count": 20,
    "cached": false  // ← NOT cached
  }
}
```

### Verify in Terminal:
```
⚡ Cache MISS for: plumbing:houston - Fetching from API
✅ Saved 20 results for search: plumbing:houston
```

### Verify in Supabase:
1. Go to Supabase → Table Editor → `businesses`
2. Should see ~20 new rows

---

## Test 2: Cache Hit (Repeat Search)

### Steps:
1. Immediately search again: http://localhost:3000/api/search?category=plumbing&location=Houston
2. Wait for response

### Expected Result:
```json
{
  "results": [/* 20 businesses */],
  "meta": {
    "category": "plumbing",
    "location": "Houston",
    "metro": "Houston Metro",
    "count": 20,
    "cached": true,  // ← CACHED!
    "cachedAt": "2025-01-..."
  }
}
```

### Verify in Terminal:
```
✅ Cache HIT for: plumbing:houston
```

### Performance Check:
- First request (cache miss): ~1-2 seconds
- Second request (cache hit): **< 300ms** ✅

---

## Test 3: No Duplicates (Overlapping Results)

### Steps:
1. Search: http://localhost:3000/api/search?category=plumbing&location=Houston
2. Search: http://localhost:3000/api/search?category=general-contractor&location=Houston

### Expected:
Some businesses appear in both searches (contractors who do both)

### Verify in Supabase:
1. Go to `businesses` table
2. Count total rows (should be < 40 if there's overlap)
3. Find a business that appears in both (check `types` array)

### SQL Query:
```sql
-- Find businesses in multiple search results
SELECT b.name, b.place_id, COUNT(*) as search_count
FROM businesses b
JOIN search_results sr ON b.place_id = sr.place_id
GROUP BY b.name, b.place_id
HAVING COUNT(*) > 1
ORDER BY search_count DESC;
```

Expected: Some businesses appear in 2+ searches

---

## Test 4: Details Lazy-Loading

### Steps:
1. Get a place_id from previous search results
2. Request details: http://localhost:3000/api/place/{place_id}
3. Wait for response

### Expected Result (Cache Miss):
```json
{
  "place_id": "ChIJ...",
  "name": "ABC Plumbing",
  "formatted_phone_number": "(713) 555-1234",
  "website": "https://...",
  "reviews": [/* 5 reviews */],
  "meta": {
    "cached": false
  }
}
```

### Verify in Terminal:
```
⚡ Cache MISS for place details: ChIJ... - Fetching from API
✅ Saved details for place: ChIJ...
✅ Saved 5 reviews for place: ChIJ...
```

### Verify in Supabase:
1. Check `businesses` table → `details_updated_at` should now be set
2. Check `reviews` table → Should have 5 new rows

### Test Cache Hit:
4. Request same place_id again
5. Should return instantly with `"cached": true`

---

## Test 5: Cache Expiration (Manual)

### Steps:
1. In Supabase SQL Editor, run:
```sql
-- Manually set a search to be 8 days old
UPDATE search_cache
SET last_fetched_at = NOW() - INTERVAL '8 days'
WHERE search_key = 'plumbing:houston';
```

2. Search again: http://localhost:3000/api/search?category=plumbing&location=Houston

### Expected:
```
⚡ Cache MISS for: plumbing:houston - Fetching from API
```

The cache should refresh automatically.

---

## Test 6: Invalid Location

### Steps:
1. Search: http://localhost:3000/api/search?category=plumbing&location=New York

### Expected Result:
```json
{
  "error": "Location must be in Texas",
  "message": "Please enter a Texas city, county, or zip code..."
}
```

Status: **400**

---

## Test 7: Missing Parameters

### Steps:
1. Search: http://localhost:3000/api/search?category=plumbing

### Expected Result:
```json
{
  "error": "Missing required parameters: category and location"
}
```

Status: **400**

---

## Test 8: Place Not Found

### Steps:
1. Request: http://localhost:3000/api/place/INVALID_ID

### Expected Result:
```json
{
  "error": "Place not found",
  "message": "No place found with ID: INVALID_ID"
}
```

Status: **404**

---

## 📊 Database Verification Queries

### Count Everything:
```sql
SELECT 'businesses' as table_name, COUNT(*) as count FROM businesses
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'search_results', COUNT(*) FROM search_results
UNION ALL
SELECT 'search_cache', COUNT(*) FROM search_cache;
```

### View Search Cache:
```sql
SELECT * FROM search_cache ORDER BY last_queried_at DESC;
```

### View Popular Searches:
```sql
SELECT 
  search_key,
  category,
  location,
  total_queries,
  result_count,
  last_fetched_at
FROM search_cache
ORDER BY total_queries DESC
LIMIT 10;
```

### View Businesses Without Details:
```sql
SELECT 
  place_id,
  name,
  formatted_address,
  details_updated_at
FROM businesses
WHERE details_updated_at IS NULL
LIMIT 10;
```

### Check for Duplicates (should be 0):
```sql
SELECT place_id, COUNT(*) as count
FROM businesses
GROUP BY place_id
HAVING COUNT(*) > 1;
```

---

## 💰 Cost Monitoring

### Track API Calls:
Monitor your terminal for:
- `⚡ Cache MISS` = API call ($0.032 for search, $0.017 for details)
- `✅ Cache HIT` = NO API call (FREE!)

### Expected Pattern:
- First 10 searches: Mix of hits/misses
- After 10 searches: Mostly hits (80%+)
- Cost savings: 50-80% reduction

---

## ✅ Success Criteria

- [ ] First search works (cache miss)
- [ ] Repeat search works (cache hit < 300ms)
- [ ] No duplicate businesses in database
- [ ] Details lazy-load correctly
- [ ] Reviews save correctly (5 per place)
- [ ] Cache expiration works
- [ ] Invalid inputs return proper errors
- [ ] Terminal logs show cache hits/misses
- [ ] Database queries return expected data

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
→ Check `.env.local` has both Supabase keys

### "relation does not exist"
→ Run the SQL schema in Supabase

### "invalid API key"
→ Using wrong Supabase key (use `service_role`, not `anon`)

### Cache always misses
→ Check `search_cache` table exists and has data

### Duplicate businesses
→ Check place_id is being used correctly as primary key

---

## 📝 Test Results Template

```
✅ Test 1: Cache Miss - PASSED
✅ Test 2: Cache Hit - PASSED (response in 250ms)
✅ Test 3: No Duplicates - PASSED (25 unique businesses from 2 searches)
✅ Test 4: Details Lazy-Loading - PASSED
✅ Test 5: Cache Expiration - PASSED
✅ Test 6: Invalid Location - PASSED
✅ Test 7: Missing Parameters - PASSED
✅ Test 8: Place Not Found - PASSED

Database Counts:
- Businesses: 25
- Reviews: 15 (3 places × 5 reviews)
- Search Results: 40 (2 searches × 20 results)
- Search Cache: 2

Cost Savings:
- API calls made: 4 (2 searches + 2 details)
- Cached requests: 6
- Savings: 60% ✅
```

Record your results and we'll review before moving forward!
