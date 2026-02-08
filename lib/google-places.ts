import {
  PlaceResult,
  PlaceDetails,
  SearchParams,
} from './types';
import {
  PLACE_FIELDS,
  PLACE_DETAILS_FIELDS,
  DEFAULT_SEARCH_RADIUS,
  TEXAS_METROS,
} from './constants';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

/**
 * Validates if a location is in Texas
 * Checks against major metros and counties
 */
export function validateTexasLocation(location: string): { valid: boolean; metro?: string } {
  const normalized = location.toLowerCase().trim();
  
  // Check each metro area
  for (const [metroKey, metroData] of Object.entries(TEXAS_METROS)) {
    // Check metro name
    if (normalized.includes(metroKey) || normalized.includes(metroData.name.toLowerCase())) {
      return { valid: true, metro: metroData.name };
    }
    
    // Check counties
    for (const county of metroData.counties) {
      if (normalized.includes(county.toLowerCase())) {
        return { valid: true, metro: metroData.name };
      }
      // Also check without "County" suffix
      const countyName = county.replace(' County', '');
      if (normalized.includes(countyName.toLowerCase())) {
        return { valid: true, metro: metroData.name };
      }
    }
  }
  
  // Check for common Texas indicators (zip codes, TX abbreviation, etc.)
  // If it contains TX or Texas, we'll consider it valid
  if (normalized.includes('texas') || normalized.includes(', tx')) {
    return { valid: true };
  }
  
  // Check if it's a 5-digit zip code starting with 7 (most Texas zips)
  const zipMatch = normalized.match(/\b7\d{4}\b/);
  if (zipMatch) {
    return { valid: true };
  }
  
  return { valid: false };
}

/**
 * Searches for places using Google Places Text Search API
 */
export async function searchPlaces(
  category: string,
  location: string,
  radius: number = DEFAULT_SEARCH_RADIUS
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  // Construct search query
  // Try both formats for better results
  const queries = [
    `${category} contractor in ${location}, Texas`,
    `${category} services near ${location}, TX`,
  ];

  // Use the first query format
  const query = queries[0];

  const params = new URLSearchParams({
    query,
    key: GOOGLE_PLACES_API_KEY,
    fields: PLACE_FIELDS.join(','),
    radius: radius.toString(),
  });

  try {
    const response = await fetch(`${TEXT_SEARCH_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    // Return up to 20 results
    return (data.results || []).slice(0, 20) as PlaceResult[];
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Gets detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_PLACES_API_KEY,
    fields: PLACE_DETAILS_FIELDS.join(','),
  });

  try {
    const response = await fetch(`${DETAILS_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'NOT_FOUND') {
      return null;
    }

    if (data.status !== 'OK') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    return data.result as PlaceDetails;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}

/**
 * Constructs a photo URL for a Google Places photo reference
 * Note: This should typically be proxied through your API to keep the API key secure
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: maxWidth.toString(),
    key: GOOGLE_PLACES_API_KEY,
  });

  return `${PHOTO_URL}?${params}`;
}

/**
 * Fetches a photo from Google Places API
 * Used by the photo proxy endpoint
 */
export async function fetchPhoto(photoReference: string, maxWidth: number = 400): Promise<Response> {
  const url = getPhotoUrl(photoReference, maxWidth);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error fetching photo:', error);
    throw error;
  }
}
