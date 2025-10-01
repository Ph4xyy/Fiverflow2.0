import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export const useAnalytics = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Fonction pour tracker une vue de page
  const trackPageView = useCallback(async (pagePath: string, pageTitle?: string) => {
    if (!user || !supabase) return;

    try {
      await supabase.from('page_views').insert({
        user_id: user.id,
        page_path: pagePath,
        page_title: pageTitle || document.title,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.warn('Erreur lors du tracking de la vue:', error);
    }
  }, [user]);

  // Fonction pour démarrer une session
  const startSession = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      // Terminer les sessions actives existantes
      await supabase
        .from('user_sessions')
        .update({ is_active: false, session_end: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Créer une nouvelle session
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        user_agent: navigator.userAgent,
        is_active: true,
      });
    } catch (error) {
      console.warn('Erreur lors du démarrage de la session:', error);
    }
  }, [user]);

  // Fonction pour mettre à jour l'activité
  const updateActivity = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', true);
    } catch (error) {
      console.warn('Erreur lors de la mise à jour de l\'activité:', error);
    }
  }, [user]);

  // Fonction pour terminer la session
  const endSession = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          session_end: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
    } catch (error) {
      console.warn('Erreur lors de la fin de session:', error);
    }
  }, [user]);

  // Tracker les vues de pages automatiquement
  useEffect(() => {
    if (user) {
      trackPageView(location.pathname, document.title);
    }
  }, [location.pathname, user, trackPageView]);

  // Démarrer une session au montage du composant
  useEffect(() => {
    if (user) {
      startSession();
    }
  }, [user, startSession]);

  // Mettre à jour l'activité toutes les 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(updateActivity, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [user, updateActivity]);

  // Terminer la session à la fermeture de l'onglet
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [user, endSession]);

  return {
    trackPageView,
    startSession,
    updateActivity,
    endSession,
  };
};
