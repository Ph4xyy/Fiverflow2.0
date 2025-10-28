import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { oauthConfig } from '../lib/oauth-config'

const OAuthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const getDebugInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      setDebugInfo({
        currentUrl: window.location.href,
        origin: window.location.origin,
        oauthRedirectUrl: oauthConfig.redirectTo,
        isProduction: import.meta.env.PROD,
        viteAppUrl: import.meta.env.VITE_APP_URL,
        session: session ? 'Connected' : 'Not connected',
        userEmail: session?.user?.email || 'N/A'
      })
    }

    getDebugInfo()
  }, [])

  const testOAuth = async (provider: 'github' | 'google' | 'discord') => {
    console.log('Testing OAuth with config:', oauthConfig)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: oauthConfig
    })
    if (error) console.error('OAuth Error:', error)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Debug Information</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">OAuth Test Buttons</h2>
          <div className="space-x-4">
            <button
              onClick={() => testOAuth('github')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
            >
              Test GitHub
            </button>
            <button
              onClick={() => testOAuth('google')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Test Google
            </button>
            <button
              onClick={() => testOAuth('discord')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
            >
              Test Discord
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Vérifiez que l'URL de redirection pointe vers /dashboard</li>
            <li>Testez un bouton OAuth et regardez la console</li>
            <li>Configurez Supabase Dashboard avec les URLs /dashboard</li>
            <li>En production, ça redirigera vers fiverflow.com/dashboard</li>
            <li>En développement, ça redirigera vers localhost:5173/dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default OAuthDebug
