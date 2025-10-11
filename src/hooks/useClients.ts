import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  platform: string;
  user_id: string;
  created_at: string;
  company_name?: string | null;
  client_status?: string | null;
  priority_level?: string | null;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetchClients: () => Promise<void>;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    platform: 'Fiverr',
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    company_name: 'Doe Industries',
    client_status: 'active',
    priority_level: 'high'
  },
  {
    id: '2',
    name: 'Jane Smith',
    platform: 'Upwork',
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    client_status: 'prospect',
    priority_level: 'medium'
  }
];

export const useClients = (): UseClientsReturn => {
  const { user, authReady } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  console.log('[useClients] State:', { 
    hasUser: !!user, 
    userId: user?.id,
    authReady, 
    hasFetched: hasFetchedRef.current,
    lastFetchedUserId: lastFetchedUserIdRef.current,
    clientsCount: clients.length
  });

  const fetchClients = useCallback(async () => {
    if (!isMountedRef.current) return;

    // GUARD: NE PAS FETCHER tant que authReady n'est pas true
    if (!authReady) {
      console.log('[useClients] fetchClients: ⏳ Waiting for auth to be ready...');
      setLoading(true);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      console.log('[useClients] fetchClients: Using mock data (Supabase not configured)');
      setClients(mockClients);
      setLoading(false);
      setError(null);
      return;
    }

    if (user === null) {
      console.log('[useClients] fetchClients: ❌ No user, clearing clients');
      setClients([]);
      setLoading(false);
      setError(null);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // Éviter de refetch inutilement
    if (lastFetchedUserIdRef.current === user.id && clients.length > 0) {
      console.log('[useClients] fetchClients: ✓ Already fetched for this user');
      setLoading(false);
      return;
    }

    try {
      console.log('[useClients] fetchClients: 📡 Fetching clients for user:', user.id);
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        // Gérer spécifiquement les erreurs 401/403 (JWT invalide/expiré)
        const errorCode = (supabaseError as any)?.code;
        const errorMessage = supabaseError.message || '';
        
        if (errorCode === 'PGRST301' || errorMessage.includes('JWT') || errorMessage.includes('expired') || errorMessage.includes('auth')) {
          console.warn('[useClients] fetchClients: ⚠️ Auth error (401/403), will retry after token refresh:', supabaseError);
          // Ne pas afficher d'erreur à l'utilisateur, juste attendre le refresh
          setError(null);
          // Garder les données actuelles si disponibles
          if (clients.length === 0) {
            setClients(mockClients); // Afficher mock en attendant
          }
        } else {
          // Erreur autre que JWT
          console.error('[useClients] fetchClients: ❌ Fetch error:', supabaseError);
          setClients(mockClients); // Fallback sur mock
          setError(null); // Ne pas afficher d'erreur à l'utilisateur
        }
      } else {
        console.log('[useClients] fetchClients: ✅ Fetched', data?.length || 0, 'clients');
        setClients(data || []);
        setError(null);
        lastFetchedUserIdRef.current = user.id;
      }
    } catch (err: any) {
      // Gérer les erreurs non catchées (401/403)
      const errorCode = err?.code;
      const errorMessage = err?.message || '';
      
      if (errorCode === 'PGRST301' || errorMessage.includes('JWT') || errorMessage.includes('expired')) {
        console.warn('[useClients] fetchClients: ⚠️ Auth error in catch, will retry:', err);
        setError(null);
        if (clients.length === 0) {
          setClients(mockClients);
        }
      } else {
        console.error('[useClients] fetchClients: 💥 Unexpected error:', err);
        setClients(mockClients);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, authReady, clients.length]);

  const refetchClients = useCallback(async () => {
    console.log('[useClients] refetchClients: 🔄 Manual refetch requested');
    hasFetchedRef.current = false;
    lastFetchedUserIdRef.current = null;
    await fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!hasFetchedRef.current && user !== undefined && authReady) {
      console.log('[useClients] useEffect: 🚀 Initial fetch');
      hasFetchedRef.current = true;
      fetchClients();
    }
  }, [user?.id, authReady, fetchClients]);

  // Écouter les événements de refresh de session pour refetch
  useEffect(() => {
    const handleSessionRefreshed = (e: CustomEvent) => {
      console.log('[useClients] 🔄 Session refreshed event received:', e.detail, '- refetching clients...');
      // Réinitialiser les guards et refetch
      hasFetchedRef.current = false;
      lastFetchedUserIdRef.current = null;
      fetchClients();
    };

    window.addEventListener('ff:session:refreshed', handleSessionRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', handleSessionRefreshed as any);
  }, [fetchClients]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      hasFetchedRef.current = false;
    };
  }, []);

  return {
    clients,
    loading,
    error,
    refetchClients,
  };
};
