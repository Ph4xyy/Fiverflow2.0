/**
 * Mutex simple pour éviter les appels multiples simultanés
 */
class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async lock(): Promise<() => void> {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve(() => this.unlock());
      } else {
        this.queue.push(() => {
          this.locked = true;
          resolve(() => this.unlock());
        });
      }
    });
  }

  private unlock() {
    this.locked = false;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}

export const mutex = new Mutex();

/**
 * Hook pour utiliser le mutex dans les hooks
 */
export const useMutex = () => {
  return mutex;
};

export default mutex;
