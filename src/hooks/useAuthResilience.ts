// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

interface AuthResilienceConfig {
  onSessionRestored: (session: any) => void;
  onSessionLost: () => void;
  maxRetries?: number;
  baseDelay?: number;
}

export const useAuthResilience = (config: AuthResilienceConfig) => {
  return {
    attemptSessionRefresh: async () => null
  };
};
