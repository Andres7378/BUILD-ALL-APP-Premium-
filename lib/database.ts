/**
 * Database Helper Functions
 * Handles all database operations for caching Google Places API results
 */

import { createClient } from '@supabase/supabase-js';
import { PlaceResult, PlaceDetails, Review } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Cache TTL constants
const SEARCH_CACHE_TTL_DAYS = 7;
const DETAILS_CACHE_TTL_DAYS = 30;

/**
 * Check if a search cache should be refreshed
 */
export async function shouldRefreshCache(searchKey: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('search_cache')
      .select('last_fetched_at')
      .eq('search_key', searchKey)
      .single();

    if (error || !data) {
      // No cache entry, needs refresh
      return true;
    }

    const lastFetched = new Date(data.last_fetched_at);
    const now = new Date();
    const daysSince = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60 * 24);

    return daysSince >= SEARCH_CACHE_TTL_DAYS;
  } catch (error) {
    console.error('Error checking cache:', error);
    return true; // On error, refresh
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearch(searchKey: string) {
  try {
    // Update last_queried_at and increment total_queries
    await supabase
      .from('search_cache')
      .update({
        last_queried_at: new Date().toISOString(),
        total_queries: supabase.rpc('increment', { row_id: searchKey }),
      })
      .eq('search_key', searchKey);

    // Get search results with business data
    const { data, error } = await supabase
      .from('search_results')
      .select(`
        rank,
        businesses (*)
      `)
      .eq('search_key', searchKey)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching cached search:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Get cache metadata
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
 * Save search results to database
 * Upserts businesses and creates search result links
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
  const { category, location, metro, results } = data;

  try {
    // 1. Upsert businesses (insert new, update existing)
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

      const { error } = await supabase
        .from('businesses')
        .upsert(businessData, {
          onConflict: 'place_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`Error upserting business ${place.place_id}:`, error);
      }
    }

    // 2. Delete old search results for this search_key
    await supabase
      .from('search_results')
      .delete()
      .eq('search_key', searchKey);

    // 3. Insert new search results
    const searchResultsData = results.map((place, index) => ({
      search_key: searchKey,
      place_id: place.place_id,
      rank: index + 1,
    }));

    const { error: searchResultsError } = await supabase
      .from('search_results')
      .insert(searchResultsData);

    if (searchResultsError) {
      console.error('Error inserting search results:', searchResultsError);
      throw searchResultsError;
    }

    // 4. Upsert search cache
    const { error: cacheError } = await supabase
      .from('search_cache')
      .upsert(
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
        {
          onConflict: 'search_key',
          ignoreDuplicates: false,
        }
      );

    if (cacheError) {
      console.error('Error upserting search cache:', cacheError);
      throw cacheError;
    }

    console.log(`✅ Saved ${results.length} results for search: ${searchKey}`);
  } catch (error) {
    console.error('Error in saveSearchResults:', error);
    throw error;
  }
}

/**
 * Get cached place details
 */
export async function getCachedPlaceDetails(placeId: string) {
  try {
    // Check if details need refresh
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*, reviews(*)')
      .eq('place_id', placeId)
      .single();

    if (error || !business) {
      return null;
    }

    // Check if details are fresh (< 30 days old)
    if (!business.details_updated_at) {
      return null; // Never fetched details
    }

    const detailsAge = new Date().getTime() - new Date(business.details_updated_at).getTime();
    const daysOld = detailsAge / (1000 * 60 * 60 * 24);

    if (daysOld >= DETAILS_CACHE_TTL_DAYS) {
      return null; // Details too old
    }

    // Return cached details
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
 * Save place details to database
 */
export async function savePlaceDetails(placeId: string, details: PlaceDetails) {
  try {
    // 1. Update business with detail fields
    const { error: businessError } = await supabase
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

    if (businessError) {
      console.error('Error updating business details:', businessError);
      throw businessError;
    }

    // 2. Save reviews
    if (details.reviews && details.reviews.length > 0) {
      await saveReviews(placeId, details.reviews);
    }

    console.log(`✅ Saved details for place: ${placeId}`);
  } catch (error) {
    console.error('Error in savePlaceDetails:', error);
    throw error;
  }
}

/**
 * Save reviews for a place
 */
async function saveReviews(placeId: string, reviews: Review[]) {
  try {
    // Delete old reviews for this place
    await supabase.from('reviews').delete().eq('place_id', placeId);

    // Insert new reviews
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

    const { error } = await supabase.from('reviews').insert(reviewsData);

    if (error) {
      console.error('Error inserting reviews:', error);
      throw error;
    }

    console.log(`✅ Saved ${reviews.length} reviews for place: ${placeId}`);
  } catch (error) {
    console.error('Error in saveReviews:', error);
    throw error;
  }
}

/**
 * Cleanup old cache entries (run periodically)
 */
export async function cleanupOldCache() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SEARCH_CACHE_TTL_DAYS);

    // Get old search keys
    const { data: oldSearches } = await supabase
      .from('search_cache')
      .select('search_key')
      .lt('last_fetched_at', cutoffDate.toISOString());

    if (!oldSearches || oldSearches.length === 0) {
      console.log('No old cache entries to clean up');
      return 0;
    }

    const searchKeys = oldSearches.map((s) => s.search_key);

    // Delete search results
    await supabase.from('search_results').delete().in('search_key', searchKeys);

    // Delete search cache entries
    await supabase.from('search_cache').delete().in('search_key', searchKeys);

    console.log(`✅ Cleaned up ${searchKeys.length} old cache entries`);
    return searchKeys.length;
  } catch (error) {
    console.error('Error in cleanupOldCache:', error);
    return 0;
  }
}
