import React from 'react'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * 🔥 AUTHENTIFICATION SUPPRIMÉE - AdminRoute simplifié
 * Plus de vérification d'admin, toutes les routes sont publiques
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Plus de vérification d'admin
  console.log('🔐 AdminRoute: Auth disabled - allowing access to admin routes')
  
  return <>{children}</>
}

export default AdminRoute