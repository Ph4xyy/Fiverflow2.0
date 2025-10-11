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

  console.log('[useClients] State:', { hasUser: !!user, authReady, hasFetched: hasFetchedRef.current });

  const fetchClients = useCallback(async () => {
    if (!isMountedRef.current) return;

    // NE PAS FETCHER tant que authReady n'est pas true et que user n'est pas confirmé
    if (!authReady) {
      console.log('[useClients] Waiting for auth to be ready...');
      setLoading(true);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setClients(mockClients);
      setLoading(false);
      setError(null);
      return;
    }

    if (user === null) {
      setClients([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      console.log('[useClients] Fetching clients...');
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('[useClients] Fetch error:', supabaseError);
        setClients(mockClients);
        setError(null);
      } else {
        console.log('[useClients] Fetched', data?.length || 0, 'clients');
        setClients(data || []);
        setError(null);
      }
    } catch (_err) {
      console.error('[useClients] Unexpected error:', _err);
      setClients(mockClients);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authReady]);

  const refetchClients = useCallback(async () => {
    hasFetchedRef.current = false;
    await fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!hasFetchedRef.current && user !== undefined && authReady) {
      hasFetchedRef.current = true;
      fetchClients();
    }
  }, [user?.id, authReady, fetchClients]);

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
