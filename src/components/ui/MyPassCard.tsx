'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyPassCardProps {
  /** Display name of the pass (e.g. "Day Pass", "Proshow Pass") */
  title: string;
  /** Amount paid (e.g. 500) */
  amount: number;
  /** Data URL or URL of the QR code image */
  qrCode: string | null;
  /** Called when user clicks Download PDF */
  onDownloadPDF: () => void;
  /** When true, show loading state on the button */
  isDownloading?: boolean;
  className?: string;
}

export default function MyPassCard({
  title,
  amount,
  qrCode,
  onDownloadPDF,
  isDownloading = false,
  className = '',
}: MyPassCardProps) {
  return (
    <div
      className={cn(
        'relative w-full aspect-[2/3] max-w-[380px] mx-auto bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group transition-all duration-300 hover:border-neutral-600',
        className
      )}
    >
      {/* Top Border Strip */}
      <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-700 bg-[#151515] relative z-10 min-h-0 shrink-0">
        <X size={10} className="text-neutral-500 shrink-0" />
        <div className="flex gap-2 sm:gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold min-w-0 overflow-hidden">
          <span>My Pass</span>
          <span>///</span>
          <span>QR Code</span>
          <span>///</span>
          <span>Valid</span>
        </div>
        <X size={10} className="text-neutral-500 shrink-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex min-h-0">
        {/* Left Vertical Rail */}
        <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-r border-neutral-800 bg-[#151515]">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Central Display Zone */}
        <div className="flex-1 flex flex-col p-0 pb-0 bg-[#1a1a1a] relative min-w-0">
          <div className="relative w-full flex-1 flex flex-col min-h-0">
            {/* The Screen — QR code area */}
            <div
              className="aspect-[16/10] w-full flex-shrink-0 bg-[#050505] border border-neutral-700 relative overflow-hidden group-hover:border-neutral-500 transition-colors duration-300"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
            >
              <div className="absolute inset-0 z-0 flex items-center justify-center p-6">
                {qrCode ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={qrCode}
                      alt="Pass QR code"
                      className="w-auto h-auto max-w-full max-h-full object-contain rounded bg-white p-3"
                    />
                  </div>
                ) : (
                  <div className="text-neutral-500 text-xs font-mono">No QR</div>
                )}
              </div>

              {/* Inner Decorative Lines */}
              <div
                className="absolute inset-0 border-[0.5px] border-neutral-800 m-0.5 opacity-50 z-10 pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
              />
            </div>

            {/* Screen Bottom Connectors */}
            <div className="absolute bottom-0 w-full h-8 pointer-events-none">
              <div className="absolute bottom-[12%] left-0 w-2 h-[1px] bg-neutral-500" />
              <div className="absolute bottom-[12%] right-0 w-2 h-[1px] bg-neutral-500" />
            </div>
          </div>

          {/* Lower Panel — no loader rows */}
          <div className="h-auto mt-2 flex flex-col min-w-0">
            <div className="min-h-[100px] bg-[#151515] border border-neutral-800 mt-2 p-3 flex flex-col gap-3 relative overflow-hidden group-hover:border-neutral-600 transition-colors shrink-0">
              <h2 className="font-orbitron font-bold tracking-tighter text-neutral-300 line-clamp-2 leading-tight pr-2 z-10 min-w-0 break-words text-base sm:text-lg">
                {title}
              </h2>
              <p className="text-neutral-400 text-sm z-10">₹{amount}</p>
              <p className="text-[10px] text-neutral-500 z-10">Show this QR at entry</p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadPDF();
                }}
                disabled={isDownloading}
                className="mt-auto w-full border border-neutral-600 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 hover:border-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed z-10 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download as PDF
                  </>
                )}
              </button>

              {/* Corner Accents */}
              <div className="absolute top-0 right-0 p-1 pointer-events-none">
                <div className="w-2 h-2 border-t border-r border-neutral-500" />
              </div>
              <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
                <div className="w-2 h-2 border-b border-l border-neutral-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Vertical Rail */}
        <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-l border-neutral-800 bg-[#151515]">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Bottom Border Strip */}
      <div className="h-6 w-full flex items-center justify-between px-2 border-t border-neutral-700 bg-[#151515] relative z-10">
        <X size={10} className="text-neutral-500" />
        <div className="flex gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold">
          <span>Status: Active</span>
        </div>
        <X size={10} className="text-neutral-500" />
      </div>
    </div>
  );
}
