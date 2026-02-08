import { NextRequest, NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/google-places';
import { getCachedPlaceDetails, savePlaceDetails } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: placeId } = await params;

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing place_id parameter' },
        { status: 400 }
      );
    }

    // Check for cached details (30-day TTL)
    const cached = await getCachedPlaceDetails(placeId);

    if (cached) {
      console.log(`✅ Cache HIT for place details: ${placeId}`);
      return NextResponse.json({
        ...cached,
        meta: {
          cached: true,
          cachedAt: cached.details_updated_at,
        },
      });
    }

    // Cache miss or expired - fetch from Google API
    console.log(`⚡ Cache MISS for place details: ${placeId} - Fetching from API`);
    const details = await getPlaceDetails(placeId);

    if (!details) {
      return NextResponse.json(
        {
          error: 'Place not found',
          message: `No place found with ID: ${placeId}`,
        },
        { status: 404 }
      );
    }

    // Save to database
    await savePlaceDetails(placeId, details);

    return NextResponse.json({
      ...details,
      meta: {
        cached: false,
      },
    });
  } catch (error) {
    console.error('Place details API error:', error);

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { error: 'Failed to get place details', message },
      { status: 500 }
    );
  }
}
