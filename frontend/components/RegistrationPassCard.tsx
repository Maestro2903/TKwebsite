'use client';

import { memo } from 'react';
import { AwardBadge } from './AwardBadge';

interface RegistrationPassCardProps {
  id: string;
  name: string;
  description: string;
  price: number | string;
  priceLabel?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick?: () => void;
  /** When true, render as radio option: no button CTA, show radio indicator. Use inside label with hidden input. */
  variant?: 'card' | 'radio';
  /** Show "Most Popular" badge */
  isMostPopular?: boolean;
}

function RegistrationPassCard({
  id,
  name,
  description,
  price,
  priceLabel,
  icon,
  isSelected,
  onClick,
  variant = 'card',
  isMostPopular = false,
}: RegistrationPassCardProps) {
  const isRadio = variant === 'radio';
  const className = `registration-pass-card ${isSelected ? 'registration-pass-card--selected' : ''} ${isRadio ? 'registration-pass-card--radio' : ''} ${isMostPopular ? 'registration-pass-card--popular' : ''}`;

  const content = (
    <>
      {!isRadio && (
        <div className="registration-pass-card__icon">
          {icon}
        </div>
      )}
      <div className="registration-pass-content">
        <div className="registration-pass-content__header">
          <h3 className="registration-pass-content__title">{name}</h3>
          {isMostPopular && (
            <span className="registration-pass-badge">Most Popular</span>
          )}
        </div>
        <p className="registration-pass-content__description">{description}</p>
        <div className="registration-pass-content__price">
          <span className="registration-pass-content__price-amount">₹{price}</span>
          {priceLabel && (
            <span className="registration-pass-content__price-label">{priceLabel}</span>
          )}
        </div>
        {isRadio ? (
          <div className="registration-pass-radio-indicator" aria-hidden>
            <span className="registration-pass-radio-indicator__dot" />
          </div>
        ) : (
          <div className="registration-pass-cta">
            <div className="block w-full max-w-[260px]" onClick={(e) => e.stopPropagation()}>
              <span className="u-sr-only">[ Select {name} ]</span>
              <AwardBadge onClick={onClick}>{isSelected ? 'SELECTED' : 'SELECT'}</AwardBadge>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isRadio) {
    return <span className={className}>{content}</span>;
  }

  return (
    <article
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-pressed={isSelected}
    >
      {content}
    </article>
  );
}

export default memo(RegistrationPassCard);
