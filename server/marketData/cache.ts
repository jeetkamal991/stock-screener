interface CacheItem<T> {
  data: T;
  expiresAt: number;
  storedAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheItem<any>>();

  // Default TTL configurations (in milliseconds)
  public static TTL = {
    QUOTE: 45 * 1000,          // 45 seconds
    INTRADAY: 60 * 1000,       // 60 seconds
    HISTORICAL: 30 * 60 * 1000,// 30 minutes
    NIFTY: 45 * 1000,          // 45 seconds
    SECTOR: 5 * 60 * 1000,     // 5 minutes
    HEALTH: 10 * 1000,         // 10 seconds
  };

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      expiresAt: now + ttlMs,
      storedAt: now,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  // Periodic cleanup of expired items to prevent memory bloat
  cleanExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }
}

export const marketCache = new MemoryCache();

// Clean cache every 5 minutes
const cleanupInterval = setInterval(() => {
  marketCache.cleanExpired();
}, 5 * 60 * 1000);
if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}
