import React, { useState } from 'react';
import { Bot, Send, RotateCcw, Lightbulb, Loader2, MessageSquare, Zap, Users, TrendingUp, HelpCircle } from 'lucide-react';
import { assistant } from '../lib/openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'features'>('chat');

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Smart AI Assistant',
      description: 'Ask questions and get tailored answers to optimize your freelance workflow.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Advice',
      description: 'Receive instant tips to improve your productivity and revenue.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Client Management',
      description: 'Learn to manage clients effectively and maintain strong relationships.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Revenue Optimization',
      description: 'Discover strategies to increase your revenue and grow your business.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const quickQuestions = [
    'How can I manage clients efficiently?',
    'What is the difference between Lunch, Boost and Scale plans?',
    'How do I create a professional invoice?',
    'How can I optimize my freelance workflow?',
    'How does the referral system work?',
    'How do I track my revenue and stats?',
    'How should I organize my orders?',
    'What are FiverFlow’s key benefits?'
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const hasOpenAIKey = Boolean((import.meta as any)?.env?.VITE_OPENAI_API_KEY);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      if (!hasOpenAIKey) {
        throw new Error('Missing OpenAI API key. Set VITE_OPENAI_API_KEY in your environment.');
      }
      const response = await assistant.sendMessage(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Assistant error:', error);
      let errorText = 'Sorry, something went wrong. Please try again.';
      
      // Afficher un message d'erreur plus détaillé
      if (error?.message) {
        if (error.message.includes('OpenAI API key') || error.message.includes('401') || error.message.includes('unauthorized')) {
          errorText = '❌ Erreur: Clé OpenAI invalide ou manquante. Vérifiez votre fichier .env et redémarrez le serveur.';
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorText = '❌ Erreur: Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorText = '❌ Erreur: Problème de connexion. Vérifiez votre connexion internet.';
        } else {
          errorText = `❌ Erreur: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const resetConversation = () => {
    assistant.resetConversation();
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">FiverFlow AI Assistant</h1>
                <p className="text-slate-400">Your intelligent partner to optimize your freelance workflow</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'features'
                    ? 'bg-[#9c68f2] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-[#9c68f2] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'features' ? (
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab('chat');
                      setInput(question);
                    }}
                    className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors group"
                  >
                    <h4 className="font-medium text-white group-hover:text-[#9c68f2] transition-colors">
                      {question}
                    </h4>
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">How does it work?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Ask your question</h4>
                  <p className="text-sm opacity-90">Describe your problem or need</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">AI analysis</h4>
                  <p className="text-sm opacity-90">Our assistant understands your context</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Get advice</h4>
                  <p className="text-sm opacity-90">Receive personalized answers</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden" style={{ height: '600px' }}>
            <div className="flex flex-col h-full bg-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">FiverFlow Assistant</h3>
                    <p className="text-sm text-slate-400">AI to optimize your workflow</p>
                  </div>
                </div>
                <button
                  onClick={resetConversation}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && showSuggestions && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Hello! I am your FiverFlow assistant</h3>
                      <p className="text-slate-400 mb-6">How can I help you optimize your freelance workflow?</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickQuestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3 text-left bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
                        >
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="w-4 h-4 text-[#9c68f2] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300 group-hover:text-white">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-br from-[#9c68f2] to-[#422ca5]'
                      }`}>
                        {message.role === 'user' ? (
                          <MessageSquare className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-800 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#9c68f2]" />
                          <span className="text-slate-400">The assistant is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 bg-[#9c68f2] hover:bg-[#8655e6] disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantPage;
