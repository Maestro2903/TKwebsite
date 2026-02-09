'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { EventItem } from '@/data/events';
import { cn } from '@/lib/utils';

interface EventDetailsModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setIsAnimating(true);
    const timer = setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 200);
    return () => clearTimeout(timer);
  };

  if (!isOpen) return null;

  const description = event.fullDescription ?? event.description;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/90 backdrop-blur-sm',
        'transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
    >
      <div
        className={cn(
          'w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain',
          'bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative',
          'transition-all duration-300 ease-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        {/* --- Top Tech Border Strip --- */}
        <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-800 bg-[#151515] sticky top-0 z-20">
          <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron min-w-0 overflow-hidden">
            <span>Event.Data</span>
            <span>///</span>
            <span>Secure</span>
          </div>
          <button
            type="button"
            className="text-neutral-500 hover:text-white transition-colors duration-300 shrink-0 p-1 -m-1"
            aria-label="Close"
            onClick={handleClose}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="relative">
          {/* Event Image */}
          <div
            className="aspect-[16/10] w-full bg-[#050505] border-b border-neutral-700 relative overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={event.image}
                alt={event.name}
                fill
                className="object-cover opacity-80"
              />
            </div>
            <div
              className="absolute inset-0 border-[0.5px] border-neutral-800 m-0.5 opacity-50 z-10 pointer-events-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
            />
            <div
              className="absolute inset-0 opacity-10 z-10 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          {/* Content Section */}
          <div className="p-6 relative">
            {/* Corner Accents */}
            <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

            <h2
              id="event-details-title"
              className="font-orbitron font-bold text-2xl text-neutral-300 uppercase tracking-tight mb-4"
            >
              {event.name}
            </h2>

            {/* Decorative Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] flex-1 bg-neutral-800" />
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-neutral-600" />
                ))}
              </div>
              <div className="h-[1px] flex-1 bg-neutral-800" />
            </div>

            {description && (
              <div className="max-h-[200px] overflow-y-auto pr-2">
                <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
              </div>
            )}

            {/* Decorative Tech Elements */}
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full',
                      i < 3 ? 'bg-neutral-400' : 'bg-neutral-800'
                    )}
                  />
                ))}
              </div>
              <div className="h-1 bg-neutral-800 flex-1 mx-4 rounded-sm relative max-w-[120px]">
                <div className="absolute left-0 top-0 h-full w-2/3 bg-neutral-600" />
              </div>
              <div className="text-[8px] font-bold text-neutral-600 font-orbitron uppercase tracking-widest">
                Status: Active
              </div>
            </div>
          </div>

          {/* --- Bottom Tech Border Strip --- */}
          <div className="h-6 w-full flex items-center justify-between px-2 border-t border-neutral-700 bg-[#151515]">
            <X size={10} className="text-neutral-500" />
            <div className="flex gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold font-orbitron">
              <span>Data Link Secured</span>
            </div>
            <X size={10} className="text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
