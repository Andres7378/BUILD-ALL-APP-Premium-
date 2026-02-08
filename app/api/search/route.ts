import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces, validateTexasLocation } from '@/lib/google-places';
import {
  shouldRefreshCache,
  getCachedSearch,
  saveSearchResults,
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const radiusParam = searchParams.get('radius');

    // Validate required parameters
    if (!category || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: category and location' },
        { status: 400 }
      );
    }

    // Validate Texas location
    const locationValidation = validateTexasLocation(location);
    if (!locationValidation.valid) {
      return NextResponse.json(
        {
          error: 'Location must be in Texas',
          message:
            'Please enter a Texas city, county, or zip code (e.g., Houston, Harris County, 77024)',
        },
        { status: 400 }
      );
    }

    // Parse radius if provided
    const radius = radiusParam ? parseInt(radiusParam, 10) : undefined;

    // Create search key for caching
    const searchKey = `${category}:${location.toLowerCase()}`;

    // Check if we should refresh cache (7-day TTL)
    const needsRefresh = await shouldRefreshCache(searchKey);

    if (!needsRefresh) {
      // Return cached results
      const cached = await getCachedSearch(searchKey);

      if (cached) {
        console.log(`✅ Cache HIT for: ${searchKey}`);
        return NextResponse.json({
          results: cached.results,
          meta: {
            category,
            location,
            metro: cached.meta.metro || locationValidation.metro,
            count: cached.results.length,
            cached: true,
            cachedAt: cached.meta.cachedAt,
          },
        });
      }
    }

    // Cache miss or expired - fetch from Google API
    console.log(`⚡ Cache MISS for: ${searchKey} - Fetching from API`);
    const results = await searchPlaces(category, location, radius);

    // Save to database
    await saveSearchResults(searchKey, {
      category,
      location,
      metro: locationValidation.metro,
      results,
    });

    return NextResponse.json({
      results,
      meta: {
        category,
        location,
        metro: locationValidation.metro,
        count: results.length,
        cached: false,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { error: 'Failed to search places', message },
      { status: 500 }
    );
  }
}
