import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer la session depuis l'URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          setError('Erreur de connexion. Veuillez réessayer.')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (data.session) {
          console.log('✅ Session trouvée, utilisateur connecté:', data.session.user.email)
          
          // Vérifier si l'utilisateur a un profil
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Erreur lors de la récupération du profil:', profileError)
            setError('Erreur lors de la récupération du profil.')
            setTimeout(() => navigate('/login'), 3000)
            return
          }

          // Si l'utilisateur n'a pas de profil, le créer
          if (!profile) {
            console.log('🔄 Création du profil utilisateur...')
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.session.user.id,
                email: data.session.user.email,
                full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
                username: data.session.user.user_metadata?.preferred_username || 
                         data.session.user.user_metadata?.user_name ||
                         data.session.user.email?.split('@')[0],
                subscription: 'Lunch',
                role: 'member',
                created_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Erreur lors de la création du profil:', insertError)
              setError('Erreur lors de la création du profil.')
              setTimeout(() => navigate('/login'), 3000)
              return
            }
          }

          // Vérifier si l'utilisateur a besoin de créer un username
          if (profile && !profile.username) {
            console.log('🔄 Redirection vers la création d\'username...')
            navigate('/create-username')
            return
          }

          // Rediriger vers le dashboard
          console.log('✅ Redirection vers le dashboard...')
          navigate('/dashboard')
        } else {
          console.log('❌ Aucune session trouvée')
          setError('Aucune session active trouvée.')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (err: any) {
        console.error('Erreur inattendue:', err)
        setError('Une erreur inattendue s\'est produite.')
        setTimeout(() => navigate('/login'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#9c68f2] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connexion en cours...</h2>
          <p className="text-slate-400">Veuillez patienter pendant que nous vous connectons.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de connexion</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#9c68f2] hover:bg-[#8655e6] text-white font-medium rounded-lg transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback
