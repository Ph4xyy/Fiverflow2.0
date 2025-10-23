import React from 'react'
import { useGlobalAuth } from '../contexts/GlobalAuthProvider'
import { Navigate } from 'react-router-dom'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * AdminRoute - Protection des routes d'administration
 * Vérifie que l'utilisateur est authentifié et a les droits admin
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, authReady, authLoading } = useGlobalAuth()

  // Si l'authentification n'est pas encore prête, ne pas afficher de contenu
  if (!authReady && authLoading) {
    return null
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    console.log('🔐 AdminRoute: User not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Si l'utilisateur n'est pas admin, rediriger vers le dashboard
  if (!isAdmin) {
    console.log('🔐 AdminRoute: User is not admin, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // L'utilisateur est admin, autoriser l'accès
  console.log('🔐 AdminRoute: Admin access granted for user:', user.id)
  return <>{children}</>
}

export default AdminRoute