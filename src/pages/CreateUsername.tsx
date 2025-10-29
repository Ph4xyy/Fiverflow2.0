import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Check, X, User, ArrowRight } from 'lucide-react'

const CreateUsername: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
    }
    checkAuth()
  }, [navigate])

  const validateUsername = (value: string) => {
    const regex = /^[a-zA-Z0-9_-]{3,20}$/
    return regex.test(value)
  }

  const checkUsernameAvailability = async (value: string) => {
    if (!validateUsername(value)) {
      setIsValid(false)
      return
    }

    setIsChecking(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', value)
        .single()

      if (error && error.code === 'PGRST116') {
        // Username disponible
        setIsValid(true)
        setError('')
      } else if (data) {
        // Username déjà pris
        setIsValid(false)
        setError('Ce nom d\'utilisateur est déjà pris')
      } else {
        setIsValid(false)
        setError('Erreur lors de la vérification')
      }
    } catch (err) {
      setIsValid(false)
      setError('Erreur lors de la vérification')
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setError('')
    
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setIsValid(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Session expirée. Veuillez vous reconnecter.')
        navigate('/login')
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ username })
        .eq('user_id', session.user.id)

      if (error) {
        setError('Erreur lors de la mise à jour du nom d\'utilisateur.')
        return
      }

      console.log('✅ Username créé avec succès:', username)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Une erreur inattendue s\'est produite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#9c68f2] rounded-xl mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choisissez votre nom d'utilisateur</h1>
          <p className="text-slate-400">Ce nom sera visible par les autres utilisateurs</p>
        </div>

        {/* Formulaire */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    isValid 
                      ? 'border-green-500 focus:ring-green-500' 
                      : error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-600 focus:ring-[#9c68f2]'
                  }`}
                  placeholder="votre_nom_utilisateur"
                  required
                  minLength={3}
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isChecking ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : isValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : username.length > 0 ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              
              {/* Règles de validation */}
              <div className="mt-2 text-xs text-slate-400">
                <p>• 3-20 caractères</p>
                <p>• Lettres, chiffres, tirets et underscores uniquement</p>
                <p>• Doit être unique</p>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-[#9c68f2] hover:bg-[#8655e6] disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Lien de déconnexion */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                supabase.auth.signOut()
                navigate('/login')
              }}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateUsername
