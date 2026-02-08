'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PlaceResult } from '@/lib/types';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import BusinessGrid from '@/components/results/BusinessGrid';
import EmptyState from '@/components/results/EmptyState';

interface SearchMeta {
  category: string;
  location: string;
  metro?: string;
  count: number;
  cached: boolean;
  cachedAt?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';

  const [results, setResults] = useState<PlaceResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the display name for the category
  const categoryInfo = SERVICE_CATEGORIES.find((c) => c.id === category);
  const categoryName = categoryInfo?.name || category;

  const fetchResults = useCallback(async () => {
    if (!category || !location) {
      setError('Missing search parameters. Please select a category and location.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/search?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setResults(data.results);
      setMeta(data.meta);
    } catch {
      setError('Failed to fetch results. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [category, location]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSelectBusiness = (placeId: string) => {
    console.log('Selected business:', placeId);
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-neutral-600 text-lg">
              Searching for {categoryName.toLowerCase()} contractors...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
              <p className="text-red-700 font-medium mb-4">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Try a different search
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {results.length > 0 ? (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-neutral-800">
                    {meta?.count ?? results.length} {categoryName} contractor
                    {(meta?.count ?? results.length) !== 1 ? 's' : ''} in {location}
                  </h1>
                  {meta?.cached && meta.cachedAt && (
                    <p className="text-sm text-neutral-400 mt-1">
                      Cached results from{' '}
                      {new Date(meta.cachedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <BusinessGrid
                  businesses={results}
                  onSelectBusiness={handleSelectBusiness}
                />
              </>
            ) : (
              <EmptyState category={categoryName} location={location} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-neutral-600 text-lg">Loading...</p>
          </div>
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
