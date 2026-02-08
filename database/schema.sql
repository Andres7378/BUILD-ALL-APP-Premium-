-- Texas Home Services Finder - Database Schema
-- Optimized for Google Places API caching
-- Run this in Supabase SQL Editor

-- ============================================================
-- TABLE 1: businesses
-- Single source of truth for all businesses (no duplicates)
-- ============================================================

CREATE TABLE IF NOT EXISTS businesses (
  -- Primary key
  place_id TEXT PRIMARY KEY,
  
  -- Basic info (from Text Search API)
  name TEXT NOT NULL,
  formatted_address TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  user_ratings_total INTEGER DEFAULT 0,
  
  -- Location
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  
  -- Status and classification
  business_status TEXT, -- OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY
  types TEXT[], -- Array of business types
  
  -- Basic opening hours (just the boolean)
  open_now BOOLEAN,
  
  -- Photos (store array of photo references)
  photos JSONB, -- Array of {photo_reference, height, width}
  
  -- Additional metadata from search
  plus_code_global TEXT,
  plus_code_compound TEXT,
  
  -- Details (lazy-loaded from Place Details API)
  formatted_phone_number TEXT,
  international_phone_number TEXT,
  website TEXT,
  url TEXT, -- Google Maps URL
  price_level INTEGER CHECK (price_level >= 0 AND price_level <= 4),
  
  -- Detailed opening hours (from Place Details API)
  opening_hours_periods JSONB, -- Array of {open: {day, time}, close: {day, time}}
  opening_hours_weekday_text TEXT[], -- Array of human-readable hours
  
  -- Timestamps for cache management
  created_at TIMESTAMP DEFAULT NOW(),
  basic_info_updated_at TIMESTAMP DEFAULT NOW(), -- When basic info was last updated
  details_updated_at TIMESTAMP, -- NULL until details are fetched
  
  -- Indexes for performance
  CONSTRAINT valid_coordinates CHECK (
    lat >= -90 AND lat <= 90 AND
    lng >= -180 AND lng <= 180
  )
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_businesses_types ON businesses USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(business_status);
CREATE INDEX IF NOT EXISTS idx_businesses_basic_updated ON businesses(basic_info_updated_at);
CREATE INDEX IF NOT EXISTS idx_businesses_details_updated ON businesses(details_updated_at);


-- ============================================================
-- TABLE 2: reviews
-- Separate table for reviews (5 per business from Google)
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES businesses(place_id) ON DELETE CASCADE,
  
  -- Review content
  author_name TEXT NOT NULL,
  author_url TEXT,
  language TEXT DEFAULT 'en',
  profile_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  
  -- Timing
  time BIGINT NOT NULL, -- Unix timestamp from Google
  relative_time_description TEXT, -- "3 weeks ago"
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure no duplicate reviews
  UNIQUE(place_id, author_name, time)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_time ON reviews(time DESC);


-- ============================================================
-- TABLE 3: search_results
-- Junction table linking searches to businesses
-- ============================================================

CREATE TABLE IF NOT EXISTS search_results (
  id SERIAL PRIMARY KEY,
  
  -- Search identifier
  search_key TEXT NOT NULL, -- Format: "category:location" (e.g., "plumbing:houston")
  
  -- Link to business
  place_id TEXT NOT NULL REFERENCES businesses(place_id) ON DELETE CASCADE,
  
  -- Position in search results (1-20)
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 20),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure no duplicates
  UNIQUE(search_key, place_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_search_results_key ON search_results(search_key);
CREATE INDEX IF NOT EXISTS idx_search_results_key_rank ON search_results(search_key, rank);
CREATE INDEX IF NOT EXISTS idx_search_results_created ON search_results(created_at);


-- ============================================================
-- TABLE 4: search_cache
-- Tracks when searches were last performed
-- ============================================================

CREATE TABLE IF NOT EXISTS search_cache (
  -- Primary key
  search_key TEXT PRIMARY KEY, -- Format: "category:location"
  
  -- Search metadata
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  metro TEXT, -- Houston Metro, Austin Metro, etc.
  
  -- Results info
  result_count INTEGER DEFAULT 0,
  
  -- Cache timing (7-day TTL)
  last_fetched_at TIMESTAMP DEFAULT NOW(),
  
  -- Analytics (optional but useful)
  total_queries INTEGER DEFAULT 1,
  last_queried_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_search_cache_last_fetched ON search_cache(last_fetched_at);
CREATE INDEX IF NOT EXISTS idx_search_cache_category ON search_cache(category);
CREATE INDEX IF NOT EXISTS idx_search_cache_metro ON search_cache(metro);


-- ============================================================
-- CLEANUP FUNCTION: Delete old search results (optional)
-- Run this periodically to clean up stale cache entries
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_searches()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete search_results for searches older than 7 days
  WITH old_searches AS (
    SELECT search_key FROM search_cache
    WHERE last_fetched_at < NOW() - INTERVAL '7 days'
  )
  DELETE FROM search_results
  WHERE search_key IN (SELECT search_key FROM old_searches);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old search_cache entries
  DELETE FROM search_cache
  WHERE last_fetched_at < NOW() - INTERVAL '7 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- To run cleanup manually: SELECT cleanup_old_searches();


-- ============================================================
-- HELPER VIEWS (optional but useful)
-- ============================================================

-- View: Popular searches
CREATE OR REPLACE VIEW popular_searches AS
SELECT 
  search_key,
  category,
  location,
  metro,
  result_count,
  total_queries,
  last_queried_at,
  last_fetched_at
FROM search_cache
ORDER BY total_queries DESC
LIMIT 50;

-- View: Recent searches
CREATE OR REPLACE VIEW recent_searches AS
SELECT 
  search_key,
  category,
  location,
  metro,
  result_count,
  last_queried_at
FROM search_cache
ORDER BY last_queried_at DESC
LIMIT 50;

-- View: Businesses needing details refresh (older than 30 days)
CREATE OR REPLACE VIEW businesses_needing_refresh AS
SELECT 
  place_id,
  name,
  formatted_address,
  details_updated_at
FROM businesses
WHERE details_updated_at IS NULL 
   OR details_updated_at < NOW() - INTERVAL '30 days'
ORDER BY details_updated_at ASC NULLS FIRST;


-- ============================================================
-- VERIFICATION QUERIES
-- Run these after setup to verify everything works
-- ============================================================

-- Count all tables
SELECT 'businesses' as table_name, COUNT(*) as count FROM businesses
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'search_results', COUNT(*) FROM search_results
UNION ALL
SELECT 'search_cache', COUNT(*) FROM search_cache;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
