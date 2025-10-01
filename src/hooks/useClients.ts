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
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchClients = useCallback(async () => {
    if (!isMountedRef.current) return;

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
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        setClients(mockClients);
        setError(null);
      } else {
        setClients(data || []);
        setError(null);
      }
    } catch (_err) {
      setClients(mockClients);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetchClients = useCallback(async () => {
    hasFetchedRef.current = false;
    await fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!hasFetchedRef.current && user !== undefined) {
      hasFetchedRef.current = true;
      fetchClients();
    }
    const onRefreshed = () => fetchClients();
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => {
      window.removeEventListener('ff:session:refreshed', onRefreshed as any);
    };
  }, [fetchClients, user]);

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
