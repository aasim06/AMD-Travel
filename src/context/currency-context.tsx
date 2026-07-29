"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type CurrencyCode, formatPrice as _formatPrice } from "@/lib/currency";

const STORAGE_KEY = "amd_currency";

interface CurrencyContextValue {
  currency:    CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency:    "USD",
  setCurrency: () => {},
  formatPrice: (n) => _formatPrice(n, "USD"),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && stored in { USD: 1, EUR: 1, PKR: 1 }) setCurrencyState(stored);
    } catch { /* noop */ }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* noop */ }
  }, []);

  const formatPrice = useCallback(
    (amountInUSD: number) => _formatPrice(amountInUSD, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
