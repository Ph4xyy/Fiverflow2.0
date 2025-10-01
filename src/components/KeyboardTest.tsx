import React, { useState, useEffect } from 'react';

/**
 * Composant de test pour vérifier les raccourcis clavier
 */
export const KeyboardTest: React.FC = () => {
  const [lastKey, setLastKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
      setLastKey(key);
      
      // Test des raccourcis
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        console.log('✅ Ctrl+Shift+L détecté - Loading Debugger');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        console.log('✅ Ctrl+Shift+D détecté - Database Test');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        console.log('✅ Ctrl+Shift+H détecté - Help');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle avec Ctrl+Shift+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-900/95 text-white p-6 rounded-lg text-sm font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Keyboard Test</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300 text-xl"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Last Key Pressed:</strong>
          <div className="text-green-400 font-mono">{lastKey}</div>
        </div>
        
        <div className="mt-4">
          <strong>Test these shortcuts:</strong>
          <div className="mt-2 space-y-1 text-xs">
            <div>Ctrl + Shift + L → Loading Debugger</div>
            <div>Ctrl + Shift + D → Database Test</div>
            <div>Ctrl + Shift + H → Help</div>
            <div>Ctrl + Shift + K → This test</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          <p>Press any key combination to see it detected here.</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardTest;
