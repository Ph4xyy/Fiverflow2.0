// Utilitaire pour nettoyer complètement l'authentification et les caches

export const cleanAuthCache = () => {
  console.log('🧹 Cleaning all auth caches...');
  
  try {
    // Nettoyer sessionStorage
    sessionStorage.clear();
    
    // Nettoyer les clés spécifiques de localStorage
    const authKeys = [
      'sb-auth-token',
      'sb-auth-token-code-verifier', 
      'userRole',
      'role',
      'ff-storage-test'
    ];
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key}`);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });
    
    console.log('✅ Auth caches cleaned successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clean auth caches:', error);
    return false;
  }
};

// Pour debug dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).cleanAuthCache = cleanAuthCache;
  console.log('💡 Tip: En cas de problème d\'auth, tapez cleanAuthCache() dans la console puis rechargez la page');
}


