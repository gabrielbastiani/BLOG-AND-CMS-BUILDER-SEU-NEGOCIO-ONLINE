'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';

type ConsentStore = {
  consented: boolean;
  setConsented: (value: boolean) => void;
};

export const useConsentStore = create<ConsentStore>((set) => ({
  consented: false,
  setConsented: (value) => set({ consented: value }),
}));

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { consented, setConsented } = useConsentStore();

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent !== 'true') setIsVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setConsented(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
        <p className="text-gray-600 text-sm">
          Nós usamos cookies para melhorar sua experiência. Leia nossa{' '}
          <a href="/politica-de-privacidade" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Aceitar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}