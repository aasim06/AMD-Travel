type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Get cached item if present and not expired
 */
export function getCachedData<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store item in memory cache with TTL in seconds
 */
export function setCachedData<T>(key: string, data: T, ttlSeconds: number = 30): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate cache key or pattern
 */
export function invalidateCache(keyPrefix: string): void {
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k);
    }
  }
}
