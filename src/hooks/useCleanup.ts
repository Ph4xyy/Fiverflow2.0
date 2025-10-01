import { useEffect } from 'react';

/**
 * Hook pour nettoyer les écouteurs d'événements problématiques
 * qui peuvent causer des boucles infinies
 */
export const useCleanup = () => {
  useEffect(() => {
    // Nettoyer tous les écouteurs d'événements problématiques
    const cleanup = () => {
      console.log('🧹 Cleaning up problematic event listeners...');
      
      // Supprimer tous les écouteurs d'événements personnalisés
      const events = ['ff:session:refreshed', 'ff:tab:refocus'];
      events.forEach(eventName => {
        // Créer un événement factice pour déclencher le nettoyage
        const fakeEvent = new CustomEvent(eventName, { detail: { cleanup: true } });
        window.dispatchEvent(fakeEvent);
      });
    };

    // Écouter l'événement de nettoyage
    const handleCleanup = () => {
      console.log('🧹 Cleanup event received, cleaning up...');
      cleanup();
    };

    window.addEventListener('ff:cleanup', handleCleanup);

    // Nettoyer au montage
    cleanup();

    // Nettoyer au démontage
    return () => {
      window.removeEventListener('ff:cleanup', handleCleanup);
      cleanup();
    };
  }, []);
};

export default useCleanup;
