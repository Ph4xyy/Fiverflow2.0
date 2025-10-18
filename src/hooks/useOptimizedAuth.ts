// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

interface OptimizedAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
}

export const useOptimizedAuth = (): OptimizedAuthState => {
  return {
    user: null,
    loading: false,
    role: null,
    roleLoading: false
  };
};
