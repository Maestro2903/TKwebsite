'use client';

import { memo } from 'react';
import Image from 'next/image';
import type { ShowItem } from '@/lib/showsData';

interface ShowCardProps {
  show: ShowItem;
  day: number;
  alternate?: boolean; // true = image right, false = image left
  imageUrl?: string;
}

const REGISTER_URL = '/register';

function ShowCard({ show, day, alternate = false, imageUrl }: ShowCardProps) {
  // Derive display fields from existing data
  const category = show.subtitle || 'Proshow';
  const title = show.title;
  const description = show.isReveal 
    ? 'Details coming soon. Stay tuned for an amazing experience!'
    : `Experience ${title} on Day ${day} of Takshashila 26.`;

  return (
    <article 
      className={`show-card-proshows ${alternate ? 'show-card-proshows--alternate' : ''}`}
      aria-labelledby={`show-${show.id}-title`}
    >
      <div className="show-card-proshows__image">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt="" 
            fill
            loading="lazy"
            className="show-card-proshows__image-img"
            aria-hidden="true"
            sizes="(max-width: 991px) 100vw, 50vw"
          />
        ) : (
          <div className="show-card-proshows__image-placeholder" aria-hidden="true" />
        )}
      </div>
      
      <div className="show-card-proshows__info">
        <div className="show-card-proshows__category">
          {category.toUpperCase()}
        </div>
        
        <h3 id={`show-${show.id}-title`} className="show-card-proshows__title">
          {title}
        </h3>
        
        <p className="show-card-proshows__description">
          {description}
        </p>
        
        <div className="show-card-proshows__meta">
          <span className="show-card-proshows__date">Day {day}</span>
        </div>
        
        <div className="show-card-proshows__cta">
          <a
            href={REGISTER_URL}
            className="button_main_wrap show-card-proshows__btn"
          >
            <div className="clickable_wrap u-cover-absolute">
              <span className="clickable_text u-sr-only">[ Register ]</span>
            </div>
            <span aria-hidden className="button_main_text u-text-style-main">
              REGISTER
            </span>
            <span className="button_bg" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

export default memo(ShowCard);
