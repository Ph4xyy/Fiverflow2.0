import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LoadingState {
  auth: boolean;
  role: boolean;
  subscription: boolean;
  data: boolean;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setMultipleLoading: (updates: Partial<LoadingState>) => void;
  isLoading: () => boolean;
  resetLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({
    auth: true,
    role: true,
    subscription: false,
    data: false
  });

  const loadingTimeoutRef = useRef<Record<string, number>>({});

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    // Clear any existing timeout for this key
    if (loadingTimeoutRef.current[key]) {
      clearTimeout(loadingTimeoutRef.current[key]);
    }

    // Set loading state immediately
    setLoadingState(prev => ({ ...prev, [key]: value }));

    // Auto-reset loading after 10 seconds to prevent infinite loading
    if (value) {
      loadingTimeoutRef.current[key] = window.setTimeout(() => {
        setLoadingState(prev => ({ ...prev, [key]: false }));
        delete loadingTimeoutRef.current[key];
      }, 10000);
    } else {
      delete loadingTimeoutRef.current[key];
    }
  }, []);

  const setMultipleLoading = useCallback((updates: Partial<LoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  }, []);

  const isLoading = useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const resetLoading = useCallback(() => {
    // Clear all timeouts
    Object.values(loadingTimeoutRef.current).forEach(clearTimeout);
    loadingTimeoutRef.current = {};
    
    // Reset to initial state
    setLoadingState({
      auth: true,
      role: true,
      subscription: false,
      data: false
    });
  }, []);

  return (
    <LoadingContext.Provider value={{
      loading,
      setLoading,
      setMultipleLoading,
      isLoading,
      resetLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
