import React, { useState } from 'react';
import { Bot, Play, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { assistant } from '../lib/openai';

const AssistantDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Array<{
    question: string;
    answer: string;
    success: boolean;
    timestamp: Date;
  }>>([]);

  const demoQuestions = [
    "Comment gérer mes clients efficacement ?",
    "Quelle est la différence entre les plans Lunch, Boost et Scale ?",
    "Comment créer une facture professionnelle ?",
    "Comment optimiser mon workflow freelance ?",
    "Comment utiliser le système de parrainage ?"
  ];

  const runDemo = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (let i = 0; i < demoQuestions.length; i++) {
      const question = demoQuestions[i];
      
      try {
        const response = await assistant.sendMessage(question);
        
        setResults(prev => [...prev, {
          question,
          answer: response.message,
          success: true,
          timestamp: new Date()
        }]);
        
        // Pause entre les questions pour éviter le rate limiting
        if (i < demoQuestions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Erreur demo:', error);
        setResults(prev => [...prev, {
          question,
          answer: 'Erreur: ' + (error as Error).message,
          success: false,
          timestamp: new Date()
        }]);
      }
    }
    
    setIsRunning(false);
  };

  const resetDemo = () => {
    setResults([]);
    assistant.resetConversation();
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Démonstration Assistant IA</h3>
            <p className="text-sm text-slate-400">Testez l'assistant avec des questions prédéfinies</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="px-4 py-2 bg-[#9c68f2] hover:bg-[#8655e6] disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isRunning ? 'En cours...' : 'Lancer Demo'}</span>
          </button>
        </div>
      </div>

      {/* Questions de démonstration */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Questions de démonstration :</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {demoQuestions.map((question, index) => (
            <div
              key={index}
              className="p-3 bg-slate-700 rounded-lg text-sm text-slate-300"
            >
              {index + 1}. {question}
            </div>
          ))}
        </div>
      </div>

      {/* Résultats */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-300">Résultats :</h4>
          
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-slate-700 rounded-lg p-4 border-l-4 border-l-[#9c68f2]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-white">
                    Question {index + 1}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-slate-300 font-medium mb-1">Question :</p>
                <p className="text-sm text-slate-200">{result.question}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">Réponse :</p>
                <div className="text-sm text-slate-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {result.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {results.length > 0 && (
        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Statistiques :</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{results.length}</p>
              <p className="text-xs text-slate-400">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {results.filter(r => r.success).length}
              </p>
              <p className="text-xs text-slate-400">Réussies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {results.filter(r => !r.success).length}
              </p>
              <p className="text-xs text-slate-400">Échecs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantDemo;
