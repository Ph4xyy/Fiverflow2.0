/**
 * Cache simple pour éviter les appels multiples aux mêmes données
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) { // Default 5 minutes
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
      this.cache.delete(key); // Expired
      return null;
    }

    return entry.data;
  }

  isFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    const now = Date.now();
    return (now - entry.timestamp) <= entry.ttl;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clés spécifiques
  getSubscriptionKey(userId: string) {
    return `subscription_${userId}`;
  }

  getPlanLimitsKey(userId: string) {
    return `plan_limits_${userId}`;
  }

  getClientsKey(userId: string) {
    return `clients_${userId}`;
  }
}

export const dataCache = new DataCache();
export default dataCache;
