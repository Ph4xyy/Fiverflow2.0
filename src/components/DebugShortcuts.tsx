import React, { useState, useEffect } from 'react';

/**
 * Composant qui affiche les raccourcis de debug disponibles
 */
export const DebugShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Toggle visibility with Ctrl+Alt+H (Help)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'H') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 text-white p-6 rounded-lg text-sm font-mono z-50 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Debug Shortcuts</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300 text-xl"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span>Loading Debugger:</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Alt + L</kbd>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Database Test:</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Alt + D</kbd>
        </div>
        
        <div className="flex justify-between items-center">
          <span>This Help:</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Alt + H</kbd>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-600 text-xs text-gray-400">
        <p>Use these shortcuts to debug loading issues and test database connections.</p>
      </div>
    </div>
  );
};

export default DebugShortcuts;
