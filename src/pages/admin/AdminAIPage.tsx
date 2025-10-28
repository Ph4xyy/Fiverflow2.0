import React, { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import AdminNavigation from '../../components/AdminNavigation'
import { useAdminAI } from '../../hooks/useAdminAI'
import { AIResponse } from '../../services/adminService'
import {
  Bot,
  Send,
  RefreshCw,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Sparkles,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminAIPage: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [context, setContext] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string
    prompt: string
    response: AIResponse
    timestamp: Date
  }>>([])

  const { generateInsights, loading, error, lastResponse } = useAdminAI()

  const predefinedPrompts = [
    {
      title: 'Analyse des revenus',
      prompt: 'Analyse les tendances de revenus et identifie les opportunités d\'amélioration',
      icon: TrendingUp
    },
    {
      title: 'Performance utilisateurs',
      prompt: 'Évalue la performance des utilisateurs et suggère des actions pour améliorer la rétention',
      icon: BarChart3
    },
    {
      title: 'Optimisation des abonnements',
      prompt: 'Analyse les données d\'abonnement et propose des stratégies d\'optimisation',
      icon: Lightbulb
    },
    {
      title: 'Rapport complet',
      prompt: 'Génère un rapport complet sur l\'état actuel de la plateforme avec recommandations',
      icon: MessageSquare
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      toast.error('Veuillez saisir une question')
      return
    }

    try {
      const response = await generateInsights(prompt, context)
      
      const newChat = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        response,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [newChat, ...prev])
      setPrompt('')
      setContext('')
      
      toast.success('Analyse générée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la génération de l\'analyse')
    }
  }

  const handlePredefinedPrompt = (predefinedPrompt: string) => {
    setPrompt(predefinedPrompt)
  }

  const clearHistory = () => {
    setChatHistory([])
    toast.success('Historique effacé')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Assistant IA
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Analyse intelligente de vos données business
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Effacer
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur de l'assistant IA
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Poser une question
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Analyse les tendances de revenus du dernier mois..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contexte (optionnel)
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ajoutez du contexte spécifique si nécessaire..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Analyser
                    </>
                  )}
                </button>
              </form>

              {/* Predefined Prompts */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Questions prédéfinies
                </h4>
                <div className="space-y-2">
                  {predefinedPrompts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handlePredefinedPrompt(item.prompt)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Réponses de l'IA
              </h3>

              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Bienvenue dans l'assistant IA
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Posez une question pour commencer l'analyse de vos données business.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="border-b border-gray-200 dark:border-slate-700 pb-6 last:border-b-0">
                      {/* Question */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Question
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(chat.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {chat.prompt}
                        </p>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Réponse IA
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-lg">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                              {chat.response.summary}
                            </p>
                          </div>

                          {/* Insights */}
                          {chat.response.insights.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                Insights clés
                              </h5>
                              <ul className="space-y-1">
                                {chat.response.insights.map((insight, index) => (
                                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommendations */}
                          {chat.response.recommendations.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                Recommandations
                              </h5>
                              <ul className="space-y-1">
                                {chat.response.recommendations.map((recommendation, index) => (
                                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                    <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    {recommendation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAIPage
