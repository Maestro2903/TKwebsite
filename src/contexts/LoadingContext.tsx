'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasLoadedOnce: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    // Check if user has seen the loading screen in this session
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    
    if (hasSeenLoading === 'true') {
      // Skip loading animation if already seen in this session
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  const handleSetIsLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
      sessionStorage.setItem('hasSeenLoading', 'true');
    }
  };

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading: handleSetIsLoading, 
        hasLoadedOnce 
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
