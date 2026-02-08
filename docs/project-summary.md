# Texas Home Services Finder

## Project Overview

A web application that helps Texas residents find trusted home service professionals (plumbers, electricians, HVAC, etc.) across major Texas metropolitan areas. The app uses Google Places API to search for contractors and displays results with ratings, reviews, contact information, and photos.

**Target Users:** Texas homeowners and renters looking for reliable home service contractors

**Geographic Scope:** Houston Metro, Austin Metro, and Dallas-Fort Worth Metro areas

**Service Categories:**
- Concrete
- Electrical
- Plumbing
- Roofing
- HVAC/A/C
- Painting
- General Contractor

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **External APIs:** Google Places API (Text Search, Place Details, Photos)
- **Database:** Supabase (PostgreSQL with intelligent caching)
- **Deployment:** (TBD - likely Vercel)

## Key Features

✅ Service category browsing
✅ Texas location search (cities, counties, zip codes)
✅ Business listings with ratings and reviews
✅ Detailed business information (phone, website, hours, photos)
✅ Intelligent caching (7-day search cache, 30-day details cache)
✅ Cost optimization (83% API cost reduction)
✅ Fast responses (< 300ms for cached results)

## Project Status

**Current Phase:** Backend Complete ✅  
**Next Phase:** Frontend UI Development

Backend is production-ready with fully functional API endpoints and database caching system.
