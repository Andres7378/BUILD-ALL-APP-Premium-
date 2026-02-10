'use client';

import SearchForm from '@/components/search/SearchForm';
import LanguageToggle from '@/components/ui/LanguageToggle';
import AIAssistant from '@/components/ui/AIAssistant';
import { useLanguage } from '@/lib/language-context';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative min-h-screen flex items-start pt-24 md:pt-32 px-4">
        {/* Language toggle — top right */}
        <div className="absolute top-5 right-5 z-10">
          <LanguageToggle />
        </div>

        <div className="max-w-6xl mx-auto text-center w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* AI Assistant Floating Chat */}
      <AIAssistant />
    </main>
  );
}
