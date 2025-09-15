import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useState, useEffect } from 'react'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('🔐 Checking admin role...')
      
      // If Supabase is not configured, deny access
      if (!isSupabaseConfigured || !supabase) {
        console.log('❌ Supabase not configured, denying admin access')
        setUserRole('user')
        setLoading(false)
        return
      }

      if (!user) {
        console.log('❌ No user found')
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Querying user role...')
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('❌ Error fetching user role:', error)
          setUserRole('user')
        } else {
          const role = data?.role || 'user'
          console.log('✅ User role:', role)
          setUserRole(role)
        }
      } catch (error) {
        console.error('💥 Unexpected error checking admin role:', error)
        setUserRole('user')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdminRole()
    }
  }, [user, authLoading])

  // Show loading while checking auth and role
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user is not admin, redirect to dashboard
  if (userRole !== 'admin') {
    console.log('🚫 Access denied: user role is', userRole)
    return <Navigate to="/dashboard" replace />
  }

  console.log('✅ Admin access granted')
  return <>{children}</>
}

export default AdminRoute