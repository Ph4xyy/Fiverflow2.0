/**
 * Utilitaires pour tester la navigation instantanée
 * Vérifie que tous les délais ont été supprimés
 */

export const testInstantNavigation = () => {
  console.log('🚀 Test de navigation instantanée démarré...');
  
  // Vérifier que les timeouts ont été supprimés
  const checkTimeouts = () => {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    let timeoutCount = 0;
    let intervalCount = 0;
    
    window.setTimeout = (...args) => {
      timeoutCount++;
      console.warn('⚠️ Timeout détecté:', args[1], 'ms');
      return originalSetTimeout(...args);
    };
    
    window.setInterval = (...args) => {
      intervalCount++;
      console.warn('⚠️ Interval détecté:', args[1], 'ms');
      return originalSetInterval(...args);
    };
    
    // Restaurer après 5 secondes
    setTimeout(() => {
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
      console.log(`✅ Test terminé - ${timeoutCount} timeouts, ${intervalCount} intervals détectés`);
    }, 5000);
  };
  
  // Vérifier les performances de navigation
  const measureNavigationPerformance = () => {
    const startTime = performance.now();
    
    // Simuler une navigation
    window.addEventListener('popstate', () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`⚡ Navigation en ${duration.toFixed(2)}ms`);
    });
  };
  
  return {
    checkTimeouts,
    measureNavigationPerformance,
    runAllTests: () => {
      checkTimeouts();
      measureNavigationPerformance();
      console.log('🎯 Tous les tests de navigation instantanée sont actifs');
    }
  };
};

export default testInstantNavigation;
