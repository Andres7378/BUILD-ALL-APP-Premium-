'use client';

import { PlaceResult } from '@/lib/types';
import BusinessCard from './BusinessCard';

interface BusinessGridProps {
  businesses: PlaceResult[];
  onSelectBusiness: (placeId: string) => void;
}

export default function BusinessGrid({ businesses, onSelectBusiness }: BusinessGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessCard
          key={business.place_id}
          business={business}
          onSelect={onSelectBusiness}
        />
      ))}
    </div>
  );
}
