/**
 * Database Helper Functions
 * Handles all database operations for caching Google Places API results
 * NOW: graceful – never throws at import time; returns null on failure
 */

import { PlaceResult, PlaceDetails, Review } from './types';

// ── Lazy Supabase client ──────────────────────────────────
let _supabase: any = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase env vars missing – caching disabled');
    return null;
  }

  try {
    // Dynamic import isn't needed here; we just guard the call
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(supabaseUrl, supabaseKey);
    return _supabase;
  } catch (err) {
    console.warn('⚠️  Failed to create Supabase client:', err);
    return null;
  }
}

// Cache TTL constants
const SEARCH_CACHE_TTL_DAYS = 7;
const DETAILS_CACHE_TTL_DAYS = 30;

/**
 * Check if a search cache should be refreshed
 */
export async function shouldRefreshCache(searchKey: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true; // No DB → always refresh (go to Google API)

  try {
    const { data, error } = await supabase
      .from('search_cache')
      .select('last_fetched_at')
      .eq('search_key', searchKey)
      .single();

    if (error || !data) return true;

    const lastFetched = new Date(data.last_fetched_at);
    const now = new Date();
    const daysSince = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60 * 24);

    return daysSince >= SEARCH_CACHE_TTL_DAYS;
  } catch (error) {
    console.error('Error checking cache:', error);
    return true;
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearch(searchKey: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Update last_queried_at
    await supabase
      .from('search_cache')
      .update({
        last_queried_at: new Date().toISOString(),
      })
      .eq('search_key', searchKey);

    const { data, error } = await supabase
      .from('search_results')
      .select(`
        rank,
        businesses (*)
      `)
      .eq('search_key', searchKey)
      .order('rank', { ascending: true });

    if (error || !data || data.length === 0) return null;

    const { data: cacheData } = await supabase
      .from('search_cache')
      .select('last_fetched_at, metro, result_count')
      .eq('search_key', searchKey)
      .single();

    return {
      results: data.map((item: any) => item.businesses),
      meta: {
        cachedAt: cacheData?.last_fetched_at,
        metro: cacheData?.metro,
        count: data.length,
      },
    };
  } catch (error) {
    console.error('Error in getCachedSearch:', error);
    return null;
  }
}

/**
 * Save search results to database (best-effort, never throws)
 */
export async function saveSearchResults(
  searchKey: string,
  data: {
    category: string;
    location: string;
    metro?: string;
    results: PlaceResult[];
  }
) {
  const supabase = getSupabase();
  if (!supabase) return; // Silently skip if no DB

  const { category, location, metro, results } = data;

  try {
    // 1. Upsert businesses
    for (const place of results) {
      const businessData = {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        business_status: place.business_status,
        types: place.types,
        open_now: place.opening_hours?.open_now,
        photos: place.photos ? JSON.stringify(place.photos) : null,
        plus_code_global: (place as any).plus_code?.global_code,
        plus_code_compound: (place as any).plus_code?.compound_code,
        basic_info_updated_at: new Date().toISOString(),
      };

      await supabase
        .from('businesses')
        .upsert(businessData, { onConflict: 'place_id', ignoreDuplicates: false });
    }

    // 2. Delete old search results
    await supabase.from('search_results').delete().eq('search_key', searchKey);

    // 3. Insert new search results
    const searchResultsData = results.map((place, index) => ({
      search_key: searchKey,
      place_id: place.place_id,
      rank: index + 1,
    }));

    await supabase.from('search_results').insert(searchResultsData);

    // 4. Upsert search cache
    await supabase.from('search_cache').upsert(
      {
        search_key: searchKey,
        category,
        location,
        metro,
        result_count: results.length,
        last_fetched_at: new Date().toISOString(),
        total_queries: 1,
        last_queried_at: new Date().toISOString(),
      },
      { onConflict: 'search_key', ignoreDuplicates: false }
    );

    console.log(`✅ Saved ${results.length} results for: ${searchKey}`);
  } catch (error) {
    // Best-effort caching – don't crash the request
    console.error('⚠️  Error saving to cache (non-fatal):', error);
  }
}

/**
 * Get cached place details
 */
export async function getCachedPlaceDetails(placeId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*, reviews(*)')
      .eq('place_id', placeId)
      .single();

    if (error || !business) return null;

    if (!business.details_updated_at) return null;

    const detailsAge = new Date().getTime() - new Date(business.details_updated_at).getTime();
    const daysOld = detailsAge / (1000 * 60 * 60 * 24);

    if (daysOld >= DETAILS_CACHE_TTL_DAYS) return null;

    return {
      ...business,
      photos: business.photos ? JSON.parse(business.photos as any) : [],
      opening_hours: business.opening_hours_weekday_text
        ? {
            open_now: business.open_now,
            weekday_text: business.opening_hours_weekday_text,
            periods: business.opening_hours_periods
              ? JSON.parse(business.opening_hours_periods as any)
              : [],
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error getting cached place details:', error);
    return null;
  }
}

/**
 * Save place details to database (best-effort)
 */
export async function savePlaceDetails(placeId: string, details: PlaceDetails) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase
      .from('businesses')
      .update({
        formatted_phone_number: details.formatted_phone_number,
        international_phone_number: details.international_phone_number,
        website: details.website,
        url: details.url,
        price_level: details.price_level,
        opening_hours_weekday_text: details.opening_hours?.weekday_text,
        opening_hours_periods: details.opening_hours?.periods
          ? JSON.stringify(details.opening_hours.periods)
          : null,
        photos: details.photos ? JSON.stringify(details.photos) : null,
        details_updated_at: new Date().toISOString(),
      })
      .eq('place_id', placeId);

    if (details.reviews && details.reviews.length > 0) {
      await saveReviews(placeId, details.reviews);
    }

    console.log(`✅ Saved details for: ${placeId}`);
  } catch (error) {
    console.error('⚠️  Error saving place details (non-fatal):', error);
  }
}

/**
 * Save reviews (internal helper)
 */
async function saveReviews(placeId: string, reviews: Review[]) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('reviews').delete().eq('place_id', placeId);

    const reviewsData = reviews.map((review) => ({
      place_id: placeId,
      author_name: review.author_name,
      author_url: review.author_url,
      language: review.language || 'en',
      profile_photo_url: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      time: review.time,
      relative_time_description: review.relative_time_description,
    }));

    await supabase.from('reviews').insert(reviewsData);
  } catch (error) {
    console.error('⚠️  Error saving reviews (non-fatal):', error);
  }
}

/**
 * Cleanup old cache entries
 */
export async function cleanupOldCache() {
  const supabase = getSupabase();
  if (!supabase) return 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SEARCH_CACHE_TTL_DAYS);

    const { data: oldSearches } = await supabase
      .from('search_cache')
      .select('search_key')
      .lt('last_fetched_at', cutoffDate.toISOString());

    if (!oldSearches || oldSearches.length === 0) return 0;

    const searchKeys = oldSearches.map((s: any) => s.search_key);
    await supabase.from('search_results').delete().in('search_key', searchKeys);
    await supabase.from('search_cache').delete().in('search_key', searchKeys);

    return searchKeys.length;
  } catch (error) {
    console.error('Error in cleanupOldCache:', error);
    return 0;
  }
}
