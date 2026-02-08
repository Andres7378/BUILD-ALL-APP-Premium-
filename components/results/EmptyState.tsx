'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  category: string;
  location: string;
}

export default function EmptyState({ category, location }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="w-16 h-16 text-neutral-300 mb-4" />
      <h2 className="text-xl font-semibold text-neutral-700 mb-2">
        No {category} services found in {location}
      </h2>
      <p className="text-neutral-500 mb-6">
        Try searching in a different area or category.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Try a different search
      </Link>
    </div>
  );
}
