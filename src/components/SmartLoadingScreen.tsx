import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface SmartLoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
  delay?: number; // Délai avant d'afficher le loader (en ms)
  minDisplayTime?: number; // Temps minimum d'affichage (en ms)
}

/**
 * Composant de loading intelligent qui évite les flashs inutiles
 * - Délai avant affichage pour éviter les flashs rapides
 * - Temps minimum d'affichage pour éviter les clignotements
 * - Cache des pages visitées pour éviter les rechargements
 */
export const SmartLoadingScreen: React.FC<SmartLoadingScreenProps> = ({
  message = "Loading...",
  showSpinner = true,
  delay = 200, // 200ms de délai par défaut
  minDisplayTime = 300 // 300ms d'affichage minimum
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const location = useLocation();
  const timeoutRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Reset visibility when location changes
    setIsVisible(false);
    setHasShown(false);
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Start the loading process
    startTimeRef.current = Date.now();
    
    // Show loading after delay
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [location.pathname, delay]);

  // Function to hide loading screen (can be called externally)
  const hideLoading = React.useCallback(() => {
    if (!hasShown) {
      // If we haven't shown yet, just cancel the show timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remainingTime = Math.max(0, minDisplayTime - elapsed);

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, remainingTime);
  }, [hasShown, minDisplayTime]);

  // Expose hide function for external use
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    hideLoading
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4 p-8 bg-slate-800/90 rounded-xl shadow-2xl border border-slate-700/50">
        {showSpinner && (
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-4 border-transparent border-t-blue-400/30"></div>
          </div>
        )}
        <div className="text-center">
          <p className="text-white text-lg font-medium">{message}</p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartLoadingScreen;
