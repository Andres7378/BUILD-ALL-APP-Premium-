'use client';

import { MapPin, ImageOff } from 'lucide-react';
import { PlaceResult } from '@/lib/types';
import StarRating from '@/components/ui/StarRating';

interface BusinessCardProps {
  business: PlaceResult;
  onSelect: (placeId: string) => void;
}

export default function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const photoRef = business.photos?.[0]?.photo_reference;

  return (
    <div
      onClick={() => onSelect(business.place_id)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-200 overflow-hidden cursor-pointer"
    >
      {/* Photo */}
      {photoRef ? (
        <img
          src={`/api/photo?reference=${photoRef}&maxWidth=400`}
          alt={business.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
          <ImageOff className="w-12 h-12 text-neutral-300" />
        </div>
      )}

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-neutral-800 mb-1">
          {business.name}
        </h3>

        {business.rating !== undefined && (
          <div className="mb-2">
            <StarRating
              rating={business.rating}
              totalReviews={business.user_ratings_total}
            />
          </div>
        )}

        <div className="flex items-start gap-1.5 text-sm text-neutral-600 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{business.formatted_address}</span>
        </div>

        {business.opening_hours?.open_now !== undefined && (
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              business.opening_hours.open_now
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {business.opening_hours.open_now ? 'Open' : 'Closed'}
          </span>
        )}
      </div>
    </div>
  );
}
