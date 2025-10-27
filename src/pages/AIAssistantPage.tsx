/**
 * Page Assistant AI - Interface style ChatGPT
 * Accès réservé au plan Scale ou aux admins
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscriptionPermissions } from '../hooks/useSubscriptionPermissions';
import { parseIntent } from '../lib/assistant/intent';
import { assistantExecute } from '../lib/assistant/actions';
import { QUICK_EXAMPLES, getExamplesForLanguage } from '../lib/assistant/examples';
import { AssistantMessage } from '../types/assistant';
import { 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Trash2, 
  Sparkles,
  Loader2,
  MessageSquare,
  Lightbulb,
  Sparkles as SparklesIcon,
  Zap,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const permissions = useSubscriptionPermissions();
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<AssistantMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Extract permission values - with safe fallbacks
  const subscription = (permissions && 'subscription' in permissions) ? permissions.subscription : null;
  const isUserAdmin = (permissions && 'isAdmin' in permissions) ? permissions.isAdmin : false;
  const permissionsLoading = (permissions && 'loading' in permissions) ? permissions.loading : false;

  // Detect user language
  const userLanguage = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const examples = getExamplesForLanguage(userLanguage);

  // Check if user has scale plan access OR is admin
  const planName = subscription && 'plan_name' in subscription ? subscription.plan_name : '';
  const hasScaleAccess = isUserAdmin || 
                        planName?.toLowerCase() === 'scale' || 
                        planName?.toLowerCase() === 'teams';

  // Loading state - only show if user exists and still loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Upsell screen for non-scale users
  if (!hasScaleAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Assistant AI (réservé au plan Scale)
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
              Passez à Scale pour débloquer l'assistant intelligent, capable de créer vos clients, tâches et événements automatiquement.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Création multi-tâches en une commande</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Créez plusieurs tâches, clients et événements simultanément via des commandes naturelles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Actions directes sur vos clients et commandes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gérez vos données business sans quitter le chat.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Planification intelligente dans votre calendrier</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Organisez automatiquement vos rendez-vous et échéances.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/billing')}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Voir les plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasScaleAccess && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, hasScaleAccess]);

  // Initial welcome message
  useEffect(() => {
    if (!hasScaleAccess || messages.length !== 0) return;
    
    const welcomeMessage: AssistantMessage = {
      id: 'welcome',
      type: 'assistant',
      content: userLanguage === 'fr' 
        ? '👋 Hello! I\'m your AI assistant. I can help you manage your tasks, clients, orders, and events. Try an example below or type your request!'
        : '👋 Hello! I\'m your AI assistant. I can help you manage your tasks, clients, orders, and events. Try an example below or type your request!',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userLanguage, hasScaleAccess]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const intent = parseIntent(inputValue.trim());
      const result = await assistantExecute(user, intent);

      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.message,
        timestamp: new Date(),
        metadata: {
          intent,
          result: result.data,
          error: result.success ? undefined : result.message,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (result.requiresConfirmation) {
        setPendingConfirmation(assistantMessage);
      }
    } catch (error) {
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ Une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle confirmation
  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingConfirmation || !user) return;

    if (confirmed) {
      const intent = pendingConfirmation.metadata?.intent;
      if (intent) {
        setIsLoading(true);
        try {
          const result = await assistantExecute(user, intent);
          
          const confirmationMessage: AssistantMessage = {
            id: Date.now().toString(),
            type: 'assistant',
            content: result.message,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        } catch (error) {
          const errorMessage: AssistantMessage = {
            id: Date.now().toString(),
            type: 'assistant',
            content: '❌ Erreur lors de la confirmation.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      const cancelMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '❌ Action cancelled.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, cancelMessage]);
    }

    setPendingConfirmation(null);
  };

  // Handle keyboard keys
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setPendingConfirmation(null);
  };

  // Use example
  const useExample = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  // Render message
  const renderMessage = (message: AssistantMessage) => {
    const isUser = message.type === 'user';
    const isAssistant = message.type === 'assistant';

    return (
      <div
        key={message.id}
        className={`flex gap-3 p-4 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User size={16} className="text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assistant AI
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userLanguage === 'fr' 
                  ? 'Gérez vos tâches, clients, commandes et événements'
                  : 'Manage your tasks, clients, orders, and events'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearConversation}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={userLanguage === 'fr' ? 'Effacer la conversation' : 'Clear conversation'}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => useExample('/help')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 1 && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb size={20} className="text-yellow-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {userLanguage === 'fr' ? 'Exemples rapides' : 'Quick examples'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examples.slice(0, 6).map((example) => (
                  <button
                    key={example.id}
                    onClick={() => useExample(example.prompt)}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {example.description}
                    </p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                      {example.prompt}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex gap-3 p-4 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                  <span className="text-gray-500 dark:text-gray-400">
                    {userLanguage === 'fr' ? 'Réflexion...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {userLanguage === 'fr' ? 'Confirmation requise' : 'Confirmation required'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {pendingConfirmation.content}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {userLanguage === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-colors"
              >
                {userLanguage === 'fr' ? 'Confirmer' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  userLanguage === 'fr' 
                    ? 'Tapez votre message... (Shift+Entrée pour une nouvelle ligne)'
                    : 'Type your message... (Shift+Enter for new line)'
                }
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !user}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {userLanguage === 'fr' 
              ? 'Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne'
              : 'Press Enter to send, Shift+Enter for new line'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
