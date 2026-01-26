import React from 'react';
import { useStore } from '@nanostores/react';
import { locale, type Language } from '../stores/i18n';
import { Globe } from 'lucide-react';
import { clsx } from 'clsx';

export default function LanguageSelector() {
  const currentLocale = useStore(locale);

  const toggleLanguage = () => {
    locale.set(currentLocale === 'en' ? 'es' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-bold text-gray-600 border border-gray-200"
      title="Switch Language"
    >
      <Globe size={16} />
      <span className="uppercase">{currentLocale}</span>
    </button>
  );
}