// 🔥 AUTHENTIFICATION SUPPRIMÉE - Hook factice pour éviter les erreurs de compilation

interface InstantAuthState {
  user: any;
  role: string | null;
  roleLoading: boolean;
  isReady: boolean;
}

export const useInstantAuth = (): InstantAuthState => {
  return {
    user: null,
    role: null,
    roleLoading: false,
    isReady: true
  };
};
