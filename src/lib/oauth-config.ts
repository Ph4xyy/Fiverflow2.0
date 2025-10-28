/**
 * Configuration OAuth pour FiverFlow
 * Gère les URLs de redirection selon l'environnement
 */

export const getOAuthRedirectUrl = (): string => {
  // En production, utiliser l'URL Vercel
  if (import.meta.env.PROD) {
    // Récupérer l'URL depuis les variables d'environnement ou utiliser une valeur par défaut
    const prodUrl = import.meta.env.VITE_APP_URL || 'https://fiverflow2-0.vercel.app'
    return `${prodUrl}/auth/callback`
  }
  
  // En développement, utiliser l'URL locale
  return `${window.location.origin}/auth/callback`
}

export const oauthConfig = {
  redirectTo: getOAuthRedirectUrl(),
  queryParams: {
    access_type: 'offline' as const,
    prompt: 'consent' as const,
  }
}
