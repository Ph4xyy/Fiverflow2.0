import React, { useEffect, useRef } from 'react';

/**
 * Composant pour détecter les boucles infinies de rendu
 */
export const InfiniteLoopDetector: React.FC = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    console.log(`🔄 Render #${renderCount.current} - Time since last: ${timeSinceLastRender}ms`);
    
    // Si plus de 10 rendus en moins de 1 seconde, c'est probablement une boucle infinie
    if (renderCount.current > 10 && timeSinceLastRender < 1000) {
      console.error('🚨 INFINITE LOOP DETECTED! Too many renders in short time');
      console.trace('Stack trace of infinite loop:');
    }
    
    lastRenderTime.current = now;
  });

  return null; // Ce composant ne rend rien
};

export default InfiniteLoopDetector;
