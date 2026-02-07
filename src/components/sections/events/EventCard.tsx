'use client';

import { memo } from 'react';
import SciFiCard from '@/components/ui/SciFiCard';

interface EventCardProps {
  name: string;
  description: string;
  image: string;
  id: string;
}

const REGISTER_URL = '/register';

function EventCard({ name, description, image, id }: EventCardProps) {
  return (
    <article className="event-card h-full">
      <SciFiCard
        name={name}
        description={description}
        image={image}
        registerHref={REGISTER_URL}
        className="h-full"
      />
    </article>
  );
}

export default memo(EventCard);
