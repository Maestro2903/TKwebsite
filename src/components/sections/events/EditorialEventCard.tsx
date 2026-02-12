'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BarcodeStripe, SectionLabel } from '@/components/decorative/EditorialMotifs';
import EventDetailsModal from './EventDetailsModal';
import type { EventItem } from '@/data/events';
import { cn } from '@/lib/utils';

interface EditorialEventCardProps {
  event: EventItem;
  index?: number;
}

const REGISTER_URL = '/register';

const buttonBaseStyles = cn(
  // Layout
  'flex-1 py-3 px-4',
  'flex items-center justify-center text-center',
  // Typography - explicit values
  'font-editorial text-[13px] font-semibold leading-[1.2] uppercase tracking-wider',
  // Reset browser defaults
  'no-underline appearance-none',
  // Focus states
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black'
);

function EditorialEventCard({ event, index = 0 }: EditorialEventCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { name, image, description } = event;
  const indexStr = String(index + 1).padStart(3, '0');

  return (
    <article
      className={cn(
        'editorial-event-card event-card',
        'group relative flex flex-col h-full',
        'bg-[var(--editorial-black,#000)]',
        'border border-[var(--editorial-gray,#333)]',
        'transition-colors duration-200',
        'hover:border-[var(--editorial-blue,#0047FF)]',
        'focus-within:border-[var(--editorial-blue,#0047FF)]'
      )}
    >
      {/* Blue header - matching modal style */}
      <div className="flex-shrink-0 bg-[var(--editorial-blue,#0047FF)] px-4 py-3">
        <SectionLabel className="text-white/70 mb-1 block text-[10px]">
          EVENT /// {indexStr}
        </SectionLabel>
        <h2 className="font-editorial font-bold text-base sm:text-lg text-white uppercase tracking-tight leading-tight line-clamp-2">
          {name}
        </h2>
        <BarcodeStripe variant="horizontal" color="white" className="mt-2 opacity-60 max-w-[80px]" />
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden flex-shrink-0 border-b border-[var(--editorial-gray,#333)]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 p-4">
        <SectionLabel className="text-[var(--editorial-gray-muted,#999)] mb-2 block">
          ABOUT
        </SectionLabel>

        {description && (
          <p
            className={cn(
              'text-[13px] leading-relaxed line-clamp-3',
              'text-[var(--editorial-gray,#E5E5E5)]',
              'mb-4 flex-1 min-h-0'
            )}
          >
            {description}
          </p>
        )}

        {/* CTA buttons - equal size, spacing, and font */}
        <div
          className="flex gap-3 mt-auto pt-3 border-t border-[var(--editorial-gray,#333)]"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={REGISTER_URL}
            className={cn(
              buttonBaseStyles,
              '!bg-[var(--editorial-blue,#0047FF)] text-white opacity-50',
              'transition-opacity duration-200 hover:opacity-100'
            )}
            style={{ backgroundColor: 'var(--editorial-blue, #0047FF)' }}
          >
            REGISTER
          </Link>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={cn(
              buttonBaseStyles,
              '!border !border-solid !border-white text-[var(--editorial-white,#FFF)]',
              'bg-[var(--editorial-black,#000)] opacity-50',
              'transition-all duration-200 hover:opacity-100',
              'hover:!border-[var(--editorial-white,#FFF)] hover:text-[var(--editorial-blue,#0047FF)]'
            )}
          >
            INFO
          </button>
        </div>
      </div>

      <EventDetailsModal
        event={event}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </article>
  );
}

export default memo(EditorialEventCard);
