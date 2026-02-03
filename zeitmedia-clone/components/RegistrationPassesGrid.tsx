'use client';

import PassCard from './PassCard';
import { REGISTRATION_PASSES } from '@/lib/registrationPassesData';
import type { RegistrationPass } from '@/lib/registrationPassesData';

interface RegistrationPassesGridProps {
  onRegisterClick?: (pass: RegistrationPass) => void;
}

export default function RegistrationPassesGrid({ onRegisterClick }: RegistrationPassesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 mt-20" role="list" aria-label="Pass selection">
      {REGISTRATION_PASSES.map((pass) => (
        <div key={pass.id} className="flex justify-center" role="listitem">
          <PassCard pass={pass} onRegister={onRegisterClick} />
        </div>
      ))}
    </div>
  );
}

