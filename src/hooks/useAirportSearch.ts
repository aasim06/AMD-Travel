"use client";

import { useState, useEffect } from "react";
import { POPULAR_AIRPORTS, type AirportOption } from "@/lib/data/airportsData";

export interface UseAirportSearchResult {
  results: AirportOption[];
  isLoading: boolean;
  error: string | null;
}

export function useAirportSearch(query: string, delay = 300): UseAirportSearchResult {
  const [results, setResults] = useState<AirportOption[]>(() => POPULAR_AIRPORTS.slice(0, 6));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    // If query is too short, reset to popular defaults (max 6)
    if (trimmed.length < 2) {
      setResults(POPULAR_AIRPORTS.slice(0, 6));
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?keyword=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: AirportOption[] = await res.json();
        setResults(data.slice(0, 6));
        setIsLoading(false);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        console.error("[useAirportSearch] Fetch error:", err);
        setError("Unable to load location suggestions");
        setIsLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, delay]);

  return { results, isLoading, error };
}
