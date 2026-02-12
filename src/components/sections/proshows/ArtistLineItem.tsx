'use client';

import { cn } from '@/lib/utils';
import type { ProshowArtist } from '@/data/proshows';
import { EditorialDivider } from '@/components/decorative/EditorialMotifs';

interface ArtistLineItemProps {
  artist: ProshowArtist;
  showDividerAbove?: boolean;
  onHover?: () => void;
  onBlur?: () => void;
  isHeadliner?: boolean;
}

/**
 * Single-row editorial lineup line: artist name on the left,
 * compact meta (genre / time / stage) on the right.
 */
export function ArtistLineItem({
  artist,
  showDividerAbove,
  onHover,
  onBlur,
  isHeadliner,
}: ArtistLineItemProps) {
  const metaParts = [artist.genre, artist.time, artist.stage].filter(Boolean);

  return (
    <div
      className="flex flex-col"
      onMouseEnter={onHover}
      onMouseLeave={onBlur}
      onFocus={onHover}
      onBlur={onBlur}
    >
      {showDividerAbove && <EditorialDivider className="mb-0" />}

      <div
        className={cn(
          'flex items-baseline justify-between gap-3 py-3',
          'text-[var(--editorial-white,#FFF)]',
          'border-l border-transparent pl-3',
          'hover:border-l-[var(--editorial-blue,#0047FF)]'
        )}
      >
        <span
          className={cn(
            'font-editorial uppercase tracking-[0.18em]',
            isHeadliner
              ? 'text-[15px] sm:text-[16px] font-semibold'
              : 'text-[13px] sm:text-[14px] font-medium'
          )}
        >
          {artist.name}
        </span>
        {metaParts.length > 0 && (
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[var(--editorial-gray,#AAA)] text-right">
            {metaParts.join(' / ')}
          </span>
        )}
      </div>
    </div>
  );
}

