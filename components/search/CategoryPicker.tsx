'use client';

import { SERVICE_CATEGORIES } from '@/lib/constants';
import {
  Blocks,
  Zap,
  Droplet,
  Home,
  Wind,
  Paintbrush,
  Hammer,
  Waves,
} from 'lucide-react';
import React from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Blocks,
  Zap,
  Droplet,
  Home,
  Wind,
  Paintbrush,
  Hammer,
  Waves,
};

interface CategoryPickerProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string) => void;
}

export default function CategoryPicker({ selectedCategory, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {SERVICE_CATEGORIES.map((category) => {
        const IconComponent = iconMap[category.icon];
        const isSelected = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-neutral-200 bg-white hover:shadow hover:border-primary-300'
            }`}
          >
            {IconComponent && (
              <IconComponent
                className={`mb-2 ${isSelected ? 'text-primary-600' : 'text-neutral-500'}`}
                size={28}
              />
            )}
            <span className={`font-semibold text-sm ${isSelected ? 'text-primary-700' : 'text-neutral-800'}`}>
              {category.name}
            </span>
            <span className="text-xs text-neutral-500 mt-1 leading-tight">
              {category.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
