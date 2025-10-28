/**
 * Configuration OAuth pour FiverFlow
 * Gère les URLs de redirection selon l'environnement
 */

export const getOAuthRedirectUrl = (): string => {
  // En production, utiliser fiverflow.com
  if (import.meta.env.PROD) {
    return 'https://fiverflow.com/dashboard'
  }
  
  // En développement, utiliser l'URL locale vers le dashboard
  return `${window.location.origin}/dashboard`
}

export const oauthConfig = {
  redirectTo: getOAuthRedirectUrl(),
  queryParams: {
    access_type: 'offline' as const,
    prompt: 'consent' as const,
  }
}
