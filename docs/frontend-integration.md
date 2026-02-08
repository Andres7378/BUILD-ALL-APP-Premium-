# Frontend Integration Guide

## Backend Overview

The backend is **fully functional** and provides 3 API endpoints that the frontend will consume. All caching, database operations, and Google API calls are handled automatically - the frontend just needs to make HTTP requests.

---

## Available API Endpoints

### 1. Search API

**Endpoint:** `GET /api/search`

**Parameters:**
- `category` (required) - One of: concrete, electrical, plumbing, roofing, hvac, painting, general-contractor
- `location` (required) - Texas city, county, or zip code (e.g., "Houston", "Harris County", "77024")
- `radius` (optional) - Search radius in meters (default: 16093.4 = 10 miles)

**Example:**
```
GET /api/search?category=plumbing&location=Houston
```

**Response:**
```typescript
{
  results: PlaceResult[],  // Array of 0-20 businesses
  meta: {
    category: string,
    location: string,
    metro?: string,        // "Houston Metro", "Austin Metro", etc.
    count: number,
    cached: boolean,       // true if from database, false if fresh API call
    cachedAt?: string      // ISO timestamp when cached (if cached)
  }
}
```

**Error Responses:**
- 400: Invalid location (not in Texas)
- 400: Missing required parameters
- 500: Server error

---

### 2. Place Details API

**Endpoint:** `GET /api/place/[id]`

**Parameters:**
- `id` (URL parameter) - Google Places place_id

**Example:**
```
GET /api/place/ChIJF6ElMtLFQIYRqdF4qW7ruj0
```

**Response:**
```typescript
PlaceDetails {
  place_id: string,
  name: string,
  formatted_address: string,
  formatted_phone_number?: string,
  international_phone_number?: string,
  website?: string,
  rating?: number,
  user_ratings_total?: number,
  reviews?: Review[],              // Array of up to 5 reviews
  opening_hours?: {
    open_now?: boolean,
    weekday_text?: string[],       // ["Monday: 9AM-5PM", ...]
    periods?: Array<...>
  },
  photos?: Array<{
    photo_reference: string,
    height: number,
    width: number
  }>,
  geometry: {
    location: { lat: number, lng: number }
  },
  business_status?: string,
  types?: string[],
  url?: string,
  price_level?: number,
  meta: {
    cached: boolean,
    cachedAt?: string
  }
}
```

**Error Responses:**
- 400: Missing place_id
- 404: Place not found
- 500: Server error

---

### 3. Photo Proxy API

**Endpoint:** `GET /api/photo`

**Parameters:**
- `reference` (required) - Photo reference from PlaceResult or PlaceDetails
- `maxWidth` (optional) - Max width in pixels (1-1600, default: 400)

**Example:**
```
GET /api/photo?reference=AcnlKN39JQ7BN0UgFq_R...&maxWidth=400
```

**Response:** Image file (JPEG/PNG) with proper Content-Type headers

**Usage in HTML:**
```html
<img 
  src="/api/photo?reference={photo_reference}&maxWidth=400" 
  alt="Business photo"
/>
```

---

## TypeScript Types

All types are defined in `/lib/types.ts`:

```typescript
import { ServiceCategory, PlaceResult, PlaceDetails, Review } from '@/lib/types';
```

Key types:
- `ServiceCategory` - Category info (id, name, icon, description)
- `PlaceResult` - Business from search results
- `PlaceDetails` - Full business details
- `Review` - Individual review

---

## Constants Available

From `/lib/constants.ts`:

```typescript
import { SERVICE_CATEGORIES, TEXAS_METROS } from '@/lib/constants';

// SERVICE_CATEGORIES: Array of 7 categories
// Each has: id, name, icon (Lucide icon name), description

// TEXAS_METROS: Object with houston, austin, dfw
// Each has: name, counties[]
```

---

## Frontend Architecture Plan

### Pages to Build

1. **Home Page** (`/app/page.tsx`)
   - Hero section with app description
   - Search form (category picker + location input)
   - Service category cards (visual grid of 7 categories)
   - "How it works" section
   - **Backend Connection:** None (just UI)

2. **Search Results Page** (`/app/search/page.tsx`)
   - Reads `category` and `location` from URL params
   - Calls `/api/search` on mount
   - Displays grid of business cards
   - Loading state while fetching
   - Empty state if no results
   - **Backend Connection:** `GET /api/search`

3. **Business Details Modal/Page** (component or route)
   - Opens when user clicks a business card
   - Calls `/api/place/{id}` to get full details
   - Displays phone, website, hours, reviews, photos
   - Photo gallery using `/api/photo`
   - **Backend Connection:** `GET /api/place/{id}`, `GET /api/photo`

---

### Components to Build

**Search & Navigation:**
- `SearchForm.tsx` - Category + location inputs with submit
- `CategoryPicker.tsx` - Grid/dropdown of 7 service categories with icons
- `LocationInput.tsx` - Text input with Texas validation

**Results Display:**
- `BusinessCard.tsx` - Individual business in search results
- `BusinessGrid.tsx` - Grid layout of BusinessCards
- `EmptyState.tsx` - "No results found" message

**Details View:**
- `BusinessDetails.tsx` - Full details modal/page
- `ReviewCard.tsx` - Individual review display
- `ReviewsList.tsx` - List of reviews
- `PhotoGallery.tsx` - Photo grid/carousel
- `BusinessHours.tsx` - Opening hours display

**UI Elements:**
- `StarRating.tsx` - Star rating display (1-5 stars)
- `LoadingSpinner.tsx` - Loading indicator
- `LoadingSkeleton.tsx` - Skeleton loaders for cards
- `ErrorMessage.tsx` - Error display component
- `Button.tsx` - Reusable button component

---

### User Flow

```
1. User lands on home page
   ↓
2. Selects category (e.g., "Plumbing")
   ↓
3. Enters location (e.g., "Houston")
   ↓
4. Clicks "Search"
   ↓
5. Redirects to /search?category=plumbing&location=Houston
   ↓
6. Search page calls GET /api/search?category=plumbing&location=Houston
   ↓
7. Displays 20 business cards (name, rating, address, thumbnail)
   ↓
8. User clicks on a business card
   ↓
9. Modal/page opens and calls GET /api/place/{place_id}
   ↓
10. Shows full details (phone, website, reviews, photos)
    ↓
11. Photos load using GET /api/photo?reference={ref}
```

---

### Data Fetching Examples

**Search on page load:**
```typescript
// In /app/search/page.tsx
const searchParams = useSearchParams();
const category = searchParams.get('category');
const location = searchParams.get('location');

const [results, setResults] = useState<PlaceResult[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchResults() {
    const response = await fetch(
      `/api/search?category=${category}&location=${location}`
    );
    const data = await response.json();
    setResults(data.results);
    setLoading(false);
  }
  fetchResults();
}, [category, location]);
```

**Fetch details on click:**
```typescript
// In BusinessCard.tsx or Details component
async function loadDetails(placeId: string) {
  setLoading(true);
  const response = await fetch(`/api/place/${placeId}`);
  const details = await response.json();
  setDetails(details);
  setLoading(false);
}
```

---

### Styling Guidelines

**Colors:**
- Primary actions: `bg-primary-600 hover:bg-primary-700`
- Secondary/accent: `bg-accent-500 hover:bg-accent-600`
- Text: `text-neutral-900` (dark), `text-neutral-600` (muted)
- Backgrounds: `bg-neutral-50` (light), `bg-white`

**Typography:**
- Headings: `font-bold text-2xl` or `text-3xl`
- Body: `text-base text-neutral-700`
- Small text: `text-sm text-neutral-500`

**Spacing:**
- Sections: `py-12` or `py-16`
- Cards: `p-6`
- Grid gaps: `gap-6`

**Responsive:**
- Mobile-first approach
- Use `sm:`, `md:`, `lg:` breakpoints
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

### Important Notes

**Cache Awareness:**
- The `meta.cached` flag tells you if data came from cache
- You can show "Last updated: X" using `meta.cachedAt`
- Don't need to implement any caching logic - it's automatic

**Error Handling:**
- Always check response status
- Display user-friendly error messages
- Invalid Texas locations return 400 with helpful message

**Loading States:**
- Show skeleton loaders while fetching
- Disable search button while loading
- Show spinner in details modal while fetching

**Performance:**
- Cached results return in < 300ms
- Fresh API calls take 1-3 seconds
- Use loading indicators appropriately

**Photo Optimization:**
- Use `maxWidth` parameter to control size
- Default 400px is good for cards
- Use 800px+ for detail view/modals

---

## What Frontend Doesn't Need to Worry About

❌ Database queries  
❌ Cache management  
❌ Google API keys  
❌ Rate limiting  
❌ Cost optimization  
❌ Data deduplication  
❌ Search result ranking (Google handles it)

All of this is handled by the backend automatically!
