'use client';

import { useState, useEffect } from 'react';
import { COUNTDOWN_TARGET } from '@/data/config';

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isOver: false };
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function RegistrationUrgency() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(COUNTDOWN_TARGET));

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(getTimeLeft(COUNTDOWN_TARGET));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="registration-urgency">
      <p className="registration-urgency__slots">Limited Slots Available</p>
      {!timeLeft.isOver && (
        <p className="registration-urgency__countdown" aria-live="polite">
          {pad(timeLeft.days)} : {pad(timeLeft.hours)} : {pad(timeLeft.minutes)} : {pad(timeLeft.seconds)}
        </p>
      )}
    </div>
  );
}
