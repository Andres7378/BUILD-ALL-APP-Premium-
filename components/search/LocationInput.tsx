'use client';

import { MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function LocationInput({ value, onChange, error }: LocationInputProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('locationPlaceholder')}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 ${
            error ? 'border-red-400' : 'border-neutral-300'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
