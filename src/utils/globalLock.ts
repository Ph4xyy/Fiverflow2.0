/**
 * Système de verrouillage global pour éviter les appels multiples simultanés
 */
class GlobalLock {
  private locks = new Map<string, boolean>();

  async acquire(key: string): Promise<boolean> {
    if (this.locks.get(key)) {
      return false; // Déjà verrouillé
    }
    
    this.locks.set(key, true);
    return true;
  }

  release(key: string) {
    this.locks.delete(key);
  }

  isLocked(key: string): boolean {
    return this.locks.has(key);
  }
}

export const globalLock = new GlobalLock();

/**
 * Hook pour utiliser le verrouillage global
 */
export const useGlobalLock = (key: string) => {
  const acquire = async () => {
    return await globalLock.acquire(key);
  };

  const release = () => {
    globalLock.release(key);
  };

  const isLocked = () => {
    return globalLock.isLocked(key);
  };

  return { acquire, release, isLocked };
};

export default globalLock;
