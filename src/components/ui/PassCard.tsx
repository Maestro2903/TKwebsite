import type { RegistrationPass } from '@/data/passes';
import { X, Trophy } from 'lucide-react';
import { AwardBadge } from '@/components/decorative/AwardBadge';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

/**
 * PassCard – Premium pass selection card with standalone sci-fi design.
 */
export default function PassCard({ pass, onRegister }: PassCardProps) {
  const actionLabel = pass.passType === 'group_events' ? 'CREATE TEAM' : 'PAY NOW';

  return (
    <article
      id={pass.id}
      className="pass-card-wrapper w-full flex justify-center p-2"
      aria-labelledby={`pass-title-${pass.id}`}
    >
      <div
        className="relative w-full max-w-[340px] bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group transition-all duration-300 hover:border-neutral-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        onClick={() => onRegister?.(pass)}
      >
        {/* --- Top Border Strip --- */}
        <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-700 bg-[#151515] relative z-10 shrink-0">
          <X size={10} className="text-neutral-500" />
          <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold">
            <span>SYS.REG.01</span>
            <span>///</span>
            <span>SECURE</span>
          </div>
          <X size={10} className="text-neutral-500" />
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 relative flex flex-col p-6 min-h-[320px]">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Corner Accents */}
          <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-neutral-600" />
          <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-neutral-600" />

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-between relative z-10">

            {/* Header */}
            <div className="w-full text-center space-y-1 mb-6">
              <h3 id={`pass-title-${pass.id}`} className="text-lg font-bold text-white font-orbitron uppercase tracking-widest text-shadow-sm">
                {pass.title}
              </h3>
              <div className="h-[1px] w-12 mx-auto bg-neutral-700" />
            </div>

            {/* Price Display */}
            <div className="text-center py-4 relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
              <span className="text-[10px] text-neutral-500 font-orbitron uppercase tracking-[0.2em] block mb-1">Access Cost</span>
              <div className="text-5xl font-bold text-white tracking-tighter font-orbitron drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {pass.price}
              </div>
            </div>

            {/* Details */}
            <div className="w-full mt-6 text-center border-t border-dashed border-neutral-800 pt-6">
              <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider leading-relaxed px-4">
                {pass.details}
              </p>
            </div>

          </div>
        </div>

        {/* --- Footer Action --- */}
        <div className="p-4 border-t border-neutral-800 bg-[#151515] relative z-20 mt-auto">
          <button
            className="w-full group/btn relative overflow-hidden bg-white text-black py-3 px-6 font-orbitron font-bold text-sm uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {actionLabel} <Trophy size={14} className="opacity-50" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </div>

      </div>
    </article>
  );
}
