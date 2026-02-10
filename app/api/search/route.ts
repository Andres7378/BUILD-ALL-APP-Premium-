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
            'Please enter a Texas city, county, or zip code (e.g., Houston, Katy, Harris County, 77024)',
        },
        { status: 400 }
      );
    }

    const radius = radiusParam ? parseInt(radiusParam, 10) : undefined;
    const searchKey = `${category}:${location.toLowerCase().trim()}`;

    // ── Try cache first (non-fatal) ───────────────────────
    try {
      const needsRefresh = await shouldRefreshCache(searchKey);

      if (!needsRefresh) {
        const cached = await getCachedSearch(searchKey);
        if (cached && cached.results && cached.results.length > 0) {
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
    } catch (cacheError) {
      // Cache failed – that's fine, proceed to live API
      console.warn('⚠️  Cache lookup failed (proceeding to API):', cacheError);
    }

    // ── Fetch from Google Places API ──────────────────────
    console.log(`⚡ Fetching from Google API for: ${searchKey}`);
    const results = await searchPlaces(category, location, radius);

    // ── Try to save to cache (non-fatal) ──────────────────
    try {
      await saveSearchResults(searchKey, {
        category,
        location,
        metro: locationValidation.metro,
        results,
      });
    } catch (saveError) {
      console.warn('⚠️  Cache save failed (non-fatal):', saveError);
    }

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
