"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type CurrencyCode, formatPrice as _formatPrice } from "@/lib/currency";
import { type Language, getTranslation } from "@/lib/i18n/translations";

const STORAGE_KEY = "amd_currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  language: Language;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  t: (key: string, fallback?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "EUR",
  language: "de",
  setCurrency: () => {},
  formatPrice: (n) => _formatPrice(n, "EUR"),
  t: (key, fallback) => getTranslation("de", key, fallback),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EUR");
  const language: Language = currency === "USD" ? "en" : "de";

  // Sync html lang attribute
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && (stored === "USD" || stored === "EUR")) {
        setCurrencyState(stored);
      }
    } catch {
      /* noop */
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* noop */
    }
  }, []);

  const formatPrice = useCallback(
    (amountInUSD: number) => _formatPrice(amountInUSD, currency),
    [currency]
  );

  const t = useCallback(
    (key: string, fallback?: string) => getTranslation(language, key, fallback),
    [language]
  );

  return (
    <CurrencyContext.Provider value={{ currency, language, setCurrency, formatPrice, t }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
