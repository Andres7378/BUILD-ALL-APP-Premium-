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

// ── Inline city list so this module has ZERO extra imports ───
const TEXAS_CITY_NAMES: string[] = [
  // Houston metro
  'houston','sugar land','katy','pearland','the woodlands','league city',
  'missouri city','pasadena','baytown','conroe','friendswood','galveston',
  'texas city','rosenberg','richmond','humble','spring','cypress','tomball',
  'deer park','la porte','webster','alvin','angleton','bellaire',
  'west university place','stafford','dickinson','seabrook','kemah',
  'clear lake','fulshear','magnolia','atascocita','kingwood','cinco ranch',
  'sienna','fresno','manvel','rosharon','mont belvieu','dayton','liberty',
  'waller','hempstead','sealy','needville','santa fe','hitchcock','la marque',
  'brookshire','meadows place','jersey village','memorial','champions','copperfield',
  // Austin metro
  'austin','round rock','cedar park','pflugerville','georgetown','leander',
  'kyle','buda','san marcos','hutto','lakeway','bee cave','dripping springs',
  'bastrop','smithville','taylor','elgin','manor','lockhart','liberty hill',
  'wimberley','lago vista','jollyville','brushy creek','westlake','rollingwood',
  'barton creek','mueller',
  // DFW metro
  'dallas','fort worth','arlington','plano','frisco','mckinney','irving',
  'garland','grand prairie','denton','mesquite','carrollton','richardson',
  'allen','lewisville','flower mound','mansfield','north richland hills',
  'rowlett','euless','bedford','grapevine','keller','southlake','colleyville',
  'hurst','coppell','the colony','rockwall','wylie','prosper','celina',
  'little elm','sachse','murphy','duncanville','desoto','cedar hill',
  'lancaster','waxahachie','midlothian','burleson','cleburne','weatherford',
  'azle','trophy club','corinth','highland village','argyle','justin',
  'saginaw','white settlement','benbrook','lake worth','crowley','kennedale',
  'farmers branch','addison','university park','highland park','forney',
  'kaufman','terrell','ennis','red oak','anna','melissa','princeton',
  'fate','heath','royse city','haslet','roanoke','decatur','lake dallas',
  'oak point','aubrey','pilot point','sanger',
];

/**
 * Validates if a location is in Texas
 * Checks against known cities, metro names, counties, TX indicators, and zip codes
 */
export function validateTexasLocation(location: string): { valid: boolean; metro?: string } {
  const normalized = location.toLowerCase().trim();

  // ── 1. Check against known Texas city names ───
  for (const city of TEXAS_CITY_NAMES) {
    if (normalized === city || normalized.startsWith(city + ',') || normalized.startsWith(city + ' ')) {
      return { valid: true };
    }
  }
  
  // ── 2. Check each metro area name & counties (original logic) ───
  for (const [metroKey, metroData] of Object.entries(TEXAS_METROS)) {
    if (normalized.includes(metroKey) || normalized.includes(metroData.name.toLowerCase())) {
      return { valid: true, metro: metroData.name };
    }
    
    for (const county of metroData.counties) {
      if (normalized.includes(county.toLowerCase())) {
        return { valid: true, metro: metroData.name };
      }
      const countyName = county.replace(' County', '');
      if (normalized.includes(countyName.toLowerCase())) {
        return { valid: true, metro: metroData.name };
      }
    }
  }
  
  // ── 3. Check for Texas indicators (original logic) ───
  if (normalized.includes('texas') || normalized.includes(', tx')) {
    return { valid: true };
  }
  
  // ── 4. Check 5-digit zip starting with 7 (original logic) ───
  const zipMatch = normalized.match(/\b7\d{4}\b/);
  if (zipMatch) {
    return { valid: true };
  }
  
  return { valid: false };
}

/**
 * Searches for places using Google Places Text Search API
 * IDENTICAL to original working version
 */
export async function searchPlaces(
  category: string,
  location: string,
  radius: number = DEFAULT_SEARCH_RADIUS
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured');
  }

  // Construct search query — same as original
  const queries = [
    `${category} contractor in ${location}, Texas`,
    `${category} services near ${location}, TX`,
  ];

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

    return (data.results || []).slice(0, 20) as PlaceResult[];
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Gets detailed information about a specific place
 * IDENTICAL to original
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
 * Constructs a photo URL — IDENTICAL to original
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
 * Fetches a photo — IDENTICAL to original
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
