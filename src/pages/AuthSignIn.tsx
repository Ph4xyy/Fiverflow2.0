import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GitHubIcon, GoogleIcon, DiscordIcon } from '../components/OAuthIcons'
import { oauthConfig } from '../lib/oauth-config'

const AuthSignIn: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google' | 'discord') => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: oauthConfig
      })
      if (error) setError(error.message)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-slate-950 text-white flex flex-col">
      {/* Header with diagonal separator and logo + name */}
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#9c68f2] to-[#422ca5]" />
          <div className="h-6 w-px rotate-12 bg-gray-700" />
          <span className="text-lg font-semibold tracking-wide">FiverFlow</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-slate-400">Sign in to your account</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <GitHubIcon className="w-5 h-5 mr-3 text-white" />
                Continue with GitHub
              </button>
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                Continue with Google
              </button>
              <button
                onClick={() => handleSocialLogin('discord')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <DiscordIcon className="w-5 h-5 mr-3 text-indigo-400" />
                Continue with Discord
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-950 text-slate-400">or</span></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-slate-800 rounded-lg bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-slate-800 rounded-lg bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  placeholder="Enter your password"
                />
              </div>
              {error && <div className="text-rose-400 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#9c68f2] hover:bg-[#8655e6] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="text-[#9c68f2] hover:text-[#8655e6]">Sign Up</button>
            </div>
          </div>
        </div>

        {/* Right: branding */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#141726] to-[#0e1020]">
          <div className="max-w-md px-8">
            <h2 className="text-2xl font-bold mb-4">Welcome to FiverFlow</h2>
            <p className="text-slate-400 mb-6">Build, manage and scale your workflow with a modern, fast and secure platform.</p>
            <div className="space-y-4">
              {['Instant navigation','Advanced analytics','Secure by design'].map((t) => (
                <div key={t} className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#9c68f2] flex items-center justify-center mr-4"><span className="text-black text-sm">✓</span></div>
                  <span className="text-slate-200">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthSignIn


