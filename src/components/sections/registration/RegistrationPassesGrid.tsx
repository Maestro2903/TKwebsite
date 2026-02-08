import { useState, useEffect } from 'react';
import PassCard from '@/components/ui/PassCard';
import { REGISTRATION_PASSES } from '@/data/passes';
import type { RegistrationPass } from '@/data/passes';

interface RegistrationPassesGridProps {
  onRegisterClick?: (pass: RegistrationPass) => void;
}

export default function RegistrationPassesGrid({ onRegisterClick }: RegistrationPassesGridProps) {
  const [passes, setPasses] = useState<RegistrationPass[]>(REGISTRATION_PASSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/passes/types');
        const data = await response.json();

        if (data.success && data.passTypes) {
          const updatedPasses = REGISTRATION_PASSES.map(pass => {
            // Find matching pass type from backend using passType property
            const backendPass = Object.values(data.passTypes).find(
              (bp: any) => bp.id === pass.passType
            ) as any;

            if (backendPass) {
              return {
                ...pass,
                amount: backendPass.price || backendPass.pricePerPerson || pass.amount,
                price: backendPass.price
                  ? `₹${backendPass.price}`
                  : backendPass.pricePerPerson
                    ? `₹${backendPass.pricePerPerson} / person`
                    : pass.price
              };
            }
            return pass;
          });
          setPasses(updatedPasses);
        }
      } catch (error) {
        console.error('Failed to fetch pass prices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="reg-spinner" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mt-20 px-4 sm:px-0" role="list" aria-label="Pass selection">
      {passes.map((pass) => (
        <div key={pass.id} className="flex justify-center" role="listitem">
          <PassCard pass={pass} onRegister={onRegisterClick} />
        </div>
      ))}
    </div>
  );
}

