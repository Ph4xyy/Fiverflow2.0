import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Shield, AlertCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'

interface AdminRouteProps {
  children: React.ReactNode
}

interface UserProfile {
  role: string
}

/**
 * AdminRoute - Protection des routes admin
 * Vérifie que l'utilisateur est connecté et a le rôle admin ou moderator
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return

      if (!user) {
        setError('Vous devez être connecté pour accéder à cette page')
        setLoading(false)
        return
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          setError('Erreur lors de la vérification des permissions')
          setLoading(false)
          return
        }

        if (!profile || !['Admin', 'Moderator'].includes(profile.role)) {
          setError('Accès refusé: Rôle administrateur ou modérateur requis')
          setLoading(false)
          return
        }

        setUserProfile(profile)
        setLoading(false)
      } catch (err) {
        console.error('Error checking admin access:', err)
        setError('Erreur lors de la vérification des permissions')
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="animate-pulse text-indigo-600" size={48} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Vérification des permissions...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vérification de votre accès administrateur en cours.
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Rôles autorisés: Admin, Moderator</p>
              <p>Votre rôle actuel: {userProfile?.role || 'Non défini'}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return <>{children}</>
}

export default AdminRoute