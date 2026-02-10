'use client';

import { useLanguage } from '@/lib/language-context';

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all duration-200 text-white text-sm font-medium cursor-pointer"
      aria-label={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <span className="text-lg leading-none">{lang === 'en' ? '🇪🇸' : '🇺🇸'}</span>
      <span>{t('langSwitch')}</span>
    </button>
  );
}
