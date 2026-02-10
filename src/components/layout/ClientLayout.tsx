'use client';

import { useEffect } from 'react';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import LoadingRemastered from '@/components/ui/LoadingScreen';

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoading, setIsLoading } = useLoading();

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingRemastered onFinished={handleLoadingComplete} />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        {children}
      </div>
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </LoadingProvider>
  );
}
