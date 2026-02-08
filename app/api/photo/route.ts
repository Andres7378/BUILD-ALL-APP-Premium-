import { NextRequest, NextResponse } from 'next/server';
import { fetchPhoto } from '@/lib/google-places';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const maxWidthParam = searchParams.get('maxWidth');

    // Validate required parameter
    if (!reference) {
      return NextResponse.json(
        { error: 'Missing required parameter: reference' },
        { status: 400 }
      );
    }

    // Parse maxWidth or use default
    const maxWidth = maxWidthParam ? parseInt(maxWidthParam, 10) : 400;

    // Validate maxWidth
    if (isNaN(maxWidth) || maxWidth < 1 || maxWidth > 1600) {
      return NextResponse.json(
        { error: 'Invalid maxWidth parameter (must be between 1 and 1600)' },
        { status: 400 }
      );
    }

    // Fetch the photo from Google Places API
    const photoResponse = await fetchPhoto(reference, maxWidth);

    // Get the image data as array buffer
    const imageBuffer = await photoResponse.arrayBuffer();

    // Get content type from the response or default to jpeg
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Photo API error:', error);
    
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: 'Failed to fetch photo', message },
      { status: 500 }
    );
  }
}
