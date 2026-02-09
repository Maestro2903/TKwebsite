'use client';

import { memo, useState } from 'react';
import SciFiCard from '@/components/ui/SciFiCard';
import EventDetailsModal from './EventDetailsModal';
import type { EventItem } from '@/data/events';

interface EventCardProps {
  event: EventItem;
}

const REGISTER_URL = '/register';

function EventCard({ event }: EventCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { name, description, fullDescription, image } = event;

  return (
    <article className="event-card h-full">
      <SciFiCard
        name={name}
        description={description}
        fullDescription={fullDescription}
        image={image}
        registerHref={REGISTER_URL}
        onSecondaryAction={() => setShowModal(true)}
        secondaryActionLabel="Know More"
        className="h-full"
      />
      <EventDetailsModal
        event={event}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </article>
  );
}

export default memo(EventCard);
