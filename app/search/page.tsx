'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PlaceResult } from '@/lib/types';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import BusinessGrid from '@/components/results/BusinessGrid';
import EmptyState from '@/components/results/EmptyState';
import LanguageToggle from '@/components/ui/LanguageToggle';
import AIAssistant from '@/components/ui/AIAssistant';
import { useLanguage } from '@/lib/language-context';

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
  const { t, lang } = useLanguage();
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';

  const [results, setResults] = useState<PlaceResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the display name for the category
  const categoryInfo = SERVICE_CATEGORIES.find((c) => c.id === category);
  const categoryName = categoryInfo ? t(categoryInfo.id) : category;

  const fetchResults = useCallback(async () => {
    if (!category || !location) {
      setError(t('missingParams'));
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
        setError(data.error || t('fetchError'));
        return;
      }

      setResults(data.results);
      setMeta(data.meta);
    } catch {
      setError(t('fetchError'));
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
      {/* Top bar */}
      <div className="bg-primary-900 text-white px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-primary-200 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToSearch')}
        </Link>
        <LanguageToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-neutral-600 text-lg">
              {t('searching')} {categoryName.toLowerCase()} {t('contractors')}...
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
                {t('tryDifferent')}
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
                    {meta?.count ?? results.length} {categoryName}{' '}
                    {(meta?.count ?? results.length) !== 1
                      ? t('contractorPlural')
                      : t('contractorSingular')}{' '}
                    {t('inLocation')} {location}
                  </h1>
                  {meta?.cached && meta.cachedAt && (
                    <p className="text-sm text-neutral-400 mt-1">
                      {t('cachedFrom')}{' '}
                      {new Date(meta.cachedAt).toLocaleDateString(
                        lang === 'es' ? 'es-MX' : 'en-US'
                      )}
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

      {/* AI Assistant */}
      <AIAssistant />
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
