/**
 * Google Places API Investigation Script
 * 
 * Purpose: Understand exactly what data the API returns
 * Run with: npx tsx scripts/investigate-api.ts
 * 
 * Make sure to:
 * 1. Create .env.local with GOOGLE_PLACES_API_KEY
 * 2. Install tsx: npm install -D tsx
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

if (!API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY not found in .env.local');
  process.exit(1);
}

interface InvestigationResults {
  timestamp: string;
  testSearches: TestSearch[];
  detailsExamples: DetailsExample[];
  insights: {
    searchFields: string[];
    detailsFields: string[];
    optionalFields: string[];
    dataTypes: Record<string, string>;
  };
}

interface TestSearch {
  query: string;
  resultCount: number;
  sampleResult?: any;
  allFieldsFound: string[];
}

interface DetailsExample {
  placeName: string;
  placeId: string;
  allFieldsFound: string[];
  hasReviews: boolean;
  reviewCount?: number;
  hasPhotos: boolean;
  photoCount?: number;
  sampleData?: any;
}

async function investigateAPI() {
  console.log('🔍 Starting Google Places API Investigation...\n');
  
  const results: InvestigationResults = {
    timestamp: new Date().toISOString(),
    testSearches: [],
    detailsExamples: [],
    insights: {
      searchFields: [],
      detailsFields: [],
      optionalFields: [],
      dataTypes: {},
    },
  };

  // Test searches to understand Text Search API
  const testQueries = [
    'plumbing contractor in Houston, Texas',
    'electrical services near Austin, TX',
    'HVAC repair in Dallas, Texas',
  ];

  console.log('📋 PART 1: TEXT SEARCH API INVESTIGATION\n');
  console.log('='.repeat(60));

  for (const query of testQueries) {
    console.log(`\n🔎 Testing query: "${query}"`);
    
    try {
      const params = new URLSearchParams({
        query,
        key: API_KEY!,
      });

      const response = await fetch(`${TEXT_SEARCH_URL}?${params}`);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`❌ API Error: ${data.status}`, data.error_message);
        continue;
      }

      const resultCount = data.results?.length || 0;
      console.log(`   ✅ Found ${resultCount} results`);

      if (resultCount > 0) {
        const firstResult = data.results[0];
        const fields = getAllFields(firstResult);
        
        console.log(`   📊 Fields in first result: ${fields.length}`);
        console.log(`   📝 Fields: ${fields.join(', ')}`);

        results.testSearches.push({
          query,
          resultCount,
          sampleResult: firstResult,
          allFieldsFound: fields,
        });

        // Save full first result for inspection
        const filename = `search-result-${query.split(' ')[0]}.json`;
        saveJSON(filename, firstResult);
        console.log(`   💾 Saved sample to: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error testing query "${query}":`, error);
    }
  }

  console.log('\n\n📋 PART 2: PLACE DETAILS API INVESTIGATION\n');
  console.log('='.repeat(60));

  // Get some place IDs from our searches to test details
  const placeIdsToTest = results.testSearches
    .flatMap(search => search.sampleResult ? [search.sampleResult] : [])
    .slice(0, 3)
    .map(result => ({ id: result.place_id, name: result.name }));

  for (const place of placeIdsToTest) {
    console.log(`\n🏢 Testing place: "${place.name}"`);
    
    try {
      const params = new URLSearchParams({
        place_id: place.id,
        key: API_KEY!,
        fields: 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,opening_hours,photos,geometry,business_status,types,url,price_level',
      });

      const response = await fetch(`${DETAILS_URL}?${params}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error(`❌ API Error: ${data.status}`, data.error_message);
        continue;
      }

      const details = data.result;
      const fields = getAllFields(details);
      
      console.log(`   📊 Total fields: ${fields.length}`);
      console.log(`   📝 Fields: ${fields.join(', ')}`);
      console.log(`   ⭐ Rating: ${details.rating || 'N/A'}`);
      console.log(`   📝 Reviews: ${details.reviews?.length || 0}`);
      console.log(`   📸 Photos: ${details.photos?.length || 0}`);
      console.log(`   📞 Phone: ${details.formatted_phone_number || 'N/A'}`);
      console.log(`   🌐 Website: ${details.website || 'N/A'}`);

      results.detailsExamples.push({
        placeName: place.name,
        placeId: place.id,
        allFieldsFound: fields,
        hasReviews: !!details.reviews && details.reviews.length > 0,
        reviewCount: details.reviews?.length,
        hasPhotos: !!details.photos && details.photos.length > 0,
        photoCount: details.photos?.length,
        sampleData: details,
      });

      // Save full details for inspection
      const filename = `place-details-${place.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      saveJSON(filename, details);
      console.log(`   💾 Saved details to: ${filename}`);
    } catch (error) {
      console.error(`❌ Error testing place "${place.name}":`, error);
    }
  }

  console.log('\n\n📋 PART 3: DATA ANALYSIS\n');
  console.log('='.repeat(60));

  // Analyze what fields are common vs optional
  const allSearchFields = new Set<string>();
  const allDetailsFields = new Set<string>();

  results.testSearches.forEach(search => {
    search.allFieldsFound.forEach(field => allSearchFields.add(field));
  });

  results.detailsExamples.forEach(example => {
    example.allFieldsFound.forEach(field => allDetailsFields.add(field));
  });

  results.insights.searchFields = Array.from(allSearchFields).sort();
  results.insights.detailsFields = Array.from(allDetailsFields).sort();

  // Fields only in details (not in search)
  const detailsOnlyFields = Array.from(allDetailsFields)
    .filter(field => !allSearchFields.has(field))
    .sort();

  console.log('\n🔍 SEARCH API FIELDS:');
  console.log(`   Total unique fields: ${results.insights.searchFields.length}`);
  console.log(`   Fields: ${results.insights.searchFields.join(', ')}`);

  console.log('\n🔍 DETAILS API FIELDS:');
  console.log(`   Total unique fields: ${results.insights.detailsFields.length}`);
  console.log(`   Fields: ${results.insights.detailsFields.join(', ')}`);

  console.log('\n🔍 DETAILS-ONLY FIELDS (not in search):');
  console.log(`   Total: ${detailsOnlyFields.length}`);
  console.log(`   Fields: ${detailsOnlyFields.join(', ')}`);

  console.log('\n\n📋 PART 4: RECOMMENDATIONS FOR DATABASE SCHEMA\n');
  console.log('='.repeat(60));

  console.log('\n💡 Based on investigation:');
  console.log('\n1️⃣  SEARCH TABLE (basic info from Text Search):');
  console.log('   - Always present: place_id, name, formatted_address, geometry');
  console.log('   - Often present: rating, user_ratings_total, types');
  console.log('   - Sometimes present: opening_hours, photos, business_status');

  console.log('\n2️⃣  DETAILS TABLE (additional info from Place Details):');
  console.log('   - Contact: formatted_phone_number, website');
  console.log('   - Reviews: reviews[] (can be large!)');
  console.log('   - Hours: opening_hours.weekday_text, periods');
  console.log('   - Other: price_level, url');

  console.log('\n3️⃣  STORAGE STRATEGY:');
  console.log('   ✅ Store basic info immediately (from search)');
  console.log('   ✅ Lazy-load details (only when user clicks)');
  console.log('   ✅ Reviews in separate table (can be 5+ per place)');
  console.log('   ✅ Photos as references only (fetch on demand)');

  // Save complete results
  saveJSON('investigation-results.json', results);
  console.log('\n\n✅ Investigation complete!');
  console.log('📁 All results saved to scripts/output/');
  console.log('📄 Review investigation-results.json for complete data\n');
}

/**
 * Recursively get all field names from an object
 */
function getAllFields(obj: any, prefix = ''): string[] {
  const fields: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    fields.push(fullKey);
    
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      // Recurse for nested objects (but not arrays)
      fields.push(...getAllFields(obj[key], fullKey));
    }
  }
  
  return fields;
}

/**
 * Save JSON to output directory
 */
function saveJSON(filename: string, data: any) {
  const outputDir = path.join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Run investigation
investigateAPI().catch(console.error);
