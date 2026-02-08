'use client';

import { Download, CheckCircle2 } from 'lucide-react';
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
        'relative w-full max-w-[420px] mx-auto bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden group transition-all duration-300 hover:border-neutral-700 hover:shadow-neutral-900/50',
        className
      )}
    >
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white font-orbitron tracking-tight mb-1">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">₹{amount}</span>
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} />
                Verified
              </span>
            </div>
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-neutral-700/20 to-transparent rounded-bl-full" />
      </div>

      {/* QR Code Section */}
      <div className="relative px-6 py-8 bg-gradient-to-b from-black to-neutral-950">
        <div className="relative">
          {/* QR Code Container */}
          <div className="relative mx-auto w-full max-w-[280px] aspect-square bg-white rounded-xl p-4 shadow-lg">
            {qrCode ? (
              <img
                src={qrCode}
                alt="Pass QR code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                No QR Code
              </div>
            )}
          </div>

          {/* Decorative corner brackets */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-blue-500/50 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-blue-500/50 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-blue-500/50 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-blue-500/50 rounded-br-lg" />
        </div>

        {/* Instruction Text */}
        <p className="text-center text-sm text-neutral-400 mt-6 font-medium">
          Show this QR code at entry
        </p>
        
        {/* Tech accent line */}
        <div className="mt-4 mx-auto w-32 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
      </div>

      {/* Download Button Section */}
      <div className="px-6 py-5 bg-black/50 border-t border-neutral-800">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadPDF();
          }}
          disabled={isDownloading}
          className="w-full bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 border border-neutral-700 rounded-lg px-6 py-3.5 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neutral-900/50 flex items-center justify-center gap-3 group/btn"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download size={20} className="group-hover/btn:translate-y-0.5 transition-transform" />
              <span>Download Pass as PDF</span>
            </>
          )}
        </button>
        
        {/* Info text */}
        <p className="text-center text-xs text-neutral-500 mt-3">
          CIT Takshashila 2026 • Valid Entry Pass
        </p>
      </div>
    </div>
  );
}
