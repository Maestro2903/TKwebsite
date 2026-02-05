'use client';

import PixelCard from '@/components/ui/PixelCard';
import type { RegistrationPass } from '@/data/passes';

type PixelCardVariant = 'default' | 'blue' | 'yellow' | 'pink';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

/**
 * PassCard – Premium pass selection card with PixelCard animation.
 * Editorial spacing: title → description → price → action.
 */
export default function PassCard({ pass, onRegister }: PassCardProps) {
  const variantMap: Record<string, PixelCardVariant> = {
    'day-pass': 'default',
    'group-events-pass': 'blue',
    'proshow-pass': 'yellow',
    'all-access-pass': 'pink',
  };

  const variant = variantMap[pass.id] || 'default';

  return (
    <article
      id={pass.id}
      className="pass-card-wrapper w-full flex justify-center"
      aria-labelledby={`pass-title-${pass.id}`}
    >
      <PixelCard
        variant={variant}
        className="w-full max-w-[360px] min-h-[420px]"
      >
        <div className="pass-card__inner p-10 min-h-[420px] flex flex-col justify-between pointer-events-none">
          <div>
            <h3
              id={`pass-title-${pass.id}`}
              className="text-sm tracking-widest uppercase opacity-70 text-white"
            >
              {pass.title}
            </h3>
            <p className="text-sm text-white/60 mt-4 leading-relaxed">
              {pass.details}
            </p>
          </div>

          <div className="mt-10">
            <div className="text-4xl font-semibold tracking-tight text-white">
              {pass.price}
            </div>
            <button
              type="button"
              className="mt-6 w-full border border-white/30 py-3 text-xs tracking-widest uppercase text-white bg-transparent hover:bg-white hover:!text-black transition pointer-events-auto cursor-pointer"
              onClick={() => onRegister?.(pass)}
            >
              {pass.passType === 'group_events' ? 'CREATE TEAM AND PAY' : 'PAY NOW'}
            </button>
          </div>
        </div>
      </PixelCard>
    </article>
  );
}
