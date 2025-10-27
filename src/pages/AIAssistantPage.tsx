/**
 * Page Assistant AI - Interface style ChatGPT
 * Design responsive avec barre d'input toujours visible
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseIntent } from '../lib/assistant/intent';
import { assistantExecute } from '../lib/assistant/actions';
import { getExamplesForLanguage } from '../lib/assistant/examples';
import { AssistantMessage } from '../types/assistant';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Sparkles as SparklesIcon,
  Loader2
} from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<AssistantMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userLanguage = navigator.language.startsWith('fr') ? 'fr' : 'en';
  const examples = getExamplesForLanguage(userLanguage);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: userLanguage === 'fr' 
          ? '👋 Bonjour ! Je suis votre assistant IA. Je peux vous aider à gérer vos tâches, clients, commandes et événements.'
          : '👋 Hello! I\'m your AI assistant. I can help you manage your tasks, clients, orders, and events.',
        timestamp: new Date(),
      }]);
    }
  }, [userLanguage]);

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

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.message,
        timestamp: new Date(),
      }]);

      if (result.requiresConfirmation) {
        setPendingConfirmation({ ...userMessage, metadata: { intent, result: result.data } });
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: error?.message || '❌ Une erreur est survenue.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setPendingConfirmation(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header - fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <SparklesIcon size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assistant AI
            </h1>
          </div>
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages - scrollable area in the middle */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900" style={{ height: 0 }}>
        <div className="max-w-4xl mx-auto py-4">
          {messages.length === 1 && (
            <div className="px-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {userLanguage === 'fr' ? 'Exemples' : 'Examples'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {examples.slice(0, 6).map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setInputValue(ex.prompt);
                      inputRef.current?.focus();
                    }}
                    className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                      {ex.title}
                    </h4>
                    <code className="text-xs text-gray-500 dark:text-gray-400">
                      {ex.prompt}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 px-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 px-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {userLanguage === 'fr' ? 'Réflexion...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userLanguage === 'fr' ? 'Message' : 'Message'}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
              style={{ maxHeight: '200px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {userLanguage === 'fr' ? 'Confirmation' : 'Confirmation'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {pendingConfirmation.content}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300"
              >
                {userLanguage === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              >
                {userLanguage === 'fr' ? 'Confirmer' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
