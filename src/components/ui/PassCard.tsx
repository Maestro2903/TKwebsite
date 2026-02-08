import type { RegistrationPass } from '@/data/passes';
import SciFiCard from './SciFiCard';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

export default function PassCard({ pass, onRegister }: PassCardProps) {
  const actionLabel = pass.passType === 'group_events' ? 'CREATE TEAM' : 'REGISTER';

  // Centralized price parsing - parse once, use everywhere
  const [rawPrice, rawUnit] = pass.price.split('/').map((s) => s.trim());
  const parsedPrice = rawPrice.replace(/[₹\s]/g, ''); // Strip currency symbol and whitespace
  const parsedUnit = rawUnit || null; // e.g., "person" from "₹250 / person"

  return (
    <div className="w-full h-full flex justify-center p-4">
      <SciFiCard
        name={pass.title}
        actionLabel={actionLabel}
        onAction={() => onRegister?.(pass)}
        className="max-w-[400px]"
      >
        <div className="relative flex flex-col items-center justify-center h-full gap-6 py-8">
          {/* Price Display */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase">Price</span>
            <div className="text-4xl md:text-5xl font-bold text-white font-orbitron tracking-tighter">
              ₹{parsedPrice}
            </div>
            {parsedUnit && (
              <span className="text-xs text-neutral-500 font-mono">
                / {parsedUnit}
              </span>
            )}
          </div>

          {/* Type Badge */}
          <div className="px-3 py-1 border border-neutral-800 bg-neutral-900/50 rounded-full">
            <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-bold">
              {pass.passType === 'group_events' ? 'Team Access' : 'Individual Access'}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 w-full px-6">
            <p className="text-xs text-center text-neutral-400 leading-relaxed font-mono">
              {pass.details}
            </p>

            {/* Meta Points */}
            <div className="mt-2 flex flex-col gap-1.5 opacity-60">
              {pass.meta?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 justify-center">
                  <div className="w-1 h-1 bg-neutral-500 rounded-full" />
                  <span className="text-[10px] text-neutral-300 uppercase tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Deco */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
            <div className="text-[8px] font-mono whitespace-nowrap overflow-hidden px-4">
              ID: {pass.id.toUpperCase()} • TKS-2026 • SECURE_LINK
            </div>
          </div>
        </div>
      </SciFiCard>
    </div>
  );
}
