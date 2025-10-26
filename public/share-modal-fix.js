// Script de correction pour share-modal.js
// Évite l'erreur "Cannot read properties of null (reading 'addEventListener')"

(function() {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareModal);
  } else {
    initShareModal();
  }

  function initShareModal() {
    // Vérifier si l'élément existe avant d'ajouter l'event listener
    const shareButton = document.querySelector('[data-share-modal]') || 
                       document.querySelector('.share-button') ||
                       document.querySelector('#share-button');
    
    if (shareButton) {
      shareButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Logique de partage ici
        console.log('Share modal clicked');
      });
    }
  }
})();
