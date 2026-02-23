'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface CountryItem {
  id: string;
  name: string;
  assignedTo: string | null;
}

interface CountrySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (countryId: string, countryName: string) => void;
}

export default function CountrySelectionModal({
  isOpen,
  onClose,
  onSelect,
}: CountrySelectionModalProps) {
  const { user } = useAuth();
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningCountryId, setAssigningCountryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll(isOpen);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mock-summit/countries');
      if (!res.ok) throw new Error('Failed to load countries');
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setAssigningCountryId(null);
      fetchCountries();
    }
  }, [isOpen, fetchCountries]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSelect = useCallback(
    async (countryId: string) => {
      if (!user?.uid) return;
      const country = countries.find((c) => c.id === countryId);
      if (!country) return;
      if (country.assignedTo != null && country.assignedTo !== user.uid) return;
      setAssigningCountryId(countryId);
      setError(null);
      try {
        const token = await auth.currentUser?.getIdToken(true);
        if (!token) throw new Error('Not signed in');
        const res = await fetch('/api/mock-summit/assign-country', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ countryId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to assign country');
        onSelect(countryId, data.countryName ?? country.name);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setAssigningCountryId(null);
      }
    },
    [user, countries, onSelect, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] min-h-[min(360px,70vh)] overflow-hidden rounded-xl bg-[#000] border border-neutral-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-orbitron text-white uppercase tracking-wider">
            Choose country — Mock Global Summit
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 px-4 py-2 rounded bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : countries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-400 text-sm mb-2">No countries available.</p>
              <p className="text-neutral-500 text-xs font-mono">
                The country list may not be seeded yet. Ask an admin to run:
              </p>
              <code className="mt-2 inline-block px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-300 font-mono">
                node scripts/db/seed-mock-summit-countries.js
              </code>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {countries.map((c) => {
                const isTaken = c.assignedTo != null && c.assignedTo !== user?.uid;
                const isAssigning = assigningCountryId === c.id;
                const isYours = c.assignedTo === user?.uid;
                const isDisabled = isTaken;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSelect(c.id)}
                    className={`
                      relative px-4 py-3 rounded-lg text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      ${isDisabled ? 'opacity-30 cursor-not-allowed bg-neutral-900 border border-neutral-800 text-neutral-500' : 'bg-neutral-900/80 border border-neutral-700 text-white hover:border-neutral-600 hover:-translate-y-1'}
                    `}
                  >
                    {isAssigning ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Assigning…
                      </span>
                    ) : (
                      <>
                        <span className="font-medium text-sm">{c.name}</span>
                        {isYours && (
                          <span className="absolute top-2 right-2 text-[10px] text-emerald-400 uppercase tracking-wider">Yours</span>
                        )}
                        {isTaken && !isYours && (
                          <span className="absolute top-2 right-2 text-[10px] text-neutral-500 uppercase">Taken</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
