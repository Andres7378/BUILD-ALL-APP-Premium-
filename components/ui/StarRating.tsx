'use client';

import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
}

export default function StarRating({ rating, totalReviews }: StarRatingProps) {
  const { t } = useLanguage();
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rounded >= star;
          const isHalf = !isFull && rounded >= star - 0.5;

          return (
            <Star
              key={star}
              className={`w-4 h-4 ${
                isFull || isHalf
                  ? 'fill-accent-500 text-accent-500'
                  : 'text-neutral-300'
              }`}
            />
          );
        })}
      </div>
      <span className="text-sm text-neutral-600">
        {rating.toFixed(1)}
        {totalReviews !== undefined && ` (${totalReviews.toLocaleString()} ${t('reviews')})`}
      </span>
    </div>
  );
}
