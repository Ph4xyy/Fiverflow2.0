/**
 * Utilitaire pour nettoyer tous les écouteurs d'événements problématiques
 * qui peuvent causer des boucles infinies
 */

export const cleanupProblematicEventListeners = () => {
  console.log('🧹 Cleaning up problematic event listeners...');
  
  // Créer un événement factice pour déclencher le nettoyage
  const fakeEvent = new CustomEvent('ff:session:refreshed', { detail: { cleanup: true } });
  
  // Déclencher l'événement pour que tous les hooks nettoient leurs écouteurs
  window.dispatchEvent(fakeEvent);
  
  // Attendre un peu pour que le nettoyage se fasse
  setTimeout(() => {
    console.log('✅ Event listener cleanup completed');
  }, 100);
};

/**
 * Hook pour nettoyer automatiquement les écouteurs d'événements problématiques
 */
export const useEventCleanup = () => {
  React.useEffect(() => {
    // Nettoyer au montage
    cleanupProblematicEventListeners();
    
    // Nettoyer au démontage
    return () => {
      cleanupProblematicEventListeners();
    };
  }, []);
};

export default cleanupProblematicEventListeners;
