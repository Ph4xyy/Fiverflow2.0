import { useCallback } from 'react';
import { ActivityService } from '../services/activityService';

/**
 * Hook pour le suivi d'activité automatique
 * Utilise le service ActivityService pour enregistrer les actions utilisateur
 */
export const useActivityTracking = () => {
  // Suivi des commandes
  const trackOrderCreated = useCallback(async (orderId: string, orderTitle: string) => {
    try {
      await ActivityService.logOrderCreated(orderId, orderTitle);
    } catch (error) {
      console.error('Erreur lors du suivi de création de commande:', error);
    }
  }, []);

  const trackOrderUpdated = useCallback(async (orderId: string, orderTitle: string, changes: string[]) => {
    try {
      await ActivityService.logOrderUpdated(orderId, orderTitle, changes);
    } catch (error) {
      console.error('Erreur lors du suivi de modification de commande:', error);
    }
  }, []);

  const trackOrderCompleted = useCallback(async (orderId: string, orderTitle: string) => {
    try {
      await ActivityService.logOrderCompleted(orderId, orderTitle);
    } catch (error) {
      console.error('Erreur lors du suivi de finalisation de commande:', error);
    }
  }, []);

  // Suivi des clients
  const trackClientCreated = useCallback(async (clientId: string, clientName: string) => {
    try {
      await ActivityService.logClientCreated(clientId, clientName);
    } catch (error) {
      console.error('Erreur lors du suivi de création de client:', error);
    }
  }, []);

  const trackClientUpdated = useCallback(async (clientId: string, clientName: string, changes: string[]) => {
    try {
      await ActivityService.logClientUpdated(clientId, clientName, changes);
    } catch (error) {
      console.error('Erreur lors du suivi de modification de client:', error);
    }
  }, []);

  // Suivi du profil
  const trackProfileUpdated = useCallback(async () => {
    try {
      await ActivityService.logProfileUpdated();
    } catch (error) {
      console.error('Erreur lors du suivi de mise à jour du profil:', error);
    }
  }, []);

  // Suivi des réseaux sociaux
  const trackSocialConnected = useCallback(async (platform: string) => {
    try {
      await ActivityService.logSocialConnected(platform);
    } catch (error) {
      console.error('Erreur lors du suivi de connexion réseau social:', error);
    }
  }, []);

  return {
    // Commandes
    trackOrderCreated,
    trackOrderUpdated,
    trackOrderCompleted,
    
    // Clients
    trackClientCreated,
    trackClientUpdated,
    
    // Profil
    trackProfileUpdated,
    trackSocialConnected
  };
};
