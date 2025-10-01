import React, { useState } from 'react';

/**
 * Composant de test simple qui ne dépend d'aucun contexte
 * Pour tester si le problème vient des contextes ou d'autre chose
 */
export const SimpleTest: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    console.log('🧪 SimpleTest: Button clicked, count:', count + 1);
    setCount(prev => prev + 1);
  };

  const handleTest = async () => {
    console.log('🧪 SimpleTest: Test function called');
    try {
      // Test simple sans dépendances
      const result = await new Promise(resolve => {
        setTimeout(() => resolve('Test completed'), 1000);
      });
      console.log('🧪 SimpleTest: Test result:', result);
    } catch (error) {
      console.error('🧪 SimpleTest: Test error:', error);
    }
  };

  // Toggle avec Ctrl+Shift+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-900/95 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Simple Test</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300 text-xl"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <strong>Count:</strong> {count}
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={handleClick}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Increment Count
          </button>
          
          <button 
            onClick={handleTest}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Run Async Test
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>This component doesn't use any contexts.</p>
          <p>Press <kbd className="px-1 bg-gray-700 rounded">Ctrl + Shift + S</kbd> to toggle.</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
