'use client';

import PassCardTicket from '@/features/passes/PassCardTicket';
import type { RegistrationPass } from '@/data/passes';

export interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

export default function PassCard({ pass, onRegister }: PassCardProps) {
  return <PassCardTicket pass={pass} onRegister={onRegister} />;
}
