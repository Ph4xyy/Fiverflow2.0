interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AuthCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  getRoleKey(userId: string): string {
    return `role:${userId}`;
  }

  getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  // Vérifie si les données sont encore fraîches (moins de 2 minutes)
  isFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const age = now - entry.timestamp;
    return age < 2 * 60 * 1000; // 2 minutes
  }
}

export const authCache = new AuthCache();