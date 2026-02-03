'use client';

import { AwardBadge } from './AwardBadge';

interface EventCardProps {
  name: string;
  description: string;
  image: string;
  id: string;
}

const REGISTER_URL = '/register';

export default function EventCard({ name, description, image, id }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__image">
        <img
          loading="lazy"
          src={image}
          alt={name}
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
          className="u-cover-absolute"
        />
      </div>
      <div className="event-content">
        <h3 className="event-content__title">{name}</h3>
        <p className="event-content__description">{description}</p>
        <div className="event-cta">
          <a href={REGISTER_URL} className="block w-full max-w-[260px]">
            <span className="u-sr-only">[ Register for {name} ]</span>
            <AwardBadge>REGISTER</AwardBadge>
          </a>
        </div>
      </div>
    </article>
  );
}
