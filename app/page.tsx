'use client';

import SearchForm from '@/components/search/SearchForm';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 min-h-screen flex items-start pt-24 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Trusted Home Service Pros in Texas
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
            Compare ratings, read reviews, and connect with top-rated contractors across Houston,
            Austin, and Dallas-Fort Worth.
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>
    </main>
  );
}
