// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

export const useSessionManager = () => {
  return {
    checkAndRefreshSession: async () => {},
    isSessionHealthy: true
  };
};
