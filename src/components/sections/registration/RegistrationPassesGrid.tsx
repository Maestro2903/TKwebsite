import { useState, useEffect, useMemo } from 'react';
import PassCard from '@/components/ui/PassCard';
import { REGISTRATION_PASSES } from '@/data/passes';
import type { RegistrationPass } from '@/data/passes';

interface RegistrationPassesGridProps {
  onRegisterClick?: (pass: RegistrationPass) => void;
}

export default function RegistrationPassesGrid({ onRegisterClick }: RegistrationPassesGridProps) {
  const [backendPassTypes, setBackendPassTypes] = useState<Record<string, { id: string; price?: number; pricePerPerson?: number }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/passes/types');
        const data = await response.json();

        if (data.success && data.passTypes) {
          setBackendPassTypes(data.passTypes);
        }
      } catch (error) {
        console.error('Failed to fetch pass prices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  const passes = useMemo(() => {
    return REGISTRATION_PASSES.map(pass => {
      const backendPass = backendPassTypes
        ? (Object.values(backendPassTypes).find((bp: any) => bp.id === pass.passType) as any)
        : null;

      if (backendPass) {
        return {
          ...pass,
          amount: backendPass.price ?? backendPass.pricePerPerson ?? pass.amount,
          price: backendPass.price
            ? `₹${backendPass.price}`
            : backendPass.pricePerPerson
              ? `₹${backendPass.pricePerPerson} / person`
              : pass.price,
        };
      }
      return pass;
    });
  }, [backendPassTypes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="reg-spinner" />
      </div>
    );
  }

  return (
    <section className="mt-16 md:mt-[var(--_spacing---section-space--small,4rem)]">
      <div className="mx-auto max-w-[min(96rem,100%)] px-[var(--site--gutter)]">
        <div
          className="registration-passes-grid grid items-stretch auto-rows-[1fr]
                     grid-cols-1 md:grid-cols-2 xl:grid-cols-3 min-[1600px]:grid-cols-4
                     gap-x-[clamp(1rem,1.8vw,1.75rem)]
                     gap-y-[clamp(1.25rem,2.2vw,2.25rem)]"
          role="list"
          aria-label="Pass selection"
        >
          {passes.map((pass) => (
            <div
              key={pass.id}
              className="min-h-0 min-w-0 flex h-full flex-1 flex-col"
              role="listitem"
            >
              <PassCard pass={pass} onRegister={onRegisterClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

