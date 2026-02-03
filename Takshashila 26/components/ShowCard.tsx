'use client';

import type { ShowItem } from '@/lib/showsData';

interface ShowCardProps {
  show: ShowItem;
}

export default function ShowCard({ show }: ShowCardProps) {
  return (
    <article className="show-card" aria-labelledby={`show-${show.id}-title`}>
      <div className="show-card__visual" aria-hidden>
        <div className="show-card__visual-inner" />
      </div>
      <div className="show-card__content">
        <h3 id={`show-${show.id}-title`} className="show-card__title">
          {show.title}
        </h3>
        {show.subtitle && (
          <p className={`show-card__subtitle ${show.isReveal ? 'show-card__subtitle--reveal' : ''}`}>
            {show.subtitle}
          </p>
        )}
      </div>
    </article>
  );
}
