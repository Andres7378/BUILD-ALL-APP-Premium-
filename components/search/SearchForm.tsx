'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import CategoryPicker from './CategoryPicker';
import LocationInput from './LocationInput';
import { useLanguage } from '@/lib/language-context';

export default function SearchForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [locationError, setLocationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!selectedCategory) {
      setCategoryError(t('selectCategory'));
      hasError = true;
    } else {
      setCategoryError('');
    }

    if (!location.trim()) {
      setLocationError(t('enterLocation'));
      hasError = true;
    } else {
      setLocationError('');
    }

    if (hasError) return;

    router.push(`/search?category=${selectedCategory}&location=${encodeURIComponent(location.trim())}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryError) setCategoryError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          {t('serviceQuestion')}
        </label>
        <CategoryPicker selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
        {categoryError && <p className="text-red-500 text-sm mt-2">{categoryError}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <LocationInput value={location} onChange={setLocation} error={locationError} />
        <button
          type="submit"
          className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Search size={20} />
          {t('searchBtn')}
        </button>
      </div>
    </form>
  );
}
