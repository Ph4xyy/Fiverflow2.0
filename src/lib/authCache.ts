/**
 * Cache système pour éviter les requêtes d'authentification répétitives
 * et les états de loading multiples
 */

interface AuthCacheData {
  user: any;
  role: string | null;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class AuthCache {
  private cache: Map<string, AuthCacheData> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: Partial<AuthCacheData>, ttl?: number): void {
    const now = Date.now();
    this.cache.set(key, {
      user: data.user || null,
      role: data.role || null,
      timestamp: now,
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  get(key: string): AuthCacheData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  has(key: string): boolean {
    const cached = this.get(key);
    return cached !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp > data.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Cache key generators
  getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  getRoleKey(userId: string): string {
    return `role:${userId}`;
  }
}

export const authCache = new AuthCache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  authCache.clearExpired();
}, 10 * 60 * 1000);

